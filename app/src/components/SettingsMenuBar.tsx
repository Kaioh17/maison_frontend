import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Gear, User, Building, Wrench, Car, CreditCard, Question, Palette, CurrencyDollar, CaretRight, ChatCircle, BookOpen, WarningCircle, List, X } from '@phosphor-icons/react'
import { getStripeLoginLink } from '@api/tenantSettings'

interface MenuItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>
  submenu?: MenuItem[]
}

interface MenuGroup {
  label?: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    items: [
      { path: '/tenant/settings/general', label: 'Overview', icon: Gear },
      { path: '/tenant/settings/account', label: 'Account', icon: User },
      { path: '/tenant/settings/company', label: 'Business Profile', icon: Building },
    ]
  },
  {
    label: 'Configure',
    items: [
      { path: '/tenant/settings/tenant-settings', label: 'Booking Settings', icon: Wrench },
      { path: '/tenant/settings/pricing', label: 'Pricing', icon: CurrencyDollar },
      { path: '/tenant/settings/vehicle-config', label: 'Vehicle Classes', icon: Car },
      { path: '/tenant/settings/branding', label: 'Branding', icon: Palette },
      { path: '/tenant/settings/feedback-forms', label: 'Feedback Forms', icon: ChatCircle },
    ]
  },
  {
    label: 'Admin',
    items: [
      { path: '/tenant/settings/plans', label: 'Subscription', icon: CreditCard },
      {
        path: '/tenant/settings/help',
        label: 'Help',
        icon: Question,
        submenu: [
          { path: '/tenant/settings/help/admin', label: 'Operator guide', icon: BookOpen },
          { path: '/tenant/settings/help/troubleshooting', label: 'Common issues', icon: WarningCircle },
          { path: '/tenant/settings/help/stripe', label: 'Stripe integration', icon: CreditCard }
        ]
      }
    ]
  }
]

const menuItems: MenuItem[] = menuGroups.flatMap(g => g.items)

// Flattened for the mobile top bar's page-title lookup — submenu children match by path too.
const flatNavItems: MenuItem[] = menuGroups.flatMap(g =>
  g.items.flatMap(item => (item.submenu && item.submenu.length > 0 ? [item, ...item.submenu] : [item]))
)

const MOBILE_BREAKPOINT = 880

interface SettingsMenuContextType {
  isOpen: boolean
  isMobile: boolean
  toggleMenu: () => void
}

const SettingsMenuContext = createContext<SettingsMenuContextType>({
  isOpen: true,
  isMobile: false,
  toggleMenu: () => {}
})

export const useSettingsMenu = () => useContext(SettingsMenuContext)

// Scoped layout CSS for the floating-panel settings shell. Media queries + :hover live here
// because inline styles can't express either; everything else in this file stays inline to
// match the rest of the codebase's convention (see TENANT_DASHBOARD_LAYOUT_CSS for precedent).
const SETTINGS_LAYOUT_CSS = `
.bw.settings-shell {
  height: 100vh;
  box-sizing: border-box;
  padding: clamp(20px, 2.4vw, 28px);
  display: flex;
  gap: 18px;
  background: var(--settings-backdrop);
  position: relative;
  overflow: hidden;
}
.bw.settings-shell::before {
  content: '';
  position: absolute;
  top: -15%;
  left: 4%;
  width: 55%;
  height: 55%;
  background: radial-gradient(circle, color-mix(in srgb, var(--bw-accent) 18%, transparent) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(60px);
  z-index: 0;
}
.settings-panel {
  position: relative;
  z-index: 1;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: linear-gradient(180deg, var(--settings-panel-top), var(--settings-panel-bottom));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.settings-sidebar-panel {
  width: 270px;
  flex-shrink: 0;
  overflow: hidden;
}
.settings-main-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden auto;
  -webkit-overflow-scrolling: touch;
}
/* Settings pages each set their own root wrapper to min-height: 100vh (correct when the
   page owned full-viewport scrolling). Now the floating panel owns scroll, so that would
   just pad every page with dead scroll space; clamp it back to the panel's own height. */
.settings-main-panel > div {
  min-height: 0 !important;
}
.settings-sidebar-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.settings-nav-item, .settings-nav-subitem, .settings-back-btn {
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}
.settings-nav-item:hover:not(.is-active), .settings-back-btn:hover {
  background-color: var(--bw-bg-hover);
}
.settings-nav-subitem:hover:not(.is-active) {
  background-color: var(--bw-bg-hover);
}
.settings-nav-item.is-active {
  background: color-mix(in srgb, var(--bw-accent) 14%, transparent);
}
.settings-nav-subitem.is-active {
  background: color-mix(in srgb, var(--bw-accent) 10%, transparent);
}
.settings-stripe-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bw-accent) 45%, transparent);
}
.settings-topbar-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--bw-text);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.settings-topbar-icon-btn:hover {
  background-color: var(--bw-bg-hover);
}
.settings-mobile-topbar {
  display: none;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  flex-shrink: 0;
}
.settings-topbar-eyebrow {
  font-size: 11px;
  font-family: "Work Sans", sans-serif;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bw-muted);
  opacity: 0.7;
}
.settings-topbar-page-title {
  font-family: "DM Sans", sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: var(--bw-text);
}
.settings-drawer-backdrop {
  display: none;
}
.settings-drawer-panel {
  display: none;
}

@media (max-width: ${MOBILE_BREAKPOINT}px) {
  .bw.settings-shell {
    flex-direction: column;
    padding: 14px;
    gap: 12px;
  }
  .settings-sidebar-panel {
    display: none;
  }
  .settings-mobile-topbar {
    display: flex;
  }
  .settings-main-panel {
    flex: 1;
    min-height: 0;
  }
  .settings-drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 40;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .settings-drawer-backdrop.is-open {
    opacity: 1;
    pointer-events: auto;
  }
  .settings-drawer-panel {
    display: flex;
    position: fixed;
    top: 14px;
    bottom: 14px;
    left: 14px;
    width: 270px;
    max-width: calc(100vw - 28px);
    z-index: 41;
    transform: translateX(calc(-100% - 14px));
    transition: transform 0.25s ease;
  }
  .settings-drawer-panel.is-open {
    transform: translateX(0);
  }
}
`

