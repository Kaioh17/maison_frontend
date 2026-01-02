import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { getVehicleCategoriesByTenant, createVehicleCategory, type VehicleCategoryResponse } from '@api/vehicles'
import { useNavigate } from 'react-router-dom'
import { Car, Plus, Edit, Save, X } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'
import { http } from '@api/http'

export default function VehicleConfiguration() {
  const [info, setInfo] = useState<any>(null)
  const [categories, setCategories] = useState<VehicleCategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    vehicle_category: '',
    vehicle_flat_rate: 0
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

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
      alert('Please fill in all fields with valid values')
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        // Update existing category - using PATCH if available, otherwise POST
        await http.patch(`/v1/vehicles/category/${editingId}`, {
          vehicle_category: formData.vehicle_category,
          vehicle_flat_rate: formData.vehicle_flat_rate
        })
      } else {
        // Create new category
        const response = await createVehicleCategory({
          vehicle_category: formData.vehicle_category,
          vehicle_flat_rate: formData.vehicle_flat_rate,
          seating_capacity: 4 // Default seating capacity
        })
        if (response.data) {
          setCategories(prev => [...prev, response.data])
        }
      }
      
      // Reload categories
      if (info?.id) {
        const cats = await getVehicleCategoriesByTenant(info.id)
        setCategories(cats.data || [])
      }
      
      handleCancel()
      alert(editingId ? 'Vehicle category updated successfully!' : 'Vehicle category created successfully!')
    } catch (error: any) {
      console.error('Failed to save:', error)
      alert('Failed to save vehicle category. Please try again.')
    } finally {
      setSaving(false)
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
          Loading...
        </div>
      </div>
    )
  }

  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'

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
              Vehicle Configuration
            </h1>
          {!isAdding && !editingId && (
            <button
              className="bw-btn bw-btn-action"
              onClick={handleAdd}
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
                transition: 'all 0.2s ease'
              } as React.CSSProperties}
            >
              <Plus className="w-4 h-4" style={{ 
                width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
              }} />
              <span>Add Category</span>
            </button>
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
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bw-card" style={{ 
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(16px, 2.5vw, 24px)',
            marginBottom: 'clamp(16px, 3vw, 24px)'
          }}>
            <h3 style={{ 
              margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              {editingId ? 'Edit Vehicle Category' : 'Add Vehicle Category'}
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: 'clamp(16px, 2vw, 24px)',
              width: '100%',
              maxWidth: '100%'
            }}>
              <div className="bw-form-group">
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Vehicle Category
                </label>
                <input
                  type="text"
                  value={formData.vehicle_category}
                  onChange={(e) => handleInputChange('vehicle_category', e.target.value)}
                  className="bw-input"
                  placeholder="e.g., Sedan, SUV, Luxury"
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
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Flat Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.vehicle_flat_rate}
                  onChange={(e) => handleInputChange('vehicle_flat_rate', parseFloat(e.target.value) || 0)}
                  className="bw-input"
                  placeholder="0.00"
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
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', marginTop: 'clamp(16px, 2.5vw, 24px)', flexWrap: 'wrap' }}>
              <button
                className="bw-btn-outline"
                onClick={handleCancel}
                disabled={saving}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  borderRadius: 7
                }}
              >
                <X className="w-4 h-4" style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                Cancel
              </button>
              <button
                className="bw-btn bw-btn-action"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  borderRadius: 7
                }}
              >
                <Save className="w-4 h-4" style={{ width: '18px', height: '18px', marginRight: '8px' }} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          width: '100%',
          maxWidth: '100%'
        }}>
          {categories.map((category) => (
            <div key={category.id} className="bw-card" style={{ 
              backgroundColor: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border)',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              padding: 'clamp(16px, 2.5vw, 24px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                  <Car className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
                  <h3 style={{ 
                    margin: 0,
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 400,
                    color: 'var(--bw-text)'
                  }}>
                    {category.vehicle_category}
                  </h3>
                </div>
                <button
                  className="bw-btn-outline"
                  onClick={() => handleEdit(category)}
                  disabled={editingId !== null || isAdding}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 600,
                    borderRadius: 7
                  }}
                >
                  <Edit className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif'
                  }}>
                    Flat Rate:
                  </span>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    fontFamily: '"Work Sans", sans-serif',
                    color: 'var(--bw-text)'
                  }}>
                    ${category.vehicle_flat_rate}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(11px, 1.3vw, 12px)', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }}>
                  <span>Created: {new Date(category.created_on).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && !isAdding && (
            <div className="bw-card" style={{ 
              backgroundColor: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border)',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              padding: 'clamp(16px, 2.5vw, 24px)',
              textAlign: 'center',
              gridColumn: 'span 2'
            }}>
              <p style={{ color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }}>
                No vehicle categories found. Click "Add Category" to create one.
              </p>
            </div>
          )}
        </div>
      </div>

        {/* Upgrade Plan Button */}
        <UpgradePlanButton 
          currentPlan={currentPlan}
          onUpgradeClick={() => navigate('/tenant/settings/plans')}
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}

