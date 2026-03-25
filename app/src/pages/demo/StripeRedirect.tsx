import { Link } from 'react-router-dom'

/**
 * Stand-in when a demo control would open Stripe / billing in the real app.
 */
export default function StripeRedirect() {
  return (
    <div
      className="bw"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f0d1a',
        color: '#E0E0E0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '"Work Sans", sans-serif',
        fontWeight: 300,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <p style={{ margin: '0 0 24px 0', fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.5, color: '#E0E0E0' }}>
          This would take you to Stripe. Sign up for a real account to manage billing.
        </p>
        <Link
          to="/demo"
          style={{
            color: '#6c63e8',
            fontWeight: 500,
            textDecoration: 'none',
            fontSize: 'clamp(14px, 1.8vw, 16px)',
          }}
        >
          Back to demo
        </Link>
      </div>
    </div>
  )
}
