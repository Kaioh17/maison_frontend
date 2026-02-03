import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useFavicon } from '@hooks/useFavicon'
import { CheckCircle, House } from '@phosphor-icons/react'

export default function BookingComplete() {
  useFavicon()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  // Get session_id from URL params (Stripe redirects with this)
  // Can be used to verify payment with backend if needed
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Simulate loading while verifying payment
    // In a real implementation, you might want to verify the session with your backend
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bw-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Work Sans, sans-serif'
      }}>
        <div style={{ color: 'var(--bw-text)', fontSize: '16px' }}>Verifying payment...</div>
      </div>
    )
  }

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
        {/* Success Icon */}
        <div style={{
          width: 'clamp(80px, 10vw, 120px)',
          height: 'clamp(80px, 10vw, 120px)',
          margin: '0 auto clamp(24px, 3vw, 32px)',
          borderRadius: '50%',
          backgroundColor: 'var(--bw-success, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle size={60} style={{ color: '#ffffff', strokeWidth: 2.5 }} />
        </div>

        {/* Success Message */}
        <h1 style={{
          margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 200,
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--bw-text)'
        }}>
          Payment Successful!
        </h1>
        <p style={{
          margin: '0 0 clamp(32px, 5vw, 48px) 0',
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--bw-muted)',
          lineHeight: 1.6,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Your payment has been processed successfully. Your ride has been confirmed and we'll see you soon!
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
            You will receive a confirmation email with all the details of your booking. If you have any questions, please don't hesitate to contact us.
          </p>
        </div>

        {/* Back to Dashboard Button */}
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
            transition: 'all 0.2s ease'
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
          <House size={18} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  )
}

