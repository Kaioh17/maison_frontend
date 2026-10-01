import { useNavigate, useOutletContext } from 'react-router-dom'
import { Car, EnvelopeSimple, Lifebuoy, Phone, SignOut } from '@phosphor-icons/react'
import Button from '@components/Button'
import Card from '@components/Card'
import ThemeToggle from '@components/ThemeToggle'
import { Skeleton } from '@components/Skeleton'
import { useAuthStore } from '@store/auth'
import { telHref } from './rideHelpers'
import type { DriverShellCtx } from './useDriverData'

const row = (label: string, value?: string | number | null) =>
  value ? <div className="drv-row"><dt>{label}</dt><dd>{value}</dd></div> : null

export default function AccountTab() {
  const { info, infoLoading, tenantInfo } = useOutletContext<DriverShellCtx>()
  const navigate = useNavigate()
  const vehicle = info?.vehicle
  const photo = vehicle?.vehicle_images ? Object.values(vehicle.vehicle_images)[0] : null
  const dispatchTel = telHref(tenantInfo?.contact_phone)
  const dispatchMail = tenantInfo?.contact_email?.trim()

  if (infoLoading) return <div className="drv-stack"><Skeleton height={180} radius={12} /><Skeleton height={180} radius={12} /></div>

  return (
    <div className="drv-stack">
      <h1 className="drv-title">Account</h1>

      {info && (
        <Card title="You">
          <dl className="drv-rows">
            {row('Name', `${info.first_name} ${info.last_name}`)}
            {row('Email', info.email)}
            {row('Phone', info.phone_no)}
            {row('Type', info.driver_type === 'in_house' ? 'In-house' : 'Contracted')}
          </dl>
        </Card>
      )}

      <Card title="Vehicle">
        {vehicle ? (
          <>
            {photo
              ? <img className="drv-vehicle-img" src={photo} alt={`${vehicle.make} ${vehicle.model}`} />
              : null}
            <dl className="drv-rows">
              {row('Vehicle', `${vehicle.make} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}`)}
              {row('Plate', vehicle.license_plate)}
              {row('Color', vehicle.color)}
              {row('Seats', vehicle.seating_capacity)}
            </dl>
          </>
        ) : (
          <div className="drv-empty"><Car size={40} weight="duotone" aria-hidden />No vehicle assigned yet. Ask your company.</div>
        )}
      </Card>

      <Card title="Dispatch">
        <div className="drv-actions">
          {dispatchTel && <a className="btn btn-secondary btn-block" href={dispatchTel}><Phone size={20} weight="fill" aria-hidden />Call dispatch</a>}
          {dispatchMail && <a className="btn btn-secondary btn-block" href={`mailto:${dispatchMail}`}><EnvelopeSimple size={20} aria-hidden />Email dispatch</a>}
          {!dispatchTel && !dispatchMail && <p className="drv-sub">Dispatch contact is not listed yet. Ask your manager for the best number.</p>}
        </div>
      </Card>

      <Card title="Appearance"><ThemeToggle mode="segmented" /></Card>

      <div className="drv-actions">
        <Button variant="secondary" fullWidth onClick={() => navigate('/driver/help')}><Lifebuoy size={20} aria-hidden />Help and tips</Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            useAuthStore.getState().logout()
            navigate('/driver/login', { replace: true })
          }}
        >
          <SignOut size={20} aria-hidden />Log out
        </Button>
      </div>
    </div>
  )
}
