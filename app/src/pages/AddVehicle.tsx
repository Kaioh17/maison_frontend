import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, ArrowLeft, Plus, XCircle } from 'lucide-react'
import { addVehicle, getVehicleCategories } from '@api/vehicles'
import { useAuthStore } from '@store/auth'
import ImageUploadPanel from '@components/ImageUploadPanel'
import { vehicleMakes, getVehicleModels } from '../data/vehicleData'

export default function AddVehicle() {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    color: '',
    status: 'available',
    vehicle_category: '',
    vehicle_flat_rate: '',
    seating_capacity: 4
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [vehicleCategories, setVehicleCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  // New state for two-panel approach
  const [currentPanel, setCurrentPanel] = useState<'vehicle-info' | 'image-upload'>('vehicle-info')
  const [createdVehicle, setCreatedVehicle] = useState<any>(null)
  
  // Get available models based on selected make
  const availableModels = formData.make ? getVehicleModels(formData.make) : []
  
  const navigate = useNavigate()
  const { role } = useAuthStore()

  // Fetch vehicle categories on component mount
  useEffect(() => {
    const loadVehicleCategories = async () => {
      try {
        setLoadingCategories(true)
        const categories = await getVehicleCategories()
        setVehicleCategories(categories || [])
        
        // Set default category if available
        if (categories && categories.length > 0) {
          setFormData(prev => ({
            ...prev,
            vehicle_category: categories[0].vehicle_category,
            vehicle_flat_rate: categories[0].vehicle_flat_rate.toString()
          }))
        }
      } catch (error) {
        console.error('Failed to load vehicle categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadVehicleCategories()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If vehicle category is selected, automatically populate the base rate
    if (name === 'vehicle_category') {
      const selectedCategory = vehicleCategories.find(cat => cat.vehicle_category === value)
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          vehicle_flat_rate: selectedCategory.vehicle_flat_rate.toString()
        }))
        return
      }
    }
    
    // If make is changed, reset model and update available models
    if (name === 'make') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        model: '' // Reset model when make changes
      }))
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.make || !formData.model) {
      setError('Make and Model are required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare the payload according to the backend schema
      const vehiclePayload = {
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        license_plate: formData.license_plate || undefined,
        color: formData.color || undefined,
        status: formData.status,
        vehicle_category: formData.vehicle_category,
        vehicle_flat_rate: parseFloat(formData.vehicle_flat_rate) || 0,
        seating_capacity: parseInt(formData.seating_capacity.toString()) || 4
      }

      const newVehicle = await addVehicle(vehiclePayload)
      setCreatedVehicle(newVehicle)
      setSuccess(true)
      
      // Move to image upload panel after a short delay
      setTimeout(() => {
        setCurrentPanel('image-upload')
        setSuccess(false)
      }, 1500)
      
    } catch (err: any) {
      console.error('Failed to create vehicle:', err)
      setError(err.response?.data?.detail || 'Failed to create vehicle. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentPanel === 'image-upload') {
      setCurrentPanel('vehicle-info')
      setCreatedVehicle(null)
    } else {
      navigate('/tenant')
    }
  }

  const handleImageUploaded = () => {
    // Redirect to dashboard after image is uploaded
    navigate('/tenant')
  }

  // Show image upload panel
  if (currentPanel === 'image-upload' && createdVehicle) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        {/* Header */}
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <button 
              className="bw-btn-outline" 
              onClick={handleBack}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vehicle Info
            </button>
            <h1 style={{ fontSize: 32, margin: '0 0 0 24px' }}>Add Vehicle Image</h1>
          </div>
        </div>

        <ImageUploadPanel
          vehicleId={createdVehicle.id}
          vehicleMake={createdVehicle.make}
          vehicleModel={createdVehicle.model}
          onImageUploaded={handleImageUploaded}
          onBack={handleBack}
        />
      </div>
    )
  }

  if (success) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: 'var(--bw-success, #1E7F4A)', marginBottom: '16px' }}>
            <Car className="w-12 h-12 mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-success, #1E7F4A)' }}>Vehicle Created Successfully!</h3>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
            Your new vehicle has been added to your fleet. Now let's add an image...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bw bw-container" style={{ padding: '24px 0' }}>
      {/* Header */}
      <div className="bw-header" style={{ marginBottom: 32 }}>
        <div className="bw-header-content">
          <button 
            className="bw-btn-outline" 
            onClick={handleBack}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 style={{ fontSize: 32, margin: '0 0 0 24px' }}>Add New Vehicle</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bw-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="bw-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '1px solid var(--bw-border-strong)', 
              display: 'grid', 
              placeItems: 'center', 
              borderRadius: 2 
            }}>
              <Car size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20 }}>Vehicle Information</h3>
              <p className="small-muted" style={{ margin: '4px 0 0 0' }}>
                Add a new vehicle to your fleet
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ 
              marginBottom: 24, 
              padding: '12px', 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fecaca', 
              borderRadius: '4px',
              color: '#dc2626',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Basic Vehicle Information */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Basic Information</h4>
            <div className="bw-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="bw-form-group">
                <label className="bw-form-label">Make *</label>
                <select 
                  className="bw-input" 
                  name="make"
                  value={formData.make} 
                  onChange={handleInputChange} 
                  required
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                >
                  <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Select Make</option>
                  {vehicleMakes.map((make: string) => (
                    <option key={make} value={make} style={{ color: '#000000', backgroundColor: '#ffffff' }}>{make}</option>
                  ))}
                </select>
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">Model *</label>
                <select 
                  className="bw-input" 
                  name="model"
                  value={formData.model} 
                  onChange={handleInputChange} 
                  required
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                  disabled={!formData.make}
                >
                  <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                    {formData.make ? 'Select Model' : 'Select Make First'}
                  </option>
                  {availableModels.map((model: string) => (
                    <option key={model} value={model} style={{ color: '#000000', backgroundColor: '#ffffff' }}>{model}</option>
                  ))}
                </select>
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">Year</label>
                <input 
                  className="bw-input" 
                  type="number" 
                  name="year"
                  min="1900" 
                  max={new Date().getFullYear() + 1}
                  value={formData.year} 
                  onChange={handleInputChange} 
                  placeholder="2024"
                />
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">Color</label>
                <input 
                  className="bw-input" 
                  name="color"
                  value={formData.color} 
                  onChange={handleInputChange} 
                  placeholder="White"
                />
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">License Plate</label>
                <input 
                  className="bw-input" 
                  name="license_plate"
                  value={formData.license_plate} 
                  onChange={handleInputChange} 
                  placeholder="ABC-123"
                />
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">Status</label>
                <select 
                  className="bw-input" 
                  name="status"
                  value={formData.status} 
                  onChange={handleInputChange}
                >
                  <option value="available" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Available</option>
                  <option value="maintenance" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Maintenance</option>
                  <option value="out_of_service" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Out of Service</option>
                </select>
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">Seating Capacity</label>
                <input 
                  className="bw-input" 
                  type="number" 
                  name="seating_capacity"
                  min="1" 
                  max="20"
                  value={formData.seating_capacity} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
          </div>

          {/* Vehicle Category */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Vehicle Category</h4>
            <div className="bw-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="bw-form-group">
                <label className="bw-form-label">Vehicle Category</label>
                <select 
                  className="bw-input" 
                  name="vehicle_category"
                  value={formData.vehicle_category} 
                  onChange={handleInputChange}
                  style={{ color: '#000000', backgroundColor: '#ffffff' }}
                >
                  {loadingCategories ? (
                    <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Loading categories...</option>
                  ) : vehicleCategories.length === 0 ? (
                    <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>No categories available</option>
                  ) : (
                    vehicleCategories.map(category => (
                      <option key={category.id} value={category.vehicle_category} style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                        {category.vehicle_category}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="bw-form-group">
                <label className="bw-form-label">Base Rate ($)</label>
                <input 
                  className="bw-input" 
                  type="number" 
                  name="vehicle_flat_rate"
                  min="0" 
                  step="0.01"
                  value={formData.vehicle_flat_rate} 
                  readOnly
                  style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                  placeholder="Auto-populated"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'flex-end', 
            borderTop: '1px solid var(--bw-border)', 
            paddingTop: '24px' 
          }}>
            <button 
              type="button" 
              className="bw-btn-outline" 
              onClick={handleBack}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bw-btn bw-btn-action" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="bw-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Creating Vehicle...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Next: Add Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 