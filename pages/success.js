import Head from 'next/head'

export default function Success() {
  return (
    <>
      <Head><title>Payment Confirmed — Marginal Improvements</title></Head>
      <main style={s.main}>
        <div style={s.wrap}>
          <div style={s.iconWrap}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#A2FF01" strokeWidth="2"/>
              <path d="M10 16l4 4 8-8" stroke="#A2FF01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={s.h1}>Payment confirmed</h1>
          <p style={s.p}>
            Check your inbox — we&apos;ve sent you a link to your intake form.
            It takes about 3 minutes to complete and is how we personalise your plan.
          </p>
          <p style={s.muted}>
            Can&apos;t find the email? Check your spam folder, or contact us at
            {' '}<a href="mailto:plans@marginalimprovements.co.uk" style={s.link}>plans@marginalimprovements.co.uk</a>
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
  iconWrap: { marginBottom: 24, display: 'flex', justifyContent: 'center' },
  h1: { fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 },
  p: { fontSize: '1rem', color: '#888', lineHeight: 1.7, marginBottom: 20 },
  muted: { fontSize: '0.82rem', color: '#444', lineHeight: 1.6 },
  link: { color: '#666', textDecoration: 'underline' },
}
