import { useEffect, useState } from 'react'
import { AlertCircle, X, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@store/auth'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { setupStripeAccount } from '@api/tenantSettings'

export default function AccountVerificationNotification() {
  const { accessToken, role } = useAuthStore()
  const navigate = useNavigate()
  const [showNotification, setShowNotification] = useState(false)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingUp, setIsSettingUp] = useState(false)

  useEffect(() => {
    if (!accessToken || role !== 'tenant') {
      setShowNotification(false)
      setIsLoading(false)
      return
    }

    const checkVerificationStatus = async () => {
      try {
        setIsLoading(true)
        const response = await getTenantInfo()
        const verified = response.data?.is_verified ?? false
        setIsVerified(verified)
        setShowNotification(!verified)
      } catch (error) {
        console.error('Error checking verification status:', error)
        setShowNotification(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkVerificationStatus()
  }, [accessToken, role])

  const handleCompleteSetup = async () => {
    try {
      setIsSettingUp(true)
      const response = await setupStripeAccount()
      if (response.onboarding_link) {
        // Open the onboarding link in a new tab
        window.open(response.onboarding_link, '_blank', 'noopener,noreferrer')
        // Optionally close the notification after opening the link
        // setShowNotification(false)
      } else {
        alert('Failed to get Stripe onboarding link')
      }
    } catch (err: any) {
      console.error('Failed to setup Stripe account:', err)
      alert(err?.response?.data?.message || err?.message || 'Failed to setup Stripe account')
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleLearnMore = () => {
    // Open a modal or tooltip with information
    // For now, we'll just scroll to the section
    navigate('/tenant/settings/account')
  }

  if (!showNotification || isLoading || isVerified) return null

  // Orange color similar to Postman (#FF6C37 or similar)
  const orangeColor = '#FF6C37'
  const orangeLight = 'rgba(255, 108, 55, 0.15)'
  const orangeBorder = '#FF8C5A'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        backgroundColor: orangeColor,
        color: '#ffffff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontFamily: '"Work Sans", sans-serif',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
        <AlertCircle className="w-5 h-5" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>
            Complete Your Account Setup
          </div>
          <div style={{ fontSize: '13px', opacity: 0.95, lineHeight: '1.5' }}>
            Finish your application process by setting up your Stripe account.{' '}
            <button
              onClick={handleLearnMore}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                fontSize: '13px',
                fontFamily: 'inherit',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Learn more
            </button>
            {' '}about how this enables you to receive payments from riders and distribute funds to drivers seamlessly.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          onClick={handleCompleteSetup}
          disabled={isSettingUp}
          style={{
            backgroundColor: orangeLight,
            border: `2px solid ${orangeBorder}`,
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: isSettingUp ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: isSettingUp ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isSettingUp) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
              e.currentTarget.style.borderColor = '#FFB380'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSettingUp) {
              e.currentTarget.style.backgroundColor = orangeLight
              e.currentTarget.style.borderColor = orangeBorder
            }
          }}
        >
          {isSettingUp ? 'Setting up...' : 'Complete Account Setup'}
          {!isSettingUp && <ExternalLink className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setShowNotification(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

