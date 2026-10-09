import { useCallback, useEffect, useState } from 'react'
import type React from 'react'
import { becomeDriver } from '@api/tenant'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { useTenantTheme, useTheme } from '@contexts/ThemeContext'
import { useQueryClient } from '@tanstack/react-query'
import ThemeToggle from '@components/ThemeToggle'
import Button from '@components/Button'
import Modal from '@components/Modal'
import StatusPill from '@components/StatusPill'
import TenantBookRideModal from '@components/TenantBookRideModal'
import { PilotBadge } from '@components/PilotGate'
import TokenExpirationNotification from '@components/TokenExpirationNotification'
import { TenantDashboardSkeleton } from '@components/Skeleton'
import { useInstallApp, markInstallHandled, promptInstall } from '@hooks/useInstallApp'
import { Car, Users, Calendar, Gear, TrendUp, User, Plus, WarningCircle, SidebarSimple, X, Info, Wallet, Sparkle, ChatCircleDots, List, SignOut, type IconWeight } from '@phosphor-icons/react'
import { extractSubdomain } from '@utils/subdomain'
import { getTenantAppUrl } from '@config/host'
import { TENANT_DASHBOARD_LAYOUT_CSS } from './shared'
import type { TabType, TenantPageThemeMode } from './shared'
import {
  useOperatorInfo,
  useTenantDrivers,
  useTenantVehicles,
  useTenantRiders,
  useTenantBookings,
  useTenantConfigQuery,
  EMPTY_LIST,
} from './useTenantData'

/** Tabs kept out of the 5-slot mobile bar; they stay reachable from the Menu drawer. */
const BOTTOM_BAR_HIDDEN: string[] = ['settings', 'assistant', 'riders', 'feedback', 'payouts']

const NAV_GROUPS: Array<{ label: string; group: 'main' | 'tools' | 'account' }> = [
  { label: 'Manage', group: 'main' },
  { label: 'Tools', group: 'tools' },
  { label: 'Account', group: 'account' },
]

type NavTab = { id: TabType; label: string; group: 'main' | 'tools' | 'account'; icon: React.ComponentType<{ size?: number | string; weight?: IconWeight; style?: React.CSSProperties }> }
const TABS: NavTab[] = [
  { id: 'overview', label: 'Overview', group: 'main', icon: TrendUp },
  { id: 'bookings', label: 'Bookings', group: 'main', icon: Calendar },
  { id: 'drivers', label: 'Drivers', group: 'main', icon: Users },
  { id: 'riders', label: 'Riders', group: 'main', icon: User },
  { id: 'vehicles', label: 'Vehicles', group: 'main', icon: Car },
  { id: 'payouts', label: 'Payouts', group: 'main', icon: Wallet },
  { id: 'assistant', label: 'Assistant', group: 'tools', icon: Sparkle },
  { id: 'settings', label: 'Settings', group: 'account', icon: Gear },
  { id: 'feedback', label: 'Feedback', group: 'account', icon: ChatCircleDots },
]

function tabFromPath(path: string): TabType {
  if (path.startsWith('/tenant/settings')) return 'settings'
  const id = path.split('/')[2]
  return TABS.some((t) => t.id === id) ? (id as TabType) : 'overview'
}

/**
 * State the dashboard chrome and its tabs genuinely share: layout, the topbar buttons that
 * open tab-owned dialogs, the bookings filters (they drive the topbar count) and the error screen.
 * Everything else lives in the tab that uses it (see use*TabState.ts) or in useTenantData.
 */
