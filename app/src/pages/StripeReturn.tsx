import { useNavigate } from 'react-router-dom'
import { CheckCircle, Home, Heart } from 'lucide-react'

export default function StripeReturn() {
  const navigate = useNavigate()

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
        {/* Success Icon with Heart */}
        <div style={{ marginBottom: 'clamp(32px, 4vw, 48px)' }}>
          <div style={{
            width: 'clamp(100px, 12vw, 140px)',
            height: 'clamp(100px, 12vw, 140px)',
            margin: '0 auto clamp(24px, 3vw, 32px)',
            borderRadius: '50%',
            backgroundColor: 'var(--bw-success, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle 
              size={70} 
              style={{ 
                color: '#ffffff',
                strokeWidth: 2.5
              }} 
            />
          </div>
          
          {/* Heart Icon */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 'clamp(16px, 2.5vw, 24px)'
          }}>
            <Heart 
              size={32} 
              style={{ 
                color: 'var(--bw-accent, rgba(155, 97, 209, 0.81))',
                fill: 'var(--bw-accent, rgba(155, 97, 209, 0.81))',
                opacity: 0.8
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
            Welcome to the Family!
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
            We're absolutely thrilled to have you with us! Your account setup is complete, and you're all set to start your journey.
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
            You're now part of our community, and we're here to support you every step of the way. Let's make great things happen together!
          </p>
        </div>

        {/* Return to Dashboard Button */}
        <button
          onClick={() => navigate('/tenant/overview')}
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
          <Home size={18} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </main>
  )
}

