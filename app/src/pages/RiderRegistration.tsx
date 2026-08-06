import React, { useState, useEffect } from 'react'
import { Eye, EyeSlash, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { createUser } from '@api/user'
import { loginRider } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import CountryAutocomplete from '@components/CountryAutocomplete'
import StateAutocomplete from '@components/StateAutocomplete'
import CityAutocomplete from '@components/CityAutocomplete'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import { getApiErrorMessage } from '@utils/apiError'
import {
  formatPasswordPolicySentence,
  getPasswordPolicyFailures,
  PASSWORD_POLICY_HINT,
} from '@utils/passwordPolicy'
import {
  resolveRiderAuthPalette,
  type RiderAuthPalette,
} from '@utils/riderAuthPalette'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'

const DESKTOP_BREAKPOINT = '(min-width: 768px)'
const FONT_STACK =
  'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

// Override CSS theme variables so autocomplete dropdowns and any descendant
// using --bw-* tokens render against the rider-auth palette regardless of the
// user's globally saved theme.
function buildScopedThemeVars(p: RiderAuthPalette): React.CSSProperties {
  return {
    ['--bw-bg' as string]: p.bg,
    ['--bw-fg' as string]: p.text,
    ['--bw-text' as string]: p.text,
    ['--bw-muted' as string]: p.muted,
    ['--bw-border' as string]: p.inputBorder,
    ['--bw-border-strong' as string]: p.inputBorder,
    ['--bw-focus' as string]: p.brand,
  }
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [query])

  return matches
}

// Subtle road-geometry SVG decor — same as RiderLogin for visual continuity.
function BackgroundDecor({ palette }: { palette: RiderAuthPalette }) {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140%',
          height: '65%',
          background: `radial-gradient(ellipse at center, ${palette.brandTint} 0%, transparent 68%)`,
        }}
      />
      <svg
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.055,
        }}
      >
        <circle cx="400" cy="640" r="310" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="400" cy="640" r="450" fill="none" stroke="white" strokeWidth="0.8" />
        <circle cx="400" cy="640" r="590" fill="none" stroke="white" strokeWidth="0.6" />
        <circle cx="400" cy="640" r="730" fill="none" stroke="white" strokeWidth="0.5" />
        <line x1="160" y1="0" x2="160" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="320" y1="0" x2="320" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="480" y1="0" x2="480" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="640" y1="0" x2="640" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="0" y1="300" x2="400" y2="640" stroke="white" strokeWidth="0.6" opacity="0.35" />
        <line x1="800" y1="300" x2="400" y2="640" stroke="white" strokeWidth="0.6" opacity="0.35" />
      </svg>
    </div>
  )
}

interface BrandMarkProps {
  companyName: string
  logoUrl?: string | null
  variant: 'desktop' | 'mobile'
  palette: RiderAuthPalette
}

function BrandMark({ companyName, logoUrl, variant, palette }: BrandMarkProps) {
  if (variant === 'desktop') {
    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={companyName}
          width={180}
          height={44}
          loading="eager"
          decoding="async"
          style={{
            display: 'block',
            margin: '0 auto',
            maxHeight: 44,
            maxWidth: 220,
            objectFit: 'contain',
          }}
        />
      )
    }
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          color: palette.text,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontFamily: FONT_STACK,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 9,
            height: 9,
            borderRadius: 9999,
            background: palette.brand,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span>{companyName}</span>
      </div>
    )
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        width={64}
        height={64}
        loading="eager"
        decoding="async"
        style={{
          display: 'block',
          maxWidth: 64,
          maxHeight: 64,
          objectFit: 'contain',
        }}
      />
    )
  }

  return (
    <span
      style={{
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: palette.text,
        fontFamily: FONT_STACK,
      }}
    >
      {companyName}
    </span>
  )
}

interface PrimaryButtonProps {
  isLoading: boolean
  label: string
  loadingLabel: string
  flex?: number
  palette: RiderAuthPalette
}

