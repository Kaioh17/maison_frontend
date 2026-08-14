import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import {
  User, FloppyDisk, PencilSimple, X, CreditCard,
  CheckCircle, Warning
} from '@phosphor-icons/react'
import { useSettingsMenu } from '@components/SettingsMenuBar'
import { http } from '@api/http'
import { setupStripeAccount } from '@api/tenantSettings'
import { SETTINGS_BTN_CSS } from './settingsButtonCss'

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(80px + env(safe-area-inset-bottom, 0px))'

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 12,
      fontWeight: 500,
      fontFamily: '"Work Sans", sans-serif',
      backgroundColor: ok ? 'rgba(30, 127, 74, 0.1)' : 'rgba(0,0,0,0.06)',
      color: ok ? 'var(--bw-success)' : 'var(--bw-muted)'
    }}>
      {ok
        ? <CheckCircle weight="fill" size={13} aria-hidden />
        : <Warning weight="fill" size={13} aria-hidden />
      }
      {label}
    </span>
  )
}

function Field({
  label,
  helper,
  editing,
  type = 'text',
  value,
  onChange
}: {
  label: string
  helper?: string
  editing?: boolean
  type?: string
  value: string
  onChange?: (v: string) => void
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: '"Work Sans", sans-serif',
        color: 'var(--bw-muted)',
        marginBottom: 4,
        letterSpacing: '0.02em'
      }}>
        {label}
      </label>
      {editing ? (
        <>
          <input
            type={type}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className="bw-input"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              borderRadius: 6,
              color: 'var(--bw-text)',
              backgroundColor: 'var(--bw-bg)',
              border: '1px solid var(--bw-border)',
              boxSizing: 'border-box'
            }}
          />
          {helper && (
            <p style={{
              margin: '4px 0 0',
              fontSize: 12,
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300,
              color: 'var(--bw-muted)',
              lineHeight: 1.4
            }}>
              {helper}
            </p>
          )}
        </>
      ) : (
        <div style={{
          fontSize: 14,
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 400,
          color: value ? 'var(--bw-text)' : 'var(--bw-muted)',
          padding: '10px 0',
          overflowWrap: 'anywhere'
        }}>
          {value || <span style={{ color: 'var(--bw-muted)' }}>—</span>}
        </div>
      )}
    </div>
  )
}

