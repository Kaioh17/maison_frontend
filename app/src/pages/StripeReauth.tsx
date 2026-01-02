import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight } from 'lucide-react'

export default function StripeReauth() {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/tenant/settings/account', { replace: true })
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <main className="bw" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bw-bg)',
      padding: 'clamp(16px, 3vw, 24px)'
    }}>
      <div className="bw-container" style={{ 
        maxWidth: '600px', 
        textAlign: 'center', 
        padding: 'clamp(32px, 5vw, 48px)' 
      }}>
        {/* Alert Icon */}
        <div style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
          <div style={{
            width: 'clamp(100px, 12vw, 140px)',
            height: 'clamp(100px, 12vw, 140px)',
            margin: '0 auto clamp(24px, 3vw, 32px)',
            borderRadius: '50%',
            backgroundColor: 'var(--bw-warning, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
          }}>
            <AlertCircle 
              size={70} 
              style={{ 
                color: '#ffffff',
                strokeWidth: 2.5
              }} 
            />
          </div>

          <h1 style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 200,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(16px, 2.5vw, 24px)',
            lineHeight: 1.2
          }}>
            Setup Incomplete
          </h1>
          
          <p style={{ 
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--bw-muted)',
            lineHeight: 1.7,
            marginBottom: 'clamp(12px, 2vw, 16px)',
            maxWidth: '520px',
            margin: '0 auto clamp(12px, 2vw, 16px)'
          }}>
            It looks like your account setup wasn't completed. Don't worry, we're here to help you finish the process.
          </p>
          
          <p style={{ 
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(15px, 2vw, 18px)',
            color: 'var(--bw-muted)',
            lineHeight: 1.7,
            marginBottom: 'clamp(24px, 4vw, 32px)',
            maxWidth: '520px',
            margin: '0 auto clamp(24px, 4vw, 32px)',
            opacity: 0.9
          }}>
            You'll be redirected to your account settings in a few seconds, or you can click the button below to continue right away.
          </p>
        </div>

        {/* Return to Account Information Button */}
        <button
          onClick={() => navigate('/tenant/settings/account', { replace: true })}
          className="bw-btn bw-btn-action"
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            padding: 'clamp(14px, 2.5vw, 16px) clamp(28px, 4vw, 36px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'clamp(8px, 1.5vw, 10px)',
            borderRadius: 7,
            fontFamily: "'Work Sans', sans-serif",
            fontWeight: 600,
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 97, 209, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span>Continue to Account Settings</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  )
}

