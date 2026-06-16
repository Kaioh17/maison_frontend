import { Link } from 'react-router-dom'
import MaisonDarkModeLogo from '@components/MaisonDarkModeLogo'
import MaisonWordmark from '@components/MaisonWordmark'

export default function Privacy() {
  return (
    <main className="bw" style={{ minHeight: '100vh', backgroundColor: 'var(--bw-bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: 48 }}>
          <MaisonDarkModeLogo height={44} />
          <MaisonWordmark color={null} style={{ fontSize: '1.3rem', display: 'inline-block', verticalAlign: 'middle' }} />
        </div>

        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 200, fontSize: 40, margin: '0 0 8px 0' }}>Privacy Policy</h1>
        <p className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 14, marginBottom: 40 }}>
          This page is a placeholder. Full privacy policy will be published before general availability.
        </p>

        <div style={{ borderTop: '1px solid var(--bw-border)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-text)' }}>
          {['Information We Collect', 'How We Use Your Information', 'Data Sharing', 'Data Retention', 'Your Rights', 'Cookies', 'Security', 'Changes to This Policy', 'Contact Us'].map((section) => (
            <div key={section}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 20, margin: '0 0 8px 0' }}>{section}</h2>
              <p className="small-muted" style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                This section will describe our practices regarding {section.toLowerCase()}. Content coming soon.
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--bw-border)' }}>
          <Link to="/tenant/login" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', textDecoration: 'underline' }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
