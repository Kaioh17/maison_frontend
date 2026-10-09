import { type OnboardDriver } from '@api/tenant'
import Button from '@components/Button'
import Modal from '@components/Modal'
import type React from 'react'
import type { DriversTabState } from './useDriversTabState'

export default function AddDriverModal({ state, isMobile, setShowAddDriver }: { state: DriversTabState; isMobile: boolean; setShowAddDriver: (open: boolean) => void }) {
  const { addDriverError, createDriver, isCreatingDriver, newDriver, setAddDriverError, setNewDriver } = state
  return (
    <Modal
      title="Add New Driver"
      width={500}
      onClose={() => {
        setShowAddDriver(false)
        setAddDriverError(null)
        setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
      }}
      footer={
        <>
          <Button
            variant="secondary"
            fullWidth={isMobile}
            onClick={() => {
              setShowAddDriver(false)
              setAddDriverError(null)
              setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
            }}>
            Cancel
          </Button>
          <Button
            fullWidth={isMobile}
            onClick={createDriver}
            disabled={isCreatingDriver}>
            {isCreatingDriver ? 'Adding…' : 'Create Driver'}
          </Button>
        </>
      }
    >
      <p className="small-muted" style={{ 
        margin: '0 0 24px 0', 
        fontFamily: 'Work Sans, sans-serif', 
        fontSize: '16px', 
        fontWeight: 300, 
        color: 'var(--bw-muted)' 
      }}>
        Enter the driver's information to send them a registration invitation.
      </p>

      {addDriverError && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          backgroundColor: 'rgba(197, 72, 61, 0.1)',
          border: '1px solid var(--bw-error)',
          borderRadius: '8px',
          color: 'var(--bw-error)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          {addDriverError}
        </div>
      )}

      <div className="bw-form-grid">
        <div className="bw-form-group">
          <label htmlFor="driver-first_name" className="small-muted">
            First Name
          </label>
          <input id="driver-first_name" name="first_name" autoComplete="off" 
            className="bw-input" 
            value={newDriver.first_name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewDriver({ ...newDriver, first_name: e.target.value })
              setAddDriverError(null)
            }}
          />
        </div>
        <div className="bw-form-group">
          <label htmlFor="driver-last_name" className="small-muted">
            Last Name
          </label>
          <input id="driver-last_name" name="last_name" autoComplete="off" 
            className="bw-input" 
            value={newDriver.last_name} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewDriver({ ...newDriver, last_name: e.target.value })
              setAddDriverError(null)
            }}
          />
        </div>
        <div className="bw-form-group">
          <label htmlFor="driver-email" className="small-muted">
            Email
          </label>
          <input id="driver-email" name="email" autoComplete="off" spellCheck={false} 
            className="bw-input" 
            type="email"
            value={newDriver.email} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewDriver({ ...newDriver, email: e.target.value })
              setAddDriverError(null)
            }}
          />
        </div>
        <div className="bw-form-group">
          <label htmlFor="driver-driver_type" className="small-muted">
            Driver Type
          </label>
          <select id="driver-driver_type" name="driver_type" autoComplete="off" 
            className="bw-input" 
            value={newDriver.driver_type} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setNewDriver({ ...newDriver, driver_type: e.target.value as OnboardDriver['driver_type'] })
              setAddDriverError(null)
            }}
          >
            <option value="outsourced">Outsourced</option>
            <option value="in_house">In-House</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}
