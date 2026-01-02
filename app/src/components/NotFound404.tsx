import { useTenantInfo } from '@hooks/useTenantInfo'

export default function NotFound404() {
  const { tenantInfo } = useTenantInfo()
  const companyName = tenantInfo?.company_name || 'the service'

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
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Company Logo if available */}
        {tenantInfo?.logo_url && (
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src={tenantInfo.logo_url} 
              alt={companyName}
              style={{
                maxHeight: '60px',
                maxWidth: '200px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

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
          Tenant Not Found
        </h2>
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          color: 'var(--bw-muted, var(--bw-text))',
          margin: 'clamp(16px, 3vw, 20px) 0',
          lineHeight: '1.6',
          opacity: 0.8
        }}>
          This tenant subdomain is not valid or has been removed.
        </p>
        
        <div style={{
          marginTop: 'clamp(24px, 4vw, 30px)',
          padding: 'clamp(20px, 3vw, 24px)',
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          borderRadius: '8px',
          border: '1px solid var(--bw-border)',
          textAlign: 'left',
          maxWidth: '500px',
          margin: 'clamp(24px, 4vw, 30px) auto 0'
        }}>
          <h3 style={{
            fontSize: 'clamp(18px, 3vw, 20px)',
            fontWeight: '600',
            margin: '0 0 clamp(12px, 2vw, 15px) 0',
            color: 'var(--bw-text)',
            fontFamily: 'DM Sans, sans-serif'
          }}>
            How to resolve this:
          </h3>
          <ul style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--bw-text)',
            lineHeight: '1.8',
            margin: '0',
            paddingLeft: '20px',
            opacity: 0.9
          }}>
            <li>Double-check the subdomain in the URL for typos</li>
            <li>Verify you're using the correct tenant subdomain</li>
            <li>Make sure you're accessing the correct URL provided by {companyName}</li>
            <li>Contact support if you believe this is an error</li>
          </ul>
        </div>

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
            margin: '0 0 clamp(4px, 1vw, 6px) 0',
            fontWeight: '500'
          }}>
            Contact Support
          </p>
          <a 
            href="mailto:support@example.com" 
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--bw-fg)',
              textDecoration: 'none',
              marginTop: '4px',
              display: 'inline-block',
              opacity: 0.8
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.textDecoration = 'underline'
              e.currentTarget.style.opacity = '1'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.textDecoration = 'none'
              e.currentTarget.style.opacity = '0.8'
            }}
          >
            support@example.com
          </a>
        </div>
      </div>
    </div>
  )
}
