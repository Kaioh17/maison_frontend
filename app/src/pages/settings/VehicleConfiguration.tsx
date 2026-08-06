import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { getVehicleCategoriesByTenant, createVehicleCategory, setVehicleRates, type VehicleCategoryResponse } from '@api/vehicles'
import { Car, Plus, PencilSimple, FloppyDisk, X } from '@phosphor-icons/react'
import { useSettingsMenu } from '@components/SettingsMenuBar'

const ACCENT = 'rgba(155, 97, 209, 0.81)'

function hoverOutline(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.borderColor = ACCENT
  e.currentTarget.style.color = ACCENT
  e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
}
function unhoverOutline(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.borderColor = ''
  e.currentTarget.style.color = ''
  e.currentTarget.style.backgroundColor = ''
}
function hoverPrimary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.opacity = '0.85'
}
function unhoverPrimary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.opacity = ''
}

export default function VehicleConfiguration() {
  const [info, setInfo] = useState<any>(null)
  const [categories, setCategories] = useState<VehicleCategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [formData, setFormData] = useState({
    vehicle_category: '',
    vehicle_flat_rate: 0
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantInfo, categoriesData] = await Promise.all([
          getTenantInfo(),
          getTenantInfo().then(async (info) => {
            if (info.data?.id) {
              const cats = await getVehicleCategoriesByTenant(info.data.id)
              return cats.data || []
            }
            return []
          })
        ])
        setInfo(tenantInfo.data)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAdd = () => {
    setFormData({ vehicle_category: '', vehicle_flat_rate: 0 })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (category: VehicleCategoryResponse) => {
    setFormData({
      vehicle_category: category.vehicle_category,
      vehicle_flat_rate: category.vehicle_flat_rate
    })
    setEditingId(category.id)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setFormData({ vehicle_category: '', vehicle_flat_rate: 0 })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!formData.vehicle_category || formData.vehicle_flat_rate <= 0) {
      setSaveMsg({ ok: false, text: 'Please fill in a category name and a rate above $0.' })
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        await setVehicleRates({
          vehicle_category: formData.vehicle_category,
          vehicle_flat_rate: formData.vehicle_flat_rate
        })
      } else {
        const response = await createVehicleCategory({
          vehicle_category: formData.vehicle_category,
          vehicle_flat_rate: formData.vehicle_flat_rate,
          seating_capacity: 4
        })
        if (response.data) {
          setCategories(prev => [...prev, response.data])
        }
      }

      if (info?.id) {
        const cats = await getVehicleCategoriesByTenant(info.id)
        setCategories(cats.data || [])
      }

      const msg = editingId ? 'Vehicle category updated.' : 'Vehicle category created.'
      handleCancel()
      setSaveMsg({ ok: true, text: msg })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (error: any) {
      console.error('Failed to save:', error)
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
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

  const sectionCard: React.CSSProperties = {
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

  const outlineBtnStyle: React.CSSProperties = {
    padding: '10px 20px', fontSize: 14, fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif', borderRadius: 7,
    border: '1px solid var(--bw-border)', backgroundColor: '#ffffff',
    color: 'var(--bw-text)', display: 'flex', alignItems: 'center', gap: 7,
    cursor: 'pointer',
    transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease'
  }

  const primaryBtnStyle: React.CSSProperties = {
    padding: '10px 20px', fontSize: 14, fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif', borderRadius: 7,
    border: 'none', backgroundColor: 'var(--bw-accent)', color: '#ffffff',
    display: 'flex', alignItems: 'center', gap: 7,
    cursor: 'pointer', transition: 'opacity 0.15s ease'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    fontFamily: '"Work Sans", sans-serif', fontWeight: 400, borderRadius: 6,
    color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
    border: '1px solid var(--bw-border)', boxSizing: 'border-box'
  }

  const fieldLabel: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
    marginBottom: 4, letterSpacing: '0.02em'
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
              maxWidth: 720,
              boxSizing: 'border-box'
            }}
          >
            {/* Page header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: 16, marginBottom: 24
            }}>
              <div>
                <h1 style={{
                  margin: '0 0 4px', fontSize: 17, fontWeight: 500,
                  fontFamily: '"DM Sans", sans-serif', color: 'var(--bw-text)'
                }}>
                  Vehicle Configuration
                </h1>
                <p style={{
                  margin: 0, fontSize: 13, fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4
                }}>
                  Manage vehicle categories and their flat rates.
                </p>
              </div>

              {!isAdding && !editingId && (
                <button style={primaryBtnStyle} onClick={handleAdd}
                  onMouseEnter={hoverPrimary} onMouseLeave={unhoverPrimary}>
                  <Plus size={16} aria-hidden /> Add Category
                </button>
              )}
            </div>

            {/* ── Add / Edit form card ─────────────────────── */}
            {(isAdding || editingId) && (
              <div style={sectionCard}>
                <div style={sectionHeading}>
                  <Car size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                  <h2 style={sectionTitle}>
                    {editingId ? 'Edit Vehicle Category' : 'Add Vehicle Category'}
                  </h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 16 : '16px 24px',
                  marginBottom: 20
                }}>
                  <div>
                    <label style={fieldLabel}>Vehicle Category</label>
                    <input
                      type="text"
                      value={formData.vehicle_category}
                      onChange={e => setFormData(p => ({ ...p, vehicle_category: e.target.value }))}
                      className="bw-input"
                      placeholder="e.g., Sedan, SUV, Luxury"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={fieldLabel}>Flat Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.vehicle_flat_rate}
                      onChange={e => setFormData(p => ({ ...p, vehicle_flat_rate: parseFloat(e.target.value) || 0 }))}
                      className="bw-input"
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={outlineBtnStyle} onClick={handleCancel} disabled={saving}
                    onMouseEnter={hoverOutline} onMouseLeave={unhoverOutline}>
                    <X size={16} aria-hidden /> Cancel
                  </button>
                  <button
                    style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                    onClick={handleSave} disabled={saving}
                    onMouseEnter={hoverPrimary} onMouseLeave={unhoverPrimary}>
                    <FloppyDisk size={16} aria-hidden />
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

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

            {/* ── Vehicle list card ────────────────────────── */}
            <div style={sectionCard}>
              <div style={sectionHeading}>
                <Car size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                <h2 style={sectionTitle}>Vehicle Categories</h2>
              </div>

              {categories.length === 0 ? (
                <p style={{
                  margin: 0, fontSize: 14, fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300, color: 'var(--bw-muted)', textAlign: 'center',
                  padding: '24px 0'
                }}>
                  No vehicle categories yet. Click "Add Category" to create one.
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: 12
                }}>
                  {categories.map(category => (
                    <div key={category.id} style={{
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)',
                      borderRadius: 8,
                      padding: '14px 16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Car size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                            {category.vehicle_category}
                          </span>
                        </div>
                        <button
                          style={{
                            padding: '6px 12px', fontSize: 12, fontWeight: 500,
                            fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                            border: '1px solid var(--bw-border)', backgroundColor: 'transparent',
                            color: 'var(--bw-text)', display: 'flex', alignItems: 'center', gap: 5,
                            cursor: editingId !== null || isAdding ? 'not-allowed' : 'pointer',
                            opacity: editingId !== null || isAdding ? 0.4 : 1,
                            transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease'
                          }}
                          onClick={() => handleEdit(category)}
                          disabled={editingId !== null || isAdding}
                          onMouseEnter={e => {
                            if (editingId === null && !isAdding) {
                              e.currentTarget.style.borderColor = ACCENT
                              e.currentTarget.style.color = ACCENT
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = ''
                            e.currentTarget.style.color = ''
                            e.currentTarget.style.backgroundColor = ''
                          }}
                        >
                          <PencilSimple size={13} aria-hidden />
                          Edit
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                          Flat Rate
                        </span>
                        <span style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 500, color: 'var(--bw-text)' }}>
                          ${category.vehicle_flat_rate}
                        </span>
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 11, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                          Created {new Date(category.created_on).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
  )
}
