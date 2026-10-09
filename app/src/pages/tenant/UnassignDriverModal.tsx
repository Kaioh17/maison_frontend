import Button from '@components/Button'
import Modal from '@components/Modal'
import { WarningCircle } from '@phosphor-icons/react'
import type { VehicleResponse } from '@api/tenant'
import type { VehiclesTabState } from './useVehiclesTabState'

export default function UnassignDriverModal({ state, isMobile, vehicles }: { state: VehiclesTabState; isMobile: boolean; vehicles: VehicleResponse[] }) {
  const { confirmUnassignDriver, isUnassigning, setShowUnassignConfirm, setUnassignError, setUnassigningVehicleId, unassignError, unassigningVehicleId } = state
  return (
    <Modal
      title="Unassign Driver"
      width={500}
      onClose={() => {
        if (!isUnassigning) {
          setShowUnassignConfirm(false)
          setUnassigningVehicleId(null)
          setUnassignError(null)
        }
      }}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth={isMobile}
            onClick={() => {
              if (!isUnassigning) {
                setShowUnassignConfirm(false)
                setUnassigningVehicleId(null)
                setUnassignError(null)
              }
            }}
            disabled={isUnassigning}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            fullWidth={isMobile}
            onClick={() => confirmUnassignDriver(true)}
            disabled={isUnassigning}>
            {isUnassigning ? 'Unassigning…' : 'Unassign Driver'}
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
            Are you sure you want to unassign the driver from this vehicle?
          </div>
        </div>
        {vehicles.find(v => v.id === unassigningVehicleId) && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-border)',
            fontSize: '13px'
          }}>
            <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Vehicle Details:</div>
            <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
              {vehicles.find(v => v.id === unassigningVehicleId)?.year} {vehicles.find(v => v.id === unassigningVehicleId)?.make} {vehicles.find(v => v.id === unassigningVehicleId)?.model}
            </div>
            {vehicles.find(v => v.id === unassigningVehicleId)?.driver && (
              <>
                <div style={{ color: 'var(--bw-muted)', marginTop: '8px', marginBottom: '4px' }}>Assigned Driver:</div>
                <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                  {vehicles.find(v => v.id === unassigningVehicleId)?.driver?.full_name || 'Unknown'}
                </div>
              </>
            )}
          </div>
        )}
        {unassignError && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-error)',
            fontSize: '13px',
            color: 'var(--bw-error)'
          }}>
            {unassignError}
          </div>
        )}
      </div>
    </Modal>
  )
}
