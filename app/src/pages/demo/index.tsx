import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '@components/ThemeToggle'
import {
  Car,
  Users,
  Calendar,
  Gear,
  TrendUp,
  Wallet,
  Clock,
  List,
  MapPin,
  Sparkle,
  CaretLeft,
  CaretRight,
  CaretDown,
  XCircle,
  Copy,
  Check,
} from '@phosphor-icons/react'
import {
  CHART_DAY_LABELS,
  DEMO_BOOKINGS,
  DEMO_DRIVER_URL,
  DEMO_DRIVERS,
  DEMO_KPI,
  DEMO_RIDER_URL,
  DEMO_TENANT,
  REVENUE_SERIES,
  RIDE_VOLUME_SERIES,
  demoDriverDisplayName,
  demoDriverInitials,
  type DemoBookingStatus,
} from './mockData'

const BANNER_HEIGHT = 36

type DemoTab = 'overview' | 'drivers' | 'bookings' | 'vehicles' | 'settings'

function bookingStatusTag(status: DemoBookingStatus): { label: string; bg: string; color: string } {
  if (status === 'active') return { label: 'Active', bg: '#052e16', color: '#4ade80' }
  if (status === 'pending') return { label: 'Pending', bg: '#451a03', color: '#fbbf24' }
  return { label: 'Done', bg: '#27272a', color: '#a1a1aa' }
}

