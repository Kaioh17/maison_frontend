import { useState, useEffect } from 'react'
import { getTenantConfig, updateTenantBranding, updateTenantLogo, type TenantBrandingData } from '@api/tenantSettings'
import { Palette, FloppyDisk, PencilSimple, X, CaretDown, CaretUp, Image } from '@phosphor-icons/react'
import { useSettingsMenu } from '@components/SettingsMenuBar'
import { SETTINGS_BTN_CSS } from './settingsButtonCss'

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(80px + env(safe-area-inset-bottom, 0px))'

export default function BrandingSettings() {
  const [branding, setBranding] = useState<TenantBrandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)
  const [colorsOpen, setColorsOpen] = useState(true)

  const [editedData, setEditedData] = useState<TenantBrandingData>({
    theme: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    background_color: '',
    surface_color: '',
    text_color: '',
    text_muted_color: '',
    button_text_color: '',
    favicon_url: '',
    slug: '',
    email_from_name: '',
    email_from_address: '',
    phone: '',
    logo_url: '',
    enable_branding: false
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
      reader.onload = (e) => setLogoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFaviconFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setFaviconPreview(e.target?.result as string)
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
      setSaveMsg({ ok: true, text: `${messages.join(' and ')} updated.` })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (error) {
      console.error('Failed to update logo/favicon:', error)
      setSaveMsg({ ok: false, text: 'Failed to update logo/favicon. Please try again.' })
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
        background_color: editedData.background_color,
        surface_color: editedData.surface_color,
        text_color: editedData.text_color,
        text_muted_color: editedData.text_muted_color,
        button_text_color: editedData.button_text_color,
        favicon_url: editedData.favicon_url,
        slug: editedData.slug,
        email_from_name: editedData.email_from_name,
        email_from_address: editedData.email_from_address,
        phone: editedData.phone,
        enable_branding: editedData.enable_branding
      })
      setBranding(updated)
      setEditedData(updated)
      setIsEditing(false)
      setSaveMsg({ ok: true, text: 'Branding settings updated.' })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (error: any) {
      console.error('Failed to update:', error)
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (branding) setEditedData(branding)
    setIsEditing(false)
    setLogoFile(null)
    setLogoPreview(null)
    setFaviconFile(null)
    setFaviconPreview(null)
  }

  type FieldItem = {
    label: string
    field: keyof TenantBrandingData
    type: 'select' | 'color' | 'checkbox' | 'text' | 'email' | 'url'
    options?: string[]
    description: string
  }

  const colorFields: FieldItem[] = [
    { label: 'Primary', field: 'primary_color', type: 'color', description: 'Main brand color — primary buttons, links, focus rings, active states.' },
    { label: 'Secondary', field: 'secondary_color', type: 'color', description: 'Lighter complementary brand color — subtle accents, hover tints, secondary highlights.' },
    { label: 'Accent', field: 'accent_color', type: 'color', description: 'Darker variant of Primary used for hover/pressed states on brand buttons and emphasized borders.' },
    { label: 'Background', field: 'background_color', type: 'color', description: 'Page background color rendered behind everything else.' },
    { label: 'Surface', field: 'surface_color', type: 'color', description: 'Color of elevated surfaces — cards, modals, dropdown menus, form input fills.' },
    { label: 'Text', field: 'text_color', type: 'color', description: 'Primary text color used for body copy, headings, and labels.' },
    { label: 'Muted Text', field: 'text_muted_color', type: 'color', description: 'Secondary text color for captions, helper hints, and placeholder text.' },
    { label: 'Button Text', field: 'button_text_color', type: 'color', description: 'Text and icon color rendered inside primary brand-filled buttons.' },
  ]

  const otherFields: FieldItem[] = [
    { label: 'Theme', field: 'theme', type: 'select', options: ['light', 'dark', 'auto'], description: 'Default theme for your application interface.' },
    { label: 'Slug', field: 'slug', type: 'text', description: 'Unique identifier for your tenant (used in URLs).' },
    { label: 'Email From Name', field: 'email_from_name', type: 'text', description: 'Display name shown in emails sent to users.' },
    { label: 'Email From Address', field: 'email_from_address', type: 'email', description: 'Email address used as sender for system emails.' },
    { label: 'Brand Contact Phone', field: 'phone', type: 'text', description: 'Public business phone shown to riders in the app contact menu.' },
    { label: 'Favicon URL', field: 'favicon_url', type: 'url', description: 'URL to your favicon icon (shown in browser tabs).' },
    { label: 'Enable Branding', field: 'enable_branding', type: 'checkbox', description: 'Enable custom branding across the application.' },
  ]

  const renderField = (item: FieldItem) => {
    const spanTwo = (item.field === 'favicon_url' || item.field === 'enable_branding') && !isMobile
    return (
      <div key={item.field} style={{ gridColumn: spanTwo ? 'span 2' : 'span 1', minWidth: 0 }}>
        <label style={{
          display: 'block', fontSize: 12, fontWeight: 500,
          fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
          marginBottom: 2, letterSpacing: '0.02em'
        }}>
          {item.label}
        </label>
        <p style={{
          margin: '0 0 6px', fontSize: 11, fontFamily: '"Work Sans", sans-serif',
          fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.3
        }}>
          {item.description}
        </p>
        {isEditing ? (
          item.type === 'select' ? (
            <select
              value={editedData[item.field] as string || ''}
              onChange={e => handleInputChange(item.field, e.target.value)}
              className="bw-input"
              style={{
                width: '100%', padding: '10px 12px', fontSize: 14,
                fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                border: '1px solid var(--bw-border)'
              }}
            >
              {item.options?.map(opt => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          ) : item.type === 'checkbox' ? (
            <select
              value={editedData[item.field] ? 'true' : 'false'}
              onChange={e => handleInputChange(item.field, e.target.value === 'true')}
              className="bw-input"
              style={{
                width: '100%', padding: '10px 12px', fontSize: 14,
                fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                border: '1px solid var(--bw-border)'
              }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : item.type === 'color' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={editedData[item.field] as string || '#ffffff'}
                  onChange={e => handleInputChange(item.field, e.target.value)}
                  style={{
                    width: 52, height: 40, padding: 0,
                    border: '1px solid var(--bw-border)', borderRadius: 4,
                    cursor: 'pointer', flexShrink: 0
                  }}
                />
                <input
                  type="text"
                  value={editedData[item.field] as string || ''}
                  onChange={e => handleInputChange(item.field, e.target.value)}
                  placeholder="#000000"
                  className="bw-input"
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: 14,
                    fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                    color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                    border: '1px solid var(--bw-border)'
                  }}
                />
              </div>
              <div style={{
                width: '50%', height: 14, borderRadius: 4,
                backgroundColor: (editedData[item.field] as string) || '#ffffff',
                border: '1px solid var(--bw-border)'
              }} />
            </div>
          ) : (
            <input
              type={item.type}
              value={editedData[item.field] as string || ''}
              onChange={e => handleInputChange(item.field, e.target.value)}
              className="bw-input"
              style={{
                width: '100%', padding: '10px 12px', fontSize: 14,
                fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                border: '1px solid var(--bw-border)', boxSizing: 'border-box'
              }}
            />
          )
        ) : item.type === 'color' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, color: 'var(--bw-text)', padding: '10px 0' }}>
              {editedData[item.field] as string || '—'}
            </div>
            <div style={{
              width: '50%', height: 14, borderRadius: 4,
              backgroundColor: (editedData[item.field] as string) || '#ffffff',
              border: '1px solid var(--bw-border)'
            }} />
          </div>
        ) : (
          <div style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, color: 'var(--bw-text)', padding: '10px 0', overflowWrap: 'anywhere' }}>
            {item.type === 'checkbox'
              ? (editedData[item.field] ? 'Yes' : 'No')
              : ((editedData[item.field] as string) || <span style={{ color: 'var(--bw-muted)' }}>—</span>)
            }
          </div>
        )}
      </div>
    )
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

  const mobileBarBtnBase: React.CSSProperties = {
    flex: '1 1 0', minWidth: 0, minHeight: 44,
    fontSize: 14, fontWeight: 500, fontFamily: '"Work Sans", sans-serif',
    borderRadius: 7, cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', transition: 'opacity 0.15s ease'
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
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 16, paddingBottom: 12,
    borderBottom: '1px solid var(--bw-border)'
  }

  const sectionTitle: React.CSSProperties = {
    margin: 0, fontSize: 13, fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
    letterSpacing: '0.03em', textTransform: 'uppercase'
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
              display: 'grid', gridTemplateColumns: '1fr auto',
              columnGap: 16, marginBottom: 24
            }}>
              {!isMobile && (
                <h1 style={{
                  gridColumn: 1, gridRow: 1,
                  margin: '0 0 4px', fontSize: 17, fontWeight: 500,
                  fontFamily: '"DM Sans", sans-serif', color: 'var(--bw-text)'
                }}>
                  Branding
                </h1>
              )}
              <p style={{
                gridColumn: 1, gridRow: 2,
                margin: 0, fontSize: 13, fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4
              }}>
                Customize your brand palette, identity, and contact details.
              </p>

              {!isMobile && (
                <div style={{ gridColumn: 2, gridRow: '1 / span 2', alignSelf: 'start', display: 'flex', gap: 8, flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button className="pss-btn pss-btn-outline" onClick={handleCancel} disabled={saving}>
                        <X size={16} aria-hidden /> Cancel
                      </button>
                      <button className="pss-btn pss-btn-primary" onClick={handleSave} disabled={saving}>
                        <FloppyDisk size={16} aria-hidden />
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button className="pss-btn pss-btn-outline" onClick={() => setIsEditing(true)}>
                      <PencilSimple size={16} aria-hidden /> Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── General Settings card ────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Palette size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>General Settings</h2>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 16 : '16px 24px'
              }}>
                {otherFields.map(renderField)}
              </div>
            </div>

            {/* ── Colors card (collapsible) ────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Palette size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Colors</h2>
                <button
                  type="button"
                  onClick={() => setColorsOpen(o => !o)}
                  aria-expanded={colorsOpen}
                  aria-controls="branding-colors-panel"
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 400,
                    color: 'var(--bw-muted)', padding: 0
                  }}
                >
                  {colorsOpen
                    ? <CaretUp size={14} aria-hidden />
                    : <CaretDown size={14} aria-hidden />}
                  {colorsOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>
              {colorsOpen && (
                <div
                  id="branding-colors-panel"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? 16 : '16px 24px'
                  }}
                >
                  {colorFields.map(renderField)}
                </div>
              )}
              {!colorsOpen && (
                <p style={{ margin: 0, fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)' }}>
                  Brand palette used across the application.
                </p>
              )}
            </div>

            {/* ── Assets card ──────────────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Image size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Logo & Favicon</h2>
              </div>

              {/* Logo */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                  Logo
                </p>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
                  Displayed across the application. Use a PNG or SVG with transparent background.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="bw-input"
                    style={{
                      flex: 1, minWidth: isMobile ? '100%' : 200,
                      padding: '10px 12px', fontSize: 14,
                      fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                      color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                  {(logoPreview || branding?.logo_url) && (
                    <img
                      src={logoPreview || branding?.logo_url || undefined}
                      alt="Logo"
                      style={{ width: 72, height: 72, borderRadius: 4, objectFit: 'contain', border: '1px solid var(--bw-border)', flexShrink: 0 }}
                    />
                  )}
                </div>
                {!logoFile && branding?.logo_url && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', overflowWrap: 'anywhere' }}>
                    Current: {branding.logo_url}
                  </p>
                )}
              </div>

              {/* Favicon */}
              <div style={{ paddingTop: 20, borderTop: '1px solid var(--bw-border)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                  Favicon
                </p>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
                  Shown in browser tabs. Recommended size: 32×32 px.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconChange}
                    className="bw-input"
                    style={{
                      flex: 1, minWidth: isMobile ? '100%' : 200,
                      padding: '10px 12px', fontSize: 14,
                      fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                      color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                  {(faviconPreview || branding?.favicon_url) && (
                    <img
                      src={faviconPreview || branding?.favicon_url || undefined}
                      alt="Favicon"
                      style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'contain', border: '1px solid var(--bw-border)', flexShrink: 0 }}
                    />
                  )}
                </div>
                {!faviconFile && branding?.favicon_url && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', overflowWrap: 'anywhere' }}>
                    Current: {branding.favicon_url}
                  </p>
                )}
              </div>

              {/* Upload button */}
              {(logoFile || faviconFile) && (
                <div style={{ marginTop: 20 }}>
                  <button
                    className="pss-btn pss-btn-primary"
                    onClick={handleSaveLogo}
                    disabled={savingLogo}
                  >
                    <Image size={16} aria-hidden />
                    {savingLogo ? 'Uploading…' : `Upload ${logoFile && faviconFile ? 'Logo & Favicon' : logoFile ? 'Logo' : 'Favicon'}`}
                  </button>
                </div>
              )}
            </div>

            {/* Save feedback */}
            {saveMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                backgroundColor: saveMsg.ok ? 'rgba(30, 127, 74, 0.08)' : 'rgba(197, 72, 61, 0.08)',
                border: `1px solid ${saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)'}`,
                color: saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)',
                fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, marginBottom: 12
              }}>
                {saveMsg.text}
              </div>
            )}
          </div>

          {/* Mobile bottom action bar */}
          {isMobile && (
            <div
              role="toolbar"
              aria-label="Branding actions"
              style={{
                position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 997,
                padding: '10px 16px',
                paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
                borderTop: '0.5px solid var(--bw-border)', backgroundColor: 'var(--bw-bg)',
                display: 'flex', gap: 10, boxSizing: 'border-box'
              }}
            >
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)}
                  style={{ ...mobileBarBtnBase, backgroundColor: 'transparent',
                    border: '0.5px solid var(--bw-border)', color: 'var(--bw-text)' }}>
                  <PencilSimple size={16} aria-hidden /> Edit
                </button>
              ) : (
                <>
                  <button type="button" onClick={handleCancel} disabled={saving}
                    style={{ ...mobileBarBtnBase, backgroundColor: 'transparent',
                      border: '0.5px solid var(--bw-border)', color: 'var(--bw-text)',
                      opacity: saving ? 0.6 : 1 }}>
                    <X size={16} aria-hidden /> Cancel
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving}
                    style={{ ...mobileBarBtnBase, backgroundColor: 'var(--bw-accent)',
                      color: '#ffffff', opacity: saving ? 0.7 : 1,
                      cursor: saving ? 'not-allowed' : 'pointer' }}>
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
