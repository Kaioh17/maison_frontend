import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Airplane, ArrowRight, Clock, MapPin, type Icon } from '@phosphor-icons/react'
import { getBookingAnalytics, getBookings } from '@api/bookings'
import Button from '@components/Button'
import RiderInstallCard from '@components/RiderInstallCard'
import { Skeleton } from '@components/Skeleton'
import { EMPTY_FORM, type ServiceType } from './bookingForm'
import TripCard from './TripCard'
import type { RiderShellCtx } from './useRiderData'

const SERVICES: { type: ServiceType; label: string; sub: string; Icon: Icon }[] = [
  { type: 'dropoff', label: 'Dropoff', sub: 'Door to door, any address', Icon: MapPin },
  { type: 'airport', label: 'Airport', sub: 'Flight tracked', Icon: Airplane },
  { type: 'hourly', label: 'Hourly', sub: 'At your disposal', Icon: Clock },
]

const greeting = (hour: number) => (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')

export default function HomeTab() {
  const { userId, me, tenantInfo, setForm } = useOutletContext<RiderShellCtx>()
  const navigate = useNavigate()
  const bookingsQuery = useQuery({
    queryKey: ['rider', userId, 'bookings', 'home'],
    queryFn: () => getBookings().then(r => r.data ?? []),
  })
  const statsQuery = useQuery({
    queryKey: ['rider', userId, 'analytics'],
    queryFn: () => getBookingAnalytics().then(r => r.data ?? null),
  })

  const [now] = useState(() => Date.now())
  const bookings = bookingsQuery.data ?? []
  const upcoming = bookings
    .filter(b => ['pending', 'confirmed'].includes((b.booking_status || '').toLowerCase()) && new Date(b.pickup_time).getTime() > now)
    .sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime())
    .slice(0, 3)
  const stats = statsQuery.data
  const company = tenantInfo?.company_name?.trim() || 'your operator'

  const startBooking = (service_type: ServiceType) => {
    setForm(f => ({ ...f, service_type, airport_service: '', hours: 0 }))
    navigate('/rider/book')
  }

  return (
    <>
      <div className="rdr-greeting">
        <span>{greeting(new Date().getHours())}</span>
        <h1 className="rdr-title">{me?.first_name ? `Where to, ${me.first_name}?` : 'Where to?'}</h1>
      </div>

      <button type="button" className="rdr-hero rdr-half" onClick={() => startBooking(EMPTY_FORM.service_type)}>
        <span>
          <strong>Book a ride</strong>
          <span className="rdr-hero-copy">Chauffeured transfers, airport runs and hourly service with {company}.</span>
        </span>
        <span className="rdr-hero-field"><span>Enter pickup address</span><ArrowRight size={18} aria-hidden /></span>
      </button>

      <section className="rdr-section rdr-half" aria-label="Services">
        <div className="rdr-label">Services</div>
        <div className="rdr-services">
          {SERVICES.map((s, i) => (
            <button key={s.type} type="button" className={`rdr-service${i === 0 ? ' is-feature' : ''}`} onClick={() => startBooking(s.type)}>
              {i === 0 ? (
                <>
                  <s.Icon size={24} aria-hidden />
                  <span className="rdr-service-body">
                    <strong>{s.label}</strong>
                    <span>{s.sub}</span>
                    <span className="rdr-service-cta">Book now<ArrowRight size={16} aria-hidden /></span>
                  </span>
                </>
              ) : (
                <>
                  <span className="rdr-service-body"><strong>{s.label}</strong><span>{s.sub}</span></span>
                  <s.Icon size={22} aria-hidden />
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="rdr-section" aria-label="Upcoming rides">
        <div className="rdr-label">
          <span>Upcoming</span>
          <button type="button" className="rdr-link" onClick={() => navigate('/rider/see-bookings')}>All trips</button>
        </div>
        {bookingsQuery.isLoading ? (
          <div className="rdr-skel" role="status" aria-label="Loading rides"><Skeleton height={132} radius={16} /></div>
        ) : upcoming.length > 0 ? (
          <div className="rdr-cards">{upcoming.map((b, i) => <TripCard key={b.id} booking={b} next={i === 0} />)}</div>
        ) : (
          <div className="rdr-empty">
            {bookings.length === 0
              ? 'No rides yet. Your bookings and trip updates will show up here.'
              : 'No upcoming rides.'}
            <Button variant="secondary" onClick={() => startBooking(EMPTY_FORM.service_type)}>Book a ride</Button>
          </div>
        )}
      </section>

      {stats && stats.total > 0 && (
        <section className="rdr-card rdr-half" aria-label="Your rides">
          <div className="rdr-sum-head">
            <span><strong>{stats.total}</strong> {stats.total === 1 ? 'ride' : 'rides'} booked</span>
            <button type="button" className="rdr-link" onClick={() => navigate('/rider/see-bookings')}>View all<ArrowRight size={14} aria-hidden /></button>
          </div>
          <div className="rdr-sum-bar" role="img" aria-label={`${stats.completed} completed, ${stats.pending} pending of ${stats.total}`}>
            <span className="is-done" style={{ flexGrow: stats.completed }} />
            <span className="is-pending" style={{ flexGrow: stats.pending }} />
            <span className="is-rest" style={{ flexGrow: Math.max(stats.total - stats.completed - stats.pending, 0) }} />
          </div>
          <div className="rdr-sum-legend">
            <span><i className="is-done" aria-hidden /><strong>{stats.completed}</strong> Completed</span>
            <span><i className="is-pending" aria-hidden /><strong>{stats.pending}</strong> Pending</span>
          </div>
        </section>
      )}

      <RiderInstallCard appName={company} />
    </>
  )
}
