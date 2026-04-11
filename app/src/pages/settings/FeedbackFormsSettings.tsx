import { useState, useEffect, useCallback } from 'react'
import { getTenantInfo } from '@api/tenant'
import {
  getTenantConfig,
  updateTenantSettings,
  feedbackFormUrlForPayload,
  type TenantConfigResponse,
  type TenantSettingsData
} from '@api/tenantSettings'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'
import {
  ChatCircle,
  SteeringWheel,
  FloppyDisk,
  Copy,
  Check,
  Sparkle,
  ArrowSquareOut,
  List as ListIcon
} from '@phosphor-icons/react'
import {
  zelleNumberFromApi,
  zelleEmailFromApi,
  tenantZellePayload,
  zellePhoneValidationError
} from '@utils/zelleContact'
import { normalizeAllowedPaymentMethodMap } from '@utils/allowedPaymentMethods'

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(72px + env(safe-area-inset-bottom, 0px))'

function replaceBrand(template: string, brand: string) {
  const b = brand.trim() || 'Your company'
  return template.replace(/\[Brand\]/g, b)
}

const TITLE_WITH_BRAND = [
  'Your Experience with [Brand]',
  'Tell Us About Your Ride',
  'Share Your Feedback',
  'Rate Your Trip',
  'Help Us Improve'
]

const TITLE_CALM = ['Your Experience', 'How Was Your Ride?', 'Share Your Thoughts']

const RIDER_FORM_DESCRIPTION = `We'd love a quick moment of your time. Your answers help us keep rides safe, comfortable, and on time. This short form takes about one minute—and shorter forms tend to get more honest replies.`

const DRIVER_FORM_DESCRIPTION = `Quick feedback helps us support you and keep trips smooth. Your responses are used only to improve operations. A few focused questions usually get higher response rates than long surveys.`

const RIDER_QUESTIONS_COPY = `1. How was your overall experience?
   → Suggested type: Linear scale (1–5) or Multiple choice (Excellent / Good / Fair / Poor)

2. Was your driver professional and courteous?
   → Suggested type: Yes / No (or multiple choice)

3. Was your vehicle clean and comfortable?
   → Suggested type: Yes / No

4. Did your ride feel smooth and on time?
   → Suggested type: Yes / No

5. Any additional comments?
   → Suggested type: Paragraph (optional)`

const DRIVER_QUESTIONS_COPY = `1. How smooth was the trip from pickup to drop-off?
   → Suggested type: Linear scale (1–5) or Short answer

2. Was the passenger ready at pickup time?
   → Suggested type: Yes / No

3. Were the trip details accurate?
   → Suggested type: Yes / No

4. Was the ride easy to complete?
   → Suggested type: Yes / No

5. Any notes or concerns?
   → Suggested type: Paragraph (optional)`

const BRANDING_TIPS = `• Use your company name, logo, and brand colors in Google Forms (Theme) so the survey feels like your business, not a generic tool.

• In Form settings, add a confirmation message that matches your tone (e.g. “Thank you—we read every response”).`

function CopyableBlock({
  label,
  text,
  isMobile
}: {
  label: string
  text: string
  isMobile: boolean
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Could not copy. Select the text and copy manually.')
    }
  }, [text])

  return (
    <div
      style={{
        borderRadius: 8,
        border: '1px solid var(--bw-border)',
        backgroundColor: 'var(--bw-bg-secondary, rgba(0,0,0,0.03))',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--bw-border)',
          backgroundColor: 'var(--bw-bg)'
        }}
      >
        <span
          style={{
            fontSize: isMobile ? 12 : 13,
            fontWeight: 500,
            fontFamily: '"Work Sans", sans-serif',
            color: 'var(--bw-muted)'
          }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="bw-btn-outline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 500,
            cursor: 'pointer',
            border: '1px solid var(--bw-border)',
            background: 'var(--bw-bg)'
          }}
        >
          {copied ? (
            <>
              <Check size={16} style={{ color: 'var(--bw-accent)' }} />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
          fontSize: 'clamp(12px, 1.4vw, 13px)',
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 300,
          color: 'var(--bw-text)',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: 280,
          overflowY: 'auto'
        }}
      >
        {text}
      </pre>
    </div>
  )
}

