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
  const [showSlugInfo, setShowSlugInfo] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
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

  const validateSlug = (value: string): string | null => {
    if (!value) return null // Allow empty, required validation will handle it
    
    // Check for invalid characters (only lowercase letters, numbers, and hyphens allowed)
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    
    // Must start with a letter or number
    if (!/^[a-z0-9]/.test(value)) {
      return 'Slug must start with a letter or number'
    }
    
    // Must end with a letter or number
    if (!/[a-z0-9]$/.test(value)) {
      return 'Slug must end with a letter or number'
    }
    
    // No consecutive hyphens
    if (value.includes('--')) {
      return 'Slug cannot contain consecutive hyphens'
    }
    
    return null
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase() // Convert to lowercase automatically
    setSlug(value)
    const validationError = validateSlug(value)
    setSlugError(validationError)
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
    
    // Validate slug before submission
    const slugValidationError = validateSlug(slug)
    if (slugValidationError) {
      setSlugError(slugValidationError)
      setError('Please fix the slug format before submitting')
      return
    }
    
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
      // Auto-login then go to subscription selection
      const data = await loginTenant(email, password)
      useAuthStore.getState().login({ token: data.access_token })
      navigate('/subscription')
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
            padding: 16px 24px !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          .signup-form-grid {
            grid-template-columns: 1fr !important;
          }
          .signup-form {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .signup-main-container {
            flex-direction: column !important;
          }
          .signup-logo {
            height: 60px !important;
            top: 16px !important;
            left: 16px !important;
          }
          .signup-title {
            font-size: 28px !important;
          }
          .signup-subtitle {
            font-size: 14px !important;
            margin-top: 4px !important;
          }
          .signup-label {
            font-size: 12px !important;
          }
          .signup-input {
            padding: 12px 14px 12px 14px !important;
            font-size: 14px !important;
          }
          .signup-input-password {
            padding: 12px 14px 12px 14px !important;
            padding-right: 38px !important;
            font-size: 14px !important;
          }
          .signup-toggle-btn {
            right: 10px !important;
          }
          .signup-toggle-icon {
            width: 14px !important;
            height: 14px !important;
          }
          .signup-button {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          .signup-link-text {
            font-size: 13px !important;
          }
          .signup-error {
            font-size: 12px !important;
          }
          .signup-message {
            font-size: 12px !important;
          }
          .signup-logo-label {
            font-size: 12px !important;
          }
          .signup-logo-link {
            font-size: 13px !important;
          }
          .signup-logo-cancel {
            font-size: 11px !important;
          }
          .signup-slug-info {
            font-size: 11px !important;
            width: 280px !important;
          }
          .signup-slug-error {
            font-size: 11px !important;
          }
          .signup-modal {
            padding: 20px !important;
          }
          .signup-modal-title {
            font-size: 20px !important;
          }
          .signup-modal-content {
            font-size: 13px !important;
          }
          .signup-modal-heading {
            font-size: 14px !important;
          }
          .signup-modal-code {
            font-size: 12px !important;
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
            className="signup-logo"
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
          <h1 id="signup-title" className="signup-title" style={{ margin: 0, fontSize: 40, fontFamily: 'DM Sans, sans-serif', fontWeight: 200 }}>Create account</h1>
          <p className="small-muted signup-subtitle" style={{ marginTop: 6, fontSize: 16, fontFamily: 'Work Sans, sans-serif', fontWeight: 300 }}>Set up your company profile in minutes.</p>

          <form onSubmit={submit} className="vstack signup-form-grid signup-form" style={{ display: 'grid', gap: 12, marginTop: 16, width: '100%' }}>
            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>First name
                <input className="bw-input signup-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Last name
                <input className="bw-input signup-input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
            </div>

            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <input className="bw-input signup-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
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
                  className="bw-input signup-input" 
                  type="tel"
                  placeholder="(555) 555-5555" 
                  value={phone} 
                  onChange={handlePhoneChange}
                  maxLength={14}
                  style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>Company
                <input className="bw-input signup-input" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
              </label>
            </div>

            <div className="signup-form-grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
              <label className="small-muted" style={{ position: 'relative', fontFamily: 'Work Sans, sans-serif' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Slug
                  <div 
                    style={{ position: 'relative', display: 'inline-block' }}
                    onMouseEnter={(e) => {
                      if (!showSlugInfo) {
                        e.currentTarget.setAttribute('data-hover', 'true')
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.removeAttribute('data-hover')
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSlugInfo(true)
                    }}
                  >
                    <Info 
                      size={14} 
                      style={{ 
                        cursor: 'pointer', 
                        color: 'var(--bw-muted)',
                        opacity: 0.7
                      }} 
                    />
                    <div 
                      className="slug-info-preview"
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '0',
                        marginBottom: '8px',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '6px',
                        color: 'var(--bw-text)',
                        fontSize: '12px',
                        zIndex: 1000,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        width: '320px',
                        textAlign: 'left',
                        pointerEvents: 'none',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Your slug creates unique branded URLs for your riders. Click to learn more about format requirements and how slugs work in the white-labeling system.
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '20px',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid var(--bw-border)'
                      }}></div>
                    </div>
                  </div>
                </span>
                <input 
                  className="bw-input signup-input" 
                  placeholder="my-company" 
                  value={slug} 
                  onChange={handleSlugChange}
                  style={{ 
                    padding: '16px 18px 16px 18px', 
                    borderRadius: 0, 
                    fontFamily: 'Work Sans, sans-serif',
                    borderColor: slugError ? '#ef4444' : undefined
                  }} 
                />
                {slugError && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#ef4444',
                    fontFamily: 'Work Sans, sans-serif'
                  }}>
                    {slugError}
                  </div>
                )}
              </label>
              <label className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif' }}>City
                <input className="bw-input signup-input" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
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

            {error && <div className="small-muted signup-error" style={{ color: '#ffb3b3', fontFamily: 'Work Sans, sans-serif' }}>{error}</div>}
            {message && <div className="small-muted signup-message" style={{ color: '#b3ffcb', fontFamily: 'Work Sans, sans-serif' }}>{message}</div>}

            <button className="bw-btn signup-button" type="submit" style={{ color: currentTheme === 'dark' ? '#000000' : '#ffffffff', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}>Create account</button>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <span className="small-muted signup-link-text" style={{ fontFamily: 'Work Sans, sans-serif' }}>Already have an account? </span>
              <Link 
                to="/tenant/login"
                className="signup-link-text"
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

      {/* Slug Info Modal */}
      {showSlugInfo && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setShowSlugInfo(false)}
        >
          <div 
            className="signup-modal"
            style={{
              backgroundColor: 'var(--bw-bg)',
              border: '1px solid var(--bw-border)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSlugInfo(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--bw-text)',
                padding: '4px 8px',
                borderRadius: '4px',
                lineHeight: 1
              }}
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="signup-modal-title" style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              color: 'var(--bw-text)'
            }}>
              About Slugs
            </h2>

            <div className="signup-modal-content" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              fontFamily: 'Work Sans, sans-serif',
              color: 'var(--bw-text)'
            }}>
              <div>
                <h3 className="signup-modal-heading" style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--bw-text)'
                }}>
                  What is a Slug?
                </h3>
                <p className="signup-modal-content" style={{
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--bw-text)',
                  opacity: 0.9
                }}>
                  A slug is a URL-friendly identifier that creates a unique path for your company's white-labeled pages. 
                  It's used to create tenant-specific URLs for your riders.
                </p>
              </div>

              <div>
                <h3 className="signup-modal-heading" style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--bw-text)'
                }}>
                  How It Works
                </h3>
                <p className="signup-modal-content" style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'var(--bw-text)',
                  opacity: 0.9
                }}>
                  Once you set your slug, your riders will access your branded pages through URLs like:
                </p>
                <div className="signup-modal-code" style={{
                  padding: '12px',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  border: '1px solid var(--bw-border)',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'var(--bw-accent)'
                }}>
                  <div style={{ marginBottom: '4px' }}>• <strong>Login:</strong> /{slug || 'your-slug'}/riders/login</div>
                  <div style={{ marginBottom: '4px' }}>• <strong>Registration:</strong> /{slug || 'your-slug'}/riders/register</div>
                  <div>• <strong>Dashboard:</strong> /{slug || 'your-slug'}/rider/dashboard</div>
                </div>
              </div>

              <div>
                <h3 className="signup-modal-heading" style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--bw-text)'
                }}>
                  Format Requirements
                </h3>
                <ul className="signup-modal-content" style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: 'var(--bw-text)',
                  opacity: 0.9
                }}>
                  <li>Use only lowercase letters, numbers, and hyphens</li>
                  <li>No spaces or special characters</li>
                  <li>Must start and end with a letter or number</li>
                  <li>Examples: <code style={{ backgroundColor: 'var(--bw-bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>my-company</code>, <code style={{ backgroundColor: 'var(--bw-bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>ridez123</code>, <code style={{ backgroundColor: 'var(--bw-bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>premium-transport</code></li>
                </ul>
              </div>

              <div className="signup-modal-content" style={{
                padding: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                fontSize: '13px',
                color: 'var(--bw-text)'
              }}>
                <strong>Note:</strong> Your slug must be unique. If the slug you choose is already taken, you'll need to select a different one.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [data-hover="true"] .slug-info-preview {
          opacity: 1 !important;
        }
      `}</style>
    </main>
  )
} 