export default function AccountInformation() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const { isOpen: menuIsOpen } = useSettingsMenu()

  const [editedData, setEditedData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_no: ''
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTenantInfo()
        setInfo(res.data)
        setEditedData({
          first_name: res.data?.first_name || '',
          last_name: res.data?.last_name || '',
          email: res.data?.email || '',
          phone_no: res.data?.phone_no || ''
        })
      } catch (err) {
        console.error('Failed to load account data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await http.patch('/v1/tenant/', editedData)
      const res = await getTenantInfo()
      setInfo(res.data)
      setIsEditing(false)
      setSaveMsg({ ok: true, text: 'Account updated.' })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (err: any) {
      console.error('Failed to update:', err)
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData({
      first_name: info?.first_name || '',
      last_name: info?.last_name || '',
      email: info?.email || '',
      phone_no: info?.phone_no || ''
    })
    setIsEditing(false)
  }

  const handleStripeSetup = async () => {
    try {
      setStripeLoading(true)
      const res = await setupStripeAccount()
      if (res?.onboarding_link) {
        window.open(res.onboarding_link, '_blank', 'noopener,noreferrer')
      } else {
        setSaveMsg({ ok: false, text: 'Could not get Stripe onboarding link. Try again.' })
      }
    } catch (err: any) {
      console.error('Failed to setup Stripe:', err)
      setSaveMsg({ ok: false, text: 'Failed to start Stripe setup. Please try again.' })
    } finally {
      setStripeLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh' }}>
        <span style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  const isVerified = !!info?.is_verified
  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'

  const mobileBarBtnBase: React.CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    minHeight: 44,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif',
    borderRadius: 7,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    transition: 'opacity 0.15s ease'
  }

  const sectionCard: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--bw-bg-secondary)',
    border: '1px solid var(--bw-border)',
    borderRadius: 10,
    padding: isMobile ? '16px' : '20px 24px',
    marginBottom: 12
  }

  const sectionHeading: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid var(--bw-border)'
  }

  const sectionTitle: React.CSSProperties = {
    margin: 0,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif',
    color: 'var(--bw-muted)',
    letterSpacing: '0.03em',
    textTransform: 'uppercase'
  }

  return (
    <>
      <style>{SETTINGS_BTN_CSS}</style>
      <div style={{
      maxWidth: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0
    }}>

          {/* Scrollable body */}
          <div
            className="bw-container"
            style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: isMobile
                ? `16px 16px ${MOBILE_SCROLL_BOTTOM_PAD}`
                : '24px 28px 32px',
              maxWidth: 720,
              boxSizing: 'border-box'
            }}
          >
            {/* Page header — title and description are direct children, no title-only wrapper div.
                The h1 is desktop-only: the mobile top bar (SettingsMenuBar) already shows the
                section title there, so repeating it here would be a second heading. */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              columnGap: 16,
              marginBottom: 24
            }}>
              {!isMobile && (
                <h1 style={{
                  gridColumn: 1,
                  gridRow: 1,
                  margin: '0 0 4px',
                  fontSize: 17,
                  fontWeight: 500,
                  fontFamily: '"DM Sans", sans-serif',
                  color: 'var(--bw-text)'
                }}>
                  Account
                </h1>
              )}
              <p style={{
                gridColumn: 1,
                gridRow: 2,
                margin: 0,
                fontSize: 13,
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                lineHeight: 1.4
              }}>
                Your login details and Stripe payment setup.
              </p>

              {!isMobile && (
                <div style={{ gridColumn: 2, gridRow: '1 / span 2', alignSelf: 'start', display: 'flex', gap: 8, flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button
                        className="pss-btn pss-btn-outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X size={16} aria-hidden />
                        Cancel
                      </button>
                      <button
                        className="pss-btn pss-btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <FloppyDisk size={16} aria-hidden />
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      className="pss-btn pss-btn-outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <PencilSimple size={16} aria-hidden />
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Personal Details card ─────────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <User size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Personal Details</h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 16 : '16px 24px'
              }}>
                <Field
                  label="First Name"
                  value={editedData.first_name}
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, first_name: v }))}
                />
                <Field
                  label="Last Name"
                  value={editedData.last_name}
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, last_name: v }))}
                />
                <Field
                  label="Email"
                  type="email"
                  value={editedData.email}
                  helper="Used for login and account notifications."
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, email: v }))}
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={editedData.phone_no}
                  helper="Optional — used for support contact."
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, phone_no: v }))}
                />
              </div>
            </div>

            {/* ── Account Status card ───────────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <CheckCircle size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Account Status</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, color: 'var(--bw-text)' }}>
                      Stripe verification
                    </p>
                    <p style={{ margin: 0, fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)' }}>
                      Required to receive payouts and process payments.
                    </p>
                  </div>
                  <StatusBadge
                    ok={isVerified}
                    label={isVerified ? 'Verified' : 'Pending'}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, color: 'var(--bw-text)' }}>
                      Plan
                    </p>
                    <p style={{ margin: 0, fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)' }}>
                      Your current subscription tier.
                    </p>
                  </div>
                  {/* Not a StatusBadge: "free" isn't a problem state, it's just a
                      tier -- a Warning triangle there read as something being
                      wrong. Every tier bills through Stripe now, so a plain
                      CreditCard badge is accurate for all of them. */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 100,
                    fontSize: 12, fontWeight: 500, fontFamily: '"Work Sans", sans-serif',
                    backgroundColor: 'rgba(108, 99, 232, 0.1)',
                    color: 'var(--bw-accent)'
                  }}>
                    <CreditCard weight="fill" size={13} aria-hidden />
                    {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Stripe & Payments card ────────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <CreditCard size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Stripe & Payments</h2>
              </div>

              {isVerified ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(30, 127, 74, 0.07)',
                  border: '1px solid rgba(30, 127, 74, 0.2)'
                }}>
                  <CheckCircle weight="fill" size={18} style={{ color: 'var(--bw-success)', flexShrink: 0 }} aria-hidden />
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 500, color: 'var(--bw-success)' }}>
                      Stripe account connected
                    </p>
                    <p style={{ margin: 0, fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)' }}>
                      Payment processing and payouts are active.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(184, 135, 27, 0.07)',
                    border: '1px solid rgba(184, 135, 27, 0.25)',
                    marginBottom: 16
                  }}>
                    <Warning weight="fill" size={18} style={{ color: 'var(--bw-warning)', flexShrink: 0, marginTop: 1 }} aria-hidden />
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 500, color: 'var(--bw-warning)' }}>
                        Stripe setup incomplete
                      </p>
                      <p style={{ margin: 0, fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
                        Riders cannot pay and you cannot receive payouts until your Stripe account is verified. This takes about 5 minutes.
                      </p>
                    </div>
                  </div>

                  <button
                    className="pss-btn pss-btn-primary"
                    onClick={handleStripeSetup}
                    disabled={stripeLoading}
                  >
                    <CreditCard size={16} aria-hidden />
                    {stripeLoading ? 'Opening Stripe…' : 'Set up Stripe account'}
                  </button>
                </div>
              )}
            </div>

            {/* Save feedback */}
            {saveMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: saveMsg.ok ? 'rgba(30, 127, 74, 0.08)' : 'rgba(197, 72, 61, 0.08)',
                border: `1px solid ${saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)'}`,
                color: saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)',
                fontSize: 13,
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                marginBottom: 12
              }}>
                {saveMsg.text}
              </div>
            )}

          </div>

          {/* Mobile bottom action bar */}
          {isMobile && (
            <div
              role="toolbar"
              aria-label="Account actions"
              style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 997,
                padding: '10px 16px',
                paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
                borderTop: '0.5px solid var(--bw-border)',
                backgroundColor: 'var(--bw-bg)',
                display: 'flex',
                gap: 10,
                boxSizing: 'border-box'
              }}
            >
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    ...mobileBarBtnBase,
                    backgroundColor: 'transparent',
                    border: '0.5px solid var(--bw-border)',
                    color: 'var(--bw-text)'
                  }}
                >
                  <PencilSimple size={16} aria-hidden />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    style={{
                      ...mobileBarBtnBase,
                      backgroundColor: 'transparent',
                      border: '0.5px solid var(--bw-border)',
                      color: 'var(--bw-text)',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    <X size={16} aria-hidden />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      ...mobileBarBtnBase,
                      backgroundColor: 'var(--bw-accent)',
                      color: '#ffffff',
                      opacity: saving ? 0.7 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FloppyDisk size={16} aria-hidden />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
    </>
  )
}