function PrimaryButton({ isLoading, label, loadingLabel, flex, palette }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      style={{
        flex,
        width: flex ? undefined : '100%',
        background: palette.brand,
        color: palette.buttonText,
        border: 0,
        borderRadius: 8,
        padding: '13px 16px',
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: '0.02em',
        fontFamily: FONT_STACK,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isLoading) e.currentTarget.style.background = palette.brandHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = palette.brand
      }}
    >
      <span>{isLoading ? loadingLabel : label}</span>
      {!isLoading && <ArrowRight size={16} aria-hidden weight="bold" />}
    </button>
  )
}

interface GhostButtonProps {
  onClick: () => void
  disabled?: boolean
  label: string
  flex?: number
  withBackArrow?: boolean
  palette: RiderAuthPalette
}

function GhostButton({ onClick, disabled, label, flex, withBackArrow, palette }: GhostButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex,
        width: flex ? undefined : '100%',
        background: 'transparent',
        color: palette.text,
        border: `1px solid ${palette.inputBorder}`,
        borderRadius: 8,
        padding: '13px 16px',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: FONT_STACK,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {withBackArrow && <ArrowLeft size={16} aria-hidden weight="bold" />}
      <span>{label}</span>
    </button>
  )
}

interface ErrorBannerProps {
  message: string
  palette: RiderAuthPalette
}

