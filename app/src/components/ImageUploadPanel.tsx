import React, { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface ImageUploadPanelProps {
  vehicleId: number
  vehicleMake: string
  vehicleModel: string
  onImageUploaded: () => void
  onBack: () => void
}

export default function ImageUploadPanel({ 
  vehicleId, 
  vehicleMake, 
  vehicleModel, 
  onImageUploaded, 
  onBack 
}: ImageUploadPanelProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image to upload')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const { updateVehicleImage } = await import('@api/vehicles')
      await updateVehicleImage(vehicleId, selectedImage)
      
      setSuccess(true)
      setTimeout(() => {
        onImageUploaded()
      }, 2000)
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      setError(err.response?.data?.detail || 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSkip = () => {
    onImageUploaded()
  }

  if (success) {
    return (
      <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ color: 'var(--bw-success, #1E7F4A)', marginBottom: '16px' }}>
          <CheckCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-success, #1E7F4A)' }}>Image Uploaded Successfully!</h3>
        <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
          Your vehicle image has been uploaded. Redirecting to dashboard...
        </p>
      </div>
    )
  }

  return (
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
            <Upload size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 20 }}>Add Vehicle Image</h3>
            <p className="small-muted" style={{ margin: '4px 0 0 0' }}>
              Upload an image for your {vehicleMake} {vehicleModel}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {error && (
          <div style={{ 
            marginBottom: 24, 
            padding: '12px', 
            backgroundColor: '#fee2e2', 
            border: '1px solid #fecaca', 
            borderRadius: '4px',
            color: '#dc2626',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Image Upload Area */}
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Vehicle Image</h4>
          
          {!imagePreview ? (
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
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.style.borderColor = 'var(--bw-primary)'
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                const file = e.dataTransfer.files[0]
                if (file && file.type.startsWith('image/')) {
                  setSelectedImage(file)
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    setImagePreview(e.target?.result as string)
                  }
                  reader.readAsDataURL(file)
                }
              }}
            >
              <Upload size={48} style={{ color: '#6b7280', marginBottom: '16px' }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 500 }}>
                Click to upload or drag and drop
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                PNG, JPG, JPEG up to 5MB
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={imagePreview} 
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
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'space-between', 
          borderTop: '1px solid var(--bw-border)', 
          paddingTop: '24px' 
        }}>
          <button 
            type="button" 
            className="bw-btn-outline" 
            onClick={onBack}
            disabled={isUploading}
          >
            Back to Vehicle Info
          </button>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              type="button" 
              className="bw-btn-outline" 
              onClick={handleSkip}
              disabled={isUploading}
            >
              Skip for Now
            </button>
            <button 
              type="button" 
              className="bw-btn bw-btn-action" 
              onClick={handleUpload}
              disabled={!selectedImage || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="bw-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
