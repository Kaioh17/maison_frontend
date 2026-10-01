import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { CalendarCheck, House, UserCircle, Wallet } from '@phosphor-icons/react'
import Notice from '@components/Notice'
import { useFavicon } from '@hooks/useFavicon'
import { DRIVER_CSS } from './driverCss'
import { useDriverState } from './useDriverData'

/**
 * Driver app frame: sticky header (brand + always-reachable online switch), page outlet, bottom
 * tab bar on phones. State lives here and reaches the tabs via outlet context, like `TenantShell`.
 */
export default function DriverShell() {
  useFavicon()
  const { pathname } = useLocation()
  // Tabs are separate pages: each opens at the top instead of inheriting the last tab's scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const state = useDriverState()
  const { tenantInfo, info, requests, notice, togglingOnline, setOnline } = state

  const tabs = [
    { to: '/driver/dashboard', label: 'Home', Icon: House },
    { to: '/driver/rides', label: 'Rides', Icon: CalendarCheck, badge: requests.length },
    { to: '/driver/earnings', label: 'Earnings', Icon: Wallet },
    { to: '/driver/account', label: 'Account', Icon: UserCircle },
  ]
  const online = !!info?.is_active
  const companyName = tenantInfo?.company_name || 'Driver'
  const tenantIcon = tenantInfo?.favicon_url || tenantInfo?.logo_url

  return (
    <div className="bw drv">
      <style>{DRIVER_CSS}</style>
      <header className="drv-head">
        <div className="drv-brand">
          <span className={`drv-icon${tenantInfo?.favicon_url ? '' : ' is-logo'}`} aria-hidden>
            {tenantIcon ? <img src={tenantIcon} alt="" /> : companyName.charAt(0).toUpperCase()}
          </span>
          <span className="drv-brand-name">{companyName}</span>
        </div>
        <nav className="drv-nav" aria-label="Driver">
          {tabs.map(({ to, label, Icon, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {({ isActive }) => (
                <>
                  <Icon size={26} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                  <span>{label}</span>
                  {!!badge && <span className="drv-badge" aria-label={`${badge} new`}>{badge}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          role="switch"
          aria-checked={online}
          aria-label="Available for rides"
          className="drv-online"
          disabled={!info || togglingOnline}
          onClick={() => setOnline(!online)}
        >
          <span className="drv-dot" aria-hidden />
          {online ? 'Online' : 'Offline'}
        </button>
      </header>
      <main className="drv-main">
        <div className="drv-notice"><Notice notice={notice} /></div>
        <Outlet context={state} />
      </main>
    </div>
  )
}
