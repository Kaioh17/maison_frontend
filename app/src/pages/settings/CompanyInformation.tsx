import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { Building, Save, Edit, X } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'
import { http } from '@api/http'

export default function CompanyInformation() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isSaveHovered, setIsSaveHovered] = useState(false)
  const [isCancelHovered, setIsCancelHovered] = useState(false)
  const navigate = useNavigate()

  const [editedData, setEditedData] = useState({
    company_name: '',
    slug: '',
    city: '',
    address: ''
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

  const handleInputChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Update company information via tenant profile endpoint
      await http.patch('/v1/tenant/', {
        company_name: editedData.company_name,
        slug: editedData.slug,
        city: editedData.city,
        address: editedData.address
      })
      const tenantInfo = await getTenantInfo()
      setInfo(tenantInfo.data)
      setIsEditing(false)
      alert('Company information updated successfully!')
    } catch (error: any) {
      console.error('Failed to update:', error)
      alert('Failed to update company information. Please try again.')
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
              Company Information
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
            <Building className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
            <h3 style={{ 
              margin: 0,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Company Details
            </h3>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
            gap: 'clamp(16px, 2vw, 24px)',
            width: '100%',
            maxWidth: '100%'
          }}>
            {[
              { label: 'Company Name', field: 'company_name', type: 'text' },
              { label: 'Slug', field: 'slug', type: 'text' },
              { label: 'City', field: 'city', type: 'text' },
              { label: 'Address', field: 'address', type: 'text' }
            ].map((item) => (
              <div key={item.field} className="bw-form-group" style={{ gridColumn: item.field === 'address' ? (isMobile ? 'span 1' : 'span 2') : 'span 1' }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  {item.label}
                </label>
                {isEditing ? (
                  <input
                    type={item.type}
                    value={editedData[item.field as keyof typeof editedData]}
                    onChange={(e) => handleInputChange(item.field, e.target.value)}
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
                ) : (
                  <div style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)',
                    padding: 'clamp(12px, 2vw, 16px) 0'
                  }}>
                    {editedData[item.field as keyof typeof editedData] || 'N/A'}
                  </div>
                )}
              </div>
            ))}
          </div>
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

