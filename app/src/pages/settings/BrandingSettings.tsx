import { useState, useEffect } from 'react'
import { getTenantConfig, updateTenantBranding, updateTenantLogo, type TenantBrandingData } from '@api/tenantSettings'
import { useNavigate } from 'react-router-dom'
import { Palette, Save, Edit, X } from 'lucide-react'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

export default function BrandingSettings() {
  const [branding, setBranding] = useState<TenantBrandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isSaveHovered, setIsSaveHovered] = useState(false)
  const [isCancelHovered, setIsCancelHovered] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)
  const navigate = useNavigate()

  const [editedData, setEditedData] = useState<TenantBrandingData>({
    theme: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    favicon_url: '',
    slug: '',
    email_from_name: '',
    email_from_address: '',
    logo_url: '',
    enable_branding: false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await getTenantConfig('branding')
        if (config.branding) {
          setBranding(config.branding)
          setEditedData(config.branding)
        }
      } catch (error) {
        console.error('Failed to load branding data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleInputChange = (field: keyof TenantBrandingData, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveLogo = async () => {
    if (!logoFile && !faviconFile) return

    try {
      setSavingLogo(true)
      await updateTenantLogo(logoFile || undefined, faviconFile || undefined)
      const refreshedConfig = await getTenantConfig('branding')
      if (refreshedConfig.branding) {
        setBranding(refreshedConfig.branding)
        setEditedData(refreshedConfig.branding)
      }
      setLogoFile(null)
      setLogoPreview(null)
      setFaviconFile(null)
      setFaviconPreview(null)
      const messages = []
      if (logoFile) messages.push('Logo')
      if (faviconFile) messages.push('Favicon')
      alert(`${messages.join(' and ')} updated successfully!`)
    } catch (error) {
      console.error('Failed to update logo/favicon:', error)
      alert('Failed to update logo/favicon. Please try again.')
    } finally {
      setSavingLogo(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateTenantBranding({
        theme: editedData.theme,
        primary_color: editedData.primary_color,
        secondary_color: editedData.secondary_color,
        accent_color: editedData.accent_color,
        favicon_url: editedData.favicon_url,
        slug: editedData.slug,
        email_from_name: editedData.email_from_name,
        email_from_address: editedData.email_from_address,
        enable_branding: editedData.enable_branding
      })
      setBranding(updated)
      setEditedData(updated)
      setIsEditing(false)
      alert('Branding settings updated successfully!')
    } catch (error: any) {
      console.error('Failed to update:', error)
      alert('Failed to update branding settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (branding) {
      setEditedData(branding)
    }
    setIsEditing(false)
    setLogoFile(null)
    setLogoPreview(null)
    setFaviconFile(null)
    setFaviconPreview(null)
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
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar />
      
      {/* Main Content */}
      <div style={{ 
        marginLeft: isMobile ? '0' : (menuIsOpen ? '20%' : '64px'),
        transition: 'margin-left 0.3s ease',
        width: isMobile ? '100%' : (menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)'),
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ 
          width: '100%',
          maxWidth: '100%',
          padding: `clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)`,
          marginBottom: 'clamp(24px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 'clamp(12px, 2vw, 16px)' }}>
            <h1 style={{ 
              fontSize: 'clamp(24px, 4vw, 32px)', 
              margin: 0,
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 200,
              color: 'var(--bw-text)'
            }}>
              Branding Settings
            </h1>
          {!isEditing ? (
            <button
              className={`bw-btn-outline ${isEditHovered ? 'custom-hover-border' : ''}`}
              onClick={() => setIsEditing(true)}
              onMouseEnter={() => setIsEditHovered(true)}
              onMouseLeave={() => setIsEditHovered(false)}
              style={{
                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                borderRadius: 7,
                border: isEditHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                borderColor: isEditHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                color: isEditHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                backgroundColor: isEditHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                transition: 'all 0.2s ease'
              } as React.CSSProperties}
            >
              <Edit className="w-4 h-4" style={{ 
                width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
              }} />
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
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  borderRadius: 7,
                  border: isCancelHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCancelHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCancelHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  backgroundColor: isCancelHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <X className="w-4 h-4" style={{ 
                  width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                  height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                }} />
                <span>Cancel</span>
              </button>
              <button
                className={`bw-btn bw-btn-action ${isSaveHovered ? 'custom-hover-border' : ''}`}
                onClick={handleSave}
                onMouseEnter={() => !saving && setIsSaveHovered(true)}
                onMouseLeave={() => setIsSaveHovered(false)}
                disabled={saving}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  borderRadius: 7,
                  backgroundColor: isSaveHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                  color: isSaveHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                  border: isSaveHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                  borderColor: isSaveHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <Save className="w-4 h-4" style={{ 
                  width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                  height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                }} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>
        </div>

        {/* Content Container */}
      <div className="bw-container" style={{ 
        padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 'clamp(16px, 2vw, 24px)',
            width: '100%',
            maxWidth: '100%'
          }}>
            {[
              { label: 'Theme', field: 'theme', type: 'select', options: ['light', 'dark', 'auto'], description: 'Default theme for your application interface' },
              { label: 'Primary Color', field: 'primary_color', type: 'color', description: 'Main brand color used throughout the application' },
              { label: 'Secondary Color', field: 'secondary_color', type: 'color', description: 'Secondary brand color for accents and highlights' },
              { label: 'Accent Color', field: 'accent_color', type: 'color', description: 'Accent color for buttons and interactive elements' },
              { label: 'Slug', field: 'slug', type: 'text', description: 'Unique identifier for your tenant (used in URLs)' },
              { label: 'Email From Name', field: 'email_from_name', type: 'text', description: 'Display name shown in emails sent to users' },
              { label: 'Email From Address', field: 'email_from_address', type: 'email', description: 'Email address used as sender for system emails' },
              { label: 'Favicon URL', field: 'favicon_url', type: 'url', description: 'URL to your favicon icon (shown in browser tabs)' },
              { label: 'Enable Branding', field: 'enable_branding', type: 'checkbox', description: 'Enable custom branding across the application' }
            ].map((item) => (
              <div key={item.field} className="bw-form-group" style={{ 
                gridColumn: item.field === 'favicon_url' || item.field === 'enable_branding' ? (isMobile ? 'span 1' : 'span 2') : 'span 1'
              }}>
                <div style={{ marginBottom: 'clamp(4px, 0.8vw, 6px)' }}>
                  <label className="bw-form-label small-muted" style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    display: 'block',
                    marginBottom: item.description ? '2px' : '0'
                  }}>
                    {item.label}
                  </label>
                  {item.description && (
                    <span style={{
                      fontSize: 'clamp(10px, 1.2vw, 11px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      opacity: 0.7,
                      display: 'block',
                      lineHeight: 1.3
                    }}>
                      {item.description}
                    </span>
                  )}
                </div>
                {isEditing ? (
                  item.type === 'select' ? (
                    <select
                      value={editedData[item.field as keyof TenantBrandingData] as string || ''}
                      onChange={(e) => handleInputChange(item.field as keyof TenantBrandingData, e.target.value)}
                      className="bw-input"
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    >
                      {item.options?.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  ) : item.type === 'checkbox' ? (
                    <select
                      value={editedData[item.field as keyof TenantBrandingData] ? 'true' : 'false'}
                      onChange={(e) => handleInputChange(item.field as keyof TenantBrandingData, e.target.value === 'true')}
                      className="bw-input"
                      style={{
                        width: '100%',
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
                  ) : item.type === 'color' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1vw, 8px)', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', width: '100%' }}>
                        <input
                          type="color"
                          value={editedData[item.field as keyof TenantBrandingData] as string || '#ffffff'}
                          onChange={(e) => handleInputChange(item.field as keyof TenantBrandingData, e.target.value)}
                          style={{
                            width: 'clamp(50px, 7vw, 60px)',
                            height: 'clamp(40px, 5vw, 45px)',
                            padding: '0',
                            border: '1px solid var(--bw-border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />
                        <input
                          type="text"
                          value={editedData[item.field as keyof TenantBrandingData] as string || ''}
                          onChange={(e) => handleInputChange(item.field as keyof TenantBrandingData, e.target.value)}
                          placeholder="#000000"
                          className="bw-input"
                          style={{
                            flex: 1,
                            padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            fontFamily: '"Work Sans", sans-serif',
                            borderRadius: 0,
                            color: 'var(--bw-text)',
                            backgroundColor: 'var(--bw-bg)',
                            border: '1px solid var(--bw-border)'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: '50%',
                          height: '15px',
                          borderRadius: '4px',
                          backgroundColor: (editedData[item.field as keyof TenantBrandingData] as string) || '#ffffff',
                          border: '1px solid var(--bw-border)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  ) : (
                    <input
                      type={item.type}
                      value={editedData[item.field as keyof TenantBrandingData] as string || ''}
                      onChange={(e) => handleInputChange(item.field as keyof TenantBrandingData, e.target.value)}
                      className="bw-input"
                      style={{
                        width: '100%',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                  )
                ) : item.type === 'color' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(6px, 1vw, 8px)' }}>
                    <div style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-text)',
                      padding: 'clamp(12px, 2vw, 16px) 0'
                    }}>
                      {editedData[item.field as keyof TenantBrandingData] as string || 'N/A'}
                    </div>
                    <div
                      style={{
                        width: '50%',
                        height: '15px',
                        borderRadius: '4px',
                        backgroundColor: (editedData[item.field as keyof TenantBrandingData] as string) || '#ffffff',
                        border: '1px solid var(--bw-border)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)',
                    padding: 'clamp(12px, 2vw, 16px) 0'
                  }}>
                    {item.type === 'checkbox' 
                      ? (editedData[item.field as keyof TenantBrandingData] ? 'Yes' : 'No')
                      : (editedData[item.field as keyof TenantBrandingData] as string || 'N/A')
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logo Upload Section */}
          <div style={{ marginTop: 'clamp(24px, 4vw, 32px)', paddingTop: 'clamp(24px, 4vw, 32px)', borderTop: '1px solid var(--bw-border)' }}>
            <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <h4 style={{ 
                margin: '0 0 4px 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Logo
              </h4>
              <span style={{
                fontSize: 'clamp(10px, 1.2vw, 11px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                opacity: 0.7,
                display: 'block',
                lineHeight: 1.3
              }}>
                Upload your company logo to display across the application
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoChange}
                  className="bw-input"
                  style={{ 
                    flex: 1,
                    minWidth: isMobile ? '100%' : '200px',
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
                    width: 'clamp(60px, 8vw, 80px)', 
                    height: 'clamp(60px, 8vw, 80px)', 
                    borderRadius: '4px', 
                    objectFit: 'contain',
                    border: '1px solid var(--bw-border)'
                  }} />
                )}
                {!logoPreview && branding?.logo_url && (
                  <img 
                    src={branding.logo_url} 
                    alt="Current logo" 
                    style={{ 
                      width: 'clamp(60px, 8vw, 80px)', 
                      height: 'clamp(60px, 8vw, 80px)', 
                      borderRadius: '4px',
                      objectFit: 'contain',
                      border: '1px solid var(--bw-border)'
                    }} 
                  />
                )}
              </div>
              {!logoFile && branding?.logo_url && (
                <span style={{ 
                  fontSize: 'clamp(11px, 1.3vw, 12px)', 
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300
                }}>
                  Current logo: {branding.logo_url}
                </span>
              )}
            </div>
          </div>

          {/* Favicon Upload Section */}
          <div style={{ marginTop: 'clamp(24px, 4vw, 32px)', paddingTop: 'clamp(24px, 4vw, 32px)', borderTop: '1px solid var(--bw-border)' }}>
            <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <h4 style={{ 
                margin: '0 0 4px 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Favicon
              </h4>
              <span style={{
                fontSize: 'clamp(10px, 1.2vw, 11px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-muted)',
                opacity: 0.7,
                display: 'block',
                lineHeight: 1.3
              }}>
                Upload your favicon icon to display in browser tabs (recommended: 32x32 or 16x16 pixels)
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFaviconChange}
                  className="bw-input"
                  style={{ 
                    flex: 1,
                    minWidth: isMobile ? '100%' : '200px',
                    padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    borderRadius: 0,
                    color: 'var(--bw-text)',
                    backgroundColor: 'var(--bw-bg)',
                    border: '1px solid var(--bw-border)'
                  }}
                />
                {faviconPreview && (
                  <img src={faviconPreview} alt="Favicon Preview" style={{ 
                    width: 'clamp(32px, 5vw, 48px)', 
                    height: 'clamp(32px, 5vw, 48px)', 
                    borderRadius: '4px', 
                    objectFit: 'contain',
                    border: '1px solid var(--bw-border)'
                  }} />
                )}
                {!faviconPreview && branding?.favicon_url && (
                  <img 
                    src={branding.favicon_url} 
                    alt="Current favicon" 
                    style={{ 
                      width: 'clamp(32px, 5vw, 48px)', 
                      height: 'clamp(32px, 5vw, 48px)', 
                      borderRadius: '4px',
                      objectFit: 'contain',
                      border: '1px solid var(--bw-border)'
                    }} 
                  />
                )}
              </div>
              {!faviconFile && branding?.favicon_url && (
                <span style={{ 
                  fontSize: 'clamp(11px, 1.3vw, 12px)', 
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300
                }}>
                  Current favicon: {branding.favicon_url}
                </span>
              )}
            </div>
          </div>

          {/* Upload Button (for both logo and favicon) */}
          {(logoFile || faviconFile) && (
            <div style={{ marginTop: 'clamp(16px, 2.5vw, 20px)' }}>
              <button
                className="bw-btn bw-btn-action"
                onClick={handleSaveLogo}
                disabled={savingLogo}
                style={{
                  padding: 'clamp(12px, 2vw, 16px) clamp(20px, 4vw, 24px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  borderRadius: 7,
                  backgroundColor: 'var(--bw-accent)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: savingLogo ? 'not-allowed' : 'pointer',
                  opacity: savingLogo ? 0.6 : 1
                }}
              >
                {savingLogo ? 'Uploading...' : `Upload ${logoFile && faviconFile ? 'Logo & Favicon' : logoFile ? 'Logo' : 'Favicon'}`}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

