import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Eye, EyeSlash, Envelope, Lock, ArrowRight } from '@phosphor-icons/react'
import { loginTenant } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { getApiErrorMessage } from '@utils/apiError'
import { getDemoCredentials } from '@api/demo'
import DemoLoadingScreen from '@components/DemoLoadingScreen'
import AuthBrandPanel from '@components/AuthBrandPanel'
import { getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import './landing-theme.css'
import './landing-auth.css'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // Seeded synchronously (not in the ?demo=1 effect) so the loading screen is what
  // paints first, never a flash of the bare login form.
  const [demoLoading, setDemoLoading] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1',
  )

  const navigate = useNavigate()
  const location = useLocation()

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
    await signIn(formData.email, formData.password)
  }

  // Landing's "See the demo" links here with ?demo=1 (login must run on this origin: tokens are per-origin).
  useEffect(() => {
    if (new URLSearchParams(location.search).get('demo') !== '1') return
    getDemoCredentials('tenant').then((c) => {
      if (c) signIn(c.email, c.password)
      else {
        setDemoLoading(false)
        setError('The demo is unavailable right now.')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      // Tenant login only
      const data = await loginTenant(email, password)
      useAuthStore.getState().login({ token: data.access_token })
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tenant-install-app-tip', '1')
      }
      // Navigate to tenant dashboard after successful login
      const from = location.state?.from?.pathname || '/tenant/overview'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
      setDemoLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Show message for non-tenant users, but still show login form for tenants
  // if (isAuthenticated && role !== 'tenant') {
  //   return (
  //     <main className="bw" aria-label="Auth" style={{ margin: 0, padding: 0, height: 'var(--app-h)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bw-bg)' }}>
  //       <div style={{ textAlign: 'center', padding: '24px', maxWidth: '600px' }}>
  //         <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 400, color: 'var(--bw-text)' }}>
  //           Tenant Login Only
  //         </h2>
  //         <p style={{ margin: '0 0 24px 0', fontSize: 16, color: 'var(--bw-text)', opacity: 0.7 }}>
  //           This page is for tenant login only. Please use the appropriate login page for your role.
  //         </p>
  //         <Link to="/" style={{ textDecoration: 'none' }}>
  //           <button className="bw-btn" style={{ padding: '12px 24px' }}>
  //             Go to House
  //           </button>
  //         </Link>
  //       </div>
  //     </main>
  //   )
  // }

  return (
    <>
      <AnimatePresence>{demoLoading && <DemoLoadingScreen />}</AnimatePresence>
      <style>{`
        @media (max-width: 1024px) {
          .login-form-container {
            width: 100% !important;
            padding: 16px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
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
      <main className="bw landing-root landing-auth landing-ambient landing-ambient--tr" aria-label="Auth">
        <div className="landing-auth-shell">
          <AuthBrandPanel
            headline="Run your fleet."
            accent="Own the experience."
            lead="Your branded booking link, your drivers, your rates. No aggregator fees, no middlemen."
          />

          <div role="form" aria-labelledby="auth-title" className="landing-auth-panel login-form-container">
            {/* Main form content — centered in available space below the logo */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <h2 id="auth-title" className="landing-auth-title login-title" style={{ textAlign: 'center' }}>Welcome back</h2>
              <p className="small-muted login-subtitle" style={{ marginTop: 8, marginBottom: 0, fontSize: 16, textAlign: 'center' }}>Sign in to continue</p>

              {error && (
                <div className="login-error" style={{
                  marginTop: 20,
                  padding: '12px',
                  backgroundColor: 'rgba(240, 96, 93, 0.12)',
                  border: '1px solid rgba(240, 96, 93, 0.3)',
                  borderRadius: '4px',
                  color: 'var(--bw-error)',
                  fontSize: '14px',
                  width: '100%',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: 24, width: '100%' }}>
                <label className="small-muted login-label" htmlFor="email">Email</label>
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
                      style={{ padding: '16px 18px 16px 44px', borderRadius: 'var(--radius-field)' }}
                      placeholder="you@email.com"
                      onChange={handleInputChange}
                    />
                  </div>
                  {loginEmailFormatError && (
                    <div role="alert" style={{ marginTop: 6, fontSize: 13, color: 'var(--bw-error)' }}>
                      {loginEmailFormatError}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <label className="small-muted login-label" htmlFor="password">Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12, color: 'var(--bw-muted)', textDecoration: 'underline', flexShrink: 0 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock className="login-icon" size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .6 }} />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="bw-input login-input" value={formData.password} style={{ padding: '16px 18px 16px 44px', borderRadius: 'var(--radius-field)' }} placeholder="••••••••" onChange={handleInputChange} />
                  <button type="button" aria-label="Toggle password" className="login-toggle-btn" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--bw-muted)', cursor: 'pointer' }}>
                    {showPassword ? <EyeSlash className="login-toggle-icon" size={16} /> : <Eye className="login-toggle-icon" size={16} />}
                  </button>
                </div>

                <button
                  className="bw-btn login-button"
                  style={{ width: '100%', marginTop: 20 }}
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                  {!isLoading && <ArrowRight size={16} aria-hidden />}
                </button>

                <div style={{ marginTop: 28, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }} />
                    <span className="small-muted login-divider-text" style={{ fontSize: '12px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }} />
                  </div>
                  <p className="small-muted login-link-text" style={{ textAlign: 'center', marginBottom: 12, fontSize: '14px' }}>
                    Don't have an account?
                  </p>
                  <Link to="/signup" style={{ textDecoration: 'none', display: 'block' }}>
                    <button
                      className="bw-btn-outline login-button"
                      style={{ width: '100%' }}
                    >
                      Create account
                    </button>
                  </Link>
                </div>
              </form>

              {/* Legal - directly under the actions */}
              <p style={{ fontSize: 11, color: 'var(--bw-muted)', textAlign: 'center', margin: '20px 0 0 0', lineHeight: 1.6, opacity: 0.75 }}>
                By signing in, you agree to Maison's{' '}
                <Link to="/terms" style={{ color: 'var(--bw-muted)', textDecoration: 'underline' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: 'var(--bw-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>.
              </p>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}