import Button from '@components/Button'
import Modal from '@components/Modal'
import { WarningCircle } from '@phosphor-icons/react'
import type { VehicleResponse } from '@api/tenant'
import type { DriversTabState } from './useDriversTabState'

export default function AssignVehicleModal({ state, isMobile, vehicles }: { state: DriversTabState; isMobile: boolean; vehicles: VehicleResponse[] }) {
  const { assignVehicleToDriverError, assignVehicleToDriverId, confirmAssignVehicleToDriver, drivers, isAssigning, selectedVehicleIdForDriverAssign, setAssignVehicleToDriverError, setAssignVehicleToDriverId, setSelectedVehicleIdForDriverAssign, setShowAssignVehicleToDriver } = state
  return (
    <Modal
      title="Assign vehicle"
      width={500}
      onClose={() => {
        if (!isAssigning) {
          setShowAssignVehicleToDriver(false)
          setAssignVehicleToDriverId(null)
          setSelectedVehicleIdForDriverAssign('')
          setAssignVehicleToDriverError(null)
        }
      }}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth={isMobile}
            onClick={() => {
              if (!isAssigning) {
                setShowAssignVehicleToDriver(false)
                setAssignVehicleToDriverId(null)
                setSelectedVehicleIdForDriverAssign('')
                setAssignVehicleToDriverError(null)
              }
            }}
            disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            fullWidth={isMobile}
            onClick={confirmAssignVehicleToDriver}
            disabled={isAssigning || !selectedVehicleIdForDriverAssign}>
            {isAssigning ? 'Assigning…' : 'Assign vehicle'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: 'var(--bw-bg-secondary)',
          borderRadius: '6px',
          border: '1px solid var(--bw-border)'
        }}>
          <WarningCircle size={20} style={{ color: 'var(--bw-warning)', flexShrink: 0 }} />
          <div style={{ fontSize: '14px', color: 'var(--bw-text)' }}>
            Select an available vehicle to assign to this driver.
          </div>
        </div>
        {drivers.find((d) => d.id === assignVehicleToDriverId) && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-border)',
            fontSize: '13px'
          }}>
            <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Driver</div>
            <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
              {drivers.find((d) => d.id === assignVehicleToDriverId)?.first_name}{' '}
              {drivers.find((d) => d.id === assignVehicleToDriverId)?.last_name}
            </div>
          </div>
        )}
        <div className="bw-form-group">
          <label htmlFor="driver-assign-vehicle">Select vehicle</label>
          <select id="driver-assign-vehicle"
            value={selectedVehicleIdForDriverAssign}
            onChange={(e) => setSelectedVehicleIdForDriverAssign(e.target.value)}
            className="bw-input"
            disabled={isAssigning}
                              >
            <option value="">Choose a vehicle</option>
            {vehicles
              .filter((v) => !v.driver)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                  {v.license_plate ? ` — ${v.license_plate}` : ''}
                </option>
              ))}
          </select>
        </div>
        {vehicles.filter((v) => !v.driver).length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--bw-muted)' }}>
            No unassigned vehicles. Unassign a vehicle on the Vehicles tab or add a new vehicle first.
          </div>
        )}
        {assignVehicleToDriverError && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-error)',
            fontSize: '13px',
            color: 'var(--bw-error)'
          }}>
            {assignVehicleToDriverError}
          </div>
        )}
      </div>
    </Modal>
  )
}
