import AssignDriverModal from './AssignDriverModal'
import UnassignDriverModal from './UnassignDriverModal'
import DeleteVehicleModal from './DeleteVehicleModal'
import AddVehicleModal from './AddVehicleModal'
import Button from '@components/Button'
import Card from '@components/Card'
import StatusPill from '@components/StatusPill'
import { useState } from 'react'
import type React from 'react'
import VehicleEditModal from '@components/VehicleEditModal'
import { Car, Plus, MagnifyingGlass } from '@phosphor-icons/react'
import { useOutletContext } from 'react-router-dom'
import type { TenantShellCtx } from './TenantShell'
import { useTenantDrivers, useTenantVehicles, EMPTY_LIST } from './useTenantData'
import { useVehiclesTabState } from './useVehiclesTabState'

export default function VehiclesTab() {
  const { isMobile, showAddVehicleForm, setShowAddVehicleForm, load, activeTab, setError } = useOutletContext<TenantShellCtx>()
  const drivers = useTenantDrivers().data ?? EMPTY_LIST
  const vehicles = useTenantVehicles().data ?? EMPTY_LIST
  const state = useVehiclesTabState({ setError, setShowAddVehicleForm })
  const {
    editingVehicleId,
    setEditingVehicleId,
    showVehicleEditModal,
    setShowVehicleEditModal,
    deletingVehicleId,
    showDeleteConfirm,
    unassigningVehicleId,
    setUnassigningVehicleId,
    showUnassignConfirm,
    setShowUnassignConfirm,
    setUnassignError,
    assigningVehicleId,
    setAssigningVehicleId,
    showAssignConfirm,
    setShowAssignConfirm,
    setSelectedDriverId,
    setAssignError,
    handleDeleteVehicle,
  } = state
  const [vehicleSearch, setVehicleSearch] = useState('')
  const vq = vehicleSearch.trim().toLowerCase()
  const shownVehicles = vq
    ? vehicles.filter((v) => `${v.year} ${v.make} ${v.model} ${v.license_plate ?? ''} ${v.driver?.full_name ?? ''}`.toLowerCase().includes(vq))
    : vehicles

  return (
    <>
        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showAddVehicleForm && <AddVehicleModal state={state} setShowAddVehicleForm={setShowAddVehicleForm} />}

            {vehicles.length > 0 && (
              <div className="bw-searchbar">
                <div className="dt-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
                  <MagnifyingGlass size={16} aria-hidden style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bw-muted)', pointerEvents: 'none' }} />
                  <input
                    type="search"
                    className="bw-input"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search by vehicle, plate or driver…"
                    aria-label="Search vehicles"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            )}

            <Card style={{ padding: 0 }}>
              {vehicles.length === 0 ? (
                <div className="bw-empty">
                  <div style={{ color: 'var(--bw-text)', fontWeight: 500, marginBottom: 6 }}>No vehicles yet</div>
                  <div style={{ marginBottom: 14 }}>Add vehicles to your fleet to start accepting bookings.</div>
                  <Button onClick={() => setShowAddVehicleForm(true)}>
                    <Plus size={16} aria-hidden />
                    Add vehicle
                  </Button>
                </div>
              ) : shownVehicles.length === 0 ? (
                <div className="bw-empty">No vehicles match your search.</div>
              ) : (
                <div className="dt-wrap">
                  <table className="dt" style={{ minWidth: 820 }}>
                    <thead>
                      <tr>
                        <th>Vehicle</th><th>Class</th><th>Plate</th><th>Driver</th><th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shownVehicles.map((vehicle) => {
                        const firstImage = vehicle.vehicle_images ? Object.values(vehicle.vehicle_images)[0] : null
                        const category = vehicle.vehicle_category?.vehicle_category || 'N/A'
                        const driverType = vehicle.driver?.driver_type || vehicle.driver_type
                        const edit = () => { setEditingVehicleId(vehicle.id); setShowVehicleEditModal(true) }
                        return (
                          <tr
                            key={vehicle.id}
                            className="is-clickable"
                            onClick={edit}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bw-bg-hover)', display: 'grid', placeItems: 'center' }}>
                                  {firstImage ? (
                                    <img src={firstImage as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <Car size={20} aria-hidden style={{ color: 'var(--bw-disabled)' }} />
                                  )}
                                </div>
                                <div className="strong"><button type="button" className="dt-rowbtn">{vehicle.year} {vehicle.make} {vehicle.model}</button></div>
                              </div>
                            </td>
                            <td data-label="Class">{category}</td>
                            <td data-label="Plate" style={{ whiteSpace: 'nowrap' }}>{vehicle.license_plate || <span className="sub">-</span>}</td>
                            <td data-label="Driver">
                              <div>
                                {vehicle.driver ? (
                                  <>
                                    <div>{vehicle.driver.full_name || 'Assigned'}</div>
                                    {driverType && <div className="sub">{driverType === 'in_house' ? 'In-House' : 'Outsourced'}</div>}
                                  </>
                                ) : (
                                  <span className="sub">Not assigned</span>
                                )}
                              </div>
                            </td>
                            <td data-label="Status">
                              <StatusPill status={vehicle.driver ? 'assigned' : 'active'} label={vehicle.driver ? 'Assigned' : 'Available'} />
                            </td>
                            <td className="dt-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                {vehicle.driver ? (
                                  <Button
                                    variant="secondary"
                                    style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }}
                                    onClick={() => {
                                      setUnassigningVehicleId(vehicle.id)
                                      setShowUnassignConfirm(true)
                                      setUnassignError(null)
                                    }}
                                  >
                                    Unassign
                                  </Button>
                                ) : (
                                  <Button
                                    style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }}
                                    onClick={() => {
                                      setAssigningVehicleId(vehicle.id)
                                      setShowAssignConfirm(true)
                                      setSelectedDriverId('')
                                      setAssignError(null)
                                    }}
                                  >
                                    Assign driver
                                  </Button>
                                )}
                                <Button variant="secondary" style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} onClick={edit}>
                                  Edit
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

      {/* Vehicle Edit Modal */}
      {showVehicleEditModal && editingVehicleId && (
        <VehicleEditModal
          vehicleId={editingVehicleId}
          isOpen={showVehicleEditModal}
          onClose={() => {
            setShowVehicleEditModal(false)
            setEditingVehicleId(null)
          }}
          onVehicleUpdated={() => {
            // Refresh vehicles list after update
            load()
          }}
          onDelete={handleDeleteVehicle}
          onMobileAssignDriver={(id) => {
            setShowVehicleEditModal(false)
            setEditingVehicleId(null)
            setAssigningVehicleId(id)
            setShowAssignConfirm(true)
            setSelectedDriverId('')
            setAssignError(null)
          }}
          />
        )}


      {/* Delete Vehicle Confirmation Modal */}
      {showDeleteConfirm && deletingVehicleId && <DeleteVehicleModal state={state} isMobile={isMobile} vehicles={vehicles} />}


      {/* Unassign Driver Confirmation Modal */}
      {showUnassignConfirm && unassigningVehicleId && <UnassignDriverModal state={state} isMobile={isMobile} vehicles={vehicles} />}


      {/* Assign Driver Confirmation Modal */}
      {showAssignConfirm && assigningVehicleId && <AssignDriverModal state={state} isMobile={isMobile} drivers={drivers} vehicles={vehicles} />}


      {/* Responsive Vehicle Grid Styles */}
      <style>{`
        .bw-vehicle-grid {
          display: grid;
          gap: clamp(16px, 3vw, 24px);
          padding: 0;
        }
        
        /* Very small screens: 1 column */
        @media (max-width: 480px) {
          .bw-vehicle-grid {
            grid-template-columns: 1fr;
            gap: clamp(12px, 2vw, 16px);
          }
        }
        
        /* Small screens: 2 columns */
        @media (min-width: 481px) and (max-width: 767px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: clamp(14px, 2.5vw, 18px);
          }
        }
        
        /* Medium screens: 3 columns */
        @media (min-width: 768px) and (max-width: 1023px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: clamp(18px, 2.5vw, 22px);
          }
        }
        
        /* Large screens: 4 columns */
        @media (min-width: 1024px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
      `}</style>
    </>
  )
}