export default function DemoDashboard() {
  const lightMode = false
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 844)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0)
  const [copiedLink, setCopiedLink] = useState<null | 'rider' | 'driver'>(null)
  const [demoLinksOpen, setDemoLinksOpen] = useState(false)
  const [bookingFilter, setBookingFilter] = useState<'' | DemoBookingStatus>('')

  const demoKpisRef = useRef<HTMLDivElement>(null)
  const demoLinksRef = useRef<HTMLDivElement>(null)
  const demoChartsRef = useRef<HTMLDivElement>(null)
  const demoGridRef = useRef<HTMLDivElement>(null)
  const demoAiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 844)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scrollToRef = useCallback((r: React.RefObject<HTMLElement | null>) => {
    r.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setIsMenuOpen(false)
  }, [])

  const handleSidebarNav = useCallback(
    (tab: DemoTab) => {
      if (tab === 'overview') scrollToRef(demoKpisRef)
      else if (tab === 'drivers' || tab === 'bookings') scrollToRef(demoGridRef)
      else if (tab === 'vehicles') scrollToRef(demoChartsRef)
      else if (tab === 'settings') scrollToRef(demoAiRef)
    },
    [scrollToRef]
  )

  const copyUrl = useCallback(async (url: string, key: 'rider' | 'driver') => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(key)
      window.setTimeout(() => setCopiedLink(null), 2000)
    } catch {
      setCopiedLink(null)
    }
  }, [])

  const filteredBookings = useMemo(() => {
    if (!bookingFilter) return DEMO_BOOKINGS
    return DEMO_BOOKINGS.filter((b) => b.status === bookingFilter)
  }, [bookingFilter])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    return `${g}, welcome to Maison`
  }, [])

  const maxRev = Math.max(...REVENUE_SERIES)
  const maxVol = Math.max(...RIDE_VOLUME_SERIES)

  const volPoints = useMemo(() => {
    const n = RIDE_VOLUME_SERIES.length
    const vbW = 320
    const vbH = 100
    const padX = 12
    const padY = 10
    const innerW = vbW - padX * 2
    const innerH = vbH - padY * 2
    return RIDE_VOLUME_SERIES.map((v, i) => {
      const x = padX + (innerW * i) / Math.max(1, n - 1)
      const y = padY + innerH - (maxVol > 0 ? (v / maxVol) * innerH : 0)
      return `${x},${y}`
    }).join(' ')
  }, [maxVol])

  const kpiCarousel = [
    { key: 'rides' as const, value: String(DEMO_KPI.activeRides), label: 'Active Rides', icon: Car, isCurrency: false },
    { key: 'pend' as const, value: String(DEMO_KPI.pending), label: 'Pending', icon: Clock, isCurrency: false },
    {
      key: 'drv' as const,
      value: String(DEMO_KPI.driversOnline),
      label: 'Drivers Online',
      sub: `of ${DEMO_KPI.driversTotal}`,
      icon: Users,
      isCurrency: false,
    },
    {
      key: 'today' as const,
      value: DEMO_KPI.todayRevenue.toLocaleString('en-US'),
      label: "Today's Revenue",
      icon: Wallet,
      isCurrency: true,
    },
    {
      key: 'week' as const,
      value: DEMO_KPI.weekRevenue.toLocaleString('en-US'),
      label: 'This Week',
      icon: TrendUp,
      isCurrency: true,
    },
  ]

  const kpiCount = kpiCarousel.length

  const tabs: Array<{ id: DemoTab; label: string; icon: typeof TrendUp }> = [
    { id: 'overview', label: 'Overview', icon: TrendUp },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'settings', label: 'Settings', icon: Gear },
  ]

  const cardBase: React.CSSProperties = {
    padding: 'clamp(14px, 2.2vw, 20px)',
    border: lightMode ? '1px solid #e5e7eb' : '1px solid #2a2640',
    backgroundColor: lightMode ? '#ffffff' : '#1c1a2e',
    borderRadius: '12px',
    boxShadow: lightMode ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'clamp(260px, 32vw, 340px)',
  }

  const headerPill: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '4px 9px',
    borderRadius: 6,
    fontFamily: '"Work Sans", sans-serif',
    backgroundColor: lightMode ? '#ede9fe' : 'rgba(139, 92, 246, 0.22)',
    color: lightMode ? '#5b21b6' : '#c4b5fd',
    border: lightMode ? '1px solid #ddd6fe' : '1px solid rgba(167, 139, 250, 0.35)',
  }

  const rowDivider: React.CSSProperties = {
    borderBottom: lightMode ? '1px solid rgba(15, 13, 26, 0.07)' : '1px solid rgba(255, 255, 255, 0.07)',
  }

  const kpiCardShell: React.CSSProperties = {
    padding: 'clamp(20px, 3vw, 32px)',
    textAlign: 'center',
    border: lightMode ? '1px solid #e5e7eb' : '1px solid #2a2640',
    backgroundColor: lightMode ? '#ffffff' : '#1c1a2e',
    boxShadow: lightMode ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '12px',
  }

  return (
    <div
      className="bw"
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: '#0f0d1a',
      }}
    >
      {/* Demo banner */}
      <div
        role="note"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: BANNER_HEIGHT,
          zIndex: 1002,
          backgroundColor: '#1e1a30',
          borderBottom: '1px solid #2a2640',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 12,
          paddingRight: 12,
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 400,
            color: '#E0E0E0',
            textAlign: 'center',
            lineHeight: 1.25,
          }}
        >
          You&apos;re viewing a demo of Maison —{' '}
          <Link
            to="/signup"
            style={{ color: '#6c63e8', fontWeight: 500, textDecoration: 'none' }}
          >
            Create your account
          </Link>
        </span>
      </div>

      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: BANNER_HEIGHT,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'opacity 0.3s ease',
          }}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: BANNER_HEIGHT,
          left: isMobile ? (isMenuOpen ? '0' : '-100%') : (isMenuOpen ? '0' : '-20%'),
          width: isMobile ? '100%' : '20%',
          height: `calc(100vh - ${BANNER_HEIGHT}px)`,
          backgroundColor: lightMode ? '#ffffff' : '#0f0d1a',
          borderRight: `1px solid ${lightMode ? '#e2e8f0' : '#2a2640'}`,
          zIndex: 999,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isMenuOpen ? 'var(--bw-shadow)' : 'none',
        }}
      >
        <div
          style={{
            padding: 'clamp(16px, 2vw, 24px)',
            borderBottom: '1px solid #2a2640',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(12px, 2vw, 16px)',
              flex: 1,
              minWidth: 0,
            }}
          >
            <h1
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 'clamp(20px, 3vw, 32px)',
                fontWeight: 600,
                margin: 0,
                color: '#ffffff',
                letterSpacing: '0.5px',
                lineHeight: '1.2',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {DEMO_TENANT.companyName}
            </h1>
          </div>
          <button
            type="button"
            className="bw-menu"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              minWidth: '40px',
              minHeight: '40px',
              flexShrink: 0,
              background: 'none',
              border: 'none',
              color: 'var(--bw-text)',
              cursor: 'pointer',
            }}
          >
            <XCircle size={20} />
          </button>
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--bw-muted)',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 300,
            padding: '8px clamp(16px, 2vw, 24px) 0',
          }}
        >
          Member since {DEMO_TENANT.memberSince}
        </div>

        <nav
          style={{
            flex: 1,
            padding: 'clamp(12px, 1.5vw, 20px) 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = tab.id === 'overview'
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSidebarNav(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 24px)',
                  backgroundColor: isActive ? 'var(--bw-bg-hover)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '2px solid #6c63e8' : '2px solid transparent',
                  color: 'var(--bw-text)',
                  cursor: 'pointer',
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  justifyContent: 'flex-start',
                  boxShadow: isActive ? '0 0 12px rgba(108, 99, 232, 0.22)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <IconComponent size={18} style={{ flexShrink: 0 }} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div
          style={{
            padding: 'clamp(12px, 1.5vw, 20px)',
            borderTop: '1px solid #2a2640',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px' }}>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => {}}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: 'clamp(10px, 1.2vw, 12px) clamp(16px, 2vw, 24px)',
              backgroundColor: '#6c63e8',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              borderRadius: 7,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bw-accent-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6c63e8'
            }}
          >
            Switch to Driver Mode
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, width: '100%', minHeight: '100vh', paddingTop: BANNER_HEIGHT }}>
        <div className="bw-container" style={{ padding: 'clamp(12px, 2vw, 24px) clamp(16px, 3vw, 32px)', maxWidth: '100%' }}>
          <div
            style={{
              marginBottom: 'clamp(16px, 3vw, 32px)',
              paddingBottom: 'clamp(12px, 2vw, 16px)',
              borderBottom: '1px solid #2a2640',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="bw-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                minWidth: '40px',
                minHeight: '40px',
                background: 'none',
                border: 'none',
                color: 'var(--bw-text)',
                cursor: 'pointer',
              }}
            >
              <List size={20} />
            </button>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  margin: 0,
                  fontSize: 'clamp(18px, 2.5vw, 22px)',
                  fontWeight: 500,
                  fontFamily: '"Work Sans", sans-serif',
                  color: 'var(--bw-text)',
                  lineHeight: 1.25,
                }}
              >
                {greeting}
              </div>
              <div
                style={{
                  fontSize: 'clamp(11px, 1.2vw, 12px)',
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                }}
              >
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                {DEMO_TENANT.city ? ` · ${DEMO_TENANT.city}` : ''}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginLeft: 'auto',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
              className="desktop-actions"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #2a2640',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  fontSize: 'clamp(11px, 1.2vw, 12px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 500,
                  color: 'var(--bw-text)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                Live
              </div>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #2a2640',
                  backgroundColor: '#1a1727',
                  fontSize: 'clamp(11px, 1.2vw, 12px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 400,
                  color: 'var(--bw-text)',
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={DEMO_TENANT.companyName}
              >
                {DEMO_TENANT.companyName}
              </div>
            </div>
          </div>

          <div className="bw-tab-content" style={{ fontFamily: '"Work Sans", sans-serif', fontWeight: 300 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 3vw, 24px)' }}>
              {/* KPIs */}
              <div ref={demoKpisRef} style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
                {isMobile ? (
                  <div style={{ position: 'relative' }}>
                    <div className="bw-card" style={{ ...kpiCardShell, minHeight: 'clamp(120px, 20vw, 160px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {(() => {
                        const row = kpiCarousel[currentKpiIndex]
                        const IconComponent = row.icon
                        return (
                          <>
                            <div style={{ position: 'absolute', top: 'clamp(12px, 2vw, 16px)', right: 'clamp(12px, 2vw, 16px)' }}>
                              <IconComponent size="clamp(24px, 3vw, 32px)" style={{ color: '#6b6885' }} />
                            </div>
                            <div
                              style={{
                                fontSize: 'clamp(32px, 6vw, 56px)',
                                fontWeight: 700,
                                color: '#ffffff',
                                lineHeight: 1.1,
                                marginBottom: 'clamp(4px, 1vw, 8px)',
                                fontFamily: '"Work Sans", sans-serif',
                              }}
                            >
                              {row.isCurrency ? '$' : ''}
                              {row.value}
                            </div>
                            {'sub' in row && row.sub ? (
                              <div style={{ fontSize: 14, fontWeight: 500, color: '#7c7a92', marginTop: -6, marginBottom: 8 }}>{row.sub}</div>
                            ) : null}
                            <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: '#6b6885', fontWeight: 300, fontFamily: '"Work Sans", sans-serif' }}>
                              {row.label}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(12px, 2vw, 16px)', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setCurrentKpiIndex((i) => (i - 1 + kpiCount) % kpiCount)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'clamp(8px, 1.5vw, 12px)',
                          backgroundColor: '#1a1727',
                          border: '1px solid #2a2640',
                          borderRadius: 7,
                          color: 'var(--bw-text)',
                          cursor: 'pointer',
                          minWidth: '44px',
                          minHeight: '44px',
                        }}
                      >
                        <CaretLeft size={20} />
                      </button>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                        {kpiCarousel.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentKpiIndex(index)}
                            style={{
                              width: index === currentKpiIndex ? 'clamp(24px, 3vw, 32px)' : 'clamp(8px, 1.2vw, 10px)',
                              height: 'clamp(8px, 1.2vw, 10px)',
                              borderRadius: '50%',
                              border: 'none',
                              backgroundColor: index === currentKpiIndex ? 'var(--bw-text)' : 'var(--bw-muted)',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentKpiIndex((i) => (i + 1) % kpiCount)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'clamp(8px, 1.5vw, 12px)',
                          backgroundColor: '#1a1727',
                          border: '1px solid #2a2640',
                          borderRadius: 7,
                          color: 'var(--bw-text)',
                          cursor: 'pointer',
                          minWidth: '44px',
                          minHeight: '44px',
                        }}
                      >
                        <CaretRight size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 18vw, 200px), 1fr))',
                      gap: 'clamp(12px, 2vw, 20px)',
                    }}
                  >
                    {kpiCarousel.map((row) => {
                      const IconComponent = row.icon
                      return (
                        <div key={row.key} className="bw-card" style={kpiCardShell}>
                          <div style={{ position: 'absolute', top: 'clamp(12px, 2vw, 16px)', right: 'clamp(12px, 2vw, 16px)' }}>
                            <IconComponent size="clamp(24px, 3vw, 32px)" style={{ color: '#6b6885' }} />
                          </div>
                          <div
                            style={{
                              fontSize: row.key === 'today' || row.key === 'week' ? 'clamp(28px, 5vw, 48px)' : 'clamp(32px, 6vw, 56px)',
                              fontWeight: 700,
                              color: '#ffffff',
                              lineHeight: 1.1,
                              marginBottom: 'clamp(4px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                            }}
                          >
                            {row.isCurrency ? '$' : ''}
                            {row.value}
                          </div>
                          {'sub' in row && row.sub ? (
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#7c7a92', marginTop: -4, marginBottom: 6 }}>{row.sub}</div>
                          ) : null}
                          <div style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', color: '#6b6885', fontWeight: 300, fontFamily: '"Work Sans", sans-serif' }}>
                            {row.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Your links */}
              <div ref={demoLinksRef}>
                <div
                  className="bw-card"
                  style={{
                    padding: 'clamp(16px, 2.5vw, 24px)',
                    border: '1px solid #2a2640',
                    backgroundColor: '#1c1a2e',
                    borderRadius: '12px',
                    marginBottom: 'clamp(16px, 3vw, 24px)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDemoLinksOpen((o) => !o)}
                    aria-expanded={demoLinksOpen}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'inherit',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 'clamp(15px, 2vw, 18px)',
                        fontWeight: 500,
                        fontFamily: '"Work Sans", sans-serif',
                        color: '#ffffff',
                      }}
                    >
                      Your links
                    </h3>
                    <CaretDown
                      size={22}
                      style={{
                        flexShrink: 0,
                        color: '#7c7a92',
                        transform: demoLinksOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                      aria-hidden
                    />
                  </button>
                  {demoLinksOpen ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                        gap: 'clamp(12px, 2vw, 16px)',
                        marginTop: 16,
                      }}
                    >
                      {(
                        [
                          { label: 'Rider login', url: DEMO_RIDER_URL, key: 'rider' as const },
                          { label: 'Driver login', url: DEMO_DRIVER_URL, key: 'driver' as const },
                        ] as const
                      ).map((row) => (
                        <div
                          key={row.key}
                          style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'stretch' : 'center',
                            gap: 10,
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: '1px solid #2a2640',
                            backgroundColor: '#1a1727',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#9b97ae', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {row.label}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#E0E0E0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={row.url}
                            >
                              {row.url}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyUrl(row.url, row.key)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 7,
                              border: '1px solid #2a2640',
                              backgroundColor: copiedLink === row.key ? 'rgba(108, 99, 232, 0.2)' : 'transparent',
                              color: '#E0E0E0',
                              cursor: 'pointer',
                              fontFamily: '"Work Sans", sans-serif',
                              fontSize: 12,
                              fontWeight: 500,
                              flexShrink: 0,
                            }}
                          >
                            {copiedLink === row.key ? (
                              <>
                                <Check size={16} color="#4ade80" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={16} />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Charts */}
              <div
                ref={demoChartsRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 13fr) minmax(0, 7fr)',
                  gap: 'clamp(12px, 2vw, 20px)',
                  marginBottom: 'clamp(16px, 3vw, 24px)',
                }}
              >
                <div className="bw-card" style={{ padding: 'clamp(16px, 2.5vw, 24px)', border: '1px solid #2a2640', backgroundColor: '#1c1a2e', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: 'clamp(220px, 28vw, 300px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: '#ffffff' }}>
                      Revenue — last 7 days
                    </h3>
                  </div>
                  <div style={{ flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 180, paddingTop: 8 }}>
                      {REVENUE_SERIES.map((v, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0, height: '100%' }}>
                          <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 0 }}>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: 44,
                                margin: '0 auto',
                                height: `${Math.max(8, (v / maxRev) * 100)}%`,
                                minHeight: 6,
                                borderRadius: 4,
                                backgroundColor: '#6c63e8',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 10, color: '#7c7a92', fontFamily: '"Work Sans", sans-serif' }}>{CHART_DAY_LABELS[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bw-card" style={{ padding: 'clamp(16px, 2.5vw, 24px)', border: '1px solid #2a2640', backgroundColor: '#1c1a2e', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: 'clamp(220px, 28vw, 300px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: '#ffffff' }}>
                      Ride volume
                    </h3>
                  </div>
                  <div style={{ flex: 1, minHeight: 200, position: 'relative' }}>
                    <svg viewBox="0 0 320 108" width="100%" height={108} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }} aria-hidden>
                      <line x1="12" y1="92" x2="308" y2="92" stroke="#2a2640" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      <polyline
                        fill="none"
                        stroke="#6c63e8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        points={volPoints}
                      />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingLeft: 4, paddingRight: 4 }}>
                      {CHART_DAY_LABELS.map((d) => (
                        <span key={d} style={{ fontSize: 10, color: '#7c7a92', fontFamily: '"Work Sans", sans-serif' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Three columns */}
              <div
                ref={demoGridRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                  gap: 'clamp(12px, 2vw, 20px)',
                  marginBottom: 'clamp(16px, 3vw, 24px)',
                }}
              >
                <div className="bw-card" style={cardBase}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 17px)', fontWeight: 600, fontFamily: '"Work Sans", sans-serif', color: '#ffffff' }}>
                      Drivers
                    </h3>
                    <span style={headerPill}>Now</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {DEMO_DRIVERS.map((d, idx) => {
                      const dotColor = d.presence === 'available' ? '#22c55e' : d.presence === 'on_ride' ? '#f59e0b' : '#4b5563'
                      return (
                        <div
                          key={`${d.firstName}-${d.lastInitial}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 0',
                            ...(idx < DEMO_DRIVERS.length - 1 ? rowDivider : {}),
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: '#261e3a',
                              color: '#9b8fb8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: '"Work Sans", sans-serif',
                              flexShrink: 0,
                            }}
                          >
                            {demoDriverInitials(d)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#ffffff', fontFamily: '"Work Sans", sans-serif', lineHeight: 1.25 }}>
                              {demoDriverDisplayName(d)}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 400,
                                color: '#7c7a92',
                                fontFamily: '"Work Sans", sans-serif',
                                marginTop: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={d.vehicleLine}
                            >
                              {d.vehicleLine}
                            </div>
                          </div>
                          <div
                            title={d.presence === 'available' ? 'Available' : d.presence === 'on_ride' ? 'On a ride' : 'Offline'}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: dotColor,
                              flexShrink: 0,
                              boxShadow: d.presence === 'offline' ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : undefined,
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bw-card" style={{ ...cardBase, minHeight: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexShrink: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 17px)', fontWeight: 600, fontFamily: '"Work Sans", sans-serif', color: '#ffffff' }}>
                      Recent bookings
                    </h3>
                    <span style={headerPill}>Today</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {(['', 'active', 'pending', 'completed'] as const).map((f) => (
                      <button
                        key={f || 'all'}
                        type="button"
                        onClick={() => setBookingFilter(f === '' ? '' : f)}
                        style={{
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 999,
                          border: bookingFilter === f ? '1px solid #6c63e8' : '1px solid #2a2640',
                          backgroundColor: bookingFilter === f ? 'rgba(108, 99, 232, 0.18)' : 'transparent',
                          color: '#E0E0E0',
                          cursor: 'pointer',
                          fontFamily: '"Work Sans", sans-serif',
                        }}
                      >
                        {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {filteredBookings.map((booking, idx) => {
                      const tag = bookingStatusTag(booking.status)
                      const routeText = `${booking.pickup} → ${booking.dropoff}`
                      return (
                        <div
                          key={`${booking.customer}-${idx}`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            padding: '10px 0',
                            ...(idx < filteredBookings.length - 1 ? rowDivider : {}),
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <MapPin size={16} weight="duotone" color="#9ca3af" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: '#ffffff', fontFamily: '"Work Sans"' }}>{booking.customer}</div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 400,
                                color: '#7c7a92',
                                fontFamily: '"Work Sans", sans-serif',
                                marginTop: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={routeText}
                            >
                              {routeText}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', fontFamily: '"Work Sans", sans-serif' }}>
                              ${booking.amount}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: 4,
                                backgroundColor: tag.bg,
                                color: tag.color,
                                fontFamily: '"Work Sans", sans-serif',
                              }}
                            >
                              {tag.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div ref={demoAiRef} className="bw-card" style={cardBase}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: '#6d28d9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Sparkle size={16} weight="fill" color="#ffffff" aria-hidden />
                      </div>
                      <h3 style={{ margin: 0, fontSize: 'clamp(15px, 2vw, 17px)', fontWeight: 600, fontFamily: '"Work Sans", sans-serif', color: '#ffffff' }}>
                        Maison AI
                      </h3>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#6b6885', fontFamily: '"Work Sans", sans-serif', letterSpacing: '0.02em', flexShrink: 0 }}>
                      Coming soon
                    </span>
                  </div>
                  <div style={{ opacity: 0.37, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p
                      style={{
                        margin: '0 0 10px 0',
                        padding: '10px 12px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.38)',
                        borderLeft: '3px solid #7c3aed',
                        fontSize: 12,
                        lineHeight: 1.5,
                        fontWeight: 400,
                        color: '#e2e8f0',
                        fontFamily: '"Work Sans", sans-serif',
                      }}
                    >
                      Tuesday mornings are your peak demand window. You have unassigned bookings with limited driver availability.
                    </p>
                    <p
                      style={{
                        margin: '0 0 14px 0',
                        padding: '10px 12px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.38)',
                        borderLeft: '3px solid #7c3aed',
                        fontSize: 12,
                        lineHeight: 1.5,
                        fontWeight: 400,
                        color: '#e2e8f0',
                        fontFamily: '"Work Sans", sans-serif',
                      }}
                    >
                      Revenue is tracking above your daily average. At this pace you may hit your weekly goal ahead of schedule.
                    </p>
                    <span
                      style={{
                        marginTop: 'auto',
                        fontSize: 12,
                        fontWeight: 400,
                        color: '#6b6885',
                        fontFamily: '"Work Sans", sans-serif',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                        cursor: 'not-allowed',
                        userSelect: 'none',
                      }}
                    >
                      Ask Maison AI for a full breakdown
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
