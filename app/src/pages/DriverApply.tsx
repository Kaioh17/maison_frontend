import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Envelope, User } from '@phosphor-icons/react'
import { applyToDrive } from '@api/driver'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { useFavicon } from '@hooks/useFavicon'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import { getApiErrorMessage } from '@utils/apiError'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'

const DRIVER_TYPES = [
  {
    value: 'in_house' as const,
    label: 'In-house',
    description:
      'You drive vehicles the company assigns and maintains. You may be assigned or reassigned to any vehicle in the fleet.',
  },
  {
    value: 'outsourced' as const,
    label: 'Outsourced',
    description:
      'You bring your own vehicle, which the company must approve before you drive for them. You are responsible for its upkeep.',
  },
]

export default function DriverApply() {
  useFavicon()
  const slug = useTenantSlug()
  const navigate = useNavigate()
  const { tenantInfo, isLoading: tenantLoading } = useTenantInfo()
  const loadingPalette = resolveSubdomainLoadingPalette(slug)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    driver_type: 'in_house' as 'in_house' | 'outsourced',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const companyName = tenantInfo?.company_name || 'this company'
  const emailFormatError = getEmailFormatError(formData.email)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Please enter your first and last name.')
      return
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!slug) {
      setError('Tenant subdomain is required. Please access this page from a valid tenant subdomain.')
      return
    }

    try {
      setIsLoading(true)
      await applyToDrive(slug, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        driver_type: formData.driver_type,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not submit your application. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  if (tenantLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: loadingPalette.bg }}>
        <div style={{ color: loadingPalette.text, fontFamily: 'Work Sans, sans-serif', fontSize: '16px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <main className="bw" style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bw-bg)' }}>
      <div style={{ maxWidth: 520, width: '100%', paddingTop: 'clamp(24px, 6vw, 64px)' }}>
        {tenantInfo && (
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
            {tenantInfo.logo_url ? (
              <img src={tenantInfo.logo_url} alt={companyName} style={{ maxHeight: 60, maxWidth: 200, objectFit: 'contain' }} />
            ) : (
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600, color: 'var(--bw-text)', fontFamily: 'DM Sans, sans-serif' }}>
                {companyName}
              </h1>
            )}
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} weight="fill" style={{ color: '#10b981', marginBottom: 16 }} aria-hidden />
            <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600, color: 'var(--bw-text)', fontFamily: 'DM Sans, sans-serif' }}>
              Application received
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, lineHeight: 1.6, color: 'var(--bw-text-secondary)', fontFamily: 'Work Sans, sans-serif' }}>
              {companyName} will review your application. You'll get an email with a link to finish setting up
              your account once you're approved.
            </p>
            <Link to="/driver/login" style={{ fontSize: 14, color: 'var(--bw-fg)', textDecoration: 'underline', fontFamily: 'Work Sans, sans-serif' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ margin: 0, fontSize: 32, fontFamily: 'DM Sans, sans-serif', fontWeight: 200, color: 'var(--bw-text)' }}>
              Apply to drive
            </h2>
            <p style={{ marginTop: 6, fontSize: 15, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, color: 'var(--bw-text-secondary)' }}>
              Request to join {companyName}'s fleet. They'll review your details and approve your account.
            </p>
            <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.55, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-text-secondary)' }}>
              We only use this to identify you to {companyName} and to send your approval and registration
              emails — nothing else.
            </p>

            {error && (
              <div style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(197, 72, 61, 0.1)', border: '1px solid var(--bw-error)', borderRadius: 4, color: 'var(--bw-error)', fontSize: 14, fontFamily: 'Work Sans, sans-serif' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="small-muted" htmlFor="first_name" style={{ fontFamily: 'Work Sans, sans-serif' }}>First name</label>
                  <div style={{ position: 'relative', marginTop: 6 }}>
                    <User size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      required
                      className="bw-input"
                      style={{ padding: '16px 18px 16px 44px', borderRadius: 10, fontFamily: 'Work Sans, sans-serif' }}
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="small-muted" htmlFor="last_name" style={{ fontFamily: 'Work Sans, sans-serif' }}>Last name</label>
                  <div style={{ position: 'relative', marginTop: 6 }}>
                    <User size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      required
                      className="bw-input"
                      style={{ padding: '16px 18px 16px 44px', borderRadius: 10, fontFamily: 'Work Sans, sans-serif' }}
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="small-muted" htmlFor="email" style={{ fontFamily: 'Work Sans, sans-serif' }}>Email</label>
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <Envelope size={16} aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="bw-input"
                    aria-invalid={formData.email.length > 0 && !!emailFormatError}
                    style={{ padding: '16px 18px 16px 44px', borderRadius: 10, fontFamily: 'Work Sans, sans-serif' }}
                    placeholder="you@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <p className="small-muted" style={{ marginTop: 8, marginBottom: 0, fontSize: 12, fontFamily: 'Work Sans, sans-serif' }}>
                  {EMAIL_FORMAT_HINT}
                </p>
                {emailFormatError && (
                  <div role="alert" style={{ marginTop: 6, fontSize: 13, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-error)' }}>
                    {emailFormatError}
                  </div>
                )}
              </div>

              <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px 0' }}>
                <legend className="small-muted" style={{ fontFamily: 'Work Sans, sans-serif', padding: 0, marginBottom: 8 }}>
                  Driver type
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {DRIVER_TYPES.map((type) => (
                    <label
                      key={type.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '12px 14px',
                        border: `1px solid ${formData.driver_type === type.value ? 'var(--bw-fg)' : 'var(--bw-border)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontFamily: 'Work Sans, sans-serif',
                      }}
                    >
                      <input
                        type="radio"
                        name="driver_type"
                        value={type.value}
                        checked={formData.driver_type === type.value}
                        onChange={() => setFormData({ ...formData, driver_type: type.value })}
                        style={{ marginTop: 3, cursor: 'pointer' }}
                      />
                      <span>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: 'var(--bw-text)' }}>{type.label}</span>
                        <span style={{ display: 'block', fontSize: 13, color: 'var(--bw-text-secondary)', lineHeight: 1.5, marginTop: 2 }}>
                          {type.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                className="bw-btn"
                style={{ width: '100%', borderRadius: 'var(--radius-field)', padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500 }}
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Submitting...' : 'Submit application'}
              </button>

              <p className="small-muted" style={{ textAlign: 'center', marginTop: 20, fontSize: 14, fontFamily: 'Work Sans, sans-serif' }}>
                Already have an invite token?{' '}
                <Link to="/driver/verify" style={{ color: 'var(--bw-fg)', textDecoration: 'underline' }}>
                  Verify it here
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
