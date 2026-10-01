import { Crosshair, Minus, Plus } from '@phosphor-icons/react'

interface RiderMapPlaceholderProps {
  pickup?: string
  dropoff?: string
  title?: string
}

/**
 * Non-interactive stand-in for the rider map (route preview / ride tracking).
 * Nothing here talks to a map provider yet - swap `.rider-map__canvas` for the real map later
 * and keep the overlay (route summary + controls) as is.
 */
export default function RiderMapPlaceholder({ pickup, dropoff, title = 'Route preview' }: RiderMapPlaceholderProps) {
  return (
    <section className="rider-map" aria-label={`${title} - map not available yet`}>
      <div className="rider-map__canvas" aria-hidden>
        <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
          <g className="rider-map__roads">
            <path d="M-10 150 C 80 120, 120 190, 210 140 S 360 80, 420 110" />
            <path d="M60 -10 C 90 60, 40 120, 100 230" />
            <path d="M250 -10 C 230 70, 300 130, 280 230" />
            <path d="M-10 60 L 420 40" />
          </g>
          <path className="rider-map__route" d="M80 125 C 140 55, 230 130, 290 62" />
          <circle className="rider-map__pin rider-map__pin--from" cx="80" cy="125" r="7" />
          <circle className="rider-map__pin rider-map__pin--to" cx="290" cy="62" r="7" />
        </svg>
      </div>

      <div className="rider-map__top">
        <span className="rider-map__title">{title}</span>
        <span className="bw-soon-tag">Map coming soon</span>
      </div>

      <div className="rider-map__controls" aria-hidden>
        <button type="button" disabled tabIndex={-1}><Plus size={16} /></button>
        <button type="button" disabled tabIndex={-1}><Minus size={16} /></button>
        <button type="button" disabled tabIndex={-1}><Crosshair size={16} /></button>
      </div>

      <dl className="rider-map__route-card">
        <div>
          <dt><span className="rider-map__dot rider-map__dot--from" aria-hidden />Pickup</dt>
          <dd className={pickup ? undefined : 'is-empty'}>{pickup || 'Add a pickup address'}</dd>
        </div>
        <div>
          <dt><span className="rider-map__dot rider-map__dot--to" aria-hidden />Dropoff</dt>
          <dd className={dropoff ? undefined : 'is-empty'}>{dropoff || 'Add a dropoff address'}</dd>
        </div>
      </dl>
    </section>
  )
}
