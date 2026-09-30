/**
 * Shared module-scope pieces of the tenant dashboard, extracted from the old
 * TenantDashboard.tsx monolith (Phase B split — see the maison-ui skill §4).
 * Used by TenantShell and the per-tab route components.
 */
import { useState } from 'react'
import type React from 'react'
import { Car } from '@phosphor-icons/react'
import type { DriverResponse, VehicleResponse, BookingResponse } from '@api/tenant'

/**
 * Shared dashboard color set (single source of truth for all tenant tabs).
 * Mirrors the theme-aware values OverviewTab established as the reference page:
 * tenant custom themes flow through `--bw-*` vars; the default Maison brand uses
 * the indigo light/dark palette. Drivers/Bookings/Vehicles tabs and their modals
 * consume this so the color ratio/balance is identical across the whole space.
 */
export interface DashboardThemeFlags {
  isCustomThemeActive: boolean
  lightMode: boolean
}

export interface DashboardColors {
  cardBg: string
  cardBorder: string
  cardShadow: string
  primaryText: string
  mutedText: string
  mutedAltText: string
  bodyText: string
  insetBg: string
  insetBorder: string
  divider: string
  rowDivider: string
  pillBg: string
  pillBorder: string
  avatarBg: string
  avatarText: string
  chartInsetBg: string
  chartInsetBorder: string
  chartBar: string
  chartStroke: string
  /** Deliberate data-highlight accent (money figures, active nav) — not decoration. */
  accent: string
}

export function getDashboardColors({ isCustomThemeActive, lightMode }: DashboardThemeFlags): DashboardColors {
  return {
    cardBg: isCustomThemeActive ? 'var(--bw-bg-secondary)' : (lightMode ? '#ffffff' : '#1c1a2e'),
    cardBorder: isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid #e5e7eb' : '1px solid #2a2640'),
    cardShadow: isCustomThemeActive ? 'none' : (lightMode ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'),
    primaryText: isCustomThemeActive ? 'var(--bw-text)' : (lightMode ? '#1a1a1a' : '#ffffff'),
    mutedText: isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? '#64748b' : '#7c7a92'),
    mutedAltText: isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? '#64748b' : '#6b6885'),
    bodyText: isCustomThemeActive ? 'var(--bw-text)' : (lightMode ? '#334155' : '#cbd5e1'),
    insetBg: isCustomThemeActive ? 'var(--bw-bg)' : (lightMode ? '#f1f5f9' : 'rgba(0,0,0,0.35)'),
    insetBorder: isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)'),
    divider: isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid rgba(15, 13, 26, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)'),
    rowDivider: isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid rgba(15, 13, 26, 0.07)' : '1px solid rgba(255, 255, 255, 0.07)'),
    pillBg: isCustomThemeActive ? 'var(--bw-bg-hover)' : (lightMode ? 'rgba(108, 99, 232, 0.12)' : 'rgba(108, 99, 232, 0.22)'),
    pillBorder: isCustomThemeActive ? '1px solid var(--bw-border-strong)' : (lightMode ? '1px solid rgba(108, 99, 232, 0.28)' : '1px solid rgba(108, 99, 232, 0.4)'),
    avatarBg: isCustomThemeActive ? 'var(--bw-bg-hover)' : (lightMode ? 'rgba(108, 99, 232, 0.12)' : '#261e3a'),
    avatarText: isCustomThemeActive ? 'var(--bw-accent)' : (lightMode ? 'var(--bw-accent)' : '#9b8fb8'),
    chartInsetBg: isCustomThemeActive ? 'var(--bw-bg)' : (lightMode ? 'rgba(241, 245, 249, 0.45)' : 'rgba(15, 13, 26, 0.4)'),
    chartInsetBorder: isCustomThemeActive ? '1px dashed var(--bw-border-strong)' : (lightMode ? '1px dashed #cbd5e1' : '1px dashed #3d3858'),
    chartBar: isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? 'rgba(15, 13, 26, 0.16)' : 'rgba(255, 255, 255, 0.16)'),
    chartStroke: isCustomThemeActive ? 'var(--bw-text)' : (lightMode ? '#0f0d1a' : '#ffffff'),
    accent: 'var(--bw-accent)',
  }
}

