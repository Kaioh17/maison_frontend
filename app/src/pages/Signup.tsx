import { FormEvent, useState, useEffect, useRef } from 'react'
import { Info, Eye, EyeOff } from 'lucide-react'
import { createTenant } from '@api/tenant'
import { loginTenant } from '@api/auth'
import { createCheckoutSession } from '@api/subscription'
import { useAuthStore } from '@store/auth'
import { Link } from 'react-router-dom'
import { getStripeSubscriptionPriceId } from '@config'
import { MAIN_DOMAIN, getTenantAppUrl } from '@config/host'
import type { LandingPricingPlanDisplay } from '@data/landingPricingPlans'
import { getApiErrorMessage } from '@utils/apiError'
import SignupPlanSelection from '@components/SignupPlanSelection'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import {
  formatPasswordPolicySentence,
  getPasswordPolicyFailures,
  isPasswordPolicyValid,
  PASSWORD_POLICY_HINT,
} from '@utils/passwordPolicy'
import MaisonWordmark from '@components/MaisonWordmark'

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
  const [currentTheme, setCurrentTheme] = useState<string>('dark')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1)
  const [isMobileSignup, setIsMobileSignup] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [planCheckoutLoading, setPlanCheckoutLoading] = useState<string | null>(null)
  const [planCheckoutError, setPlanCheckoutError] = useState<string | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobileSignup(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const canContinueStep1 = isValidEmail(email) && isPasswordPolicyValid(password)
  const emailFormatError = getEmailFormatError(email)
  const passwordPolicyFailures = getPasswordPolicyFailures(password)

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
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsCreatingAccount(true)
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
      const data = await loginTenant(email, password)
      useAuthStore.getState().login({ token: data.access_token })
      setSignupStep(3)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create account'))
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleSelectPlan = async (plan: LandingPricingPlanDisplay) => {
    setPlanCheckoutLoading(plan.product_type)
    setPlanCheckoutError(null)
    try {
      const response = await createCheckoutSession({
        price_id: getStripeSubscriptionPriceId(plan.product_type),
        product_type: plan.product_type,
      })
      if (response.success && response.data.Checkout_session_url) {
        window.location.href = response.data.Checkout_session_url
      } else {
        setPlanCheckoutError(response.error || 'Failed to create checkout session')
        setPlanCheckoutLoading(null)
      }
    } catch (err: unknown) {
      setPlanCheckoutError(getApiErrorMessage(err, 'Failed to create checkout session'))
      setPlanCheckoutLoading(null)
    }
  }

  const handleFormSubmit = (e: FormEvent) => {
    if (signupStep === 1) {
      e.preventDefault()
      if (canContinueStep1) setSignupStep(2)
      return
    }
    if (signupStep === 2) {
      void submit(e)
      return
    }
    e.preventDefault()
  }

  return (
    <main
      className="bw"
      aria-label="Create account"
      style={{ margin: 0, padding: 0, height: '100vh', overflow: signupStep === 3 ? 'auto' : 'hidden' }}
    >
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
            font-size: 30px !important;
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
          .signup-current-step-hint {
            font-size: 13px !important;
            margin-top: 8px !important;
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
          .signup-mobile-progress-wrap {
            width: 100%;
            flex-shrink: 0;
            margin: 0 -24px 0 -24px;
            padding: 8px 24px 12px;
            box-sizing: border-box;
            background: var(--bw-bg);
          }
          .signup-mobile-logo-flow {
            position: static !important;
            top: auto !important;
            left: auto !important;
            margin-bottom: 1.5rem !important;
          }
          .signup-mobile-form-container-inner {
            align-items: stretch !important;
            justify-content: flex-start !important;
            padding-top: 0 !important;
          }
          .signup-mobile-logo-dropzone {
            border: 1px dashed var(--bw-border-strong);
            border-radius: 0;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            font-family: 'Work Sans', sans-serif;
            font-size: 14px;
            color: var(--bw-muted);
            background: transparent;
          }
          .signup-mobile-logo-dropzone:focus-visible {
            outline: 2px solid var(--bw-focus);
            outline-offset: 2px;
          }
          .signup-main-container--plan-step .signup-mobile-progress-wrap {
            background: transparent !important;
          }
          .signup-form-container--plan-step .signup-mobile-step-label {
            color: rgba(255, 255, 255, 0.88);
          }
          .signup-form-container--plan-step .signup-mobile-progress-track {
            background: rgba(255, 255, 255, 0.12);
          }
        }
      `}</style>
      <div
        className={`signup-main-container${signupStep === 3 ? ' signup-main-container--plan-step' : ''}`}
        style={{ display: 'flex', height: '100vh', width: '100%', minHeight: signupStep === 3 ? '100vh' : undefined }}
      >
        {/* Left side - Image (65%) */}
        <div 
          ref={imageContainerRef}
          className="signup-image-container"
          style={{ 
            display: signupStep === 3 ? 'none' : 'flex',
            width: '65%', 
            height: '100%', 
            position: 'relative',
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundColor: backgroundImage ? 'transparent' : '#f3f4f6',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'background-image 0.3s ease',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px'
          }} 
        >
          {/* Tint: same as login — Maison page background at ~60% opacity */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'color-mix(in srgb, var(--bw-bg) 58%, transparent)',
              zIndex: 1,
            }}
          />
          <div style={{
            color: 'white',
            textAlign: 'center',
            maxWidth: '600px',
            zIndex: 2,
            position: 'relative',
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

        {/* Right side — signup form (35%) or full viewport for plan step */}
        <div 
          role={signupStep === 3 ? 'region' : 'form'}
          aria-labelledby="signup-title"
          className={`signup-form-container${isMobileSignup ? ' signup-mobile-form-container-inner' : ''}${signupStep === 3 ? ' signup-form-container--plan-step' : ''}`}
          style={{ 
            width: signupStep === 3 ? '100%' : '35%', 
            height: '100%', 
            minHeight: signupStep === 3 ? '100vh' : undefined,
            flex: signupStep === 3 ? '1 1 auto' : undefined,
            position: 'relative',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'stretch', 
            justifyContent: signupStep === 3 ? 'flex-start' : isMobileSignup ? 'flex-start' : 'center',
            padding: signupStep === 3 ? 'clamp(24px, 4vw, 48px) clamp(20px, 4vw, 40px)' : '24px',
            paddingTop: signupStep === 3 ? 'clamp(72px, 10vw, 88px)' : undefined,
            backgroundColor: signupStep === 3 ? undefined : 'var(--bw-bg)',
            background: signupStep === 3
              ? 'linear-gradient(to bottom, #0a0a0f 0%, rgb(17 24 39) 50%, #0a0a0f 100%)'
              : undefined,
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}
        >
          {!isMobileSignup && (
            <div
              className="signup-logo"
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
          )}
          <div
            style={{
              width: '100%',
              maxWidth: signupStep === 3 ? 1280 : undefined,
              marginLeft: signupStep === 3 ? 'auto' : undefined,
              marginRight: signupStep === 3 ? 'auto' : undefined,
              display: 'flex',
              flexDirection: 'column',
              flex: signupStep === 3 ? 1 : undefined,
              minHeight: signupStep === 3 ? 0 : undefined,
              alignItems: signupStep === 3 ? 'stretch' : 'center',
            }}
          >
          <div className="signup-mobile-progress-wrap" aria-hidden>
            <div className="signup-mobile-progress-row">
              <div className="signup-mobile-progress-track">
                <div
                  className="signup-mobile-progress-fill"
                  style={{ width: `${(signupStep / 3) * 100}%` }}
                />
              </div>
              <span className="signup-mobile-step-label">
                Step {signupStep} of 3
              </span>
            </div>
          </div>
          {isMobileSignup && (
            <div
              className="signup-logo signup-mobile-logo-flow"
              style={{
                fontSize: 36,
                lineHeight: 1,
                alignSelf: 'flex-start',
              }}
            >
              <MaisonWordmark />
            </div>
          )}
          <h1
            id="signup-title"
            className="signup-title"
            style={{
              margin: 0,
              fontSize: 40,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 200,
              alignSelf: isMobileSignup ? 'flex-start' : 'center',
              width: '100%',
              textAlign: isMobileSignup ? 'left' : 'center',
              color: signupStep === 3 ? '#ffffff' : undefined,
            }}
          >
            {signupStep === 3 ? 'Choose your plan' : 'Create account'}
          </h1>
          <p
            className="small-muted signup-subtitle"
            style={{
              marginTop: 6,
              fontSize: 16,
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 300,
              alignSelf: isMobileSignup ? 'flex-start' : 'center',
              width: '100%',
              textAlign: isMobileSignup ? 'left' : 'center',
              color: signupStep === 3 ? '#94a3b8' : undefined,
            }}
          >
            {signupStep === 3
              ? 'Fair, transparent pricing — same plans as on our homepage.'
              : 'Set up your company profile in minutes.'}
          </p>
          <p
            className="small-muted signup-current-step-hint"
            aria-live="polite"
            style={{
              marginTop: 10,
              fontSize: 14,
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 400,
              lineHeight: 1.45,
              alignSelf: isMobileSignup ? 'flex-start' : 'center',
              width: '100%',
              textAlign: isMobileSignup ? 'left' : 'center',
              color: signupStep === 3 ? '#64748b' : undefined,
            }}
          >
            {signupStep === 1
              ? 'Step 1 of 3 — You are entering your name, email, and password.'
              : signupStep === 2
                ? `Step 2 of 3 — Add your company name, subdomain (your-company.${MAIN_DOMAIN}), city, and optional logo.`
                : 'Step 3 of 3 — Pick a subscription plan. You can change it later from settings.'}
          </p>

          {signupStep === 3 ? (
            <div
              className="signup-plan-step landing-pricing"
              style={{
                width: '100%',
                marginTop: 16,
                flex: isMobileSignup ? 1 : undefined,
                minHeight: 0,
                overflowY: 'auto',
              }}
            >
              {planCheckoutError && (
                <div
                  role="alert"
                  className="small-muted signup-error"
                  style={{
                    color: '#ffb3b3',
                    fontFamily: 'Work Sans, sans-serif',
                    marginBottom: 12,
                  }}
                >
                  {planCheckoutError}
                </div>
              )}
              <SignupPlanSelection
                onSelectPlan={handleSelectPlan}
                loadingProductType={planCheckoutLoading}
                disabled={planCheckoutLoading !== null}
              />
            </div>
          ) : null}

          {signupStep < 3 ? (
          <form
            onSubmit={handleFormSubmit}
            className="vstack signup-form-grid signup-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 16,
              width: '100%',
              ...(isMobileSignup ? { flex: 1, minHeight: 0 } : {}),
            }}
          >
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'flex',
                  width: '200%',
                  transform: signupStep === 1 ? 'translateX(0%)' : 'translateX(-50%)',
                  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{ width: '50%', flexShrink: 0, boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <label className="small-muted signup-label" style={{ fontFamily: 'Work Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ marginBottom: 6 }}>First name</span>
                        <input className="bw-input signup-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
                      </label>
                      <label className="small-muted signup-label" style={{ fontFamily: 'Work Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ marginBottom: 6 }}>Last name</span>
                        <input className="bw-input signup-input" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
                      </label>
                    </div>
                    <label className="small-muted signup-label" style={{ fontFamily: 'Work Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ marginBottom: 6 }}>Email</span>
                      <input
                        className="bw-input signup-input"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={email.length > 0 && !!emailFormatError}
                        style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                      />
                      <span
                        className="small-muted"
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          fontFamily: 'Work Sans, sans-serif',
                          opacity: 0.85,
                        }}
                      >
                        {EMAIL_FORMAT_HINT}
                      </span>
                      {emailFormatError && (
                        <div
                          role="alert"
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            fontFamily: 'Work Sans, sans-serif',
                            color: '#ffb3b3',
                          }}
                        >
                          {emailFormatError}
                        </div>
                      )}
                    </label>
                    <label className="small-muted signup-label" style={{ fontFamily: 'Work Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ marginBottom: 6 }}>Password</span>
                      <div style={{ position: 'relative' }}>
                        <input 
                          className="bw-input signup-input signup-input-password" 
                          type={showPassword ? 'text' : 'password'} 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          style={{ padding: '16px 18px 16px 18px', paddingRight: '44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                        />
                        <button 
                          type="button" 
                          aria-label="Toggle password" 
                          className="signup-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)} 
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#4c4e4eff', cursor: 'pointer' }}
                        >
                          {showPassword ? <EyeOff className="signup-toggle-icon" size={16} /> : <Eye className="signup-toggle-icon" size={16} />}
                        </button>
                      </div>
                      <span
                        className="small-muted"
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          fontFamily: 'Work Sans, sans-serif',
                          opacity: 0.85,
                        }}
                      >
                        {PASSWORD_POLICY_HINT}
                      </span>
                      {password.length > 0 && passwordPolicyFailures.length > 0 && (
                        <div
                          role="alert"
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            fontFamily: 'Work Sans, sans-serif',
                            color: '#ffb3b3',
                          }}
                        >
                          {formatPasswordPolicySentence(passwordPolicyFailures)}
                        </div>
                      )}
                    </label>
                    <button
                      type="button"
                      className="bw-btn signup-button"
                      disabled={!canContinueStep1}
                      onClick={() => {
                        if (canContinueStep1) setSignupStep(2)
                      }}
                      style={{ color: currentTheme === 'dark' ? '#000000' : '#ffffffff', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
                <div style={{ width: '50%', flexShrink: 0, boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                    <label className="small-muted signup-label" style={{ fontFamily: 'Work Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ marginBottom: 6 }}>Company</span>
                      <input className="bw-input signup-input" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
                    </label>
                    <div style={{ fontFamily: 'Work Sans, sans-serif' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 6 }} className="small-muted">
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
                              width: '280px',
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
                            Your slug becomes your subdomain (for example, my-company.{MAIN_DOMAIN}) and branded URLs for your riders. Click to learn more about format requirements and how slugs work in the white-labeling system.
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
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                        }}
                      >
                        <input 
                          className="bw-input signup-input" 
                          placeholder="my-company" 
                          value={slug} 
                          onChange={handleSlugChange}
                          aria-label={`Subdomain before .${MAIN_DOMAIN}`}
                          style={{ 
                            flex: 1,
                            minWidth: 0,
                            padding: '16px 18px',
                            borderRadius: 0, 
                            fontFamily: 'Work Sans, sans-serif',
                            borderColor: slugError ? '#ef4444' : undefined
                          }} 
                        />
                        <span
                          style={{
                            color: 'var(--bw-muted)',
                            fontFamily: 'Work Sans, sans-serif',
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          .{MAIN_DOMAIN}
                        </span>
                      </div>
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
                    </div>
                    <label className="small-muted signup-label" style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Work Sans, sans-serif' }}>
                      <span style={{ marginBottom: 6 }}>Phone</span>
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
                    <label className="small-muted signup-label" style={{ fontFamily: 'Work Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ marginBottom: 6 }}>City</span>
                      <input className="bw-input signup-input" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '16px 18px 16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} />
                    </label>
                    <div className="bw-form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="small-muted signup-label" style={{ marginBottom: 6, fontFamily: 'Work Sans, sans-serif', display: 'block' }}>Company Logo (optional)</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                        id="logo-upload"
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        className="signup-mobile-logo-dropzone"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            document.getElementById('logo-upload')?.click()
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'copy'
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const f = e.dataTransfer.files?.[0]
                          if (f?.type.startsWith('image/')) {
                            setLogoFile(f)
                            const reader = new FileReader()
                            reader.onload = (ev) => {
                              setLogoPreview(ev.target?.result as string)
                            }
                            reader.readAsDataURL(f)
                          }
                        }}
                      >
                        {logoFile ? 'Drop a new image or tap to change' : 'Drop logo here or tap to upload'}
                      </div>
                      {logoFile && (
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
                            Remove
                          </a>
                        </div>
                      )}
                      {logoPreview && (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
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
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                      <button
                        type="button"
                        className="bw-btn-outline signup-button"
                        onClick={() => setSignupStep(1)}
                        style={{ flex: 1, borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}
                      >
                        ← Back
                      </button>
                      <button
                        className="bw-btn signup-button"
                        type="submit"
                        disabled={isCreatingAccount}
                        style={{ flex: 1, color: currentTheme === 'dark' ? '#000000' : '#ffffffff', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}
                      >
                        {isCreatingAccount ? 'Creating account…' : 'Create account'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="small-muted signup-error" style={{ color: '#ffb3b3', fontFamily: 'Work Sans, sans-serif' }}>{error}</div>}
            {message && <div className="small-muted signup-message" style={{ color: '#b3ffcb', fontFamily: 'Work Sans, sans-serif' }}>{message}</div>}

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
          ) : null}
          </div>
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
              fontWeight: 500,
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
                  fontWeight: 500,
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
                  A slug is a URL-friendly label that becomes your company&apos;s subdomain. For example,{' '}
                  <code style={{ backgroundColor: 'var(--bw-bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>
                    acme.{MAIN_DOMAIN}
                  </code>
                  . Riders open that hostname to reach your branded pages.
                </p>
              </div>

              <div>
                <h3 className="signup-modal-heading" style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 500,
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
                  Once you set your slug, your riders will use full URLs on your subdomain, for example:
                </p>
                <div className="signup-modal-code" style={{
                  padding: '12px',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  border: '1px solid var(--bw-border)',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'var(--bw-accent)',
                  wordBreak: 'break-all',
                }}>
                  <div style={{ marginBottom: '4px' }}>• <strong>Login:</strong> {getTenantAppUrl(slug.trim() || 'your-slug', '/riders/login')}</div>
                  <div style={{ marginBottom: '4px' }}>• <strong>Registration:</strong> {getTenantAppUrl(slug.trim() || 'your-slug', '/riders/register')}</div>
                  <div>• <strong>Dashboard:</strong> {getTenantAppUrl(slug.trim() || 'your-slug', '/rider/dashboard')}</div>
                </div>
              </div>

              <div>
                <h3 className="signup-modal-heading" style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 500,
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