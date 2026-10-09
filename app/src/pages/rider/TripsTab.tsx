import { useState, type ChangeEvent, type ReactNode } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { CaretDown, ClockCounterClockwise } from '@phosphor-icons/react'
import { getBookings, type BookingResponse } from '@api/bookings'
import Button from '@components/Button'
import { Skeleton } from '@components/Skeleton'
import { hasZelleRecipient, isCompleteUsPhone, zelleEmailDisplay, zelleEmailFromApi, zelleNumberFromApi } from '@utils/zelleContact'
import { formatMoney, telHref } from '../driver/rideHelpers'
import CancelDialog from './CancelDialog'
import RatingBox from './RatingBox'
import TripCard from './TripCard'
import type { RiderShellCtx } from './useRiderData'

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']
const SERVICES = ['dropoff', 'airport', 'hourly']
const PAYMENT: Record<string, string> = { cash: 'Cash', card: 'Card', card_pickup: 'Card at pickup', zelle: 'Zelle' }
const PAGE = 5
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function TripDetails({ booking, ctx }: { booking: BookingResponse; ctx: RiderShellCtx }) {
  const [open, setOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const status = (booking.booking_status || '').toLowerCase()
  const canCancel = !!booking.id && status !== 'cancelled' && status !== 'completed'
  const tel = telHref(booking.driver_phone)

  const rows: [string, ReactNode][] = [
    ['Booking', `#${booking.id}`],
    ['Payment', PAYMENT[booking.payment_method] ?? cap(booking.payment_method || '')],
  ]
  if (booking.estimated_price > 0) rows.push(['Price', formatMoney(booking.estimated_price)])
  if (booking.driver_name) rows.push(['Driver', booking.driver_name])
  if (tel) rows.push(['Driver phone', <a href={tel}>{booking.driver_phone}</a>])

  return (
    <>
      <button type="button" className="rdr-more" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        Details
        <CaretDown size={18} aria-hidden />
      </button>
      {open && (
        <div className="rdr-stack">
          <dl className="rdr-rows">
            {rows.map(([label, value]) => <div className="rdr-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          {booking.notes && <div className="rdr-note"><strong>Notes</strong>{booking.notes}</div>}
          {booking.payment_method === 'zelle' && hasZelleRecipient(booking.zelle_number, booking.zelle_email) && (
            <div className="rdr-note">
              <strong>Pay with Zelle</strong>
              {isCompleteUsPhone(booking.zelle_number) && <div>Phone: {zelleNumberFromApi(booking.zelle_number)}</div>}
              {zelleEmailFromApi(booking.zelle_email) != null && <div>Email: {zelleEmailDisplay(booking.zelle_email)}</div>}
            </div>
          )}
          {status === 'completed' && booking.id && <RatingBox bookingId={booking.id} userId={ctx.userId} notify={ctx.notify} />}
          {canCancel && <Button variant="destructive" fullWidth onClick={() => setCancelling(true)}>Cancel ride</Button>}
        </div>
      )}
      {cancelling && (
        <CancelDialog
          booking={booking}
          onClose={() => setCancelling(false)}
          onCancelled={message => { setCancelling(false); ctx.notify({ ok: true, text: message }); void ctx.refresh() }}
        />
      )}
    </>
  )
}

export default function TripsTab() {
  const ctx = useOutletContext<RiderShellCtx>()
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [service, setService] = useState('')
  const [limit, setLimit] = useState(PAGE)

  const trips = useQuery({
    queryKey: ['rider', ctx.userId, 'bookings', 'trips', status, service, limit],
    queryFn: () => getBookings({ limit, booking_status: status || undefined, service_type: service || undefined }).then(r => {
      if (!r.success) throw new Error(r.message || 'Could not load your trips')
      return r.data ?? []
    }),
    placeholderData: keepPreviousData,
  })
  const bookings = trips.data ?? []
  const filtered = !!(status || service)
  // The server returns at most `limit` rows, so a short page means we have reached the end.
  const hasMore = bookings.length >= limit

  const filter = (set: (v: string) => void) => (e: ChangeEvent<HTMLSelectElement>) => { set(e.target.value); setLimit(PAGE) }

  return (
    <>
      <h1 className="rdr-title">Your trips</h1>

      <div className="rdr-grid-2 rdr-filters">
        <label className="rdr-field">
          <span>Status</span>
          <select className="rdr-input" value={status} onChange={filter(setStatus)}>
            <option value="">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </label>
        <label className="rdr-field">
          <span>Service</span>
          <select className="rdr-input" value={service} onChange={filter(setService)}>
            <option value="">All services</option>
            {SERVICES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </label>
      </div>

      {trips.isLoading ? (
        <div className="rdr-skel" role="status" aria-label="Loading trips">
          <Skeleton height={132} radius={16} /><Skeleton height={132} radius={16} />
        </div>
      ) : trips.isError ? (
        <div className="rdr-empty" role="alert">
          {(trips.error as Error).message}
          <Button variant="secondary" onClick={() => void trips.refetch()}>Try again</Button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rdr-empty">
          <ClockCounterClockwise size={40} weight="duotone" aria-hidden />
          {filtered ? 'No trips match these filters.' : 'No trips yet. Once you book, you can track every ride here.'}
          {!filtered && <Button variant="secondary" onClick={() => navigate('/rider/book')}>Book a ride</Button>}
        </div>
      ) : (
        <>
          <div className="rdr-cards">
            {bookings.map(b => (
              <TripCard key={b.id} booking={b}>
                <TripDetails booking={b} ctx={ctx} />
              </TripCard>
            ))}
          </div>
          {hasMore ? (
            <Button variant="secondary" fullWidth className="rdr-narrow" disabled={trips.isFetching} onClick={() => setLimit(l => l + PAGE)}>
              {trips.isFetching ? 'Loading…' : 'Show more'}
            </Button>
          ) : (
            <p className="rdr-hint" style={{ marginTop: 0 }}>That is all your trips so far.</p>
          )}
        </>
      )}
    </>
  )
}
