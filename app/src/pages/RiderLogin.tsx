import React, { useState, useEffect } from 'react'
import { Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react'
import { loginRider } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import { getApiErrorMessage } from '@utils/apiError'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import {
  resolveRiderAuthPalette,
  type RiderAuthPalette,
} from '@utils/riderAuthPalette'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'

const DESKTOP_BREAKPOINT = '(min-width: 768px)'
const FONT_STACK =
  'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

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

// Subtle road-geometry SVG decor — concentric arcs from below the frame
// suggesting an aerial road view, city grid lines at very low opacity.
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
        {/* Concentric arcs from below — aerial road / horizon */}
        <circle cx="400" cy="640" r="310" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="400" cy="640" r="450" fill="none" stroke="white" strokeWidth="0.8" />
        <circle cx="400" cy="640" r="590" fill="none" stroke="white" strokeWidth="0.6" />
        <circle cx="400" cy="640" r="730" fill="none" stroke="white" strokeWidth="0.5" />
        {/* Vertical city-grid lines */}
        <line x1="160" y1="0" x2="160" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="320" y1="0" x2="320" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="480" y1="0" x2="480" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="640" y1="0" x2="640" y2="520" stroke="white" strokeWidth="0.5" opacity="0.5" />
        {/* Two diagonal spurs */}
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

  // Mobile
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
  palette: RiderAuthPalette
}

function PrimaryButton({ isLoading, label, loadingLabel, palette }: PrimaryButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      style={{
        width: '100%',
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

export default function RiderLogin() {
  useFavicon()
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const emailFormatError = getEmailFormatError(formData.email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }
    try {
      setIsLoading(true)
      const data = await loginRider(formData.email, formData.password)
      useAuthStore.getState().login({ token: data.access_token })
      navigate('/rider/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
    } finally {
      setIsLoading(false)
    }
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
          ['--bw-text' as string]: loadingPalette.text,
          ['--bw-muted' as string]: loadingPalette.muted,
          ['--bw-accent' as string]: loadingPalette.accent,
          ['--bw-border' as string]: loadingPalette.border,
        }}
      >
        Loading…
      </div>
    )
  }

  const companyName = tenantInfo?.company_name || 'Our Service'

  return isDesktop ? (
    <DesktopLayout
      companyName={companyName}
      logoUrl={tenantInfo?.logo_url}
      formData={formData}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      emailFormatError={emailFormatError}
      palette={palette}
    />
  ) : (
    <MobileLayout
      companyName={companyName}
      logoUrl={tenantInfo?.logo_url}
      formData={formData}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      emailFormatError={emailFormatError}
      palette={palette}
    />
  )
}

interface LayoutProps {
  companyName: string
  logoUrl?: string | null
  formData: { email: string; password: string }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: string
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  emailFormatError: string | null
  palette: RiderAuthPalette
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
  palette,
}: LayoutProps) {
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: palette.labelMuted,
    fontFamily: FONT_STACK,
    marginBottom: 8,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: palette.inputBg,
    border: `1px solid ${palette.inputBorder}`,
    borderRadius: 8,
    padding: '12px 14px',
    color: palette.text,
    fontSize: 14,
    fontFamily: FONT_STACK,
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.25)',
  }

  return (
    <main
      aria-label="Rider Login"
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
      }}
    >
      <BackgroundDecor palette={palette} />

      {/* Centred content column */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 400,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo — prominent, breathing room below */}
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
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
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
              Welcome back
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
              Sign in to your account
            </p>
          </div>

          {error && <ErrorBanner message={error} palette={palette} />}

          <form
            onSubmit={onSubmit}
            style={{ textAlign: 'left' }}
            aria-describedby={error ? undefined : 'email-hint'}
          >
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={formData.email}
                onChange={onInputChange}
                aria-invalid={formData.email.length > 0 && !!emailFormatError}
                aria-describedby="email-hint"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = palette.brand
                  e.currentTarget.style.boxShadow =
                    `inset 0 1px 4px rgba(0,0,0,0.25), 0 0 0 2px ${palette.brandTint}`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = palette.inputBorder
                  e.currentTarget.style.boxShadow = 'inset 0 1px 4px rgba(0,0,0,0.25)'
                }}
              />
              <p
                id="email-hint"
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

            <div>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={onInputChange}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = palette.brand
                    e.currentTarget.style.boxShadow =
                      `inset 0 1px 4px rgba(0,0,0,0.25), 0 0 0 2px ${palette.brandTint}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = palette.inputBorder
                    e.currentTarget.style.boxShadow = 'inset 0 1px 4px rgba(0,0,0,0.25)'
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
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
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                margin: '12px 0 22px',
              }}
            >
              <Link
                to="/riders/forgot-password"
                style={{
                  fontSize: 12,
                  color: palette.brand,
                  textDecoration: 'none',
                  fontFamily: FONT_STACK,
                }}
              >
                Forgot password?
              </Link>
            </div>

            <PrimaryButton isLoading={isLoading} label="Sign in" loadingLabel="Signing in…" palette={palette} />
          </form>
        </div>

        {/* Sign-up link sits below the card, outside it */}
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: palette.muted,
            fontFamily: FONT_STACK,
          }}
        >
          No account?{' '}
          <Link
            to="/riders/register"
            style={{ color: palette.brand, textDecoration: 'none', fontWeight: 500 }}
          >
            Sign up
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
  palette,
}: LayoutProps) {
  return (
    <main
      aria-label="Rider Login"
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
      }}
    >
      <BackgroundDecor palette={palette} />

      {/* Brand zone: upper ~35% of viewport with real breathing room */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: '0 0 35vh',
          minHeight: 160,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          gap: 10,
        }}
      >
        <BrandMark companyName={companyName} logoUrl={logoUrl} variant="mobile" palette={palette} />
      </div>

      {/* Form panel: frosted card anchored to bottom, rounded top */}
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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
            Welcome back
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: palette.muted,
              fontFamily: FONT_STACK,
            }}
          >
            Sign in to continue
          </p>
        </div>

        {error && <ErrorBanner message={error} palette={palette} />}

        <form
          onSubmit={onSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
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
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

          <div style={{ marginTop: 8 }}>
            <PrimaryButton
              isLoading={isLoading}
              label="Sign in"
              loadingLabel="Signing in…"
              palette={palette}
            />
          </div>
        </form>

        <div
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            fontFamily: FONT_STACK,
          }}
        >
          <Link
            to="/riders/forgot-password"
            style={{ color: palette.brand, textDecoration: 'none' }}
          >
            Forgot password?
          </Link>
          <Link
            to="/riders/register"
            style={{ color: palette.brand, textDecoration: 'none' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
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
