"""Remove corrupted overview block; insert clean command-center overview."""
from pathlib import Path

path = Path(r"z:/home/kaioh/maison/maison_frontend/app/src/pages/TenantDashboard.tsx")
text = path.read_text(encoding="utf-8")

# Start after bw-tab-content opening — first overview conditional inside it
needle_start = '<div className="bw-tab-content"'
i0 = text.find(needle_start)
if i0 < 0:
    raise SystemExit("bw-tab-content not found")
i1 = text.find(">",    i0) + 1 # skip over the opening tag >
# skip whitespace/newlines to find first overview
sub = text[i1 : i1 + 800]
j = sub.find("{activeTab === 'overview'")
if j < 0:
    raise SystemExit("overview start not found after tab content")
start = i1 + j

end_marker = "{activeTab === 'drivers'"
end = text.find(end_marker, start)
if end < 0:
    raise SystemExit("drivers tab not found")

NEW = r"""{activeTab === 'overview' && (() => {
              const accent = '#6c63e8'
              const borderCol = lightMode ? '#e2e8f0' : '#2a2640'
              const cardSurface = lightMode ? '#ffffff' : '#1a1727'
              const ctxColor = (t: 'positive' | 'neutral' | 'muted') =>
                t === 'positive' ? '#22c55e' : t === 'neutral' ? '#d97706' : 'var(--bw-muted)'

              const normName = (s: string | null | undefined) =>
                (s || '').trim().toLowerCase().replace(/\s+/g, ' ')

              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const todayEnd = new Date(today)
              todayEnd.setHours(23, 59, 59, 999)
              const yesterday = new Date(today)
              yesterday.setDate(yesterday.getDate() - 1)
              const yStart = new Date(yesterday)
              yStart.setHours(0, 0, 0, 0)
              const yEnd = new Date(yesterday)
              yEnd.setHours(23, 59, 59, 999)

              const pendingBookings = analysis?.pending_rides ?? bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
              const totalDrivers = analysis?.total_drivers ?? drivers.length
              const driversOnline = drivers.filter(d => d.is_active).length
              const todaysRevenueApi = analysis?.todays_revenue

              const revenueForPickupInRange = (start: Date, end: Date) =>
                bookings
                  .filter(b => {
                    const st = b.booking_status?.toLowerCase()
                    if (!['completed', 'active'].includes(st)) return false
                    const pu = new Date(b.pickup_time)
                    return !Number.isNaN(pu.getTime()) && pu >= start && pu <= end
                  })
                  .reduce((s, b) => s + (Number(b.estimated_price) || 0), 0)

              const todaysRevenueCalc = revenueForPickupInRange(today, todayEnd)
              const todaysRevenue = todaysRevenueApi != null ? todaysRevenueApi : todaysRevenueCalc

              const weekEnd = new Date()
              const weekStart = new Date(weekEnd)
              weekStart.setDate(weekStart.getDate() - 7)
              weekStart.setHours(0, 0, 0, 0)
              const prevWeekEnd = new Date(weekStart)
              const prevWeekStart = new Date(weekStart)
              prevWeekStart.setDate(prevWeekStart.getDate() - 7)
              const thisWeekRevenue = bookings
                .filter(b => {
                  const st = b.booking_status?.toLowerCase()
                  if (!['completed', 'active'].includes(st)) return false
                  const pu = new Date(b.pickup_time)
                  return !Number.isNaN(pu.getTime()) && pu >= weekStart && pu <= weekEnd
                })
                .reduce((s, b) => s + (Number(b.estimated_price) || 0), 0)
              const prevWeekRevenue = bookings
                .filter(b => {
                  const st = b.booking_status?.toLowerCase()
                  if (!['completed', 'active'].includes(st)) return false
                  const pu = new Date(b.pickup_time)
                  return !Number.isNaN(pu.getTime()) && pu >= prevWeekStart && pu < prevWeekEnd
                })
                .reduce((s, b) => s + (Number(b.estimated_price) || 0), 0)

              const todayBookings = bookings.filter(b => {
                const pickupDate = new Date(b.pickup_time)
                return pickupDate >= today && pickupDate <= todayEnd
              })
              const activeRidesToday = todayBookings.filter(b => b.booking_status?.toLowerCase() === 'active').length
              const yesterdayBookings = bookings.filter(b => {
                const pickupDate = new Date(b.pickup_time)
                return pickupDate >= yStart && pickupDate <= yEnd
              })
              const activeRidesYesterday = yesterdayBookings.filter(b => b.booking_status?.toLowerCase() === 'active').length
              const activeDelta = activeRidesToday - activeRidesYesterday

              const pendingYesterday = yesterdayBookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
              const pendingDelta = pendingBookings - pendingYesterday

              const nowMs = Date.now()
              const pendingPickupTimes = bookings
                .filter(b => b.booking_status?.toLowerCase() === 'pending')
                .map(b => new Date(b.pickup_time).getTime())
                .filter(t => !Number.isNaN(t) && t > nowMs)
              const nextPendingMin = pendingPickupTimes.length
                ? Math.round((Math.min(...pendingPickupTimes) - nowMs) / 60000)
                : null

              const driverFullName = (d: (typeof drivers)[0]) =>
                `${d.first_name || ''} ${d.last_name || ''}`.trim()

              const isDriverOnRide = (d: (typeof drivers)[0]) => {
                const n = normName(driverFullName(d))
                return bookings.some(
                  b =>
                    b.booking_status?.toLowerCase() === 'active' &&
                    normName(b.driver_name) === n
                )
              }

              const vehicleLabelForDriver = (d: (typeof drivers)[0]) => {
                const v = vehicles.find(veh => veh.driver?.id === d.id)
                if (v) return `${v.make} ${v.model}`.trim()
                return 'Unassigned'
              }

              const driverDotClass = (d: (typeof drivers)[0]) => {
                if (!d.is_active) return 'offline' as const
                if (isDriverOnRide(d)) return 'ride' as const
                return 'avail' as const
              }

              const dotColor = (k: 'offline' | 'ride' | 'avail') =>
                k === 'avail' ? '#22c55e' : k === 'ride' ? '#d97706' : '#4b5563'

              const overviewDrivers = [...drivers]
                .sort((a, b) => {
                  const rank = (d: (typeof drivers)[0]) => {
                    const k = driverDotClass(d)
                    if (k === 'ride') return 0
                    if (k === 'avail') return 1
                    return 2
                  }
                  return rank(a) - rank(b) || (a.last_name || '').localeCompare(b.last_name || '')
                })
                .slice(0, 4)

              const onRideCount = drivers.filter(d => d.is_active && isDriverOnRide(d)).length

              const recentFour = [...bookings]
                .sort((a, b) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
                .slice(0, 4)

              const formatMoney = (n: number) =>
                n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

              const yesterdayRevenue = revenueForPickupInRange(yStart, yEnd)
              const revDeltaPct =
                yesterdayRevenue > 0
                  ? Math.round(((todaysRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
                  : null
              const weekDeltaPct =
                prevWeekRevenue > 0
                  ? Math.round(((thisWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100)
                  : null

              const statRowWrap: React.CSSProperties = {
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(5, minmax(132px, 1fr))'
                  : 'repeat(5, minmax(0, 1fr))',
                gap: 'clamp(8px, 1.5vw, 14px)',
                overflowX: isMobile ? 'auto' : undefined,
                paddingBottom: isMobile ? 4 : undefined,
                WebkitOverflowScrolling: 'touch'
              }

              const statCard = (
                label: string,
                valueNode: React.ReactNode,
                context: string,
                ctxTone: 'positive' | 'neutral' | 'muted',
                opts?: { revenueSmall?: boolean; highlight?: boolean }
              ) => (
                <div
                  key={label}
                  style={{
                    backgroundColor: cardSurface,
                    border: `1px solid ${borderCol}`,
                    borderRadius: 8,
                    padding: 'clamp(12px, 1.8vw, 16px)',
                    boxShadow: 'none',
                    minWidth: isMobile ? 132 : undefined,
                    borderLeft: opts?.highlight ? `3px solid ${accent}` : undefined
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase' as const,
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 500,
                      marginBottom: 6
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: opts?.revenueSmall ? 22 : 26,
                      fontWeight: 700,
                      color: lightMode ? '#0f172a' : '#ffffff',
                      fontFamily: '"Work Sans", sans-serif',
                      lineHeight: 1.15,
                      marginBottom: 4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {valueNode}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: ctxColor(ctxTone),
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 400,
                      lineHeight: 1.3
                    }}
                  >
                    {context}
                  </div>
                </div>
              )

              const chartOverlayBg = lightMode ? 'rgba(248, 250, 252, 0.55)' : 'rgba(15, 13, 26, 0.5)'
              const barsH = [40, 52, 48, 58, 50, 55, 44]

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
                  <div style={statRowWrap}>
                    {statCard(
                      'Active Rides',
                      activeRidesToday,
                      activeDelta > 0
                        ? `↑ ${activeDelta} vs yesterday`
                        : activeDelta < 0
                          ? `↓ ${Math.abs(activeDelta)} vs yesterday`
                          : 'Flat vs yesterday',
                      activeDelta > 0 ? 'positive' : activeDelta < 0 ? 'neutral' : 'muted',
                      { highlight: activeRidesToday > 0 }
                    )}
                    {statCard(
                      'Pending',
                      pendingBookings,
                      nextPendingMin != null
                        ? `next in ${nextPendingMin} min`
                        : pendingDelta > 0
                          ? `↑ ${pendingDelta} vs yesterday`
                          : pendingDelta < 0
                            ? `↓ ${Math.abs(pendingDelta)} vs yesterday`
                            : 'Queue steady vs yesterday',
                      nextPendingMin != null
                        ? 'muted'
                        : pendingDelta > 0
                          ? 'neutral'
                          : pendingDelta < 0
                            ? 'positive'
                            : 'muted'
                    )}
                    {statCard(
                      'Drivers Online',
                      `${driversOnline} / ${totalDrivers}`,
                      onRideCount > 0
                        ? `${onRideCount} on rides`
                        : driversOnline > 0
                          ? `${driversOnline - onRideCount} available`
                          : 'No drivers online',
                      onRideCount > 0 ? 'neutral' : driversOnline > 0 ? 'positive' : 'muted'
                    )}
                    {statCard(
                      "Today's Revenue",
                      <>${formatMoney(todaysRevenue)}</>,
                      revDeltaPct != null
                        ? `${revDeltaPct >= 0 ? '↑' : '↓'} ${Math.abs(revDeltaPct)}% vs yesterday`
                        : yesterdayRevenue <= 0
                          ? 'No prior day to compare'
                          : '— vs yesterday',
                      revDeltaPct != null && revDeltaPct > 0
                        ? 'positive'
                        : revDeltaPct != null && revDeltaPct < 0
                          ? 'neutral'
                          : 'muted',
                      { revenueSmall: true }
                    )}
                    {statCard(
                      "This Week's Revenue",
                      <>${formatMoney(thisWeekRevenue)}</>,
                      weekDeltaPct != null
                        ? `${weekDeltaPct >= 0 ? '↑' : '↓'} ${Math.abs(weekDeltaPct)}% vs prior week`
                        : 'First week of data',
                      weekDeltaPct != null && weekDeltaPct > 0
                        ? 'positive'
                        : weekDeltaPct != null && weekDeltaPct < 0
                          ? 'neutral'
                          : 'muted',
                      { revenueSmall: true }
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)',
                      gap: 'clamp(12px, 2vw, 16px)'
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        border: `1px solid ${borderCol}`,
                        borderRadius: 8,
                        backgroundColor: cardSurface,
                        padding: 'clamp(12px, 2vw, 16px)',
                        minHeight: 200,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ opacity: 0.4, filter: 'grayscale(1)', pointerEvents: 'none' as const }}>
                        <div
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase' as const,
                            color: 'var(--bw-muted)',
                            marginBottom: 10
                          }}
                        >
                          Revenue
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 6,
                            height: 130,
                            paddingTop: 8
                          }}
                        >
                          {barsH.map((h, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                minWidth: 0
                              }}
                            >
                              <div
                                style={{
                                  height: `${h}%`,
                                  borderRadius: 3,
                                  background: i === barsH.length - 1 ? accent : borderCol
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: chartOverlayBg,
                          pointerEvents: 'none' as const
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase' as const,
                            color: 'var(--bw-muted)',
                            fontWeight: 500
                          }}
                        >
                          Coming soon
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        border: `1px solid ${borderCol}`,
                        borderRadius: 8,
                        backgroundColor: cardSurface,
                        padding: 'clamp(12px, 2vw, 16px)',
                        minHeight: 200,
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ opacity: 0.4, filter: 'grayscale(1)', pointerEvents: 'none' as const }}>
                        <div
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase' as const,
                            color: 'var(--bw-muted)',
                            marginBottom: 10
                          }}
                        >
                          Ride volume
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130, paddingTop: 8 }}>
                          {[55, 42, 60, 48, 38].map((h, i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                minWidth: 0
                              }}
                            >
                              <div
                                style={{
                                  height: `${h}%`,
                                  borderRadius: 3,
                                  background: i === 2 ? accent : borderCol
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: chartOverlayBg,
                          pointerEvents: 'none' as const
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase' as const,
                            color: 'var(--bw-muted)',
                            fontWeight: 500
                          }}
                        >
                          Coming soon
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                      gap: 'clamp(12px, 2vw, 16px)'
                    }}
                  >
                    <div
                      style={{
                        border: `1px solid ${borderCol}`,
                        borderRadius: 8,
                        backgroundColor: cardSurface,
                        padding: 'clamp(12px, 2vw, 16px)',
                        minHeight: 200
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--bw-text)',
                          marginBottom: 12,
                          fontFamily: '"Work Sans", sans-serif'
                        }}
                      >
                        Live drivers
                      </div>
                      {overviewDrivers.length === 0 ? (
                        <div style={{ color: 'var(--bw-muted)', fontSize: 13 }}>No drivers yet</div>
                      ) : (
                        overviewDrivers.map(d => {
                          const k = driverDotClass(d)
                          return (
                            <div
                              key={d.id}
                              onClick={() => handleDriverClick(d.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 0',
                                borderBottom: `1px solid ${borderCol}`,
                                cursor: 'pointer'
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  backgroundColor: lightMode ? '#f1f5f9' : 'rgba(108, 99, 232, 0.15)',
                                  color: accent,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  flexShrink: 0,
                                  fontFamily: '"Work Sans", sans-serif'
                                }}
                              >
                                {getInitials(driverFullName(d))}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--bw-text)',
                                    fontFamily: '"Work Sans", sans-serif',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {driverFullName(d)}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: 'var(--bw-muted)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {vehicleLabelForDriver(d)}
                                </div>
                              </div>
                              <span
                                title={k === 'avail' ? 'Available' : k === 'ride' ? 'On a ride' : 'Offline'}
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: dotColor(k),
                                  flexShrink: 0
                                }}
                              />
                            </div>
                          )
                        })
                      )}
                    </div>

                    <div
                      style={{
                        border: `1px solid ${borderCol}`,
                        borderRadius: 8,
                        backgroundColor: cardSurface,
                        padding: 'clamp(12px, 2vw, 16px)',
                        minHeight: 200
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 12,
                          gap: 8
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--bw-text)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}
                        >
                          Recent bookings
                        </div>
                        <button
                          type="button"
                          className="bw-btn-outline"
                          onClick={() => handleTabClick('bookings')}
                          style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500
                          }}
                        >
                          View all
                        </button>
                      </div>
                      {recentFour.length === 0 ? (
                        <div style={{ color: 'var(--bw-muted)', fontSize: 13 }}>No bookings yet</div>
                      ) : (
                        recentFour.map((booking, idx) => {
                          const st = booking.booking_status?.toLowerCase() || ''
                          const tagLabel =
                            st === 'completed' ? 'Done' : st === 'pending' ? 'Pending' : st === 'active' ? 'Active' : (booking.booking_status || '—')
                          const tagGreen = st === 'active'
                          const tagAmber = st === 'pending'
                          const routeText = `${booking.pickup_location} → ${booking.dropoff_location}`
                          return (
                            <div
                              key={booking.id || `rb-${idx}`}
                              onClick={() => booking.id && handleBookingClick(booking.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 0',
                                borderBottom: `1px solid ${borderCol}`,
                                cursor: booking.id ? 'pointer' : 'default'
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  border: `1px solid ${borderCol}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  backgroundColor: lightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)'
                                }}
                              >
                                <MapPin size={16} style={{ color: tagGreen ? accent : 'var(--bw-muted)' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--bw-text)',
                                    fontFamily: '"Work Sans", sans-serif',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {booking.customer_name || 'Customer'}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: 'var(--bw-muted)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={routeText}
                                >
                                  {routeText}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-end',
                                  gap: 4,
                                  flexShrink: 0
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: 'var(--bw-text)',
                                    fontFamily: '"Work Sans", sans-serif'
                                  }}
                                >
                                  ${Number(booking.estimated_price ?? 0).toFixed(0)}
                                </div>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: 999,
                                    color: tagGreen ? '#16a34a' : tagAmber ? '#d97706' : 'var(--bw-muted)',
                                    backgroundColor: tagGreen
                                      ? lightMode
                                        ? 'rgba(34, 197, 94, 0.12)'
                                        : 'rgba(34, 197, 94, 0.15)'
                                      : tagAmber
                                        ? lightMode
                                          ? 'rgba(217, 119, 6, 0.12)'
                                          : 'rgba(217, 119, 6, 0.15)'
                                        : lightMode
                                          ? 'rgba(100, 116, 139, 0.12)'
                                          : 'rgba(148, 163, 184, 0.12)'
                                  }}
                                >
                                  {tagLabel}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <div
                      style={{
                        border: `1px solid ${borderCol}`,
                        borderRadius: 8,
                        backgroundColor: cardSurface,
                        padding: 'clamp(12px, 2vw, 16px)',
                        minHeight: 200,
                        borderLeft: `3px solid ${accent}`,
                        position: 'relative' as const
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 8,
                          marginBottom: 10
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--bw-text)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}
                        >
                          Maison AI
                        </div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.06em',
                            color: 'var(--bw-muted)',
                            border: `1px solid ${borderCol}`,
                            borderRadius: 6,
                            padding: '3px 8px',
                            backgroundColor: lightMode ? '#f8fafc' : 'rgba(255,255,255,0.04)'
                          }}
                        >
                          <Lock size={12} />
                          Soon
                        </span>
                      </div>
                      <div style={{ opacity: 0.4, pointerEvents: 'none' as const }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: 'var(--bw-muted)',
                            lineHeight: 1.5,
                            fontFamily: '"Work Sans", sans-serif'
                          }}
                        >
                          Proactive insights about demand, driver utilization, and revenue will appear here once
                          this feature is enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

"""

new_text = text[:start] + NEW + text[end:]
path.write_text(new_text, encoding="utf-8")
print("replaced bytes", end - start, "->", len(NEW))
