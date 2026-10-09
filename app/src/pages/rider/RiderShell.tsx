import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CalendarPlus, CarProfile, ClockCounterClockwise, DotsThree, EnvelopeSimple, House, Phone, SignOut, UserCircle } from '@phosphor-icons/react'
import Modal from '@components/Modal'
import Notice from '@components/Notice'
import { useFavicon } from '@hooks/useFavicon'
import { useAuthStore } from '@store/auth'
import { isCompleteUsPhone, zelleNumberFromApi } from '@utils/zelleContact'
import { telHref } from '../driver/rideHelpers'
import BrandIcon from './BrandIcon'
import { RIDER_CSS } from './riderCss'
import { useRiderState } from './useRiderData'

const TABS = [
  { to: '/rider/dashboard', label: 'Home', Icon: House },
  { to: '/rider/book', label: 'Book', Icon: CalendarPlus },
  { to: '/rider/see-bookings', label: 'Trips', Icon: ClockCounterClockwise },
  { to: '/rider/vehicles', label: 'Fleet', Icon: CarProfile },
]

/**
 * Rider app frame: sticky brand header, page outlet, floating tab bar, and the "More" sheet. State
 * lives in `useRiderState` and reaches the tabs through outlet context, like `DriverShell`.
 */
export default function RiderShell() {
  useFavicon()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const state = useRiderState()
  // The sheet remembers the page it was opened on, so navigating anywhere closes it.
  const [moreFor, setMoreFor] = useState<string | null>(null)
  const moreOpen = moreFor === pathname
  const { tenantInfo, notice } = state

  // Tabs are separate pages: each opens at the top instead of inheriting the last tab's scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const company = tenantInfo?.company_name?.trim() || 'Your operator'
  const phone = tenantInfo?.contact_phone?.trim() || ''
  const phoneText = isCompleteUsPhone(phone) ? zelleNumberFromApi(phone) ?? phone : phone
  const email = tenantInfo?.contact_email?.trim() || ''

  const logout = () => {
    useAuthStore.getState().logout()
    navigate('/riders/login', { replace: true })
  }

  return (
    <div className="bw rdr-canvas">
      <style>{RIDER_CSS}</style>
      <div className="rdr rdr-app">
        <main className="rdr-main">
          <div className="rdr-notice"><Notice notice={notice} /></div>
          <Outlet context={state} />
        </main>

        <nav className="rdr-nav" aria-label="Rider">
          {TABS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `rdr-nav-item${isActive ? ' is-active' : ''}`}>
              {({ isActive }) => (
                <>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
                  {label}
                </>
              )}
            </NavLink>
          ))}
          <button type="button" className={`rdr-nav-item${moreOpen ? ' is-active' : ''}`} aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreFor(pathname)}>
            <DotsThree size={22} weight={moreOpen ? 'fill' : 'bold'} aria-hidden />
            More
          </button>
        </nav>
      </div>

      {moreOpen && (
        <Modal
          variant="sheet"
          onClose={() => setMoreFor(null)}
          title={
            <span className="rdr-sheet-brand">
              <BrandIcon tenantInfo={tenantInfo} size="lg" />
              <span><b>{company}</b><small>{email || phoneText || 'No contact listed yet'}</small></span>
            </span>
          }
        >
          <div className="rdr-stack">
            <div className="rdr-list">
              <Link to="/riders/profile" className="rdr-list-row"><span><UserCircle size={20} aria-hidden />Profile</span><span aria-hidden>→</span></Link>
              {telHref(phone) && <a href={telHref(phone)!} className="rdr-list-row"><span><Phone size={20} aria-hidden />Call</span><span>{phoneText}</span></a>}
              {email && <a href={`mailto:${email}`} className="rdr-list-row"><span><EnvelopeSimple size={20} aria-hidden />Email</span><span>{email}</span></a>}
              <button type="button" className="rdr-list-row" onClick={logout}><span><SignOut size={20} aria-hidden />Log out</span></button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
