import React, { useState, useEffect } from 'react'
import { Eye, EyeSlash, Envelope, Lock, ArrowRight } from '@phosphor-icons/react'
import { loginTenant } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { getApiErrorMessage } from '@utils/apiError'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'

const LOGIN_HERO_INTERVAL_MS = 60_000
const LOGIN_HERO_FADE_MS = 1_400

const LOGIN_HERO_SLIDES = [
  {
    id: 'opening',
    tagline:
      'Deliver five‑star journeys with every mile. Keep your bookings, drivers, and customers in perfect sync so you can focus on exceptional service.',
  },
  {
    id: 'branded',
    tagline:
      'Your name on every ride, your operation in order. Bookings, drivers, and customers stay in sync, so the service matches the standard you set.',
  },
] as const

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [heroUrls, setHeroUrls] = useState<[string | null, string | null]>([null, null])
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [currentTheme, setCurrentTheme] = useState<string>('dark')

  const navigate = useNavigate()
  const location = useLocation()

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

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('../images/nikita-pishchugin-IdyI9y8BfB4-unsplash.webp'),
      import('../images/login_image.jpg'),
    ]).then(([a, b]) => {
      if (!cancelled) setHeroUrls([a.default, b.default])
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined
    const tick = () => {
      setHeroSlideIndex((i) => (i + 1) % LOGIN_HERO_SLIDES.length)
    }
    const arm = () => {
      if (id) clearInterval(id)
      id = setInterval(tick, LOGIN_HERO_INTERVAL_MS)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') arm()
      else if (id) clearInterval(id)
    }
    arm()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (id) clearInterval(id)
    }
  }, [])

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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tenant-install-app-tip', '1')
      }
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
  //             Go to House
  //           </button>
  //         </Link>
  //       </div>
  //     </main>
  //   )
  // }

  return (
    <>
      <style>{`
        @media (max-width: 1024px) {
          .login-image-container {
            display: none !important;
          }
          .login-form-container {
            width: 100% !important;
            padding: 16px !important;
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
        .login-hero-layer {
          transition: opacity ${LOGIN_HERO_FADE_MS}ms ease;
        }
        .login-hero-tagline {
          transition: opacity ${LOGIN_HERO_FADE_MS}ms ease;
        }
      `}</style>
      <main className="bw" aria-label="Auth" style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
          {/* Left side - Image (70%) */}
          <div
            className="login-image-container"
            style={{
              width: '70%',
              height: '100%',
              position: 'relative',
              backgroundColor: heroUrls[0] ? 'transparent' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
            }}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
              {heroUrls.map((url, i) =>
                url ? (
                  <div
                    key={i}
                    className="login-hero-layer"
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      opacity: heroSlideIndex === i ? 1 : 0,
                    }}
                  />
                ) : null
              )}
            </div>
            {/* Tint: Maison page background at ~60% opacity */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'color-mix(in srgb, var(--bw-bg) 58%, transparent)',
              zIndex: 1,
              pointerEvents: 'none',
            }} />
            {/* Bottom gradient so tagline always reads over any photo */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '55%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
              zIndex: 1,
              pointerEvents: 'none',
            }} />
            <div style={{
              color: 'white',
              textAlign: 'center',
              maxWidth: '600px',
              zIndex: 2,
              position: 'relative',
              padding: '32px',
              display: 'grid',
              justifyItems: 'stretch',
            }}>
              {LOGIN_HERO_SLIDES.map((slide, i) => (
                <p
                  key={slide.id}
                  className="login-hero-tagline"
                  style={{
                    gridRow: 1,
                    gridColumn: 1,
                    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
                    fontSize: '20px',
                    lineHeight: '1.6',
                    fontWeight: 300,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                    margin: 0,
                    opacity: heroSlideIndex === i ? 1 : 0,
                  }}
                >
                  {slide.tagline}
                </p>
              ))}
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
              padding: '24px',
              backgroundColor: 'var(--bw-bg)',
              overflowY: 'auto',
            }}
          >
            {/* Main form content — centered in available space below the logo */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', paddingTop: '72px' }}>
              <h2 className="login-title" style={{ margin: 0, fontSize: 40, fontFamily: 'DM Sans, sans-serif', fontWeight: 200, textAlign: 'center' }}>Welcome back</h2>
              <p className="small-muted login-subtitle" style={{ marginTop: 8, marginBottom: 0, fontSize: 16, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, textAlign: 'center' }}>Sign in to continue</p>

              {error && (
                <div className="login-error" style={{
                  marginTop: 20,
                  padding: '12px',
                  backgroundColor: 'rgba(197, 72, 61, 0.12)',
                  border: '1px solid rgba(197, 72, 61, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--bw-error)',
                  fontSize: '14px',
                  fontFamily: 'Work Sans, sans-serif',
                  width: '100%',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: 24, width: '100%' }}>
                <label className="small-muted login-label" htmlFor="email" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email</label>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ position: 'relative', marginTop: 6 }}>
                    <Envelope className="login-icon" size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .6 }} />
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
                    <div role="alert" style={{ marginTop: 6, fontSize: 13, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-error)' }}>
                      {loginEmailFormatError}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <label className="small-muted login-label" htmlFor="password" style={{ fontFamily: 'Work Sans, sans-serif' }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-muted)', textDecoration: 'underline', flexShrink: 0 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock className="login-icon" size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .6 }} />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="bw-input login-input" value={formData.password} style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} placeholder="••••••••" onChange={handleInputChange} />
                  <button type="button" aria-label="Toggle password" className="login-toggle-btn" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--bw-muted)', cursor: 'pointer' }}>
                    {showPassword ? <EyeSlash className="login-toggle-icon" size={16} /> : <Eye className="login-toggle-icon" size={16} />}
                  </button>
                </div>

                <button
                  className="bw-btn login-button"
                  style={{ width: '100%', marginTop: 20, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500, backgroundColor: 'var(--bw-accent)', color: '#ffffff', border: '1px solid var(--bw-accent)' }}
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                  {!isLoading && <ArrowRight size={16} aria-hidden />}
                </button>

                <div style={{ marginTop: 28, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }} />
                    <span className="small-muted login-divider-text" style={{ fontSize: '12px', fontFamily: 'Work Sans, sans-serif' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }} />
                  </div>
                  <p className="small-muted login-link-text" style={{ textAlign: 'center', marginBottom: 12, fontSize: '14px', fontFamily: 'Work Sans, sans-serif' }}>
                    Don't have an account?
                  </p>
                  <Link to="/signup" style={{ textDecoration: 'none', display: 'block' }}>
                    <button
                      className="bw-btn-outline login-button"
                      style={{ width: '100%', borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}
                    >
                      Create account
                    </button>
                  </Link>
                </div>
              </form>
            </div>

            {/* Legal footer — always at the bottom of the panel */}
            <p style={{ fontSize: 11, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-muted)', textAlign: 'center', margin: '16px 0 8px 0', lineHeight: 1.6, opacity: 0.75, flexShrink: 0 }}>
              By signing in, you agree to Maison's{' '}
              <Link to="/terms" style={{ color: 'var(--bw-muted)', textDecoration: 'underline' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--bw-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}