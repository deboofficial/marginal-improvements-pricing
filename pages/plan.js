import Head from 'next/head'
import { supabase } from '../lib/supabase'

export async function getServerSideProps({ query }) {
  const { token } = query

  if (!token) return { redirect: { destination: '/error', permanent: false } }

  const { data: plan } = await supabase
    .from('plans')
    .select('content_url, status, order_id')
    .eq('access_token', token)
    .single()

  if (!plan || plan.status !== 'ready') {
    return { redirect: { destination: '/error', permanent: false } }
  }

  // Get order for plan_type label
  const { data: order } = await supabase
    .from('orders')
    .select('plan_type')
    .eq('id', plan.order_id)
    .single()

  // Mark order as delivered
  await supabase
    .from('orders')
    .update({ status: 'delivered' })
    .eq('id', plan.order_id)

  return {
    props: {
      contentUrl: plan.content_url,
      planType: order?.plan_type || 'Your Plan',
    }
  }
}

export default function Plan({ contentUrl, planType }) {
  const planLabel = planType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <>
      <Head><title>Your Plan — Marginal Improvements</title></Head>
      <main style={s.main}>
        <div style={s.wrap}>
          <div style={s.badge}>Ready</div>
          <h1 style={s.h1}>Your {planLabel}</h1>
          <p style={s.p}>Your personalised plan is ready. Access it using the link below.</p>
          <a href={contentUrl} target="_blank" rel="noopener noreferrer" style={s.btn}>
            Open your plan →
          </a>
          <p style={s.muted}>
            Bookmark this page or save the link — it&apos;s your permanent access link.
          </p>
        </div>
      </main>
    </>
  )
}

const s = {
  main: {
    background: '#0a0a0a', minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
    fontFamily: 'ui-rounded,"SF Pro Rounded",-apple-system,sans-serif',
    WebkitFontSmoothing: 'antialiased',
  },
  wrap: { maxWidth: 440, width: '100%', textAlign: 'center' },
  badge: {
    display: 'inline-block', padding: '4px 14px', borderRadius: 100,
    background: 'rgba(162,255,1,0.08)', border: '1px solid rgba(162,255,1,0.2)',
    color: '#A2FF01', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: 20,
  },
  h1: { fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 },
  p: { fontSize: '1rem', color: '#888', lineHeight: 1.7, marginBottom: 32 },
  btn: {
    display: 'inline-block', padding: '16px 36px', borderRadius: 100,
    background: '#A2FF01', color: '#000',
    fontSize: 16, fontWeight: 700, textDecoration: 'none',
    marginBottom: 28,
  },
  muted: { fontSize: '0.82rem', color: '#333', lineHeight: 1.6 },
}
