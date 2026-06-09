import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { XCircle, Calendar, User, MapPin } from '@phosphor-icons/react'
import LocationAutocomplete from '@components/LocationAutocomplete'
import CountryAutocomplete from '@components/CountryAutocomplete'
import {
  getTenantRiderEmails,
  tenantBookRide,
  type TenantCreateBookingPayload,
  type TenantRiderEmailOption,
  type VehicleResponse,
} from '@api/tenant'

type Props = {
  open: boolean
  onClose: () => void
  vehicles: VehicleResponse[]
  isMobile: boolean
  onSuccess: () => void
}

type ServiceType = 'airport' | 'hourly' | 'dropoff'

const emptyForm = () => ({
  email: '',
  first_name: '',
  last_name: '',
  phone_no: '',
  rider_id: undefined as number | undefined,
  vehicle_id: 0,
  country: 'US',
  service_type: 'dropoff' as ServiceType,
  airport_service: '' as 'to_airport' | 'from_airport' | '',
  pickup_location: '',
  dropoff_location: '',
  airport_location: '',
  pickup_date_local: '',
  pickup_time_local: '',
  hours: 2,
  notes: '',
  pickup_coordinates: null as { lat: number; lng: number } | null,
  dropoff_coordinates: null as { lat: number; lng: number } | null,
  airport_coordinates: null as { lat: number; lng: number } | null,
})

