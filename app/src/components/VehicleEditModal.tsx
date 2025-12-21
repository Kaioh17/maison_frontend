import React, { useState, useEffect, useRef } from 'react'
import { X, Edit, Upload, CheckCircle, AlertCircle, Car } from 'lucide-react'
import { getVehicleById, updateVehicleImage } from '@api/vehicles'
import type { VehicleResponse } from '@api/vehicles'

interface VehicleEditModalProps {
  vehicleId: number
  isOpen: boolean
  onClose: () => void
  onVehicleUpdated: () => void
}

export default function VehicleEditModal({ 
  vehicleId, 
  isOpen, 
  onClose, 
  onVehicleUpdated 
}: VehicleEditModalProps) {
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load vehicle data when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      loadVehicleData()
    }
  }, [isOpen, vehicleId])

  const loadVehicleData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const vehicleData = await getVehicleById(vehicleId)
      setVehicle(vehicleData)
    } catch (err: any) {
      console.error('Failed to load vehicle:', err)
      setError('Failed to load vehicle data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB')
        return
      }

      setSelectedImage(file)
      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadImage = async () => {
    if (!selectedImage || !vehicle) return

    setIsUploadingImage(true)
    setError(null)

    try {
      await updateVehicleImage(vehicleId, selectedImage)
      setSuccess(true)
      setSelectedImage(null)
      setImagePreview(null)
      
      // Refresh vehicle data to show new image
      await loadVehicleData()
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      setError(err.response?.data?.detail || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleClose = () => {
    if (isLoading || isSaving || isUploadingImage) return
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="bw-card" style={{
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div className="bw-card-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--bw-border)',
          paddingBottom: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '1px solid var(--bw-border-strong)', 
              display: 'grid', 
              placeItems: 'center', 
              borderRadius: 2 
            }}>
              <Edit size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20 }}>Edit Vehicle</h3>
              <p className="small-muted" style={{ margin: '4px 0 0 0' }}>
                Update vehicle information and image
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="bw-btn-icon"
            disabled={isLoading || isSaving || isUploadingImage}
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="bw-loading-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px' }}></div>
            <p>Loading vehicle data...</p>
          </div>
        ) : error ? (
          <div style={{ 
            padding: '24px', 
            textAlign: 'center',
            color: '#dc2626'
          }}>
            <AlertCircle size={48} style={{ marginBottom: '16px' }} />
            <p>{error}</p>
            <button 
              className="bw-btn-outline" 
              onClick={loadVehicleData}
              style={{ marginTop: '16px' }}
            >
              Try Again
            </button>
          </div>
        ) : vehicle ? (
          <div style={{ padding: '0 24px 24px' }}>
            {success && (
              <div style={{ 
                marginBottom: 24, 
                padding: '12px', 
                backgroundColor: '#dcfce7', 
                border: '1px solid #bbf7d0', 
                borderRadius: '4px',
                color: '#166534',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                Image updated successfully!
              </div>
            )}

            {/* Vehicle Information Display */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Vehicle Information</h4>
              <div className="bw-info-grid" style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: '1fr 1fr'
              }}>
                <div className="bw-info-item">
                  <span className="bw-info-label">Make:</span>
                  <span className="bw-info-value">{vehicle.make}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Model:</span>
                  <span className="bw-info-value">{vehicle.model}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Year:</span>
                  <span className="bw-info-value">{vehicle.year || 'Not specified'}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Color:</span>
                  <span className="bw-info-value">{vehicle.color || 'Not specified'}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">License Plate:</span>
                  <span className="bw-info-value">{vehicle.license_plate || 'Not specified'}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Status:</span>
                  <span className="bw-info-value">{vehicle.status || 'Unknown'}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Category:</span>
                  <span className="bw-info-value">{vehicle.vehicle_config?.vehicle_category || 'Not set'}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Seating Capacity:</span>
                  <span className="bw-info-value">{vehicle.vehicle_config?.seating_capacity || 'Not set'} seats</span>
                </div>
              </div>
            </div>

            {/* Image Management */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Vehicle Image</h4>
              
              {!imagePreview && !selectedImage ? (
                <div 
                  style={{
                    border: '2px dashed var(--bw-border-strong)',
                    borderRadius: '8px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
                  <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500 }}>
                    Click to upload new image
                  </p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                    PNG, JPG, JPEG up to 5MB
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={imagePreview || ''} 
                      alt="Vehicle preview" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--bw-error, #C5483D)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />

              {selectedImage && (
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  justifyContent: 'center', 
                  marginTop: '16px' 
                }}>
                  <button 
                    type="button" 
                    className="bw-btn-outline" 
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="bw-btn bw-btn-action" 
                    onClick={handleUploadImage}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="bw-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload New Image
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
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
                onClick={handleClose}
                disabled={isSaving || isUploadingImage}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
