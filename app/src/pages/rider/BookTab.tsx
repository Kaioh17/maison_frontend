import { useState, type CSSProperties, type MouseEvent } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { createBooking } from '@api/bookings'
import type { VehicleResponse } from '@api/vehicles'
import Button from '@components/Button'
import CountryAutocomplete from '@components/CountryAutocomplete'
import LocationAutocomplete from '@components/LocationAutocomplete'
import Modal from '@components/Modal'
import { getApiErrorMessage } from '@utils/apiError'
import { buildBookingPayload, type AirportService, type BookingForm, type ServiceType } from './bookingForm'
import RouteMap from './RouteMap'
import type { RiderShellCtx } from './useRiderData'

const SERVICES: [ServiceType, string][] = [['dropoff', 'Dropoff'], ['airport', 'Airport'], ['hourly', 'Hourly']]
const DIRECTIONS: [AirportService, string][] = [['to_airport', 'To airport'], ['from_airport', 'From airport']]
const HOURS = [2, 3, 4, 6, 8, 10, 12]

type StopKind = 'pickup' | 'dropoff' | 'airport'
const FIELDS = {
  pickup: { address: 'pickup_location', coords: 'pickup_coordinates' },
  dropoff: { address: 'dropoff_location', coords: 'dropoff_coordinates' },
  airport: { address: 'airport_location', coords: 'airport_coordinates' },
} as const

// Borderless: the route card draws the frame, the field only holds the text.
const BARE: CSSProperties = { border: 0, background: 'transparent', padding: '4px 0', height: 28, minHeight: 0, borderRadius: 0, fontSize: 16 }

const vehicleName = (v: VehicleResponse) => `${v.make} ${v.model}`
const vehicleSub = (v: VehicleResponse) => [v.vehicle_category?.vehicle_category, `${v.seating_capacity} seats`].filter(Boolean).join(' · ')
const today = () => new Date().toLocaleDateString('en-CA')
/** Native pickers open on tap of the whole field, not just the small calendar/clock icon. */
const openPicker = (e: MouseEvent<HTMLInputElement>) => { try { e.currentTarget.showPicker() } catch { /* unsupported: the field still focuses */ } }