export default function TenantBookRideModal({
  open,
  onClose,
  vehicles,
  isMobile,
  onSuccess,
}: Props) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tenantRiders, setTenantRiders] = useState<TenantRiderEmailOption[]>([])
  const [isLoadingRiders, setIsLoadingRiders] = useState(false)
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)
  const [showNewCustomerFields, setShowNewCustomerFields] = useState(false)
  const [newCustomerHint, setNewCustomerHint] = useState<string | null>(null)
  const emailFieldRef = useRef<HTMLDivElement>(null)

  const reset = useCallback(() => {
    setForm(emptyForm())
    setError(null)
    setSuccessMessage(null)
    setTenantRiders([])
    setShowEmailSuggestions(false)
    setShowNewCustomerFields(false)
    setNewCustomerHint(null)
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const loadTenantRiders = async () => {
    if (tenantRiders.length > 0 || isLoadingRiders) return
    try {
      setIsLoadingRiders(true)
      const res = await getTenantRiderEmails()
      if (res.success && Array.isArray(res.data)) {
        setTenantRiders(res.data)
      }
    } catch {
      setError('Could not load customer emails. Try again.')
    } finally {
      setIsLoadingRiders(false)
    }
  }

  const filteredRiderEmails = useMemo(() => {
    const q = form.email.trim().toLowerCase()
    if (!q) return tenantRiders
    return tenantRiders.filter((r) => r.email.toLowerCase().includes(q))
  }, [form.email, tenantRiders])

  const emailExistsInTenant = useMemo(() => {
    const q = form.email.trim().toLowerCase()
    if (!q) return false
    return tenantRiders.some((r) => r.email.toLowerCase() === q)
  }, [form.email, tenantRiders])

  const selectExistingRider = (rider: TenantRiderEmailOption) => {
    setForm((f) => ({
      ...f,
      email: rider.email,
      rider_id: rider.id,
      first_name: '',
      last_name: '',
      phone_no: '',
    }))
    setShowNewCustomerFields(false)
    setNewCustomerHint(null)
    setShowEmailSuggestions(false)
  }

  const handleEmailFocus = () => {
    void loadTenantRiders()
    setShowEmailSuggestions(true)
    setShowNewCustomerFields(false)
    setNewCustomerHint(null)
  }

  const handleEmailChange = (value: string) => {
    setForm((f) => ({
      ...f,
      email: value,
      rider_id: undefined,
      first_name: '',
      last_name: '',
      phone_no: '',
    }))
    setShowNewCustomerFields(false)
    setNewCustomerHint(null)
    setShowEmailSuggestions(true)
  }

  const handleEmailBlur = () => {
    const trimmed = form.email.trim()
    const selectedRiderId = form.rider_id
    window.setTimeout(() => {
      setShowEmailSuggestions(false)
      if (!trimmed) {
        setShowNewCustomerFields(false)
        setNewCustomerHint(null)
        return
      }
      if (selectedRiderId) return

      const exact = tenantRiders.find((r) => r.email.toLowerCase() === trimmed.toLowerCase())
      if (exact) return

      setShowNewCustomerFields(true)
      setNewCustomerHint(
        'No customer found with this email. Enter their name and phone below to add them when you schedule the ride.'
      )
    }, 150)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (emailFieldRef.current && !emailFieldRef.current.contains(e.target as Node)) {
        setShowEmailSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const buildCoordinates = (): TenantCreateBookingPayload['coordinates'] | undefined => {
    if (form.service_type === 'airport') {
      if (form.airport_service === 'to_airport' && form.pickup_coordinates && form.airport_coordinates) {
        return {
          plat: form.pickup_coordinates.lat,
          plon: form.pickup_coordinates.lng,
          dlat: form.airport_coordinates.lat,
          dlon: form.airport_coordinates.lng,
        }
      }
      if (form.airport_service === 'from_airport' && form.airport_coordinates && form.dropoff_coordinates) {
        return {
          plat: form.airport_coordinates.lat,
          plon: form.airport_coordinates.lng,
          dlat: form.dropoff_coordinates.lat,
          dlon: form.dropoff_coordinates.lng,
        }
      }
      return undefined
    }
    if (form.service_type === 'hourly' && form.pickup_coordinates) {
      return {
        plat: form.pickup_coordinates.lat,
        plon: form.pickup_coordinates.lng,
        dlat: form.dropoff_coordinates?.lat ?? 0,
        dlon: form.dropoff_coordinates?.lng ?? 0,
      }
    }
    if (form.pickup_coordinates && form.dropoff_coordinates) {
      return {
        plat: form.pickup_coordinates.lat,
        plon: form.pickup_coordinates.lng,
        dlat: form.dropoff_coordinates.lat,
        dlon: form.dropoff_coordinates.lng,
      }
    }
    return undefined
  }

  const validate = (): string | null => {
    if (!form.email.trim() || !form.email.includes('@')) return 'Customer email is required.'
    if (!form.rider_id) {
      if (!showNewCustomerFields && emailExistsInTenant) {
        return 'Select a customer email from the list.'
      }
      if (!form.first_name.trim() || !form.last_name.trim() || !form.phone_no.trim()) {
        return 'Enter customer name and phone for a new customer, or select an existing email from the list.'
      }
    }
    if (!form.vehicle_id) return 'Select a vehicle.'
    if (!form.country.trim()) return 'Country is required.'
    if (!form.pickup_date_local || !form.pickup_time_local) return 'Pickup date and time are required.'

    if (form.service_type === 'airport') {
      if (!form.airport_service) return 'Select airport direction (to or from airport).'
      if (form.airport_service === 'to_airport' && (!form.pickup_location || !form.airport_location)) {
        return 'Pickup and airport locations are required.'
      }
      if (form.airport_service === 'from_airport' && (!form.airport_location || !form.dropoff_location)) {
        return 'Airport and drop-off locations are required.'
      }
    } else if (form.service_type === 'hourly') {
      if (!form.pickup_location || form.hours <= 0) return 'Pickup location and hours are required.'
    } else if (!form.pickup_location || !form.dropoff_location) {
      return 'Pickup and drop-off locations are required.'
    }

    if (!buildCoordinates()) return 'Select locations from the suggestions so we can route the trip.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const coordinates = buildCoordinates()!
    let pickupLocation = form.pickup_location
    let dropoffLocation = form.dropoff_location

    if (form.service_type === 'airport') {
      if (form.airport_service === 'to_airport') {
        dropoffLocation = form.airport_location
      } else {
        pickupLocation = form.airport_location
      }
    }

    const payload: TenantCreateBookingPayload = {
      vehicle_id: form.vehicle_id,
      country: form.country,
      service_type: form.service_type,
      pickup_location: pickupLocation,
      pickup_time: new Date(`${form.pickup_date_local}T${form.pickup_time_local}`).toISOString(),
      dropoff_location: dropoffLocation || undefined,
      coordinates,
      notes: form.notes.trim() || undefined,
      airport_service:
        form.service_type === 'airport' && form.airport_service
          ? form.airport_service
          : undefined,
      hours: form.service_type === 'hourly' ? form.hours : undefined,
      rider_id: form.rider_id,
      email: form.rider_id ? undefined : form.email.trim(),
      first_name: form.rider_id ? undefined : form.first_name.trim(),
      last_name: form.rider_id ? undefined : form.last_name.trim(),
      phone_no: form.rider_id ? undefined : form.phone_no.trim(),
    }

    try {
      setIsSubmitting(true)
      setError(null)
      const res = await tenantBookRide(payload)
      if (res.success) {
        setSuccessMessage(
          'Ride scheduled. The customer will receive an email to review and confirm the booking.'
        )
        onSuccess()
        setTimeout(() => handleClose(), 1800)
      } else {
        setError(res.message || 'Failed to schedule ride.')
      }
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to schedule ride.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  const activeVehicles = vehicles.filter((v) => (v.status || 'active').toLowerCase() !== 'inactive')

  return (
    <div className="bw-modal-overlay" onClick={handleClose}>
      <div
        className="bw-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: isMobile ? '100%' : 640, maxHeight: 'min(92vh, 900px)' }}
      >
        <div className="bw-modal-header">
          <h3
            style={{
              margin: 0,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: isMobile ? 22 : 28,
              fontWeight: 200,
              color: 'var(--bw-text)',
            }}
          >
            Schedule ride for customer
          </h3>
          <button type="button" className="bw-btn-icon" onClick={handleClose} aria-label="Close">
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="bw-modal-body"
            style={{ overflowY: 'auto', maxHeight: 'calc(92vh - 160px)' }}
          >
            <p
              className="small-muted"
              style={{
                margin: '0 0 20px 0',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: 15,
                fontWeight: 300,
                color: 'var(--bw-muted)',
                lineHeight: 1.5,
              }}
            >
              Book on behalf of a customer. They will get an email with a link to confirm—no login
              required.
            </p>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: 16,
                  backgroundColor: 'rgba(197, 72, 61, 0.1)',
                  border: '1px solid var(--bw-error)',
                  borderRadius: 8,
                  color: 'var(--bw-error)',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: 16,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: 8,
                  color: '#10b981',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: 14,
                }}
              >
                {successMessage}
              </div>
            )}

            <section style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  color: 'var(--bw-text)',
                }}
              >
                <User size={18} />
                <span style={{ fontWeight: 600, fontFamily: 'Work Sans, sans-serif', fontSize: 14 }}>
                  Customer
                </span>
              </div>
              <div className="bw-form-group" style={{ marginBottom: 12, position: 'relative' }} ref={emailFieldRef}>
                <label className="small-muted">Customer email</label>
                <input
                  className="bw-input"
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  placeholder="Search or enter email…"
                  required
                />
                {isLoadingRiders && (
                  <span style={{ fontSize: 12, color: 'var(--bw-muted)', display: 'block', marginTop: 6 }}>
                    Loading customers…
                  </span>
                )}
                {form.rider_id && (
                  <span style={{ fontSize: 12, color: '#10b981', display: 'block', marginTop: 6 }}>
                    Existing customer selected
                  </span>
                )}
                {showEmailSuggestions && !form.rider_id && tenantRiders.length > 0 && (
                  <ul
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '100%',
                      margin: '4px 0 0 0',
                      padding: 0,
                      listStyle: 'none',
                      maxHeight: 200,
                      overflowY: 'auto',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 20,
                    }}
                  >
                    {filteredRiderEmails.length === 0 ? (
                      <li
                        style={{
                          padding: '12px 14px',
                          fontSize: 13,
                          color: 'var(--bw-muted)',
                          fontFamily: 'Work Sans, sans-serif',
                        }}
                      >
                        No matching emails
                      </li>
                    ) : (
                      filteredRiderEmails.map((rider) => (
                        <li key={rider.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectExistingRider(rider)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 14px',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              fontFamily: 'Work Sans, sans-serif',
                              fontSize: 14,
                              color: 'var(--bw-text)',
                            }}
                          >
                            {rider.email}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
                {newCustomerHint && (
                  <p
                    style={{
                      margin: '10px 0 0 0',
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'var(--bw-muted)',
                      fontFamily: 'Work Sans, sans-serif',
                    }}
                  >
                    {newCustomerHint}
                  </p>
                )}
              </div>
              {showNewCustomerFields && !form.rider_id && (
                <>
                  <div className="bw-form-grid">
                    <div className="bw-form-group">
                      <label className="small-muted">First name</label>
                      <input
                        className="bw-input"
                        value={form.first_name}
                        onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="bw-form-group">
                      <label className="small-muted">Last name</label>
                      <input
                        className="bw-input"
                        value={form.last_name}
                        onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="bw-form-group" style={{ marginTop: 12 }}>
                    <label className="small-muted">Phone</label>
                    <input
                      className="bw-input"
                      type="tel"
                      value={form.phone_no}
                      onChange={(e) => setForm((f) => ({ ...f, phone_no: e.target.value }))}
                      required
                    />
                  </div>
                </>
              )}
            </section>

            <section style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  color: 'var(--bw-text)',
                }}
              >
                <MapPin size={18} />
                <span style={{ fontWeight: 600, fontFamily: 'Work Sans, sans-serif', fontSize: 14 }}>
                  Trip
                </span>
              </div>

              <div className="bw-form-grid" style={{ marginBottom: 12 }}>
                <div className="bw-form-group">
                  <label className="small-muted">Service type</label>
                  <select
                    className="bw-input"
                    value={form.service_type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        service_type: e.target.value as ServiceType,
                        airport_service: '',
                      }))
                    }
                  >
                    <option value="dropoff">Point to point</option>
                    <option value="hourly">Hourly</option>
                    <option value="airport">Airport</option>
                  </select>
                </div>
                <div className="bw-form-group">
                  <label className="small-muted">Vehicle</label>
                  <select
                    className="bw-input"
                    value={form.vehicle_id || ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vehicle_id: Number(e.target.value) }))
                    }
                    required
                  >
                    <option value="">Select vehicle</option>
                    {activeVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} {v.year ?? ''}
                        {v.driver_name ? ` — ${v.driver_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.service_type === 'airport' && (
                <div className="bw-form-group" style={{ marginBottom: 12 }}>
                  <label className="small-muted">Airport direction</label>
                  <select
                    className="bw-input"
                    value={form.airport_service}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        airport_service: e.target.value as 'to_airport' | 'from_airport',
                      }))
                    }
                  >
                    <option value="">Select…</option>
                    <option value="to_airport">To airport</option>
                    <option value="from_airport">From airport</option>
                  </select>
                </div>
              )}

              {form.service_type === 'hourly' && (
                <div className="bw-form-group" style={{ marginBottom: 12 }}>
                  <label className="small-muted">Hours</label>
                  <input
                    className="bw-input"
                    type="number"
                    min={1}
                    step={0.5}
                    value={form.hours}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hours: Number(e.target.value) || 0 }))
                    }
                  />
                </div>
              )}

              {form.service_type !== 'airport' || form.airport_service !== 'from_airport' ? (
                form.service_type === 'airport' && form.airport_service === 'to_airport' ? (
                  <LocationAutocomplete
                    label="Pickup location"
                    value={form.pickup_location}
                    onChange={(v) => setForm((f) => ({ ...f, pickup_location: v }))}
                    onLocationSelect={(address, coords) =>
                      setForm((f) => ({
                        ...f,
                        pickup_location: address,
                        pickup_coordinates: coords ?? null,
                      }))
                    }
                    country={form.country.toLowerCase()}
                  />
                ) : form.service_type !== 'airport' ? (
                  <LocationAutocomplete
                    label="Pickup location"
                    value={form.pickup_location}
                    onChange={(v) => setForm((f) => ({ ...f, pickup_location: v }))}
                    onLocationSelect={(address, coords) =>
                      setForm((f) => ({
                        ...f,
                        pickup_location: address,
                        pickup_coordinates: coords ?? null,
                      }))
                    }
                    country={form.country.toLowerCase()}
                  />
                ) : null
              ) : null}

              {form.service_type === 'airport' && form.airport_service && (
                <div style={{ marginTop: 12 }}>
                  <LocationAutocomplete
                    label="Airport"
                    value={form.airport_location}
                    onChange={(v) => setForm((f) => ({ ...f, airport_location: v }))}
                    onLocationSelect={(address, coords) =>
                      setForm((f) => ({
                        ...f,
                        airport_location: address,
                        airport_coordinates: coords ?? null,
                      }))
                    }
                    isAirportOnly
                    country={form.country.toLowerCase()}
                  />
                </div>
              )}

              {form.service_type === 'airport' && form.airport_service === 'from_airport' && (
                <div style={{ marginTop: 12 }}>
                  <LocationAutocomplete
                    label="Drop-off location"
                    value={form.dropoff_location}
                    onChange={(v) => setForm((f) => ({ ...f, dropoff_location: v }))}
                    onLocationSelect={(address, coords) =>
                      setForm((f) => ({
                        ...f,
                        dropoff_location: address,
                        dropoff_coordinates: coords ?? null,
                      }))
                    }
                    country={form.country.toLowerCase()}
                  />
                </div>
              )}

              {form.service_type === 'dropoff' && (
                <div style={{ marginTop: 12 }}>
                  <LocationAutocomplete
                    label="Drop-off location"
                    value={form.dropoff_location}
                    onChange={(v) => setForm((f) => ({ ...f, dropoff_location: v }))}
                    onLocationSelect={(address, coords) =>
                      setForm((f) => ({
                        ...f,
                        dropoff_location: address,
                        dropoff_coordinates: coords ?? null,
                      }))
                    }
                    country={form.country.toLowerCase()}
                  />
                </div>
              )}

              <div className="bw-form-grid" style={{ marginTop: 12 }}>
                <div className="bw-form-group">
                  <label className="small-muted">Pickup date</label>
                  <input
                    className="bw-input"
                    type="date"
                    value={form.pickup_date_local}
                    onChange={(e) => setForm((f) => ({ ...f, pickup_date_local: e.target.value }))}
                    required
                  />
                </div>
                <div className="bw-form-group">
                  <label className="small-muted">Pickup time</label>
                  <input
                    className="bw-input"
                    type="time"
                    value={form.pickup_time_local}
                    onChange={(e) => setForm((f) => ({ ...f, pickup_time_local: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <CountryAutocomplete
                  value={form.country}
                  onChange={(code) => setForm((f) => ({ ...f, country: code }))}
                  label="Country"
                />
              </div>

              <div className="bw-form-group" style={{ marginTop: 12 }}>
                <label className="small-muted">Notes (optional)</label>
                <textarea
                  className="bw-input"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Flight number, special requests…"
                />
              </div>
            </section>
          </div>

          <div
            className="bw-modal-footer"
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              padding: '16px 24px',
              borderTop: '1px solid var(--bw-border)',
            }}
          >
            <button
              type="button"
              className="bw-btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bw-btn bw-btn-primary"
              disabled={isSubmitting || Boolean(successMessage)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Calendar size={18} />
              {isSubmitting ? 'Scheduling…' : 'Schedule ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
