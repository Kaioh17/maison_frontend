import React, { useState, useEffect, useRef } from 'react'
import { X, Edit, Upload, CheckCircle, AlertCircle, Car, Image as ImageIcon, Trash, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { getVehicleById, updateVehicleImage, getVehicleImageTypes } from '@api/vehicles'
import type { VehicleResponse } from '@api/vehicles'

interface VehicleEditModalProps {
  vehicleId: number
  isOpen: boolean
  onClose: () => void
  onVehicleUpdated: () => void
  onDelete?: (vehicleId: number) => void
}

type ImageUploadState = {
  file: File
  preview: string
  type: string
}

export default function VehicleEditModal({ 
  vehicleId, 
  isOpen, 
  onClose, 
  onVehicleUpdated,
  onDelete
}: VehicleEditModalProps) {
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Map<string, ImageUploadState>>(new Map())
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Mobile breakpoint state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 844)
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 844)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load vehicle data when modal opens
  useEffect(() => {
    if (isOpen && vehicleId) {
      loadVehicleData()
      setCarouselIndex(0)
      setUploadedImages(new Map())
    }
  }, [isOpen, vehicleId])

  const loadVehicleData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const vehicleResponse = await getVehicleById(vehicleId).catch(() => ({ success: false, data: null }))
      
      if (vehicleResponse.success && vehicleResponse.data) {
        setVehicle(vehicleResponse.data)
      } else {
        setError('Failed to load vehicle data. Please try again.')
      }
    } catch (err: any) {
      console.error('Failed to load vehicle:', err)
      setError('Failed to load vehicle data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    const loadImageTypes = async () => {
      try {
        const response = await getVehicleImageTypes()
        if (response.success && response.data?.allowed_image_types) {
          setAllowedImageTypes(response.data.allowed_image_types)
        }
      } catch (err) {
        console.error('Failed to load image types:', err)
      }
    }
    if (isOpen) {
      loadImageTypes()
    }
  }, [isOpen])

  const [allowedImageTypes, setAllowedImageTypes] = useState<string[]>([])

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

  const handleUploadImage = async () => {
    if (uploadedImages.size === 0 || !vehicle) {
      setError('Please select at least one image to upload')
      return
    }

    setIsUploadingImage(true)
    setError(null)

    try {
      const imageFiles: File[] = []
      const imageTypes: string[] = []
      
      uploadedImages.forEach((imageState, type) => {
        imageFiles.push(imageState.file)
        imageTypes.push(type)
      })
      
      const response = await updateVehicleImage(vehicleId, imageFiles, imageTypes)
      
      if (response.success) {
        setSuccess(true)
        setUploadedImages(new Map())
        
        // Refresh vehicle data to show new image
        await loadVehicleData()
        
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        throw new Error(response.message || 'Failed to upload images')
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to upload image. Please try again.')
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
      padding: isMobile ? 'clamp(12px, 2vw, 16px)' : '20px'
    }}>
      <div className="bw-card" style={{
        maxWidth: isMobile ? '100%' : '900px',
        width: '100%',
        maxHeight: isMobile ? '95vh' : '90vh',
        overflow: 'auto',
        position: 'relative',
        borderRadius: 'clamp(8px, 1.5vw, 12px)'
      }}>
        {/* Edit Vehicle Header at Top */}
        <div className="bw-card-header" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--bw-border)',
          padding: isMobile ? 'clamp(16px, 3vw, 24px)' : '16px 24px',
          gap: isMobile ? 'clamp(12px, 2vw, 16px)' : '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)', flex: 1, width: '100%' }}>
            <div style={{ 
              width: isMobile ? 'clamp(36px, 5vw, 40px)' : 40, 
              height: isMobile ? 'clamp(36px, 5vw, 40px)' : 40, 
              border: '1px solid var(--bw-border-strong)', 
              display: 'grid', 
              placeItems: 'center', 
              borderRadius: 2,
              flexShrink: 0
            }}>
              <Edit size={20} style={{ 
                width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : 20,
                height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : 20,
                fontWeight: 300 
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: isMobile ? 'clamp(24px, 4vw, 32px)' : '40px',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 200,
                lineHeight: 1.2
              }}>Edit Vehicle</h3>
              <p className="small-muted" style={{ 
                margin: 'clamp(4px, 1vw, 8px) 0 0 0',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px',
                fontWeight: 300
              }}>
                Update vehicle information and image
              </p>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'clamp(8px, 1.5vw, 12px)',
            width: isMobile ? '100%' : 'auto'
          }}>
            {onDelete && vehicle && (
              <button 
                type="button" 
                onClick={() => {
                  onDelete(vehicle.id)
                  handleClose()
                }}
                disabled={isSaving || isUploadingImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 1.5vw, 8px)',
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) clamp(14px, 3vw, 16px)' : '8px 16px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '14px',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: 'clamp(4px, 1vw, 6px)',
                  cursor: isSaving || isUploadingImage ? 'not-allowed' : 'pointer',
                  opacity: isSaving || isUploadingImage ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  flex: isMobile ? 1 : 'none'
                }}
              >
                <Trash size={18} style={{ 
                  width: isMobile ? 'clamp(16px, 2.5vw, 18px)' : 18,
                  height: isMobile ? 'clamp(16px, 2.5vw, 18px)' : 18,
                  fontWeight: 300 
                }} />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className="bw-btn-icon"
              disabled={isLoading || isSaving || isUploadingImage}
              style={{ 
                border: 'none', 
                background: 'transparent',
                width: isMobile ? 'clamp(36px, 5vw, 40px)' : 'auto',
                height: isMobile ? 'clamp(36px, 5vw, 40px)' : 'auto',
                minWidth: isMobile ? 'clamp(36px, 5vw, 40px)' : 'auto'
              }}
            >
              <X size={20} style={{ 
                width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : 20,
                height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : 20,
                fontWeight: 300 
              }} />
            </button>
          </div>
        </div>

        {isLoading ? (
            <div style={{ textAlign: 'center', padding: isMobile ? 'clamp(32px, 5vw, 48px) clamp(16px, 3vw, 24px)' : '48px 24px' }}>
            <div className="bw-loading-spinner" style={{ 
              width: isMobile ? 'clamp(24px, 4vw, 32px)' : '32px', 
              height: isMobile ? 'clamp(24px, 4vw, 32px)' : '32px', 
              margin: '0 auto clamp(12px, 2vw, 16px)' 
            }}></div>
            <p style={{ 
              fontFamily: 'Work Sans, sans-serif',
              fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px'
            }}>Loading vehicle data...</p>
          </div>
        ) : error ? (
          <div style={{ 
            padding: isMobile ? 'clamp(20px, 3vw, 24px)' : '24px', 
            textAlign: 'center',
            color: '#dc2626',
            fontFamily: 'Work Sans, sans-serif'
          }}>
            <AlertCircle size={48} style={{ 
              width: isMobile ? 'clamp(32px, 5vw, 48px)' : 48,
              height: isMobile ? 'clamp(32px, 5vw, 48px)' : 48,
              marginBottom: 'clamp(12px, 2vw, 16px)', 
              fontWeight: 300 
            }} />
            <p style={{ fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px' }}>{error}</p>
            <button 
              className="bw-btn-outline" 
              onClick={loadVehicleData}
              style={{ 
                marginTop: 'clamp(12px, 2vw, 16px)', 
                fontFamily: 'Work Sans, sans-serif',
                padding: isMobile ? 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)' : '8px 16px',
                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
              }}
            >
              Try Again
            </button>
          </div>
        ) : vehicle ? (
          <div style={{ padding: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px' }}>
            {success && (
              <div style={{ 
                marginBottom: isMobile ? 'clamp(16px, 3vw, 24px)' : 24, 
                padding: 'clamp(10px, 2vw, 12px)', 
                backgroundColor: '#dcfce7', 
                border: '1px solid #bbf7d0', 
                borderRadius: 'clamp(4px, 1vw, 6px)',
                color: '#166534',
                fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '14px',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 1.5vw, 8px)',
                fontFamily: 'Work Sans, sans-serif'
              }}>
                <CheckCircle size={16} style={{ 
                  width: isMobile ? 'clamp(14px, 2vw, 16px)' : 16,
                  height: isMobile ? 'clamp(14px, 2vw, 16px)' : 16,
                  fontWeight: 300 
                }} />
                Image updated successfully!
              </div>
            )}

            {/* Image Carousel */}
            <div style={{ marginBottom: isMobile ? 'clamp(24px, 4vw, 32px)' : 32 }}>
              <h4 style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                fontSize: isMobile ? 'clamp(16px, 2.5vw, 20px)' : '16px',
                fontFamily: 'Work Sans, sans-serif',
                fontWeight: 300
              }}>Vehicle Images</h4>
              
              {allowedImageTypes.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: isMobile ? 'clamp(20px, 3vw, 24px)' : '24px', 
                  color: '#6b7280',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px'
                }}>
                  Loading image types...
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Carousel Container */}
                  <div 
                    ref={carouselRef}
                    style={{
                      display: 'flex',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 12px)' : '6px',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      scrollBehavior: 'smooth',
                      padding: isMobile ? 'clamp(8px, 1.5vw, 12px) 0' : '8px 0',
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'var(--bw-border) var(--bw-bg)'
                    }}
                    onScroll={(e) => {
                      const container = e.currentTarget
                      const scrollLeft = container.scrollLeft
                      const itemWidth = isMobile ? (Math.min(Math.max(150, window.innerWidth * 0.25), 225) + 12) : (225 + 6)
                      const newIndex = Math.round(scrollLeft / itemWidth)
                      setCarouselIndex(newIndex)
                    }}
                  >
                    {allowedImageTypes.map((imageType) => {
                      const uploadedImage = uploadedImages.get(imageType)
                      const existingImageUrl = vehicle.vehicle_images?.[imageType] as string | undefined
                      const hasImage = !!(uploadedImage || existingImageUrl)
                      const imageSize = isMobile ? 'clamp(150px, 25vw, 225px)' : '225px'
                      
                      return (
                        <div
                          key={imageType}
                          style={{
                            minWidth: imageSize,
                            width: imageSize,
                            height: imageSize,
                            position: 'relative',
                            flexShrink: 0,
                            border: '2px solid var(--bw-border)',
                            borderRadius: isMobile ? 'clamp(6px, 1.5vw, 8px)' : '8px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--bw-accent)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--bw-border)'
                          }}
                          onClick={() => handleImageTypeClick(imageType)}
                        >
                          {hasImage ? (
                            <>
                              <img
                                src={uploadedImage?.preview || existingImageUrl}
                                alt={formatImageTypeLabel(imageType)}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                              {uploadedImage && (
                                <div style={{
                                  position: 'absolute',
                                  top: isMobile ? 'clamp(4px, 1vw, 6px)' : '4px',
                                  right: isMobile ? 'clamp(4px, 1vw, 6px)' : '4px',
                                  background: 'var(--bw-success, #1E7F4A)',
                                  borderRadius: '50%',
                                  width: isMobile ? 'clamp(18px, 3vw, 20px)' : '20px',
                                  height: isMobile ? 'clamp(18px, 3vw, 20px)' : '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <CheckCircle size={12} style={{
                                    width: isMobile ? 'clamp(10px, 2vw, 12px)' : 12,
                                    height: isMobile ? 'clamp(10px, 2vw, 12px)' : 12,
                                    color: 'white'
                                  }} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: isMobile ? 'clamp(6px, 1.5vw, 8px)' : '8px',
                              padding: isMobile ? 'clamp(10px, 2vw, 12px)' : '12px',
                              textAlign: 'center'
                            }}>
                              <Upload size={24} style={{ 
                                width: isMobile ? 'clamp(20px, 3vw, 24px)' : 24,
                                height: isMobile ? 'clamp(20px, 3vw, 24px)' : 24,
                                color: 'var(--bw-muted)', 
                                fontWeight: 300 
                              }} />
                              <span style={{
                                fontSize: isMobile ? 'clamp(10px, 1.5vw, 11px)' : '11px',
                                color: 'var(--bw-muted)',
                                lineHeight: '1.2',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                {formatImageTypeLabel(imageType)}
                              </span>
                            </div>
                          )}
                          
                          {/* Image Type Label Overlay */}
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            padding: isMobile ? 'clamp(6px, 1.5vw, 8px)' : '8px',
                            color: 'white',
                            fontSize: isMobile ? 'clamp(9px, 1.3vw, 10px)' : '10px',
                            fontWeight: 300,
                            textAlign: 'center',
                            fontFamily: 'Work Sans, sans-serif'
                          }}>
                            {formatImageTypeLabel(imageType)}
                          </div>
                          
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
                  
                  {/* Carousel Navigation */}
                  {allowedImageTypes.length > (isMobile ? 2 : 4) && (
                    <>
                      <button
                        onClick={() => {
                          if (carouselRef.current) {
                            const itemWidth = isMobile ? (Math.min(Math.max(150, window.innerWidth * 0.25), 225) + 12) : 231
                            const newScroll = Math.max(0, carouselRef.current.scrollLeft - itemWidth * (isMobile ? 2 : 3))
                            carouselRef.current.scrollLeft = newScroll
                          }
                        }}
                        disabled={carouselIndex === 0}
                        style={{
                          position: 'absolute',
                          left: isMobile ? 'clamp(-12px, -2vw, -8px)' : '-20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'var(--bw-bg-secondary)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '50%',
                          width: isMobile ? 'clamp(32px, 5vw, 36px)' : '36px',
                          height: isMobile ? 'clamp(32px, 5vw, 36px)' : '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: carouselIndex === 0 ? 'not-allowed' : 'pointer',
                          zIndex: 10,
                          color: 'var(--bw-text)',
                          opacity: carouselIndex === 0 ? 0.5 : 1
                        }}
                      >
                        <ChevronLeft size={20} style={{ 
                          width: isMobile ? 'clamp(16px, 2.5vw, 20px)' : 20,
                          height: isMobile ? 'clamp(16px, 2.5vw, 20px)' : 20,
                          fontWeight: 300 
                        }} />
                      </button>
                      <button
                        onClick={() => {
                          if (carouselRef.current) {
                            const itemWidth = isMobile ? (Math.min(Math.max(150, window.innerWidth * 0.25), 225) + 12) : 231
                            const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth
                            const newScroll = Math.min(maxScroll, carouselRef.current.scrollLeft + itemWidth * (isMobile ? 2 : 3))
                            carouselRef.current.scrollLeft = newScroll
                          }
                        }}
                        disabled={carouselIndex >= allowedImageTypes.length - (isMobile ? 2 : 4)}
                        style={{
                          position: 'absolute',
                          right: isMobile ? 'clamp(-12px, -2vw, -8px)' : '-20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'var(--bw-bg-secondary)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '50%',
                          width: isMobile ? 'clamp(32px, 5vw, 36px)' : '36px',
                          height: isMobile ? 'clamp(32px, 5vw, 36px)' : '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: carouselIndex >= allowedImageTypes.length - (isMobile ? 2 : 4) ? 'not-allowed' : 'pointer',
                          zIndex: 10,
                          color: 'var(--bw-text)',
                          opacity: carouselIndex >= allowedImageTypes.length - (isMobile ? 2 : 4) ? 0.5 : 1
                        }}
                      >
                        <ChevronRight size={20} style={{ 
                          width: isMobile ? 'clamp(16px, 2.5vw, 20px)' : 20,
                          height: isMobile ? 'clamp(16px, 2.5vw, 20px)' : 20,
                          fontWeight: 300 
                        }} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {uploadedImages.size > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 'clamp(12px, 2vw, 16px)' : '16px', 
                  justifyContent: 'center', 
                  marginTop: 'clamp(12px, 2vw, 16px)',
                  width: '100%'
                }}>
                  <button 
                    type="button" 
                    className="bw-btn-outline" 
                    onClick={() => setUploadedImages(new Map())}
                    disabled={isUploadingImage}
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif',
                      padding: isMobile ? 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)' : '8px 16px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Clear All
                  </button>
                  <button 
                    type="button" 
                    className="bw-btn bw-btn-action" 
                    onClick={handleUploadImage}
                    disabled={isUploadingImage}
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif',
                      padding: isMobile ? 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)' : '8px 16px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      width: isMobile ? '100%' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'clamp(6px, 1.5vw, 8px)'
                    }}
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="bw-loading-spinner" style={{ 
                          width: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px', 
                          height: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px' 
                        }}></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" style={{ 
                          width: isMobile ? 'clamp(16px, 2.5vw, 18px)' : 18,
                          height: isMobile ? 'clamp(16px, 2.5vw, 18px)' : 18,
                          fontWeight: 300 
                        }} />
                        Upload {uploadedImages.size} Image{uploadedImages.size !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Vehicle Information Display - At Bottom */}
            <div style={{ 
              borderTop: '1px solid var(--bw-border)', 
              paddingTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px',
              marginTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px'
            }}>
              <h4 style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                fontSize: isMobile ? 'clamp(16px, 2.5vw, 20px)' : '16px',
                fontFamily: 'Work Sans, sans-serif',
                fontWeight: 300
              }}>Vehicle Information</h4>
              <div className="bw-info-grid" style={{
                display: 'grid',
                gap: isMobile ? 'clamp(12px, 2vw, 16px)' : '16px',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
              }}>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Make:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.make}</span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Model:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.model}</span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Year:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.year || 'Not specified'}</span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Color:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.color || 'Not specified'}</span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>License Plate:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.license_plate || 'Not specified'}</span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Status:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.status || 'Unknown'}</span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: '1px solid var(--bw-border)'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Category:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>
                    {vehicle.vehicle_category?.vehicle_category || 'Not set'}
                  </span>
                </div>
                <div className="bw-info-item" style={{
                  padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                  borderBottom: vehicle.driver ? '1px solid var(--bw-border)' : 'none'
                }}>
                  <span className="bw-info-label" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                  }}>Seating Capacity:</span>
                  <span className="bw-info-value" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 400,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                  }}>{vehicle.seating_capacity || 'Not set'} seats</span>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            {vehicle.driver && (
              <div style={{ 
                borderTop: '1px solid var(--bw-border)', 
                paddingTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px',
                marginTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(8px, 1.5vw, 12px)',
                  marginBottom: isMobile ? 'clamp(12px, 2vw, 16px)' : '16px'
                }}>
                  <User size={20} style={{ 
                    width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : 20,
                    height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : 20,
                    color: 'var(--bw-text)',
                    opacity: 0.7
                  }} />
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: isMobile ? 'clamp(16px, 2.5vw, 20px)' : '16px',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: 300
                  }}>Assigned Driver</h4>
                </div>
                <div className="bw-info-grid" style={{
                  display: 'grid',
                  gap: isMobile ? 'clamp(12px, 2vw, 16px)' : '16px',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
                }}>
                  <div className="bw-info-item" style={{
                    padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                    }}>Driver Name:</span>
                    <span className="bw-info-value" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                    }}>{vehicle.driver.full_name}</span>
                  </div>
                  <div className="bw-info-item" style={{
                    padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                    }}>Driver Type:</span>
                    <span className="bw-info-value" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      textTransform: 'capitalize'
                    }}>{vehicle.driver.driver_type === 'in_house' ? 'In-House' : 'Outsourced'}</span>
                  </div>
                  <div className="bw-info-item" style={{
                    padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                    }}>Status:</span>
                    <span className="bw-info-value" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      color: vehicle.driver.is_active ? '#10b981' : '#6b7280',
                      textTransform: 'capitalize'
                    }}>{vehicle.driver.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="bw-info-item" style={{
                    padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                    }}>Registration:</span>
                    <span className="bw-info-value" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      textTransform: 'capitalize'
                    }}>{vehicle.driver.is_registered === 'registered' ? 'Registered' : 'Pending'}</span>
                  </div>
                  <div className="bw-info-item" style={{
                    padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                    }}>Completed Rides:</span>
                    <span className="bw-info-value" style={{ 
                      fontFamily: 'Work Sans, sans-serif', 
                      fontWeight: 400,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px'
                    }}>{vehicle.driver.completed_rides || 0}</span>
                  </div>
                  {vehicle.driver.status && (
                    <div className="bw-info-item" style={{
                      padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                      borderBottom: 'none'
                    }}>
                      <span className="bw-info-label" style={{ 
                        fontFamily: 'Work Sans, sans-serif', 
                        fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px' 
                      }}>Driver Status:</span>
                      <span className="bw-info-value" style={{ 
                        fontFamily: 'Work Sans, sans-serif', 
                        fontWeight: 400,
                        fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                        textTransform: 'capitalize'
                      }}>{vehicle.driver.status}</span>
                    </div>
                  )}
                  {!vehicle.driver.status && (
                    <div className="bw-info-item" style={{
                      padding: isMobile ? 'clamp(10px, 2vw, 12px) 0' : '12px 0',
                      borderBottom: 'none'
                    }}>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!vehicle.driver && (
              <div style={{ 
                borderTop: '1px solid var(--bw-border)', 
                paddingTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px',
                marginTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px',
                textAlign: 'center',
                color: 'var(--bw-muted)',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '16px'
              }}>
                <User size={24} style={{ 
                  width: isMobile ? 'clamp(20px, 3vw, 24px)' : 24,
                  height: isMobile ? 'clamp(20px, 3vw, 24px)' : 24,
                  marginBottom: 'clamp(8px, 1.5vw, 12px)',
                  opacity: 0.5,
                  margin: '0 auto clamp(8px, 1.5vw, 12px)'
                }} />
                <p style={{ margin: 0 }}>No driver assigned to this vehicle</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? 'clamp(12px, 2vw, 16px)' : '16px', 
              justifyContent: 'flex-end', 
              borderTop: '1px solid var(--bw-border)', 
              paddingTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px',
              marginTop: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px'
            }}>
              <button 
                type="button" 
                className="bw-btn-outline" 
                onClick={handleClose}
                disabled={isSaving || isUploadingImage}
                style={{ 
                  fontFamily: 'Work Sans, sans-serif',
                  padding: isMobile ? 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)' : '8px 16px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  width: isMobile ? '100%' : 'auto'
                }}
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