function ErrorBanner({ message, palette }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      style={{
        marginTop: 16,
        padding: '10px 12px',
        background: palette.errorBg,
        border: `1px solid ${palette.errorBorder}`,
        borderRadius: 8,
        color: palette.error,
        fontSize: 13,
        fontFamily: FONT_STACK,
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  )
}

interface FloatingFieldProps {
  id: string
  name: string
  label: string
  type?: string
  autoComplete?: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  adornment?: React.ReactNode
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number
  palette: RiderAuthPalette
  ['aria-invalid']?: boolean
}

function FloatingField({
  id,
  name,
  label,
  type = 'text',
  autoComplete,
  required,
  placeholder,
  value,
  onChange,
  adornment,
  inputMode,
  maxLength,
  palette,
  ...rest
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      style={{
        background: palette.inputBg,
        border: `1px solid ${focused ? palette.brand : palette.inputBorder}`,
        borderRadius: 8,
        padding: '8px 12px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: focused
          ? `inset 0 1px 3px rgba(0,0,0,0.2), 0 0 0 2px ${palette.brandTint}`
          : 'inset 0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      <label htmlFor={id} style={{ flex: 1, display: 'block', cursor: 'text' }}>
        <span
          style={{
            display: 'block',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: palette.labelMuted,
            fontFamily: FONT_STACK,
            marginBottom: 2,
          }}
        >
          {label}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 0,
            outline: 'none',
            color: palette.text,
            fontSize: 14,
            fontFamily: FONT_STACK,
            padding: 0,
          }}
          {...rest}
        />
      </label>
      {adornment}
    </div>
  )
}

interface DesktopFieldProps {
  id: string
  name: string
  label: string
  type?: string
  autoComplete?: string
  required?: boolean
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  adornment?: React.ReactNode
  maxLength?: number
  palette: RiderAuthPalette
  ['aria-invalid']?: boolean
}

function DesktopField({
  id,
  name,
  label,
  type = 'text',
  autoComplete,
  required,
  placeholder,
  value,
  onChange,
  adornment,
  maxLength,
  palette,
  ...rest
}: DesktopFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: palette.labelMuted,
          fontFamily: FONT_STACK,
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          style={{
            width: '100%',
            background: palette.inputBg,
            border: `1px solid ${palette.inputBorder}`,
            borderRadius: 8,
            padding: adornment ? '12px 40px 12px 14px' : '12px 14px',
            color: palette.text,
            fontSize: 14,
            fontFamily: FONT_STACK,
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.25)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = palette.brand
            e.currentTarget.style.boxShadow =
              `inset 0 1px 4px rgba(0,0,0,0.25), 0 0 0 2px ${palette.brandTint}`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = palette.inputBorder
            e.currentTarget.style.boxShadow = 'inset 0 1px 4px rgba(0,0,0,0.25)'
          }}
          {...rest}
        />
        {adornment && (
          <div
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {adornment}
          </div>
        )}
      </div>
    </div>
  )
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const normalizeOptionalValue = (value: string): string | null => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export default function RiderRegistration() {
  useFavicon()
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)
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
    postal_code: '',
  })
  const [step, setStep] = useState<1 | 2>(1)
  const [showAddressFields, setShowAddressFields] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { tenantInfo, isLoading: tenantLoading, slug } = useTenantInfo()
  const palette = resolveRiderAuthPalette(tenantInfo?.branding)

  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && role === 'rider') {
      navigate('/rider/dashboard', { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'phone_no') {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleAddressDetailsToggle = (checked: boolean) => {
    setShowAddressFields(checked)
    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
      }))
    }
  }

  const validateRiderStep1 = (): boolean => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Please enter your first and last name.')
      return false
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return false
    }
    const phoneDigits = formData.phone_no.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
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

    if (tenantLoading) {
      setError('Loading tenant information...')
      return
    }
    if (tenantInfo && !slug) {
      setError('Unable to determine tenant slug. Please refresh the page or contact support.')
      return
    }
    if (!slug) {
      setError('Tenant information is required. Please access this page with a valid tenant slug.')
      return
    }

    if (step === 1) {
      setError('')
      if (!validateRiderStep1()) return
      setStep(2)
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const phoneDigits = formData.phone_no.replace(/\D/g, '')

      await createUser(slug, {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_no: phoneDigits,
        address: showAddressFields ? normalizeOptionalValue(formData.address) : null,
        city: showAddressFields ? normalizeOptionalValue(formData.city) : null,
        state: showAddressFields ? normalizeOptionalValue(formData.state) : null,
        country: showAddressFields ? normalizeOptionalValue(formData.country) : null,
        postal_code: showAddressFields ? normalizeOptionalValue(formData.postal_code) : null,
        password: formData.password,
      })

      const data = await loginRider(formData.email, formData.password)
      useAuthStore.getState().login({ token: data.access_token })
      navigate('/riders/profile', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setError('')
    setShowAddressFields(false)
    setStep(1)
  }

  if (isAuthenticated && role === 'rider') {
    return null
  }

  if (tenantLoading) {
    const loadingPalette = resolveSubdomainLoadingPalette(slug)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: loadingPalette.bg,
          color: loadingPalette.muted,
          fontFamily: FONT_STACK,
          fontSize: 14,
          ['--bw-bg' as string]: loadingPalette.bg,
          ['--bw-fg' as string]: loadingPalette.text,
          ['--bw-text' as string]: loadingPalette.text,
          ['--bw-muted' as string]: loadingPalette.muted,
          ['--bw-border' as string]: loadingPalette.border,
          ['--bw-border-strong' as string]: loadingPalette.border,
          ['--bw-focus' as string]: loadingPalette.accent,
          ['--bw-accent' as string]: loadingPalette.accent,
        }}
      >
        Loading…
      </div>
    )
  }

  if (!tenantLoading && !tenantInfo && !slug) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: palette.bg,
          padding: 24,
          fontFamily: FONT_STACK,
          ...buildScopedThemeVars(palette),
        }}
      >
        <p style={{ color: palette.error, fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
          Tenant not found. Please check the URL and try again.
        </p>
        <Link
          to="/"
          style={{
            background: palette.brand,
            color: palette.buttonText,
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Go to Home
        </Link>
      </div>
    )
  }

  const companyName = tenantInfo?.company_name || 'Our Service'
  const passwordFailures = getPasswordPolicyFailures(formData.password)
  const emailFormatError = getEmailFormatError(formData.email)

  const sharedProps: LayoutProps = {
    companyName,
    logoUrl: tenantInfo?.logo_url,
    formData,
    onInputChange: handleInputChange,
    onSubmit: handleFormSubmit,
    isLoading,
    error,
    showPassword,
    setShowPassword,
    emailFormatError,
    passwordFailures,
    step,
    showAddressFields,
    onAddressToggle: handleAddressDetailsToggle,
    onBack: handleBack,
    setFormData,
    palette,
  }

  return isDesktop ? <DesktopLayout {...sharedProps} /> : <MobileLayout {...sharedProps} />
}

interface LayoutProps {
  companyName: string
  logoUrl?: string | null
  formData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone_no: string
    address: string
    city: string
    state: string
    country: string
    postal_code: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: string
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  emailFormatError: string | null
  passwordFailures: string[]
  step: 1 | 2
  showAddressFields: boolean
  onAddressToggle: (checked: boolean) => void
  onBack: () => void
  setFormData: React.Dispatch<React.SetStateAction<LayoutProps['formData']>>
  palette: RiderAuthPalette
}

function StepIndicator({ step, palette }: { step: 1 | 2; palette: RiderAuthPalette }) {
  const label = step === 1 ? 'Step 1 of 2 — Account' : 'Step 2 of 2 — Pickup address'
  return (
    <p
      aria-live="polite"
      style={{
        margin: '6px 0 0',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: palette.labelMuted,
        fontFamily: FONT_STACK,
      }}
    >
      {label}
    </p>
  )
}

function AddressToggle({
  checked,
  onChange,
  palette,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  palette: RiderAuthPalette
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        fontFamily: FONT_STACK,
        fontSize: 13,
        color: palette.text,
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: 16,
          height: 16,
          accentColor: palette.brand,
          cursor: 'pointer',
        }}
      />
      <span>Add pickup address now (optional)</span>
    </label>
  )
}