/** Shared typography primitives (color-free; spread a color from getDashboardColors). */
export const DASH_FONT = '"Work Sans", sans-serif'
/** 12px uppercase tracked label — the dashboard's stat/section label treatment. */
export const DASH_LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.055em',
  textTransform: 'uppercase',
  fontFamily: DASH_FONT,
}
/** Large tabular figure — stat values / hero numbers. */
export const DASH_VALUE_STYLE: React.CSSProperties = {
  fontSize: 'clamp(24px, 4vw, 30px)',
  fontWeight: 600,
  fontFamily: DASH_FONT,
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
}
/** Card / section heading. */
export const DASH_SECTION_TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(15px, 2vw, 17px)',
  fontWeight: 600,
  fontFamily: DASH_FONT,
}

/** Shared floating-panel gap — same visual language as SettingsMenuBar's shell. */
export const TENANT_DASHBOARD_SHELL_GAP = 'clamp(20px, 2.4vw, 28px)'

/** Persistent left nav; can be retracted with a shared toggle control. Both the nav
 *  and the content area render as floating panels — the same treatment SettingsMenuBar
 *  uses for its sidebar/main split (see settings-panel in that file). */
export const TENANT_DASHBOARD_LAYOUT_CSS = `
.bw.tenant-dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bw-bg);
  color: var(--bw-text);
}
/* Docked sidebar: sticky, full height, single right border (no floating card). */
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar {
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  width: 72px;
  flex: none;
  z-index: 999;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--bw-border);
  background: var(--bw-bg-secondary);
  transition: width 0.15s ease;
}
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar.is-open {
  width: 248px;
}
.bw.tenant-dashboard-layout .tenant-dashboard-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bw-bg);
}
.bw.tenant-dashboard-layout .tenant-dashboard-content {
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 28px 56px;
  box-sizing: border-box;
  min-width: 0;
}
/* Chat page owns the whole viewport: no page padding, its own header. */
.bw.tenant-dashboard-layout .tenant-dashboard-content.is-chat {
  max-width: none;
  padding: 0;
}
.bw.tenant-dashboard-layout .assistant-page {
  height: 100dvh;
}
@media (max-width: 768px) {
  .bw.tenant-dashboard-layout .tenant-dashboard-content.is-chat {
    padding: 0;
  }
  .bw.tenant-dashboard-layout .assistant-page {
    height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
  }
  .bw.tenant-dashboard-layout .tenant-dashboard-content {
    padding: 16px 16px 88px;
  }
  .bw.tenant-dashboard-layout .tenant-dashboard-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
    padding-top: env(safe-area-inset-top, 0px);
    box-sizing: border-box;
    width: min(300px, 86vw);
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .bw.tenant-dashboard-layout .tenant-dashboard-sidebar.is-open {
    width: min(300px, 86vw);
    transform: translateX(0);
  }
}
.bw.tenant-dashboard-layout .tenant-dashboard-menu-btn {
  display: flex;
}
.bw.tenant-dashboard-layout .tenant-dashboard-bottombar {
  display: none;
}
@media (max-width: 768px) {
  .bw.tenant-dashboard-layout .tenant-dashboard-bottombar {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    height: calc(64px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background-color: var(--bw-bg);
    background-color: color-mix(in srgb, var(--bw-bg) 88%, transparent);
    -webkit-backdrop-filter: saturate(180%) blur(14px);
    backdrop-filter: saturate(180%) blur(14px);
    border-top: 1px solid var(--bw-border);
    box-sizing: border-box;
  }
  /* keep the full-width content panel clear of the fixed bottom tab bar */
  .bw.tenant-dashboard-layout .tenant-dashboard-main {
    height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px));
  }
}
.bw.tenant-dashboard-layout .tenant-dashboard-bottombar button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--bw-muted);
  font-size: 11px;
  font-family: "Work Sans", sans-serif;
  font-weight: 500;
  letter-spacing: 0.01em;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s ease, transform 0.1s ease;
  position: relative;
}
.bw.tenant-dashboard-layout .tenant-dashboard-bottombar button:active {
  transform: scale(0.94);
}
.bw.tenant-dashboard-layout .tenant-dashboard-bottombar button.is-active {
  color: var(--bw-accent);
}
.bw.tenant-dashboard-layout .tenant-dashboard-bottombar button.is-active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 2px;
  border-radius: 0 0 3px 3px;
  background-color: var(--bw-accent);
}
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar-close {
  display: flex;
}
.bw.tenant-dashboard-layout .tenant-dashboard-kpi-rows {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 2vw, 16px);
}
.bw.tenant-dashboard-layout .tenant-dashboard-kpi-row-top {
  display: grid;
  gap: clamp(12px, 2vw, 16px);
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.bw.tenant-dashboard-layout .tenant-dashboard-kpi-row-bottom {
  display: grid;
  gap: clamp(12px, 2vw, 16px);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 1024px) {
  .bw.tenant-dashboard-layout .tenant-dashboard-kpi-row-top,
  .bw.tenant-dashboard-layout .tenant-dashboard-kpi-row-bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 1024px) {
  .bw.tenant-dashboard-layout .tenant-dashboard-charts-row {
    grid-template-columns: 1fr !important;
  }
}
.bw.tenant-dashboard-layout .tenant-dashboard-kpi-scroll {
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.bw.tenant-dashboard-layout .tenant-dashboard-kpi-scroll::-webkit-scrollbar {
  display: none;
}
.bw.tenant-dashboard-layout .tenant-dashboard-kpi-scroll-item {
  flex: 0 0 100%;
  width: 100%;
  min-width: 0;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  box-sizing: border-box;
}
.bw.tenant-dashboard-layout .tenant-overview-nav-card {
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}
.bw.tenant-dashboard-layout .tenant-overview-nav-card:hover {
  border-color: var(--bw-border-strong);
  background-color: var(--bw-bg-hover);
}
.bw.tenant-dashboard-layout .tenant-overview-nav-card:active {
  transform: scale(0.98);
}
.bw.tenant-dashboard-layout .tenant-overview-nav-card:focus-visible {
  outline: 2px solid var(--bw-accent, #6c63e8);
  outline-offset: 2px;
}
.bw.tenant-dashboard-layout .tenant-overview-triple-grid {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-width: 0;
}
/* Dashboard-wide modernizers: steady digits, softer cards, sticky mobile header */
.bw.tenant-dashboard-layout {
  font-variant-numeric: tabular-nums;
}
.bw.tenant-dashboard-layout .bw-card {
  border-radius: 10px;
}
.bw.tenant-dashboard-layout .tenant-dashboard-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bw-bg);
  border-bottom: 1px solid var(--bw-border);
  padding: 10px 28px;
  min-height: 60px;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .bw.tenant-dashboard-layout .tenant-dashboard-topbar {
    padding: calc(max(env(safe-area-inset-top), 0px) + 10px) 16px 10px;
  }
}
.bw.tenant-dashboard-layout .tenant-driver-table-row {
  transition: background-color 0.15s ease;
}
.bw.tenant-dashboard-layout .tenant-driver-table-row:hover {
  background-color: var(--bw-bg-hover);
}

/* Sidebar navigation (grouped) */
.bw.tenant-dashboard-layout .tnav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 8px;
}
.bw.tenant-dashboard-layout .tnav-label {
  padding: 16px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bw-muted);
}
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar:not(.is-open) .tnav-label {
  height: 1px;
  margin: 8px 12px;
  padding: 0;
  overflow: hidden;
  font-size: 0;
  background: var(--bw-border);
}
.bw.tenant-dashboard-layout .tnav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--bw-muted);
  font-family: "Work Sans", sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.bw.tenant-dashboard-layout .tnav-icon-btn {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--bw-muted);
  cursor: pointer;
}
.bw.tenant-dashboard-layout .tnav-icon-btn:hover {
  background: var(--bw-bg-hover);
  color: var(--bw-text);
}
.bw.tenant-dashboard-layout .tnav-item:hover {
  background: var(--bw-bg-hover);
  color: var(--bw-text);
}
.bw.tenant-dashboard-layout .tnav-item:focus-visible {
  outline: 2px solid var(--bw-accent);
  outline-offset: -2px;
}
.bw.tenant-dashboard-layout .tnav-item.is-active {
  background: var(--bw-bg-hover-strong);
  color: var(--bw-text);
}
.bw.tenant-dashboard-layout .tnav-item.is-active svg {
  color: var(--bw-accent);
}
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar:not(.is-open) .tnav-item {
  justify-content: center;
  padding: 8px;
}
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar:not(.is-open) .tnav-item span {
  display: none;
}
.bw.tenant-dashboard-layout .tnav-badge {
  margin-left: auto;
  min-width: 20px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--bw-status-pending-bg);
  color: var(--bw-status-pending-text);
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}
.bw.tenant-dashboard-layout .tenant-dashboard-sidebar:not(.is-open) .tnav-badge {
  display: none;
}
.bw.tenant-dashboard-layout .tenant-dashboard-topbar h1 {
  margin: 0;
  font-family: "Work Sans", sans-serif;
  font-size: clamp(20px, 3vw, 24px);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--bw-text);
}
`.trim()

