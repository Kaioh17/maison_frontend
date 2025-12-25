import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { useAuthStore } from '@store/auth'
import { jwtDecode } from 'jwt-decode'
import { refreshTenantToken } from '@api/auth'
import { useNavigate } from 'react-router-dom'

interface TokenPayload {
  exp?: number
  id: string
  role: string
  tenant_id?: string
}

export default function TokenExpirationNotification() {
  const { accessToken, role, setAccessToken, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showNotification, setShowNotification] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!accessToken || role !== 'tenant') {
      setShowNotification(false)
      return
    }

    const checkTokenExpiration = () => {
      try {
        const decoded = jwtDecode<TokenPayload>(accessToken)
        if (!decoded.exp) {
          setShowNotification(false)
          return
        }

        const currentTime = Date.now() / 1000
        const expirationTime = decoded.exp
        const timeLeft = expirationTime - currentTime

        // Show notification if token expires in less than 5 minutes or has expired
        if (timeLeft <= 0) {
          setIsExpired(true)
          setShowNotification(true)
          setTimeRemaining(0)
        } else if (timeLeft <= 300) { // 5 minutes = 300 seconds
          setIsExpired(false)
          setShowNotification(true)
          setTimeRemaining(Math.floor(timeLeft))
        } else {
          setShowNotification(false)
          setIsExpired(false)
        }
      } catch (error) {
        console.error('Error checking token expiration:', error)
        setShowNotification(false)
      }
    }

    // Check immediately
    checkTokenExpiration()

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiration, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [accessToken, role])

  // Separate effect to update time remaining every second
  useEffect(() => {
    if (!showNotification || isExpired || timeRemaining === null) {
      return
    }

    const timeUpdateInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timeUpdateInterval)
    }
  }, [showNotification, isExpired, timeRemaining])

  const handleRefreshToken = async () => {
    try {
      const response = await refreshTenantToken()
      if (response.new_access_token) {
        setAccessToken(response.new_access_token)
        setShowNotification(false)
        setIsExpired(false)
        setTimeRemaining(null)
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      // If refresh fails, logout user
      logout()
      navigate('/login')
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0 seconds'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`
    }
    return `${secs} second${secs !== 1 ? 's' : ''}`
  }

  if (!showNotification) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        backgroundColor: isExpired ? 'var(--bw-error, #C5483D)' : 'var(--bw-warning, #B8871B)',
        color: '#ffffff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        fontFamily: '"Work Sans", sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <AlertCircle className="w-5 h-5" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>
            {isExpired
              ? 'Your session has expired'
              : 'Your session is about to expire'}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.95 }}>
            {isExpired
              ? 'Please refresh your session to continue using the dashboard.'
              : `Your access token will expire in ${formatTime(timeRemaining || 0)}. Please refresh your session.`}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={handleRefreshToken}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          {isExpired ? 'Refresh Session' : 'Refresh Now'}
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

