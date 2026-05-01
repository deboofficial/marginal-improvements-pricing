import { supabase } from '../../../lib/supabase'
import { resend } from '../../../lib/resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { intake_token, content_url } = req.body

  if (!intake_token || !content_url) {
    return res.status(400).json({ error: 'intake_token and content_url required' })
  }

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, plan_type, status')
    .eq('intake_token', intake_token)
    .single()

  if (orderError || !order) return res.status(404).json({ error: 'Order not found' })
  if (!['intake_completed', 'in_progress'].includes(order.status)) {
    return res.status(400).json({ error: `Order status is '${order.status}' — intake must be completed first` })
  }

  // Upsert plan record (idempotent)
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .upsert(
      { order_id: order.id, content_url, status: 'ready' },
      { onConflict: 'order_id' }
    )
    .select('access_token')
    .single()

  if (planError) {
    console.error('Plan upsert error:', planError)
    return res.status(500).json({ error: planError.message })
  }

  // Mark order as ready
  await supabase
    .from('orders')
    .update({ status: 'ready' })
    .eq('id', order.id)

  // Get user email
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', order.user_id)
    .single()

  if (!user) return res.status(500).json({ error: 'User not found' })

  // Send plan-ready email
  const planUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/plan?token=${plan.access_token}`
  const planLabel = order.plan_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  await resend.emails.send({
    from: 'Marginal Improvements <plans@marginalimprovements.co.uk>',
    to: user.email,
    subject: 'Your plan is ready',
    html: `
      <div style="font-family:ui-rounded,'SF Pro Rounded',-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#1a1a1a;background:#fff">
        <p style="font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#A2FF01;margin-bottom:16px">Marginal Improvements</p>
        <h1 style="font-size:28px;font-weight:900;letter-spacing:-0.03em;margin:0 0 8px">Your plan is ready 🎉</h1>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 32px">
          Your personalised <strong>${planLabel}</strong> has been created. Click below to access it.
        </p>
        <a href="${planUrl}"
           style="display:inline-block;padding:16px 32px;background:#A2FF01;color:#000;font-weight:700;font-size:16px;text-decoration:none;border-radius:100px">
          View your plan →
        </a>
        <p style="margin-top:40px;color:#999;font-size:12px;line-height:1.6">
          Save this link — it's your permanent access link:<br/>
          <a href="${planUrl}" style="color:#999;word-break:break-all">${planUrl}</a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="color:#bbb;font-size:12px">Marginal Improvements · London, UK</p>
      </div>
    `
  })

  return res.json({ success: true, plan_url: planUrl })
}
