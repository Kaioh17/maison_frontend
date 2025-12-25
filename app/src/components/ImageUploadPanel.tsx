import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { getVehicleImageTypes } from '@api/vehicles'

interface ImageUploadPanelProps {
  vehicleId: number
  vehicleMake: string
  vehicleModel: string
  onImageUploaded: () => void
  onBack: () => void
}

type ImageUploadState = {
  file: File
  preview: string
  type: string
}

export default function ImageUploadPanel({ 
  vehicleId, 
  vehicleMake, 
  vehicleModel, 
  onImageUploaded, 
  onBack 
}: ImageUploadPanelProps) {
  const [uploadedImages, setUploadedImages] = useState<Map<string, ImageUploadState>>(new Map())
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [allowedImageTypes, setAllowedImageTypes] = useState<string[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  useEffect(() => {
    const loadAllowedTypes = async () => {
      try {
        const response = await getVehicleImageTypes()
        if (response.success && response.data?.allowed_image_types) {
          setAllowedImageTypes(response.data.allowed_image_types)
        }
      } catch (err) {
        console.error('Failed to load allowed image types:', err)
      } finally {
        setIsLoadingTypes(false)
      }
    }
    
    loadAllowedTypes()
  }, [])

  const isAllowedFileType = (file: File): boolean => {
    // Validate that it's an image file (any image format is allowed)
    return file.type.startsWith('image/')
  }
  
  const formatImageTypeLabel = (type: string): string => {
    // Convert "front_exterior" to "Front Exterior"
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleImageSelect = (imageType: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!isAllowedFileType(file)) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB')
        return
      }

      setError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        setUploadedImages(prev => {
          const newMap = new Map(prev)
          newMap.set(imageType, { file, preview, type: imageType })
          return newMap
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (imageType: string) => {
    setUploadedImages(prev => {
      const newMap = new Map(prev)
      newMap.delete(imageType)
      return newMap
    })
    const input = fileInputRefs.current.get(imageType)
    if (input) {
      input.value = ''
    }
  }

  const handleImageTypeClick = (imageType: string) => {
    const input = fileInputRefs.current.get(imageType)
    if (input) {
      input.click()
    }
  }

  const handleUpload = async () => {
    if (uploadedImages.size === 0) {
      setError('Please select at least one image to upload')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const { updateVehicleImage } = await import('@api/vehicles')
      const imageFiles: File[] = []
      const imageTypes: string[] = []
      
      uploadedImages.forEach((imageState, type) => {
        imageFiles.push(imageState.file)
        imageTypes.push(type)
      })
      
      const response = await updateVehicleImage(vehicleId, imageFiles, imageTypes)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          onImageUploaded()
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to upload images')
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to upload image. Please try again.')
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
          <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>Vehicle Images</h4>
          
          {isLoadingTypes ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
              Loading image types...
            </div>
          ) : allowedImageTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
              No image types available for this vehicle category.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {allowedImageTypes.map((imageType) => {
                const uploadedImage = uploadedImages.get(imageType)
                return (
                  <div key={imageType} style={{
                    border: '1px solid var(--bw-border)',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ImageIcon size={20} style={{ color: 'var(--bw-text)', opacity: 0.7 }} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--bw-text)' }}>
                          {formatImageTypeLabel(imageType)}
                        </span>
                      </div>
                      {uploadedImage && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--bw-success, #1E7F4A)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle size={14} />
                          Selected
                        </span>
                      )}
                    </div>
                    
                    {uploadedImage ? (
                      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                        <img 
                          src={uploadedImage.preview} 
                          alt={`${imageType} preview`} 
                          style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            border: '1px solid var(--bw-border)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imageType)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'var(--bw-error, #C5483D)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImageTypeClick(imageType)}
                        style={{
                          width: '100%',
                          padding: '16px',
                          border: '2px dashed var(--bw-border-strong)',
                          borderRadius: '8px',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--bw-fg)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                        }}
                      >
                        <Upload size={24} style={{ color: '#6b7280' }} />
                        <span style={{ fontSize: '14px', color: 'var(--bw-text)' }}>
                          Click to upload {formatImageTypeLabel(imageType)} image
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          Max 5MB
                        </span>
                      </button>
                    )}
                    
                    <input
                      ref={(el) => {
                        if (el) {
                          fileInputRefs.current.set(imageType, el)
                        }
                      }}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect(imageType)}
                      style={{ display: 'none' }}
                    />
                  </div>
                )
              })}
            </div>
          )}
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
              disabled={uploadedImages.size === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="bw-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {uploadedImages.size > 0 ? `${uploadedImages.size} ` : ''}Image{uploadedImages.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