export default function BookTab() {
  const { form, setForm, resetForm, vehicles, vehiclesLoading, tenantInfo } = useOutletContext<RiderShellCtx>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [choosing, setChoosing] = useState(false)

  const set = (patch: Partial<BookingForm>) => {
    setForm(f => ({ ...f, ...patch }))
    setError('')
  }
  const chosen = vehicles.find(v => v.id === form.vehicle_id)
  const company = tenantInfo?.company_name?.trim() || 'Your operator'

  const sides: [StopKind, StopKind] = form.service_type === 'airport'
    ? form.airport_service === 'from_airport' ? ['airport', 'dropoff'] : ['pickup', 'airport']
    : ['pickup', 'dropoff']

  const stop = (kind: StopKind, i: number) => {
    const { address, coords } = FIELDS[kind]
    const label = kind === 'airport' ? 'Airport' : kind === 'pickup' ? 'Pickup' : form.service_type === 'hourly' ? 'Dropoff (optional)' : 'Dropoff'
    const placeholder = kind === 'airport' ? 'Enter airport' : `Enter ${kind} address`
    return (
      <div className="rdr-stop" key={`${i}-${kind}`}>
        <span className="rdr-stop-label">{label}</span>
        <LocationAutocomplete
          value={form[address]}
          onChange={value => set({ [address]: value } as Partial<BookingForm>)}
          onLocationSelect={(value, c) => set({ [address]: value, [coords]: c ?? null } as Partial<BookingForm>)}
          placeholder={placeholder}
          ariaLabel={label}
          isAirportOnly={kind === 'airport'}
          country={form.country}
          disabled={submitting}
          inputStyle={BARE}
        />
      </div>
    )
  }

  const submit = async () => {
    const built = buildBookingPayload(form)
    if ('error' in built) return setError(built.error)
    setSubmitting(true)
    try {
      const res = await createBooking(built.payload)
      if (!res.success || !res.data) return setError(res.message || 'Could not create the booking.')
      resetForm()
      navigate('/rider/confirm-booking', { state: { booking: res.data } })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create the booking.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="rdr-title">Book a ride</h1>

      <div className="rdr-split">
      <div className="rdr-col">
      <div className="rdr-seg" role="radiogroup" aria-label="Service type">
        {SERVICES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={form.service_type === value}
            onClick={() => set({ service_type: value, airport_service: value === 'airport' ? 'to_airport' : '', hours: 0 })}
          >
            {label}
          </button>
        ))}
      </div>

      {form.service_type === 'airport' && (
        <div className="rdr-seg" role="radiogroup" aria-label="Airport direction">
          {DIRECTIONS.map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={form.airport_service === value} onClick={() => set({ airport_service: value })}>
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="rdr-route">
        <div className="rdr-route-body">
          <div className="rdr-stops">{sides.map(stop)}</div>
        </div>
        <RouteMap form={form} />
      </div>

      {form.service_type === 'hourly' && (
        <div className="rdr-field">
          <span id="rdr-hours">Duration</span>
          <div className="rdr-chips" role="radiogroup" aria-labelledby="rdr-hours">
            {HOURS.map(h => (
              <button key={h} type="button" role="radio" className="rdr-chip" aria-checked={form.hours === h} onClick={() => set({ hours: h })}>
                {h} hrs
              </button>
            ))}
          </div>
        </div>
      )}

      </div>
      <div className="rdr-col">
      <div className="rdr-grid-2">
        <label className="rdr-field">
          <span>Date</span>
          <input className="rdr-input" type="date" min={today()} value={form.pickup_date_local} onChange={e => set({ pickup_date_local: e.target.value })} onClick={openPicker} />
        </label>
        <label className="rdr-field">
          <span>Time</span>
          <input className="rdr-input" type="time" value={form.pickup_time_local} onChange={e => set({ pickup_time_local: e.target.value })} onClick={openPicker} />
        </label>
      </div>

      <div className="rdr-field">
        <span>Vehicle</span>
        <button type="button" className="rdr-pick" aria-haspopup="dialog" onClick={() => setChoosing(true)}>
          <span className="rdr-pick-main">
            <strong>{chosen ? vehicleName(chosen) : 'Select a vehicle'}</strong>
            <span>{chosen ? vehicleSub(chosen) : 'Sedans, SUVs and vans'}</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>Change<CaretDown size={14} aria-hidden /></span>
        </button>
      </div>

      <div className="rdr-field">
        <span>Country</span>
        <CountryAutocomplete
          value={form.country}
          onChange={country => set({ country })}
          placeholder="Enter country"
          ariaLabel="Country"
          required
          disabled={submitting}
          className="rdr-input"
          style={{ height: 50, padding: '0 14px', borderRadius: 12, border: '1px solid var(--bw-border)', backgroundColor: 'var(--bw-bg-secondary)', fontSize: 15 }}
        />
      </div>

      <label className="rdr-field">
        <span>Notes for your chauffeur (optional)</span>
        <textarea className="rdr-input" rows={3} placeholder="Gate code, luggage, child seat…" value={form.notes} onChange={e => set({ notes: e.target.value })} />
      </label>

      {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
      <Button fullWidth disabled={submitting} onClick={submit} style={{ minHeight: 54, fontSize: 16 }}>
        {submitting ? 'Booking…' : 'Book ride'}
      </Button>
      <p className="rdr-hint">You will review the price and choose how to pay next. {company} confirms by email.</p>
      </div>
      </div>

      {choosing && (
        <Modal variant="sheet" title="Choose a vehicle" onClose={() => setChoosing(false)}>
          {vehiclesLoading ? (
            <div className="rdr-empty" role="status">Loading vehicles…</div>
          ) : vehicles.length === 0 ? (
            <div className="rdr-empty">No vehicles are available yet.</div>
          ) : (
            <div className="rdr-options" role="radiogroup" aria-label="Vehicle">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  className="rdr-option"
                  aria-checked={form.vehicle_id === v.id}
                  onClick={() => { set({ vehicle_id: v.id }); setChoosing(false) }}
                >
                  <span className="rdr-option-main"><strong>{vehicleName(v)}</strong><span>{vehicleSub(v)}</span></span>
                  <span className="rdr-radio" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
