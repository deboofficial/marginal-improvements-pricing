import { stripe } from '../../../lib/stripe'
import { supabase } from '../../../lib/supabase'
import { resend } from '../../../lib/resend'

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true })
  }

  const session = event.data.object
  const email = session.customer_details?.email
  // plan_type must be set as metadata on each Stripe Payment Link in the dashboard
  const plan_type = session.metadata?.plan_type || 'unknown'
  const stripe_session_id = session.id
  const stripe_customer_id = session.customer || null

  if (!email) {
    console.error('No email in session:', stripe_session_id)
    return res.status(400).json({ error: 'No customer email in session' })
  }

  // --- Upsert user ---
  let userId
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    userId = existingUser.id
    // Update stripe_customer_id if we now have it
    if (stripe_customer_id) {
      await supabase.from('users').update({ stripe_customer_id }).eq('id', userId)
    }
  } else {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ email, stripe_customer_id })
      .select('id')
      .single()
    if (error) {
      console.error('User insert error:', error)
      return res.status(500).json({ error: error.message })
    }
    userId = newUser.id
  }

  // --- Create order (idempotent — ignore duplicate stripe_session_id) ---
  const { error: insertError } = await supabase
    .from('orders')
    .insert({ user_id: userId, stripe_session_id, plan_type, status: 'paid' })

  const isDuplicate = insertError?.code === '23505'
  if (insertError && !isDuplicate) {
    console.error('Order insert error:', insertError)
    return res.status(500).json({ error: insertError.message })
  }

  // Already processed — do not re-send email
  if (isDuplicate) {
    return res.json({ received: true, note: 'duplicate' })
  }

  // Fetch the newly created order to get its intake_token
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('intake_token')
    .eq('stripe_session_id', stripe_session_id)
    .single()

  if (fetchError || !order) {
    console.error('Order fetch error:', fetchError)
    return res.status(500).json({ error: 'Could not fetch order' })
  }

  // --- Send intake email ---
  const intakeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/intake?token=${order.intake_token}`

  const planLabel = plan_type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  await resend.emails.send({
    from: 'Marginal Improvements <plans@marginalimprovements.co.uk>',
    to: email,
    subject: `Payment confirmed — complete your intake form`,
    html: `
      <div style="font-family:ui-rounded,'SF Pro Rounded',-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1a1a1a;background:#fff">
        <p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A2FF01;margin-bottom:16px">Marginal Improvements</p>
        <h1 style="font-size:28px;font-weight:900;letter-spacing:-0.03em;margin:0 0 8px">Payment confirmed ✓</h1>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 32px">
          Your <strong>${planLabel}</strong> is reserved. To get started, complete your intake form — it takes about 3 minutes and tells us everything we need to build your plan.
        </p>
        <a href="${intakeUrl}"
           style="display:inline-block;padding:16px 32px;background:#A2FF01;color:#000;font-weight:700;font-size:16px;text-decoration:none;border-radius:100px">
          Complete intake form →
        </a>
        <p style="margin-top:40px;color:#999;font-size:12px;line-height:1.6">
          If the button doesn't work, copy this link into your browser:<br/>
          <a href="${intakeUrl}" style="color:#999;word-break:break-all">${intakeUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="color:#bbb;font-size:12px">Marginal Improvements · London, UK</p>
      </div>
    `
  })

  return res.json({ received: true })
}
