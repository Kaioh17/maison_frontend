import { useNavigate } from 'react-router-dom'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { Car, User } from '@phosphor-icons/react'

export default function TenantRoute404() {
  const navigate = useNavigate()
  const slug = useTenantSlug()

  const handleDriverClick = () => {
    if (slug) {
      navigate('/driver/login')
    } else {
      navigate('/driver/login')
    }
  }

  const handleRiderClick = () => {
    if (slug) {
      navigate('/riders/login')
    } else {
      navigate('/riders/login')
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'Work Sans, sans-serif',
      backgroundColor: 'var(--bw-bg)',
      padding: 'clamp(20px, 4vw, 40px)',
      color: 'var(--bw-text)'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '700px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: 'clamp(72px, 12vw, 120px)',
          fontWeight: 'bold',
          margin: '0',
          color: 'var(--bw-text)',
          lineHeight: '1',
          fontFamily: 'DM Sans, sans-serif'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: '600',
          margin: 'clamp(16px, 3vw, 20px) 0',
          color: 'var(--bw-text)',
          fontFamily: 'DM Sans, sans-serif'
        }}>
          Page Not Found
        </h2>
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          color: 'var(--bw-muted, var(--bw-text))',
          margin: 'clamp(16px, 3vw, 20px) 0',
          lineHeight: '1.6',
          opacity: 0.8
        }}>
          Tenant management pages are not available on subdomain routes.
        </p>

        {/* Reasons Section */}
        <div style={{
          marginTop: 'clamp(24px, 4vw, 30px)',
          padding: 'clamp(20px, 3vw, 24px)',
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          borderRadius: '12px',
          border: '1px solid var(--bw-border)',
          textAlign: 'left',
          maxWidth: '600px',
          margin: 'clamp(24px, 4vw, 30px) auto'
        }}>
          <h3 style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: '600',
            margin: '0 0 clamp(12px, 2vw, 15px) 0',
            color: 'var(--bw-text)',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            Why you're seeing this page:
          </h3>
          <ul style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--bw-text)',
            lineHeight: '1.8',
            margin: '0',
            paddingLeft: '20px',
            opacity: 0.9
          }}>
            <li>Tenant management features are only accessible from the main domain</li>
            <li>Subdomain routes are reserved for driver and rider portals</li>
            <li>If you're a tenant administrator, please access the platform from the main domain</li>
            <li>If you're a driver or rider, use the options below to access your portal</li>
          </ul>
        </div>

        {/* Driver/Rider Selection */}
        <div style={{
          marginTop: 'clamp(24px, 4vw, 30px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 2vw, 16px)',
          maxWidth: '500px',
          margin: 'clamp(24px, 4vw, 30px) auto 0'
        }}>
          <h3 style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: '600',
            margin: '0 0 clamp(12px, 2vw, 15px) 0',
            color: 'var(--bw-text)',
            fontFamily: 'DM Sans, sans-serif',
            textAlign: 'center'
          }}>
            Are you a driver or rider?
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(12px, 2vw, 16px)',
            width: '100%'
          }}>
            {/* Driver Button */}
            <button
              onClick={handleDriverClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: 'clamp(14px, 2.5vw, 18px) clamp(24px, 4vw, 32px)',
                backgroundColor: 'var(--bw-fg)',
                color: 'var(--bw-bg)',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(15px, 2.5vw, 17px)',
                fontWeight: 600,
                fontFamily: 'Work Sans, sans-serif',
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Car size={20} />
              <span>I'm a Driver</span>
            </button>

            {/* Rider Button */}
            <button
              onClick={handleRiderClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: 'clamp(14px, 2.5vw, 18px) clamp(24px, 4vw, 32px)',
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                color: 'var(--bw-text)',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                fontSize: 'clamp(15px, 2.5vw, 17px)',
                fontWeight: 600,
                fontFamily: 'Work Sans, sans-serif',
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.1s, background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.backgroundColor = 'var(--bw-card-bg, var(--bw-bg))'
              }}
            >
              <User size={20} />
              <span>I'm a Rider</span>
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div style={{
          marginTop: 'clamp(24px, 4vw, 30px)',
          padding: 'clamp(20px, 3vw, 24px)',
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          borderRadius: '8px',
          border: '1px solid var(--bw-border)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--bw-text)',
            margin: '0 0 clamp(8px, 1.5vw, 10px) 0',
            opacity: 0.9
          }}>
            Need help?
          </p>
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--bw-fg)',
            margin: '0',
            fontWeight: '500'
          }}>
            Contact Support
          </p>
        </div>
      </div>
    </div>
  )
}

