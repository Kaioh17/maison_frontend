import Button from '@components/Button'
import Modal from '@components/Modal'
import { WarningCircle } from '@phosphor-icons/react'
import type { DriverResponse, VehicleResponse } from '@api/tenant'
import type { VehiclesTabState } from './useVehiclesTabState'

export default function AssignDriverModal({ state, isMobile, drivers, vehicles }: { state: VehiclesTabState; isMobile: boolean; drivers: DriverResponse[]; vehicles: VehicleResponse[] }) {
  const { assignError, assigningVehicleId, confirmAssignDriver, isAssigning, selectedDriverId, setAssignError, setAssigningVehicleId, setSelectedDriverId, setShowAssignConfirm } = state
  return (
    <Modal
      title="Assign Driver"
      width={500}
      onClose={() => {
        if (!isAssigning) {
          setShowAssignConfirm(false)
          setAssigningVehicleId(null)
          setSelectedDriverId('')
          setAssignError(null)
        }
      }}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth={isMobile}
            onClick={() => {
              if (!isAssigning) {
                setShowAssignConfirm(false)
                setAssigningVehicleId(null)
                setSelectedDriverId('')
                setAssignError(null)
              }
            }}
            disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            fullWidth={isMobile}
            onClick={confirmAssignDriver}
            disabled={isAssigning || !selectedDriverId}>
            {isAssigning ? 'Assigning…' : 'Assign Driver'}
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
            Select a driver to assign to this vehicle.
          </div>
        </div>
        {vehicles.find(v => v.id === assigningVehicleId) && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-border)',
            fontSize: '13px'
          }}>
            <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Vehicle Details:</div>
            <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
              {vehicles.find(v => v.id === assigningVehicleId)?.year} {vehicles.find(v => v.id === assigningVehicleId)?.make} {vehicles.find(v => v.id === assigningVehicleId)?.model}
            </div>
          </div>
        )}
        <div className="bw-form-group">
          <label htmlFor="vehicle-assign-driver">Select Driver</label>
          <select id="vehicle-assign-driver"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bw-input"
            disabled={isAssigning}
            style={{ color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)' }}
          >
            <option value="">Choose a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.first_name} {driver.last_name} - {driver.email}
              </option>
            ))}
          </select>
        </div>
        {assignError && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-error)',
            fontSize: '13px',
            color: 'var(--bw-error)'
          }}>
            {assignError}
          </div>
        )}
      </div>
    </Modal>
  )
}
