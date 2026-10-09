import type { ReactNode } from 'react'
import StatusPill from '@components/StatusPill'
import type { BookingResponse } from '@api/bookings'
import { formatWhen } from '../driver/rideHelpers'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** What the trip is, in a rider's words: "Airport" / "Hourly" / "Dropoff". */
export const serviceLabel = (b: Pick<BookingResponse, 'service_type'>) => cap(b.service_type || 'dropoff')

/** The second line of the route: the dropoff, or the hours for an hourly booking with no dropoff. */
export const dropoffText = (b: Pick<BookingResponse, 'dropoff_location' | 'hours'>) =>
  b.dropoff_location || (b.hours ? `${b.hours} hours, as directed` : 'As directed')

/** One trip: when, status, route, service + vehicle. `children` render below (details, actions). */
export default function TripCard({ booking, next, children }: { booking: BookingResponse; next?: boolean; children?: ReactNode }) {
  const { day, time } = formatWhen(booking.pickup_time)
  return (
    <article className={`rdr-trip${next ? ' is-next' : ''}`}>
      <div className="rdr-trip-top">
        <span className="rdr-when">{day} · {time}</span>
        <StatusPill status={booking.booking_status || ''} size="md" style={{ borderRadius: 999 }} />
      </div>
      <div className="rdr-route-text">
        <span>{booking.pickup_location}</span>
        <span>→ {dropoffText(booking)}</span>
      </div>
      <div className="rdr-trip-foot">
        <span>{serviceLabel(booking)}</span>
        <span>{booking.vehicle}</span>
      </div>
      {children}
    </article>
  )
}
