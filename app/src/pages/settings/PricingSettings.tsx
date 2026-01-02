import { useState, useEffect } from 'react'
import { getTenantConfig, updateTenantPricing, getBookingConfig, updateBookingConfig, type TenantPricingData, type BookingConfig } from '@api/tenantSettings'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Save, Edit, X, Calendar } from 'lucide-react'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

export default function PricingSettings() {
  const [pricing, setPricing] = useState<TenantPricingData | null>(null)
  const [bookingConfigs, setBookingConfigs] = useState<BookingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBookings, setIsEditingBookings] = useState<{ [key: string]: boolean }>({})
  const [saving, setSaving] = useState(false)
  const [savingBookings, setSavingBookings] = useState<{ [key: string]: boolean }>({})
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isSaveHovered, setIsSaveHovered] = useState(false)
  const [isCancelHovered, setIsCancelHovered] = useState(false)
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false)
  const navigate = useNavigate()
  
  const [editedBookingConfigs, setEditedBookingConfigs] = useState<{ [key: string]: BookingConfig }>({})

  const [editedData, setEditedData] = useState<TenantPricingData>({
    base_fare: 0,
    per_mile_rate: 0,
    per_minute_rate: 0,
    per_hour_rate: 0,
    cancellation_fee: 0,
    discounts: false
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
        const [config, bookings] = await Promise.all([
          getTenantConfig('pricing'),
          getBookingConfig()
        ])
        if (config.pricing) {
          setPricing(config.pricing)
          setEditedData(config.pricing)
        }
        // Ensure bookings is an array
        const bookingsArray = Array.isArray(bookings) ? bookings : []
        setBookingConfigs(bookingsArray)
        if (bookingsArray.length > 0) {
          const initialEdited: { [key: string]: BookingConfig } = {}
          bookingsArray.forEach(booking => {
            initialEdited[booking.service_type] = { ...booking }
          })
          setEditedBookingConfigs(initialEdited)
        }
      } catch (error) {
        console.error('Failed to load pricing data:', error)
        // Set empty array on error to prevent map errors
        setBookingConfigs([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleInputChange = (field: keyof TenantPricingData, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await updateTenantPricing({
        base_fare: editedData.base_fare,
        per_mile_rate: editedData.per_mile_rate,
        per_minute_rate: editedData.per_minute_rate,
        per_hour_rate: editedData.per_hour_rate,
        cancellation_fee: editedData.cancellation_fee,
        discounts: editedData.discounts
      })
      setPricing(updated)
      setEditedData(updated)
      setIsEditing(false)
      alert('Pricing settings updated successfully!')
    } catch (error: any) {
      console.error('Failed to update:', error)
      alert('Failed to update pricing settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (pricing) {
      setEditedData(pricing)
    }
    setIsEditing(false)
  }

  const handleBookingInputChange = (serviceType: string, field: 'deposit_fee' | 'deposit_type', value: any) => {
    setEditedBookingConfigs(prev => ({
      ...prev,
      [serviceType]: {
        ...prev[serviceType],
        [field]: value
      }
    }))
  }

  const handleBookingSave = async (serviceType: string) => {
    try {
      setSavingBookings(prev => ({ ...prev, [serviceType]: true }))
      const edited = editedBookingConfigs[serviceType]
      if (!edited) return

      const updated = await updateBookingConfig(serviceType as 'airport' | 'hourly' | 'dropoff', {
        deposit_fee: edited.deposit_fee,
        deposit_type: edited.deposit_type
      })
      
      setBookingConfigs(prev => prev.map(b => b.service_type === serviceType ? updated : b))
      setEditedBookingConfigs(prev => ({
        ...prev,
        [serviceType]: updated
      }))
      setIsEditingBookings(prev => ({ ...prev, [serviceType]: false }))
      alert(`Booking settings for ${serviceType} updated successfully!`)
    } catch (error: any) {
      console.error('Failed to update booking config:', error)
      alert(`Failed to update booking settings for ${serviceType}. Please try again.`)
    } finally {
      setSavingBookings(prev => ({ ...prev, [serviceType]: false }))
    }
  }

  const handleBookingCancel = (serviceType: string) => {
    const original = bookingConfigs.find(b => b.service_type === serviceType)
    if (original) {
      setEditedBookingConfigs(prev => ({
        ...prev,
        [serviceType]: { ...original }
      }))
    }
    setIsEditingBookings(prev => ({ ...prev, [serviceType]: false }))
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
      <div style={{
        filter: showLearnMoreModal ? 'blur(4px)' : 'none',
        transition: 'filter 0.3s ease',
        width: '100%',
        display: 'flex',
        minHeight: '100vh'
      }}>
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
              Pricing Settings
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
            <DollarSign className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
            <h3 style={{ 
              margin: 0,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Pricing Configuration
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
              { label: 'Base Fare ($)', field: 'base_fare', type: 'number', step: '0.01', min: '0', description: 'Fixed starting fee charged for every ride' },
              { label: 'Per Mile Rate ($)', field: 'per_mile_rate', type: 'number', step: '0.01', min: '0', description: 'Cost per mile traveled during the ride' },
              { label: 'Per Minute Rate ($)', field: 'per_minute_rate', type: 'number', step: '0.01', min: '0', description: 'Cost per minute of ride duration' },
              { label: 'Per Hour Rate ($)', field: 'per_hour_rate', type: 'number', step: '0.01', min: '0', description: 'Cost per hour for hourly bookings' },
              { label: 'Cancellation Fee ($)', field: 'cancellation_fee', type: 'number', step: '0.01', min: '0', description: 'Fee charged when a booking is cancelled' },
              { label: 'Discounts Enabled', field: 'discounts', type: 'checkbox', description: 'Allow discount codes and promotional pricing' }
            ].map((item) => (
              <div key={item.field} className="bw-form-group" style={{ 
                gridColumn: item.field === 'cancellation_fee' || item.field === 'discounts' ? (isMobile ? 'span 1' : 'span 1') : 'span 1'
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
                  item.type === 'checkbox' ? (
                    <select
                      value={editedData[item.field as keyof TenantPricingData] ? 'true' : 'false'}
                      onChange={(e) => handleInputChange(item.field as keyof TenantPricingData, e.target.value === 'true')}
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
                  ) : (
                    <input
                      type={item.type}
                      step={item.step}
                      min={item.min}
                      value={editedData[item.field as keyof TenantPricingData] as number || 0}
                      onChange={(e) => handleInputChange(item.field as keyof TenantPricingData, parseFloat(e.target.value) || 0)}
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
                ) : (
                  <div style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)',
                    padding: 'clamp(12px, 2vw, 16px) 0'
                  }}>
                    {item.type === 'checkbox' 
                      ? (editedData[item.field as keyof TenantPricingData] ? 'Yes' : 'No')
                      : item.type === 'number'
                      ? `$${((editedData[item.field as keyof TenantPricingData] as number) || 0).toFixed(2)}`
                      : String(editedData[item.field as keyof TenantPricingData] || 'N/A')
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bookings Configuration Card */}
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)',
          marginTop: 'clamp(16px, 2vw, 24px)'
        }}>
          <div style={{ marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(8px, 1.5vw, 12px)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Booking Deposit Configuration
              </h3>
            </div>
            <div style={{
              fontSize: 'clamp(10px, 1.2vw, 11px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300,
              color: 'var(--bw-muted)',
              opacity: 0.7,
              lineHeight: 1.5,
              marginLeft: 'clamp(28px, 3.5vw, 32px)'
            }}>
              Configure deposit requirements for different service types. Deposits are collected upfront when customers make a booking to secure their reservation. You can set deposits as either a percentage of the total booking cost or a flat dollar amount.{' '}
              <button
                onClick={() => setShowLearnMoreModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--bw-accent)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  fontSize: 'inherit'
                }}
              >
                Learn more
              </button>
            </div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: 'clamp(16px, 2vw, 24px)',
            width: '100%',
            maxWidth: '100%'
          }}>
            {Array.isArray(bookingConfigs) && bookingConfigs.length > 0 ? (
              bookingConfigs.map((booking) => {
              const serviceType = booking.service_type
              const isEditing = isEditingBookings[serviceType] || false
              const isSaving = savingBookings[serviceType] || false
              const edited = editedBookingConfigs[serviceType] || booking
              const serviceName = serviceType.charAt(0).toUpperCase() + serviceType.slice(1)

              return (
                <div key={serviceType} className="bw-form-group" style={{
                  border: '1px solid var(--bw-border)',
                  borderRadius: 'clamp(6px, 1vw, 8px)',
                  padding: 'clamp(12px, 2vw, 16px)',
                  backgroundColor: 'var(--bw-bg)'
                }}>
                  <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: 'clamp(14px, 2vw, 16px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 500,
                      color: 'var(--bw-text)',
                      marginBottom: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      {serviceName}
                    </h4>
                    {!isEditing ? (
                      <button
                        className="bw-btn-outline"
                        onClick={() => setIsEditingBookings(prev => ({ ...prev, [serviceType]: true }))}
                        style={{
                          padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                          fontSize: 'clamp(11px, 1.5vw, 12px)',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 500,
                          borderRadius: 4,
                          border: '1px solid var(--bw-border)',
                          color: 'var(--bw-text)',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="bw-btn-outline"
                          onClick={() => handleBookingCancel(serviceType)}
                          disabled={isSaving}
                          style={{
                            padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                            fontSize: 'clamp(11px, 1.5vw, 12px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500,
                            borderRadius: 4,
                            border: '1px solid var(--bw-border)',
                            color: 'var(--bw-text)',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: isSaving ? 0.6 : 1
                          }}
                        >
                          <X style={{ width: '14px', height: '14px' }} />
                          <span>Cancel</span>
                        </button>
                        <button
                          className="bw-btn bw-btn-action"
                          onClick={() => handleBookingSave(serviceType)}
                          disabled={isSaving}
                          style={{
                            padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                            fontSize: 'clamp(11px, 1.5vw, 12px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500,
                            borderRadius: 4,
                            backgroundColor: 'var(--bw-accent)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: isSaving ? 0.6 : 1
                          }}
                        >
                          <Save style={{ width: '14px', height: '14px' }} />
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                    <label className="bw-form-label small-muted" style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      Deposit Type
                    </label>
                    {isEditing ? (
                      <select
                        value={edited.deposit_type}
                        onChange={(e) => handleBookingInputChange(serviceType, 'deposit_type', e.target.value as 'percentage' | 'flat')}
                        className="bw-input"
                        style={{
                          width: '100%',
                          padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 14px)',
                          fontSize: 'clamp(12px, 1.5vw, 14px)',
                          fontFamily: '"Work Sans", sans-serif',
                          borderRadius: 0,
                          color: 'var(--bw-text)',
                          backgroundColor: 'var(--bw-bg)',
                          border: '1px solid var(--bw-border)'
                        }}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                      </select>
                    ) : (
                      <div style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 300,
                        color: 'var(--bw-text)',
                        padding: 'clamp(10px, 1.5vw, 12px) 0',
                        textTransform: 'capitalize'
                      }}>
                        {edited.deposit_type}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="bw-form-label small-muted" style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      Deposit Fee
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={edited.deposit_fee}
                        onChange={(e) => handleBookingInputChange(serviceType, 'deposit_fee', parseFloat(e.target.value) || 0)}
                        className="bw-input"
                        style={{
                          width: '100%',
                          padding: 'clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 14px)',
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
                        padding: 'clamp(10px, 1.5vw, 12px) 0'
                      }}>
                        {edited.deposit_type === 'percentage' 
                          ? `${(edited.deposit_fee * 100).toFixed(1)}%`
                          : `$${edited.deposit_fee.toFixed(2)}`
                        }
                      </div>
                    )}
                  </div>

                  {booking.updated_on && (
                    <div style={{
                      fontSize: 'clamp(10px, 1.2vw, 11px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      marginTop: 'clamp(8px, 1.5vw, 12px)',
                      opacity: 0.7
                    }}>
                      Updated: {new Date(booking.updated_on).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })) : (
              <div style={{
                gridColumn: '1 / -1',
                padding: 'clamp(24px, 4vw, 32px)',
                textAlign: 'center',
                color: 'var(--bw-muted)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                No booking configurations available
              </div>
            )}
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowLearnMoreModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              transition: 'opacity 0.3s ease'
            }}
          />
              {/* Modal Card */}
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: isMobile ? 'calc(100% - 40px)' : '600px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  border: '1px solid var(--bw-border)',
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  padding: 'clamp(20px, 3vw, 32px)',
                  zIndex: 1001,
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(16px, 2.5vw, 24px)' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 'clamp(18px, 2.5vw, 24px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    About Booking Deposits
                  </h3>
                  <button
                    onClick={() => setShowLearnMoreModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: 'var(--bw-text)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bw-bg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <X style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.8vw, 15px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  lineHeight: 1.7
                }}>
                  <p style={{ margin: '0 0 clamp(16px, 2.5vw, 24px) 0' }}>
                    Booking deposits are upfront payments collected from customers when they make a reservation. This helps secure bookings and reduce no-shows by requiring customers to commit financially to their reservation.
                  </p>
                  <h4 style={{
                    margin: '0 0 clamp(12px, 2vw, 16px) 0',
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    Deposit Types
                  </h4>
                  <ul style={{ margin: '0 0 clamp(16px, 2.5vw, 24px) 0', paddingLeft: 'clamp(20px, 3vw, 24px)' }}>
                    <li style={{ marginBottom: 'clamp(8px, 1.5vw, 12px)' }}>
                      <strong>Percentage:</strong> A percentage of the total booking cost (e.g., 30% of a $100 booking = $30 deposit)
                    </li>
                    <li style={{ marginBottom: 'clamp(8px, 1.5vw, 12px)' }}>
                      <strong>Flat:</strong> A fixed dollar amount regardless of booking total (e.g., $75 flat fee)
                    </li>
                  </ul>
                  <h4 style={{
                    margin: '0 0 clamp(12px, 2vw, 16px) 0',
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    Service Type Configuration
                  </h4>
                  <p style={{ margin: '0 0 clamp(16px, 2.5vw, 24px) 0' }}>
                    You can configure different deposit requirements for each service type (Airport, Hourly, Dropoff) independently. This allows you to set higher deposits for services that require more commitment or have higher cancellation risks.
                  </p>
                  <h4 style={{
                    margin: '0 0 clamp(12px, 2vw, 16px) 0',
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    Payment Processing
                  </h4>
                  <p style={{ margin: '0 0 clamp(16px, 2.5vw, 24px) 0' }}>
                    All bookings will be balanced once the ride is complete. The remaining balance (total booking cost minus the deposit) will be charged automatically when the ride is finished.
                  </p>
                  <div style={{
                    marginTop: 'clamp(16px, 2.5vw, 24px)',
                    padding: 'clamp(12px, 2vw, 16px)',
                    backgroundColor: 'var(--bw-bg)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: 'clamp(6px, 1vw, 8px)'
                  }}>
                    <p style={{ margin: 0, fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                      <strong>Note:</strong> You can turn off deposits for any desired service type in{' '}
                      <span style={{ color: 'var(--bw-accent)' }}>Tenant Settings</span>.
                    </p>
                  </div>
                </div>
              </div>
        </>
      )}
    </div>
  )
}

