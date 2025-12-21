import { FormEvent, useState, useEffect, useRef } from 'react'
import { Info, Eye, EyeOff } from 'lucide-react'
import { createTenant } from '@api/tenant'
import { loginTenant } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link } from 'react-router-dom'
import whiteLogo from '../images/white_logo.png'
import darkLogo from '../images/dark_logo(c).png'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [slug, setSlug] = useState('')
  const [city, setCity] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSlugTooltip, setShowSlugTooltip] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [currentLogo, setCurrentLogo] = useState<string>(whiteLogo)
  const [currentTheme, setCurrentTheme] = useState<string>('dark')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Determine current theme and set appropriate logo
  const getCurrentTheme = () => {
    if (typeof window === 'undefined') return 'dark'
    const theme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme')
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme || 'dark'
  }

  useEffect(() => {
    const updateLogo = () => {
      const theme = getCurrentTheme()
      setCurrentTheme(theme)
      setCurrentLogo(theme === 'dark' ? darkLogo : whiteLogo)
    }

    updateLogo()

    // Listen for theme changes
    const observer = new MutationObserver(updateLogo)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] })

    // Listen for system theme changes (for auto mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateLogo)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', updateLogo)
    }
  }, [])

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '')
    
    // Limit to 10 digits (US phone number)
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancelLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    // Clear the file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Lazy load background image
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !backgroundImage) {
            // Load image when container is visible
            import('../images/photo-1526289034009-0240ddb68ce3.avif').then((module) => {
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

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null); setError(null)
    try {
      // Strip formatting from phone number (remove all non-digits)
      const phoneDigits = phone.replace(/\D/g, '')
      
      await createTenant({
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        phone_no: phoneDigits,
        company_name: company,
        slug,
        city,
        logo_url: logoFile,
      })
      // Auto-login then go to dashboard
      const data = await loginTenant(email, password)
      useAuthStore.getState().login({ token: data.access_token })
      navigate('/tenant')
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create account')
    }
  }

  return (
    <main className="bw" aria-label="Create account" style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 768px) {
          .signup-image-container {
            display: none !important;
          }
          .signup-form-container {
            width: 100% !important;
            padding: 16px !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          .signup-form-grid {
            grid-template-columns: 1fr !important;
          }
          .signup-main-container {
            flex-direction: column !important;
          }
        }
      `}</style>
      <div className="signup-main-container" style={{ display: 'flex', height: '100vh', width: '100%' }}>
        {/* Left side - Image (65%) */}
        <div 
          ref={imageContainerRef}
          className="signup-image-container"
          style={{ 
            width: '65%', 
            height: '100%', 
            position: 'relative',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundColor: backgroundImage ? 'transparent' : '#f3f4f6',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'background-image 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px'
          }} 
        >
          <div style={{
            color: 'white',
            textAlign: 'center',
            maxWidth: '600px',
            zIndex: 2,
            padding: '32px'
          }}>
            <h1 style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '40px',
              fontWeight: 200,
              margin: '0 0 16px 0'
            }}>
              Welcome to Maison
            </h1>
            <p style={{
              fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
              fontSize: '20px',
              lineHeight: '1.6',
              fontWeight: 300,
              margin: 0
            }}>
              where technology meets timeless service. Whether you're managing one car or an entire fleet, our platform gives you the tools to organize, grow, and impress. Because running a premium transportation business should feel as smooth as the rides you deliver.
            </p>
          </div>
        </div>

        {/* Right side - Signup Form (35%) */}
        <div 
          role="form" 
          aria-labelledby="signup-title"
          className="signup-form-container"
          style={{ 
            width: '35%', 
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
          <img 
            src={currentLogo} 
            alt="Maison Logo" 
            style={{ 
              position: 'absolute',
              top: '24px',
              left: '24px',
              height: '95px', 
              width: 'auto', 
              objectFit: 'contain',
              zIndex: 10
            }} 
          />
          <h1 id="signup-title" style={{ margin: 0, fontSize: 40, fontFamily: 'DM Sans, sans-serif', fontWeight: 200 }}>Create account</h1>
          <p className="small-muted" style={{ marginTop: 6, fontSize: 16, fontFamily: 'Work Sans, sans-serif', fontWeight: 300 }}>Set up your company profile in minutes.</p>

          <form onSubmit={submit} className="vstack signup-form-grid" style={{ display: 'grid', gap: 12, marginTop: 16, width: '100%' }}>
            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>First name
                <input className="bw-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Last name
                <input className="bw-input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
            </div>

            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <input className="bw-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
                </div>
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Password
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <input 
                    className="bw-input" 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ padding: '16px 18px 16px 18px', paddingRight: '44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  />
                  <button 
                    type="button" 
                    aria-label="Toggle password" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#4c4e4eff', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'Work Sans, sans-serif' }}>
                Phone
                <input 
                  className="bw-input" 
                  type="tel"
                  placeholder="(555) 555-5555" 
                  value={phone} 
                  onChange={handlePhoneChange}
                  maxLength={14}
                  style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Company
                <input className="bw-input" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
            </div>

            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ position: 'relative', fontFamily: 'Work Sans, sans-serif' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Slug
                  <div 
                    style={{ position: 'relative', display: 'inline-block' }}
                    onMouseEnter={() => setShowSlugTooltip(true)}
                    onMouseLeave={() => setShowSlugTooltip(false)}
                  >
                    <Info 
                      size={14} 
                      style={{ 
                        cursor: 'help', 
                        color: 'var(--bw-muted)',
                        opacity: 0.7
                      }} 
                    />
                    {showSlugTooltip && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-30%)',
                        marginBottom: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '0',
                        color: 'var(--bw-text)',
                        fontSize: '12px',
                        zIndex: 1000,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        maxWidth: '250px',
                        whiteSpace: 'normal',
                        textAlign: 'left'
                      }}>
                        A URL-friendly identifier for your company (e.g., "my-company" becomes "my-company.maison.com")
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '6px solid var(--bw-border)'
                        }}></div>
                      </div>
                    )}
                  </div>
                </span>
                <input className="bw-input" placeholder="my-company" value={slug} onChange={(e) => setSlug(e.target.value)} style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>City
                <input className="bw-input" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
            </div>

            <div className="bw-form-group">
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Company Logo (optional)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById('logo-upload')?.click()
                  }}
                  style={{ 
                    color: 'var(--bw-accent)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                >
                  {logoFile ? 'Change Logo' : 'Upload Logo'}
                </a>
                {logoFile && (
                  <>
                    <span className="small-muted" style={{ fontSize: '12px', fontFamily: 'Work Sans, sans-serif' }}>
                      {logoFile.name}
                    </span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handleCancelLogo()
                      }}
                      style={{ 
                        color: '#dc2626',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontFamily: 'Work Sans, sans-serif'
                      }}
                    >
                      Cancel
                    </a>
                  </>
                )}
              </div>
              {logoPreview && (
                <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    style={{ 
                      maxWidth: '100px', 
                      maxHeight: '100px', 
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} 
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleCancelLogo()
                    }}
                    style={{ 
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      color: '#dc2626',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontFamily: 'Work Sans, sans-serif'
                    }}
                  >
                    ×
                  </a>
                </div>
              )}
            </div>

            {error && <div className="small-muted" style={{ color: '#ffb3b3', fontFamily: 'Work Sans, sans-serif' }}>{error}</div>}
            {message && <div className="small-muted" style={{ color: '#b3ffcb', fontFamily: 'Work Sans, sans-serif' }}>{message}</div>}

            <button className="bw-btn" type="submit" style={{ color: currentTheme === 'dark' ? '#000000' : '#ffffffff', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}>Create account</button>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Already have an account? </span>
              <Link 
                to="/login"
                style={{ 
                  marginLeft: 6,
                  color: 'var(--bw-accent)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 