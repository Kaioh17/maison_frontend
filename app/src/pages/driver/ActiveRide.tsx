import { useEffect, useState } from 'react'
import { ArrowRight, CalendarCheck, ChatCircle, Clock, NavigationArrow, Phone, Question } from '@phosphor-icons/react'
import type { BookingResponse } from '@api/tenant'
import Sheet from './Sheet'
import { NAV_APPS, clockLabel, formatDuration, formatMoney, formatWhen, ridePhase, telHref, untilLabel, type NavApp } from './rideHelpers'
import type { RideAction } from './useDriverData'

/** The Start button unlocks this many minutes before pickup. */
const START_WINDOW = 60
const nowMs = () => Date.now()
const STEPS = ['Started', 'Arrived', 'Complete']
const SERVICE_LABEL: Record<string, string> = { airport: 'Airport', hourly: 'Hourly', dropoff: 'Drop-off' }

/** Booking sets `dropoff_time` to pickup plus the Mapbox route duration (or the booked hours), so the gap is the trip time. */
const tripMinutes = (r: BookingResponse) => Math.max(1, Math.round((new Date(r.dropoff_time).getTime() - new Date(r.pickup_time).getTime()) / 60_000))

type SheetKind = 'start' | 'complete' | 'help' | null

interface ActiveRideProps {
  ride: BookingResponse
  navApp: NavApp
  busy: boolean
  onPhase: (id: number, phase: 'enroute' | 'arrived') => void
  onAct: (id: number, action: RideAction) => void
}

