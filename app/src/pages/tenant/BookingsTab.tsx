import Button from '@components/Button'
import Modal from '@components/Modal'
import Card from '@components/Card'
import BookingDetailsModal from '@components/BookingDetailsModal'
import StatusPill from '@components/StatusPill'
import Tabs from '@components/Tabs'
import type React from 'react'
import { Plus, WarningCircle, X, MagnifyingGlass } from '@phosphor-icons/react'
import { useOutletContext } from 'react-router-dom'
import type { TenantShellCtx } from './TenantShell'
import { useBookingsTabState } from './useBookingsTabState'
import {
  overviewBookingStatusDisplay,
  formatTenantPhone,
  formatUsd,
} from './shared'

export default function BookingsTab() {
  const {
    bookingStatusFilter,
    setBookingStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    vehicleIdFilter,
    setVehicleIdFilter,
    setShowBookRideModal,
    isMobile,
    activeTab,
    location,
    navigate,
    setError,
  } = useOutletContext<TenantShellCtx>()
  const {
    drivers,
    vehicles,
    bookings,
    selectedBooking,
    setSelectedBooking,
    showBookingDetails,
    setShowBookingDetails,
    loadingBookingDetails,
    selectedBookingRating,
    setSelectedBookingRating,
    loadingBookingRating,
    showAssignDriverToBooking,
    setShowAssignDriverToBooking,
    selectedDriverForBooking,
    setSelectedDriverForBooking,
    assigningDriver,
    showOverrideConfirm,
    setShowOverrideConfirm,
    handleBookingClick,
    handleAssignDriverToBooking,
    searchQuery,
    handleSearchChange,
    filteredBookings,
    searchError,
    clearSearch,
    hasActiveSearch,
  } = useBookingsTabState({
    filters: { bookingStatusFilter, serviceTypeFilter, vehicleIdFilter },
    location,
    navigate,
    setError,
  })


  return (
    <>
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (() => {
          const countBy = (st: string) => bookings.filter((b) => b.booking_status === st).length
          const statusTabs = [
            { id: '', label: 'All', count: bookings.length },
            { id: 'pending', label: 'Pending', count: countBy('pending') },
            { id: 'active', label: 'Active', count: countBy('active') },
            { id: 'completed', label: 'Completed', count: countBy('completed') },
            { id: 'cancelled', label: 'Cancelled', count: countBy('cancelled') },
          ]
          const empty = (
            <div className="bw-empty">
              <div style={{ color: 'var(--bw-text)', fontWeight: 500, marginBottom: 6 }}>
                {hasActiveSearch ? `No bookings found matching “${searchQuery}”` : 'No bookings yet'}
              </div>
              {!hasActiveSearch && (
                <>
                  <div style={{ marginBottom: 14 }}>Schedule a ride for a customer, or wait for riders to book through your site.</div>
                  <Button onClick={() => setShowBookRideModal(true)}>
                    <Plus size={16} aria-hidden />
                    Schedule ride
                  </Button>
                </>
              )}
            </div>
          )
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="bw-panel-meta" style={{ margin: 0 }}>
                Schedule rides for customers. They confirm via email, no login required.
                {hasActiveSearch && ` Showing ${filteredBookings.length} of ${bookings.length}.`}
              </p>

              <div className="bw-searchbar">
                <div className="dt-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
                  <MagnifyingGlass size={16} aria-hidden style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bw-muted)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    aria-label="Search bookings"
                    placeholder="Search by customer or driver…"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="bw-input"
                    style={{ paddingLeft: 36, paddingRight: hasActiveSearch ? 36 : 12 }}
                  />
                  {hasActiveSearch && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="tnav-icon-btn"
                      style={{ position: 'absolute', right: 6, top: 6 }}
                    >
                      <X size={16} aria-hidden />
                    </button>
                  )}
                </div>
                <select
                  aria-label="Service type"
                  className="bw-input"
                  style={{ width: 'auto', maxWidth: 160 }}
                  value={serviceTypeFilter}
                  onChange={(e) => { setServiceTypeFilter(e.target.value) }}
                >
                  <option value="">All services</option>
                  <option value="dropoff">Dropoff</option>
                  <option value="hourly">Hourly</option>
                  <option value="airport">Airport</option>
                </select>
                <select
                  aria-label="Vehicle"
                  className="bw-input"
                  style={{ width: 'auto', maxWidth: 220 }}
                  value={vehicleIdFilter || ''}
                  onChange={(e) => {
                    const v = e.target.value ? parseInt(e.target.value) : null
                    setVehicleIdFilter(v)
                  }}
                >
                  <option value="">All vehicles</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} {v.year ? `(${v.year})` : ''} {v.license_plate ? `- ${v.license_plate}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {searchError && (
                <div role="alert" className="bw-field-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <WarningCircle size={16} aria-hidden />
                  {searchError}
                </div>
              )}

              <Card style={{ padding: 0 }}>
                <div style={{ padding: '0 18px' }}>
                  <Tabs
                    ariaLabel="Booking status"
                    value={bookingStatusFilter}
                    onChange={(id) => { setBookingStatusFilter(id) }}
                    tabs={statusTabs}
                  />
                </div>
                {filteredBookings.length === 0 ? (
                  empty
                ) : (
                  <div className="dt-wrap">
                    <table className="dt" style={{ minWidth: 860 }}>
                      <thead>
                        <tr>
                          <th>Booking</th><th>Customer and route</th><th>Service</th><th>Date and time</th>
                          <th>Driver and vehicle</th><th>Status</th><th style={{ textAlign: 'right' }}>Fare</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...filteredBookings].sort((a, b) => +new Date(b.pickup_time) - +new Date(a.pickup_time)).map((booking, idx) => {
                          const st = overviewBookingStatusDisplay(booking.booking_status)
                          const when = new Date(booking.pickup_time)
                          return (
                            <tr
                              key={booking.id || `booking-${idx}`}
                              className="is-clickable"
                              onClick={() => booking.id && handleBookingClick(booking.id)}
                            >
                              <td className="strong" style={{ whiteSpace: 'nowrap' }}><button type="button" className="dt-rowbtn">#{booking.id}</button></td>
                              <td style={{ maxWidth: 280 }}>
                                <div className="strong">{booking.customer_name || 'Anonymous customer'}</div>
                                {booking.customer_phone && <div className="sub">{formatTenantPhone(booking.customer_phone)}</div>}
                                <div className="sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {booking.pickup_location} → {booking.dropoff_location}
                                </div>
                              </td>
                              <td data-label="Service" style={{ textTransform: 'capitalize' }}>
                                <div>
                                  {booking.service_type}
                                  {booking.hours ? <div className="sub">{booking.hours}h</div> : null}
                                </div>
                              </td>
                              <td data-label="When" style={{ whiteSpace: 'nowrap' }}>
                                <div>
                                  <div>{when.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                  <div className="sub">{when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                              </td>
                              <td data-label="Driver">
                                <div>
                                  {booking.driver_name && booking.driver_name !== 'None' ? (
                                    <>
                                      <div>{booking.driver_name}</div>
                                      {booking.driver_phone && <div className="sub">{formatTenantPhone(booking.driver_phone)}</div>}
                                    </>
                                  ) : (
                                    <span className="sub">No driver assigned</span>
                                  )}
                                  <div className="sub">{booking.vehicle || 'No vehicle'}</div>
                                </div>
                              </td>
                              <td data-label="Status"><StatusPill status={booking.booking_status} label={st.label} /></td>
                              <td data-label="Fare" className="strong" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                {formatUsd(Number(booking.estimated_price || 0))}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )
        })()}

      {showBookingDetails && (
        <BookingDetailsModal
          booking={selectedBooking}
          loading={loadingBookingDetails}
          rating={selectedBookingRating}
          loadingRating={loadingBookingRating}
          onClose={() => {
            setShowBookingDetails(false)
            setSelectedBooking(null)
            setSelectedBookingRating(null)
          }}
          onAssignDriver={() => setShowAssignDriverToBooking(true)}
        />
      )}

      {/* Assign Driver to Booking Modal */}
      {showAssignDriverToBooking && selectedBooking && (
        <Modal
          title={showOverrideConfirm ? 'Override Existing Driver?' : 'Assign Driver to Booking'}
          width={500}
          onClose={() => {
            if (!assigningDriver) {
              setShowAssignDriverToBooking(false)
              setSelectedDriverForBooking('')
              setShowOverrideConfirm(false)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onClick={() => {
                  if (!assigningDriver) {
                    setShowAssignDriverToBooking(false)
                    setSelectedDriverForBooking('')
                    setShowOverrideConfirm(false)
                  }
                }}
                disabled={assigningDriver}>
                {showOverrideConfirm ? 'Cancel' : 'Close'}
              </Button>
              {showOverrideConfirm ? (
                <>
                  <Button
                    variant="secondary"
                    fullWidth={isMobile}
                    onClick={() => setShowOverrideConfirm(false)}
                    disabled={assigningDriver}>
                    Back
                  </Button>
                  <Button
                    fullWidth={isMobile}
                    onClick={handleAssignDriverToBooking}
                    disabled={assigningDriver || !selectedDriverForBooking}>
                    {assigningDriver ? 'Assigning…' : 'Yes, Override'}
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth={isMobile}
                  onClick={handleAssignDriverToBooking}
                  disabled={assigningDriver || !selectedDriverForBooking}>
                  {assigningDriver ? 'Assigning…' : 'Assign Driver'}
                </Button>
              )}
            </>
          }
        >
          {showOverrideConfirm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bw-bg-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--bw-border)'
              }}>
                <div style={{ fontSize: '14px', color: 'var(--bw-text)', marginBottom: '8px' }}>
                  This booking already has a driver assigned:
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--bw-text)' }}>
                  {selectedBooking.driver_name}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--bw-muted)' }}>
                Do you want to replace the current driver with a new one?
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="booking-assign-driver" style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--bw-text)',
                  marginBottom: '8px'
                }}>
                  Select Driver
                </label>
                <select id="booking-assign-driver"
                  value={selectedDriverForBooking}
                  onChange={(e) => setSelectedDriverForBooking(e.target.value)}
                  className="bw-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: 'var(--bw-text)',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Choose a driver</option>
                  {drivers
                    .filter(driver => driver.driver_type === 'in_house')
                    .map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </option>
                    ))}
                </select>
              </div>
              {selectedBooking.driver_name && selectedBooking.driver_name !== 'None' && (
                <div style={{
                  padding: '12px',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--bw-border)',
                  fontSize: '13px',
                  color: 'var(--bw-muted)'
                }}>
                  Current driver: <span style={{ fontWeight: 500, color: 'var(--bw-text)' }}>{selectedBooking.driver_name}</span>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

    </>
  )
}
