import { Money, NavigationArrow, Note, Phone } from '@phosphor-icons/react'
import type { BookingResponse } from '@api/tenant'
import Button from '@components/Button'
import StatusPill from '@components/StatusPill'
import ConfirmButton from './ConfirmButton'
import { appleMapsUrl, collectionNote, formatMoney, formatWhen, googleMapsUrl, prefersAppleMaps, telHref, untilLabel } from './rideHelpers'
import type { RideAction } from './useDriverData'

interface RideCardProps {
  ride: BookingResponse
  /** request: accept/decline. active: call/complete. past: read-only. */
  mode: 'request' | 'active' | 'past'
  hero?: boolean
  busy?: boolean
  onAct?: (id: number, action: RideAction) => void
}

const SERVICE_LABEL: Record<string, string> = { airport: 'Airport', hourly: 'Hourly', dropoff: 'Drop-off' }

const MAP_APPS = [
  { name: 'Google Maps', url: googleMapsUrl },
  { name: 'Apple Maps', url: appleMapsUrl },
]

function Stop({ label, address, navigable }: { label: string; address: string; navigable: boolean }) {
  const apps = prefersAppleMaps() ? [...MAP_APPS].reverse() : MAP_APPS
  return (
    <div className="drv-stop">
      <span className="drv-stop-text">
        <span className="drv-stop-label">{label}</span>
        <span className="drv-stop-addr">{address}</span>
      </span>
      {navigable && (
        <div className="drv-maps">
          {apps.map(app => (
            <a key={app.name} className="btn btn-secondary" href={app.url(address)} target="_blank" rel="noopener noreferrer"
              aria-label={`Navigate to ${label.toLowerCase()} in ${app.name}`}>
              <NavigationArrow size={18} weight="fill" aria-hidden />{app.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RideCard({ ride, mode, hero = false, busy = false, onAct }: RideCardProps) {
  const { day, time } = formatWhen(ride.pickup_time)
  const until = mode === 'active' ? untilLabel(ride.pickup_time) : null
  const collect = mode === 'past' ? null : collectionNote(ride)
  const tel = telHref(ride.customer_phone)
  const id = ride.id
  const act = (action: RideAction) => id != null && onAct?.(id, action)
  const service = SERVICE_LABEL[ride.service_type] ?? ride.service_type
  const navigable = mode !== 'past'

  return (
    <article className={`drv-ride${hero ? ' is-hero' : ''}`}>
      <div className="drv-ride-top">
        <div>
          <div className="drv-when">{day} - {time}</div>
          <div className="drv-meta">{service}{ride.vehicle ? ` - ${ride.vehicle}` : ''}</div>
        </div>
        <div className="drv-ride-side">
          {mode === 'past' ? <StatusPill status={ride.booking_status} /> : until && <span className="drv-until">{until}</span>}
          <span className="drv-fare">{formatMoney(ride.estimated_price)}</span>
        </div>
      </div>

      <div className="drv-customer">{ride.customer_name || 'Rider'}</div>

      <div className="drv-route">
        <Stop label="Pickup" address={ride.pickup_location} navigable={navigable} />
        {ride.dropoff_location
          ? <Stop label="Drop-off" address={ride.dropoff_location} navigable={navigable} />
          : ride.hours ? <div className="drv-meta">Hourly - {ride.hours} h booked</div> : null}
      </div>

      {collect && (
        <div className={`drv-collect is-${collect.tone}`}>
          <Money size={20} weight={collect.tone === 'collect' ? 'fill' : 'regular'} aria-hidden />
          {collect.label}
        </div>
      )}
      {ride.notes && mode !== 'past' && (
        <div className="drv-notes"><Note size={18} aria-hidden /><span>{ride.notes}</span></div>
      )}

      {mode === 'request' && (
        <div className="drv-actions two">
          <ConfirmButton variant="secondary" confirmLabel="Confirm decline" disabled={busy} onConfirm={() => act('cancelled')}>
            Decline
          </ConfirmButton>
          <Button disabled={busy} onClick={() => act('confirmed')}>Accept</Button>
        </div>
      )}
      {mode === 'active' && (
        <div className="drv-actions">
          {tel && (
            <a className="btn btn-secondary btn-block" href={tel}>
              <Phone size={20} weight="fill" aria-hidden />Call {ride.customer_name?.split(' ')[0] || 'rider'}
            </a>
          )}
          <ConfirmButton confirmLabel="Tap again to complete" disabled={busy} onConfirm={() => act('completed')}>
            Complete ride
          </ConfirmButton>
          <ConfirmButton variant="ghost" confirmLabel="Tap again to cancel this ride" disabled={busy} onConfirm={() => act('cancelled')}>
            Can&apos;t make this ride
          </ConfirmButton>
        </div>
      )}
    </article>
  )
}
