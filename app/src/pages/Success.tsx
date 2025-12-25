import { Link } from 'react-router-dom'
import './landing.css'

export default function Success() {
  return (
    <main className="bw landing-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="bw-container" style={{ maxWidth: '600px', textAlign: 'center', padding: 'clamp(32px, 5vw, 48px)' }}>
        <div style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
          <div style={{
            width: 'clamp(80px, 10vw, 120px)',
            height: 'clamp(80px, 10vw, 120px)',
            margin: '0 auto clamp(24px, 3vw, 32px)',
            borderRadius: '50%',
            backgroundColor: 'var(--bw-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 200,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(16px, 2.5vw, 24px)'
          }}>Payment Successful!</h1>
          <p style={{ 
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--bw-muted)',
            lineHeight: 1.6,
            marginBottom: 'clamp(24px, 4vw, 32px)'
          }}>
            Thank you for subscribing! Your account has been activated and you're all set to start using Maison.
          </p>
        </div>
        <Link 
          to="/tenant/overview" 
          className="bw-btn"
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)',
            display: 'inline-block'
          }}
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}

