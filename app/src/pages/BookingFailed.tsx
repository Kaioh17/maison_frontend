import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFavicon } from '@hooks/useFavicon'
import { XCircle, Home, ArrowLeft } from 'lucide-react'

export default function BookingFailed() {
  useFavicon()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get session_id from URL params (Stripe redirects with this)
  // Can be used to verify cancellation with backend if needed
  const sessionId = searchParams.get('session_id')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bw-bg)',
      fontFamily: 'Work Sans, sans-serif',
      padding: 'clamp(16px, 3vw, 24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Error Icon */}
        <div style={{
          width: 'clamp(80px, 10vw, 120px)',
          height: 'clamp(80px, 10vw, 120px)',
          margin: '0 auto clamp(24px, 3vw, 32px)',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #ef4444'
        }}>
          <XCircle size={60} style={{ color: '#ef4444', strokeWidth: 2.5 }} />
        </div>

        {/* Error Message */}
        <h1 style={{
          margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 200,
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--bw-text)'
        }}>
          Payment Cancelled
        </h1>
        <p style={{
          margin: '0 0 clamp(32px, 5vw, 48px) 0',
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--bw-muted)',
          lineHeight: 1.6,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Your payment was cancelled. Your ride has not been confirmed. You can try again or select a different payment method.
        </p>

        {/* Info Card */}
        <div style={{
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          border: '1px solid var(--bw-border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 24px)',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          textAlign: 'left'
        }}>
          <p style={{
            fontSize: 'clamp(13px, 2vw, 14px)',
            color: 'var(--bw-text)',
            opacity: 0.8,
            margin: 0,
            lineHeight: 1.6,
            fontFamily: 'Work Sans, sans-serif'
          }}>
            If you encountered any issues during payment, please try again or contact support for assistance.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 2.5vw, 16px)',
          alignItems: 'center'
        }}>
          <button
            onClick={() => navigate('/rider/dashboard', { replace: true })}
            style={{
              padding: 'clamp(14px, 2.5vw, 16px) clamp(28px, 4vw, 36px)',
              borderRadius: 7,
              backgroundColor: 'var(--bw-fg)',
              color: 'var(--bw-bg)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'clamp(8px, 1.5vw, 10px)',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: '300px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Home size={18} />
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/rider/book', { replace: true })}
            style={{
              padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)',
              borderRadius: 7,
              backgroundColor: 'transparent',
              color: 'var(--bw-text)',
              border: '1px solid var(--bw-border)',
              cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 500,
              fontSize: 'clamp(13px, 2vw, 14px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'clamp(8px, 1.5vw, 10px)',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: '300px',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <ArrowLeft size={18} />
            <span>Book Another Ride</span>
          </button>
        </div>
      </div>
    </div>
  )
}

