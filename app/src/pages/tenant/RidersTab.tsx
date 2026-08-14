import { useMemo, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { User, Phone, MagnifyingGlass, MapPin, XCircle, Car, Clock } from '@phosphor-icons/react'
import type { TenantShellCtx } from './TenantShell'
import { overviewDriverInitials, tenantTelHrefFromPhone } from './shared'
import { getTenantBookings, type TenantRiderEmailOption, type BookingResponse } from '@api/tenant'
import StatusPill from '@components/StatusPill'

function riderAddressLine(r: { address?: string | null; city?: string | null; state?: string | null; postal_code?: string | null }): string {
  return [r.address, r.city, [r.state, r.postal_code].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

function riderJoinedDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function rideDateTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function RidersTab() {
  const { riders, isMobile, driverPalette, ridersTableGridColumns } = useOutletContext<TenantShellCtx>()
  const [search, setSearch] = useState('')

  // Rider ride-receipts modal (past + future rides for one rider)
  const [receiptsRider, setReceiptsRider] = useState<TenantRiderEmailOption | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<BookingResponse[]>([])
  const [pastBookings, setPastBookings] = useState<BookingResponse[]>([])
  const [loadingReceipts, setLoadingReceipts] = useState(false)
  const [receiptsError, setReceiptsError] = useState<string | null>(null)

  const openRiderReceipts = useCallback(async (rider: TenantRiderEmailOption) => {
    setReceiptsRider(rider)
    setLoadingReceipts(true)
    setReceiptsError(null)
    try {
      const res = await getTenantBookings({ rider_id: rider.id, limit: 100 })
      const bookings = res.data ?? []
      // Split at fetch time (not during render) so "now" is a stable snapshot per fetch.
      const now = Date.now()
      const upcoming = bookings.filter((b) => {
        const t = new Date(b.pickup_time).getTime()
        return !Number.isNaN(t) && t >= now
      }).sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime())
      const past = bookings.filter((b) => !upcoming.includes(b))
        .sort((a, b) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
      setUpcomingBookings(upcoming)
      setPastBookings(past)
    } catch {
      setReceiptsError('Failed to load this rider’s rides. Please try again.')
    } finally {
      setLoadingReceipts(false)
    }
  }, [])

  const closeRiderReceipts = () => {
    setReceiptsRider(null)
    setUpcomingBookings([])
    setPastBookings([])
    setReceiptsError(null)
  }

  const filteredRiders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return riders
    return riders.filter(
      (r) =>
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    )
  }, [riders, search])

  return (
    <>
      <div
        className="bw-content-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(12px, 2vw, 18px)',
          gap: 'clamp(12px, 2vw, 16px)',
        }}
      >
        <div style={{ fontFamily: '"Work Sans", sans-serif', fontSize: 13, color: 'var(--bw-muted)' }}>
          {riders.length} rider{riders.length === 1 ? '' : 's'} signed on
        </div>
      </div>

      {riders.length > 0 && (
        <div style={{ marginBottom: 'clamp(12px, 2vw, 18px)', position: 'relative', maxWidth: isMobile ? '100%' : 320 }}>
          <MagnifyingGlass
            size={17}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bw-muted)', pointerEvents: 'none', zIndex: 1 }}
            aria-hidden
          />
          <input
            type="search"
            className="bw-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search riders"
            style={{ width: '100%', padding: '8px 12px 8px 38px', boxSizing: 'border-box', fontFamily: '"Work Sans", sans-serif', fontSize: 13 }}
          />
        </div>
      )}

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
          {riders.length === 0 ? (
            <div className="bw-empty-state" style={{ padding: 'clamp(24px, 4vw, 48px)', textAlign: 'center' }}>
              <div className="bw-empty-icon" style={{ marginBottom: 'clamp(12px, 2vw, 16px)', display: 'flex', justifyContent: 'center' }}>
                <User size={32} style={{ width: 'clamp(32px, 5vw, 48px)', height: 'clamp(32px, 5vw, 48px)', color: 'var(--bw-muted)' }} />
              </div>
              <div className="bw-empty-text" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--bw-text)', marginBottom: 'clamp(8px, 1.5vw, 12px)', fontFamily: '"Work Sans", sans-serif', fontWeight: 500 }}>
                No riders yet
              </div>
              <div className="bw-empty-subtext" style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }}>
                Riders will show up here once they sign up.
              </div>
            </div>
          ) : filteredRiders.length === 0 ? (
            <div className="bw-empty-state" style={{ padding: 'clamp(24px, 4vw, 48px)', textAlign: 'center' }}>
              <div className="bw-empty-text" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--bw-text)', marginBottom: 'clamp(8px, 1.5vw, 12px)', fontFamily: '"Work Sans", sans-serif', fontWeight: 500 }}>
                No matching riders
              </div>
              <div className="bw-empty-subtext" style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }}>
                Try adjusting your search
              </div>
            </div>
          ) : (
            filteredRiders.map((rider) => {
              const telHref = tenantTelHrefFromPhone(rider.phone_no ?? '')
              const address = riderAddressLine(rider)
              return (
                <div
                  key={rider.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openRiderReceipts(rider)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRiderReceipts(rider) } }}
                  style={{ border: driverPalette.line, borderRadius: 'clamp(8px, 1.5vw, 12px)', padding: 'clamp(16px, 3vw, 20px)', backgroundColor: driverPalette.card, cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                    <div
                      style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 15, fontWeight: 700, fontFamily: '"Work Sans", sans-serif', flexShrink: 0 }}
                      aria-hidden
                    >
                      {overviewDriverInitials(rider)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 'clamp(17px, 3vw, 20px)', fontWeight: 600, color: 'var(--bw-text)', fontFamily: '"Work Sans", sans-serif', lineHeight: 1.2 }}>
                        {rider.first_name} {rider.last_name}
                      </span>
                      <span style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }} title={rider.email}>
                        {rider.email}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: driverPalette.statsLabel, fontFamily: '"Work Sans", sans-serif', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {rider.total_bookings} ride{rider.total_bookings === 1 ? '' : 's'}
                    </span>
                  </div>

                  {telHref ? (
                    <a href={telHref} onClick={(e) => e.stopPropagation()} className="tenant-driver-card-menu" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, textDecoration: 'none', color: 'var(--bw-text)', fontFamily: '"Work Sans", sans-serif' }}>
                      <Phone size={18} weight="bold" style={{ flexShrink: 0, color: 'var(--bw-muted)' }} aria-hidden />
                      <span style={{ fontWeight: 600, fontSize: 'clamp(15px, 2vw, 16px)' }}>{rider.phone_no}</span>
                    </a>
                  ) : null}

                  {address ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif', fontSize: 13 }}>
                      <MapPin size={18} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
                      <span>{address}</span>
                    </div>
                  ) : null}

                  <div style={{ fontSize: 12, color: driverPalette.statsLabel, fontFamily: '"Work Sans", sans-serif' }}>
                    Joined {riderJoinedDate(rider.created_on)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div className="bw-table">
          <div className="bw-table-header" role="row" style={{ gridTemplateColumns: ridersTableGridColumns, display: 'grid', gap: 16, padding: '16px 24px', alignItems: 'center' }}>
            <span role="columnheader">Rider</span>
            <span role="columnheader">Phone</span>
            <span role="columnheader">Address</span>
            <span role="columnheader">Joined</span>
            <span role="columnheader" style={{ justifySelf: 'end' }}>Rides</span>
          </div>
          {riders.length === 0 ? (
            <div className="bw-empty-state">
              <div className="bw-empty-icon"><User size={32} /></div>
              <div className="bw-empty-text">No riders yet</div>
              <div className="bw-empty-subtext">Riders will show up here once they sign up.</div>
            </div>
          ) : filteredRiders.length === 0 ? (
            <div className="bw-empty-state">
              <div className="bw-empty-text">No matching riders</div>
              <div className="bw-empty-subtext">Try adjusting your search</div>
            </div>
          ) : (
            filteredRiders.map((rider) => (
              <div
                key={rider.id}
                role="row"
                className="bw-table-row"
                onClick={() => openRiderReceipts(rider)}
                style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: ridersTableGridColumns, gap: 16, padding: '16px 24px', alignItems: 'center' }}
              >
                <span role="gridcell" title={`${rider.first_name} ${rider.last_name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <span aria-hidden style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#7c3aed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 14, fontWeight: 700, flexShrink: 0, fontFamily: '"Work Sans", sans-serif' }}>
                    {overviewDriverInitials(rider)}
                  </span>
                  <span style={{ minWidth: 0, display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
                    <span className="bw-user-name" style={{ display: 'block' }}>{rider.first_name} {rider.last_name}</span>
                    <span className="bw-user-email" style={{ display: 'block' }}>{rider.email}</span>
                  </span>
                </span>
                <span role="gridcell" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                  {rider.phone_no ? (<><Phone size={12} aria-hidden /> {rider.phone_no}</>) : '—'}
                </span>
                <span role="gridcell" style={{ fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                  {riderAddressLine(rider) || '—'}
                </span>
                <span role="gridcell" style={{ fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>
                  {riderJoinedDate(rider.created_on)}
                </span>
                <span role="gridcell" style={{ justifySelf: 'end', fontWeight: 700, fontFamily: '"Work Sans", sans-serif' }}>
                  {rider.total_bookings}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rider ride receipts modal */}
      {receiptsRider && (
        <div className="bw-modal-overlay" onClick={closeRiderReceipts}>
          <div
            className="bw-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, width: '90vw', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div className="bw-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(16px, 2.5vw, 24px)', borderBottom: '1px solid var(--bw-border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 400, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                  {receiptsRider.first_name} {receiptsRider.last_name}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif', marginTop: 2 }}>
                  {receiptsRider.email}
                </div>
              </div>
              <button className="bw-btn-icon" onClick={closeRiderReceipts} style={{ padding: '8px', minWidth: 32, minHeight: 32 }} aria-label="Close ride receipts">
                <XCircle size={20} />
              </button>
            </div>
            <div className="bw-modal-body" style={{ padding: 'clamp(16px, 2.5vw, 24px)', fontFamily: '"Work Sans", sans-serif', fontWeight: 300, display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
              {loadingReceipts ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--bw-muted)' }}>Loading rides…</div>
              ) : receiptsError ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--bw-error)' }}>{receiptsError}</div>
              ) : upcomingBookings.length === 0 && pastBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--bw-muted)' }}>No rides yet for this rider.</div>
              ) : (
                <>
                  <RideReceiptSection title="Upcoming rides" bookings={upcomingBookings} />
                  <RideReceiptSection title="Past rides" bookings={pastBookings} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function RideReceiptSection({ title, bookings }: { title: string; bookings: BookingResponse[] }) {
  if (bookings.length === 0) return null
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--bw-muted)', marginBottom: 10 }}>
        {title} ({bookings.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bookings.map((b, i) => (
          <div key={b.id ?? i} style={{ border: '1px solid var(--bw-border)', borderRadius: 10, padding: 14, backgroundColor: 'var(--bw-bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--bw-text)', fontWeight: 500 }}>
                <Clock size={16} style={{ color: 'var(--bw-muted)' }} aria-hidden />
                {rideDateTime(b.pickup_time)}
              </div>
              <StatusPill status={b.booking_status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--bw-muted)' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
              <span>{b.pickup_location}{b.dropoff_location ? ` → ${b.dropoff_location}` : ''}</span>
            </div>
            {b.driver_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--bw-muted)' }}>
                <Car size={16} style={{ flexShrink: 0 }} aria-hidden />
                <span>{b.driver_name}{b.vehicle ? ` · ${b.vehicle}` : ''}</span>
              </div>
            ) : null}
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--bw-text)' }}>
              ${(b.estimated_price ?? 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
