import Head from 'next/head'

export default function Processing() {
  return (
    <>
      <Head><title>Building Your Plan — Marginal Improvements</title></Head>
      <main style={s.main}>
        <div style={s.wrap}>
          <div style={s.spinner}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#222" strokeWidth="3"/>
              <path d="M20 2a18 18 0 0 1 18 18" stroke="#A2FF01" strokeWidth="3" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>
          <h1 style={s.h1}>Your plan is being created</h1>
          <p style={s.p}>
            Intake received. We&apos;re putting your plan together now.
          </p>
          <div style={s.timeBox}>
            <span style={s.timeLabel}>Expected turnaround</span>
            <span style={s.time}>24 – 72 hours</span>
          </div>
          <p style={s.muted}>
            You&apos;ll get an email the moment your plan is ready — no need to check back.
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
  wrap: { maxWidth: 420, width: '100%', textAlign: 'center' },
  spinner: { marginBottom: 32, display: 'flex', justifyContent: 'center' },
  h1: { fontSize: '1.9rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 },
  p: { fontSize: '1rem', color: '#666', lineHeight: 1.7, marginBottom: 28 },
  timeBox: {
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
    padding: '16px 32px', borderRadius: 16,
    background: '#111', border: '1px solid #1e1e1e', marginBottom: 28,
  },
  timeLabel: { fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#444', marginBottom: 6 },
  time: { fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
  muted: { fontSize: '0.82rem', color: '#3a3a3a', lineHeight: 1.6 },
}
