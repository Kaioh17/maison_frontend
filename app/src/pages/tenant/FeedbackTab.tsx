export default function FeedbackTab() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bw-bg)',
      padding: '24px 8px 0',
      boxSizing: 'border-box',
    }}>
      <h1 style={{
        margin: '0 0 4px',
        padding: '0 4px',
        fontSize: 'clamp(18px, 2.5vw, 24px)',
        fontWeight: 600,
        fontFamily: '"Work Sans", sans-serif',
        color: 'var(--bw-text)',
        letterSpacing: '-0.01em',
      }}>
        Share feedback
      </h1>
      <p style={{
        margin: '0 0 16px',
        padding: '0 4px',
        fontSize: 'clamp(13px, 1.5vw, 14px)',
        fontFamily: '"Work Sans", sans-serif',
        fontWeight: 300,
        color: 'var(--bw-text)',
        opacity: 0.7,
      }}>
        Help us improve Maison — report issues, suggest features, or ask a question.
      </p>
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSdR-lcwlFREPUT0Mw0bRlHLwYt4GLJ1W4aw2tdzIjiRsx_h7A/viewform?embedded=true"
        width="100%"
        height="1360"
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
        title="Maison feedback form"
        style={{ display: 'block', border: 'none' }}
      >
        Loading…
      </iframe>
    </div>
  )
}
