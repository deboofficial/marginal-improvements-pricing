import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token, age, weight, height, goal, activity_level, training_days, notes } = req.body

  if (!token) return res.status(400).json({ error: 'Token required' })

  // Validate order exists and is in 'paid' state
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('intake_token', token)
    .single()

  if (orderError || !order) return res.status(404).json({ error: 'Invalid or expired token' })
  if (order.status !== 'paid') return res.status(400).json({ error: 'Intake already submitted or not available' })

  // Save intake form
  const { error: intakeError } = await supabase
    .from('intake_forms')
    .insert({
      order_id: order.id,
      age: age ? Number(age) : null,
      weight: weight || null,
      height: height || null,
      goal: goal || null,
      activity_level: activity_level || null,
      training_days: training_days ? Number(training_days) : null,
      notes: notes || null,
    })

  if (intakeError) {
    console.error('Intake insert error:', intakeError)
    return res.status(500).json({ error: 'Failed to save intake form' })
  }

  // Advance order status
  await supabase
    .from('orders')
    .update({ status: 'intake_completed' })
    .eq('id', order.id)

  return res.json({ success: true })
}
