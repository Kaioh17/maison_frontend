import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bw-bg)',
      fontFamily: 'Work Sans, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={40} style={{ color: '#ef4444' }} />
          </div>
        </div>
        
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 72px)',
          fontWeight: 700,
          color: 'var(--bw-text)',
          margin: '0 0 16px 0',
          fontFamily: 'DM Sans, sans-serif'
        }}>
          404
        </h1>
        
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 400,
          color: 'var(--bw-text)',
          margin: '0 0 16px 0',
          fontFamily: 'DM Sans, sans-serif'
        }}>
          Page Not Found
        </h2>
        
        <p style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          color: 'var(--bw-text)',
          opacity: 0.7,
          margin: '0 0 32px 0',
          lineHeight: 1.6
        }}>
          The page you are looking for does not exist or has been moved.
        </p>
        
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: 'clamp(12px, 2vw, 14px) clamp(24px, 4vw, 32px)',
            backgroundColor: 'var(--bw-fg)',
            color: 'var(--bw-bg)',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontWeight: 600,
            fontFamily: 'Work Sans, sans-serif',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          <Home size={18} />
          Go to Home
        </Link>
      </div>
    </div>
  )
}