/** Google Form: complaints, product feedback, and general questions for tenants */
export const TENANT_FEEDBACK_FORM_URL = 'https://forms.gle/521ZvKprmq1YxjMs8'
const STAR_PATH_D = 'M12 2.35l2.96 6 6.62.96-4.79 4.67 1.13 6.59L12 17.45 6.08 20.57l1.13-6.59L2.42 9.31l6.62-.96L12 2.35z'

export function starFillPercent(value: number, index: number): number {
  if (value >= index) return 100
  if (value >= index - 0.5) return 50
  return 0
}

export function RatingStar({
  fillPercent,
  gradientId,
  size = 26,
}: {
  fillPercent: number
  gradientId: string
  size?: number
}) {
  const amber = '#f59e0b'
  const emptyStroke = 'rgba(148, 163, 184, 0.55)'
  const emptyFill = 'rgba(148, 163, 184, 0.08)'

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercent}%`} stopColor={amber} />
          <stop offset={`${fillPercent}%`} stopColor={emptyFill} />
          <stop offset="100%" stopColor={emptyFill} />
        </linearGradient>
      </defs>
      <path
        d={STAR_PATH_D}
        fill={`url(#${gradientId})`}
        stroke={fillPercent > 0 ? amber : emptyStroke}
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export type TabType = 'overview' | 'drivers' | 'riders' | 'bookings' | 'vehicles' | 'settings' | 'feedback' | 'assistant'
export type OverviewLinkKey = 'rider' | 'driver' | 'landing'
export type TenantPageThemeMode = 'dark' | 'light'
export type OverviewLinkQrState = {
  loading: boolean
  imageDataUrl: string | null
  error: string | null
}

// Helper component for vehicle image with fallback
export function VehicleImageCard({ imageUrl, make, model }: { imageUrl: string | null, make: string, model: string }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div style={{
      width: '100%',
      height: 'clamp(150px, 25vw, 200px)',
      backgroundColor: 'var(--bw-bg-secondary)',
      borderBottom: '1px solid var(--bw-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={`${make} ${model}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Car size="clamp(32px, 5vw, 48px)" style={{
          color: 'var(--bw-disabled)',
          opacity: 0.5
        }} />
      )}
    </div>
  )
}

