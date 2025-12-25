import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { getTenantSettings, updateTenantSettings, updateTenantLogo, testLogoEndpoint, type TenantSettingsResponse, type UpdateTenantSetting } from '@api/tenantSettings'
import { upgradeSubscription } from '@api/subscription'
import { useAuthStore } from '@store/auth'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, User, Building, MapPin, Phone, Mail, Shield, CreditCard, DollarSign, Clock, Car, Palette, Save, Edit, ChevronDown, ChevronUp, XCircle, ArrowUp } from 'lucide-react'

export default function TenantSettings() {
  const [info, setInfo] = useState<any>(null)
  const [tenantSettings, setTenantSettings] = useState<TenantSettingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingSettings, setEditingSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedSettings, setEditedSettings] = useState<UpdateTenantSetting | null>(null)
  // Per-section editing state for laptop screens
  const [editingSections, setEditingSections] = useState<{ [key: string]: boolean }>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    accountInfo: true,
    companyInfo: true,
    subscription: true,
    statistics: true,
    tenantSettings: true,
    branding: true,
    fare: true,
    rider: true
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const navigate = useNavigate()
  
  // Button hover states
  const [isEditAccountInfoHovered, setIsEditAccountInfoHovered] = useState(false)
  const [isEditCompanyInfoHovered, setIsEditCompanyInfoHovered] = useState(false)
  const [isEditSubscriptionHovered, setIsEditSubscriptionHovered] = useState(false)
  const [isEditStatisticsHovered, setIsEditStatisticsHovered] = useState(false)
  const [isCancelEditHovered, setIsCancelEditHovered] = useState(false)
  const [isSaveChangesHovered, setIsSaveChangesHovered] = useState(false)
  const [isEditSettingsHovered, setIsEditSettingsHovered] = useState(false)
  const [isEditBrandingHovered, setIsEditBrandingHovered] = useState(false)
  const [isCancelLogoHovered, setIsCancelLogoHovered] = useState(false)
  const [isSaveLogoHovered, setIsSaveLogoHovered] = useState(false)
  const [isEditFareHovered, setIsEditFareHovered] = useState(false)
  const [isEditRiderHovered, setIsEditRiderHovered] = useState(false)
  
  // Upgrade subscription state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantInfo, settings] = await Promise.all([
          getTenantInfo(),
          getTenantSettings()
        ])
        setInfo(tenantInfo.data)
        setTenantSettings(settings)
        setEditedSettings(settings)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSettingChange = (field: keyof UpdateTenantSetting, value: any) => {
    if (editedSettings) {
      setEditedSettings({
        ...editedSettings,
        [field]: value
      })
    }
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

  const handleSaveLogo = async () => {
    if (!logoFile) {
      alert('Please select a logo file to upload')
      return
    }

    try {
      setSavingLogo(true)
      await updateTenantLogo(logoFile)
      // After successful logo update, refresh the settings to get the new logo URL
      const refreshedSettings = await getTenantSettings()
      setTenantSettings(refreshedSettings)
      setLogoFile(null)
      setLogoPreview(null)
      alert('Logo updated successfully!')
    } catch (error) {
      console.error('Failed to update logo:', error)
      alert('Failed to update logo. Please try again.')
    } finally {
      setSavingLogo(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!editedSettings) return
    
    try {
      setSaving(true)
      const updatedSettings = await updateTenantSettings(editedSettings)
      setTenantSettings(updatedSettings)
      setEditedSettings(updatedSettings)
      setEditingSettings(false)
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }


  const handleCancelEdit = () => {
    setEditedSettings(tenantSettings)
    setEditingSettings(false)
  }

  const handleCancelLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleTestLogoEndpoint = async () => {
    try {
      const result = await testLogoEndpoint()
      alert('Logo endpoint test successful! Check console for details.')
    } catch (error) {
      console.error('Logo endpoint test failed:', error)
      alert('Logo endpoint test failed! Check console for details.')
    }
  }

  const handleUpgradePlan = async (plan: { product_type: string; price_id: string }) => {
    setUpgradingPlan(plan.product_type)
    setUpgradeError(null)

    try {
      const response = await upgradeSubscription({
        price_id: plan.price_id,
        product_type: plan.product_type
      })

      if (response.success) {
        // Close modal and show success - checkout will handle itself
        setShowUpgradeModal(false)
        alert('Subscription upgrade initiated successfully!')
        // Reload data to reflect the new subscription
        const [tenantInfo, settings] = await Promise.all([
          getTenantInfo(),
          getTenantSettings()
        ])
        setInfo(tenantInfo.data)
        setTenantSettings(settings)
        setEditedSettings(settings)
      } else {
        setUpgradeError(response.error || 'Failed to upgrade subscription')
        setUpgradingPlan(null)
      }
    } catch (err: any) {
      setUpgradeError(err?.response?.data?.error || err?.message || 'Failed to upgrade subscription')
      setUpgradingPlan(null)
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
          fontSize: 'clamp(14px, 2vw, 16px)',
          fontFamily: '"Work Sans", sans-serif',
          color: 'var(--bw-muted)'
        }}>
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="bw">
      {/* Header - Left aligned */}
      <div style={{ 
        width: '100%',
        padding: `clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)`,
        marginBottom: 'clamp(24px, 4vw, 32px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <button 
            className="bw-btn-outline" 
            onClick={() => navigate('/tenant/overview')}
            style={{ 
              padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#000000',
              border: '1px solid var(--bw-border)',
              backgroundColor: '#ffffff'
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#000000' }} />
            {isMobile ? 'Back' : 'Back to Dashboard'}
          </button>
          <h1 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            margin: 0,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 200,
            color: 'var(--bw-text)'
          }}>
            Settings
          </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="bw-container" style={{ padding: '0 clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px)' }}>

      {/* Settings Sections */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 'clamp(16px, 3vw, 24px)'
      }}>
        {/* Account Information */}
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <div 
            className="bw-card-header" 
            style={{ 
              cursor: isMobile ? 'pointer' : 'default', 
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: openSections.accountInfo ? 'clamp(12px, 2vw, 16px)' : 0
            }}
            onClick={() => isMobile && toggleSection('accountInfo')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', flex: 1 }}>
              <div className="bw-card-icon" style={{ color: 'var(--bw-text)' }}>
                <User className="w-5 h-5" />
              </div>
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Account Information
              </h3>
            </div>
            {isMobile && (
              openSections.accountInfo ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              )
            )}
            {!isMobile && (
              <button
                className={`bw-btn-outline ${isEditAccountInfoHovered ? 'custom-hover-border' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSections(prev => ({ ...prev, accountInfo: !prev.accountInfo }));
                }}
                onMouseEnter={() => setIsEditAccountInfoHovered(true)}
                onMouseLeave={() => setIsEditAccountInfoHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isEditAccountInfoHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isEditAccountInfoHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isEditAccountInfoHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  backgroundColor: isEditAccountInfoHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isEditAccountInfoHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  {editingSections.accountInfo ? 'Cancel' : 'Edit'}
                </span>
              </button>
            )}
          </div>
          {openSections.accountInfo && (
          <div className="bw-info-grid" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 1.5vw, 12px)'
          }}>
            <div className="bw-info-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 'clamp(6px, 1vw, 8px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <span className="bw-info-label" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                First Name:
              </span>
              <span className="bw-info-value" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>
                {info?.first_name}
              </span>
            </div>
            <div className="bw-info-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 'clamp(6px, 1vw, 8px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <span className="bw-info-label" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Last Name:
              </span>
              <span className="bw-info-value" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>
                {info?.last_name}
              </span>
            </div>
            <div className="bw-info-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 'clamp(6px, 1vw, 8px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <span className="bw-info-label" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Email:
              </span>
              <span className="bw-info-value" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>
                {info?.email}
              </span>
            </div>
            <div className="bw-info-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 'clamp(6px, 1vw, 8px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <span className="bw-info-label" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Phone:
              </span>
              <span className="bw-info-value" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>
                {info?.phone_no}
              </span>
            </div>
            <div className="bw-info-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: 'clamp(6px, 1vw, 8px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <span className="bw-info-label" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Role:
              </span>
              <span className="bw-info-value" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>
                {info?.profile?.role}
              </span>
            </div>
            <div className="bw-info-item" style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span className="bw-info-label" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Member Since:
              </span>
              <span className="bw-info-value" style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>
                {new Date(info?.created_on).toLocaleDateString()}
              </span>
            </div>
          </div>
          )}
        </div>

        {/* Company Information */}
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <div 
            className="bw-card-header" 
            style={{ 
              cursor: isMobile ? 'pointer' : 'default', 
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: openSections.companyInfo ? 'clamp(12px, 2vw, 16px)' : 0
            }}
            onClick={() => isMobile && toggleSection('companyInfo')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', flex: 1 }}>
              <div className="bw-card-icon" style={{ color: 'var(--bw-text)' }}>
                <Building className="w-5 h-5" />
              </div>
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Company Information
              </h3>
            </div>
            {isMobile && (
              openSections.companyInfo ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              )
            )}
            {!isMobile && (
              <button
                className={`bw-btn-outline ${isEditCompanyInfoHovered ? 'custom-hover-border' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSections(prev => ({ ...prev, companyInfo: !prev.companyInfo }));
                }}
                onMouseEnter={() => setIsEditCompanyInfoHovered(true)}
                onMouseLeave={() => setIsEditCompanyInfoHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isEditCompanyInfoHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isEditCompanyInfoHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isEditCompanyInfoHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  backgroundColor: isEditCompanyInfoHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isEditCompanyInfoHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  {editingSections.companyInfo ? 'Cancel' : 'Edit'}
                </span>
              </button>
            )}
          </div>
          {openSections.companyInfo && (
          <div className="bw-info-grid" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 1.5vw, 12px)'
          }}>
            {[
              { label: 'Company Name:', value: info?.profile?.company_name },
              { label: 'Slug:', value: info?.profile?.slug },
              { label: 'City:', value: info?.profile?.city },
              { label: 'Address:', value: info?.profile?.address || 'Not provided' },
              { label: 'Subscription Status:', value: info?.profile?.subscription_status || 'Free', isStatus: true },
              { label: 'Account Status:', value: info?.profile?.subscription_status === 'active' ? 'Active' : info?.profile?.subscription_status || 'Free', isStatus: true }
            ].map((item, idx, arr) => (
              <div key={idx} className="bw-info-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
              }}>
                <span className="bw-info-label" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {item.label}
                </span>
                <span className={`bw-info-value ${item.isStatus && info?.profile?.subscription_status === 'active' ? 'text-green-500' : item.isStatus ? 'text-yellow-500' : ''}`} style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontWeight: 300,
                  fontFamily: '"Work Sans", sans-serif',
                  color: item.isStatus && info?.profile?.subscription_status === 'active' ? 'var(--bw-success)' : item.isStatus ? 'var(--bw-warning)' : 'var(--bw-text)'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Subscription & Billing */}
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <div 
            className="bw-card-header" 
            style={{ 
              cursor: isMobile ? 'pointer' : 'default', 
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: openSections.subscription ? 'clamp(12px, 2vw, 16px)' : 0
            }}
            onClick={() => isMobile && toggleSection('subscription')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', flex: 1 }}>
              <div className="bw-card-icon" style={{ color: 'var(--bw-text)' }}>
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Subscription & Billing
              </h3>
            </div>
            {isMobile && (
              openSections.subscription ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              )
            )}
            {!isMobile && (
              <button
                className={`bw-btn-outline ${isEditSubscriptionHovered ? 'custom-hover-border' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSections(prev => ({ ...prev, subscription: !prev.subscription }));
                }}
                onMouseEnter={() => setIsEditSubscriptionHovered(true)}
                onMouseLeave={() => setIsEditSubscriptionHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isEditSubscriptionHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isEditSubscriptionHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isEditSubscriptionHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  backgroundColor: isEditSubscriptionHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isEditSubscriptionHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  {editingSections.subscription ? 'Cancel' : 'Edit'}
                </span>
              </button>
            )}
          </div>
          {openSections.subscription && (
          <div className="bw-info-grid" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 1.5vw, 12px)'
          }}>
            {[
              { label: 'Subscription Plan:', value: info?.profile?.subscription_plan || 'No plan' },
              { label: 'Subscription Status:', value: info?.profile?.subscription_status || 'N/A' },
              { label: 'Stripe Customer ID:', value: info?.profile?.stripe_customer_id || 'Not connected' },
              { label: 'Stripe Account ID:', value: info?.profile?.stripe_account_id || 'Not connected' }
            ].map((item, idx, arr) => (
              <div key={idx} className="bw-info-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
              }}>
                <span className="bw-info-label" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {item.label}
                </span>
                <span className="bw-info-value" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontWeight: 300,
                  fontFamily: '"Work Sans", sans-serif',
                  color: 'var(--bw-text)'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <div 
            className="bw-card-header" 
            style={{ 
              cursor: isMobile ? 'pointer' : 'default', 
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: openSections.statistics ? 'clamp(12px, 2vw, 16px)' : 0
            }}
            onClick={() => isMobile && toggleSection('statistics')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', flex: 1 }}>
              <div className="bw-card-icon" style={{ color: 'var(--bw-text)' }}>
                <Settings className="w-5 h-5" />
              </div>
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Statistics
              </h3>
            </div>
            {isMobile && (
              openSections.statistics ? (
                <ChevronUp className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              ) : (
                <ChevronDown className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              )
            )}
            {!isMobile && (
              <button
                className={`bw-btn-outline ${isEditStatisticsHovered ? 'custom-hover-border' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSections(prev => ({ ...prev, statistics: !prev.statistics }));
                }}
                onMouseEnter={() => setIsEditStatisticsHovered(true)}
                onMouseLeave={() => setIsEditStatisticsHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isEditStatisticsHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isEditStatisticsHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isEditStatisticsHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  backgroundColor: isEditStatisticsHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isEditStatisticsHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  {editingSections.statistics ? 'Cancel' : 'Edit'}
                </span>
              </button>
            )}
          </div>
          {openSections.statistics && (
          <div className="bw-info-grid" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 1.5vw, 12px)'
          }}>
            {[
              { label: 'Total Drivers:', value: info?.stats?.drivers_count || 0 },
              { label: 'Total Rides:', value: info?.stats?.total_ride_count || 0 },
              { label: 'Daily Rides:', value: info?.stats?.daily_ride_count || 0 },
              { label: 'Last Reset:', value: info?.stats?.last_ride_count_reset ? new Date(info.stats.last_ride_count_reset).toLocaleDateString() : 'N/A' }
            ].map((item, idx, arr) => (
              <div key={idx} className="bw-info-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
              }}>
                <span className="bw-info-label" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {item.label}
                </span>
                <span className="bw-info-value" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontWeight: 300,
                  fontFamily: '"Work Sans", sans-serif',
                  color: 'var(--bw-text)'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Tenant Settings Section */}
      {tenantSettings && (
        <div className="bw-card" style={{ 
          marginTop: 'clamp(16px, 3vw, 24px)',
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div 
            className="bw-card-header" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: isMobile ? 'pointer' : 'default',
              userSelect: 'none',
              marginBottom: openSections.tenantSettings ? 'clamp(12px, 2vw, 16px)' : 0,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: 'clamp(8px, 1.5vw, 12px)'
            }}
            onClick={() => isMobile && toggleSection('tenantSettings')}
          >
            <h3 style={{ 
              margin: 0,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Tenant Settings
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(8px, 1.5vw, 12px)',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              width: isMobile ? '100%' : 'auto'
            }}>
              {editingSettings ? (
                <>
                  <button 
                    className={`bw-btn-outline ${isCancelEditHovered ? 'custom-hover-border' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    onMouseEnter={() => !saving && setIsCancelEditHovered(true)}
                    onMouseLeave={() => setIsCancelEditHovered(false)}
                    disabled={saving}
                    style={{
                      flex: isMobile ? '1 1 100%' : '0 1 auto',
                      minWidth: isMobile ? '100%' : 'auto',
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      justifyContent: 'center',
                      color: isCancelEditHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                      border: isCancelEditHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                      borderColor: isCancelEditHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      backgroundColor: isCancelEditHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isCancelEditHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      Cancel
                    </span>
                  </button>
                  <button 
                    className={`bw-btn bw-btn-action ${isSaveChangesHovered ? 'custom-hover-border' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSaveSettings(); }}
                    onMouseEnter={() => !saving && setIsSaveChangesHovered(true)}
                    onMouseLeave={() => setIsSaveChangesHovered(false)}
                    disabled={saving}
                    style={{
                      flex: isMobile ? '1 1 100%' : '0 1 auto',
                      minWidth: isMobile ? '100%' : 'auto',
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      justifyContent: 'center',
                      backgroundColor: isSaveChangesHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                      color: isSaveChangesHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                      border: isSaveChangesHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                      borderColor: isSaveChangesHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    {saving ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" style={{ 
                          width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                          height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                        }} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button 
                  className={`bw-btn-outline ${isEditSettingsHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setEditingSettings(true); }}
                  onMouseEnter={() => setIsEditSettingsHovered(true)}
                  onMouseLeave={() => setIsEditSettingsHovered(false)}
                  style={{
                    flex: isMobile ? '1 1 100%' : '0 1 auto',
                    minWidth: isMobile ? '100%' : 'auto',
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    justifyContent: 'center',
                    color: isEditSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    border: isEditSettingsHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                    borderColor: isEditSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    backgroundColor: isEditSettingsHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    Edit Settings
                  </span>
                </button>
              )}
              {isMobile && (
                openSections.tenantSettings ? (
                  <ChevronUp className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
                )
              )}
            </div>
          </div>
          {openSections.tenantSettings && (
          <>
          {/* Branding & Theme Settings */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
            <div 
              style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              onClick={() => isMobile && toggleSection('branding')}
            >
              <h4 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)'
              }}>
                <Palette className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                Branding & Theme
              </h4>
              {isMobile && (
                openSections.branding ? (
                  <ChevronUp className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                )
              )}
              {!isMobile && (
                <button
                  className={`bw-btn-outline ${isEditBrandingHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSections(prev => ({ ...prev, branding: !prev.branding }));
                  }}
                  onMouseEnter={() => setIsEditBrandingHovered(true)}
                  onMouseLeave={() => setIsEditBrandingHovered(false)}
                  style={{
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isEditBrandingHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                    borderColor: isEditBrandingHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    color: isEditBrandingHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    backgroundColor: isEditBrandingHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditBrandingHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    {editingSections.branding ? 'Cancel' : 'Edit'}
                  </span>
                </button>
              )}
            </div>
            {openSections.branding && (
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Theme
                </label>
                {editingSettings ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.theme || ''} 
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantSettings.theme || 'Not set'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ 
                gridColumn: isMobile ? 'span 1' : 'span 2',
                width: '100%',
                minWidth: 0
              }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Logo
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)', width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(8px, 1.5vw, 10px)', 
                    flexWrap: 'wrap',
                    width: '100%'
                  }}>
                    <input 
                      className="bw-input" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      style={{ 
                        flex: 1,
                        minWidth: isMobile ? '0' : '200px',
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo Preview" style={{ 
                        width: 'clamp(40px, 5vw, 50px)', 
                        height: 'clamp(40px, 5vw, 50px)', 
                        borderRadius: '4px', 
                        objectFit: 'contain',
                        border: '1px solid var(--bw-border)'
                      }} />
                    )}
                    {!logoPreview && tenantSettings.logo_url && (
                      <img 
                        src={tenantSettings.logo_url} 
                        alt="Current logo" 
                        style={{ 
                          width: 'clamp(40px, 5vw, 50px)', 
                          height: 'clamp(40px, 5vw, 50px)', 
                          borderRadius: '4px',
                          objectFit: 'contain',
                          border: '1px solid var(--bw-border)'
                        }} 
                      />
                    )}
                  </div>
                  {logoFile && (
                    <div style={{ 
                      display: 'flex', 
                      gap: 'clamp(8px, 1.5vw, 12px)', 
                      flexWrap: 'wrap',
                      width: '100%'
                    }}>
                      <button 
                        className={`bw-btn-outline ${isCancelLogoHovered ? 'custom-hover-border' : ''}`}
                        onClick={handleCancelLogo}
                        onMouseEnter={() => !savingLogo && setIsCancelLogoHovered(true)}
                        onMouseLeave={() => setIsCancelLogoHovered(false)}
                        disabled={savingLogo}
                        style={{ 
                          flex: isMobile ? '1 1 100%' : '0 1 auto',
                          minWidth: isMobile ? '100%' : 'auto',
                          padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px', 
                          fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                          justifyContent: 'center',
                          color: isCancelLogoHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                          border: isCancelLogoHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                          borderColor: isCancelLogoHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                          backgroundColor: isCancelLogoHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        } as React.CSSProperties}
                      >
                        <span style={{ color: isCancelLogoHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                          Cancel
                        </span>
                      </button>
                      <button 
                        className={`bw-btn bw-btn-action ${isSaveLogoHovered ? 'custom-hover-border' : ''}`}
                        onClick={handleSaveLogo}
                        onMouseEnter={() => !savingLogo && setIsSaveLogoHovered(true)}
                        onMouseLeave={() => setIsSaveLogoHovered(false)}
                        disabled={savingLogo}
                        style={{ 
                          flex: isMobile ? '1 1 100%' : '0 1 auto',
                          minWidth: isMobile ? '100%' : 'auto',
                          padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px', 
                          fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                          justifyContent: 'center',
                          backgroundColor: isSaveLogoHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                          color: isSaveLogoHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                          border: isSaveLogoHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                          borderColor: isSaveLogoHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        } as React.CSSProperties}
                      >
                        {savingLogo ? (
                          <span>Saving...</span>
                        ) : (
                          <>
                            <Save className="w-4 h-4" style={{ 
                              width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                              height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                            }} />
                            <span>Save Logo</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {!logoFile && tenantSettings.logo_url && (
                    <span className="bw-info-value small-muted" style={{ 
                      fontSize: 'clamp(11px, 1.3vw, 12px)', 
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300
                    }}>
                      Current logo: {tenantSettings.logo_url}
                    </span>
                  )}
                </div>
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Slug
                </label>
                {editingSettings ? (
                  <input 
                    className="bw-input" 
                    type="text" 
                    value={editedSettings?.slug || ''} 
                    onChange={(e) => handleSettingChange('slug', e.target.value)}
                    placeholder="company-name"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantSettings.slug || 'Not set'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Enable Branding
                </label>
                {editingSettings ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.enable_branding ? 'true' : 'false'} 
                    onChange={(e) => handleSettingChange('enable_branding', e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantSettings.enable_branding ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Fare Settings */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
            <div 
              style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              onClick={() => isMobile && toggleSection('fare')}
            >
              <h4 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)'
              }}>
                <DollarSign className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                Fare Configuration
              </h4>
              {isMobile && (
                openSections.fare ? (
                  <ChevronUp className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                )
              )}
              {!isMobile && (
                <button
                  className={`bw-btn-outline ${isEditFareHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSections(prev => ({ ...prev, fare: !prev.fare }));
                  }}
                  onMouseEnter={() => setIsEditFareHovered(true)}
                  onMouseLeave={() => setIsEditFareHovered(false)}
                  style={{
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isEditFareHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                    borderColor: isEditFareHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    color: isEditFareHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    backgroundColor: isEditFareHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditFareHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    {editingSections.fare ? 'Cancel' : 'Edit'}
                  </span>
                </button>
              )}
            </div>
            {openSections.fare && (
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {[
                { label: 'Base Fare ($)', key: 'base_fare', placeholder: '5.00' },
                { label: 'Per Minute Rate ($)', key: 'per_minute_rate', placeholder: '0.50' },
                { label: 'Per Mile Rate ($)', key: 'per_mile_rate', placeholder: '2.50' },
                { label: 'Per Hour Rate ($)', key: 'per_hour_rate', placeholder: '25.00' }
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                  <label className="bw-form-label small-muted" style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    marginBottom: 'clamp(4px, 0.8vw, 6px)'
                  }}>
                    {label}
                  </label>
                  {editingSettings ? (
                    <input 
                      className="bw-input" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      value={editedSettings?.[key as keyof UpdateTenantSetting] as number || 0} 
                      onChange={(e) => handleSettingChange(key as keyof UpdateTenantSetting, parseFloat(e.target.value) || 0)}
                      placeholder={placeholder}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                  ) : (
                    <span className="bw-info-value" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-text)'
                    }}>
                      ${(tenantSettings[key as keyof TenantSettingsResponse] as number) || 0}
                    </span>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Rider Settings */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
            <div 
              style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              onClick={() => isMobile && toggleSection('rider')}
            >
              <h4 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)'
              }}>
                <User className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                Rider Configuration
              </h4>
              {isMobile && (
                openSections.rider ? (
                  <ChevronUp className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <ChevronDown className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                )
              )}
              {!isMobile && (
                <button
                  className={`bw-btn-outline ${isEditRiderHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSections(prev => ({ ...prev, rider: !prev.rider }));
                  }}
                  onMouseEnter={() => setIsEditRiderHovered(true)}
                  onMouseLeave={() => setIsEditRiderHovered(false)}
                  style={{
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isEditRiderHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                    borderColor: isEditRiderHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    color: isEditRiderHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    backgroundColor: isEditRiderHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditRiderHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    {editingSections.rider ? 'Cancel' : 'Edit'}
                  </span>
                </button>
              )}
            </div>
            {openSections.rider && (
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Rider Tiers Enabled
                </label>
                {editingSettings ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.rider_tiers_enabled ? 'true' : 'false'} 
                    onChange={(e) => handleSettingChange('rider_tiers_enabled', e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantSettings.rider_tiers_enabled ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Cancellation Fee ($)
                </label>
                {editingSettings ? (
                  <input 
                    className="bw-input" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={editedSettings?.cancellation_fee || 0} 
                    onChange={(e) => handleSettingChange('cancellation_fee', parseFloat(e.target.value) || 0)}
                    placeholder="10.00"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    ${tenantSettings.cancellation_fee || 0}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Discounts Enabled
                </label>
                {editingSettings ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.discounts ? 'true' : 'false'} 
                    onChange={(e) => handleSettingChange('discounts', e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantSettings.discounts ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Last Updated Info */}
          <div style={{ 
            padding: 'clamp(12px, 2vw, 16px)', 
            backgroundColor: 'var(--bw-bg-secondary)', 
            borderRadius: '4px', 
            marginTop: 'clamp(12px, 2vw, 16px)',
            border: '1px solid var(--bw-border)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(6px, 1vw, 8px)', 
              color: 'var(--bw-muted)', 
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--bw-muted)' }} />
              Last updated: {tenantSettings.updated_on ? new Date(tenantSettings.updated_on).toLocaleString() : 'Never'}
            </div>
          </div>
          </>
          )}
        </div>
      )}
      </div>

      {/* Upgrade Plan Button - Bottom Right */}
      <div style={{
        position: 'fixed',
        bottom: 'clamp(24px, 4vw, 32px)',
        right: 'clamp(24px, 4vw, 32px)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowUpgradeModal(true)}
          style={{
            padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
            fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
            borderRadius: 7,
            backgroundColor: 'var(--bw-accent)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bw-accent)'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bw-accent)'
            e.currentTarget.style.color = '#ffffff'
          }}
        >
          <ArrowUp className="w-4 h-4" style={{ 
            width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
            height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
          }} />
          Upgrade Plan
        </button>
      </div>

      {/* Upgrade Subscription Modal */}
      {showUpgradeModal && (
        <div className="bw-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '900px',
            width: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Upgrade Subscription Plan
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  setShowUpgradeModal(false)
                  setUpgradeError(null)
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              {upgradeError && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: 'var(--bw-error, #C5483D)',
                  color: '#ffffff',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {upgradeError}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: 'clamp(16px, 2.5vw, 24px)',
                marginTop: '16px'
              }}>
                {[
                  {
                    name: 'Starter',
                    product_type: 'starter',
                    price: '$0.00',
                    period: '/month',
                    description: 'Perfect for solo drivers and small fleets.',
                    price_id: 'price_1ShzxJQtWPwjkVcEAMWx8Sgq',
                    features: [
                      { text: 'Up to 5 vehicles', included: true },
                      { text: 'Up to 10 drivers', included: true },
                      { text: 'Basic booking system', included: true },
                      { text: 'Email support', included: true }
                    ]
                  },
                  {
                    name: 'Premium',
                    product_type: 'premium',
                    price: '$100',
                    period: '/month',
                    description: 'Ideal for growing businesses',
                    popular: true,
                    price_id: 'price_1Si00KQtWPwjkVcEa7LKC5EM',
                    features: [
                      { text: 'Up to 25 vehicles', included: true },
                      { text: 'Up to 50 drivers', included: true },
                      { text: 'Advanced booking system', included: true },
                      { text: 'Email & phone support', included: true },
                      { text: 'Custom branding', included: true },
                      { text: 'Advanced analytics', included: true }
                    ]
                  },
                  {
                    name: 'Diamond',
                    product_type: 'diamond',
                    price: '$300',
                    period: '/month',
                    description: 'For large fleets and enterprises',
                    price_id: 'price_1Si01bQtWPwjkVcEMk6XJREA',
                    features: [
                      { text: 'Unlimited vehicles', included: true },
                      { text: 'Unlimited drivers', included: true },
                      { text: 'Enterprise booking system', included: true },
                      { text: '24/7 dedicated support', included: true },
                      { text: 'Custom branding', included: true },
                      { text: 'Advanced analytics', included: true }
                    ]
                  }
                ].map((plan) => {
                  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'
                  const planOrder = ['starter', 'premium', 'diamond']
                  const currentPlanIndex = planOrder.indexOf(currentPlan)
                  const planIndex = planOrder.indexOf(plan.product_type)
                  const isCurrentPlan = currentPlan === plan.product_type
                  const isLowerPlan = planIndex < currentPlanIndex
                  const isDisabled = isCurrentPlan || isLowerPlan

                  const CheckIcon = () => (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-success)' }}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )

                  return (
                    <div
                      key={plan.product_type}
                      className="bw-card"
                      style={{
                        padding: 'clamp(20px, 3vw, 24px)',
                        borderRadius: 'clamp(8px, 1.5vw, 12px)',
                        border: plan.popular && !isDisabled ? '2px solid var(--bw-accent)' : '1px solid var(--bw-border)',
                        position: 'relative',
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        backgroundColor: 'var(--bw-bg-secondary)'
                      }}
                    >
                      {plan.popular && !isDisabled && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'var(--bw-accent)',
                          color: '#ffffff',
                          padding: '4px 16px',
                          fontSize: 'clamp(11px, 1.3vw, 12px)',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          borderRadius: '4px'
                        }}>
                          Most Popular
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'var(--bw-muted)',
                          color: '#ffffff',
                          padding: '4px 16px',
                          fontSize: 'clamp(11px, 1.3vw, 12px)',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          borderRadius: '4px'
                        }}>
                          Current Plan
                        </div>
                      )}
                      <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2.5vw, 20px)' }}>
                        <h4 style={{
                          fontFamily: '"DM Sans", sans-serif',
                          fontSize: 'clamp(20px, 3vw, 24px)',
                          fontWeight: 400,
                          color: 'var(--bw-text)',
                          marginBottom: 'clamp(8px, 1.5vw, 12px)'
                        }}>{plan.name}</h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'center',
                          gap: 'clamp(4px, 1vw, 8px)',
                          marginBottom: 'clamp(8px, 1.5vw, 12px)'
                        }}>
                          <span style={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: 'clamp(28px, 4vw, 36px)',
                            fontWeight: 200,
                            color: 'var(--bw-text)'
                          }}>{plan.price}</span>
                          <span style={{
                            fontFamily: '"Work Sans", sans-serif',
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: 'var(--bw-muted)'
                          }}>{plan.period}</span>
                        </div>
                        <p style={{
                          fontFamily: '"Work Sans", sans-serif',
                          fontSize: 'clamp(12px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>{plan.description}</p>
                        <button
                          className={plan.popular && !isDisabled ? "bw-btn" : "bw-btn-outline"}
                          onClick={() => !isDisabled && handleUpgradePlan(plan)}
                          disabled={isDisabled || upgradingPlan !== null}
                          style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 2.5vw, 20px)',
                            width: '100%',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: upgradingPlan === plan.product_type ? 0.6 : 1,
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 600,
                            borderRadius: 7
                          }}
                        >
                          {upgradingPlan === plan.product_type ? 'Processing...' : isCurrentPlan ? 'Current Plan' : isLowerPlan ? 'Lower Plan' : 'Upgrade'}
                        </button>
                      </div>
                      <div style={{
                        borderTop: '1px solid var(--bw-border)',
                        paddingTop: 'clamp(16px, 2.5vw, 20px)',
                        marginTop: 'clamp(16px, 2.5vw, 20px)'
                      }}>
                        <ul style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(8px, 1.5vw, 12px)'
                        }}>
                          {plan.features.map((feature, idx) => (
                            <li key={idx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'clamp(8px, 1.5vw, 12px)'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {feature.included ? <CheckIcon /> : null}
                              </div>
                              <span style={{
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: 'clamp(12px, 1.5vw, 14px)',
                                color: feature.included ? 'var(--bw-text)' : 'var(--bw-muted)'
                              }}>{feature.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 