import DriverDetailsModal from './DriverDetailsModal'
import AssignVehicleModal from './AssignVehicleModal'
import AddDriverModal from './AddDriverModal'
import Button from '@components/Button'
import DeleteDriverModal, { type DeleteTarget } from './DeleteDriverModal'
import Card from '@components/Card'
import StatusPill from '@components/StatusPill'
import Tabs from '@components/Tabs'
import { useState } from 'react'
import type React from 'react'
import { Car, Plus, CheckCircle, WarningCircle, MagnifyingGlass, ShieldCheck } from '@phosphor-icons/react'
import { useOutletContext } from 'react-router-dom'
import type { TenantShellCtx } from './TenantShell'
import { useTenantVehicles, EMPTY_LIST } from './useTenantData'
import { useDriversTabState } from './useDriversTabState'
import { overviewDriverInitials, tenantDriverTypeLabel, formatTenantPhone, tenantTelHrefFromPhone } from './shared'

export default function DriversTab() {
  const { isMobile, showAddDriver, setShowAddDriver, activeTab, navigate, setIsMenuOpen, setError } = useOutletContext<TenantShellCtx>()
  const vehicles = useTenantVehicles().data ?? EMPTY_LIST
  const state = useDriversTabState({ navigate, isMobile, setIsMenuOpen, setError, setShowAddDriver })
  const {
    drivers,
    driverListSearch,
    setDriverListSearch,
    driverFilterStatus,
    setDriverFilterStatus,
    driverFilterType,
    setDriverFilterType,
    approvingDriverId,
    approveDriverAction,
    showDriverDetails,
    showAssignVehicleToDriver,
    assignVehicleToDriverId,
    openAssignVehicleToDriver,
    handleDriverClick,
    filteredDriversForList,
    openDriverRideHistory,
  } = state

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)


  return (
    <>
        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {drivers.length > 0 && (
              <div className="bw-searchbar">
                <div className="dt-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
                  <MagnifyingGlass size={16} aria-hidden style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bw-muted)', pointerEvents: 'none' }} />
                  <input
                    type="search"
                    className="bw-input"
                    value={driverListSearch}
                    onChange={(e) => setDriverListSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    aria-label="Search drivers"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
                <select
                  className="bw-input"
                  value={driverFilterType}
                  onChange={(e) => setDriverFilterType(e.target.value as 'all' | 'in_house' | 'outsourced')}
                  aria-label="Filter by driver type"
                  style={{ width: 'auto', maxWidth: 160 }}
                >
                  <option value="all">All types</option>
                  <option value="in_house">In-House</option>
                  <option value="outsourced">Outsourced</option>
                </select>
              </div>
            )}

            <Card style={{ padding: 0 }}>
              <div style={{ padding: '0 18px' }}>
                <Tabs
                  ariaLabel="Driver status"
                  value={driverFilterStatus}
                  onChange={setDriverFilterStatus}
                  tabs={[
                    { id: 'all', label: 'All', count: drivers.length },
                    { id: 'active', label: 'Active', count: drivers.filter((d) => d.is_active).length },
                    { id: 'inactive', label: 'Inactive', count: drivers.filter((d) => !d.is_active).length },
                  ]}
                />
              </div>
              {filteredDriversForList.length === 0 ? (
                <div className="bw-empty">
                  <div style={{ color: 'var(--bw-text)', fontWeight: 500, marginBottom: 6 }}>
                    {drivers.length === 0 ? 'No drivers yet' : 'No matching drivers'}
                  </div>
                  <div style={{ marginBottom: drivers.length === 0 ? 14 : 0 }}>
                    {drivers.length === 0 ? 'Add your first driver to start assigning rides.' : 'Try adjusting search or filters.'}
                  </div>
                  {drivers.length === 0 && (
                    <Button onClick={() => setShowAddDriver(true)}>
                      <Plus size={16} aria-hidden />
                      Add driver
                    </Button>
                  )}
                </div>
              ) : (
                <div className="dt-wrap">
                  <table className="dt" style={{ minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th>Driver</th><th>Phone</th><th>Type</th><th>Status</th><th>Registration</th>
                        <th style={{ textAlign: 'right' }}>Rides</th><th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDriversForList.map((driver) => {
                        const telHref = tenantTelHrefFromPhone(driver.phone_no)
                        const verified = driver.is_registered === 'registered'
                        return (
                          <tr
                            key={driver.id}
                            className="is-clickable"
                            onClick={() => handleDriverClick(driver.id)}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span
                                  aria-hidden
                                  style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--bw-bg-hover-strong)', fontSize: 12, fontWeight: 500 }}
                                >
                                  {overviewDriverInitials(driver)}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <div className="strong"><button type="button" className="dt-rowbtn">{driver.first_name} {driver.last_name}</button></div>
                                  <div className="sub">{driver.email}</div>
                                </div>
                              </div>
                            </td>
                            <td data-label="Phone" style={{ whiteSpace: 'nowrap' }}>
                              {telHref ? (
                                <a href={telHref} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>{formatTenantPhone(driver.phone_no)}</a>
                              ) : formatTenantPhone(driver.phone_no)}
                            </td>
                            <td data-label="Type">{tenantDriverTypeLabel(driver.driver_type)}</td>
                            <td data-label="Status">
                              <StatusPill status={driver.is_active ? 'active' : 'pending'} label={driver.is_active ? 'Active' : 'Inactive'} />
                            </td>
                            <td data-label="Registration">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: verified ? 'var(--bw-status-active-text)' : 'var(--bw-status-pending-text)' }}>
                                {verified ? <ShieldCheck size={16} weight="fill" aria-hidden /> : <WarningCircle size={16} weight="fill" aria-hidden />}
                                {verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td data-label="Rides" className="strong" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{driver.completed_rides}</td>
                            <td className="dt-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                {!driver.is_active && !verified && (
                                  <Button style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} disabled={approvingDriverId === driver.id} onClick={() => approveDriverAction(driver.id)}>
                                    <CheckCircle size={14} aria-hidden />
                                    {approvingDriverId === driver.id ? 'Approving…' : 'Approve'}
                                  </Button>
                                )}
                                {driver.driver_type === 'in_house' && (
                                  <Button variant="secondary" style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} onClick={() => openAssignVehicleToDriver(driver.id)}>
                                    <Car size={14} aria-hidden />
                                    Assign vehicle
                                  </Button>
                                )}
                                <Button variant="secondary" style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} onClick={() => openDriverRideHistory(driver)}>
                                  Ride history
                                </Button>
                              </div>
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
        )}

        {/* Add Driver Modal */}
      {showAddDriver && <AddDriverModal state={state} isMobile={isMobile} setShowAddDriver={setShowAddDriver} />}

      {/* Assign vehicle to in-house driver (from Drivers tab) */}
      {showAssignVehicleToDriver && assignVehicleToDriverId != null && <AssignVehicleModal state={state} isMobile={isMobile} vehicles={vehicles} />}


      {/* Driver Details Modal */}
      {showDriverDetails && <DriverDetailsModal state={state} setDeleteTarget={setDeleteTarget} />}

      {deleteTarget && <DeleteDriverModal driver={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </>
  )
}