interface SettingsMenuBarProps {
  /** Page content; must be nested inside so `useSettingsMenu()` receives the real context (e.g. suppress floating menu). */
  children?: ReactNode
}

export default function SettingsMenuBar({ children }: SettingsMenuBarProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT)
  const [loadingStripeLink, setLoadingStripeLink] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Drill-down behavior: picking a nav item always closes the drawer, whether or not it's open.
  const handleMenuClick = (path: string, hasSubmenu?: boolean) => {
    if (hasSubmenu) {
      setExpandedMenus(prev => {
        const newSet = new Set(prev)
        if (newSet.has(path)) {
          newSet.delete(path)
        } else {
          newSet.add(path)
        }
        return newSet
      })
    } else {
      navigate(path)
      setDrawerOpen(false)
    }
  }

  // Auto-expand menu if current path is in submenu
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu) {
        const isInSubmenu = item.submenu.some(sub => location.pathname === sub.path)
        if (isInSubmenu) {
          setExpandedMenus(prev => new Set(prev).add(item.path))
        }
      }
    })
  }, [location.pathname])

  const handleBackToDashboard = () => {
    setDrawerOpen(false)
    navigate('/tenant/overview')
  }

  const handleStripeLogin = async () => {
    try {
      setLoadingStripeLink(true)
      const response = await getStripeLoginLink()
      if (response.success && response.data.login_link) {
        window.open(response.data.login_link, '_blank', 'noopener,noreferrer')
      } else {
        alert('Failed to get Stripe login link')
      }
    } catch (err: any) {
      console.error('Failed to get Stripe login link:', err)
      alert(err?.response?.data?.message || err?.message || 'Failed to get Stripe login link')
    } finally {
      setLoadingStripeLink(false)
    }
  }

  const toggleMenu = () => {}

  const currentPageTitle = flatNavItems.find(item => item.path === location.pathname)?.label ?? 'Settings'

  // Same sidebar markup for the desktop panel and the mobile drawer — called twice below
  // rather than split into a separate component so it stays a plain closure over this
  // component's state/handlers instead of its own remounting component.
  const renderSidebarBody = (showClose: boolean) => (
    <>
      <div style={{
        padding: '20px 22px',
        borderBottom: '1px solid var(--bw-border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 20,
          fontWeight: 300,
          margin: 0,
          color: 'var(--bw-text)',
          letterSpacing: '0.5px'
        }}>
          Settings
        </h2>
        {showClose && (
          <button
            className="settings-topbar-icon-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close settings menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ padding: '12px', borderBottom: '1px solid var(--bw-border)', flexShrink: 0 }}>
        <button
          className="settings-back-btn"
          onClick={handleBackToDashboard}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 12,
            color: 'var(--bw-text)',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 300,
            textAlign: 'left'
          }}
        >
          <ArrowLeft size={18} style={{ flexShrink: 0 }} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <nav className="settings-sidebar-nav" style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {groupIdx > 0 && (
              <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {group.label && (
                  <span style={{
                    fontSize: 11,
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--bw-muted)',
                    opacity: 0.6,
                    userSelect: 'none'
                  }}>
                    {group.label}
                  </span>
                )}
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--bw-border)' }} />
              </div>
            )}
            {group.items.map((item) => {
              const IconComponent = item.icon
              const isActive = location.pathname === item.path || (item.submenu && item.submenu.some(sub => location.pathname === sub.path))
              const isExpanded = expandedMenus.has(item.path)
              const hasSubmenu = item.submenu && item.submenu.length > 0

              return (
                <div key={item.path}>
                  <button
                    className={`settings-nav-item${isActive ? ' is-active' : ''}`}
                    onClick={() => handleMenuClick(item.path, hasSubmenu)}
                    style={{
                      width: 'calc(100% - 16px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '11px 16px',
                      margin: '0 8px',
                      backgroundColor: isActive ? undefined : 'transparent',
                      border: 'none',
                      borderRadius: 12,
                      color: 'var(--bw-text)',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: isActive ? 500 : 300,
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <IconComponent size={18} style={{ flexShrink: 0, color: isActive ? 'var(--bw-accent)' : 'currentColor' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    </div>
                    {hasSubmenu && (
                      <CaretRight
                        size={16}
                        style={{
                          flexShrink: 0,
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    )}
                  </button>
                  {hasSubmenu && isExpanded && (
                    <div style={{ paddingLeft: '20px', paddingTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {item.submenu!.map((subItem) => {
                        const SubIconComponent = subItem.icon
                        const isSubActive = location.pathname === subItem.path
                        return (
                          <button
                            key={subItem.path}
                            className={`settings-nav-subitem${isSubActive ? ' is-active' : ''}`}
                            onClick={() => handleMenuClick(subItem.path)}
                            style={{
                              width: 'calc(100% - 16px)',
                              margin: '0 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '9px 14px',
                              backgroundColor: isSubActive ? undefined : 'transparent',
                              border: 'none',
                              borderRadius: 10,
                              color: 'var(--bw-text)',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: isSubActive ? 500 : 300,
                              textAlign: 'left'
                            }}
                          >
                            <SubIconComponent size={14} style={{ flexShrink: 0 }} />
                            <span>{subItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: '14px', borderTop: '1px solid var(--bw-border)', flexShrink: 0 }}>
        <button
          className="settings-stripe-btn"
          onClick={handleStripeLogin}
          disabled={loadingStripeLink}
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: 100,
            backgroundColor: 'var(--bw-accent)',
            color: '#ffffff',
            border: 'none',
            cursor: loadingStripeLink ? 'not-allowed' : 'pointer',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 600,
            fontSize: 14,
            opacity: loadingStripeLink ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <CreditCard size={16} />
          <span>{loadingStripeLink ? 'Loading…' : 'Stripe Dashboard'}</span>
        </button>
      </div>
    </>
  )

  return (
    <SettingsMenuContext.Provider value={{ isOpen: true, isMobile, toggleMenu }}>
      <style>{SETTINGS_LAYOUT_CSS}</style>

      {/* Desktop sidebar — fixed-width floating panel, own scroll, hidden below MOBILE_BREAKPOINT via CSS */}
      <div className="settings-panel settings-sidebar-panel">
        {renderSidebarBody(false)}
      </div>

      {/* Mobile top bar — hamburger opens the drawer, shows current section; hidden above MOBILE_BREAKPOINT via CSS */}
      <div className="settings-panel settings-mobile-topbar">
        <button className="settings-topbar-icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Open settings menu">
          <List size={20} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="settings-topbar-eyebrow">Settings</div>
          <div className="settings-topbar-page-title">{currentPageTitle}</div>
        </div>
      </div>

      {/* Mobile drawer — same sidebar content as desktop, slides in from the left over a dimmed/blurred backdrop */}
      <div
        className={`settings-drawer-backdrop${drawerOpen ? ' is-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <div className={`settings-panel settings-drawer-panel${drawerOpen ? ' is-open' : ''}`}>
        {renderSidebarBody(true)}
      </div>

      {/* Main content — flexible-width floating panel, own scroll; page header renders inside it */}
      <div className="settings-panel settings-main-panel">
        {children}
      </div>
    </SettingsMenuContext.Provider>
  )
}
