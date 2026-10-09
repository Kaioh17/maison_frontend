import { useNavigate, useOutletContext } from 'react-router-dom'
import Button from '@components/Button'
import RiderInstallCard from '@components/RiderInstallCard'
import PoweredByMaison from '@components/PoweredByMaison'
import { Skeleton } from '@components/Skeleton'
import { useAuthStore } from '@store/auth'
import type { RiderShellCtx } from './useRiderData'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function ProfileTab() {
  const { me, meLoading, tenantInfo, refresh } = useOutletContext<RiderShellCtx>()
  const navigate = useNavigate()
  const company = tenantInfo?.company_name?.trim() || 'your operator'

  if (meLoading) {
    return <div className="rdr-skel" role="status" aria-label="Loading profile"><Skeleton height={200} radius={16} /><Skeleton height={260} radius={16} /></div>
  }
  if (!me) {
    return (
      <div className="rdr-empty" role="alert">
        We could not load your profile.
        <Button variant="secondary" onClick={() => void refresh()}>Try again</Button>
      </div>
    )
  }

  const sections: { title: string; rows: [string, string | null | undefined][] }[] = [
    { title: 'Personal information', rows: [['First name', me.first_name], ['Last name', me.last_name], ['Email', me.email], ['Phone', me.phone_no]] },
    { title: 'Address', rows: [['Street', me.address], ['City', me.city], ['State', me.state], ['Country', me.country], ['Postal code', me.postal_code]] },
    {
      title: 'Account',
      rows: [
        ['Role', cap(me.role || 'rider')],
        ['Tier', me.tier ? cap(me.tier) : 'Standard'],
        ['Member since', new Date(me.created_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ],
    },
  ]

  return (
    <>
      <div>
        <h1 className="rdr-title">Profile</h1>
        <p className="rdr-sub">Your details with {company}.</p>
      </div>

      <div className="rdr-cards">
      {sections.map(({ title, rows }) => (
        <section className="rdr-section" key={title} aria-label={title}>
          <div className="rdr-label">{title}</div>
          <div className="rdr-list">
            {rows.map(([label, value]) => (
              <div className="rdr-info-row" key={label}><span>{label}</span><span>{value || '—'}</span></div>
            ))}
          </div>
        </section>
      ))}
      </div>

      <RiderInstallCard appName={company} />

      <Button
        variant="secondary"
        fullWidth
        className="rdr-narrow"
        onClick={() => {
          useAuthStore.getState().logout()
          navigate('/riders/login', { replace: true })
        }}
      >
        Sign out
      </Button>

      <PoweredByMaison />
    </>
  )
}
