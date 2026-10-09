import Button from '@components/Button'
import Modal from '@components/Modal'
import { WarningCircle } from '@phosphor-icons/react'
import type { VehicleResponse } from '@api/tenant'
import type { VehiclesTabState } from './useVehiclesTabState'

export default function DeleteVehicleModal({ state, isMobile, vehicles }: { state: VehiclesTabState; isMobile: boolean; vehicles: VehicleResponse[] }) {
  const { confirmDeleteVehicle, deletingVehicleId, isDeleting, setDeletingVehicleId, setShowDeleteConfirm } = state
  return (
    <Modal
      title="Delete Vehicle"
      width={500}
      onClose={() => {
        if (!isDeleting) {
          setShowDeleteConfirm(false)
          setDeletingVehicleId(null)
        }
      }}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth={isMobile}
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteConfirm(false)
                setDeletingVehicleId(null)
              }
            }}
            disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            fullWidth={isMobile}
            onClick={confirmDeleteVehicle}
            disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete Vehicle'}
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
          <WarningCircle size={20} style={{ color: 'var(--bw-error, #C5483D)', flexShrink: 0 }} />
          <div style={{ fontSize: '14px', color: 'var(--bw-text)' }}>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </div>
        </div>
        {vehicles.find(v => v.id === deletingVehicleId) && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            borderRadius: '6px',
            border: '1px solid var(--bw-border)',
            fontSize: '13px'
          }}>
            <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Vehicle Details:</div>
            <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
              {vehicles.find(v => v.id === deletingVehicleId)?.year} {vehicles.find(v => v.id === deletingVehicleId)?.make} {vehicles.find(v => v.id === deletingVehicleId)?.model}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
