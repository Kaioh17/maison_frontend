import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { User, Save, Edit, X, CreditCard, ArrowUp } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'
import { http } from '@api/http'
import { setupStripeAccount } from '@api/tenantSettings'
import { List as ListIcon, X as XIcon } from '@phosphor-icons/react'

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: 'var(--bw-muted)',
  fontFamily: '"Work Sans", sans-serif'
}

/** Short section titles (e.g. Company Information) — 13px / 500, muted label without all-caps. */
const sectionHeadingMuted: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--bw-muted)',
  fontFamily: '"Work Sans", sans-serif'
}

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  fontFamily: '"Work Sans", sans-serif',
  color: 'var(--bw-text)'
}

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(72px + env(safe-area-inset-bottom, 0px))'

export default function AccountInformation() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen, toggleMenu, setSuppressMobileFloatingMenu } = useSettingsMenu()
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isSaveHovered, setIsSaveHovered] = useState(false)
  const [isCancelHovered, setIsCancelHovered] = useState(false)
  const [isStripeSetupLoading, setIsStripeSetupLoading] = useState(false)
  const [isStripeButtonHovered, setIsStripeButtonHovered] = useState(false)
  const [mobileEditHovered, setMobileEditHovered] = useState(false)
  const [mobileUpgradeHovered, setMobileUpgradeHovered] = useState(false)
  const [mobileCancelHovered, setMobileCancelHovered] = useState(false)
  const [mobileSaveHovered, setMobileSaveHovered] = useState(false)
  const navigate = useNavigate()

  const [editedData, setEditedData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_no: ''
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setSuppressMobileFloatingMenu(isMobile)
    return () => setSuppressMobileFloatingMenu(false)
  }, [isMobile, setSuppressMobileFloatingMenu])

  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
        setEditedData({
          first_name: tenantInfo.data?.first_name || '',
          last_name: tenantInfo.data?.last_name || '',
          email: tenantInfo.data?.email || '',
          phone_no: tenantInfo.data?.phone_no || ''
        })
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await http.patch('/v1/tenant/', editedData)
      const tenantInfo = await getTenantInfo()
      setInfo(tenantInfo.data)
      setIsEditing(false)
      alert('Account information updated successfully!')
    } catch (error: any) {
      console.error('Failed to update:', error)
      alert('Failed to update account information. Please try again.')
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

  const handleCompleteAccountSetup = async () => {
    try {
      setIsStripeSetupLoading(true)
      const response = await setupStripeAccount()
      if (response?.onboarding_link) {
        window.open(response.onboarding_link, '_blank', 'noopener,noreferrer')
      } else {
        alert('Failed to get onboarding link. Please try again.')
      }
    } catch (error: any) {
      console.error('Failed to setup Stripe account:', error)
      alert('Failed to setup Stripe account. Please try again.')
    } finally {
      setIsStripeSetupLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bw bw-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: 'clamp(16px, 3vw, 24px) 0'
      }}>
        <div className="bw-loading" style={{
          fontSize: '14px',
          fontWeight: 400,
          fontFamily: '"Work Sans", sans-serif',
          color: 'var(--bw-muted)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'
  const showUpgrade = currentPlan !== 'fleet'

  const mobileBarBtnBase: React.CSSProperties = {
    flex: '1 1 0',
    minWidth: 0,
    minHeight: 44,
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif',
    borderRadius: 7,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
  }

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar>
      <div style={{ 
        marginLeft: isMobile ? '0' : (menuIsOpen ? '20%' : '64px'),
        transition: 'margin-left 0.3s ease',
        width: isMobile ? '100%' : (menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)'),
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1
      }}>
        {isMobile && (
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 997,
              padding: '12px 16px',
              backgroundColor: 'var(--bw-bg)',
              borderBottom: '0.5px solid var(--bw-border)',
              flexShrink: 0
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                minWidth: 0
              }}
            >
              <button
                type="button"
                onClick={toggleMenu}
                aria-label={menuIsOpen ? 'Close menu' : 'Open menu'}
                style={{
                  padding: 0,
                  margin: 0,
                  width: 20,
                  height: 20,
                  flex: '0 0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--bw-text)'
                }}
              >
                {menuIsOpen ? (
                  <XIcon weight="regular" size={20} aria-hidden />
                ) : (
                  <ListIcon weight="regular" size={20} aria-hidden />
                )}
              </button>
              <h1
                style={{
                  margin: 0,
                  flex: 1,
                  minWidth: 0,
                  fontSize: '17px',
                  fontWeight: 500,
                  fontFamily: '"DM Sans", sans-serif',
                  color: 'var(--bw-text)',
                  lineHeight: 1.25
                }}
              >
                Account Information
              </h1>
            </div>
          </header>
        )}

        <div
          className="bw-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: isMobile
              ? `0 16px ${MOBILE_SCROLL_BOTTOM_PAD}`
              : `0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)`,
            maxWidth: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box'
          }}
        >
        {!isMobile && (
        <div style={{ 
          width: '100%',
          maxWidth: '100%',
          padding: `clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)`,
          marginBottom: 'clamp(24px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 'clamp(12px, 2vw, 16px)' }}>
            <h1 style={{ 
              fontSize: '17px', 
              margin: 0,
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              color: 'var(--bw-text)'
            }}>
              Account Information
            </h1>
          {!isEditing ? (
            <button
              className={`bw-btn-outline ${isEditHovered ? 'custom-hover-border' : ''}`}
              onClick={() => setIsEditing(true)}
              onMouseEnter={() => setIsEditHovered(true)}
              onMouseLeave={() => setIsEditHovered(false)}
              style={{
                padding: '14px 24px',
                fontSize: '14px',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 7,
                border: isEditHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                borderColor: isEditHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                color: isEditHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                backgroundColor: isEditHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                transition: 'all 0.2s ease'
              } as React.CSSProperties}
            >
              <Edit className="w-4 h-4" style={{ width: 18, height: 18 }} />
              <span>Edit</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap' }}>
              <button
                className={`bw-btn-outline ${isCancelHovered ? 'custom-hover-border' : ''}`}
                onClick={handleCancel}
                onMouseEnter={() => setIsCancelHovered(true)}
                onMouseLeave={() => setIsCancelHovered(false)}
                disabled={saving}
                style={{
                  padding: '14px 24px',
                  fontSize: '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 7,
                  border: isCancelHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCancelHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCancelHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  backgroundColor: isCancelHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <X className="w-4 h-4" style={{ width: 18, height: 18 }} />
                <span>Cancel</span>
              </button>
              <button
                className={`bw-btn bw-btn-action ${isSaveHovered ? 'custom-hover-border' : ''}`}
                onClick={handleSave}
                onMouseEnter={() => !saving && setIsSaveHovered(true)}
                onMouseLeave={() => setIsSaveHovered(false)}
                disabled={saving}
                style={{
                  padding: '14px 24px',
                  fontSize: '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: 7,
                  backgroundColor: isSaveHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                  color: isSaveHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                  border: isSaveHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                  borderColor: isSaveHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <Save className="w-4 h-4" style={{ width: 18, height: 18 }} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>
        </div>
        )}

        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)',
          marginTop: isMobile ? 16 : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
            <User className="w-5 h-5" style={{ color: 'var(--bw-muted)', width: 18, height: 18, flexShrink: 0 }} />
            <span style={sectionLabelStyle}>
              Personal Information
            </span>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 'clamp(16px, 2vw, 24px)',
            width: '100%',
            maxWidth: '100%'
          }}>
            {[
              { label: 'First Name', field: 'first_name', type: 'text' },
              { label: 'Last Name', field: 'last_name', type: 'text' },
              { label: 'Email', field: 'email', type: 'email' },
              { label: 'Phone', field: 'phone_no', type: 'tel' },
              { label: 'Account Verified', field: 'is_verified', type: 'display', value: info?.is_verified ? 'Yes' : 'No' }
            ].map((item) => (
              <div key={item.field} className="bw-form-group">
                <label
                  className="bw-form-label small-muted"
                  style={{
                    ...bodyStyle,
                    color: 'var(--bw-muted)',
                    display: 'block',
                    marginBottom: 'clamp(4px, 0.8vw, 6px)'
                  }}
                >
                  {item.label}
                </label>
                {item.type === 'display' ? (
                  <div style={{
                    ...bodyStyle,
                    padding: 'clamp(12px, 2vw, 16px) 0'
                  }}>
                    {item.value || 'N/A'}
                  </div>
                ) : isEditing ? (
                  <input
                    type={item.type}
                    value={editedData[item.field as keyof typeof editedData]}
                    onChange={(e) => handleInputChange(item.field, e.target.value)}
                    className="bw-input"
                    style={{
                      width: '100%',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: '14px',
                      fontWeight: 400,
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                ) : (
                  <div style={{
                    ...bodyStyle,
                    padding: 'clamp(12px, 2vw, 16px) 0'
                  }}>
                    {editedData[item.field as keyof typeof editedData] || 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div id="complete-account-setup" style={{ 
            marginTop: 'clamp(24px, 4vw, 32px)', 
            paddingTop: 'clamp(24px, 4vw, 32px)', 
            borderTop: '1px solid var(--bw-border)' 
          }}>
            <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <div style={{ ...sectionHeadingMuted, marginBottom: 6 }}>
                Complete Account Setup
              </div>
              <span style={{
                ...bodyStyle,
                color: 'var(--bw-muted)',
                display: 'block',
                lineHeight: 1.45
              }}>
                Complete your Stripe account setup to enable payment processing
              </span>
            </div>
            <button
              className={`bw-btn bw-btn-action ${isStripeButtonHovered && !info?.is_verified ? 'custom-hover-border' : ''}`}
              onClick={handleCompleteAccountSetup}
              onMouseEnter={() => !isStripeSetupLoading && !info?.is_verified && setIsStripeButtonHovered(true)}
              onMouseLeave={() => setIsStripeButtonHovered(false)}
              disabled={isStripeSetupLoading || info?.is_verified}
              style={{
                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                fontSize: '14px',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                borderRadius: 7,
                backgroundColor: info?.is_verified 
                  ? 'var(--bw-bg-secondary)' 
                  : (isStripeButtonHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)'),
                color: info?.is_verified 
                  ? 'var(--bw-muted)' 
                  : (isStripeButtonHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff'),
                border: info?.is_verified 
                  ? '1px solid var(--bw-border)' 
                  : (isStripeButtonHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none'),
                borderColor: info?.is_verified 
                  ? 'var(--bw-border)' 
                  : (isStripeButtonHovered ? 'rgba(155, 97, 209, 0.81)' : undefined),
                transition: 'all 0.2s ease',
                cursor: (isStripeSetupLoading || info?.is_verified) ? 'not-allowed' : 'pointer',
                opacity: (isStripeSetupLoading || info?.is_verified) ? 0.6 : 1
              } as React.CSSProperties}
            >
              <CreditCard className="w-4 h-4" style={{ 
                width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                opacity: info?.is_verified ? 0.5 : 1
              }} />
              <span>{isStripeSetupLoading ? 'Setting up...' : (info?.is_verified ? 'Account Setup Complete' : 'Complete Account Setup')}</span>
            </button>
          </div>
        </div>

        {!isMobile && (
        <UpgradePlanButton 
          currentPlan={currentPlan}
          onUpgradeClick={() => navigate('/tenant/settings/plans')}
          isMobile={false}
        />
        )}
      </div>

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
            padding: '12px 16px',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            borderTop: '0.5px solid var(--bw-border)',
            backgroundColor: 'var(--bw-bg-secondary)',
            display: 'flex',
            gap: 12,
            boxSizing: 'border-box'
          }}
        >
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                onMouseEnter={() => setMobileEditHovered(true)}
                onMouseLeave={() => setMobileEditHovered(false)}
                style={{
                  ...mobileBarBtnBase,
                  backgroundColor: 'transparent',
                  border: '0.5px solid var(--bw-border)',
                  color: mobileEditHovered ? 'var(--bw-accent)' : 'var(--bw-text)',
                  borderColor: mobileEditHovered ? 'var(--bw-accent)' : 'var(--bw-border)'
                }}
              >
                <Edit style={{ width: 16, height: 16 }} aria-hidden />
                <span>Edit</span>
              </button>
              {showUpgrade ? (
                <button
                  type="button"
                  onClick={() => navigate('/tenant/settings/plans')}
                  onMouseEnter={() => setMobileUpgradeHovered(true)}
                  onMouseLeave={() => setMobileUpgradeHovered(false)}
                  style={{
                    ...mobileBarBtnBase,
                    backgroundColor: mobileUpgradeHovered ? 'var(--bw-bg-hover-strong)' : 'var(--bw-accent)',
                    border: 'none',
                    color: '#ffffff'
                  }}
                >
                  <ArrowUp style={{ width: 16, height: 16 }} aria-hidden />
                  <span>Upgrade Plan</span>
                </button>
              ) : null}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                onMouseEnter={() => setMobileCancelHovered(true)}
                onMouseLeave={() => setMobileCancelHovered(false)}
                style={{
                  ...mobileBarBtnBase,
                  backgroundColor: 'transparent',
                  border: '0.5px solid var(--bw-border)',
                  color: mobileCancelHovered ? 'var(--bw-accent)' : 'var(--bw-text)',
                  borderColor: mobileCancelHovered ? 'var(--bw-accent)' : 'var(--bw-border)',
                  opacity: saving ? 0.6 : 1
                }}
              >
                <X style={{ width: 16, height: 16 }} aria-hidden />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={() => !saving && setMobileSaveHovered(true)}
                onMouseLeave={() => setMobileSaveHovered(false)}
                style={{
                  ...mobileBarBtnBase,
                  backgroundColor: mobileSaveHovered ? 'var(--bw-bg-hover-strong)' : 'var(--bw-accent)',
                  border: 'none',
                  color: '#ffffff',
                  opacity: saving ? 0.7 : 1
                }}
              >
                <Save style={{ width: 16, height: 16 }} aria-hidden />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
      </SettingsMenuBar>
    </div>
  )
}
