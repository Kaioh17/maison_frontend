import { useMemo, useState } from 'react'
import type React from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowSquareOut, Copy, Lock, Users } from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Button from '@components/Button'
import Card from '@components/Card'
import ComingSoon from '@components/ComingSoon'
import StatTile from '@components/StatTile'
import StatusPill from '@components/StatusPill'
import Tabs from '@components/Tabs'
import { extractSubdomain } from '@utils/subdomain'
import { getTenantAppUrl } from '@config/host'
import type { TenantShellCtx } from './TenantShell'
import {
  bookingPickupToday,
  buildOverviewDriverRows,
  overviewBookingStatusDisplay,
  formatUsd,
} from './shared'
import type { OverviewDriverPresence } from './shared'

const PRESENCE_LABEL: Record<OverviewDriverPresence, { label: string; status: string }> = {
  available: { label: 'Available', status: 'active' },
  on_ride: { label: 'On trip', status: 'assigned' },
  offline: { label: 'Offline', status: 'default' },
}

const money = (n: number) => formatUsd(n, 0)
const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
const hasDriver = (name?: string | null) => !!name && name !== 'None'

type ChartMode = 'revenue' | 'rides'

export default function OverviewTab() {
  const {
    activeTab,
    info,
    drivers,
    riders,
    vehicles,
    bookings,
    analysis,
    analysisLoading,
    analysisError,
    tenantConfig,
    isMobile,
    navigate,
    handleTabClick,
    overviewCopiedLink,
    overviewLinkQrState,
    copyTenantOverviewLink,
    generateTenantOverviewLinkQr,
    downloadTenantOverviewLinkQr,
  } = useOutletContext<TenantShellCtx>()

  const [chartMode, setChartMode] = useState<ChartMode>('revenue')

  const todayBookings = useMemo(
    () =>
      bookings
        .filter(bookingPickupToday)
        .sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime()),
    [bookings]
  )

  const unassigned = useMemo(() => {
    const now = new Date().getTime()
    const closed = new Set(['completed', 'done', 'complete', 'cancelled', 'canceled'])
    return bookings
      .filter(
        (b) =>
          !hasDriver(b.driver_name) &&
          !closed.has(b.booking_status?.toLowerCase() ?? '') &&
          new Date(b.pickup_time).getTime() >= now
      )
      .sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime())
  }, [bookings])

  if (activeTab !== 'overview') return null

  const yStart = new Date()
  yStart.setDate(yStart.getDate() - 1)
  yStart.setHours(0, 0, 0, 0)
  const yEnd = new Date(yStart)
  yEnd.setHours(23, 59, 59, 999)
  const yesterdayRevenue = bookings
    .filter((b) => {
      const t = new Date(b.pickup_time)
      return t >= yStart && t <= yEnd
    })
    .reduce((sum, b) => sum + Number(b.estimated_price ?? 0), 0)

  const todaysRevenue = analysis?.todays_revenue ?? 0
  const totalRevenue = analysis?.total_revenue ?? 0
  const availableDrivers = analysis?.available_drivers ?? drivers.filter((d) => d.is_active).length
  const totalBookings = analysis?.total_bookings ?? bookings.length
  const completed =
    analysis?.completed_rides ??
    bookings.filter((b) => ['completed', 'done', 'complete'].includes(b.booking_status?.toLowerCase() ?? '')).length
  const completionRate = totalBookings > 0 ? Math.round((completed / totalBookings) * 100) : 0
  const activeTrips = todayBookings.filter((b) => b.booking_status?.toLowerCase() === 'active').length
  const delta = todaysRevenue - yesterdayRevenue

  const driverRows = buildOverviewDriverRows(drivers, vehicles, bookings)

  // Chart -------------------------------------------------------------
  const axisTick = { fill: 'var(--bw-muted)', fontSize: 12 }
  const tooltipStyle: React.CSSProperties = {
    background: 'var(--bw-bg-secondary)',
    border: '1px solid var(--bw-border-strong)',
    borderRadius: 8,
    color: 'var(--bw-text)',
    fontSize: 12,
  }
  const series = chartMode === 'revenue' ? analysis?.revenue_last_7_days : analysis?.ride_volume_last_7_days
  const chartTotal =
    chartMode === 'revenue'
      ? (analysis?.revenue_last_7_days ?? []).reduce((s, d) => s + Number(d.revenue ?? 0), 0)
      : (analysis?.ride_volume_last_7_days ?? []).reduce((s, d) => s + Number(d.count ?? 0), 0)

  const chartMessage = (text: React.ReactNode, minHeight = 200) => (
    <div className="bw-empty" style={{ minHeight, display: 'grid', placeItems: 'center' }}>{text}</div>
  )
  const renderChart = () => {
    if (analysisLoading) return chartMessage('Loading…')
    if (analysisError) return chartMessage("Couldn't load analytics")
    if (analysis?.analytics_locked) {
      return chartMessage(
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Lock size={22} aria-hidden />
          <span>Advanced analytics is available on Growth and Fleet</span>
          <Button onClick={() => navigate('/tenant/settings/plans')}>Upgrade plan</Button>
        </div>,
        120
      )
    }
    if (!series || series.length === 0) return chartMessage('No rides yet')
    return (
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={160}>
          {chartMode === 'revenue' ? (
            <BarChart data={analysis?.revenue_last_7_days ?? undefined} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--bw-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatUsd(v, 0)} width={56} />
              <Tooltip
                cursor={{ fill: 'var(--bw-bg-hover)' }}
                contentStyle={tooltipStyle}
                formatter={(v) => [money(Number(v)), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="var(--bw-accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={analysis?.ride_volume_last_7_days ?? undefined} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--bw-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v), 'Rides']} />
              <Line type="monotone" dataKey="count" stroke="var(--bw-accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  // Links -------------------------------------------------------------
  const slug =
    tenantConfig?.branding?.slug?.trim() || info?.profile?.slug?.trim() || extractSubdomain(window.location.hostname) || ''
  const linkRows = slug
    ? ([
        { key: 'landing', label: 'Landing page', url: getTenantAppUrl(slug, '/') },
        { key: 'rider', label: 'Rider login', url: getTenantAppUrl(slug, '/riders/login') },
        { key: 'driver', label: 'Driver login', url: getTenantAppUrl(slug, '/driver/login') },
      ] as const)
    : []

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '10px 18px',
    borderTop: '1px solid var(--bw-border)',
    fontSize: 13,
  }
  const flushCard: React.CSSProperties = { padding: 0 }
  const smallBtn: React.CSSProperties = { minHeight: 32, padding: '6px 10px', fontSize: 12 }
  const cardHead = (title: string, right?: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px' }}>
      <h2 className="bw-panel-title" style={{ flex: 1 }}>{title}</h2>
      {right}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="kpi-grid">
        <StatTile
          label="Today's revenue"
          value={money(todaysRevenue)}
          sub={
            yesterdayRevenue > 0
              ? `${delta >= 0 ? 'Up' : 'Down'} ${money(Math.abs(delta))} vs yesterday`
              : `${money(totalRevenue)} all time`
          }
          onClick={() => handleTabClick('bookings')}
        />
        <StatTile
          label="Bookings today"
          value={todayBookings.length}
          sub={`${activeTrips} on trip`}
          onClick={() => handleTabClick('bookings')}
        />
        <StatTile
          label="Drivers available"
          value={availableDrivers}
          sub={`of ${drivers.length} total`}
          onClick={() => handleTabClick('drivers')}
        />
        <StatTile
          label="Completion rate"
          value={`${completionRate}%`}
          sub={`${completed} of ${totalBookings} rides`}
          onClick={() => handleTabClick('bookings')}
        />
        <StatTile label="Riders" value={riders.length} onClick={() => handleTabClick('riders')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <Card style={flushCard}>
            {cardHead(
              "Today's schedule",
              <>
                <span className="bw-panel-meta">{todayBookings.length} {todayBookings.length === 1 ? 'ride' : 'rides'}</span>
                <Button variant="secondary" style={smallBtn} onClick={() => handleTabClick('bookings')}>All bookings</Button>
              </>
            )}
            {todayBookings.length === 0 ? (
              <div className="bw-empty" style={{ borderTop: '1px solid var(--bw-border)' }}>No rides scheduled for today.</div>
            ) : (
              <div className="dt-wrap" style={{ borderTop: '1px solid var(--bw-border)' }}>
                <table className="dt" style={{ minWidth: 520 }}>
                  <thead>
                    <tr><th>Pickup</th><th>Rider and route</th><th>Driver</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {todayBookings.map((b, i) => {
                      const st = overviewBookingStatusDisplay(b.booking_status)
                      return (
                        <tr
                          key={b.id ?? `${i}-${b.pickup_time}`}
                          className="is-clickable"
                          onClick={() => handleTabClick('bookings')}
                        >
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div className="strong"><button type="button" className="dt-rowbtn">{timeOf(b.pickup_time)}</button></div>
                            {b.id != null && <div className="sub">#{b.id}</div>}
                          </td>
                          <td style={{ maxWidth: 260 }}>
                            <div className="strong">{b.customer_name}</div>
                            <div className="sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {b.pickup_location} → {b.dropoff_location}
                            </div>
                          </td>
                          <td>
                            {hasDriver(b.driver_name) ? (
                              <>
                                <div>{b.driver_name}</div>
                                <div className="sub">{b.vehicle}</div>
                              </>
                            ) : (
                              <span className="sub">Unassigned</span>
                            )}
                          </td>
                          <td><StatusPill status={b.booking_status} label={st.label} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card style={flushCard}>
            {cardHead(
              'Last 7 days',
              <span className="bw-panel-meta">
                {chartMode === 'revenue' ? money(chartTotal) : `${chartTotal} rides`}
              </span>
            )}
            <div style={{ padding: '0 18px' }}>
              <Tabs
                ariaLabel="Chart metric"
                value={chartMode}
                onChange={setChartMode}
                tabs={[{ id: 'revenue', label: 'Revenue' }, { id: 'rides', label: 'Rides' }]}
              />
            </div>
            <div style={{ padding: 18 }}>{renderChart()}</div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          <Card style={flushCard}>
            {cardHead('Needs attention', unassigned.length > 0 ? <span className="bw-panel-meta">{unassigned.length} to resolve</span> : undefined)}
            {unassigned.length === 0 ? (
              <div className="bw-empty" style={{ borderTop: '1px solid var(--bw-border)' }}>
                All clear. Every upcoming ride has a driver.
              </div>
            ) : (
              unassigned.slice(0, 5).map((b, i) => (
                <div key={b.id ?? i} style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.customer_name}</div>
                    <div className="bw-panel-meta">
                      {new Date(b.pickup_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · No driver assigned
                    </div>
                  </div>
                  <Button variant="secondary" style={smallBtn} onClick={() => handleTabClick('bookings')}>Assign</Button>
                </div>
              ))
            )}
            <div className="bw-soon" aria-disabled="true" style={rowStyle}>
              <span>Driver license and vehicle registration expiry</span>
              <span className="bw-soon-tag">Not connected</span>
            </div>
          </Card>

          <Card style={flushCard}>
            {cardHead(
              'Drivers',
              <Button variant="secondary" style={smallBtn} onClick={() => handleTabClick('drivers')}>
                <Users size={14} aria-hidden />
                All drivers
              </Button>
            )}
            {driverRows.length === 0 ? (
              <div className="bw-empty" style={{ borderTop: '1px solid var(--bw-border)' }}>No drivers yet.</div>
            ) : (
              driverRows.map((d) => {
                const p = PRESENCE_LABEL[d.presence]
                return (
                  <div key={d.key} style={rowStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        aria-hidden
                        style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center',
                          background: 'var(--bw-bg-hover-strong)', color: 'var(--bw-text)', fontSize: 12, fontWeight: 500,
                        }}
                      >
                        {d.initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500 }}>{d.name}</div>
                        <div className="bw-panel-meta" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.vehicleLine}</div>
                      </div>
                    </div>
                    <StatusPill status={p.status} label={p.label} />
                  </div>
                )
              })
            )}
          </Card>

          <Card style={flushCard}>
            {cardHead('Reviews', <span className="bw-soon-tag">Not connected</span>)}
            <div className="bw-soon" aria-disabled="true" style={{ padding: '0 18px 18px' }}>
              <div style={{ fontSize: 26, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>- / 5</div>
              <p className="bw-panel-meta" style={{ margin: '6px 0 0' }}>
                Average rider rating. Individual ratings already appear on each booking.
              </p>
            </div>
          </Card>

          <Card style={flushCard}>
            {cardHead('Your links')}
            {linkRows.length === 0 ? (
              <div className="bw-empty" style={{ borderTop: '1px solid var(--bw-border)' }}>
                No tenant slug found. Set it in{' '}
                <Button variant="ghost" style={smallBtn} onClick={() => handleTabClick('settings')}>Settings</Button>.
              </div>
            ) : (
              linkRows.map((row) => {
                const qr = overviewLinkQrState[row.key]
                return (
                  <div key={row.key} style={{ ...rowStyle, flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{row.label}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <a className="btn btn-secondary" href={row.url} target="_blank" rel="noopener noreferrer" style={smallBtn}>
                          <ArrowSquareOut size={14} aria-hidden />
                          Open
                        </a>
                        <Button variant="secondary" style={smallBtn} onClick={() => copyTenantOverviewLink(row.key, row.url)}>
                          <Copy size={14} aria-hidden />
                          {overviewCopiedLink === row.key ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="secondary" style={smallBtn} disabled={qr.loading} onClick={() => generateTenantOverviewLinkQr(row.key, row.url)}>
                          {qr.loading ? 'Generating…' : 'QR code'}
                        </Button>
                      </div>
                    </div>
                    <div className="bw-panel-meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.url}>{row.url}</div>
                    {qr.error && <div className="bw-field-error">{qr.error}</div>}
                    {qr.imageDataUrl && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                        <img
                          src={qr.imageDataUrl}
                          alt={`${row.label} QR code`}
                          style={{ width: 168, maxWidth: '100%', height: 'auto', borderRadius: 8, border: '1px solid var(--bw-border)', background: '#fff' }}
                        />
                        <Button variant="secondary" style={smallBtn} onClick={() => downloadTenantOverviewLinkQr(row.key, qr.imageDataUrl!)}>
                          Download QR
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </Card>

          {!isMobile && (
            <ComingSoon label="Maison AI insights">
              <Card>Demand and revenue insights will appear here.</Card>
            </ComingSoon>
          )}
        </div>
      </div>
    </div>
  )
}