export default function ActiveRide({ ride, navApp, busy, onPhase, onAct }: ActiveRideProps) {
  const [sheet, setSheet] = useState<SheetKind>(null)
  const [now, setNow] = useState(nowMs)
  useEffect(() => {
    const t = window.setInterval(() => setNow(nowMs()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const id = ride.id as number
  const phase = ridePhase(ride)
  const st = phase?.phase ?? 'scheduled'
  const pickupAt = new Date(ride.pickup_time)
  const toGo = Math.round((pickupAt.getTime() - now) / 60_000)
  const canStart = toGo <= START_WINDOW
  const trip = tripMinutes(ride)
  const { day, time } = formatWhen(ride.pickup_time)
  const first = ride.customer_name?.split(' ')[0] || 'rider'
  const initials = (ride.customer_name || 'Rider').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const app = NAV_APPS.find(a => a.id === navApp) ?? NAV_APPS[0]
  const tel = telHref(ride.customer_phone)
  const sms = tel?.replace('tel:', 'sms:')
  const waitSec = phase ? Math.max(0, Math.floor((now - phase.at) / 1000)) : 0

  const count =
    st === 'enroute' ? 'On the way'
    : st === 'arrived' ? `Waiting ${Math.floor(waitSec / 60)}:${String(waitSec % 60).padStart(2, '0')}`
    : untilLabel(ride.pickup_time, new Date(now)) ?? 'Upcoming'
  const urgent = st === 'arrived' || (st === 'scheduled' && canStart)
  const stepIdx = { scheduled: -1, enroute: 0, arrived: 1 }[st]

  const navigate = () => {
    const dest = st === 'arrived' && ride.dropoff_location ? ride.dropoff_location : ride.pickup_location
    window.open(app.url(dest), '_blank', 'noopener,noreferrer')
  }

  const primary =
    st === 'scheduled'
      ? { label: 'Start ride', sub: canStart ? `Opens ${app.label}` : `Unlocks ${clockLabel(new Date(pickupAt.getTime() - START_WINDOW * 60_000))} - ${START_WINDOW} min before`, on: canStart, go: () => setSheet('start') }
      : st === 'enroute'
      ? { label: "I've arrived", sub: 'Starts your wait timer', on: true, go: () => onPhase(id, 'arrived') }
      : { label: 'Complete ride', sub: ride.payment_method === 'cash' ? `Cash - collect ${formatMoney(ride.estimated_price)}` : 'Nothing to collect', on: true, go: () => setSheet('complete') }

  const close = () => setSheet(null)

  return (
    <>
      <section className="drv-active" aria-label="Current ride">
        <div className="drv-active-top">
          <span className="drv-eyebrow">{{ scheduled: 'Next ride', enroute: 'En route', arrived: 'At pickup' }[st]}</span>
          <span className={`drv-chip${urgent ? ' is-urgent' : ''}`}>{count}</span>
        </div>
        <span className="drv-clock">{time}</span>
        <span className="drv-sub">{day} - {SERVICE_LABEL[ride.service_type] ?? ride.service_type} - {formatMoney(ride.estimated_price)}</span>

        <div className="drv-stats">
          <div><span>Trip time</span><strong>{formatDuration(trip)}</strong></div>
          <div><span>Est. end</span><strong>{clockLabel(new Date(ride.dropoff_time))}</strong></div>
        </div>

        <div className="drv-timeline">
          <div className="drv-tl-row">
            <span className="drv-tl-mark"><i className="is-dot" /><i className="is-line" /></span>
            <span className="drv-tl-text"><small>Pickup</small><strong>{ride.pickup_location}</strong></span>
          </div>
          <div className="drv-tl-row">
            <span className="drv-tl-mark"><i className="is-square" /></span>
            <span className="drv-tl-text"><small>Dropoff</small><strong>{ride.dropoff_location || 'As directed'}</strong></span>
          </div>
        </div>

        <div className="drv-rider">
          <span className="drv-avatar">{initials}</span>
          <span className="drv-rider-text">
            <strong>{ride.customer_name || 'Rider'}</strong>
            <span>{{ cash: 'Cash', card: 'Card on file', card_pickup: 'Card at pickup', zelle: 'Zelle' }[ride.payment_method]}
              {ride.payment_method === 'cash' || ride.payment_method === 'card_pickup' ? ` - collect ${formatMoney(ride.estimated_price)}` : ' - nothing to collect'}</span>
          </span>
        </div>

        <ul className="drv-facts">
          {ride.vehicle && <li><CalendarCheck size={16} aria-hidden />{ride.vehicle}</li>}
          <li><Clock size={16} aria-hidden />{ride.hours ? `${ride.hours} hours booked` : 'Booked ride'}</li>
        </ul>
        {ride.notes && <p className="drv-sub">{ride.notes}</p>}

        <div className="drv-steps" aria-label="Progress">
          {STEPS.map((label, i) => (
            <span key={label} className={i <= stepIdx ? 'is-done' : ''}><i />{label}</span>
          ))}
        </div>
      </section>

      <div className="drv-dock">
        <div className="drv-dock-grid">
          <button type="button" onClick={navigate}><NavigationArrow size={22} aria-hidden />Navigate</button>
          {tel ? <a href={tel}><Phone size={22} aria-hidden />Call</a> : <button type="button" disabled><Phone size={22} aria-hidden />Call</button>}
          {sms ? <a href={sms}><ChatCircle size={22} aria-hidden />Message</a> : <button type="button" disabled><ChatCircle size={22} aria-hidden />Message</button>}
          <button type="button" onClick={() => setSheet('help')}><Question size={22} aria-hidden />Help</button>
        </div>
        <button type="button" className="drv-primary" disabled={!primary.on || busy} onClick={primary.go}>
          <span><strong>{primary.label}</strong><small>{primary.sub}</small></span>
          <span className="drv-primary-icon"><ArrowRight size={22} weight="bold" aria-hidden /></span>
        </button>
      </div>

      {sheet === 'start' && (
        <Sheet title="Start this ride?" confirmLabel="Start ride" onClose={close}
          onConfirm={() => { navigate(); onPhase(id, 'enroute'); close() }}>
          {app.label} opens with the pickup loaded. Estimated trip to drop-off: {formatDuration(trip)}.
        </Sheet>
      )}
      {sheet === 'complete' && (
        <Sheet title="Complete this ride?" confirmLabel="Complete ride" busy={busy} onClose={close}
          onConfirm={() => { onAct(id, 'completed'); close() }}>
          {ride.customer_name || 'Rider'} - {formatMoney(ride.estimated_price)}. This can&apos;t be undone.
        </Sheet>
      )}
      {sheet === 'help' && (
        <Sheet title="Need help?" confirmLabel="Release ride" busy={busy} onClose={close}
          onConfirm={() => { onAct(id, 'cancelled'); close() }}>
          Can&apos;t make this ride? It goes back to dispatch to be offered to another chauffeur.
        </Sheet>
      )}
    </>
  )
}