function useShellState() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  const [bookingStatusFilter, setBookingStatusFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [vehicleIdFilter, setVehicleIdFilter] = useState<number | null>(null)

  const infoQuery = useOperatorInfo()
  const driversQuery = useTenantDrivers()
  const vehiclesQuery = useTenantVehicles()
  const ridersQuery = useTenantRiders()
  const bookingsQuery = useTenantBookings({ bookingStatusFilter, serviceTypeFilter, vehicleIdFilter })
  const tenantConfig = useTenantConfigQuery().data ?? null

  const info = infoQuery.data ?? null
  const drivers = driversQuery.data ?? EMPTY_LIST
  const vehicles = vehiclesQuery.data ?? EMPTY_LIST
  const riders = ridersQuery.data ?? EMPTY_LIST
  const bookings = bookingsQuery.data ?? EMPTY_LIST
  const loading = infoQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading || bookingsQuery.isLoading || ridersQuery.isLoading

  const [error, setError] = useState<string | null>(null)
  const [showBookRideModal, setShowBookRideModal] = useState(false)
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false)

  // Sidebar state (mobile gets the bottom tab bar instead, so the drawer starts closed there)
  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth > 768)
  const [logoFailed, setLogoFailed] = useState(false)
  // Behavioral mobile breakpoint (KPI carousel, stacked controls, etc.)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const [showDriverModeConfirm, setShowDriverModeConfirm] = useState(false)
  const [isSwitchingToDriver, setIsSwitchingToDriver] = useState(false)
  const [switchToDriverError, setSwitchToDriverError] = useState<string | null>(null)
  const [showInstallAppNotice, setShowInstallAppNotice] = useState(false)

  // Sync theme with tenant settings
  useTenantTheme(tenantConfig?.branding?.theme)
  const { theme, setTheme } = useTheme()
  const tenantPageThemeMode: TenantPageThemeMode = theme === 'light' ? 'light' : 'dark'

  // Invalidate all tenant queries (used as retry / refresh; returns Promise so await load() works)
  const load = useCallback(() => queryClient.invalidateQueries({ queryKey: ['tenant'] }), [queryClient])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Crossing into the mobile breakpoint: close the drawer so the bottom tab bar takes over
  useEffect(() => {
    if (isMobile) setIsMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (sessionStorage.getItem('tenant-install-app-tip') === '1') {
      if (!useInstallApp.getState().installed) setShowInstallAppNotice(true)
      sessionStorage.removeItem('tenant-install-app-tip')
    }
  }, [])

  const activeTab = tabFromPath(location.pathname)

  const handleTabClick = (tabId: TabType) => {
    navigate(`/tenant/${tabId}`)
    if (isMobile) setIsMenuOpen(false)
  }

  return {
    info, drivers, vehicles, riders, bookings, tenantConfig, loading,
    bookingStatusFilter, setBookingStatusFilter,
    serviceTypeFilter, setServiceTypeFilter,
    vehicleIdFilter, setVehicleIdFilter,
    error, setError,
    showBookRideModal, setShowBookRideModal,
    showAddDriver, setShowAddDriver,
    showAddVehicleForm, setShowAddVehicleForm,
    isMenuOpen, setIsMenuOpen,
    logoFailed, setLogoFailed,
    isMobile,
    showDriverModeConfirm, setShowDriverModeConfirm,
    isSwitchingToDriver, setIsSwitchingToDriver,
    switchToDriverError, setSwitchToDriverError,
    showInstallAppNotice, setShowInstallAppNotice,
    tenantPageThemeMode,
    handleTenantThemeModeChange: setTheme,
    navigate, location, load,
    tabs: TABS,
    activeTab,
    activeDriverCount: drivers.filter((d) => d.is_active).length,
    getPageTitle: () => TABS.find((tab) => tab.id === activeTab)?.label || 'Overview',
    handleTabClick,
  }
}

export type TenantShellCtx = ReturnType<typeof useShellState>

