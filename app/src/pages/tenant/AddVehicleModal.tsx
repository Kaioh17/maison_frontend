import { getVehicleModels, vehicleMakes } from '../../data/vehicleData'
import Button from '@components/Button'
import Modal from '@components/Modal'
import type { VehiclesTabState } from './useVehiclesTabState'

export default function AddVehicleModal({ state, setShowAddVehicleForm }: { state: VehiclesTabState; setShowAddVehicleForm: (open: boolean) => void }) {
  const { addVehicleError, addVehicleSuccess, addingVehicle, handleAddVehicle, handleNewVehicleChange, newVehicle, setAddVehicleError, setAddVehicleSuccess, setNewVehicle, vehicleCategories } = state
  return (
    <Modal
      title="Add New Vehicle"
      onClose={() => {
        if (addingVehicle) return
        setShowAddVehicleForm(false)
        setAddVehicleError(null)
        setAddVehicleSuccess(false)
        setNewVehicle({ make: '', model: '', year: '', license_plate: '', color: '', status: 'available', vehicle_category: '', vehicle_flat_rate: '', seating_capacity: '' })
      }}
    >
            {addVehicleSuccess && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'var(--bw-status-active-bg)',
                border: '1px solid var(--bw-border)',
                borderRadius: '6px',
                color: 'var(--bw-status-active-text)',
                fontSize: '14px',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Vehicle added.
              </div>
            )}

            {addVehicleError && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'var(--bw-status-cancelled-bg)',
                border: '1px solid var(--bw-border)',
                borderRadius: '6px',
                color: 'var(--bw-status-cancelled-text)',
                fontSize: '14px',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                {addVehicleError}
              </div>
            )}

            <form onSubmit={handleAddVehicle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="vehicle-make" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Make *
                    </label>
                    <select id="vehicle-make" name="make" autoComplete="off"
                      value={newVehicle.make}
                      onChange={(e) => handleNewVehicleChange('make', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    >
                      <option value="">Select Make</option>
                      {vehicleMakes.map((make: string) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vehicle-model"
                      className="small-muted"
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '13px',
                        color: 'var(--bw-muted)',
                      }}
                    >
                      Model *
                    </label>
                    <select id="vehicle-model" name="model" autoComplete="off"
                      value={newVehicle.model}
                      onChange={(e) => handleNewVehicleChange('model', e.target.value)}
                      required
                      disabled={!newVehicle.make}
                      style={{
                        width: '100%',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)',
                        opacity: !newVehicle.make ? 0.5 : 1
                      }}
                    >
                      <option value="">
                        {newVehicle.make ? 'Select Model' : 'Select Make First'}
                      </option>
                      {newVehicle.make && getVehicleModels(newVehicle.make).map((model: string) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="vehicle-year" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Year
                    </label>
                    <input id="vehicle-year" name="year" autoComplete="off" inputMode="numeric"
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => handleNewVehicleChange('year', e.target.value)}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      style={{
                        width: 'calc(10ch + 36px)',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-license_plate" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      License Plate
                    </label>
                    <input id="vehicle-license_plate" name="license_plate" autoComplete="off"
                      type="text"
                      value={newVehicle.license_plate}
                      onChange={(e) => handleNewVehicleChange('license_plate', e.target.value)}
                      maxLength={8}
                      style={{
                        width: 'calc(10ch + 36px)',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="vehicle-color" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Color
                    </label>
                    <input id="vehicle-color" name="color" autoComplete="off"
                      type="text"
                      value={newVehicle.color}
                      onChange={(e) => handleNewVehicleChange('color', e.target.value)}
                      style={{
                        width: 'calc(10ch + 36px)',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="vehicle-seating_capacity" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Seating Capacity
                    </label>
                    <input id="vehicle-seating_capacity" name="seating_capacity" autoComplete="off" inputMode="numeric"
                      type="number"
                      className="bw-input"
                      value={newVehicle.seating_capacity}
                      onChange={(e) => handleNewVehicleChange('seating_capacity', e.target.value)}
                      min="1"
                      max="50"
                      placeholder="e.g. 4"
                      style={{
                        width: 'calc(10ch + 36px)',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vehicle-vehicle_category" className="small-muted" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontSize: '13px',
                    color: 'var(--bw-muted)'
                  }}>
                    Vehicle Category *
                  </label>
                  <select id="vehicle-vehicle_category" name="vehicle_category" autoComplete="off"
                    value={newVehicle.vehicle_category}
                    onChange={(e) => handleNewVehicleChange('vehicle_category', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 18px 16px 18px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '14px',
                      border: '1px solid var(--bw-border)',
                      borderRadius: 'var(--radius-field)',
                      backgroundColor: 'var(--bw-bg)',
                      color: 'var(--bw-text)'
                    }}
                  >
                    <option value="">Select Category</option>
                    {vehicleCategories.map((category) => (
                      <option key={category.id} value={category.vehicle_category}>
                        {category.vehicle_category}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  alignItems: 'end'
                }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="vehicle-vehicle_flat_rate" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Flat Rate ($) *
                    </label>
                    <input id="vehicle-vehicle_flat_rate" name="vehicle_flat_rate" autoComplete="off" inputMode="decimal"
                      type="number"
                      step="0.01"
                      value={newVehicle.vehicle_flat_rate}
                      onChange={(e) => handleNewVehicleChange('vehicle_flat_rate', e.target.value)}
                      required
                      min="0"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="vehicle-status" className="small-muted" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Status
                    </label>
                    <select id="vehicle-status" name="status" autoComplete="off"
                      value={newVehicle.status}
                      onChange={(e) => handleNewVehicleChange('status', e.target.value)}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: '16px 18px 16px 18px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontSize: '14px',
                        border: '1px solid var(--bw-border)',
                        borderRadius: 'var(--radius-field)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)'
                      }}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <Button
                    type="submit"
                    disabled={addingVehicle}
                    style={{ flex: 1 }}>
                    {addingVehicle ? 'Adding…' : 'Add Vehicle'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAddVehicleForm(false)
                      setAddVehicleError(null)
                      setAddVehicleSuccess(false)
                      setNewVehicle({
                        make: '',
                        model: '',
                        year: '',
                        license_plate: '',
                        color: '',
                        status: 'available',
                        vehicle_category: '',
                        vehicle_flat_rate: '',
                        seating_capacity: ''
                      })
                    }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
    </Modal>
  )
}
