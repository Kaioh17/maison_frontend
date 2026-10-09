import { useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { CaretRight } from '@phosphor-icons/react'
import StatusPill from '@components/StatusPill'
import { useQuery } from '@tanstack/react-query'
import { getBookings } from '@api/bookings'
import Button from '@components/Button'
import Card from '@components/Card'
import Tabs from '@components/Tabs'
import { Skeleton } from '@components/Skeleton'
import RideCard from './RideCard'
import type { BookingResponse } from '@api/tenant'
import { formatMoney, formatWhen, ridePhase } from './rideHelpers'
import type { DriverShellCtx } from './useDriverData'

type RidesView = 'upcoming' | 'requests' | 'history'
const PAGE = 10

/** Design list row. Upcoming rows open that ride on Home; history rows are read-only. */
function RideRow({ ride, label, to }: { ride: BookingResponse; label: React.ReactNode; to?: string }) {
  const { day, time } = formatWhen(ride.pickup_time)
  const body = (
    <>
      <span className="drv-row-main">
        <span className="drv-row-line"><strong>{day} - {time}</strong><strong>{formatMoney(ride.estimated_price)}</strong></span>
        <span className="drv-meta">{ride.pickup_location} - {ride.customer_name || 'Rider'}</span>
        {label}
      </span>
      {to && <CaretRight size={18} aria-hidden />}
    </>
  )
  return to ? <Link className="drv-ride-row" to={to}>{body}</Link> : <div className="drv-ride-row">{body}</div>
}

/** Newest pickup first, completed and cancelled together. Two filtered fetches so "Show more" pages real history. */
async function loadHistory(limit: number) {
  const [done, cancelled] = await Promise.all([
    getBookings({ booking_status: 'completed', limit }),
    getBookings({ booking_status: 'cancelled', limit }),
  ])
  const all = [...(done.data ?? []), ...(cancelled.data ?? [])]
  const sorted = all.sort((a, b) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
  return { rides: sorted.slice(0, limit), more: (done.data?.length ?? 0) >= limit || (cancelled.data?.length ?? 0) >= limit }
}

export default function RidesTab() {
  const { active, requests, actingId, act, userId, navApp } = useOutletContext<DriverShellCtx>()
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const view: RidesView = raw === 'requests' || raw === 'history' ? raw : 'upcoming'
  const [limit, setLimit] = useState(PAGE)

  const history = useQuery({
    queryKey: ['driver', userId, 'history', limit],
    queryFn: () => loadHistory(limit),
    enabled: view === 'history',
    placeholderData: prev => prev,
  })

  const live: BookingResponse[] = view === 'requests' ? requests : active
  const empty = view === 'requests' ? 'No new requests' : 'No upcoming rides'

  return (
    <div className="drv-stack">
      <h1 className="drv-title">Rides</h1>
      <Tabs<RidesView>
        ariaLabel="Ride lists"
        value={view}
        onChange={id => setParams(id === 'upcoming' ? {} : { tab: id }, { replace: true })}
        tabs={[
          { id: 'upcoming', label: 'Upcoming', count: active.length },
          { id: 'requests', label: 'Requests', count: requests.length },
          { id: 'history', label: 'History' },
        ]}
      />

      {view !== 'history' && (live.length === 0
        ? <Card><div className="drv-empty">{empty}</div></Card>
        : view === 'requests'
        ? live.map(r => <RideCard key={r.id} ride={r} mode="request" navApp={navApp} busy={actingId === r.id} onAct={act} />)
        : (
          <div className="drv-list">
            {live.map(r => (
              <RideRow key={r.id} ride={r} to={`/driver/dashboard?ride=${r.id}`}
                label={<span className="drv-tag">{{ enroute: 'En route', arrived: 'Arrived', none: 'Scheduled' }[ridePhase(r)?.phase ?? 'none']}</span>} />
            ))}
          </div>
        ))}

      {view === 'history' && (
        history.isLoading ? <Skeleton height={180} radius={16} />
        : history.isError ? <Card><div className="drv-empty">Could not load history. Pull to refresh or try again.</div></Card>
        : !history.data?.rides.length ? <Card><div className="drv-empty">No past rides yet</div></Card>
        : (
          <>
            <div className="drv-list">{history.data.rides.map(r => <RideRow key={r.id} ride={r} label={<StatusPill status={r.booking_status} />} />)}</div>
            {history.data.more && (
              <Button variant="secondary" fullWidth disabled={history.isFetching} onClick={() => setLimit(l => l + PAGE)}>
                {history.isFetching ? 'Loading...' : 'Show more'}
              </Button>
            )}
          </>
        )
      )}
    </div>
  )
}
