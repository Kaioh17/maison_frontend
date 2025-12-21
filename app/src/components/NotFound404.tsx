export default function NotFound404() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'Work Sans, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '120px',
          fontWeight: 'bold',
          margin: '0',
          color: '#333',
          lineHeight: '1',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '600',
          margin: '20px 0',
          color: '#555'
        }}>
          Page Not Found
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#777',
          margin: '20px 0',
          lineHeight: '1.6'
        }}>
          The tenant you're looking for doesn't exist or has been removed.
        </p>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          textAlign: 'left',
          maxWidth: '500px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 15px 0',
            color: '#333'
          }}>
            What you can do:
          </h3>
          <ul style={{
            fontSize: '16px',
            color: '#555',
            lineHeight: '1.8',
            margin: '0',
            paddingLeft: '20px'
          }}>
            <li>Double-check the URL for typos</li>
            <li>Verify the tenant slug is correct</li>
            <li>Contact support if you believe this is an error</li>
          </ul>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            color: '#555',
            margin: '0 0 10px 0'
          }}>
            Need help?
          </p>
          <p style={{
            fontSize: '16px',
            color: '#007bff',
            margin: '0',
            fontWeight: '500'
          }}>
            Contact Support
          </p>
          <a 
            href="mailto:support@example.com" 
            style={{
              fontSize: '16px',
              color: '#007bff',
              textDecoration: 'none',
              marginTop: '5px',
              display: 'inline-block'
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            support@example.com
          </a>
        </div>
      </div>
    </div>
  )
}
