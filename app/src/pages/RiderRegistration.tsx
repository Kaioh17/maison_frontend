import React, { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react'
import { createUser } from '@api/user'
import { loginRider } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, useSearchParams, Link, useParams } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'

export default function RiderRegistration() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_no: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<string>('dark')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()
  const { slug } = useParams<{ slug?: string }>()
  const { tenantInfo, isLoading: tenantLoading } = useTenantInfo()
  const tenantId = searchParams.get('tenant_id') || tenantInfo?.tenant_id?.toString() || ''
  
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()

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
            import('../images/nikita-pishchugin-IdyI9y8BfB4-unsplash.jpg').then((module) => {
              setBackgroundImage(module.default)
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

  // Redirect authenticated riders
  useEffect(() => {
    if (isAuthenticated && role === 'rider') {
      navigate('/riders/profile', { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '')
    
    // Limit to 10 digits for US format, or 15 for international
    const phoneNumberDigits = phoneNumber.slice(0, 10)
    
    // Format based on length
    if (phoneNumberDigits.length === 0) {
      return ''
    } else if (phoneNumberDigits.length <= 3) {
      return `(${phoneNumberDigits}`
    } else if (phoneNumberDigits.length <= 6) {
      return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`
    } else {
      return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6)}`
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'phone_no') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) {
      setError('Tenant information is required. Please access this page with a valid tenant slug.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      // Strip formatting from phone number (remove all non-digits) before sending
      const phoneDigits = formData.phone_no.replace(/\D/g, '')
      
      // Create user
      await createUser(tenantId, {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_no: phoneDigits,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        password: formData.password
      })

      // Auto-login after registration
      const data = await loginRider(formData.email, formData.password)
      useAuthStore.getState().login({ token: data.access_token })
      // Navigate to profile with slug if available
      const slug = tenantInfo?.slug
      navigate(slug ? `/${slug}/riders/profile` : '/riders/profile', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if already authenticated
  if (isAuthenticated && role === 'rider') {
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

  // Show error if tenant not found
  if (!tenantInfo && !tenantId) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bw-bg)',
        padding: '24px'
      }}>
        <div style={{ 
          color: 'var(--bw-error)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '16px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Tenant not found. Please check the URL and try again.
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button 
            className="bw-btn" 
            style={{ 
              borderRadius: 0, 
              padding: '14px 24px', 
              fontFamily: 'Work Sans, sans-serif', 
              fontWeight: 500 
            }}
          >
            Go to Home
          </button>
        </Link>
      </div>
    )
  }

  const companyName = tenantInfo?.company_name || 'Our Service'

  return (
    <main className="bw" aria-label="Rider Registration" style={{ margin: 0, padding: 0, minHeight: '100vh', overflow: 'auto' }}>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Left side - Image (60%) */}
        <div 
          ref={imageContainerRef}
          className="rider-registration-image-container"
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
              Join {companyName}'s community of riders. Create your account to start booking rides and managing your profile.
            </p>
          </div>
        </div>

        {/* Right side - Registration Form (40%) */}
        <div 
          role="form" 
          aria-labelledby="registration-title"
          className="rider-registration-form-container"
          style={{ 
            width: '40%', 
            minHeight: '100vh',
            position: 'relative',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'flex-start',
            padding: '24px',
            paddingTop: 'clamp(24px, 5vw, 48px)',
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
            <h2 id="registration-title" style={{ margin: 0, fontSize: 40, fontFamily: 'DM Sans, sans-serif', fontWeight: 200 }}>Create account</h2>
          <p className="small-muted" style={{ marginTop: 6, fontSize: 16, fontFamily: 'Work Sans, sans-serif', fontWeight: 300 }}>
            {tenantInfo ? `Sign up for ${companyName}` : 'Sign up to get started'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <label className="small-muted" htmlFor="first_name" style={{ fontFamily: 'Work Sans, sans-serif' }}>First name</label>
              <label className="small-muted" htmlFor="last_name" style={{ fontFamily: 'Work Sans, sans-serif' }}>Last name</label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <User size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                <input 
                  id="first_name" 
                  name="first_name" 
                  type="text" 
                  required 
                  className="bw-input" 
                  style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="John" 
                  value={formData.first_name}
                  onChange={handleInputChange} 
                />
              </div>
              <div style={{ position: 'relative' }}>
                <User size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                <input 
                  id="last_name" 
                  name="last_name" 
                  type="text" 
                  required 
                  className="bw-input" 
                  style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="Doe" 
                  value={formData.last_name}
                  onChange={handleInputChange} 
                />
              </div>
            </div>

            <label className="small-muted" htmlFor="email" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email</label>
            <div style={{ position: 'relative', marginTop: 6, marginBottom: 12 }}>
              <Mail size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
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

            <label className="small-muted" htmlFor="phone_no" style={{ fontFamily: 'Work Sans, sans-serif' }}>Phone number</label>
            <div style={{ position: 'relative', marginTop: 6, marginBottom: 12 }}>
              <Phone size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
              <input 
                id="phone_no" 
                name="phone_no" 
                type="tel" 
                required 
                className="bw-input" 
                style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                placeholder="(555) 555-5555" 
                value={formData.phone_no}
                onChange={handleInputChange}
                maxLength={14}
              />
            </div>

            <label className="small-muted" htmlFor="address" style={{ fontFamily: 'Work Sans, sans-serif' }}>Address</label>
            <div style={{ position: 'relative', marginTop: 6, marginBottom: 12 }}>
              <MapPin size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
              <input 
                id="address" 
                name="address" 
                type="text" 
                required 
                className="bw-input" 
                style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                placeholder="123 Main St" 
                value={formData.address}
                onChange={handleInputChange} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <label className="small-muted" htmlFor="city" style={{ fontFamily: 'Work Sans, sans-serif' }}>City</label>
              <label className="small-muted" htmlFor="state" style={{ fontFamily: 'Work Sans, sans-serif' }}>State</label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input 
                id="city" 
                name="city" 
                type="text" 
                required 
                className="bw-input" 
                style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                placeholder="New York" 
                value={formData.city}
                onChange={handleInputChange} 
              />
              <input 
                id="state" 
                name="state" 
                type="text" 
                required 
                className="bw-input" 
                style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                placeholder="NY" 
                value={formData.state}
                onChange={handleInputChange} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <label className="small-muted" htmlFor="country" style={{ fontFamily: 'Work Sans, sans-serif' }}>Country</label>
              <label className="small-muted" htmlFor="postal_code" style={{ fontFamily: 'Work Sans, sans-serif' }}>Postal code</label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input 
                id="country" 
                name="country" 
                type="text" 
                required 
                className="bw-input" 
                style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                placeholder="USA" 
                value={formData.country}
                onChange={handleInputChange} 
              />
              <input 
                id="postal_code" 
                name="postal_code" 
                type="text" 
                required 
                className="bw-input" 
                style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                placeholder="10001" 
                value={formData.postal_code}
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button 
              className="bw-btn" 
              style={{ width: '100%', marginTop: 16, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }} 
              disabled={isLoading}
              type="submit"
            >
              <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
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
                Already have an account?{' '}
                <Link to={slug ? `/${slug}/riders/login` : '/'} style={{ color: 'var(--bw-fg)', textDecoration: 'underline' }}>
                  signin
                </Link>
              </p>
            </div>
          </form>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .rider-registration-image-container {
            display: none !important;
          }
          .rider-registration-form-container {
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  )
}
