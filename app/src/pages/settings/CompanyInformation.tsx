import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { Buildings, FloppyDisk, PencilSimple, X } from '@phosphor-icons/react'
import { useSettingsMenu } from '@components/SettingsMenuBar'
import { http } from '@api/http'
import { SETTINGS_BTN_CSS } from './settingsButtonCss'

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(80px + env(safe-area-inset-bottom, 0px))'

function Field({
  label, helper, editing, type = 'text', value, onChange
}: {
  label: string; helper?: string; editing?: boolean
  type?: string; value: string; onChange?: (v: string) => void
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500,
        fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
        marginBottom: 4, letterSpacing: '0.02em'
      }}>
        {label}
      </label>
      {editing ? (
        <>
          <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
            className="bw-input"
            style={{
              width: '100%', padding: '10px 12px', fontSize: 14,
              fontFamily: '"Work Sans", sans-serif', fontWeight: 400, borderRadius: 6,
              color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
              border: '1px solid var(--bw-border)', boxSizing: 'border-box'
            }} />
          {helper && (
            <p style={{ margin: '4px 0 0', fontSize: 12, fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
              {helper}
            </p>
          )}
        </>
      ) : (
        <div style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400,
          color: value ? 'var(--bw-text)' : 'var(--bw-muted)', padding: '10px 0', overflowWrap: 'anywhere' }}>
          {value || <span style={{ color: 'var(--bw-muted)' }}>—</span>}
        </div>
      )}
    </div>
  )
}

export default function CompanyInformation() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const { isOpen: menuIsOpen } = useSettingsMenu()

  const [editedData, setEditedData] = useState({
    company_name: '',
    slug: '',
    city: '',
    address: ''
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
        setEditedData({
          company_name: tenantInfo.data?.profile?.company_name || '',
          slug: tenantInfo.data?.profile?.slug || '',
          city: tenantInfo.data?.profile?.city || '',
          address: tenantInfo.data?.profile?.address || ''
        })
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      await http.patch('/v1/tenant/', {
        company_name: editedData.company_name,
        slug: editedData.slug,
        city: editedData.city,
        address: editedData.address
      })
      const tenantInfo = await getTenantInfo()
      setInfo(tenantInfo.data)
      setIsEditing(false)
      setSaveMsg({ ok: true, text: 'Business profile updated.' })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (error: any) {
      console.error('Failed to update:', error)
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData({
      company_name: info?.profile?.company_name || '',
      slug: info?.profile?.slug || '',
      city: info?.profile?.city || '',
      address: info?.profile?.address || ''
    })
    setIsEditing(false)
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
                  Business Profile
                </h1>
              )}
              <p style={{
                gridColumn: 1, gridRow: 2,
                margin: 0, fontSize: 13, fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4
              }}>
                Your company name, city, and the slug that appears in your booking URLs.
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

            {/* ── Company Details card ─────────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Buildings size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Company Details</h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 16 : '16px 24px'
              }}>
                <Field label="Company Name" value={editedData.company_name}
                  helper="The name displayed to riders on booking pages and emails."
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, company_name: v }))} />
                <Field label="Slug" value={editedData.slug}
                  helper="Your unique URL identifier — e.g. ridez in ridez.yourdomain.com."
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, slug: v }))} />
                <Field label="City" value={editedData.city}
                  helper="Primary city of operations."
                  editing={isEditing}
                  onChange={v => setEditedData(p => ({ ...p, city: v }))} />
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', minWidth: 0 }}>
                  <Field label="Address" value={editedData.address}
                    helper="Street address for business records."
                    editing={isEditing}
                    onChange={v => setEditedData(p => ({ ...p, address: v }))} />
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

          {/* Mobile bottom action bar */}
          {isMobile && (
            <div
              role="toolbar"
              aria-label="Business profile actions"
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