export default function FeedbackFormsSettings() {
  const [loading, setLoading] = useState(true)
  const [tenantConfig, setTenantConfig] = useState<TenantConfigResponse | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [riderUrl, setRiderUrl] = useState('')
  const [driverUrl, setDriverUrl] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen, setSuppressMobileFloatingMenu } = useSettingsMenu()

  const [hoverEdit, setHoverEdit] = useState(false)
  const [hoverSave, setHoverSave] = useState(false)
  const [hoverCancel, setHoverCancel] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setSuppressMobileFloatingMenu(isMobile)
    return () => setSuppressMobileFloatingMenu(false)
  }, [isMobile, setSuppressMobileFloatingMenu])

  useEffect(() => {
    const load = async () => {
      try {
        const [infoRes, config] = await Promise.all([getTenantInfo(), getTenantConfig('all')])
        setCompanyName(infoRes.data?.profile?.company_name ?? '')
        setTenantConfig(config)
        if (config.settings) {
          setRiderUrl(config.settings.rider_feedback_form ?? '')
          setDriverUrl(config.settings.driver_feedback_form ?? '')
        }
      } catch (e) {
        console.error('Failed to load feedback forms settings:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const syncUrlsFromServer = () => {
    if (tenantConfig?.settings) {
      setRiderUrl(tenantConfig.settings.rider_feedback_form ?? '')
      setDriverUrl(tenantConfig.settings.driver_feedback_form ?? '')
    }
  }

  const handleSave = async () => {
    if (!tenantConfig?.settings) return

    const zelleErr = zellePhoneValidationError(
      zelleNumberFromApi(tenantConfig.settings.zelle_number)
    )
    if (zelleErr) {
      alert(zelleErr)
      return
    }

    try {
      setSaving(true)

      const existingTypes = tenantConfig.settings.config?.booking?.types || {}
      const typesToPreserve: Record<string, { is_deposit_required: boolean }> = {}
      Object.keys(existingTypes).forEach((typeKey) => {
        typesToPreserve[typeKey] = {
          is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
        }
      })

      const baseSettings: TenantSettingsData = {
        ...tenantConfig.settings,
        zelle_number: zelleNumberFromApi(tenantConfig.settings.zelle_number),
        zelle_email: zelleEmailFromApi(tenantConfig.settings.zelle_email)
      }

      const completeConfig = {
        rider_tiers_enabled: tenantConfig.settings.rider_tiers_enabled,
        ...tenantZellePayload(baseSettings),
        rider_feedback_form: feedbackFormUrlForPayload(riderUrl),
        driver_feedback_form: feedbackFormUrlForPayload(driverUrl),
        config: tenantConfig.settings.config
          ? {
              ...tenantConfig.settings.config,
              booking: {
                ...tenantConfig.settings.config.booking,
                allowed_payment_method: normalizeAllowedPaymentMethodMap(
                  tenantConfig.settings.config.booking.allowed_payment_method
                ),
                types: typesToPreserve
              }
            }
          : {
              booking: {
                allow_guest_bookings: true,
                show_vehicle_images: true,
                allowed_payment_method: normalizeAllowedPaymentMethodMap(null),
                types: typesToPreserve
              },
              branding: {
                button_radius: 0,
                font_family: 'string'
              },
              features: {
                vip_profiles: true,
                show_loyalty_banner: true
              }
            }
      }

      await updateTenantSettings(completeConfig)
      const refreshed = await getTenantConfig('all')
      setTenantConfig(refreshed)
      if (refreshed.settings) {
        setRiderUrl(refreshed.settings.rider_feedback_form ?? '')
        setDriverUrl(refreshed.settings.driver_feedback_form ?? '')
      }
      setEditing(false)
      alert('Feedback form links updated successfully!')
    } catch (e) {
      console.error('Failed to save feedback form links:', e)
      alert('Failed to save feedback form links. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const titleBlockText = [
    '— With your company name —',
    ...TITLE_WITH_BRAND.map((t) => replaceBrand(t, companyName)),
    '',
    '— Calm & personal (no placeholder) —',
    ...TITLE_CALM
  ].join('\n')

  if (loading) {
    return (
      <div
        className="bw bw-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <div className="bw-loading" style={{ color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar>
        <div
          style={{
            marginLeft: isMobile ? '0' : menuIsOpen ? '20%' : '64px',
            transition: 'margin-left 0.3s ease',
            width: isMobile ? '100%' : menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)',
            maxWidth: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            paddingBottom: isMobile ? MOBILE_SCROLL_BOTTOM_PAD : undefined
          }}
        >
          <div
            style={{
              maxWidth: 920,
              margin: '0 auto',
              padding: 'clamp(16px, 2vw, 24px) clamp(16px, 2.5vw, 28px) clamp(32px, 5vw, 48px)',
              boxSizing: 'border-box'
            }}
          >
            <header style={{ marginBottom: 'clamp(20px, 3vw, 28px)' }}>
              <h1
                style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  margin: '0 0 8px 0',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 200,
                  color: 'var(--bw-text)'
                }}
              >
                Rider & driver feedback
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(13px, 1.6vw, 15px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  lineHeight: 1.55,
                  maxWidth: 720
                }}
              >
                Create the questions in your own Google account—we cannot prefill form content for you. Use the guide
                below for titles, descriptions, and question ideas, then paste your published form links at the
                bottom.
              </p>
            </header>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 'clamp(14px, 2vw, 18px)',
                borderRadius: 10,
                border: '1px solid var(--bw-border)',
                backgroundColor: 'var(--bw-bg-secondary)',
                marginBottom: 'clamp(20px, 3vw, 28px)'
              }}
            >
              <Sparkle size={22} style={{ flexShrink: 0, marginTop: 2, color: 'var(--bw-accent)' }} />
              <div>
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: '"Work Sans", sans-serif',
                    color: 'var(--bw-text)'
                  }}
                >
                  Keep it short
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    lineHeight: 1.5
                  }}
                >
                  Shorter forms usually earn more responses. Five clear questions plus an optional comment box is
                  enough for actionable feedback.
                </p>
              </div>
            </div>

            <section style={{ marginBottom: 'clamp(24px, 3.5vw, 32px)' }}>
              <h2
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: '"Work Sans", sans-serif',
                  color: 'var(--bw-text)',
                  margin: '0 0 12px 0'
                }}
              >
                <ListIcon size={20} />
                Recommended form titles
              </h2>
              <CopyableBlock label="Copy all suggested titles" text={titleBlockText} isMobile={isMobile} />
            </section>

            <section
              style={{
                display: 'grid',
                gap: 'clamp(16px, 2.5vw, 20px)',
                marginBottom: 'clamp(24px, 3.5vw, 32px)',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
              }}
            >
              <div>
                <h3
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: '"Work Sans", sans-serif',
                    margin: '0 0 10px 0',
                    color: 'var(--bw-text)'
                  }}
                >
                  <ChatCircle size={18} />
                  Rider form — description
                </h3>
                <CopyableBlock label="Copy description for rider form" text={RIDER_FORM_DESCRIPTION} isMobile={isMobile} />
              </div>
              <div>
                <h3
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: '"Work Sans", sans-serif',
                    margin: '0 0 10px 0',
                    color: 'var(--bw-text)'
                  }}
                >
                  <SteeringWheel size={18} />
                  Driver form — description
                </h3>
                <CopyableBlock label="Copy description for driver form" text={DRIVER_FORM_DESCRIPTION} isMobile={isMobile} />
              </div>
            </section>

            <section
              style={{
                display: 'grid',
                gap: 'clamp(16px, 2.5vw, 20px)',
                marginBottom: 'clamp(24px, 3.5vw, 32px)',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: '"Work Sans", sans-serif',
                    margin: '0 0 10px 0',
                    color: 'var(--bw-text)'
                  }}
                >
                  Example questions — riders
                </h3>
                <CopyableBlock label="Copy rider question list" text={RIDER_QUESTIONS_COPY} isMobile={isMobile} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: '"Work Sans", sans-serif',
                    margin: '0 0 10px 0',
                    color: 'var(--bw-text)'
                  }}
                >
                  Example questions — drivers
                </h3>
                <CopyableBlock label="Copy driver question list" text={DRIVER_QUESTIONS_COPY} isMobile={isMobile} />
              </div>
            </section>

            <section style={{ marginBottom: 'clamp(28px, 4vw, 40px)' }}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: '"Work Sans", sans-serif',
                  margin: '0 0 12px 0',
                  color: 'var(--bw-text)'
                }}
              >
                Branding in Google Forms
              </h2>
              <CopyableBlock label="Copy branding checklist" text={BRANDING_TIPS} isMobile={isMobile} />
            </section>

            <section
              style={{
                paddingTop: 'clamp(20px, 3vw, 28px)',
                borderTop: '1px solid var(--bw-border)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 16
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(16px, 2vw, 18px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}
                >
                  Connect your published links
                </h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {editing ? (
                    <>
                      <button
                        type="button"
                        className={`bw-btn-outline ${hoverCancel ? 'custom-hover-border' : ''}`}
                        disabled={saving}
                        onMouseEnter={() => !saving && setHoverCancel(true)}
                        onMouseLeave={() => setHoverCancel(false)}
                        onClick={() => {
                          syncUrlsFromServer()
                          setEditing(false)
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 7,
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 300,
                          border: hoverCancel ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                          color: hoverCancel ? 'rgba(155, 97, 209, 0.81)' : '#000',
                          background: hoverCancel ? 'var(--bw-bg-secondary)' : '#fff'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`bw-btn bw-btn-action ${hoverSave ? 'custom-hover-border' : ''}`}
                        disabled={saving}
                        onMouseEnter={() => !saving && setHoverSave(true)}
                        onMouseLeave={() => setHoverSave(false)}
                        onClick={handleSave}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 7,
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: hoverSave ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                          color: hoverSave ? 'rgba(155, 97, 209, 0.81)' : '#fff',
                          border: hoverSave ? '2px solid rgba(155, 97, 209, 0.81)' : 'none'
                        }}
                      >
                        <FloppyDisk size={16} />
                        {saving ? 'Saving…' : 'Save links'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={`bw-btn-outline ${hoverEdit ? 'custom-hover-border' : ''}`}
                      onMouseEnter={() => setHoverEdit(true)}
                      onMouseLeave={() => setHoverEdit(false)}
                      onClick={() => setEditing(true)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 7,
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 300,
                        border: hoverEdit ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                        color: hoverEdit ? 'rgba(155, 97, 209, 0.81)' : '#000',
                        background: hoverEdit ? 'var(--bw-bg-secondary)' : '#fff'
                      }}
                    >
                      Edit links
                    </button>
                  )}
                </div>
              </div>

              <p
                style={{
                  margin: '0 0 16px 0',
                  fontSize: 13,
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  lineHeight: 1.5
                }}
              >
                In Google Forms, use <strong style={{ fontWeight: 500 }}>Send</strong> → share link (or publish to web)
                and paste the URL riders or drivers will open. You can use one form for both audiences or separate
                forms.
              </p>

              <a
                href="https://docs.google.com/forms/u/0/"
                target="_blank"
                rel="noopener noreferrer"
                className="bw-btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                  padding: '10px 18px',
                  borderRadius: 7,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontFamily: '"Work Sans", sans-serif',
                  color: 'var(--bw-text)',
                  border: '1px solid var(--bw-border)'
                }}
              >
                Open Google Forms
                <ArrowSquareOut size={18} />
              </a>

              <div
                style={{
                  display: 'grid',
                  gap: 18,
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
                }}
              >
                <div className="bw-form-group" style={{ minWidth: 0 }}>
                  <label
                    className="bw-form-label small-muted"
                    htmlFor="feedback-rider-url"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--bw-muted)',
                      marginBottom: 6,
                      fontFamily: '"Work Sans", sans-serif'
                    }}
                  >
                    <ChatCircle size={14} /> Rider feedback URL
                  </label>
                  {editing ? (
                    <input
                      id="feedback-rider-url"
                      className="bw-input"
                      type="url"
                      value={riderUrl}
                      onChange={(e) => setRiderUrl(e.target.value)}
                      placeholder="https://docs.google.com/forms/…"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 14px',
                        fontSize: 14,
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                  ) : (
                    <span
                      className="bw-info-value"
                      style={{
                        wordBreak: 'break-all',
                        fontSize: 14,
                        fontFamily: '"Work Sans", sans-serif',
                        display: 'block'
                      }}
                    >
                      {feedbackFormUrlForPayload(riderUrl) ? (
                        <a href={riderUrl.trim()} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(155, 97, 209, 0.81)' }}>
                          {riderUrl.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  )}
                </div>
                <div className="bw-form-group" style={{ minWidth: 0 }}>
                  <label
                    className="bw-form-label small-muted"
                    htmlFor="feedback-driver-url"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: 'var(--bw-muted)',
                      marginBottom: 6,
                      fontFamily: '"Work Sans", sans-serif'
                    }}
                  >
                    <SteeringWheel size={14} /> Driver feedback URL
                  </label>
                  {editing ? (
                    <input
                      id="feedback-driver-url"
                      className="bw-input"
                      type="url"
                      value={driverUrl}
                      onChange={(e) => setDriverUrl(e.target.value)}
                      placeholder="https://docs.google.com/forms/…"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 14px',
                        fontSize: 14,
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                  ) : (
                    <span
                      className="bw-info-value"
                      style={{
                        wordBreak: 'break-all',
                        fontSize: 14,
                        fontFamily: '"Work Sans", sans-serif',
                        display: 'block'
                      }}
                    >
                      {feedbackFormUrlForPayload(driverUrl) ? (
                        <a href={driverUrl.trim()} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(155, 97, 209, 0.81)' }}>
                          {driverUrl.trim()}
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  )}
                </div>
              </div>
              <p
                style={{
                  margin: '14px 0 0 0',
                  fontSize: 12,
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  lineHeight: 1.45
                }}
              >
                Clear a field and save to remove that link from your tenant settings.
              </p>
            </section>
          </div>
        </div>
      </SettingsMenuBar>
    </div>
  )
}
