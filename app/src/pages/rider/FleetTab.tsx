import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Car } from '@phosphor-icons/react'
import type { VehicleResponse } from '@api/vehicles'
import Button from '@components/Button'
import { Skeleton } from '@components/Skeleton'
import StatusPill from '@components/StatusPill'
import VehiclePhotos from './VehiclePhotos'
import type { RiderShellCtx } from './useRiderData'

const isAvailable = (v: VehicleResponse) => ['active', 'available'].includes((v.status || '').toLowerCase())

export default function FleetTab() {
  const { vehicles, vehiclesLoading, setForm } = useOutletContext<RiderShellCtx>()
  const navigate = useNavigate()
  const [openId, setOpenId] = useState<number | null>(null)

  const book = (vehicle_id: number) => {
    setForm(f => ({ ...f, vehicle_id }))
    navigate('/rider/book')
  }

  return (
    <>
      <div>
        <h1 className="rdr-title">Our fleet</h1>
        {vehicles.length > 0 && <p className="rdr-sub">{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}</p>}
      </div>

      {vehiclesLoading ? (
        <div className="rdr-skel" role="status" aria-label="Loading vehicles"><Skeleton height={300} radius={18} /></div>
      ) : vehicles.length === 0 ? (
        <div className="rdr-empty"><Car size={40} weight="duotone" aria-hidden />No vehicles are available yet.</div>
      ) : (
        <div className="rdr-cards">{vehicles.map(v => {
          const details: [string, string | undefined][] = [
            ['License plate', v.license_plate?.trim()],
            ['Color', v.color?.trim()],
          ]
          return (
            <article className="rdr-vehicle" key={v.id}>
              <VehiclePhotos images={v.vehicle_images} />
              <div className="rdr-vehicle-body">
                <div className="rdr-vehicle-top">
                  <div>
                    <strong>{v.make} {v.model}</strong>
                    <span>{[v.year, v.vehicle_category?.vehicle_category, `${v.seating_capacity} seats`].filter(Boolean).join(' · ')}</span>
                  </div>
                  <StatusPill
                    status={isAvailable(v) ? 'active' : 'pending'}
                    label={isAvailable(v) ? 'Available' : 'Unavailable'}
                    size="md"
                    style={{ borderRadius: 999 }}
                  />
                </div>
                {openId === v.id && (
                  <dl className="rdr-rows">
                    {details.map(([label, value]) => <div className="rdr-row" key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}
                  </dl>
                )}
                <div className="rdr-vehicle-actions">
                  <Button variant="secondary" aria-expanded={openId === v.id} onClick={() => setOpenId(id => (id === v.id ? null : v.id))}>
                    {openId === v.id ? 'Hide details' : 'Details'}
                  </Button>
                  <Button onClick={() => book(v.id)}>Book this vehicle</Button>
                </div>
              </div>
            </article>
          )
        })}</div>
      )}
    </>
  )
}
