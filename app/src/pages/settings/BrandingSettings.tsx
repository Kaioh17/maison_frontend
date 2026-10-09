import { useState, useEffect } from 'react'
import { getTenantConfig, updateTenantBranding, updateTenantLogo, type TenantBrandingData } from '@api/tenantSettings'
import { Palette, FloppyDisk, PencilSimple, X, Image } from '@phosphor-icons/react'
import Toggle from '@components/Toggle'
import Button from '@components/Button'
import BrandingPhonePreview from '@components/BrandingPhonePreview'
import ColorEditor from '@components/ColorEditor'
import { COLOR_PRESETS } from '@utils/brandingPresets'
import { COLOR_ROLES, type ColorRole } from '@utils/brandingRoles'
import { cssColorToHex } from '@utils/colorTokens'
import { BRAND_FONTS, FONT_ROLES, FONT_SCOPES, fontStack, type FontField } from '@utils/brandFonts'
import { SETTINGS_BTN_CSS } from './settingsButtonCss'

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(80px + env(safe-area-inset-bottom, 0px))'

// The page scrolls in SettingsMenuBar's main panel (so the scrollbar sits on the screen edge);
// the phone preview is sticky inside it and drops under the form when there isn't room beside it.
const BRANDING_LAYOUT_CSS = `
.branding-page { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; align-items: start; box-sizing: border-box; padding: 16px 20px 24px; }
.branding-preview { position: sticky; top: 16px; }
@media (max-width: 1100px) {
  .branding-page { grid-template-columns: minmax(0, 1fr); }
  .branding-preview { position: static; }
}
`
const SWATCH_CSS = `
.bswatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.bswatch { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 8px 12px; text-align: left; border: 1px solid var(--bw-border); border-radius: 10px; background: var(--bw-bg); color: var(--bw-text); font-family: "Work Sans", sans-serif; cursor: pointer; }
.bswatch:hover { border-color: var(--bw-border-strong); }
.bswatch[aria-pressed="true"] { border-color: var(--bw-accent); box-shadow: 0 0 0 1px var(--bw-accent); }
.bswatch:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.bswatch-chip { flex: none; width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--bw-border-strong); }
.bswatch-chip.is-unset { background: repeating-linear-gradient(135deg, transparent 0 4px, var(--bw-border) 4px 5px); }
.bswatch-text { display: flex; flex-direction: column; min-width: 0; }
.bswatch-label { font-size: 13px; font-weight: 500; }
.bswatch-hex { font-size: 12px; color: var(--bw-muted); font-variant-numeric: tabular-nums; text-transform: lowercase; }
.bpresets { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-bottom: 14px; }
.bpreset { display: flex; flex-direction: column; gap: 8px; padding: 8px; text-align: left; border: 1px solid var(--bw-border); border-radius: 10px; background: var(--bw-bg); color: var(--bw-text); font-family: "Work Sans", sans-serif; cursor: pointer; }
.bpreset:hover { border-color: var(--bw-border-strong); }
.bpreset:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.bpreset-chips { display: flex; height: 28px; border-radius: 6px; overflow: hidden; border: 1px solid var(--bw-border-strong); }
.bpreset-chips span { flex: 1; }
.branding-preview { display: flex; flex-direction: column; gap: 16px; }
`
const FONT_CSS = `
.bfonts { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.bfont { display: flex; flex-direction: column; gap: 2px; min-height: 64px; padding: 8px 12px; text-align: left; border: 1px solid var(--bw-border); border-radius: 10px; background: var(--bw-bg); color: var(--bw-text); cursor: pointer; }
.bfont:hover { border-color: var(--bw-border-strong); }
.bfont[aria-checked="true"] { border-color: var(--bw-accent); box-shadow: 0 0 0 1px var(--bw-accent); }
.bfont:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.bfont-aa { font-size: 22px; line-height: 1.1; }
.bfont-name { font-family: "Work Sans", sans-serif; font-size: 12px; color: var(--bw-muted); }
.bfont-sample { margin: 4px 0 0; font-size: 22px; line-height: 1.25; color: var(--bw-text); overflow-wrap: anywhere; }
`
const FIELD_GRID_COLUMNS = 'repeat(auto-fill, minmax(260px, 1fr))'

