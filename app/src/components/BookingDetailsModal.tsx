import type { ReactNode } from 'react'
import Button from '@components/Button'
import Modal from '@components/Modal'
import StatusPill from '@components/StatusPill'
import { Skeleton } from '@components/Skeleton'
import type { BookingResponse } from '@api/tenant'
import type { BookingRatingResponse } from '@api/bookings'
import {
  zelleNumberFromApi,
  zelleEmailFromApi,
  hasZelleRecipient,
  zelleEmailDisplay,
  isCompleteUsPhone,
} from '@utils/zelleContact'
import { RatingStar, starFillPercent, overviewBookingStatusDisplay } from '../pages/tenant/shared'

export interface BookingDetailsModalProps {
  booking: BookingResponse | null
  loading: boolean
  rating: BookingRatingResponse | null
  loadingRating: boolean
  onClose: () => void
  onAssignDriver: () => void
}

const money = (n: number | null | undefined) =>
  `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtWhen = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null

function Row({ label, children }: { label: string; children?: ReactNode }) {
  const empty = children == null || children === ''
  return (
    <div>
      <dt>{label}</dt>
      <dd className={empty ? 'is-empty' : undefined}>{empty ? 'Not provided' : children}</dd>
    </div>
  )
}

const tel = (phone?: string | null) => (phone ? <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a> : null)

/** Tenant booking detail dialog: summary, route timeline, people, payment, rating, notes. */
export default function BookingDetailsModal({ booking, loading, rating, loadingRating, onClose, onAssignDriver }: BookingDetailsModalProps) {
  const footer = <Button variant="secondary" onClick={onClose}>Close</Button>

  if (loading) {
    return (
      <Modal title="Booking" onClose={onClose} width={640} footer={footer}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Skeleton width="40%" height={28} />
          <Skeleton width="100%" height={72} />
          <Skeleton width="100%" height={72} />
        </div>
      </Modal>
    )
  }
  if (!booking) {
    return (
      <Modal title="Booking" onClose={onClose} width={640} footer={footer}>
        <div className="bw-empty">Booking details are not available.</div>
      </Modal>
    )
  }

  const st = overviewBookingStatusDisplay(booking.booking_status)
  const hasDriver = !!booking.driver_name && booking.driver_name !== 'None'
  const service = booking.service_type ? `${booking.service_type}${booking.hours ? ` - ${booking.hours}h` : ''}` : null

  return (
    <Modal
      title={<>Booking #{booking.id} <span style={{ marginLeft: 8, verticalAlign: 'middle' }}><StatusPill status={booking.booking_status} label={st.label} /></span></>}
      onClose={onClose}
      width={640}
      footer={footer}
    >
      <div className="bw-dsum">
        <div>
          <div className="bw-dsum-figure">{money(booking.estimated_price)}</div>
          <div className="bw-dsum-sub">
            Estimated fare{booking.payment_method ? <> - paid by <span style={{ textTransform: 'capitalize' }}>{booking.payment_method}</span></> : null}
          </div>
        </div>
        {service && <div className="bw-dsum-sub" style={{ textTransform: 'capitalize', margin: 0 }}>{service}</div>}
      </div>

      <section className="bw-dsec">
        <div className="bw-dsec-head"><h3 className="bw-section-label">Route</h3></div>
        <ol className="bw-route">
          <li>
            <div className="bw-route-place">{booking.pickup_location}</div>
            <div className="bw-route-time">Pickup - {fmtWhen(booking.pickup_time) ?? 'time not set'}</div>
          </li>
          {booking.dropoff_location && (
            <li>
              <div className="bw-route-place">{booking.dropoff_location}</div>
              <div className="bw-route-time">Dropoff{fmtWhen(booking.dropoff_time) ? ` - ${fmtWhen(booking.dropoff_time)}` : ''}</div>
            </li>
          )}
        </ol>
      </section>

      <section className="bw-dsec">
        <div className="bw-dsec-head"><h3 className="bw-section-label">Customer</h3></div>
        <dl className="bw-kv">
          <Row label="Name">{booking.customer_name}</Row>
          <Row label="Phone">{tel(booking.customer_phone)}</Row>
        </dl>
      </section>

      <section className="bw-dsec">
        <div className="bw-dsec-head">
          <h3 className="bw-section-label">Driver and vehicle</h3>
          <Button variant="secondary" onClick={onAssignDriver} style={{ minHeight: 32, padding: '6px 12px', fontSize: 13 }}>
            {hasDriver ? 'Change driver' : 'Assign driver'}
          </Button>
        </div>
        <dl className="bw-kv">
          <Row label="Driver">{hasDriver ? booking.driver_name : null}</Row>
          <Row label="Driver phone">{tel(booking.driver_phone)}</Row>
          <Row label="Vehicle">{booking.vehicle}</Row>
        </dl>
      </section>

      {booking.payment_method === 'zelle' && hasZelleRecipient(booking.zelle_number, booking.zelle_email) && (
        <section className="bw-dsec">
          <div className="bw-dsec-head"><h3 className="bw-section-label">Zelle recipient</h3></div>
          <dl className="bw-kv">
            {isCompleteUsPhone(booking.zelle_number) && <Row label="Phone">{zelleNumberFromApi(booking.zelle_number)}</Row>}
            {zelleEmailFromApi(booking.zelle_email) != null && <Row label="Email">{zelleEmailDisplay(booking.zelle_email)}</Row>}
          </dl>
        </section>
      )}

      <section className="bw-dsec">
        <div className="bw-dsec-head"><h3 className="bw-section-label">Ride rating</h3></div>
        {loadingRating ? (
          <Skeleton width="50%" height={20} />
        ) : rating ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <RatingStar
                    key={i}
                    fillPercent={starFillPercent(rating.rating_value, i)}
                    gradientId={`booking-rating-${booking.id}-${i}`}
                    size={18}
                  />
                ))}
              </div>
              <span style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{rating.rating_value.toFixed(1)} / 5</span>
            </div>
            <div className="bw-note" style={rating.review_comment ? undefined : { color: 'var(--bw-muted)' }}>
              {rating.review_comment || 'No written review left.'}
            </div>
          </div>
        ) : (
          <div className="bw-dsum-sub" style={{ margin: 0 }}>No rating submitted yet.</div>
        )}
      </section>

      {booking.notes && (
        <section className="bw-dsec">
          <div className="bw-dsec-head"><h3 className="bw-section-label">Notes</h3></div>
          <div className="bw-note">{booking.notes}</div>
        </section>
      )}
    </Modal>
  )
}