export function overviewDriverInitials(d: Pick<DriverResponse, 'first_name' | 'last_name'>): string {
  const a = (d.first_name?.[0] || '').toUpperCase()
  const b = (d.last_name?.[0] || '').toUpperCase()
  return (a + b) || '?'
}

export function overviewFormatDriverName(d: DriverResponse): string {
  const lastInitial = d.last_name?.[0] ? `${d.last_name[0]}.` : ''
  return `${d.first_name} ${lastInitial}`.trim()
}

export function overviewBookingRefersToDriver(b: BookingResponse, d: DriverResponse): boolean {
  const ref = (b.driver_name || '').toLowerCase().trim()
  if (!ref) return false
  const fn = d.first_name.toLowerCase()
  const ln = d.last_name.toLowerCase()
  if (!fn) return false
  return ref === `${fn} ${ln}`
    || (ref.startsWith(fn) && (ln ? ref.includes(ln) : true))
    || (ref.includes(fn) && ref.includes(ln.slice(0, 1)))
}

export function overviewVehicleLineForDriver(driverId: number, vehicles: VehicleResponse[]): string {
  const v = vehicles.find(veh => veh.driver?.id === driverId || veh.driver_id === driverId)
  if (!v) return 'Vehicle unassigned'
  const plate = v.license_plate || '—'
  return `${v.make} ${v.model} · ${plate}`
}