export default function BrandingSettings() {
  const [branding, setBranding] = useState<TenantBrandingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)
  // The color being edited, with the app's current value for it (seeds the picker while unset).
  const [active, setActive] = useState<{ role: ColorRole; fallback: string } | null>(null)

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
    font_heading: '',
    font_body: '',
    font_accent: '',
    font_scope: 'rider',
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

  const handleInputChange = (field: keyof TenantBrandingData, value: string | boolean) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const applyPreset = ({ name: _name, ...colors }: (typeof COLOR_PRESETS)[number]) => {
    setEditedData(prev => ({ ...prev, ...colors }))
    setIsEditing(true)
  }

  const selectColor = (role: ColorRole) => {
    const info = COLOR_ROLES.find(r => r.role === role)!
    const screen = document.querySelector('[data-preview-screen]')
    const current = screen ? cssColorToHex(getComputedStyle(screen).getPropertyValue(info.cssVar)) : null
    setActive({ role, fallback: current ?? '#000000' })
    if (!isEditing) setIsEditing(true)
    // Below 1100px the editor sits under the form, so bring it into view.
    requestAnimationFrame(() => document.querySelector('.branding-preview')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
  }

  const [openFont, setOpenFont] = useState<FontField | null>(null)
  const pickFont = (field: FontField, name: string) => {
    setIsEditing(true)
    setOpenFont(null)
    handleInputChange(field, name)
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
        font_heading: editedData.font_heading ?? '',
        font_body: editedData.font_body ?? '',
        font_accent: editedData.font_accent ?? '',
        font_scope: editedData.font_scope || 'rider',
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
      setActive(null)
      setSaveMsg({ ok: true, text: 'Branding settings updated.' })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (error) {
      console.error('Failed to update:', error)
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (branding) setEditedData(branding)
    setIsEditing(false)
    setActive(null)
    setLogoFile(null)
    setLogoPreview(null)
    setFaviconFile(null)
    setFaviconPreview(null)
  }

  type FieldItem = {
    label: string
    field: keyof TenantBrandingData
    type: 'select' | 'checkbox' | 'text' | 'email' | 'url'
    options?: string[]
    description: string
  }

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
    const fullRow = item.field === 'favicon_url' || item.field === 'enable_branding'
    return (
      <div key={item.field} style={{ gridColumn: fullRow ? '1 / -1' : 'auto', minWidth: 0 }}>
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
        {item.type === 'checkbox' ? (
          <Toggle
            checked={!!editedData[item.field]}
            onChange={v => {
              if (!isEditing) setIsEditing(true)
              handleInputChange(item.field, v)
            }}
          />
        ) : isEditing ? (
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
        ) : (
          <div style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, color: 'var(--bw-text)', padding: '10px 0', overflowWrap: 'anywhere' }}>
            {(editedData[item.field] as string) || <span style={{ color: 'var(--bw-muted)' }}>—</span>}
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
      <style>{BRANDING_LAYOUT_CSS}</style>
      <style>{SWATCH_CSS}</style>
      <style>{FONT_CSS}</style>
      <div
        className="branding-page"
        style={{
          maxWidth: '100%',
          flexShrink: 0, // the main panel is a flex column; don't let it squash the page and break the sticky preview
          padding: isMobile ? `12px 12px ${MOBILE_SCROLL_BOTTOM_PAD}` : undefined
        }}
      >
        <div style={{ minWidth: 0 }}>
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
                gridTemplateColumns: isMobile ? '1fr' : FIELD_GRID_COLUMNS,
                gap: isMobile ? 16 : '16px 24px'
              }}>
                {otherFields.map(renderField)}
              </div>
            </div>

            {/* ── Colors card: pick a color here or click a part of the phone preview ── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Palette size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Colors</h2>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                  Select one, or click the phone
                </span>
              </div>
              {!editedData.enable_branding && (
                <div className="bw-notice bw-notice-err" role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span>Branding is off, so riders still see the default colors.</span>
                  <Button variant="secondary" onClick={() => { setIsEditing(true); handleInputChange('enable_branding', true) }}>Turn on branding</Button>
                </div>
              )}
              <div className="bpresets" role="group" aria-label="Color combinations">
                {COLOR_PRESETS.map(p => (
                  <button key={p.name} type="button" className="bpreset" onClick={() => applyPreset(p)}>
                    <span className="bpreset-chips" aria-hidden>
                      {[p.background_color, p.surface_color, p.primary_color, p.secondary_color, p.text_color].map((c, i) => <span key={i} style={{ background: c ?? undefined }} />)}
                    </span>
                    <span className="bswatch-label">{p.name}</span>
                  </button>
                ))}
              </div>
              <div className="bswatches" role="list">
                {COLOR_ROLES.map(r => {
                  const value = (editedData[r.field] as string) || ''
                  return (
                    <button
                      key={r.role}
                      type="button"
                      role="listitem"
                      className="bswatch"
                      aria-pressed={active?.role === r.role}
                      onClick={() => selectColor(r.role)}
                    >
                      <span className={`bswatch-chip${value ? '' : ' is-unset'}`} style={value ? { background: value } : undefined} aria-hidden />
                      <span className="bswatch-text">
                        <span className="bswatch-label">{r.label}</span>
                        <span className="bswatch-hex">{value || 'Default'}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
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

            {/* ── Appearance: fonts are live, corner style is not wired yet ── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Palette size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Appearance</h2>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                  Up to three fonts, one per use
                </span>
              </div>
              {!editedData.enable_branding && (
                <div className="bw-notice bw-notice-err" role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span>Branding is off, so riders still see the default fonts.</span>
                  <Button variant="secondary" onClick={() => { setIsEditing(true); handleInputChange('enable_branding', true) }}>Turn on branding</Button>
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>Where fonts apply</p>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 300, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', lineHeight: 1.4 }}>
                  Each step adds a place. The phone preview on the right shows the app you pick there.
                </p>
                <div className="bfonts" role="radiogroup" aria-label="Where fonts apply">
                  {FONT_SCOPES.map(sc => (
                    <button
                      key={sc.id}
                      type="button"
                      role="radio"
                      aria-checked={(editedData.font_scope || 'rider') === sc.id}
                      className="bfont"
                      onClick={() => { setIsEditing(true); handleInputChange('font_scope', sc.id) }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{sc.label}</span>
                      <span className="bfont-name">{sc.surfaces.map(x => x === 'landing' ? 'landing page' : `${x} app`).join(', ').replace(/^./, c => c.toUpperCase())}</span>
                    </button>
                  ))}
                </div>
              </div>
              {FONT_ROLES.map((r, i) => {
                const current = editedData[r.field] || r.fallback
                const open = openFont === r.field
                return (
                  <div key={r.field} style={{ paddingTop: i ? 16 : 0, marginTop: i ? 16 : 0, borderTop: i ? '1px solid var(--bw-border)' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                          {r.label} <span style={{ fontWeight: 300 }}>- {current}. {r.description}</span>
                        </p>
                        <p className="bfont-sample" style={{ fontFamily: fontStack(current) }}>{r.sample}</p>
                      </div>
                      <Button variant="secondary" style={{ minWidth: 84, flex: 'none' }} aria-expanded={open} onClick={() => setOpenFont(open ? null : r.field)}>
                        {open ? 'Close' : 'Change'}
                      </Button>
                    </div>
                    {open && (
                      <div className="bfonts" role="radiogroup" aria-label={`${r.label} font`} style={{ marginTop: 12 }}>
                        {BRAND_FONTS.map(f => (
                          <button
                            key={f.name}
                            type="button"
                            role="radio"
                            aria-checked={current === f.name}
                            className="bfont"
                            onClick={() => pickFont(r.field, f.name === r.fallback ? '' : f.name)}
                          >
                            <span className="bfont-aa" style={{ fontFamily: fontStack(f.name) }}>Aa Gg 123</span>
                            <span className="bfont-name">{f.name}{f.name === r.fallback ? ' (default)' : ''}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="bw-soon" aria-disabled="true" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--bw-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  Corner style <span className="bw-soon-tag">Not connected</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Square', 'Rounded', 'Pill'].map(o => (
                    <Button key={o} variant="secondary" disabled tabIndex={-1}>{o}</Button>
                  ))}
                </div>
              </div>
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

        <aside className="branding-preview" aria-label="Live preview">
          <BrandingPhonePreview
            branding={editedData}
            logoUrl={logoPreview || editedData.logo_url}
            companyName={editedData.email_from_name || editedData.slug}
            selected={active?.role ?? null}
            onSelect={selectColor}
          />
          {active && (() => {
            const info = COLOR_ROLES.find(r => r.role === active.role)!
            return (
              <ColorEditor
                key={active.role}
                label={info.label}
                description={info.description}
                value={(editedData[info.field] as string) || ''}
                fallback={active.fallback}
                onChange={hex => handleInputChange(info.field, hex)}
                onClose={() => setActive(null)}
              />
            )
          })()}
        </aside>

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
                      color: 'white', opacity: saving ? 0.7 : 1,
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
