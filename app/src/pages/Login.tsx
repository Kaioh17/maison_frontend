import React, { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Mail, Lock, Car, ArrowRight } from 'lucide-react'
import { loginTenant } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { getApiErrorMessage } from '@utils/apiError'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import MaisonWordmark from '@components/MaisonWordmark'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<string>('dark')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role } = useAuthStore()

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
      setCurrentTheme(getCurrentTheme())
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] })

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
            // Load image when container is visible
            import('../images/nikita-pishchugin-IdyI9y8BfB4-unsplash.jpg').then((module) => {
              setBackgroundImage(module.default)
            })
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' } // Start loading 50px before it's visible
    )

    if (imageContainerRef.current) {
      observer.observe(imageContainerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [backgroundImage])

  // Don't auto-redirect - always show login page
  // Users can manually navigate away if needed

  const getDefaultRoute = (userRole: string) => {
    switch (userRole) {
      case 'tenant':
        return '/tenant/overview'
      case 'driver':
        return '/driver'
      case 'admin':
        return '/admin'
      default:
        return '/'
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const loginEmailFormatError = getEmailFormatError(formData.email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }
    try {
      setIsLoading(true)
      // Tenant login only
      const data = await loginTenant(formData.email, formData.password)
      useAuthStore.getState().login({ token: data.access_token })
      // Navigate to tenant dashboard after successful login
      const from = location.state?.from?.pathname || '/tenant/overview'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
    } finally {
      setIsLoading(false)
    }
  }

  // Show message for non-tenant users, but still show login form for tenants
  // if (isAuthenticated && role !== 'tenant') {
  //   return (
  //     <main className="bw" aria-label="Auth" style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bw-bg)' }}>
  //       <div style={{ textAlign: 'center', padding: '24px', maxWidth: '600px' }}>
  //         <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontFamily: 'DM Sans, sans-serif', fontWeight: 400, color: 'var(--bw-text)' }}>
  //           Tenant Login Only
  //         </h2>
  //         <p style={{ margin: '0 0 24px 0', fontSize: 16, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-text)', opacity: 0.7 }}>
  //           This page is for tenant login only. Please use the appropriate login page for your role.
  //         </p>
  //         <Link to="/" style={{ textDecoration: 'none' }}>
  //           <button className="bw-btn" style={{ padding: '12px 24px', fontFamily: 'Work Sans, sans-serif' }}>
  //             Go to Home
  //           </button>
  //         </Link>
  //       </div>
  //     </main>
  //   )
  // }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .login-image-container {
            display: none !important;
          }
          .login-form-container {
            width: 100% !important;
            padding: 16px !important;
          }
          .login-logo {
            font-size: 30px !important;
            top: 16px !important;
            left: 16px !important;
          }
          .login-title {
            font-size: 28px !important;
          }
          .login-subtitle {
            font-size: 14px !important;
            margin-top: 4px !important;
          }
          .login-label {
            font-size: 12px !important;
          }
          .login-input {
            padding: 12px 14px 12px 38px !important;
            font-size: 14px !important;
          }
          .login-icon {
            left: 12px !important;
            width: 14px !important;
            height: 14px !important;
          }
          .login-toggle-btn {
            right: 10px !important;
          }
          .login-toggle-icon {
            width: 14px !important;
            height: 14px !important;
          }
          .login-button {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          .login-divider-text {
            font-size: 11px !important;
          }
          .login-link-text {
            font-size: 13px !important;
          }
          .login-error {
            font-size: 12px !important;
            padding: 10px !important;
          }
        }
      `}</style>
      <main className="bw" aria-label="Auth" style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
          {/* Left side - Image (70%) */}
          <div 
            ref={imageContainerRef}
            className="login-image-container"
            style={{ 
              width: '70%', 
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
            {/* Tint: Maison page background at ~60% opacity (replaces former rgba(0,0,0,0.6)) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'color-mix(in srgb, var(--bw-bg) 58%, transparent)',
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
                Deliver five‑star journeys with every mile. Keep your bookings, drivers, and customers in perfect sync so you can focus on exceptional service.
              </p>
            </div>
          </div>

          {/* Right side - Login Form (30%) */}
          <div 
            role="form" 
            aria-labelledby="auth-title"
            className="login-form-container"
            style={{ 
              width: '30%', 
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
            <div
              className="login-logo"
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                zIndex: 10,
                fontSize: 40,
                lineHeight: 1,
              }}
            >
              <MaisonWordmark />
            </div>
            <h2 className="login-title" style={{ margin: 0, fontSize: 40, fontFamily: 'DM Sans, sans-serif', fontWeight: 200 }}>Welcome back</h2>
            <p className="small-muted login-subtitle" style={{ marginTop: 6, fontSize: 16, fontFamily: 'Work Sans, sans-serif', fontWeight: 300 }}>Sign in to continue</p>

            {error && (
              <div className="login-error" style={{ 
                marginTop: 16, 
                padding: '12px', 
                backgroundColor: '#fee2e2', 
                border: '1px solid #fecaca', 
                borderRadius: '4px',
                color: '#dc2626',
                fontSize: '14px',
                fontFamily: 'Work Sans, sans-serif'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 16, width: '100%' }}>
              <label className="small-muted login-label" htmlFor="email" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email</label>
              <div style={{ marginBottom: 12 }}>
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <Mail className="login-icon" size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#000000' : undefined }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="bw-input login-input"
                    value={formData.email}
                    aria-invalid={formData.email.length > 0 && !!loginEmailFormatError}
                    style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                    placeholder="you@email.com"
                    onChange={handleInputChange}
                  />
                </div>
                <p className="small-muted" style={{ marginTop: 8, marginBottom: 0, fontSize: 12, fontFamily: 'Work Sans, sans-serif' }}>
                  {EMAIL_FORMAT_HINT}
                </p>
                {loginEmailFormatError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontFamily: 'Work Sans, sans-serif',
                      color: '#dc2626',
                    }}
                  >
                    {loginEmailFormatError}
                  </div>
                )}
              </div>

              <label className="small-muted login-label" htmlFor="password" style={{ fontFamily: 'Work Sans, sans-serif' }}>Password</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <Lock className="login-icon" size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#000000' : undefined }} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="bw-input login-input" value={formData.password} style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} placeholder="••••••••" onChange={handleInputChange} />
                <button type="button" aria-label="Toggle password" className="login-toggle-btn" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#4c4e4eff' }}>
                  {showPassword ? <EyeOff className="login-toggle-icon" size={16} /> : <Eye className="login-toggle-icon" size={16} />}
                </button>
              </div>

              <button 
                className="bw-btn login-button" 
                style={{ width: '100%', marginTop: 16, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }} 
                disabled={isLoading}
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
                  <span className="small-muted login-divider-text" style={{ fontSize: '12px', fontFamily: 'Work Sans, sans-serif' }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }}></div>
                </div>
                <p className="small-muted login-link-text" style={{ textAlign: 'center', marginBottom: 16, fontSize: '14px', fontFamily: 'Work Sans, sans-serif' }}>
                  Don't have an account?
                </p>
                <Link to="/signup" style={{ textDecoration: 'none', display: 'block' }}>
                  <button 
                    className="bw-btn login-button" 
                    style={{ 
                      width: '100%', 
                      borderRadius: 0, 
                      padding: '14px 24px', 
                      background: 'var(--bw-bg)',
                      color: 'var(--bw-fg)',
                      border: '1px solid var(--bw-fg)',
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 500 
                    }} 
                  >
                    Create account
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
} 