export default function FeedbackTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--bw-muted)' }}>
        Help us improve Maison. Report issues, suggest features, or ask a question.
      </p>
      {/* The Google Form is transparent and styled for a light page, so it sits on Google's own light surface. */}
      <div style={{ borderRadius: 10, overflow: 'hidden', background: '#f0ebf8' }}>
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
    </div>
  )
}