function DesktopLayout({
  companyName,
  logoUrl,
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  showPassword,
  setShowPassword,
  emailFormatError,
  passwordFailures,
  step,
  showAddressFields,
  onAddressToggle,
  onBack,
  setFormData,
  palette,
}: LayoutProps) {
  const autocompleteStyle: React.CSSProperties = {
    background: palette.inputBg,
    border: `1px solid ${palette.inputBorder}`,
    borderRadius: 8,
    padding: '12px 14px',
    color: palette.text,
    fontSize: 14,
    fontFamily: FONT_STACK,
    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.25)',
  }

  return (
    <main
      aria-label="Rider Registration"
      style={{
        margin: 0,
        minHeight: '100vh',
        background: palette.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_STACK,
        color: palette.text,
        position: 'relative',
        overflow: 'hidden',
        ...buildScopedThemeVars(palette),
      }}
    >
      <BackgroundDecor palette={palette} />

      {/* Centred content column — padding allows the card to scroll past the viewport when the address form is expanded */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 44 }}>
          <BrandMark companyName={companyName} logoUrl={logoUrl} variant="desktop" palette={palette} />
        </div>

        {/* Elevated form card */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '40px 36px',
            boxShadow:
              '0 32px 64px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 300,
                color: palette.text,
                fontFamily: FONT_STACK,
                letterSpacing: '0.02em',
              }}
            >
              Create your account
            </h1>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13,
                color: palette.muted,
                fontFamily: FONT_STACK,
                letterSpacing: '0.01em',
              }}
            >
              {`Sign up for ${companyName}`}
            </p>
            <StepIndicator step={step} palette={palette} />
          </div>

          {error && <ErrorBanner message={error} palette={palette} />}

          <form onSubmit={onSubmit} style={{ marginTop: 4, textAlign: 'left' }}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <DesktopField
                    id="first_name"
                    name="first_name"
                    label="First name"
                    autoComplete="given-name"
                    required
                    placeholder="John"
                    value={formData.first_name}
                    onChange={onInputChange}
                    palette={palette}
                  />
                  <DesktopField
                    id="last_name"
                    name="last_name"
                    label="Last name"
                    autoComplete="family-name"
                    required
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={onInputChange}
                    palette={palette}
                  />
                </div>

                <div>
                  <DesktopField
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={onInputChange}
                    aria-invalid={formData.email.length > 0 && !!emailFormatError}
                    palette={palette}
                  />
                  <p
                    style={{
                      margin: '6px 2px 0',
                      fontSize: 11,
                      color: palette.muted,
                      fontFamily: FONT_STACK,
                    }}
                  >
                    {EMAIL_FORMAT_HINT}
                  </p>
                  {emailFormatError && (
                    <div
                      role="alert"
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: palette.error,
                        fontFamily: FONT_STACK,
                      }}
                    >
                      {emailFormatError}
                    </div>
                  )}
                </div>

                <DesktopField
                  id="phone_no"
                  name="phone_no"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="(555) 555-5555"
                  value={formData.phone_no}
                  onChange={onInputChange}
                  maxLength={14}
                  palette={palette}
                />

                <div>
                  <DesktopField
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={onInputChange}
                    palette={palette}
                    adornment={
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: palette.muted,
                          cursor: 'pointer',
                          padding: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  <p
                    style={{
                      margin: '6px 2px 0',
                      fontSize: 11,
                      color: palette.muted,
                      fontFamily: FONT_STACK,
                    }}
                  >
                    {PASSWORD_POLICY_HINT}
                  </p>
                  {formData.password.length > 0 && passwordFailures.length > 0 && (
                    <div
                      role="alert"
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: palette.error,
                        fontFamily: FONT_STACK,
                      }}
                    >
                      {formatPasswordPolicySentence(passwordFailures)}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 8 }}>
                  <PrimaryButton
                    isLoading={isLoading}
                    label="Continue"
                    loadingLabel="Continue"
                    palette={palette}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AddressToggle checked={showAddressFields} onChange={onAddressToggle} palette={palette} />

                {showAddressFields && (
                  <>
                    <DesktopField
                      id="address"
                      name="address"
                      label="Address"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={onInputChange}
                      palette={palette}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: palette.labelMuted,
                            fontFamily: FONT_STACK,
                            marginBottom: 8,
                          }}
                        >
                          City
                        </span>
                        <CityAutocomplete
                          value={formData.city}
                          onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                          selectedState={formData.state}
                          placeholder="New York"
                          className=""
                          style={autocompleteStyle}
                        />
                      </div>
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: palette.labelMuted,
                            fontFamily: FONT_STACK,
                            marginBottom: 8,
                          }}
                        >
                          State
                        </span>
                        <StateAutocomplete
                          value={formData.state}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, state: value, city: '' }))
                          }
                          placeholder="NY"
                          className=""
                          style={autocompleteStyle}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: palette.labelMuted,
                            fontFamily: FONT_STACK,
                            marginBottom: 8,
                          }}
                        >
                          Country
                        </span>
                        <CountryAutocomplete
                          value={formData.country}
                          onChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                          placeholder="USA"
                          className=""
                          style={autocompleteStyle}
                        />
                      </div>
                      <DesktopField
                        id="postal_code"
                        name="postal_code"
                        label="Postal code"
                        placeholder="10001"
                        value={formData.postal_code}
                        onChange={onInputChange}
                        maxLength={10}
                        palette={palette}
                      />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <GhostButton
                    onClick={onBack}
                    disabled={isLoading}
                    label="Back"
                    flex={1}
                    withBackArrow
                    palette={palette}
                  />
                  <PrimaryButton
                    isLoading={isLoading}
                    label="Create account"
                    loadingLabel="Creating…"
                    flex={2}
                    palette={palette}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sign-in link below card */}
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: palette.muted,
            fontFamily: FONT_STACK,
          }}
        >
          Already have an account?{' '}
          <Link
            to="/riders/login"
            style={{ color: palette.brand, textDecoration: 'none', fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

function MobileLayout({
  companyName,
  logoUrl,
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  showPassword,
  setShowPassword,
  emailFormatError,
  passwordFailures,
  step,
  showAddressFields,
  onAddressToggle,
  onBack,
  setFormData,
  palette,
}: LayoutProps) {
  const autocompleteStyle: React.CSSProperties = {
    background: palette.inputBg,
    border: `1px solid ${palette.inputBorder}`,
    borderRadius: 8,
    padding: '12px 14px',
    color: palette.text,
    fontSize: 14,
    fontFamily: FONT_STACK,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  }

  return (
    <main
      aria-label="Rider Registration"
      style={{
        margin: 0,
        minHeight: '100vh',
        background: palette.bg,
        color: palette.text,
        fontFamily: FONT_STACK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        ...buildScopedThemeVars(palette),
      }}
    >
      <BackgroundDecor palette={palette} />

      {/* Brand zone — clamped so there's always room for the form below */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '0 0 clamp(120px, 25vh, 200px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <BrandMark companyName={companyName} logoUrl={logoUrl} variant="mobile" palette={palette} />
      </div>

      {/* Form panel — scrollable so expanded address fields don't clip */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderTop: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '24px 24px 0 0',
          padding: `28px 24px calc(env(safe-area-inset-bottom, 0px) + 32px)`,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.35)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 300,
              color: palette.text,
              fontFamily: FONT_STACK,
              letterSpacing: '0.02em',
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: palette.muted,
              fontFamily: FONT_STACK,
            }}
          >
            {`Sign up for ${companyName}`}
          </p>
          <StepIndicator step={step} palette={palette} />
        </div>

        {error && <ErrorBanner message={error} palette={palette} />}

        <form
          onSubmit={onSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}
        >
          {step === 1 && (
            <>
              <FloatingField
                id="first_name"
                name="first_name"
                label="First name"
                autoComplete="given-name"
                required
                placeholder="John"
                value={formData.first_name}
                onChange={onInputChange}
                palette={palette}
              />
              <FloatingField
                id="last_name"
                name="last_name"
                label="Last name"
                autoComplete="family-name"
                required
                placeholder="Doe"
                value={formData.last_name}
                onChange={onInputChange}
                palette={palette}
              />
              <FloatingField
                id="email"
                name="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={formData.email}
                onChange={onInputChange}
                aria-invalid={formData.email.length > 0 && !!emailFormatError}
                palette={palette}
              />
              {emailFormatError && (
                <div
                  role="alert"
                  style={{
                    fontSize: 12,
                    color: palette.error,
                    fontFamily: FONT_STACK,
                    marginTop: -4,
                  }}
                >
                  {emailFormatError}
                </div>
              )}
              <FloatingField
                id="phone_no"
                name="phone_no"
                label="Phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="(555) 555-5555"
                value={formData.phone_no}
                onChange={onInputChange}
                inputMode="tel"
                maxLength={14}
                palette={palette}
              />
              <FloatingField
                id="password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={onInputChange}
                palette={palette}
                adornment={
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: palette.muted,
                      cursor: 'pointer',
                      padding: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {formData.password.length > 0 && passwordFailures.length > 0 && (
                <div
                  role="alert"
                  style={{
                    fontSize: 12,
                    color: palette.error,
                    fontFamily: FONT_STACK,
                    marginTop: -4,
                  }}
                >
                  {formatPasswordPolicySentence(passwordFailures)}
                </div>
              )}
              <p
                style={{
                  margin: '0 2px',
                  fontSize: 11,
                  color: palette.muted,
                  fontFamily: FONT_STACK,
                }}
              >
                {PASSWORD_POLICY_HINT}
              </p>

              <div style={{ marginTop: 8 }}>
                <PrimaryButton isLoading={isLoading} label="Continue" loadingLabel="Continue" palette={palette} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <AddressToggle checked={showAddressFields} onChange={onAddressToggle} palette={palette} />
              {showAddressFields && (
                <>
                  <FloatingField
                    id="address"
                    name="address"
                    label="Address"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={onInputChange}
                    palette={palette}
                  />
                  <CityAutocomplete
                    value={formData.city}
                    onChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                    selectedState={formData.state}
                    placeholder="City"
                    className=""
                    style={autocompleteStyle}
                  />
                  <StateAutocomplete
                    value={formData.state}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, state: value, city: '' }))
                    }
                    placeholder="State"
                    className=""
                    style={autocompleteStyle}
                  />
                  <CountryAutocomplete
                    value={formData.country}
                    onChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                    placeholder="Country"
                    className=""
                    style={autocompleteStyle}
                  />
                  <FloatingField
                    id="postal_code"
                    name="postal_code"
                    label="Postal code"
                    placeholder="10001"
                    value={formData.postal_code}
                    onChange={onInputChange}
                    maxLength={10}
                    palette={palette}
                  />
                </>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <GhostButton
                  onClick={onBack}
                  disabled={isLoading}
                  label="Back"
                  flex={1}
                  withBackArrow
                  palette={palette}
                />
                <PrimaryButton
                  isLoading={isLoading}
                  label="Create account"
                  loadingLabel="Creating…"
                  flex={2}
                  palette={palette}
                />
              </div>
            </>
          )}
        </form>

        <p
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 13,
            color: palette.muted,
            fontFamily: FONT_STACK,
          }}
        >
          Already have an account?{' '}
          <Link to="/riders/login" style={{ color: palette.brand, textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
