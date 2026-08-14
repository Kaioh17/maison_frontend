import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { User, Buildings, CreditCard, TrendUp, CheckCircle, Warning } from '@phosphor-icons/react'
import { useSettingsMenu } from '@components/SettingsMenuBar'

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      fontSize: 12, fontWeight: 500, fontFamily: '"Work Sans", sans-serif',
      backgroundColor: ok ? 'rgba(30, 127, 74, 0.1)' : 'rgba(0,0,0,0.06)',
      color: ok ? 'var(--bw-success)' : 'var(--bw-muted)'
    }}>
      {ok ? <CheckCircle weight="fill" size={13} aria-hidden /> : <Warning weight="fill" size={13} aria-hidden />}
      {label}
    </span>
  )
}

export default function GeneralView() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isWide, setIsWide] = useState(window.innerWidth >= 1600)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768)
      setIsWide(window.innerWidth >= 1600)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh' }}>
        <span style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
          Loading...
        </span>
      </div>
    )
  }

  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'
  const subscriptionStatus = info?.profile?.subscription_status || 'free'
  const isVerified = !!info?.is_verified

  const sectionCard: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bw-bg-secondary)',
    border: '1px solid var(--bw-border)',
    borderRadius: 10,
    padding: isMobile ? '16px' : '20px 24px'
  }

  const sectionHeading: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 16, paddingBottom: 12,
    borderBottom: '1px solid var(--bw-border)'
  }

  // Rows stretch to fill whatever height the grid row gives the card, so a
  // shorter card (e.g. Company, 5 rows) spaces its rows out to match a taller
  // neighbor (Account, 7 rows) instead of leaving one dead gap at the bottom.
  const rowsWrap: React.CSSProperties = {
    display: 'flex', flexDirection: 'column',
    flex: 1, justifyContent: 'space-between'
  }

  const sectionTitle: React.CSSProperties = {
    margin: 0, fontSize: 13, fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
    letterSpacing: '0.03em', textTransform: 'uppercase'
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 12, padding: '8px 0',
    borderBottom: '1px solid var(--bw-border)'
  }

  const lastRowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 12, padding: '8px 0'
  }

  const rowLabel: React.CSSProperties = {
    fontSize: 13, fontWeight: 400, color: 'var(--bw-muted)',
    fontFamily: '"Work Sans", sans-serif', flexShrink: 0
  }

  const rowValue: React.CSSProperties = {
    fontSize: 13, fontWeight: 400, fontFamily: '"Work Sans", sans-serif',
    color: 'var(--bw-text)', textAlign: 'right', overflowWrap: 'anywhere', minWidth: 0
  }

  return (
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
              padding: isMobile ? '16px' : '24px 28px 32px',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Page header — title and description are direct children, no wrapper div.
                The h1 is desktop-only: the mobile top bar (SettingsMenuBar) already shows the
                section title there, so repeating it here would be a second heading. */}
            {!isMobile && (
              <h1 style={{
                margin: '0 0 4px', fontSize: 17, fontWeight: 500,
                fontFamily: '"DM Sans", sans-serif', color: 'var(--bw-text)'
              }}>
                Overview
              </h1>
            )}
            <p style={{
              margin: '0 0 24px', fontSize: 13, fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4
            }}>
              A summary of your account, company, and subscription details.
            </p>

            {(() => {
              const accountCard = (
                <div style={sectionCard}>
                  <div style={sectionHeading}>
                    <User size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                    <h2 style={sectionTitle}>Account</h2>
                  </div>
                  <div style={rowsWrap}>
                    <div style={rowStyle}>
                      <span style={rowLabel}>First Name</span>
                      <span style={rowValue}>{info?.first_name || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Last Name</span>
                      <span style={rowValue}>{info?.last_name || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Email</span>
                      <span style={rowValue}>{info?.email || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Phone</span>
                      <span style={rowValue}>{info?.phone_no || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Role</span>
                      <span style={rowValue}>{info?.profile?.role || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Verified</span>
                      <StatusBadge ok={isVerified} label={isVerified ? 'Verified' : 'Pending'} />
                    </div>
                    <div style={lastRowStyle}>
                      <span style={rowLabel}>Member Since</span>
                      <span style={rowValue}>
                        {info?.created_on ? new Date(info.created_on).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )

              const companyCard = (
                <div style={sectionCard}>
                  <div style={sectionHeading}>
                    <Buildings size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                    <h2 style={sectionTitle}>Company</h2>
                  </div>
                  <div style={rowsWrap}>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Company Name</span>
                      <span style={rowValue}>{info?.profile?.company_name || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Slug</span>
                      <span style={rowValue}>{info?.profile?.slug || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>City</span>
                      <span style={rowValue}>{info?.profile?.city || '—'}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Address</span>
                      <span style={rowValue}>{info?.profile?.address || '—'}</span>
                    </div>
                    <div style={lastRowStyle}>
                      <span style={rowLabel}>Subscription</span>
                      <StatusBadge
                        ok={subscriptionStatus === 'active'}
                        label={subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
                      />
                    </div>
                  </div>
                </div>
              )

              const billingCard = (
                <div style={sectionCard}>
                  <div style={sectionHeading}>
                    <CreditCard size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                    <h2 style={sectionTitle}>Billing</h2>
                  </div>
                  <div style={rowsWrap}>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Plan</span>
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
                    <div style={rowStyle}>
                      <span style={rowLabel}>Status</span>
                      <StatusBadge
                        ok={subscriptionStatus === 'active'}
                        label={subscriptionStatus === 'active' ? 'Active' : (subscriptionStatus || 'Free')}
                      />
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Stripe Customer</span>
                      <span style={rowValue}>
                        {info?.profile?.stripe_customer_id
                          ? `••••${info.profile.stripe_customer_id.slice(-6)}`
                          : 'Not connected'}
                      </span>
                    </div>
                    <div style={lastRowStyle}>
                      <span style={rowLabel}>Stripe Account</span>
                      <span style={rowValue}>
                        {info?.profile?.stripe_account_id
                          ? `••••${info.profile.stripe_account_id.slice(-6)}`
                          : 'Not connected'}
                      </span>
                    </div>
                  </div>
                </div>
              )

              const statsCard = (
                <div style={sectionCard}>
                  <div style={sectionHeading}>
                    <TrendUp size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                    <h2 style={sectionTitle}>Statistics</h2>
                  </div>
                  <div style={rowsWrap}>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Total Drivers</span>
                      <span style={rowValue}>{info?.stats?.drivers_count ?? 0}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Total Rides</span>
                      <span style={rowValue}>{info?.stats?.total_ride_count ?? 0}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={rowLabel}>Daily Rides</span>
                      <span style={rowValue}>{info?.stats?.daily_ride_count ?? 0}</span>
                    </div>
                    <div style={lastRowStyle}>
                      <span style={rowLabel}>Last Reset</span>
                      <span style={rowValue}>
                        {info?.stats?.last_ride_count_reset
                          ? new Date(info.stats.last_ride_count_reset).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? '1fr'
                    : isWide
                      ? 'repeat(3, 1fr)'
                      : 'repeat(auto-fit, minmax(360px, 1fr))',
                  alignItems: 'stretch',
                  gap: 12
                }}>
                  {accountCard}
                  {companyCard}
                  {/* 1600px+: Billing and Statistics stack into the 3rd column
                      instead of each claiming a whole row's worth of empty width. */}
                  {isWide ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ flex: 1, minHeight: 0 }}>{billingCard}</div>
                      <div style={{ flex: 1, minHeight: 0 }}>{statsCard}</div>
                    </div>
                  ) : (
                    <>
                      {billingCard}
                      {statsCard}
                    </>
                  )}
                </div>
              )
            })()}

            {/* Save feedback (upgrade outcomes) */}
            {saveMsg && (
              <div style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                backgroundColor: saveMsg.ok ? 'rgba(30, 127, 74, 0.08)' : 'rgba(197, 72, 61, 0.08)',
                border: `1px solid ${saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)'}`,
                color: saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)',
                fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 400
              }}>
                {saveMsg.text}
              </div>
            )}

          </div>
        </div>
  )
}
