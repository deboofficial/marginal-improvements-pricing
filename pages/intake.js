import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export async function getServerSideProps({ query }) {
  const { token } = query

  if (!token) return { redirect: { destination: '/error', permanent: false } }

  const { data: order } = await supabase
    .from('orders')
    .select('status, plan_type')
    .eq('intake_token', token)
    .single()

  if (!order || order.status !== 'paid') {
    return { redirect: { destination: '/error', permanent: false } }
  }

  return { props: { token, planType: order.plan_type } }
}

export default function Intake({ token, planType }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const planLabel = planType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const data = Object.fromEntries(new FormData(e.target))
    const res = await fetch('/api/intake/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...data }),
    })
    if (!res.ok) {
      const json = await res.json()
      setError(json.error || 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }
    router.push('/processing')
  }

  return (
    <>
      <Head><title>Intake Form — Marginal Improvements</title></Head>
      <main style={s.main}>
        <div style={s.wrap}>
          <div style={s.badge}>{planLabel}</div>
          <h1 style={s.h1}>Let&apos;s build your plan</h1>
          <p style={s.sub}>3 minutes. This is how we make it personal.</p>

          <form onSubmit={handleSubmit}>
            <Field label="Age">
              <input name="age" type="number" min="16" max="99" required style={s.input} placeholder="e.g. 28" />
            </Field>
            <Field label="Weight">
              <input name="weight" type="text" required style={s.input} placeholder="e.g. 80kg or 176lbs" />
            </Field>
            <Field label="Height">
              <input name="height" type="text" required style={s.input} placeholder="e.g. 178cm or 5'10" />
            </Field>
            <Field label="Primary goal">
              <select name="goal" required style={s.select}>
                <option value="">Select your goal...</option>
                <option value="lose_fat">Lose fat</option>
                <option value="build_muscle">Build muscle</option>
                <option value="recomposition">Body recomposition (lose fat + build muscle)</option>
                <option value="improve_fitness">Improve general fitness</option>
                <option value="maintain">Maintain current shape</option>
              </select>
            </Field>
            <Field label="Activity level (outside of planned training)">
              <select name="activity_level" required style={s.select}>
                <option value="">Select activity level...</option>
                <option value="sedentary">Sedentary — mostly sitting, desk job</option>
                <option value="lightly_active">Lightly active — walk daily, light movement</option>
                <option value="moderately_active">Moderately active — on feet a lot, manual work</option>
                <option value="very_active">Very active — physically demanding job or lifestyle</option>
              </select>
            </Field>
            <Field label="Training days per week">
              <input name="training_days" type="number" min="1" max="7" required style={s.input} placeholder="e.g. 4" />
            </Field>
            <Field label="Anything else we should know? (optional)">
              <textarea
                name="notes"
                rows={5}
                style={s.textarea}
                placeholder="Injuries, food allergies or dislikes, equipment available, experience level, schedule constraints..."
              />
            </Field>

            {error && <p style={s.error}>{error}</p>}

            <button type="submit" disabled={submitting} style={{ ...s.btn, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Submitting...' : 'Submit →'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

const s = {
  main: {
    background: '#0a0a0a', minHeight: '100vh',
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
    padding: '60px 20px 100px',
    fontFamily: 'ui-rounded,"SF Pro Rounded",-apple-system,sans-serif',
    WebkitFontSmoothing: 'antialiased',
  },
  wrap: { width: '100%', maxWidth: 480 },
  badge: {
    display: 'inline-block', padding: '4px 14px', borderRadius: 100,
    background: 'rgba(162,255,1,0.08)', border: '1px solid rgba(162,255,1,0.2)',
    color: '#A2FF01', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: 20,
  },
  h1: { fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 },
  sub: { fontSize: '0.95rem', color: '#555', marginBottom: 40 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 },
  input: {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    background: '#111', border: '1px solid #222', color: '#fff',
    fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    background: '#111', border: '1px solid #222', color: '#fff',
    fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    appearance: 'none',
  },
  textarea: {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    background: '#111', border: '1px solid #222', color: '#fff',
    fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    resize: 'vertical',
  },
  btn: {
    width: '100%', height: 56, borderRadius: 100,
    background: '#A2FF01', color: '#000', border: 'none',
    fontSize: 17, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', marginTop: 8,
    transition: 'opacity 0.2s ease',
  },
  error: { color: '#ff5555', fontSize: 14, marginBottom: 12 },
}
