import { useState, useEffect } from 'react'
import { getTenantConfig, updateTenantPricing, getBookingConfig, updateBookingConfig, type TenantPricingData, type BookingConfig, type UpdateBookingConfigPayload } from '@api/tenantSettings'
import { CurrencyDollar, FloppyDisk, PencilSimple, X, Calendar, CaretDown } from '@phosphor-icons/react'
import { useSettingsMenu } from '@components/SettingsMenuBar'
import { SETTINGS_BTN_CSS } from './settingsButtonCss'

const MOBILE_SCROLL_BOTTOM_PAD = 'calc(80px + env(safe-area-inset-bottom, 0px))'

export default function PricingSettings() {
  const [pricing, setPricing] = useState<TenantPricingData | null>(null)
  const [bookingConfigs, setBookingConfigs] = useState<BookingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBookings, setIsEditingBookings] = useState<{ [key: string]: boolean }>({})
  const [saving, setSaving] = useState(false)
  const [savingBookings, setSavingBookings] = useState<{ [key: string]: boolean }>({})
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [bookingSaveMsg, setBookingSaveMsg] = useState<{ [key: string]: { ok: boolean; text: string } | null }>({})
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false)
  const [airportExtrasOpen, setAirportExtrasOpen] = useState(false)

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
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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
        const bookingsArray = Array.isArray(bookings) ? bookings : []
        setBookingConfigs(bookingsArray)
        if (bookingsArray.length > 0) {
          const initialEdited: { [key: string]: BookingConfig } = {}
          bookingsArray.forEach(booking => {
            initialEdited[booking.service_type] =
              booking.service_type === 'airport'
                ? {
                    ...booking,
                    stc_rate: booking.stc_rate ?? 0,
                    gratuity_rate: booking.gratuity_rate ?? 0,
                    airport_gate_fee: booking.airport_gate_fee ?? 0,
                    meet_and_greet_fee: booking.meet_and_greet_fee ?? 0,
                  }
                : { ...booking }
          })
          setEditedBookingConfigs(initialEdited)
        }
      } catch (error) {
        console.error('Failed to load pricing data:', error)
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
      setSaveMsg({ ok: true, text: 'Pricing settings updated.' })
      setTimeout(() => setSaveMsg(null), 4000)
    } catch (error: any) {
      console.error('Failed to update:', error)
      setSaveMsg({ ok: false, text: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (pricing) setEditedData(pricing)
    setIsEditing(false)
  }

  type BookingPricingField =
    | 'deposit_fee'
    | 'deposit_type'
    | 'stc_rate'
    | 'gratuity_rate'
    | 'airport_gate_fee'
    | 'meet_and_greet_fee'

  const handleBookingInputChange = (serviceType: string, field: BookingPricingField, value: string | number) => {
    setEditedBookingConfigs(prev => ({
      ...prev,
      [serviceType]: { ...prev[serviceType], [field]: value }
    }))
  }

  const handleBookingSave = async (serviceType: string) => {
    try {
      setSavingBookings(prev => ({ ...prev, [serviceType]: true }))
      const edited = editedBookingConfigs[serviceType]
      if (!edited) return

      const payload: UpdateBookingConfigPayload = {
        deposit_fee: edited.deposit_fee,
        deposit_type: edited.deposit_type,
      }
      if (serviceType === 'airport') {
        payload.stc_rate = edited.stc_rate ?? 0
        payload.gratuity_rate = edited.gratuity_rate ?? 0
        payload.airport_gate_fee = edited.airport_gate_fee ?? 0
        payload.meet_and_greet_fee = edited.meet_and_greet_fee ?? 0
      }

      const updated = await updateBookingConfig(serviceType as 'airport' | 'hourly' | 'dropoff', payload)
      const merged: BookingConfig = {
        ...edited,
        ...(updated || {}),
        service_type: edited.service_type,
        stc_rate: updated?.stc_rate ?? edited.stc_rate,
        gratuity_rate: updated?.gratuity_rate ?? edited.gratuity_rate,
        airport_gate_fee: updated?.airport_gate_fee ?? edited.airport_gate_fee,
        meet_and_greet_fee: updated?.meet_and_greet_fee ?? edited.meet_and_greet_fee,
      }

      setBookingConfigs(prev => prev.map(b => (b.service_type === serviceType ? merged : b)))
      setEditedBookingConfigs(prev => ({ ...prev, [serviceType]: merged }))
      setIsEditingBookings(prev => ({ ...prev, [serviceType]: false }))
      setBookingSaveMsg(prev => ({ ...prev, [serviceType]: { ok: true, text: 'Booking settings updated.' } }))
      setTimeout(() => setBookingSaveMsg(prev => ({ ...prev, [serviceType]: null })), 4000)
    } catch (error: any) {
      console.error('Failed to update booking config:', error)
      setBookingSaveMsg(prev => ({ ...prev, [serviceType]: { ok: false, text: 'Failed to save. Please try again.' } }))
    } finally {
      setSavingBookings(prev => ({ ...prev, [serviceType]: false }))
    }
  }

  const handleBookingCancel = (serviceType: string) => {
    const original = bookingConfigs.find(b => b.service_type === serviceType)
    if (original) {
      const reset =
        serviceType === 'airport'
          ? {
              ...original,
              stc_rate: original.stc_rate ?? 0,
              gratuity_rate: original.gratuity_rate ?? 0,
              airport_gate_fee: original.airport_gate_fee ?? 0,
              meet_and_greet_fee: original.meet_and_greet_fee ?? 0,
            }
          : { ...original }
      setEditedBookingConfigs(prev => ({ ...prev, [serviceType]: reset }))
    }
    setIsEditingBookings(prev => ({ ...prev, [serviceType]: false }))
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
    borderRadius: 18,
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

  const fieldLabel: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500,
    fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
    marginBottom: 2, letterSpacing: '0.02em'
  }

  const fieldDesc: React.CSSProperties = {
    margin: '0 0 6px', fontSize: 11, fontFamily: '"Work Sans", sans-serif',
    fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.3
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
    color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
    border: '1px solid var(--bw-border)', boxSizing: 'border-box'
  }

  const readValueStyle: React.CSSProperties = {
    fontSize: 14, fontFamily: '"Work Sans", sans-serif',
    fontWeight: 400, color: 'var(--bw-text)', padding: '10px 0', overflowWrap: 'anywhere'
  }

  // Figures (fares, rates, percentages, fees) read in monospace; labels/body copy stay sans-serif.
  const readValueMonoStyle: React.CSSProperties = {
    ...readValueStyle,
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontVariantNumeric: 'tabular-nums'
  }

  const pricingFields = [
    { label: 'Base Fare ($)', field: 'base_fare', type: 'number', step: '0.01', min: '0', description: 'Fixed starting fee charged for every ride.' },
    { label: 'Per Mile Rate ($)', field: 'per_mile_rate', type: 'number', step: '0.01', min: '0', description: 'Cost per mile traveled during the ride.' },
    { label: 'Per Minute Rate ($)', field: 'per_minute_rate', type: 'number', step: '0.01', min: '0', description: 'Cost per minute of ride duration.' },
    { label: 'Per Hour Rate ($)', field: 'per_hour_rate', type: 'number', step: '0.01', min: '0', description: 'Cost per hour for hourly bookings.' },
    { label: 'Cancellation Fee ($)', field: 'cancellation_fee', type: 'number', step: '0.01', min: '0', description: 'Fee charged when a booking is cancelled.' },
    { label: 'Discounts Enabled', field: 'discounts', type: 'checkbox', description: 'Allow discount codes and promotional pricing.' }
  ]

  return (
    <>
      <style>{SETTINGS_BTN_CSS}</style>
      <div style={{
        filter: showLearnMoreModal ? 'blur(4px)' : 'none',
        transition: 'filter 0.3s ease',
        flex: 1,
        display: 'flex',
        minHeight: '100vh'
      }}>
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
                    Pricing
                  </h1>
                )}
                <p style={{
                  gridColumn: 1, gridRow: 2,
                  margin: 0, fontSize: 13, fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4
                }}>
                  Set your base fares, per-mile rates, and booking deposit rules.
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

              {/* ── Pricing Configuration card ───────────────── */}
              <div style={sectionCard}>
                <div style={sectionHeading}>
                  <CurrencyDollar size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                  <h2 style={sectionTitle}>Pricing Configuration</h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 16 : '16px 24px'
                }}>
                  {pricingFields.map(item => (
                    <div key={item.field} style={{ minWidth: 0 }}>
                      <label style={fieldLabel}>{item.label}</label>
                      <p style={fieldDesc}>{item.description}</p>
                      {isEditing ? (
                        item.type === 'checkbox' ? (
                          <select
                            value={editedData[item.field as keyof TenantPricingData] ? 'true' : 'false'}
                            onChange={e => handleInputChange(item.field as keyof TenantPricingData, e.target.value === 'true')}
                            className="bw-input"
                            style={inputStyle}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : (
                          <input
                            type={item.type}
                            step={(item as any).step}
                            min={(item as any).min}
                            value={editedData[item.field as keyof TenantPricingData] as number || 0}
                            onChange={e => handleInputChange(item.field as keyof TenantPricingData, parseFloat(e.target.value) || 0)}
                            className="bw-input"
                            style={inputStyle}
                          />
                        )
                      ) : (
                        <div style={item.type === 'checkbox' ? readValueStyle : readValueMonoStyle}>
                          {item.type === 'checkbox'
                            ? (editedData[item.field as keyof TenantPricingData] ? 'Yes' : 'No')
                            : `$${((editedData[item.field as keyof TenantPricingData] as number) || 0).toFixed(2)}`
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save feedback for pricing */}
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

              {/* ── Booking Deposit Configuration card ───────── */}
              <div style={sectionCard}>
                <div style={sectionHeading}>
                  <Calendar size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                  <h2 style={sectionTitle}>Booking Deposit Configuration</h2>
                </div>

                <p style={{ margin: '0 0 16px', fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.5 }}>
                  Configure deposit requirements for different service types.{' '}
                  <button
                    onClick={() => setShowLearnMoreModal(true)}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      color: 'var(--bw-accent)', textDecoration: 'underline',
                      cursor: 'pointer', fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300, fontSize: 'inherit'
                    }}
                  >
                    Learn more
                  </button>
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: 12
                }}>
                  {Array.isArray(bookingConfigs) && bookingConfigs.length > 0 ? (
                    bookingConfigs.map(booking => {
                      const serviceType = booking.service_type
                      const isEditingThisBooking = isEditingBookings[serviceType] || false
                      const isSaving = savingBookings[serviceType] || false
                      const edited = editedBookingConfigs[serviceType] || booking
                      const serviceName = serviceType.charAt(0).toUpperCase() + serviceType.slice(1)

                      const bookingInputStyle: React.CSSProperties = {
                        width: '100%', padding: '9px 11px', fontSize: 13,
                        fontFamily: '"Work Sans", sans-serif', borderRadius: 6,
                        color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)', boxSizing: 'border-box'
                      }

                      return (
                        <div key={serviceType} style={{
                          border: '1px solid var(--bw-border)',
                          borderRadius: 14,
                          padding: '14px 16px',
                          backgroundColor: 'var(--bw-bg)'
                        }}>
                          {/* Card header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                              {serviceName}
                            </span>
                            {!isEditingThisBooking ? (
                              <button
                                className="pss-btn pss-btn-outline pss-btn-sm"
                                onClick={() => setIsEditingBookings(prev => ({ ...prev, [serviceType]: true }))}
                              >
                                <PencilSimple size={12} aria-hidden /> Edit
                              </button>
                            ) : (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="pss-btn pss-btn-outline pss-btn-sm" onClick={() => handleBookingCancel(serviceType)} disabled={isSaving}>
                                  <X size={12} aria-hidden /> Cancel
                                </button>
                                <button className="pss-btn pss-btn-primary pss-btn-sm" onClick={() => handleBookingSave(serviceType)} disabled={isSaving}>
                                  <FloppyDisk size={12} aria-hidden />
                                  {isSaving ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Deposit Type */}
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', marginBottom: 4, letterSpacing: '0.02em' }}>
                              Deposit Type
                            </label>
                            {isEditingThisBooking ? (
                              <select
                                value={edited.deposit_type}
                                onChange={e => handleBookingInputChange(serviceType, 'deposit_type', e.target.value as 'percentage' | 'flat')}
                                className="bw-input"
                                style={bookingInputStyle}
                              >
                                <option value="percentage">Percentage</option>
                                <option value="flat">Flat</option>
                              </select>
                            ) : (
                              <div style={{ fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, color: 'var(--bw-text)', padding: '8px 0', textTransform: 'capitalize' }}>
                                {edited.deposit_type}
                              </div>
                            )}
                          </div>

                          {/* Deposit Fee */}
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', marginBottom: 4, letterSpacing: '0.02em' }}>
                              Deposit Fee
                            </label>
                            {isEditingThisBooking ? (
                              <input
                                type="number" step="0.01" min="0"
                                value={edited.deposit_fee}
                                onChange={e => handleBookingInputChange(serviceType, 'deposit_fee', parseFloat(e.target.value) || 0)}
                                className="bw-input"
                                style={bookingInputStyle}
                              />
                            ) : (
                              <div style={{ fontSize: 13, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 400, color: 'var(--bw-text)', padding: '8px 0' }}>
                                {edited.deposit_type === 'percentage'
                                  ? `${(edited.deposit_fee * 100).toFixed(1)}%`
                                  : `$${edited.deposit_fee.toFixed(2)}`
                                }
                              </div>
                            )}
                          </div>

                          {/* Airport extras */}
                          {serviceType === 'airport' && (
                            <div style={{ marginTop: 12, borderTop: '1px solid var(--bw-border)', paddingTop: 10 }}>
                              <button
                                type="button"
                                onClick={() => setAirportExtrasOpen(o => !o)}
                                aria-expanded={airportExtrasOpen}
                                style={{
                                  width: '100%', display: 'flex', alignItems: 'center',
                                  justifyContent: 'space-between', gap: 10,
                                  padding: '6px 0', margin: 0,
                                  border: 'none', background: 'transparent',
                                  cursor: 'pointer', fontFamily: '"Work Sans", sans-serif',
                                  fontSize: 12, fontWeight: 500, color: 'var(--bw-text)', textAlign: 'left'
                                }}
                              >
                                <span>More airport charges</span>
                                <CaretDown
                                  size={14}
                                  aria-hidden
                                  style={{
                                    flexShrink: 0,
                                    transform: airportExtrasOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                    opacity: 0.7
                                  }}
                                />
                              </button>
                              {airportExtrasOpen && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                                  {[
                                    { field: 'stc_rate' as BookingPricingField, label: 'STC Rate', format: (v: number) => `${(v * 100).toFixed(1)}%`, step: '0.001' },
                                    { field: 'gratuity_rate' as BookingPricingField, label: 'Gratuity Rate', format: (v: number) => `${(v * 100).toFixed(1)}%`, step: '0.001' },
                                    { field: 'airport_gate_fee' as BookingPricingField, label: 'Airport Gate Fee', format: (v: number) => `$${v.toFixed(2)}`, step: '0.01' },
                                    { field: 'meet_and_greet_fee' as BookingPricingField, label: 'Meet & Greet Fee', format: (v: number) => `$${v.toFixed(2)}`, step: '0.01' },
                                  ].map(extra => (
                                    <div key={extra.field}>
                                      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', marginBottom: 4, letterSpacing: '0.02em' }}>
                                        {extra.label}
                                      </label>
                                      {isEditingThisBooking ? (
                                        <input
                                          type="number" step={extra.step} min="0"
                                          value={(edited as any)[extra.field] ?? 0}
                                          onChange={e => handleBookingInputChange(serviceType, extra.field, parseFloat(e.target.value) || 0)}
                                          className="bw-input"
                                          style={bookingInputStyle}
                                        />
                                      ) : (
                                        <div style={{ fontSize: 13, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontVariantNumeric: 'tabular-nums', fontWeight: 400, color: 'var(--bw-text)', padding: '8px 0' }}>
                                          {extra.format((edited as any)[extra.field] ?? 0)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Per-booking save feedback */}
                          {bookingSaveMsg[serviceType] && (
                            <div style={{
                              marginTop: 10, padding: '8px 12px', borderRadius: 6,
                              backgroundColor: bookingSaveMsg[serviceType]!.ok ? 'rgba(30, 127, 74, 0.08)' : 'rgba(197, 72, 61, 0.08)',
                              border: `1px solid ${bookingSaveMsg[serviceType]!.ok ? 'var(--bw-success)' : 'var(--bw-error)'}`,
                              color: bookingSaveMsg[serviceType]!.ok ? 'var(--bw-success)' : 'var(--bw-error)',
                              fontSize: 12, fontFamily: '"Work Sans", sans-serif', fontWeight: 400
                            }}>
                              {bookingSaveMsg[serviceType]!.text}
                            </div>
                          )}

                          {booking.updated_on && (
                            <div style={{ marginTop: 10, fontSize: 11, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                              Updated {new Date(booking.updated_on).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div style={{
                      gridColumn: '1 / -1', padding: '24px', textAlign: 'center',
                      color: 'var(--bw-muted)', fontSize: 14, fontFamily: '"Work Sans", sans-serif'
                    }}>
                      No booking configurations available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile bottom action bar */}
            {isMobile && (
              <div
                role="toolbar"
                aria-label="Pricing actions"
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
                    <PencilSimple size={16} aria-hidden /> Edit Pricing
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
        </div>

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <>
          <div
            onClick={() => setShowLearnMoreModal(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1000,
              transition: 'opacity 0.3s ease'
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: isMobile ? 'calc(100% - 40px)' : '600px',
            width: '100%', maxHeight: '80vh', overflowY: 'auto',
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)', borderRadius: 12,
            padding: '24px 28px', zIndex: 1001,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)', boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 500, fontFamily: '"DM Sans", sans-serif', color: 'var(--bw-text)' }}>
                About Booking Deposits
              </h3>
              <button
                onClick={() => setShowLearnMoreModal(false)}
                style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                  color: 'var(--bw-text)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', borderRadius: 4, transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bw-bg)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-text)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 20px' }}>
                Booking deposits are upfront payments collected from customers when they make a reservation. This helps secure bookings and reduce no-shows.
              </p>
              <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                Deposit Types
              </h4>
              <ul style={{ margin: '0 0 20px', paddingLeft: 22 }}>
                <li style={{ marginBottom: 10 }}>
                  <strong>Percentage:</strong> A percentage of the total booking cost (e.g., 30% of a $100 booking = $30 deposit).
                </li>
                <li style={{ marginBottom: 10 }}>
                  <strong>Flat:</strong> A fixed dollar amount regardless of booking total (e.g., $75 flat fee).
                </li>
              </ul>
              <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                Service Type Configuration
              </h4>
              <p style={{ margin: '0 0 20px' }}>
                Configure different deposit requirements for each service type (Airport, Hourly, Dropoff) independently.
              </p>
              <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                Payment Processing
              </h4>
              <p style={{ margin: '0 0 20px' }}>
                All bookings are balanced once the ride is complete. The remaining balance is charged automatically when the ride finishes.
              </p>
              <div style={{ padding: '12px 14px', backgroundColor: 'var(--bw-bg)', border: '1px solid var(--bw-border)', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13 }}>
                  <strong>Note:</strong> You can turn off deposits for any service type in{' '}
                  <span style={{ color: 'var(--bw-accent)' }}>Tenant Settings</span>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
