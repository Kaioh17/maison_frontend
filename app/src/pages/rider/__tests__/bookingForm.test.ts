import { buildBookingPayload, EMPTY_FORM, tripStops, type BookingForm } from '../bookingForm'

const ready: BookingForm = {
  ...EMPTY_FORM,
  vehicle_id: 3,
  pickup_location: '1 Main St',
  dropoff_location: '2 Oak Ave',
  pickup_date_local: '2026-10-10',
  pickup_time_local: '09:30',
  pickup_coordinates: { lat: 1, lng: 2 },
  dropoff_coordinates: { lat: 3, lng: 4 },
}

const err = (f: BookingForm) => ('error' in buildBookingPayload(f) ? (buildBookingPayload(f) as { error: string }).error : null)

describe('buildBookingPayload', () => {
  it('builds a dropoff payload with coordinates', () => {
    const r = buildBookingPayload(ready)
    expect('payload' in r && r.payload).toMatchObject({
      vehicle_id: 3,
      service_type: 'dropoff',
      pickup_location: '1 Main St',
      dropoff_location: '2 Oak Ave',
      coordinates: { plat: 1, plon: 2, dlat: 3, dlon: 4 },
      airport_service: undefined,
      hours: undefined,
    })
  })

  it('reports the first missing field', () => {
    expect(err({ ...ready, vehicle_id: 0 })).toBe('Choose a vehicle.')
    expect(err({ ...ready, dropoff_location: '' })).toBe('Add a dropoff address.')
    expect(err({ ...ready, pickup_time_local: '' })).toBe('Choose a pickup date and time.')
    expect(err({ ...ready, country: '' })).toMatch(/country/)
  })

  it('maps the airport onto the correct side of the trip', () => {
    const to: BookingForm = { ...ready, service_type: 'airport', airport_service: 'to_airport', airport_location: 'JFK', airport_coordinates: { lat: 9, lng: 9 } }
    expect(tripStops(to).to.address).toBe('JFK')
    expect(tripStops({ ...to, airport_service: 'from_airport' }).from.address).toBe('JFK')

    const r = buildBookingPayload({ ...to, airport_service: 'from_airport' })
    expect('payload' in r && r.payload).toMatchObject({
      pickup_location: 'JFK',
      dropoff_location: '2 Oak Ave',
      airport_service: 'from_airport',
      coordinates: { plat: 9, plon: 9, dlat: 3, dlon: 4 },
    })
    expect(err({ ...to, airport_service: '' })).toBe('Choose To airport or From airport.')
    expect(err({ ...to, airport_location: '' })).toBe('Add the airport.')
  })

  it('lets hourly trips skip the dropoff but not the hours', () => {
    const hourly: BookingForm = { ...ready, service_type: 'hourly', dropoff_location: '', dropoff_coordinates: null, hours: 3 }
    const r = buildBookingPayload(hourly)
    expect('payload' in r && r.payload).toMatchObject({ hours: 3, coordinates: { plat: 1, plon: 2, dlat: 0, dlon: 0 } })
    expect(err({ ...hourly, hours: 0 })).toBe('Choose how many hours you need.')
  })

  it('omits coordinates when an address was typed but never picked from suggestions', () => {
    const r = buildBookingPayload({ ...ready, dropoff_coordinates: null })
    expect('payload' in r && r.payload.coordinates).toBeUndefined()
  })
})
