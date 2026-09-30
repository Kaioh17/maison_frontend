import { useMemo, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MagnifyingGlass, MapPin, Car, Clock } from '@phosphor-icons/react'
import type { TenantShellCtx } from './TenantShell'
import { formatUsd, formatTenantPhone, overviewDriverInitials, tenantTelHrefFromPhone } from './shared'
import { getTenantBookings, type TenantRiderEmailOption, type BookingResponse } from '@api/tenant'
import StatusPill from '@components/StatusPill'
import Button from '@components/Button'
import Card from '@components/Card'
import Modal from '@components/Modal'

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
  const { riders } = useOutletContext<TenantShellCtx>()
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {riders.length > 0 && (
        <div className="bw-searchbar">
          <div className="dt-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
            <MagnifyingGlass size={16} aria-hidden style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bw-muted)', pointerEvents: 'none' }} />
            <input
              type="search"
              className="bw-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search riders"
              style={{ paddingLeft: 36 }}
            />
          </div>
          {search.trim() && (
            <span className="bw-panel-meta">{filteredRiders.length} of {riders.length}</span>
          )}
        </div>
      )}

      <Card style={{ padding: 0 }}>
        {filteredRiders.length === 0 ? (
          <div className="bw-empty">
            <div style={{ color: 'var(--bw-text)', fontWeight: 500, marginBottom: 6 }}>
              {riders.length === 0 ? 'No riders yet' : 'No matching riders'}
            </div>
            {riders.length === 0 ? 'Riders will show up here once they sign up.' : 'Try adjusting your search.'}
          </div>
        ) : (
          <div className="dt-wrap">
            <table className="dt" style={{ minWidth: 720 }}>
              <thead>
                <tr><th>Rider</th><th>Phone</th><th>Address</th><th>Joined</th><th style={{ textAlign: 'right' }}>Rides</th></tr>
              </thead>
              <tbody>
                {filteredRiders.map((rider) => {
                  const telHref = tenantTelHrefFromPhone(rider.phone_no ?? '')
                  return (
                    <tr
                      key={rider.id}
                      className="is-clickable"
                      onClick={() => openRiderReceipts(rider)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            aria-hidden
                            style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--bw-bg-hover-strong)', fontSize: 12, fontWeight: 500 }}
                          >
                            {overviewDriverInitials(rider)}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="strong"><button type="button" className="dt-rowbtn">{rider.first_name} {rider.last_name}</button></div>
                            <div className="sub">{rider.email}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Phone" style={{ whiteSpace: 'nowrap' }}>
                        {rider.phone_no ? (
                          telHref ? (
                            <a href={telHref} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>{formatTenantPhone(rider.phone_no)}</a>
                          ) : formatTenantPhone(rider.phone_no)
                        ) : <span className="sub">-</span>}
                      </td>
                      <td data-label="Address" style={{ maxWidth: 280 }} className="sub">{riderAddressLine(rider) || '-'}</td>
                      <td data-label="Joined" style={{ whiteSpace: 'nowrap' }} className="sub">{riderJoinedDate(rider.created_on)}</td>
                      <td data-label="Rides" className="strong" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{rider.total_bookings}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {receiptsRider && (
        <Modal
          title={`${receiptsRider.first_name} ${receiptsRider.last_name}`}
          onClose={closeRiderReceipts}
          footer={<Button variant="secondary" onClick={closeRiderReceipts}>Close</Button>}
        >
          <div className="bw-panel-meta" style={{ marginBottom: 16 }}>{receiptsRider.email}</div>
          {loadingReceipts ? (
            <div className="bw-empty">Loading rides…</div>
          ) : receiptsError ? (
            <div className="bw-empty" style={{ color: 'var(--bw-error)' }}>{receiptsError}</div>
          ) : upcomingBookings.length === 0 && pastBookings.length === 0 ? (
            <div className="bw-empty">No rides yet for this rider.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <RideReceiptSection title="Upcoming rides" bookings={upcomingBookings} />
              <RideReceiptSection title="Past rides" bookings={pastBookings} />
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

function RideReceiptSection({ title, bookings }: { title: string; bookings: BookingResponse[] }) {
  if (bookings.length === 0) return null
  return (
    <div>
      <div className="bw-section-label">
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
              {formatUsd(b.estimated_price ?? 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
