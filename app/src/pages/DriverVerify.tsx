import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyDriverToken } from '@api/driver'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { useFavicon } from '@hooks/useFavicon'
import { Key } from 'lucide-react'

export default function DriverVerify() {
  useFavicon()
  const slug = useTenantSlug()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const { tenantInfo, isLoading: tenantLoading } = useTenantInfo()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token.trim()) {
      setError('Please enter a verification token')
      return
    }

    if (!slug) {
      setError('Tenant subdomain is required. Please access this page from a valid tenant subdomain.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      const response = await verifyDriverToken(slug, token.trim())
      
      if (response.success) {
        // Extract tenant_id from response data
        const tenantId = response.data?.tenant_id || response.data?.tenantId
        if (!tenantId) {
          setError('Tenant ID not found in verification response')
          setIsLoading(false)
          return
        }
        // Token is valid, redirect to registration with token and tenant_id in state
        navigate('/driver/register', { 
          replace: true,
          state: { token: token.trim(), tenantId: tenantId }
        })
      } else {
        setError(response.message || 'Invalid verification token')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Driver verification error:', err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to verify token'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const companyName = tenantInfo?.company_name || 'Our Service'

  if (tenantLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bw-bg)'
      }}>
        <div style={{ 
          color: 'var(--bw-text)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '16px'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <main className="bw" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: 'var(--bw-bg)'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {tenantInfo && (
          <div style={{ 
            marginBottom: '32px', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {tenantInfo.logo_url ? (
              <img 
                src={tenantInfo.logo_url} 
                alt={companyName}
                style={{
                  maxHeight: '60px',
                  maxWidth: '200px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <h1 style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 600,
                color: 'var(--bw-text)',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                {companyName}
              </h1>
            )}
          </div>
        )}
        
        <div style={{
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--bw-text)',
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: '8px'
          }}>
            Driver Verification
          </h2>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--bw-text-secondary)',
            fontFamily: 'Work Sans, sans-serif'
          }}>
            Enter your verification token to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          width: '100%',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="token"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--bw-text)',
                fontFamily: 'Work Sans, sans-serif'
              }}
            >
              Verification Token
            </label>
            <div style={{ position: 'relative' }}>
              <Key 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--bw-text-secondary)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value)
                  setError('')
                }}
                placeholder="Enter your verification token"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  fontSize: '16px',
                  fontFamily: 'Work Sans, sans-serif',
                  border: error ? '1px solid var(--bw-error)' : '1px solid var(--bw-border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bw-surface)',
                  color: 'var(--bw-text)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--bw-primary)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? 'var(--bw-error)' : 'var(--bw-border)'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'rgba(197, 72, 61, 0.1)', 
              border: '1px solid var(--bw-error)', 
              borderRadius: '8px',
              color: 'var(--bw-error)',
              fontSize: '14px',
              fontFamily: 'Work Sans, sans-serif',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !token.trim()}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: 'Work Sans, sans-serif',
              color: 'white',
              backgroundColor: isLoading || !token.trim() ? 'var(--bw-disabled)' : 'var(--bw-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || !token.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && token.trim()) {
                e.currentTarget.style.backgroundColor = 'var(--bw-primary-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && token.trim()) {
                e.currentTarget.style.backgroundColor = 'var(--bw-primary)'
              }
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify Token'}
          </button>
        </form>
      </div>
    </main>
  )
}