export default function TenantShell() {
  const ctx = useShellState()
  const appInstalled = useInstallApp((s) => s.installed)
  const canPromptInstall = useInstallApp((s) => !!s.deferred)

  // Prefetch sibling tab chunks on idle so tab switches feel native
  useEffect(() => {
    const rIC = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
    const id = rIC(() => {
      // These dynamic imports just kick off chunk preloading - no await needed
      void import('@pages/tenant/OverviewTab')
      void import('@pages/tenant/DriversTab')
      void import('@pages/tenant/BookingsTab')
      void import('@pages/tenant/VehiclesTab')
    })
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number)
    }
  }, [])
  const {
    info,
    drivers,
    riders,
    vehicles,
    bookings,
    loading,
    error,
    setError,
    tenantConfig,
    showBookRideModal,
    setShowBookRideModal,
    setShowAddDriver,
    showAddVehicleForm,
    setShowAddVehicleForm,
    isMenuOpen,
    setIsMenuOpen,
    logoFailed,
    setLogoFailed,
    isMobile,
    showDriverModeConfirm,
    setShowDriverModeConfirm,
    isSwitchingToDriver,
    setIsSwitchingToDriver,
    switchToDriverError,
    setSwitchToDriverError,
    showInstallAppNotice,
    setShowInstallAppNotice,
    tenantPageThemeMode,
    handleTenantThemeModeChange,
    navigate,
    load,
    tabs,
    activeTab,
    activeDriverCount,
    getPageTitle,
    handleTabClick,
  } = ctx

  if (loading) {
    return (
      <div className="bw" style={{ minHeight: 'var(--app-h)', backgroundColor: 'var(--bw-bg)' }}>
        <TenantDashboardSkeleton />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
            <div className="bw-header-actions">
              <Button variant="secondary" onClick={() => useAuthStore.getState().logout()} style={{ marginLeft: 16 }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: 'var(--bw-muted)', marginBottom: '16px' }}>
            <WarningCircle size={48} className="mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-muted)' }}>No Tenant Information</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--bw-muted)' }}>Unable to load tenant information. Please try again.</p>
          <Button onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  // Error boundary for the component
  if (error) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
            <div className="bw-header-actions">
              <Button variant="secondary" onClick={() => useAuthStore.getState().logout()} style={{ marginLeft: 16 }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: 'var(--bw-error)', marginBottom: '16px' }}>
            <WarningCircle size={48} className="mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-error)' }}>Error Loading Dashboard</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--bw-muted)' }}>{error}</p>
          <Button onClick={() => {
              setError(null)
              load()
            }}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bw tenant-dashboard-layout" style={{
      minHeight: 'var(--app-h)',
      display: 'flex'
    }}>
      <style>{TENANT_DASHBOARD_LAYOUT_CSS}</style>
      {/* Token Expiration Notification */}
      <TokenExpirationNotification />
      
      {/* Mobile overlay when drawer is open */}
      {isMobile && isMenuOpen && (
        <div
          className="tenant-dashboard-nav-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Menu - Left Aligned */}
      <div
        id="tenant-dashboard-nav"
        className={`tenant-dashboard-sidebar${isMenuOpen ? ' is-open' : ''}`}
      >
        {/* Company header */}
        <div style={{
          height: 60,
          padding: '0 14px',
          borderBottom: '1px solid var(--bw-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label={info?.profile?.company_name || 'Dashboard'}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', flexShrink: 0, cursor: 'pointer',
              background: info?.profile?.logo_url && !logoFailed ? 'transparent' : 'var(--bw-accent)',
              color: 'var(--bw-bg)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14, padding: 0, overflow: 'hidden',
            }}
          >
            {info?.profile?.logo_url && !logoFailed ? (
              <img
                src={info.profile.logo_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              (info?.profile?.company_name?.[0] || 'M').toUpperCase()
            )}
          </button>
          {isMenuOpen && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--bw-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {info?.profile?.company_name || 'Dashboard'}
                </div>
                {info?.profile?.city && (
                  <div style={{ fontSize: 12, color: 'var(--bw-muted)', whiteSpace: 'nowrap' }}>{info.profile.city}</div>
                )}
              </div>
              <button
                type="button"
                className="tnav-icon-btn"
                onClick={() => setIsMenuOpen(false)}
                aria-label={isMobile ? 'Close menu' : 'Collapse sidebar'}
              >
                {isMobile ? <X size={18} aria-hidden /> : <SidebarSimple size={18} aria-hidden />}
              </button>
            </>
          )}
        </div>

        {/* Navigation Tabs in Sidebar */}
        <nav className="tnav" aria-label="Dashboard">
          {NAV_GROUPS.map(({ label, group }) => (
            <div key={group} style={{ display: 'contents' }}>
              <div className="tnav-label" aria-hidden={!isMenuOpen}>{label}</div>
              {tabs.filter((tab) => tab.group === group).map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`tnav-item${isActive ? ' is-active' : ''}`}
                    onClick={() => handleTabClick(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={tab.label}
                    title={!isMenuOpen ? tab.label : undefined}
                  >
                    <IconComponent size={18} weight={isActive ? 'fill' : 'regular'} style={{ flexShrink: 0 }} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer Section in Sidebar - Expanded */}
        {isMenuOpen && (
          <div style={{
            padding: 'clamp(12px, 1.5vw, 20px)',
            borderTop: '1px solid var(--bw-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flexShrink: 0
          }}>
            {/* User identity row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 0 8px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bw-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '0.02em',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                {info?.first_name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 'clamp(12px, 1.3vw, 14px)',
                  fontWeight: 500,
                  color: 'var(--bw-text)',
                  fontFamily: '"Work Sans", sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3
                }}>
                  {info?.first_name || 'Admin'}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  letterSpacing: '0.03em'
                }}>
                  Operator
                </div>
              </div>
              <ThemeToggle
                mode="segmented"
                value={tenantPageThemeMode}
                onChange={handleTenantThemeModeChange}
              />
            </div>
            <PilotBadge
              onClick={() => {
                if (isMobile) setIsMenuOpen(false)
                navigate('/tenant/settings/legal')
              }}
            />
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                if (isMobile) setIsMenuOpen(false)
                setShowDriverModeConfirm(true)
              }}
            >
              Switch to Driver Mode
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                if (isMobile) setIsMenuOpen(false)
                useAuthStore.getState().logout()
              }}
            >
              <SignOut size={16} aria-hidden />
              Log out
            </Button>
          </div>
        )}

        {/* Footer Section in Sidebar - Collapsed (desktop icon-only rail) */}
        {!isMenuOpen && (
          <div style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--bw-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bw-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: '"Work Sans", sans-serif',
                cursor: 'default',
                userSelect: 'none'
              }}
              title={`${info?.first_name || 'Admin'} · Operator`}
            >
              {info?.first_name?.[0]?.toUpperCase() || 'T'}
            </div>
            <button
              type="button"
              className="tnav-item"
              onClick={() => useAuthStore.getState().logout()}
              title="Log out"
              aria-label="Log out"
            >
              <SignOut size={16} aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Mobile bottom tab bar (replaces the hamburger; "Menu" opens the drawer for settings/account actions) */}
      <nav className={`tenant-dashboard-bottombar${isMenuOpen ? ' is-hidden' : ''}`} aria-label="Primary" aria-hidden={isMenuOpen}>
        {tabs.filter((tab) => !BOTTOM_BAR_HIDDEN.includes(tab.id)).map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id && !isMenuOpen
          return (
            <button
              key={tab.id}
              type="button"
              className={isActive ? 'is-active' : undefined}
              onClick={() => handleTabClick(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              <span>{tab.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          className={isMenuOpen || BOTTOM_BAR_HIDDEN.includes(activeTab) ? 'is-active' : undefined}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="tenant-dashboard-nav"
        >
          <List size={22} weight={isMenuOpen ? 'bold' : 'regular'} aria-hidden />
          <span>Menu</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="tenant-dashboard-main">
          {/* Top bar: page title, live-count subtitle, status */}
          {activeTab !== 'assistant' && (
          <header className="tenant-dashboard-topbar">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1>
                {activeTab === 'overview'
                  ? (() => {
                      const h = new Date().getHours()
                      const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
                      return `${g}, ${info?.first_name || 'there'}`
                    })()
                  : getPageTitle()}
              </h1>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--bw-muted)', fontWeight: 400 }}>
                {activeTab === 'overview' && (
                  <>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    {info?.profile?.city ? ` · ${info.profile.city}` : ''}
                  </>
                )}
                {activeTab === 'drivers' && `${activeDriverCount} active of ${drivers.length} ${drivers.length === 1 ? 'driver' : 'drivers'}`}
                {activeTab === 'bookings' && `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`}
                {activeTab === 'riders' && `${riders.length} ${riders.length === 1 ? 'rider' : 'riders'}`}
                {activeTab === 'vehicles' && `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
                {activeTab === 'payouts' && 'What your drivers earned, who owes what, and who has confirmed'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {activeTab === 'overview' && !isMobile && <StatusPill status="active" label="Dispatch live" size="md" />}
              {(activeTab === 'overview' || activeTab === 'bookings') && (
                <Button onClick={() => setShowBookRideModal(true)}>
                  <Plus size={15} weight="bold" aria-hidden />
                  {isMobile ? 'Book' : 'New booking'}
                </Button>
              )}
              {activeTab === 'drivers' && (
                <Button onClick={() => setShowAddDriver(true)}>
                  <Plus size={15} weight="bold" aria-hidden />
                  {isMobile ? 'Add' : 'Add driver'}
                </Button>
              )}
              {activeTab === 'vehicles' && (
                <Button onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}>
                  <Plus size={15} weight="bold" aria-hidden />
                  {isMobile ? 'Add' : 'Add vehicle'}
                </Button>
              )}
            </div>
          </header>
          )}

          {/* Tab Content */}
          <div className={`tenant-dashboard-content${activeTab === 'assistant' ? ' is-chat' : ''}`}>
          <div className="bw-tab-content" style={{
            fontFamily: '"Work Sans", sans-serif',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
        {showInstallAppNotice && !appInstalled && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'fixed',
              top: `calc(${isMobile ? '12px' : '16px'} + env(safe-area-inset-top, 0px))`,
              right: `calc(${isMobile ? '12px' : '16px'} + env(safe-area-inset-right, 0px))`,
              left: isMobile ? 'calc(12px + env(safe-area-inset-left, 0px))' : 'auto',
              zIndex: 1100,
              width: isMobile ? 'auto' : 'min(420px, calc(100% - 32px))',
              border: '1px solid var(--bw-border-strong)',
              background: 'var(--bw-bg-secondary)',
              borderRadius: 10,
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: 1, color: 'var(--bw-accent)' }} aria-hidden />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--bw-text)' }}>
                  Install Maison as an app
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--bw-muted)', lineHeight: 1.45 }}>
                  Add Maison to your iPhone or Android home screen for faster access.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {canPromptInstall && (
                    <Button onClick={() => void promptInstall()} style={{ minHeight: 36, padding: '8px 12px', fontSize: 13 }}>Install app</Button>
                  )}
                  <Button variant="secondary" onClick={() => {
                      setShowInstallAppNotice(false)
                      navigate('/tenant/settings/help#install-web-app')
                    }} style={{ minHeight: 36, padding: '8px 12px', fontSize: 13 }}>View instructions</Button>
                  <Button variant="secondary" onClick={markInstallHandled} style={{ minHeight: 36, padding: '8px 12px', fontSize: 13 }}>Not now</Button>
                </div>
              </div>
              <button
                type="button"
                onClick={markInstallHandled}
                aria-label="Dismiss install app notice"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--bw-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          </div>
        )}

        <Outlet context={ctx} />
          </div>
          </div>

      {showDriverModeConfirm && (
        <Modal
          title="Switch to Driver Mode"
          width={500}
          onClose={() => setShowDriverModeConfirm(false)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowDriverModeConfirm(false)
                }}
              >
                Cancel
              </Button>
              <Button
                                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  try {
                    setIsSwitchingToDriver(true)
                    setSwitchToDriverError(null)

                    const response = await becomeDriver()

                    const accessToken = response.data?.access_token || (response as any).access_token

                    if (accessToken) {
                      const tenantSlug =
                        tenantConfig?.branding?.slug?.trim() ||
                        info?.profile?.slug?.trim() ||
                        extractSubdomain(window.location.hostname) ||
                        ''
                      if (!tenantSlug) {
                        setSwitchToDriverError('Unable to determine your tenant slug. Set your slug in Settings or open the dashboard from your tenant subdomain, then try again.')
                        return
                      }
                      const driverLoginUrl = getTenantAppUrl(tenantSlug, `/driver/login?token=${encodeURIComponent(accessToken)}`)
                      window.open(driverLoginUrl, '_blank', 'noopener,noreferrer')

                      setShowDriverModeConfirm(false)
                    } else {
                      setSwitchToDriverError(response.error || 'Failed to get driver access token')
                    }
                  } catch (err: any) {
                    console.error('Failed to switch to driver mode:', err)
                    setSwitchToDriverError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to switch to driver mode. Please try again.')
                  } finally {
                    setIsSwitchingToDriver(false)
                  }
                }}
                disabled={isSwitchingToDriver}
              >
                {isSwitchingToDriver ? 'Switching…' : 'Continue'}
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--bw-text)',
              lineHeight: 1.6
            }}>
              You are about to switch to Driver Mode. This will change your view to the driver interface where you can manage your driver profile, view assigned bookings, and access driver-specific features.
            </p>
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--bw-text)',
              lineHeight: 1.6
            }}>
              Do you want to continue?
            </p>
            {switchToDriverError && (
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bw-bg-secondary)',
                border: '1px solid var(--bw-border)',
                borderRadius: '7px',
                color: 'var(--bw-error)',
                fontSize: 'clamp(13px, 1.8vw, 15px)'
              }}>
                {switchToDriverError}
              </div>
            )}
          </div>
        </Modal>
      )}

      <TenantBookRideModal
        open={showBookRideModal}
        onClose={() => setShowBookRideModal(false)}
        vehicles={vehicles}
        isMobile={isMobile}
        onSuccess={() => {
          void load()
        }}
      />
      </div>
    </div>
  )
}
