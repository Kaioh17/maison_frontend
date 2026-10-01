import { Link, useOutletContext } from 'react-router-dom'
import { Car } from '@phosphor-icons/react'
import Button from '@components/Button'
import Card from '@components/Card'
import { Skeleton } from '@components/Skeleton'
import RideCard from './RideCard'
import type { DriverShellCtx } from './useDriverData'

/** "Now" screen: what to do next, nothing else. Current ride first, then incoming requests. */
export default function HomeTab() {
  const { info, active, requests, ridesLoading, actingId, act, setOnline, togglingOnline } = useOutletContext<DriverShellCtx>()
  const [next] = active
  const [firstRequest] = requests

  if (ridesLoading && !info) {
    return <div className="drv-stack"><Skeleton height={220} radius={16} /><Skeleton height={220} radius={16} /></div>
  }

  return (
    <div className="drv-stack">
      {info && !info.is_active && (
        <Card>
          <div className="drv-offline">
            <span>You are offline. New ride requests will not reach you.</span>
            <Button disabled={togglingOnline} onClick={() => setOnline(true)}>Go online</Button>
          </div>
        </Card>
      )}

      {next && (
        <>
          <h2 className="drv-section">{active.length > 1 ? `Next ride (${active.length} booked)` : 'Next ride'}</h2>
          <RideCard ride={next} mode="active" hero busy={actingId === next.id} onAct={act} />
          {active.length > 1 && <Link className="btn btn-secondary btn-block" to="/driver/rides">All {active.length} booked rides</Link>}
        </>
      )}

      {firstRequest && (
        <>
          <h2 className="drv-section">New request <span className="drv-count">{requests.length}</span></h2>
          <RideCard ride={firstRequest} mode="request" busy={actingId === firstRequest.id} onAct={act} />
          {requests.length > 1 && (
            <Link className="btn btn-secondary btn-block" to="/driver/rides?tab=requests">
              {requests.length - 1} more {requests.length === 2 ? 'request' : 'requests'}
            </Link>
          )}
        </>
      )}

      {!next && !firstRequest && (
        <Card>
          <div className="drv-empty">
            <Car size={44} weight="duotone" aria-hidden />
            <strong>No rides right now</strong>
            {info?.is_active ? 'Stay online. New requests show up here.' : 'Go online to start receiving requests.'}
          </div>
        </Card>
      )}
    </div>
  )
}
