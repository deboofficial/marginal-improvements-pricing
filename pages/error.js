import Head from 'next/head'

export default function Error() {
  return (
    <>
      <Head><title>Access Error — Marginal Improvements</title></Head>
      <main style={s.main}>
        <div style={s.wrap}>
          <h1 style={s.h1}>This link isn&apos;t valid</h1>
          <p style={s.p}>
            This could be because the link has expired, already been used, or the URL is incorrect.
          </p>
          <p style={s.muted}>
            Need help?{' '}
            <a href="mailto:plans@marginalimprovements.co.uk" style={s.link}>
              plans@marginalimprovements.co.uk
            </a>
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
  wrap: { maxWidth: 400, width: '100%', textAlign: 'center' },
  h1: { fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 },
  p: { fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: 20 },
  muted: { fontSize: '0.85rem', color: '#333' },
  link: { color: '#555', textDecoration: 'underline' },
}
