import type { CreateBooking } from '@api/bookings'

export type ServiceType = 'dropoff' | 'airport' | 'hourly'
export type AirportService = 'to_airport' | 'from_airport'
type Coords = { lat: number; lng: number } | null

export type BookingForm = {
  vehicle_id: number
  country: string
  service_type: ServiceType
  airport_service: AirportService | ''
  pickup_location: string
  dropoff_location: string
  airport_location: string
  pickup_date_local: string
  pickup_time_local: string
  hours: number
  notes: string
  pickup_coordinates: Coords
  dropoff_coordinates: Coords
  airport_coordinates: Coords
}

export const EMPTY_FORM: BookingForm = {
  vehicle_id: 0,
  country: 'US',
  service_type: 'dropoff',
  airport_service: '',
  pickup_location: '',
  dropoff_location: '',
  airport_location: '',
  pickup_date_local: '',
  pickup_time_local: '',
  hours: 0,
  notes: '',
  pickup_coordinates: null,
  dropoff_coordinates: null,
  airport_coordinates: null,
}

/** The two stops of the trip in travel order. Airport trips swap one side for the airport. */
export function tripStops(f: BookingForm) {
  const airport = { address: f.airport_location, coords: f.airport_coordinates }
  const pickup = { address: f.pickup_location, coords: f.pickup_coordinates }
  const dropoff = { address: f.dropoff_location, coords: f.dropoff_coordinates }
  if (f.service_type === 'airport') {
    return f.airport_service === 'from_airport' ? { from: airport, to: dropoff } : { from: pickup, to: airport }
  }
  return { from: pickup, to: dropoff }
}

/** Validates the form and shapes the API payload. Returns the first problem as a rider-facing message. */
export function buildBookingPayload(f: BookingForm): { payload: CreateBooking } | { error: string } {
  if (!f.country) return { error: 'Choose your country from the suggestions - typing alone does not save it.' }
  if (f.service_type === 'airport' && !f.airport_service) return { error: 'Choose To airport or From airport.' }
  const { from, to } = tripStops(f)
  if (!from.address) return { error: f.service_type === 'airport' && f.airport_service === 'from_airport' ? 'Add the airport.' : 'Add a pickup address.' }
  if (f.service_type !== 'hourly' && !to.address) {
    return { error: f.service_type === 'airport' && f.airport_service === 'to_airport' ? 'Add the airport.' : 'Add a dropoff address.' }
  }
  if (f.service_type === 'hourly' && f.hours <= 0) return { error: 'Choose how many hours you need.' }
  if (!f.vehicle_id) return { error: 'Choose a vehicle.' }
  if (!f.pickup_date_local || !f.pickup_time_local) return { error: 'Choose a pickup date and time.' }

  // Hourly dropoff is optional; the API still wants a coordinate pair, so 0/0 means "none".
  const coordinates = from.coords && (to.coords || f.service_type === 'hourly')
    ? { plat: from.coords.lat, plon: from.coords.lng, dlat: to.coords?.lat ?? 0, dlon: to.coords?.lng ?? 0 }
    : undefined

  return {
    payload: {
      vehicle_id: f.vehicle_id,
      country: f.country,
      service_type: f.service_type,
      pickup_location: from.address,
      dropoff_location: to.address,
      pickup_time: new Date(`${f.pickup_date_local}T${f.pickup_time_local}`).toISOString(),
      notes: f.notes || undefined,
      coordinates,
      airport_service: f.service_type === 'airport' && f.airport_service ? f.airport_service : undefined,
      hours: f.service_type === 'hourly' ? f.hours : undefined,
    },
  }
}
