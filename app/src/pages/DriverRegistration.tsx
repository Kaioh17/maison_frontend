import React, { useState, useEffect, useRef } from 'react'
import { Eye, EyeSlash, Envelope, Lock, User, Phone, ArrowRight, Car } from '@phosphor-icons/react'
import { registerDriver } from '@api/driver'
import { getVehicleCategoriesByTenant } from '@api/vehicles'
import type { VehicleCategoryResponse } from '@api/vehicles'
import { useAuthStore } from '@store/auth'
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import StateAutocomplete from '@components/StateAutocomplete'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import { getApiErrorMessage } from '@utils/apiError'
import {
  formatPasswordPolicySentence,
  getPasswordPolicyFailures,
  PASSWORD_POLICY_HINT,
} from '@utils/passwordPolicy'

export default function DriverRegistration() {
  useFavicon()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_no: '',
    state: '',
    postal_code: '',
    license_number: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      license_plate: '',
      color: '',
      vehicle_category: ''
    }
  })
  const [includeVehicle, setIncludeVehicle] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategoryResponse[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<string>('dark')
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { tenantInfo, isLoading: tenantLoading } = useTenantInfo()
  // Get token and tenant_id from navigation state first, fallback to URL params for backward compatibility
  const token = (location.state as { token?: string })?.token || searchParams.get('token') || ''
  const tenantId = (location.state as { tenantId?: number })?.tenantId || null
  
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

  // Check if token and tenant_id are present
  useEffect(() => {
    if (!token) {
      setError('Verification token is required. Please use the verification link provided.')
    } else if (!tenantId) {
      setError('Tenant ID is missing. Please verify your token again.')
    }
  }, [token, tenantId])

  // Fetch vehicle categories when tenantId is available
  useEffect(() => {
    const fetchCategories = async () => {
      if (tenantId) {
        try {
          setLoadingCategories(true)
          const response = await getVehicleCategoriesByTenant(tenantId)
          if (response.success && response.data) {
            setVehicleCategories(response.data)
          }
        } catch (err) {
          console.error('Failed to fetch vehicle categories:', err)
          // Don't show error to user, just log it
        } finally {
          setLoadingCategories(false)
        }
      }
    }

    fetchCategories()
  }, [tenantId])

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '')
    const phoneNumberDigits = phoneNumber.slice(0, 10)
    
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'phone_no') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) })
    } else if (name.startsWith('vehicle.')) {
      const vehicleField = name.split('.')[1]
      setFormData({
        ...formData,
        vehicle: {
          ...formData.vehicle,
          [vehicleField]: value
        }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const validateDriverStep1 = (): boolean => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Please enter your first and last name.')
      return false
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return false
    }
    const digits = formData.phone_no.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return false
    }
    if (!formData.password.trim()) {
      setError('Please choose a password.')
      return false
    }
    const pwdFailures = getPasswordPolicyFailures(formData.password)
    if (pwdFailures.length > 0) {
      setError(formatPasswordPolicySentence(pwdFailures))
      return false
    }
    return true
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      setError('')
      if (!validateDriverStep1()) return
      setStep(2)
      return
    }

    if (!token) {
      setError('Verification token is required. Please use the verification link provided.')
      return
    }

    if (!tenantId) {
      setError('Tenant ID is missing. Please verify your token again.')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      // Format phone number - add +1 prefix if not present and format properly
      let phoneFormatted = formData.phone_no.trim()
      // If phone doesn't start with +, add +1 prefix for US numbers
      if (phoneFormatted && !phoneFormatted.startsWith('+')) {
        const digits = phoneFormatted.replace(/\D/g, '')
        if (digits.length === 10) {
          // Format as +1 (XXX) XXX-XXXX
          phoneFormatted = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
        } else {
          // Keep existing format if it doesn't match expected length
          phoneFormatted = formData.phone_no.trim()
        }
      }
      
      const payload: any = {
        email: formData.email.trim(),
        phone_no: phoneFormatted,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        password: formData.password
      }

      // Add optional fields only if they have values (don't send empty strings)
      if (formData.state && formData.state.trim()) {
        payload.state = formData.state.trim()
      }
      if (formData.postal_code && formData.postal_code.trim()) {
        payload.postal_code = formData.postal_code.trim()
      }
      if (formData.license_number && formData.license_number.trim()) {
        payload.license_number = formData.license_number.trim()
      }

      // Include vehicle if user wants to add it, otherwise set to null
      if (includeVehicle && formData.vehicle.make && formData.vehicle.model) {
        const vehicle: any = {
          make: formData.vehicle.make.trim(),
          model: formData.vehicle.model.trim(),
          status: 'available',
          seating_capacity: 4, // Default value, can be updated if form field is added
          vehicle_category: (formData.vehicle.vehicle_category && formData.vehicle.vehicle_category.trim()) || 'Standard' // Use selected category or default
        }
        
        // Year is required when vehicle is provided
        if (formData.vehicle.year && formData.vehicle.year.trim()) {
          const year = parseInt(formData.vehicle.year)
          if (!isNaN(year)) {
            vehicle.year = year
          } else {
            vehicle.year = new Date().getFullYear() // Default to current year if invalid
          }
        } else {
          vehicle.year = new Date().getFullYear() // Default to current year if not provided
        }
        
        if (formData.vehicle.license_plate && formData.vehicle.license_plate.trim()) {
          vehicle.license_plate = formData.vehicle.license_plate.trim()
        }
        if (formData.vehicle.color && formData.vehicle.color.trim()) {
          vehicle.color = formData.vehicle.color.trim()
        }
        
        payload.vehicle = vehicle
      } else {
        payload.vehicle = null
      }

      console.log('Sending registration payload:', JSON.stringify(payload, null, 2))
      await registerDriver(payload, tenantId)

      // Redirect to login page after successful registration
      navigate('/driver/login', { replace: true })
    } catch (err: unknown) {
      console.error('Registration error:', err)
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
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
  const driverPasswordFailures = getPasswordPolicyFailures(formData.password)
  const driverEmailFormatError = getEmailFormatError(formData.email)

  return (
    <main className="bw" aria-label="Driver Registration" style={{ margin: 0, padding: 0, minHeight: '100vh', overflow: 'auto' }}>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        {/* Left side - Image (60%) */}
        <div 
          ref={imageContainerRef}
          className="driver-registration-image-container"
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
          {/* Tint: Maison page background at ~60% opacity (matches login/signup) */}
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
              Join {companyName}'s team of drivers. Create your account to start accepting rides and managing your driver profile.
            </p>
          </div>
        </div>

        {/* Right side - Registration Form (40%) */}
        <div 
          role="form" 
          aria-labelledby="registration-title"
          className="driver-registration-form-container"
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
              {tenantInfo ? `Sign up to drive for ${companyName}` : 'Sign up to get started'}
            </p>
            <p
              className="small-muted"
              aria-live="polite"
              style={{ marginTop: 8, fontSize: 13, fontFamily: 'Work Sans, sans-serif', fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.45 }}
            >
              Step {step} of 2 — {step === 1 ? 'Account' : 'License & vehicle'}.{' '}
              {step === 1
                ? 'You are entering your driver account details.'
                : 'You are adding license and vehicle information.'}
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

            <form onSubmit={handleFormSubmit} style={{ marginTop: 16, width: '100%' }}>
              <div style={{ display: step === 1 ? 'block' : 'none' }} aria-hidden={step !== 1}>
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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
                    required 
                    className="bw-input" 
                    style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                    placeholder="Doe" 
                    value={formData.last_name}
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="small-muted" htmlFor="email" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email</label>
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <Envelope size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    autoComplete="email"
                    required 
                    className="bw-input" 
                    aria-invalid={formData.email.length > 0 && !!driverEmailFormatError}
                    style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                    placeholder="you@email.com" 
                    value={formData.email}
                    onChange={handleInputChange} 
                  />
                </div>
                <p className="small-muted" style={{ marginTop: 8, marginBottom: 0, fontSize: 12, fontFamily: 'Work Sans, sans-serif' }}>
                  {EMAIL_FORMAT_HINT}
                </p>
                {driverEmailFormatError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontFamily: 'Work Sans, sans-serif',
                      color: 'var(--bw-error)',
                    }}
                  >
                    {driverEmailFormatError}
                  </div>
                )}
              </div>

              <label className="small-muted" htmlFor="phone_no" style={{ fontFamily: 'Work Sans, sans-serif' }}>Phone number</label>
              <div style={{ position: 'relative', marginTop: 6, marginBottom: 12 }}>
                <Phone size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                <input 
                  id="phone_no" 
                  name="phone_no" 
                  type="tel" 
                  autoComplete="tel"
                  required 
                  className="bw-input" 
                  style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="(555) 555-5555" 
                  value={formData.phone_no}
                  onChange={handleInputChange}
                  maxLength={14}
                />
              </div>

              <label className="small-muted" htmlFor="password" style={{ fontFamily: 'Work Sans, sans-serif' }}>Password</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <Lock size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="new-password"
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
              <p className="small-muted" style={{ marginTop: 8, marginBottom: 0, fontSize: 12, fontFamily: 'Work Sans, sans-serif' }}>
                {PASSWORD_POLICY_HINT}
              </p>
              {formData.password.length > 0 && driverPasswordFailures.length > 0 && (
                <div
                  role="alert"
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    fontFamily: 'Work Sans, sans-serif',
                    color: 'var(--bw-error)',
                  }}
                >
                  {formatPasswordPolicySentence(driverPasswordFailures)}
                </div>
              )}

              <button 
                className="bw-btn" 
                style={{ width: '100%', marginTop: 16, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }} 
                disabled={isLoading}
                type="submit"
              >
                <span>Continue</span>
                <ArrowRight size={16} aria-hidden />
              </button>
              </div>

              <div style={{ display: step === 2 ? 'block' : 'none' }} aria-hidden={step !== 2}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <label className="small-muted" htmlFor="state" style={{ fontFamily: 'Work Sans, sans-serif' }}>State</label>
                <label className="small-muted" htmlFor="postal_code" style={{ fontFamily: 'Work Sans, sans-serif' }}>Postal code</label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <StateAutocomplete
                  value={formData.state}
                  onChange={(value) => setFormData({ ...formData, state: value })}
                  placeholder="NY"
                  className="bw-input"
                  style={{ padding: '16px 18px', borderRadius: 0 }}
                />
                <input 
                  id="postal_code" 
                  name="postal_code" 
                  type="text" 
                  className="bw-input" 
                  style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="10001" 
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  maxLength={5}
                />
              </div>

              <label className="small-muted" htmlFor="license_number" style={{ fontFamily: 'Work Sans, sans-serif' }}>License number</label>
              <div style={{ position: 'relative', marginTop: 6, marginBottom: 12 }}>
                <input 
                  id="license_number" 
                  name="license_number" 
                  type="text" 
                  className="bw-input" 
                  style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                  placeholder="License number" 
                  value={formData.license_number}
                  onChange={handleInputChange}
                  maxLength={12}
                />
              </div>

              {/* Vehicle Section - Only if outsourced */}
              <div style={{ 
                marginTop: 24, 
                marginBottom: 12, 
                padding: '16px', 
                border: '1px solid var(--bw-border)', 
                borderRadius: '8px',
                backgroundColor: 'var(--bw-bg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    id="includeVehicle"
                    checked={includeVehicle}
                    onChange={(e) => setIncludeVehicle(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="includeVehicle" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: '14px', 
                    color: 'var(--bw-text)',
                    cursor: 'pointer'
                  }}>
                    I have a vehicle to add (outsourced driver)
                  </label>
                </div>
                {includeVehicle && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ 
                      fontSize: '12px', 
                      color: 'var(--bw-text)', 
                      opacity: 0.7, 
                      marginBottom: 12,
                      fontFamily: 'Work Sans, sans-serif'
                    }}>
                      If you have a vehicle you want to add, please contact {companyName} to add it to your account.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <label className="small-muted" htmlFor="vehicle.make" style={{ fontFamily: 'Work Sans, sans-serif' }}>Make</label>
                      <label className="small-muted" htmlFor="vehicle.model" style={{ fontFamily: 'Work Sans, sans-serif' }}>Model</label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div style={{ position: 'relative' }}>
                        <Car size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                        <input 
                          id="vehicle.make" 
                          name="vehicle.make" 
                          type="text" 
                          className="bw-input" 
                          style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                          placeholder="Toyota" 
                          value={formData.vehicle.make}
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Car size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: .7, color: currentTheme === 'dark' ? '#ffffff' : undefined }} />
                        <input 
                          id="vehicle.model" 
                          name="vehicle.model" 
                          type="text" 
                          className="bw-input" 
                          style={{ padding: '16px 18px 16px 44px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }} 
                          placeholder="Camry" 
                          value={formData.vehicle.model}
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label className="small-muted" htmlFor="vehicle.year" style={{ fontFamily: 'Work Sans, sans-serif' }}>Year</label>
                        <input 
                          id="vehicle.year" 
                          name="vehicle.year" 
                          type="number" 
                          className="bw-input" 
                          style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', marginTop: 6 }} 
                          placeholder="2020" 
                          value={formData.vehicle.year}
                          onChange={handleInputChange}
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <label className="small-muted" htmlFor="vehicle.license_plate" style={{ fontFamily: 'Work Sans, sans-serif' }}>License Plate</label>
                        <input 
                          id="vehicle.license_plate" 
                          name="vehicle.license_plate" 
                          type="text" 
                          className="bw-input" 
                          style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', marginTop: 6 }} 
                          placeholder="ABC123" 
                          value={formData.vehicle.license_plate}
                          onChange={handleInputChange}
                          maxLength={8}
                        />
                      </div>
                      <div>
                        <label className="small-muted" htmlFor="vehicle.color" style={{ fontFamily: 'Work Sans, sans-serif' }}>Color</label>
                        <input 
                          id="vehicle.color" 
                          name="vehicle.color" 
                          type="text" 
                          className="bw-input" 
                          style={{ padding: '16px 18px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', marginTop: 6 }} 
                          placeholder="Black" 
                          value={formData.vehicle.color}
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label className="small-muted" htmlFor="vehicle.vehicle_category" style={{ fontFamily: 'Work Sans, sans-serif' }}>Vehicle Category</label>
                      <select
                        id="vehicle.vehicle_category"
                        name="vehicle.vehicle_category"
                        className="bw-input"
                        style={{ 
                          padding: '16px 18px', 
                          borderRadius: 0, 
                          fontFamily: 'Work Sans, sans-serif', 
                          marginTop: 6,
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        value={formData.vehicle.vehicle_category}
                        onChange={handleInputChange}
                        disabled={loadingCategories}
                      >
                        <option value="">Select vehicle category</option>
                        {vehicleCategories.map((category) => (
                          <option key={category.id} value={category.vehicle_category}>
                            {category.vehicle_category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button 
                  type="button"
                  className="bw-btn"
                  style={{ flex: 1, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500, background: 'transparent', border: '1px solid var(--bw-border)', color: 'var(--bw-text)' }}
                  disabled={isLoading}
                  onClick={() => { setError(''); setStep(1) }}
                >
                  Back
                </button>
                <button 
                  className="bw-btn" 
                  style={{ flex: 2, borderRadius: 0, padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }} 
                  disabled={isLoading || !token}
                  type="submit"
                >
                  <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
                  {!isLoading && <ArrowRight size={16} aria-hidden />}
                </button>
              </div>
              </div>

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
                  <Link to="/driver/login" style={{ color: 'var(--bw-fg)', textDecoration: 'underline' }}>
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
          .driver-registration-image-container {
            display: none !important;
          }
          .driver-registration-form-container {
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  )
}