export type OverviewDriverPresence = 'available' | 'on_ride' | 'offline'

export function overviewDriverPresence(d: DriverResponse, bookings: BookingResponse[]): OverviewDriverPresence {
  if (!d.is_active) return 'offline'
  const onRide = bookings.some(
    b => b.booking_status?.toLowerCase() === 'active' && overviewBookingRefersToDriver(b, d)
  )
  return onRide ? 'on_ride' : 'available'
}

export type OverviewDriverRow = {
  key: string
  initials: string
  name: string
  vehicleLine: string
  presence: OverviewDriverPresence
}

export function buildOverviewDriverRows(
  drivers: DriverResponse[],
  vehicles: VehicleResponse[],
  bookings: BookingResponse[]
): OverviewDriverRow[] {
  return drivers.slice(0, 4).map((d) => ({
    key: `driver-${d.id}`,
    initials: overviewDriverInitials(d),
    name: overviewFormatDriverName(d),
    vehicleLine: overviewVehicleLineForDriver(d.id, vehicles),
    presence: overviewDriverPresence(d, bookings),
  }))
}

export function bookingPickupToday(b: BookingResponse): boolean {
  const t = new Date(b.pickup_time)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return t >= start && t <= end
}

/** Today's and recent bookings from tenant `/bookings` payload only — no synthetic rows. */
export function buildOverviewBookingRows(bookings: BookingResponse[]): BookingResponse[] {
  const byPickup = (a: BookingResponse, b: BookingResponse) =>
    new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime()

  const todaySorted = [...bookings].filter(bookingPickupToday).sort(byPickup)
  const rows: BookingResponse[] = todaySorted.slice(0, 4)

  if (rows.length < 4) {
    const rest = [...bookings].sort(byPickup).filter(b => !rows.some(r =>
      r.id != null && b.id != null ? r.id === b.id : r === b
    ))
    for (const b of rest) {
      if (rows.length >= 4) break
      rows.push(b)
    }
  }

  return rows
}

export function overviewBookingStatusDisplay(status: string | undefined): { label: string; bg: string; color: string } {
  const s = status?.toLowerCase() || ''
  if (s === 'active') return { label: 'Active', bg: 'var(--bw-status-active-bg)', color: 'var(--bw-status-active-text)' }
  if (s === 'pending') return { label: 'Pending', bg: 'var(--bw-status-pending-bg)', color: 'var(--bw-status-pending-text)' }
  if (s === 'completed' || s === 'done' || s === 'complete') return { label: 'Completed', bg: 'var(--bw-status-done-bg)', color: 'var(--bw-status-done-text)' }
  if (s === 'cancelled' || s === 'canceled') return { label: 'Cancelled', bg: 'var(--bw-status-cancelled-bg)', color: 'var(--bw-status-cancelled-text)' }
  if (s === 'confirmed') return { label: 'Confirmed', bg: 'var(--bw-status-confirmed-bg)', color: 'var(--bw-status-confirmed-text)' }
  if (s === 'assigned') return { label: 'Assigned', bg: 'var(--bw-status-assigned-bg)', color: 'var(--bw-status-assigned-text)' }
  const cap = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '—'
  return { label: cap, bg: 'var(--bw-status-default-bg)', color: 'var(--bw-status-default-text)' }
}

export function tenantDriverTypeLabel(driverType: string): 'In-House' | 'Outsourced' {
  return driverType === 'in_house' ? 'In-House' : 'Outsourced'
}

/** "(773) 241-1362" / "+1 (773) 241-1362" for 10/11-digit US numbers; anything else is returned as typed. */
export function formatTenantPhone(phone: string | null | undefined): string {
  const raw = (phone || '').trim()
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
  return raw
}

/** Best-effort `tel:` link for tenant driver cards. */
export function tenantTelHrefFromPhone(phone: string): string | null {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return `tel:+1${digits}`
  return `tel:+${digits}`
}

const usdFormats = [0, 2].map((d) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }))
export function formatUsd(n: number, digits: 0 | 2 = 2): string {
  return usdFormats[digits === 0 ? 0 : 1].format(n)
}
