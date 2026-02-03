import React, { useState, useEffect, useRef } from 'react'
import { Eye, EyeSlash, Envelope, Lock, ArrowRight } from '@phosphor-icons/react'
import { loginDriver } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'

export default function DriverLogin() {
  useFavicon()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<string>('dark')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const { tenantInfo, isLoading: tenantLoading } = useTenantInfo()
  
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()
  const [searchParams] = useSearchParams()

  // Auto-login with token from query parameter (for switch to driver mode)
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && role !== 'driver') {
      // Automatically log in with the provided token
      useAuthStore.getState().login({ token })
      // Remove token from URL for security and cleanliness
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('token')
      const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '')
      window.history.replaceState({}, '', newUrl)
      // The redirect effect below will handle navigation to dashboard
    }
  }, [searchParams, role])

  // Determine current theme
  const getCurrentTheme = () => {
    if (typeof window === 'undefined') return 'dark'
    const theme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme')
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme || 'dark'
  }

  useEffect(() => {
    const updateTheme = () => {
      const theme = getCurrentTheme()
      setCurrentTheme(theme)
    }

    updateTheme()

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] })

    // Listen for system theme changes (for auto mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [])

  // Lazy load background image
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !backgroundImage) {
            import('../images/nikita-pishchugin-IdyI9y8BfB4-unsplash.jpg')
              .then((module) => {
                setBackgroundImage(module.default)
              })
              .catch((err) => {
                console.warn('Failed to load background image:', err)
                // Image loading failure is not critical, continue without it
              })
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imageContainerRef.current) {
      observer.observe(imageContainerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [backgroundImage])

  // Redirect authenticated drivers
  useEffect(() => {
    if (isAuthenticated && role === 'driver') {
      navigate('/driver/dashboard', { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError('')
      
      const data = await loginDriver(formData.email, formData.password)
      useAuthStore.getState().login({ token: data.access_token })
      
      // Navigate to driver dashboard
      navigate('/driver/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if already authenticated
  if (isAuthenticated && role === 'driver') {
    return null
  }

  // Show loading state while fetching tenant info
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

  const companyName = tenantInfo?.company_name || 'Our Service'

  return (
    <main className="bw" aria-label="Driver Login" style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
        {/* Left side - Image (60%) */}
        <div 
          ref={imageContainerRef}
          className="driver-login-image-container"
          style={{ 
            width: '60%', 
            height: '100%', 
            position: 'relative',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundColor: backgroundImage ? 'transparent' : '#f3f4f6',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'background-image 0.3s ease',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '48px',
            paddingTop: '120px'
          }} 
        >
          {/* Dark overlay covering entire image */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1
          }}></div>
          <div style={{
            color: 'white',
            textAlign: 'center',
            maxWidth: '600px',
            zIndex: 2,
            position: 'relative',
            padding: '32px'
          }}>
            <p style={{
              fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
              fontSize: '20px',
              lineHeight: '1.6',
              fontWeight: 300,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
              margin: 0
            }}>
              Welcome back to {companyName}. Sign in to continue managing your rides and driver account.
            </p>
          </div>
        </div>

        {/* Right side - Login Form (40%) */}
        <div 
          role="form" 
          aria-labelledby="login-title"
          className="driver-login-form-container"
          style={{ 
            width: '40%', 
            height: '100%', 
            position: 'relative',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'var(--bw-bg)',
            overflowY: 'auto'
          }}
        >
          <div style={{ width: '100%', maxWidth: '100%' }}>
            {/* Company Logo/Name */}
            {tenantInfo && (
              <div style={{ 
                marginBottom: '24px', 
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
            <h2 id="login-title" style={{ margin: 0, fontSize: 40, fontFamily: 'DM Sans, sans-serif', fontWeight: 200 }}>Sign in</h2>
            <p className="small-muted" style={{ marginTop: 6, fontSize: 16, fontFamily: 'Work Sans, sans-serif', fontWeight: 300 }}>
              {tenantInfo ? `Sign in to ${companyName}` : 'Sign in to your driver account'}
            </p>

            {error && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px', 
                backgroundColor: 'rgba(197, 72, 61, 0.1)', 
                border: '1px solid var(--bw-error)', 
                borderRadius: '4px',
                color: 'var(--bw-error)',
                fontSize: '14px',
                fontFamily: 'Work Sans, sans-serif',
                width: '100%'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 16, width: '100%' }}>
              <label className="small-muted" htmlFor="email" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email</label>
              <div style={{ position: 'relative', marginTop: 6, marginBottom: 12 }}>
                <Envelope size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  className="bw-input" 
                  style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="you@email.com" 
                  value={formData.email}
                  onChange={handleInputChange} 
                />
              </div>

              <label className="small-muted" htmlFor="password" style={{ fontFamily: 'Work Sans, sans-serif' }}>Password</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <Lock size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="bw-input" 
                  style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange} 
                />
                <button 
                  type="button" 
                  aria-label="Toggle password" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: currentTheme === 'dark' ? '#ffffff' : '#4c4e4eff', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button 
                className="bw-btn" 
                style={{ width: '100%', marginTop: 16, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }} 
                disabled={isLoading}
                type="submit"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                {!isLoading && <ArrowRight size={16} aria-hidden />}
              </button>

              <div style={{ marginTop: 24, width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 16,
                  gap: 12
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }}></div>
                  <span className="small-muted" style={{ fontSize: '12px', fontFamily: 'Work Sans, sans-serif' }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }}></div>
                </div>
                <p className="small-muted" style={{ textAlign: 'center', marginBottom: 16, fontSize: '14px', fontFamily: 'Work Sans, sans-serif' }}>
                  Don't have an account?{' '}
                  <Link to="/driver/verify" style={{ color: 'var(--bw-fg)', textDecoration: 'underline' }}>
                    Get started
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .driver-login-image-container {
            display: none !important;
          }
          .driver-login-form-container {
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  )
}

