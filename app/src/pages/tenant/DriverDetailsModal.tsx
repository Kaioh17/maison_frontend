import Button from '@components/Button'
import Modal from '@components/Modal'
import { CheckCircle, Trash } from '@phosphor-icons/react'
import type { DeleteTarget } from './DeleteDriverModal'
import type { DriversTabState } from './useDriversTabState'

export default function DriverDetailsModal({ state, setDeleteTarget }: { state: DriversTabState; setDeleteTarget: (driver: DeleteTarget) => void }) {
  const { approveDriverAction, approveDriverError, approvingDriverId, loadingDriverDetails, selectedDriver, setSelectedDriver, setShowDriverDetails, toggleActiveError, toggleDriverActive, togglingActive } = state
  return (
    <Modal
      title="Driver Details"
      width={600}
      onClose={() => {
        setShowDriverDetails(false)
        setSelectedDriver(null)
      }}
    >
      {loadingDriverDetails ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: 'var(--bw-muted)' }}>Loading driver details…</div>
        </div>
      ) : selectedDriver ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
          {/* Driver ID and Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'clamp(12px, 2vw, 16px)',
            borderBottom: '1px solid var(--bw-border)'
          }}>
            <div>
              <div style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                color: 'var(--bw-muted)',
                marginBottom: '4px'
              }}>
                Driver ID
              </div>
              <div style={{
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                #{selectedDriver.id}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span className={`bw-badge ${selectedDriver.is_active ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                textTransform: 'capitalize'
              }}>
                {selectedDriver.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`bw-badge ${selectedDriver.is_registered === 'registered' ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                fontWeight: 300,
                textTransform: 'capitalize'
              }}>
                {selectedDriver.is_registered === 'registered' ? 'Registered' : 'Pending'}
              </span>
            </div>
          </div>

          {!selectedDriver.is_active && selectedDriver.is_registered !== 'registered' && (
            <div style={{ paddingBottom: 'clamp(12px, 2vw, 16px)', borderBottom: '1px solid var(--bw-border)' }}>
              <Button
                fullWidth
                disabled={approvingDriverId === selectedDriver.id}
                onClick={() => approveDriverAction(selectedDriver.id)}>
                <CheckCircle size={18} aria-hidden />
                {approvingDriverId === selectedDriver.id ? 'Approving…' : 'Approve driver'}
              </Button>
              {approveDriverError && (
                <div role="alert" style={{ marginTop: 8, fontSize: 13, color: 'var(--bw-error)' }}>
                  {approveDriverError}
                </div>
              )}
            </div>
          )}

          {selectedDriver.is_registered === 'registered' && (
            <div style={{ paddingBottom: 'clamp(12px, 2vw, 16px)', borderBottom: '1px solid var(--bw-border)' }}>
              <Button fullWidth variant="secondary" disabled={togglingActive} onClick={toggleDriverActive}>
                {togglingActive ? 'Updating…' : selectedDriver.is_active ? 'Deactivate driver' : 'Reactivate driver'}
              </Button>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--bw-muted)' }}>
                {selectedDriver.is_active
                  ? 'Deactivated drivers cannot be assigned new rides. You can reactivate them at any time.'
                  : 'This driver is deactivated and cannot be assigned new rides.'}
              </div>
              {toggleActiveError && (
                <div role="alert" style={{ marginTop: 8, fontSize: 13, color: 'var(--bw-error)' }}>{toggleActiveError}</div>
              )}
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h4 style={{
              margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
              fontSize: 'clamp(14px, 2vw, 18px)',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Personal Information
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(8px, 1.5vw, 12px)'
            }}>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Full Name
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--bw-text)'
                }}>
                  {selectedDriver.first_name} {selectedDriver.last_name}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Email
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--bw-text)'
                }}>
                  {selectedDriver.email || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Phone Number
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--bw-text)'
                }}>
                  {selectedDriver.phone_no || 'N/A'}
                </div>
              </div>
              {selectedDriver.state && (
                <div>
                  <div style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)',
                    marginBottom: '4px'
                  }}>
                    State
                  </div>
                  <div style={{
                    fontSize: 'clamp(13px, 1.5vw, 15px)',
                    color: 'var(--bw-text)'
                  }}>
                    {selectedDriver.state}
                  </div>
                </div>
              )}
              {selectedDriver.postal_code && (
                <div>
                  <div style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)',
                    marginBottom: '4px'
                  }}>
                    Postal Code
                  </div>
                  <div style={{
                    fontSize: 'clamp(13px, 1.5vw, 15px)',
                    color: 'var(--bw-text)'
                  }}>
                    {selectedDriver.postal_code}
                  </div>
                </div>
              )}
              {selectedDriver.license_number && (
                <div>
                  <div style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)',
                    marginBottom: '4px'
                  }}>
                    License Number
                  </div>
                  <div style={{
                    fontSize: 'clamp(13px, 1.5vw, 15px)',
                    color: 'var(--bw-text)'
                  }}>
                    {selectedDriver.license_number}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver Information */}
          <div>
            <h4 style={{
              margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
              fontSize: 'clamp(14px, 2vw, 18px)',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Driver Information
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(8px, 1.5vw, 12px)'
            }}>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Driver Type
                </div>
                <div>
                  <span className={`bw-badge ${selectedDriver.driver_type === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`} style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    textTransform: 'capitalize'
                  }}>
                    {selectedDriver.driver_type === 'in_house' ? 'In-House' : 'Outsourced'}
                  </span>
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Role
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--bw-text)'
                }}>
                  {selectedDriver.role || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Status
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--bw-text)'
                }}>
                  {selectedDriver.status || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  marginBottom: '4px'
                }}>
                  Completed Rides
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  color: 'var(--bw-text)'
                }}>
                  {selectedDriver.completed_rides || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          {selectedDriver.vehicle && (
            <div>
              <h4 style={{
                margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                fontSize: 'clamp(14px, 2vw, 18px)',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Assigned Vehicle
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'clamp(8px, 1.5vw, 12px)',
                padding: 'clamp(12px, 2vw, 16px)',
                backgroundColor: 'var(--bw-bg-secondary)',
                borderRadius: '6px',
                border: '1px solid var(--bw-border)'
              }}>
                <div>
                  <div style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)',
                    marginBottom: '4px'
                  }}>
                    Make & Model
                  </div>
                  <div style={{
                    fontSize: 'clamp(13px, 1.5vw, 15px)',
                    color: 'var(--bw-text)'
                  }}>
                    {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                  </div>
                </div>
                {selectedDriver.vehicle.year && (
                  <div>
                    <div style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      color: 'var(--bw-muted)',
                      marginBottom: '4px'
                    }}>
                      Year
                    </div>
                    <div style={{
                      fontSize: 'clamp(13px, 1.5vw, 15px)',
                      color: 'var(--bw-text)'
                    }}>
                      {selectedDriver.vehicle.year}
                    </div>
                  </div>
                )}
                {selectedDriver.vehicle.license_plate && (
                  <div>
                    <div style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      color: 'var(--bw-muted)',
                      marginBottom: '4px'
                    }}>
                      License Plate
                    </div>
                    <div style={{
                      fontSize: 'clamp(13px, 1.5vw, 15px)',
                      color: 'var(--bw-text)'
                    }}>
                      {selectedDriver.vehicle.license_plate}
                    </div>
                  </div>
                )}
                {selectedDriver.vehicle.color && (
                  <div>
                    <div style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      color: 'var(--bw-muted)',
                      marginBottom: '4px'
                    }}>
                      Color
                    </div>
                    <div style={{
                      fontSize: 'clamp(13px, 1.5vw, 15px)',
                      color: 'var(--bw-text)'
                    }}>
                      {selectedDriver.vehicle.color}
                    </div>
                  </div>
                )}
                {selectedDriver.vehicle.seating_capacity && (
                  <div>
                    <div style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      color: 'var(--bw-muted)',
                      marginBottom: '4px'
                    }}>
                      Seating Capacity
                    </div>
                    <div style={{
                      fontSize: 'clamp(13px, 1.5vw, 15px)',
                      color: 'var(--bw-text)'
                    }}>
                      {selectedDriver.vehicle.seating_capacity}
                    </div>
                  </div>
                )}
                {selectedDriver.vehicle.status && (
                  <div>
                    <div style={{
                      fontSize: 'clamp(11px, 1.3vw, 13px)',
                      color: 'var(--bw-muted)',
                      marginBottom: '4px'
                    }}>
                      Vehicle Status
                    </div>
                    <div style={{
                      fontSize: 'clamp(13px, 1.5vw, 15px)',
                      color: 'var(--bw-text)'
                    }}>
                      {selectedDriver.vehicle.status}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div style={{
            paddingTop: 'clamp(12px, 2vw, 16px)',
            borderTop: '1px solid var(--bw-border)',
            fontSize: 'clamp(11px, 1.3vw, 13px)',
            color: 'var(--bw-muted)'
          }}>
            <div style={{ marginBottom: '4px' }}>
              Created: {selectedDriver.created_on ? new Date(selectedDriver.created_on).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
            </div>
            {selectedDriver.updated_on && (
              <div>
                Updated: {new Date(selectedDriver.updated_on).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            )}
          </div>

          {/* Danger zone: permanent deletion (two-step, server-validated) */}
          <div style={{ paddingTop: 'clamp(12px, 2vw, 16px)', borderTop: '1px solid var(--bw-border)' }}>
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                setDeleteTarget({ id: selectedDriver.id, first_name: selectedDriver.first_name, last_name: selectedDriver.last_name, email: selectedDriver.email })
                setShowDriverDetails(false)
                setSelectedDriver(null)
              }}>
              <Trash size={18} aria-hidden />
              Delete driver permanently
            </Button>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--bw-muted)' }}>
              Permanent. This cannot be undone.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: 'var(--bw-muted)' }}>No driver details available</div>
        </div>
      )}
    </Modal>
  )
}
