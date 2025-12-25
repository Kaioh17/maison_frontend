import { useEffect, useState } from 'react'
import type React from 'react'
import { getTenantInfo, getTenantDrivers, getTenantVehicles, getTenantBookings, getTenantBookingById, onboardDriver, assignDriverToVehicle, assignDriverToBooking, type TenantResponse, type DriverResponse, type DriverDetailResponse, type VehicleResponse, type BookingResponse, type OnboardDriver } from '@api/tenant'
import { getVehicleRates, getVehicleCategories, createVehicleCategory, setVehicleRates, deleteVehicle, addVehicle } from '@api/vehicles'
import { getTenantSettings, updateTenantSettings, updateTenantLogo, type TenantSettingsResponse, type UpdateTenantSetting } from '@api/tenantSettings'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTenantTheme } from '@contexts/ThemeContext'
import ThemeToggle from '@components/ThemeToggle'
import VehicleEditModal from '@components/VehicleEditModal'
import TokenExpirationNotification from '@components/TokenExpirationNotification'
import { Car, Users, Calendar, Settings, TrendingUp, DollarSign, Clock, MapPin, User, Phone, Mail, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Palette, Save, Menu, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { API_BASE } from '@config'
import { vehicleMakes, getVehicleModels } from '../data/vehicleData'

type TabType = 'overview' | 'drivers' | 'bookings' | 'vehicles' | 'settings'

// Helper component for vehicle image with fallback
function VehicleImageCard({ imageUrl, make, model }: { imageUrl: string | null, make: string, model: string }) {
  const [imageError, setImageError] = useState(false)
  
  return (
    <div style={{
      width: '100%',
      height: 'clamp(150px, 25vw, 200px)',
      backgroundColor: 'var(--bw-bg-secondary)',
      borderBottom: '1px solid var(--bw-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {imageUrl && !imageError ? (
        <img 
          src={imageUrl} 
          alt={`${make} ${model}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Car className="w-12 h-12" style={{ 
          width: 'clamp(32px, 5vw, 48px)',
          height: 'clamp(32px, 5vw, 48px)',
          color: 'var(--bw-disabled)', 
          opacity: 0.5 
        }} />
      )}
    </div>
  )
}

export default function TenantDashboard() {
  const { accessToken, role } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [info, setInfo] = useState<any>(null)
  const [drivers, setDrivers] = useState<DriverResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [vehicleCategories, setVehicleCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [editingRates, setEditingRates] = useState<{ [key: string]: number }>({})
  const [savingRates, setSavingRates] = useState<{ [key: string]: boolean }>({})
  const [newDriver, setNewDriver] = useState<OnboardDriver>({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
  const [assign, setAssign] = useState<{ vehicleId: string; driverId: string }>({ vehicleId: '', driverId: '' })
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [showAssignDriver, setShowAssignDriver] = useState(false)
  // For tabs that don't have routes (like vehicles), we use state
  const [internalTab, setInternalTab] = useState<TabType | null>(null)
  const [tenantSettings, setTenantSettings] = useState<TenantSettingsResponse | null>(null)
  const [editingSettings, setEditingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [editedSettings, setEditedSettings] = useState<UpdateTenantSetting | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Vehicle edit modal state
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)
  const [showVehicleEditModal, setShowVehicleEditModal] = useState(false)

  // Hamburger menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Mobile breakpoint state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 844)

  // Booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false)

  // Driver details modal state
  const [selectedDriver, setSelectedDriver] = useState<DriverDetailResponse | null>(null)
  const [showDriverDetails, setShowDriverDetails] = useState(false)
  const [loadingDriverDetails, setLoadingDriverDetails] = useState(false)

  // Assign driver to booking state
  const [showAssignDriverToBooking, setShowAssignDriverToBooking] = useState(false)
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<string>('')
  const [assigningDriver, setAssigningDriver] = useState(false)
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)

  // Delete vehicle state
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Vehicle Settings dropdown state
  const [vehicleSettingsOpen, setVehicleSettingsOpen] = useState(false)
  
  // KPI Carousel state (for mobile)
  const [currentKpiIndex, setCurrentKpiIndex] = useState(0)

  // Show more bookings in overview state
  const [showMoreBookings, setShowMoreBookings] = useState(false)

  // Add vehicle hover form state
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false)
  
  // Switch to driver mode state
  const [showDriverModeConfirm, setShowDriverModeConfirm] = useState(false)
  const [isAddVehicleHovered, setIsAddVehicleHovered] = useState(false)
  const [isAssignDriverHovered, setIsAssignDriverHovered] = useState(false)
  
  // Button hover states
  const [isRetryHovered, setIsRetryHovered] = useState(false)
  const [isTryAgainHovered, setIsTryAgainHovered] = useState(false)
  const [isViewAllHovered, setIsViewAllHovered] = useState(false)
  const [isAddDriverHovered, setIsAddDriverHovered] = useState(false)
  const [isDownloadLogsHovered, setIsDownloadLogsHovered] = useState(false)
  const [isSaveRateHovered, setIsSaveRateHovered] = useState(false)
  const [isAddCategoryHovered, setIsAddCategoryHovered] = useState(false)
  const [isMoreSettingsHovered, setIsMoreSettingsHovered] = useState(false)
  const [isCreateDriverHovered, setIsCreateDriverHovered] = useState(false)
  const [isAssignDriverModalHovered, setIsAssignDriverModalHovered] = useState(false)
  const [isAssignDriverToBookingHovered, setIsAssignDriverToBookingHovered] = useState(false)
  const [isOverrideConfirmHovered, setIsOverrideConfirmHovered] = useState(false)
  const [isDeleteVehicleHovered, setIsDeleteVehicleHovered] = useState(false)
  const [isAddVehicleFormHovered, setIsAddVehicleFormHovered] = useState(false)
  const [isCancelAddVehicleHovered, setIsCancelAddVehicleHovered] = useState(false)
  const [isCancelAddDriverHovered, setIsCancelAddDriverHovered] = useState(false)
  const [isCancelAssignDriverHovered, setIsCancelAssignDriverHovered] = useState(false)
  const [isCancelAssignBookingHovered, setIsCancelAssignBookingHovered] = useState(false)
  const [isBackOverrideHovered, setIsBackOverrideHovered] = useState(false)
  const [isCancelDeleteHovered, setIsCancelDeleteHovered] = useState(false)
  
  // Helper to detect light mode
  const isLightMode = () => {
    if (typeof window === 'undefined') return false
    const theme = tenantSettings?.theme || document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme')
    if (theme === 'auto') {
      return !window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme === 'light'
  }
  
  const [newVehicle, setNewVehicle] = useState({
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
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [addVehicleError, setAddVehicleError] = useState<string | null>(null)
  const [addVehicleSuccess, setAddVehicleSuccess] = useState(false)

  // Sync theme with tenant settings
  useTenantTheme(tenantSettings?.theme)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      
      const tenantInfoPromise = getTenantInfo()
      const driversPromise = getTenantDrivers()
      const vehiclesPromise = getTenantVehicles()
      const bookingsPromise = getTenantBookings()
      const vehicleCategoriesPromise = getVehicleCategories()
      const tenantSettingsPromise = getTenantSettings()
      
      const [i, d, v, b, vc, ts] = await Promise.all([
        tenantInfoPromise,
        driversPromise,
        vehiclesPromise,
        bookingsPromise,
        vehicleCategoriesPromise,
        tenantSettingsPromise,
      ])
      
      if (i.data) {
        setInfo(i.data)
      } else {
        console.error('No tenant data in response:', i)
        setError('Failed to load tenant information - no data in response')
      }
      
      // Handle drivers - empty array is valid
      if (d.data !== undefined) {
        setDrivers(d.data || [])
      } else {
        console.error('No drivers data in response:', d)
        setError('Failed to load drivers information - no data in response')
      }
      
      // Handle vehicles - empty array is valid
      if (v.data !== undefined) {
        setVehicles(v.data || [])
      } else {
        console.error('No vehicles data in response:', v)
        setError('Failed to load vehicles information - no data in response')
      }
      
      // Handle bookings - empty array is valid
      if (b.data !== undefined) {
        setBookings(b.data || [])
      } else {
        console.error('No bookings data in response:', b)
        setError('Failed to load bookings information - no data in response')
      }
      
      // Handle vehicle categories
      if (vc.data !== undefined) {
        setVehicleCategories(vc.data || [])
      } else if (vc && Array.isArray(vc)) {
        // Handle case where response is directly an array
        setVehicleCategories(vc)
      } else {
        setVehicleCategories([])
      }
      
      // Handle tenant settings
      if (ts) {
        setTenantSettings(ts)
        setEditedSettings(ts)
      } else {
        console.error('No tenant settings data in response:', ts)
        setError('Failed to load tenant settings - no data in response')
      }
      
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error)
      
      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          setError('Authentication failed. Please log in again.')
        } else if (status === 403) {
          setError('Access denied. You do not have permission to view this data.')
        } else if (status === 500) {
          setError('Server error. Please try again later.')
        } else {
          setError(`Failed to load data: ${status} - ${error.response.data?.detail || 'Unknown error'}`)
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection and try again.')
      } else {
        setError('Failed to load dashboard data. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Mobile breakpoint handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMenuOpen(false) // Close menu on desktop resize
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const createDriver = async () => {
    if (!newDriver.email || !newDriver.first_name || !newDriver.last_name) return
    try {
      await onboardDriver({ ...newDriver, driver_type: newDriver.driver_type as OnboardDriver['driver_type'] })
      setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
      setShowAddDriver(false)
      await load()
    } catch (error) {
      console.error('Failed to create driver:', error)
    }
  }

  const assignVehicle = async () => {
    const vehicleId = Number(assign.vehicleId)
    const driverId = Number(assign.driverId)
    if (!vehicleId || !driverId) return
    try {
      await assignDriverToVehicle(vehicleId, { driver_id: driverId })
      setAssign({ vehicleId: '', driverId: '' })
      setShowAssignDriver(false)
      await load()
    } catch (error) {
      console.error('Failed to assign driver:', error)
    }
  }

  const saveVehicleRate = async (categoryName: string, newRate: number) => {
    try {
      setSavingRates(prev => {
        try {
          return { ...prev, [categoryName]: true }
        } catch (e) {
          console.error('Error updating saving state:', e)
          return prev
        }
      })
      
      const payload = {
        vehicle_category: categoryName,
        vehicle_flat_rate: newRate
      }
      
      const result = await setVehicleRates(payload)
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update vehicle rate')
      }
      
      // Update local state to reflect the change
      setVehicleCategories(prev => {
        try {
          return prev.map(cat => 
            cat.vehicle_category === categoryName 
              ? { ...cat, vehicle_flat_rate: newRate }
              : cat
          )
        } catch (e) {
          console.error('Error updating vehicle categories state:', e)
          return prev
        }
      })
      
      // Clear the editing state for this category
      setEditingRates(prev => {
        try {
          const newState = { ...prev }
          delete newState[categoryName]
          return newState
        } catch (e) {
          console.error('Error clearing editing state:', e)
          return prev
        }
      })
      
      alert(`Successfully updated ${categoryName} rate to $${newRate}`)
    } catch (error: any) {
      console.error(`Failed to update ${categoryName} rate:`, error)
      alert(`Failed to update ${categoryName} rate. Please try again.`)
    } finally {
      // Safely reset saving state
      setSavingRates(prev => {
        try {
          return { ...prev, [categoryName]: false }
        } catch (e) {
          console.error('Error resetting saving state:', e)
          return prev
        }
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-500'
      case 'active': return 'text-green-500'
      case 'pending': return 'text-yellow-500'
      case 'cancelled': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getVehicleRate = (category: string) => {
    // Check if category is defined and not null
    if (!category || typeof category !== 'string') {
      return 0
    }
    
    // Check if vehicleCategories is an array and has items
    if (!Array.isArray(vehicleCategories) || vehicleCategories.length === 0) {
      // Return hardcoded default rates if no categories available
      const defaultRates: { [key: string]: number } = {
        'sedan': 25,
        'suv': 35,
        'luxury': 50,
        'van': 40,
        'truck': 45,
        'motorcycle': 20
      }
      return defaultRates[category.toLowerCase()] || 0
    }
    
    // Find the category and return its rate
    const foundCategory = vehicleCategories.find(cat => 
      cat.vehicle_category.toLowerCase() === category.toLowerCase()
    )
    
    if (foundCategory && foundCategory.vehicle_flat_rate > 0) {
      return foundCategory.vehicle_flat_rate
    }
    
    // Return hardcoded default rates if no rate set
    const defaultRates: { [key: string]: number } = {
      'sedan': 25,
      'suv': 35,
      'luxury': 50,
      'van': 40,
      'truck': 45,
      'motorcycle': 20
    }
    return defaultRates[category.toLowerCase()] || 0
  }

  const handleSettingChange = (field: keyof UpdateTenantSetting, value: any) => {
    if (editedSettings) {
      setEditedSettings({
        ...editedSettings,
        [field]: value
      })
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Update the edited settings with the file
      if (editedSettings) {
        setEditedSettings({
          ...editedSettings,
          logo_url: file
        })
      }
    }
  }

  const handleSaveSettings = async () => {
    if (!editedSettings) return
    
    try {
      setSavingSettings(true)
      
      // If only logo changed, use the dedicated logo endpoint
      if (logoFile && !hasOtherChanges()) {
        try {
          await updateTenantLogo(logoFile)
          // After successful logo update, refresh the settings to get the new logo URL
          const refreshedSettings = await getTenantSettings()
          setTenantSettings(refreshedSettings)
          setEditedSettings(refreshedSettings)
          setEditingSettings(false)
          setLogoFile(null)
          setLogoPreview(null)
          alert('Logo updated successfully!')
          return
        } catch (logoError) {
          console.error('Logo update failed:', logoError)
          // Fallback: skip logo update, just update other settings
          try {
            const settingsToUpdate = {
              ...editedSettings,
              // Don't include logo_url if it's a File - skip it
              logo_url: typeof editedSettings.logo_url === 'string' ? editedSettings.logo_url : ''
            }
            
            const updatedSettings = await updateTenantSettings(settingsToUpdate)
            setTenantSettings(updatedSettings)
            setEditingSettings(false)
            setLogoFile(null)
            setLogoPreview(null)
            alert('Logo updated successfully via fallback method!')
            return
          } catch (fallbackError) {
            console.error('Fallback update also failed:', fallbackError)
            alert('Failed to update logo. Please try again.')
            return
          }
        }
      }
      
      // If there's a logo file, upload it first to get the URL
      let logoUrl = editedSettings.logo_url
      if (logoFile) {
        try {
          await updateTenantLogo(logoFile)
          // Refresh settings to get the new logo URL
          const refreshedSettings = await getTenantSettings()
          logoUrl = refreshedSettings.logo_url
        } catch (logoError) {
          console.error('Logo upload failed, continuing with other settings:', logoError)
          // Continue with other settings even if logo upload fails
        }
      }
      
      // Update all settings with the logo URL (string, not File)
      const settingsToUpdate = {
        ...editedSettings,
        logo_url: logoUrl
      }
      
      const updatedSettings = await updateTenantSettings(settingsToUpdate)
      setTenantSettings(updatedSettings)
      setEditedSettings(updatedSettings)
      setEditingSettings(false)
      setLogoFile(null)
      setLogoPreview(null)
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setSavingSettings(false)
    }
  }

  const hasOtherChanges = () => {
    if (!tenantSettings || !editedSettings) return false
    
    return (
      editedSettings.theme !== tenantSettings.theme ||
      editedSettings.slug !== tenantSettings.slug ||
      editedSettings.enable_branding !== tenantSettings.enable_branding ||
      editedSettings.base_fare !== tenantSettings.base_fare ||
      editedSettings.per_minute_rate !== tenantSettings.per_minute_rate ||
      editedSettings.per_mile_rate !== tenantSettings.per_mile_rate ||
      editedSettings.per_hour_rate !== tenantSettings.per_hour_rate ||
      editedSettings.rider_tiers_enabled !== tenantSettings.rider_tiers_enabled ||
      editedSettings.cancellation_fee !== tenantSettings.cancellation_fee ||
      editedSettings.discounts !== tenantSettings.discounts
    )
  }

  const handleCancelEdit = () => {
    setEditedSettings(tenantSettings)
    setEditingSettings(false)
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleBookingClick = async (bookingId: number) => {
    setLoadingBookingDetails(true)
    setShowBookingDetails(true)
    try {
      const response = await getTenantBookingById(bookingId)
      if (response.data && response.data.length > 0) {
        setSelectedBooking(response.data[0])
      } else {
        setError('Booking not found')
        setShowBookingDetails(false)
      }
    } catch (error: any) {
      console.error('Failed to load booking details:', error)
      setError('Failed to load booking details')
      setShowBookingDetails(false)
    } finally {
      setLoadingBookingDetails(false)
    }
  }

  const handleDriverClick = async (driverId: number) => {
    setLoadingDriverDetails(true)
    setShowDriverDetails(true)
    try {
      const response = await getTenantDrivers(driverId)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSelectedDriver(response.data[0] as DriverDetailResponse)
      } else {
        setError('Driver not found')
        setShowDriverDetails(false)
      }
    } catch (error: any) {
      console.error('Failed to load driver details:', error)
      setError('Failed to load driver details')
      setShowDriverDetails(false)
    } finally {
      setLoadingDriverDetails(false)
    }
  }

  const handleAssignDriverToBooking = async () => {
    if (!selectedBooking || !selectedDriverForBooking) return

    const driverId = Number(selectedDriverForBooking)
    if (!driverId) return

    const hasDriver = !!(selectedBooking.driver_name && selectedBooking.driver_name !== 'None')
    
    // If driver exists and user hasn't confirmed override, show confirmation
    if (hasDriver && !showOverrideConfirm) {
      setShowOverrideConfirm(true)
      return
    }

    setAssigningDriver(true)
    try {
      await assignDriverToBooking(selectedBooking.id, {
        driver_id: driverId,
        override: hasDriver
      })
      
      // Refresh booking details
      const response = await getTenantBookingById(selectedBooking.id)
      if (response.data && response.data.length > 0) {
        setSelectedBooking(response.data[0])
      }
      
      // Refresh bookings list
      await load()
      
      setShowAssignDriverToBooking(false)
      setSelectedDriverForBooking('')
      setShowOverrideConfirm(false)
    } catch (error: any) {
      console.error('Failed to assign driver to booking:', error)
      setError('Failed to assign driver. Please try again.')
    } finally {
      setAssigningDriver(false)
    }
  }

  const handleDeleteVehicle = (vehicleId: number) => {
    setDeletingVehicleId(vehicleId)
    setShowDeleteConfirm(true)
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newVehicle.make || !newVehicle.model) {
      setAddVehicleError('Make and Model are required fields')
      return
    }

    setAddingVehicle(true)
    setAddVehicleError(null)

    try {
      const vehiclePayload = {
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year ? parseInt(newVehicle.year) : undefined,
        license_plate: newVehicle.license_plate || undefined,
        color: newVehicle.color || undefined,
        status: newVehicle.status,
        vehicle_category: newVehicle.vehicle_category,
        vehicle_flat_rate: parseFloat(newVehicle.vehicle_flat_rate) || 0,
        seating_capacity: parseInt(newVehicle.seating_capacity.toString()) || 4
      }

      const response = await addVehicle(vehiclePayload)
      if (response.success && response.data) {
        setAddVehicleSuccess(true)
        // Reset form
        setNewVehicle({
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
        // Refresh vehicles list
        await load()
        // Hide form after success
        setTimeout(() => {
          setShowAddVehicleForm(false)
          setAddVehicleSuccess(false)
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to create vehicle')
      }
    } catch (err: any) {
      console.error('Failed to create vehicle:', err)
      setAddVehicleError(err.response?.data?.detail || 'Failed to create vehicle. Please try again.')
    } finally {
      setAddingVehicle(false)
    }
  }

  const handleNewVehicleChange = (field: string, value: any) => {
    setNewVehicle(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      
      // Auto-fill flat rate when vehicle category is selected
      if (field === 'vehicle_category' && value) {
        const selectedCategory = vehicleCategories.find(
          cat => cat.vehicle_category === value
        )
        if (selectedCategory && selectedCategory.vehicle_flat_rate) {
          updated.vehicle_flat_rate = selectedCategory.vehicle_flat_rate.toString()
        }
      }
      
      return updated
    })
  }

  const confirmDeleteVehicle = async () => {
    if (!deletingVehicleId) return

    setIsDeleting(true)
    try {
      await deleteVehicle(deletingVehicleId)
      
      // Refresh vehicles list
      await load()
      
      setShowDeleteConfirm(false)
      setDeletingVehicleId(null)
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error)
      setError('Failed to delete vehicle. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  // Determine active tab from URL or internal state
  const getActiveTab = (): TabType => {
    // If we have an internal tab (for vehicles), use it
    if (internalTab) return internalTab
    
    // Otherwise, determine from URL
    const path = location.pathname
    if (path === '/tenant/drivers') return 'drivers'
    if (path === '/tenant/bookings') return 'bookings'
    if (path === '/tenant/overview' || path === '/tenant') return 'overview'
    // Default to overview if path doesn't match
    return 'overview'
  }

  const activeTab = getActiveTab()

  // Handle tab navigation
  const handleTabClick = (tabId: TabType) => {
    if (tabId === 'settings') {
      navigate('/tenant/settings')
    } else if (tabId === 'vehicles') {
      // Keep vehicles tab as internal state since there's no route for it
      setInternalTab('vehicles')
    } else {
      // Clear internal tab when navigating to URL-based tabs
      setInternalTab(null)
      navigate(`/tenant/${tabId}`)
    }
    // Close menu on mobile when section is clicked
    if (isMobile) {
      setIsMenuOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="bw bw-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="bw-loading">Loading dashboard...</div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
            <div className="bw-header-actions">
              <button 
                className="bw-btn-outline" 
                onClick={() => useAuthStore.getState().logout()}
                style={{ marginLeft: 16 }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: '#6b7280', marginBottom: '16px' }}>
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: '#6b7280' }}>No Tenant Information</h3>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>Unable to load tenant information. Please try again.</p>
          <button 
            className={`bw-btn bw-btn-action ${isRetryHovered ? 'custom-hover-border' : ''}`}
            onClick={load}
            onMouseEnter={() => setIsRetryHovered(true)}
            onMouseLeave={() => setIsRetryHovered(false)}
            style={{
              padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
              fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
              borderRadius: 7,
              border: isRetryHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
              borderColor: isRetryHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
              color: isRetryHovered ? 'rgba(155, 97, 209, 0.81)' : '#000',
              transition: 'all 0.2s ease'
            } as React.CSSProperties}
          >
            <span style={{ color: isRetryHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
              Retry
            </span>
          </button>
        </div>
      </div>
    )
  }

  // Error boundary for the component
  if (error) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
            <div className="bw-header-actions">
              <button 
                className="bw-btn-outline" 
                onClick={() => useAuthStore.getState().logout()}
                style={{ marginLeft: 16 }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: 'var(--bw-error, #C5483D)', marginBottom: '16px' }}>
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-error, #C5483D)' }}>Error Loading Dashboard</h3>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>{error}</p>
          <button 
            className={`bw-btn bw-btn-action ${isTryAgainHovered ? 'custom-hover-border' : ''}`}
            onClick={() => {
              setError(null)
              load()
            }}
            onMouseEnter={() => setIsTryAgainHovered(true)}
            onMouseLeave={() => setIsTryAgainHovered(false)}
            style={{
              padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
              fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
              borderRadius: 7,
              border: isTryAgainHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
              borderColor: isTryAgainHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
              color: isTryAgainHovered ? 'rgba(155, 97, 209, 0.81)' : '#000',
              transition: 'all 0.2s ease'
            } as React.CSSProperties}
          >
            <span style={{ color: isTryAgainHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
              Try Again
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bw" style={{ position: 'relative', minHeight: '100vh', display: 'flex' }}>
      {/* Token Expiration Notification */}
      <TokenExpirationNotification />
      
      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar Menu - Left Aligned */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? (isMenuOpen ? '0' : '-100%') : (isMenuOpen ? '0' : '-20%'),
          width: isMobile ? '100%' : '20%',
          height: '100vh',
          backgroundColor: 'var(--bw-bg)',
          borderRight: '1px solid var(--bw-border)',
          zIndex: 999,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isMenuOpen ? 'var(--bw-shadow)' : 'none'
        }}
      >
        {/* Company Name in Sidebar */}
        <div style={{
          padding: 'clamp(16px, 2vw, 24px)',
          borderBottom: '1px solid var(--bw-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(12px, 2vw, 16px)',
            flex: 1,
            minWidth: 0
          }}>
            {info?.profile?.logo_url && (
              <img 
                src={info.profile.logo_url} 
                alt={info?.profile?.company_name || 'Company logo'}
                style={{
                  width: 'clamp(40px, 5vw, 50px)',
                  height: 'clamp(40px, 5vw, 50px)',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <h1 style={{ 
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: 300,
              margin: 0,
              color: 'var(--bw-text)',
              letterSpacing: '0.5px',
              lineHeight: '1.2',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {info?.profile?.company_name || 'Dashboard'}
            </h1>
          </div>
          <button
            className="bw-menu"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              minWidth: '40px',
              minHeight: '40px',
              flexShrink: 0
            }}
          >
            <XCircle className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Navigation Tabs in Sidebar */}
        <nav style={{
          flex: 1,
          padding: 'clamp(12px, 1.5vw, 20px) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as TabType)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 24px)',
                  backgroundColor: activeTab === tab.id ? 'var(--bw-bg-hover)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === tab.id ? '3px solid var(--bw-accent)' : '3px solid transparent',
                  color: 'var(--bw-text)',
                  cursor: 'pointer',
                  fontSize: 'clamp(13px, 1.5vw, 15px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <IconComponent className="w-4 h-4" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer Section in Sidebar */}
        <div style={{
          padding: 'clamp(12px, 1.5vw, 20px)',
          borderTop: '1px solid var(--bw-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginBottom: '4px'
          }}>
            <ThemeToggle />
          </div>
          <div style={{
            fontSize: 'clamp(11px, 1.2vw, 13px)',
            color: 'var(--bw-muted)',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 300
          }}>
            Welcome back, {info?.first_name}
          </div>
          <button
            onClick={() => setShowDriverModeConfirm(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: 'clamp(10px, 1.2vw, 12px) clamp(16px, 2vw, 24px)',
              backgroundColor: 'rgba(155, 97, 209, 0.81)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              borderRadius: 7,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(155, 97, 209, 0.81)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(155, 97, 209, 0.81)'
            }}
          >
            Switch to Driver Mode
          </button>
          <button
            onClick={() => {
              useAuthStore.getState().logout()
              setIsMenuOpen(false)
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: 'clamp(10px, 1.2vw, 12px) clamp(16px, 2vw, 24px)',
              backgroundColor: 'transparent',
              border: '1px solid var(--bw-border)',
              color: 'var(--bw-text)',
              cursor: 'pointer',
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300,
              borderRadius: 7,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        width: '100%',
        minHeight: '100vh'
      }}>
        <div className="bw-container" style={{ 
          padding: 'clamp(12px, 2vw, 24px) clamp(16px, 3vw, 32px)', 
          maxWidth: '100%' 
        }}>
          {/* Top Bar with Hamburger Menu */}
          <div style={{ 
            marginBottom: 'clamp(16px, 3vw, 32px)',
            paddingBottom: 'clamp(12px, 2vw, 16px)',
            borderBottom: '1px solid var(--bw-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Hamburger Menu Button - Left Aligned */}
            <button
              className="bw-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              <Menu className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Desktop: Show tabs inline (hidden on mobile) */}
            <div style={{ 
              display: isMobile ? 'none' : 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              flex: 1
            }}
            className="desktop-tabs"
            >
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`bw-tab ${activeTab === tab.id ? 'bw-tab-active' : ''}`}
                    onClick={() => {
                      handleTabClick(tab.id as TabType)
                      setIsMenuOpen(false)
                    }}
                    style={{
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                      fontWeight: 300
                    }}
                  >
                    <IconComponent className="w-4 h-4" style={{ width: 'clamp(14px, 2vw, 16px)', height: 'clamp(14px, 2vw, 16px)' }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Desktop Actions */}
            <div style={{ 
              display: isMobile ? 'none' : 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
            className="desktop-actions"
            >
              <ThemeToggle />
              <button 
                onClick={() => setShowDriverModeConfirm(true)}
                style={{ 
                  fontFamily: '"Work Sans", sans-serif',
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  fontWeight: 400,
                  backgroundColor: 'rgba(155, 97, 209, 0.81)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 97, 209, 0.81)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 97, 209, 0.81)'
                }}
              >
                Switch to Driver Mode
              </button>
              <button 
                className="bw-btn-outline" 
                onClick={() => useAuthStore.getState().logout()}
                style={{ 
                  fontFamily: '"Work Sans", sans-serif',
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                  fontWeight: 300
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bw-tab-content" style={{ fontFamily: '"Work Sans", sans-serif', fontWeight: 300 }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 3vw, 24px)' }}>
            {/* Today's KPIs - Big Cards */}
            {(() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const todayEnd = new Date(today)
              todayEnd.setHours(23, 59, 59, 999)
              
              const todayBookings = bookings.filter(b => {
                const pickupDate = new Date(b.pickup_time)
                return pickupDate >= today && pickupDate <= todayEnd
              })
              
              const activeRidesToday = todayBookings.filter(b => b.booking_status?.toLowerCase() === 'active').length
              const pendingBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
              const availableDrivers = drivers.filter(d => d.is_active).length
              const availableVehicles = vehicles.filter(v => v.status === 'active').length
              const todaysRevenue = todayBookings
                .filter(b => b.booking_status?.toLowerCase() === 'completed')
                .reduce((sum, b) => sum + (b.estimated_price || 0), 0)
              
              const kpiCards = [
                { value: activeRidesToday, label: 'Active Rides', isCurrency: false },
                { value: pendingBookings, label: 'Pending', isCurrency: false },
                { value: availableDrivers, label: 'Available Drivers', isCurrency: false },
                { value: availableVehicles, label: 'Available Vehicles', isCurrency: false },
                { value: todaysRevenue.toFixed(0), label: "Today's Revenue", isCurrency: true }
              ]
              
              const totalKpis = kpiCards.length
              
              const nextKpi = () => {
                setCurrentKpiIndex((prev) => (prev + 1) % totalKpis)
              }
              
              const prevKpi = () => {
                setCurrentKpiIndex((prev) => (prev - 1 + totalKpis) % totalKpis)
              }
              
              return (
                <div style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
                  {isMobile ? (
                    /* Mobile Carousel */
                    <div style={{ position: 'relative' }}>
                      {/* KPI Card */}
                      <div className="bw-card" style={{
                        padding: 'clamp(20px, 3vw, 32px)',
                        textAlign: 'center',
                        border: '1px solid var(--bw-border)',
                        minHeight: 'clamp(120px, 20vw, 160px)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          fontSize: 'clamp(32px, 6vw, 56px)',
                          fontWeight: 700,
                          color: 'var(--bw-text)',
                          lineHeight: 1.1,
                          marginBottom: 'clamp(4px, 1vw, 8px)',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {kpiCards[currentKpiIndex].isCurrency ? '$' : ''}{kpiCards[currentKpiIndex].value}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          fontWeight: 300,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {kpiCards[currentKpiIndex].label}
                        </div>
                      </div>
                      
                      {/* Navigation Buttons */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'clamp(12px, 2vw, 16px)',
                        gap: '12px'
                      }}>
                        <button
                          onClick={prevKpi}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'clamp(8px, 1.5vw, 12px)',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            border: '1px solid var(--bw-border)',
                            borderRadius: 7,
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '44px',
                            minHeight: '44px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                            e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--bw-border)'
                          }}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        {/* Dots Indicator */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          flex: 1,
                          justifyContent: 'center'
                        }}>
                          {kpiCards.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentKpiIndex(index)}
                              style={{
                                width: index === currentKpiIndex ? 'clamp(24px, 3vw, 32px)' : 'clamp(8px, 1.2vw, 10px)',
                                height: 'clamp(8px, 1.2vw, 10px)',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: index === currentKpiIndex ? 'var(--bw-text)' : 'var(--bw-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                padding: 0
                              }}
                            />
                          ))}
                        </div>
                        
                        <button
                          onClick={nextKpi}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'clamp(8px, 1.5vw, 12px)',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            border: '1px solid var(--bw-border)',
                            borderRadius: 7,
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '44px',
                            minHeight: '44px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                            e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--bw-border)'
                          }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Desktop Grid */
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 18vw, 200px), 1fr))',
                      gap: 'clamp(12px, 2vw, 20px)'
                    }}>
                      {/* Active Rides Today */}
                      <div className="bw-card" style={{
                        padding: 'clamp(20px, 3vw, 32px)',
                        textAlign: 'center',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div style={{
                          fontSize: 'clamp(32px, 6vw, 56px)',
                          fontWeight: 700,
                          color: 'var(--bw-text)',
                          lineHeight: 1.1,
                          marginBottom: 'clamp(4px, 1vw, 8px)',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {activeRidesToday}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          fontWeight: 300,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Active Rides
                        </div>
                      </div>

                      {/* Pending Bookings */}
                      <div className="bw-card" style={{
                        padding: 'clamp(20px, 3vw, 32px)',
                        textAlign: 'center',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div style={{
                          fontSize: 'clamp(32px, 6vw, 56px)',
                          fontWeight: 700,
                          color: 'var(--bw-text)',
                          lineHeight: 1.1,
                          marginBottom: 'clamp(4px, 1vw, 8px)',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {pendingBookings}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          fontWeight: 300,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Pending
                        </div>
                      </div>

                      {/* Available Drivers */}
                      <div className="bw-card" style={{
                        padding: 'clamp(20px, 3vw, 32px)',
                        textAlign: 'center',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div style={{
                          fontSize: 'clamp(32px, 6vw, 56px)',
                          fontWeight: 700,
                          color: 'var(--bw-text)',
                          lineHeight: 1.1,
                          marginBottom: 'clamp(4px, 1vw, 8px)',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {availableDrivers}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          fontWeight: 300,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Available
                        </div>
                      </div>

                      {/* Available Vehicles */}
                      <div className="bw-card" style={{
                        padding: 'clamp(20px, 3vw, 32px)',
                        textAlign: 'center',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div style={{
                          fontSize: 'clamp(32px, 6vw, 56px)',
                          fontWeight: 700,
                          color: 'var(--bw-text)',
                          lineHeight: 1.1,
                          marginBottom: 'clamp(4px, 1vw, 8px)',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {availableVehicles}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          fontWeight: 300,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Available
                        </div>
                      </div>

                      {/* Today's Revenue */}
                      <div className="bw-card" style={{
                        padding: 'clamp(20px, 3vw, 32px)',
                        textAlign: 'center',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div style={{
                          fontSize: 'clamp(28px, 5vw, 48px)',
                          fontWeight: 700,
                          color: 'var(--bw-text)',
                          lineHeight: 1.1,
                          marginBottom: 'clamp(4px, 1vw, 8px)',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          ${todaysRevenue.toFixed(0)}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          fontWeight: 300,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Today's Revenue
                        </div>
                      </div>
        </div>
      )}

      {/* Switch to Driver Mode Confirmation Modal */}
      {showDriverModeConfirm && (
        <div className="bw-modal-overlay" onClick={() => setShowDriverModeConfirm(false)}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '500px',
            width: '90vw'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Switch to Driver Mode
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => setShowDriverModeConfirm(false)}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{
                  margin: 0,
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  color: 'var(--bw-text)',
                  lineHeight: 1.6
                }}>
                  You are about to switch to Driver Mode. This will change your view to the driver interface where you can manage your driver profile, view assigned bookings, and access driver-specific features.
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  color: 'var(--bw-text)',
                  lineHeight: 1.6
                }}>
                  Do you want to continue?
                </p>
              </div>
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                className="bw-btn-outline"
                onClick={() => setShowDriverModeConfirm(false)}
                style={{
                  padding: 'clamp(10px, 1.5vw, 14px) clamp(16px, 3vw, 24px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  borderRadius: 7
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement driver mode switch
                  setShowDriverModeConfirm(false)
                }}
                style={{
                  padding: 'clamp(10px, 1.5vw, 14px) clamp(16px, 3vw, 24px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 400,
                  borderRadius: 7,
                  backgroundColor: 'rgba(155, 97, 209, 0.81)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 97, 209, 0.81)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(155, 97, 209, 0.81)'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})()}

            {/* Summary Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 15vw, 180px), 1fr))',
              gap: 'clamp(12px, 2vw, 20px)',
              marginBottom: 'clamp(16px, 3vw, 24px)'
            }}>
              <div className="bw-card" style={{
                padding: 'clamp(16px, 2.5vw, 24px)',
                textAlign: 'center',
                border: '1px solid var(--bw-border)'
              }}>
                <div style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 600,
                  color: 'var(--bw-text)',
                  marginBottom: 'clamp(4px, 1vw, 6px)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {drivers.length}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  fontWeight: 300,
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Total Drivers
                </div>
              </div>

              <div className="bw-card" style={{
                padding: 'clamp(16px, 2.5vw, 24px)',
                textAlign: 'center',
                border: '1px solid var(--bw-border)'
              }}>
                <div style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 600,
                  color: 'var(--bw-text)',
                  marginBottom: 'clamp(4px, 1vw, 6px)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {vehicles.length}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  fontWeight: 300,
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Total Vehicles
                </div>
              </div>

              <div className="bw-card" style={{
                padding: 'clamp(16px, 2.5vw, 24px)',
                textAlign: 'center',
                border: '1px solid var(--bw-border)'
              }}>
                <div style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 600,
                  color: 'var(--bw-text)',
                  marginBottom: 'clamp(4px, 1vw, 6px)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {bookings.length}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  color: 'var(--bw-muted)',
                  fontWeight: 300,
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Total Bookings
                </div>
              </div>
            </div>

            {/* Company Info and Recent Bookings Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40vw, 500px), 1fr))',
              gap: 'clamp(16px, 3vw, 24px)'
            }}>
              {/* Company Information */}
              <div className="bw-card" style={{
                padding: 'clamp(16px, 2.5vw, 24px)',
                border: '1px solid var(--bw-border)'
              }}>
                <h3 style={{ 
                  margin: '0 0 clamp(12px, 2vw, 16px) 0',
                  fontSize: 'clamp(16px, 2.5vw, 20px)',
                  fontWeight: 400,
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Company Information
                </h3>
                <div className="bw-info-grid" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 1.5vw, 12px)'
                }}>
                  <div className="bw-info-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: 'clamp(6px, 1vw, 8px)',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif'
                    }}>Company Name:</span>
                    <span className="bw-info-value" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      fontFamily: '"Work Sans", sans-serif'
                    }}>{info?.profile?.company_name}</span>
                  </div>
                  <div className="bw-info-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: 'clamp(6px, 1vw, 8px)',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif'
                    }}>City:</span>
                    <span className="bw-info-value" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      fontFamily: '"Work Sans", sans-serif'
                    }}>{info?.profile?.city}</span>
                  </div>
                  <div className="bw-info-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: 'clamp(6px, 1vw, 8px)',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <span className="bw-info-label" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif'
                    }}>Status:</span>
                    <span className={`bw-info-value ${info?.profile?.subscription_status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      fontFamily: '"Work Sans", sans-serif'
                    }}>
                      {info?.profile?.subscription_status === 'active' ? 'Active' : info?.profile?.subscription_status || 'Free'}
                    </span>
                  </div>
                  <div className="bw-info-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span className="bw-info-label" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif'
                    }}>Member Since:</span>
                    <span className="bw-info-value" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontWeight: 300,
                      fontFamily: '"Work Sans", sans-serif'
                    }}>
                      {new Date(info?.created_on).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bw-card" style={{
                padding: 'clamp(16px, 2.5vw, 24px)',
                border: '1px solid var(--bw-border)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: 'clamp(12px, 2vw, 16px)' 
                }}>
                  <h3 style={{ 
                    margin: 0,
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    fontWeight: 400,
                    fontFamily: '"Work Sans", sans-serif'
                  }}>
                    Recent Bookings
                  </h3>
                  <button 
                    className={`bw-btn-outline ${isViewAllHovered ? 'custom-hover-border' : ''}`}
                    onClick={() => handleTabClick('bookings')}
                    onMouseEnter={() => setIsViewAllHovered(true)}
                    onMouseLeave={() => setIsViewAllHovered(false)}
                    style={{
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : 'clamp(10px, 1.2vw, 12px)',
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : 'clamp(4px, 0.8vw, 6px) clamp(8px, 1.5vw, 12px)',
                      fontWeight: 600,
                      fontFamily: '"Work Sans", sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isViewAllHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                      borderColor: isViewAllHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      color: isViewAllHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isViewAllHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      View All
                    </span>
                  </button>
                </div>
              <div className="bw-recent-list" style={{
                maxHeight: 'clamp(360px, 45vh, 450px)',
                overflowY: showMoreBookings ? 'auto' : 'hidden',
                overflowX: 'hidden',
                paddingRight: showMoreBookings ? '8px' : '0'
              }}>
                {bookings.length === 0 ? (
                  <div className="bw-empty-state" style={{ padding: '24px', textAlign: 'center' }}>
                    <Calendar className="w-8 h-8" style={{ color: '#9ca3af', marginBottom: '8px' }} />
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>No bookings yet</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Bookings will appear here</div>
                  </div>
                ) : (
                  <>
                    {/* Show bookings - first 3 if collapsed, all if expanded */}
                    {(showMoreBookings ? bookings : bookings.slice(0, 3)).map((booking) => (
                      <div 
                        key={booking.id} 
                        className="bw-recent-item" 
                        onClick={() => handleBookingClick(booking.id)}
                        style={{ 
                          border: '1px solid var(--bw-border)', 
                          borderRadius: '8px', 
                          padding: '12px', 
                          marginBottom: '8px',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover-strong)'
                          e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                          e.currentTarget.style.borderColor = 'var(--bw-border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              padding: '4px', 
                              borderRadius: '4px',
                              color: 'var(--bw-text)',
                              background: 'transparent'
                            }}>
                              <MapPin className="w-3 h-3" style={{ color: 'var(--bw-text)' }} />
                            </div>
                            <div>
                              <div className="bw-recent-title" style={{ 
                                fontWeight: '600', 
                                fontSize: '14px', 
                                color: 'var(--bw-text)',
                                marginBottom: '2px'
                              }}>
                                {booking.pickup_location} → {booking.dropoff_location}
                              </div>
                              <div className="bw-recent-meta" style={{ 
                                fontSize: '12px', 
                                color: 'var(--bw-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span>{new Date(booking.pickup_time).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{booking.service_type || 'Standard'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bw-recent-status">
                            {getStatusIcon(booking.booking_status)}
                          </div>
                        </div>
                        
                        {/* Additional Booking Details */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                          gap: '8px', 
                          fontSize: '12px',
                          color: '#6b7280',
                          borderTop: '1px solid #f3f4f6',
                          paddingTop: '8px'
                        }}>
                          {!isMobile && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Customer:</span> {booking.customer_name || 'Anonymous Customer'}
                            </div>
                          )}
                          {!isMobile && (
                            <div>
                              <span style={{ fontWeight: '500' }}>Driver:</span> {booking.driver_name && booking.driver_name !== 'None' ? booking.driver_name : 'No assigned driver'}
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: '500' }}>Vehicle:</span> {booking.vehicle || 'N/A'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Fare:</span> ${booking.estimated_price || '0.00'}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Toggle button to show more/less bookings */}
                    {bookings.length > 3 && (
                      <div style={{ 
                        border: '1px dashed #d1d5db', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setShowMoreBookings(!showMoreBookings)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6'
                        e.currentTarget.style.borderColor = '#9ca3af'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                        e.currentTarget.style.borderColor = '#d1d5db'
                      }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          <Calendar className="w-4 h-4" />
                          <span>
                            {showMoreBookings 
                              ? `Show Less` 
                              : `View ${bookings.length - 3} more bookings`}
                          </span>
                          {showMoreBookings ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <span style={{ fontSize: '12px' }}>→</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Quick Stats Summary */}
              {bookings.length > 0 && (
                <div style={{ 
                  marginTop: 'clamp(12px, 2vw, 16px)', 
                  padding: 'clamp(10px, 1.5vw, 12px)', 
                  backgroundColor: 'var(--bw-bg-secondary)', 
                  borderRadius: '6px',
                  border: '1px solid var(--bw-border)'
                }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 'clamp(8px, 1.5vw, 12px)',
                    fontSize: 'clamp(11px, 1.3vw, 12px)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontWeight: 400, 
                        color: 'var(--bw-text)',
                        fontFamily: '"Work Sans", sans-serif',
                        marginBottom: '4px'
                      }}>
                        {bookings.filter(b => b.booking_status === 'completed').length}
                      </div>
                      <div style={{ 
                        color: 'var(--bw-muted)',
                        fontWeight: 300,
                        fontFamily: '"Work Sans", sans-serif'
                      }}>
                        Completed
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontWeight: 400, 
                        color: 'var(--bw-text)',
                        fontFamily: '"Work Sans", sans-serif',
                        marginBottom: '4px'
                      }}>
                        {bookings.filter(b => b.booking_status === 'active').length}
                      </div>
                      <div style={{ 
                        color: 'var(--bw-muted)',
                        fontWeight: 300,
                        fontFamily: '"Work Sans", sans-serif'
                      }}>
                        Active
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontWeight: 400, 
                        color: 'var(--bw-text)',
                        fontFamily: '"Work Sans", sans-serif',
                        marginBottom: '4px'
                      }}>
                        {bookings.filter(b => b.booking_status === 'pending').length}
                      </div>
                      <div style={{ 
                        color: 'var(--bw-muted)',
                        fontWeight: 300,
                        fontFamily: '"Work Sans", sans-serif'
                      }}>
                        Pending
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div className="bw-content">
            <div className="bw-content-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>Driver Management</h3>
              <button 
                className={`bw-btn bw-btn-action ${isAddDriverHovered ? 'custom-hover-border' : ''}`}
                onClick={() => setShowAddDriver(true)}
                onMouseEnter={() => setIsAddDriverHovered(true)}
                onMouseLeave={() => setIsAddDriverHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isAddDriverHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <Plus className="w-4 h-4" style={{ 
                  width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                  height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                  color: isAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit',
                  fill: isAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor'
                }} />
                <span style={{ color: isAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  Add Driver
                </span>
              </button>
            </div>

            <div className="bw-card" style={{
              padding: 'clamp(16px, 3vw, 24px)',
              border: '1px solid var(--bw-border)',
              borderRadius: '12px'
            }}>
              {isMobile ? (
                /* Mobile Card Layout */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
                  {drivers.length === 0 ? (
                    <div className="bw-empty-state" style={{
                      padding: 'clamp(24px, 4vw, 48px)',
                      textAlign: 'center'
                    }}>
                      <div className="bw-empty-icon" style={{
                        marginBottom: 'clamp(12px, 2vw, 16px)',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <User className="w-8 h-8" style={{ 
                          width: 'clamp(32px, 5vw, 48px)', 
                          height: 'clamp(32px, 5vw, 48px)',
                          color: 'var(--bw-muted)'
                        }} />
                      </div>
                      <div className="bw-empty-text" style={{
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        color: 'var(--bw-text)',
                        marginBottom: 'clamp(8px, 1.5vw, 12px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 500
                      }}>No drivers yet</div>
                      <div className="bw-empty-subtext" style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: 'var(--bw-muted)',
                        fontFamily: '"Work Sans", sans-serif'
                      }}>Add your first driver to get started</div>
                    </div>
                  ) : (
                    drivers.map((driver) => (
                      <div 
                        key={driver.id} 
                        onClick={() => handleDriverClick(driver.id)}
                        style={{ 
                          cursor: 'pointer',
                          border: '1px solid var(--bw-border)',
                          borderRadius: 'clamp(8px, 1.5vw, 12px)',
                          padding: 'clamp(16px, 3vw, 24px)',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover-strong)'
                          e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                          e.currentTarget.style.borderColor = 'var(--bw-border)'
                        }}
                      >
                        {/* Driver Name and Avatar */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 'clamp(12px, 2vw, 16px)',
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          <div style={{
                            width: 'clamp(40px, 5vw, 50px)',
                            height: 'clamp(40px, 5vw, 50px)',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bw-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--bw-border)',
                            flexShrink: 0
                          }}>
                            <User className="w-5 h-5" style={{ 
                              width: 'clamp(18px, 2.5vw, 20px)',
                              height: 'clamp(18px, 2.5vw, 20px)',
                              color: 'var(--bw-text)' 
                            }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: 'clamp(18px, 3vw, 22px)',
                              fontWeight: 600,
                              color: 'var(--bw-text)',
                              marginBottom: 'clamp(4px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              lineHeight: 1.2
                            }}>
                              {driver.first_name} {driver.last_name}
                            </div>
                            <div style={{ 
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {driver.email}
                            </div>
                          </div>
                        </div>

                        {/* Driver Details Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'clamp(12px, 2vw, 16px)',
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          {/* Contact */}
                          <div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              marginBottom: 'clamp(6px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              Contact
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'clamp(6px, 1.5vw, 8px)',
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-text)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <Phone className="w-3 h-3" style={{ 
                                width: 'clamp(14px, 2vw, 16px)',
                                height: 'clamp(14px, 2vw, 16px)',
                                color: 'var(--bw-muted)' 
                              }} />
                              {driver.phone_no}
                            </div>
                          </div>

                          {/* Rides */}
                          <div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              marginBottom: 'clamp(6px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              Completed Rides
                            </div>
                            <div style={{
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-text)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 600
                            }}>
                              {driver.completed_rides}
                            </div>
                          </div>
                        </div>

                        {/* Badges Row */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 'clamp(8px, 1.5vw, 10px)',
                          alignItems: 'center'
                        }}>
                          <span className={`bw-badge ${driver.driver_type === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`} style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            {driver.driver_type === 'in_house' ? 'In-House' : 'Outsourced'}
                          </span>
                          <span className={`bw-badge ${driver.is_active ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            {driver.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`bw-badge ${driver.is_registered === 'registered' ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            {driver.is_registered === 'registered' ? 'Registered' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Desktop Table Layout */
                <div className="bw-table">
                  <div className="bw-table-header">
                    <div className="bw-table-cell">Driver</div>
                    <div className="bw-table-cell">Contact</div>
                    <div className="bw-table-cell">Type</div>
                    <div className="bw-table-cell">Status</div>
                    <div className="bw-table-cell">Registration</div>
                    <div className="bw-table-cell">Rides</div>
                  </div>
                  {drivers.length === 0 ? (
                    <div className="bw-empty-state">
                      <div className="bw-empty-icon">
                        <User className="w-8 h-8" />
                      </div>
                      <div className="bw-empty-text">No drivers yet</div>
                      <div className="bw-empty-subtext">Add your first driver to get started</div>
                    </div>
                  ) : (
                    drivers.map((driver) => (
                      <div 
                        key={driver.id} 
                        className="bw-table-row"
                        onClick={() => handleDriverClick(driver.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="bw-table-cell">
                          <div className="bw-user-info">
                            <div className="bw-user-avatar">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="bw-user-name">{driver.first_name} {driver.last_name}</div>
                              <div className="bw-user-email">{driver.email}</div>
                            </div>
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-contact-info">
                            <div className="bw-contact-item">
                              <Phone className="w-3 h-3" />
                              {driver.phone_no}
                            </div>
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <span className={`bw-badge ${driver.driver_type === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`}>
                            {driver.driver_type === 'in_house' ? 'In-House' : 'Outsourced'}
                          </span>
                        </div>
                        <div className="bw-table-cell">
                          <span className={`bw-badge ${driver.is_active ? 'bw-badge-success' : 'bw-badge-warning'}`}>
                            {driver.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="bw-table-cell">
                          <span className={`bw-badge ${driver.is_registered === 'registered' ? 'bw-badge-success' : 'bw-badge-warning'}`}>
                            {driver.is_registered === 'registered' ? 'Registered' : 'Pending'}
                          </span>
                        </div>
                        <div className="bw-table-cell">
                          {driver.completed_rides}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bw-content">
            <div className="bw-content-header" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>Booking Management</h3>
              <div style={{ 
                display: 'flex', 
                gap: 'clamp(8px, 1.5vw, 12px)', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span className="bw-text-muted" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Total: {bookings.length} • 
                  Completed: {bookings.filter(b => b.booking_status === 'completed').length} • 
                  Active: {bookings.filter(b => b.booking_status === 'active').length} • 
                  Pending: {bookings.filter(b => b.booking_status === 'pending').length}
                </span>
              </div>
            </div>

            <div className="bw-card" style={{
              padding: 'clamp(16px, 3vw, 24px)',
              border: '1px solid var(--bw-border)',
              borderRadius: '12px'
            }}>
              {isMobile ? (
                /* Mobile Card Layout */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
                  {bookings.length === 0 ? (
                    <div className="bw-empty-state" style={{
                      padding: 'clamp(24px, 4vw, 48px)',
                      textAlign: 'center'
                    }}>
                      <div className="bw-empty-icon" style={{
                        marginBottom: 'clamp(12px, 2vw, 16px)',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <Calendar className="w-8 h-8" style={{ 
                          width: 'clamp(32px, 5vw, 48px)', 
                          height: 'clamp(32px, 5vw, 48px)',
                          color: 'var(--bw-muted)'
                        }} />
                      </div>
                      <div className="bw-empty-text" style={{
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        color: 'var(--bw-text)',
                        marginBottom: 'clamp(8px, 1.5vw, 12px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 500
                      }}>No bookings yet</div>
                      <div className="bw-empty-subtext" style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: 'var(--bw-muted)',
                        fontFamily: '"Work Sans", sans-serif'
                      }}>Bookings will appear here once riders start using your service</div>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        onClick={() => handleBookingClick(booking.id)}
                        style={{ 
                          cursor: 'pointer',
                          border: '1px solid var(--bw-border)',
                          borderRadius: 'clamp(8px, 1.5vw, 12px)',
                          padding: 'clamp(16px, 3vw, 24px)',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover-strong)'
                          e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                          e.currentTarget.style.borderColor = 'var(--bw-border)'
                        }}
                      >
                        {/* Booking ID and Status */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 'clamp(12px, 2vw, 16px)',
                          paddingBottom: 'clamp(12px, 2vw, 16px)',
                          borderBottom: '1px solid var(--bw-border)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(18px, 3vw, 22px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            #{booking.id}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
                            {getStatusIcon(booking.booking_status)}
                            <span className={getStatusColor(booking.booking_status)} style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Customer Name */}
                        <div style={{
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: 'var(--bw-muted)',
                            marginBottom: 'clamp(4px, 1vw, 6px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500
                          }}>
                            Customer
                          </div>
                          <div style={{
                            fontSize: 'clamp(16px, 2.5vw, 18px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            {booking.customer_name || 'Anonymous Customer'}
                          </div>
                        </div>

                        {/* Route Information */}
                        <div style={{
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: 'var(--bw-muted)',
                            marginBottom: 'clamp(8px, 1.5vw, 12px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500
                          }}>
                            Route
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(8px, 1.5vw, 10px)'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 'clamp(8px, 1.5vw, 10px)',
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-text)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <MapPin className="w-4 h-4" style={{
                                width: 'clamp(16px, 2.5vw, 18px)',
                                height: 'clamp(16px, 2.5vw, 18px)',
                                color: 'var(--bw-muted)',
                                marginTop: '2px',
                                flexShrink: 0
                              }} />
                              <span><strong>From:</strong> {booking.pickup_location}</span>
                            </div>
                            {booking.dropoff_location && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'clamp(8px, 1.5vw, 10px)',
                                fontSize: 'clamp(14px, 2vw, 16px)',
                                color: 'var(--bw-text)',
                                fontFamily: '"Work Sans", sans-serif'
                              }}>
                                <MapPin className="w-4 h-4" style={{
                                  width: 'clamp(16px, 2.5vw, 18px)',
                                  height: 'clamp(16px, 2.5vw, 18px)',
                                  color: 'var(--bw-muted)',
                                  marginTop: '2px',
                                  flexShrink: 0
                                }} />
                                <span><strong>To:</strong> {booking.dropoff_location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'clamp(12px, 2vw, 16px)',
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          {/* Service Type */}
                          <div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              marginBottom: 'clamp(6px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              Service
                            </div>
                            <span className="bw-badge bw-badge-secondary" style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {booking.service_type || 'Standard'}
                            </span>
                          </div>

                          {/* Date & Time */}
                          <div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              marginBottom: 'clamp(6px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              Date & Time
                            </div>
                            <div style={{
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-text)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {new Date(booking.pickup_time).toLocaleDateString()}
                            </div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif',
                              marginTop: 'clamp(2px, 0.5vw, 4px)'
                            }}>
                              {new Date(booking.pickup_time).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        {/* Driver, Vehicle, and Fare */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(8px, 1.5vw, 10px)',
                          paddingTop: 'clamp(12px, 2vw, 16px)',
                          borderTop: '1px solid var(--bw-border)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <strong>Vehicle:</strong> {booking.vehicle || 'N/A'}
                            </div>
                            <div style={{
                              fontSize: 'clamp(18px, 3vw, 22px)',
                              fontWeight: 700,
                              color: '#059669',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              ${booking.estimated_price || '0.00'}
                            </div>
                          </div>
                          {booking.driver_name && booking.driver_name !== 'None' && (
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <strong>Driver:</strong> {booking.driver_name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Desktop Table Layout */
                <div className="bw-table">
                  <div className="bw-table-header">
                    <div className="bw-table-cell">Booking ID</div>
                    <div className="bw-table-cell">Customer & Route</div>
                    <div className="bw-table-cell">Service Details</div>
                    <div className="bw-table-cell">Date & Time</div>
                    <div className="bw-table-cell">Driver & Vehicle</div>
                    <div className="bw-table-cell">Status</div>
                    <div className="bw-table-cell">Fare</div>
                  </div>
                  {bookings.length === 0 ? (
                    <div className="bw-empty-state">
                      <div className="bw-empty-icon">
                        <Calendar className="w-8 h-8" />
                      </div>
                      <div className="bw-empty-text">No bookings yet</div>
                      <div className="bw-empty-subtext">Bookings will appear here once riders start using your service</div>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="bw-table-row"
                        onClick={() => handleBookingClick(booking.id)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div className="bw-table-cell">
                          <div style={{ fontWeight: '600', color: '#374151' }}>
                            #{booking.id}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-route-info">
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ fontWeight: '500', color: '#111827' }}>
                                {booking.customer_name || 'Anonymous Customer'}
                              </span>
                            </div>
                            <div className="bw-route-item" style={{ fontSize: '12px', color: '#6b7280' }}>
                              <MapPin className="w-3 h-3" />
                              <span style={{ marginLeft: '4px' }}>From: {booking.pickup_location}</span>
                            </div>
                            {booking.dropoff_location && (
                              <div className="bw-route-item" style={{ fontSize: '12px', color: '#6b7280' }}>
                                <MapPin className="w-3 h-3" />
                                <span style={{ marginLeft: '4px' }}>To: {booking.dropoff_location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="bw-badge bw-badge-secondary" style={{ fontSize: '11px' }}>
                              {booking.service_type || 'Standard'}
                            </span>
                            {booking.estimated_duration && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                Est: {booking.estimated_duration} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-datetime-info">
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {new Date(booking.pickup_time).toLocaleDateString()}
                            </div>
                            <div className="bw-text-muted" style={{ fontSize: '12px' }}>
                              {new Date(booking.pickup_time).toLocaleTimeString()}
                            </div>
                            {booking.dropoff_time && (
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                Drop: {new Date(booking.dropoff_time).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ fontWeight: '500' }}>Driver:</span> {booking.driver_name && booking.driver_name !== 'None' ? booking.driver_name : 'No assigned driver'}
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ fontWeight: '500' }}>Vehicle:</span> {booking.vehicle || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {getStatusIcon(booking.booking_status)}
                            <span className={getStatusColor(booking.booking_status)} style={{ fontSize: '12px' }}>
                              {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ fontWeight: '600', color: '#059669' }}>
                            ${booking.estimated_price || '0.00'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="bw-content">
            <div className="bw-content-header" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: isMobile ? 400 : 200,
                fontFamily: isMobile ? '"DM Sans", sans-serif' : '"DM Sans", sans-serif',
                color: 'var(--bw-text)'
              }}>Vehicle Management</h3>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 'clamp(8px, 1.5vw, 12px)',
                width: isMobile ? '100%' : 'auto'
              }}>
                <button 
                  className={`bw-btn bw-btn-action ${isAssignDriverHovered ? 'custom-hover-border' : ''}`}
                  onClick={() => setShowAssignDriver(true)}
                  onMouseEnter={() => setIsAssignDriverHovered(true)}
                  onMouseLeave={() => setIsAssignDriverHovered(false)}
                  style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isAssignDriverHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                      borderColor: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      color: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <Plus className="w-4 h-4" style={{ 
                    width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                    height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                    color: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit',
                    fill: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor' 
                  }} />
                  <span style={{ color: isAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    Assign Driver
                  </span>
                </button>
                <div 
                  style={{
                    position: 'relative',
                    marginLeft: isMobile ? 0 : 16,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <button 
                    className={`bw-btn bw-btn-action ${isAddVehicleHovered ? 'custom-hover-border' : ''}`}
                    onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
                    onMouseEnter={() => setIsAddVehicleHovered(true)}
                    onMouseLeave={() => setIsAddVehicleHovered(false)}
                    style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isAddVehicleHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                      borderColor: isAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      color: isAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <Plus className="w-4 h-4" style={{ 
                      width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
                      height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                      color: isAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit',
                      fill: isAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor'
                    }} />
                    <span style={{ color: isAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      Add Vehicle
                    </span>
                  </button>
                  
                  {showAddVehicleForm && (
                    <>
                      {isMobile && (
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 999
                          }}
                          onClick={() => {
                            if (!addingVehicle && !addVehicleSuccess) {
                              setShowAddVehicleForm(false)
                            }
                          }}
                        />
                      )}
                      <div 
                        style={{
                          position: isMobile ? 'fixed' : 'absolute',
                          top: isMobile ? '50%' : '100%',
                          left: isMobile ? '50%' : 'auto',
                          right: isMobile ? 'auto' : 0,
                          transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                          marginTop: isMobile ? 0 : '8px',
                          width: isMobile ? '90vw' : '500px',
                          maxWidth: '90vw',
                          backgroundColor: 'var(--bw-bg)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '8px',
                          padding: '24px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          zIndex: 1000,
                          maxHeight: '80vh',
                          overflowY: 'auto'
                        }}
                      >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '20px',
                          fontWeight: 600,
                          fontFamily: '"Work Sans", sans-serif',
                          color: 'var(--bw-text)'
                        }}>Add New Vehicle</h4>
                        <button
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
                              seating_capacity: 4
                            })
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--bw-text)'
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {addVehicleSuccess && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: '#d1fae5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '4px',
                          color: '#065f46',
                          fontSize: '14px',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Vehicle added successfully!
                        </div>
                      )}

                      {addVehicleError && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          color: '#dc2626',
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
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Make *
                              </label>
                              <select
                                value={newVehicle.make}
                                onChange={(e) => handleNewVehicleChange('make', e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              >
                                <option value="">Select Make</option>
                                {vehicleMakes.map((make) => (
                                  <option key={make} value={make}>{make}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Model *
                              </label>
                              <select
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
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)',
                                  opacity: !newVehicle.make ? 0.5 : 1
                                }}
                              >
                                <option value="">
                                  {newVehicle.make ? 'Select Model' : 'Select Make First'}
                                </option>
                                {newVehicle.make && getVehicleModels(newVehicle.make).map((model) => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Year
                              </label>
                              <input
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
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                License Plate
                              </label>
                              <input
                                type="text"
                                value={newVehicle.license_plate}
                                onChange={(e) => handleNewVehicleChange('license_plate', e.target.value)}
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Color
                              </label>
                              <input
                                type="text"
                                value={newVehicle.color}
                                onChange={(e) => handleNewVehicleChange('color', e.target.value)}
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Seating Capacity
                              </label>
                              <input
                                type="number"
                                value={newVehicle.seating_capacity}
                                onChange={(e) => handleNewVehicleChange('seating_capacity', parseInt(e.target.value) || 4)}
                                min="1"
                                max="50"
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="small-muted" style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontFamily: '"Work Sans", sans-serif',
                              fontSize: '13px',
                              color: 'var(--bw-muted)'
                            }}>
                              Vehicle Category *
                            </label>
                            <select
                              value={newVehicle.vehicle_category}
                              onChange={(e) => handleNewVehicleChange('vehicle_category', e.target.value)}
                              required
                              style={{
                                width: '100%',
                                padding: '16px 18px 16px 18px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '14px',
                                border: '1px solid var(--bw-border)',
                                borderRadius: 0,
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

                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Flat Rate ($) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={newVehicle.vehicle_flat_rate}
                                onChange={(e) => handleNewVehicleChange('vehicle_flat_rate', e.target.value)}
                                required
                                min="0"
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 0,
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Status
                              </label>
                              <select
                                value={newVehicle.status}
                                onChange={(e) => handleNewVehicleChange('status', e.target.value)}
                                style={{
                                  width: 'calc(35ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 0,
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
                            <button
                              type="submit"
                              disabled={addingVehicle}
                              className={`bw-btn bw-btn-action ${isAddVehicleFormHovered ? 'custom-hover-border' : ''}`}
                              onMouseEnter={() => !addingVehicle && setIsAddVehicleFormHovered(true)}
                              onMouseLeave={() => setIsAddVehicleFormHovered(false)}
                              style={{
                                flex: 1,
                                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontWeight: 600,
                                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                                borderRadius: 7,
                                border: isAddVehicleFormHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                                borderColor: isAddVehicleFormHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                                cursor: addingVehicle ? 'not-allowed' : 'pointer',
                                opacity: addingVehicle ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                                justifyContent: 'center',
                                color: isAddVehicleFormHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                                transition: 'all 0.2s ease'
                              } as React.CSSProperties}
                            >
                              <span style={{ color: isAddVehicleFormHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                                {addingVehicle ? 'Adding...' : 'Add Vehicle'}
                              </span>
                            </button>
                            <button
                              type="button"
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
                                  seating_capacity: 4
                                })
                              }}
                              className={`bw-btn-outline ${isCancelAddVehicleHovered ? 'custom-hover-border' : ''}`}
                              onMouseEnter={() => setIsCancelAddVehicleHovered(true)}
                              onMouseLeave={() => setIsCancelAddVehicleHovered(false)}
                              style={{
                                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontWeight: 600,
                                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                                borderRadius: 7,
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                                justifyContent: 'center',
                                border: isCancelAddVehicleHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                                borderColor: isCancelAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                                color: isCancelAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                                transition: 'all 0.2s ease'
                              } as React.CSSProperties}
                            >
                              <span style={{ color: isCancelAddVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                                Cancel
                              </span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="bw-card" style={{
                padding: 'clamp(16px, 3vw, 24px)',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px'
              }}>
                <div className="bw-empty-state" style={{
                  padding: 'clamp(24px, 4vw, 48px)',
                  textAlign: 'center'
                }}>
                  <div className="bw-empty-icon" style={{
                    marginBottom: 'clamp(12px, 2vw, 16px)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Car className="w-8 h-8" style={{ 
                      width: 'clamp(32px, 5vw, 48px)', 
                      height: 'clamp(32px, 5vw, 48px)',
                      color: 'var(--bw-muted)'
                    }} />
                  </div>
                  <div className="bw-empty-text" style={{
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    color: 'var(--bw-text)',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 500
                  }}>No vehicles yet</div>
                  <div className="bw-empty-subtext" style={{
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif'
                  }}>Add vehicles to your fleet to start accepting rides</div>
                </div>
              </div>
            ) : (
              <div 
                className="bw-vehicle-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                  gap: isMobile ? 'clamp(16px, 3vw, 24px)' : '24px'
                }}
              >
                {vehicles.map((vehicle) => {
                  // Get the first available image from vehicle_images
                  const firstImage = vehicle.vehicle_images 
                    ? Object.values(vehicle.vehicle_images)[0] 
                    : null
                  
                  // Get category name from vehicleCategories
                  const category = vehicleCategories.find(
                    cat => cat.id === vehicle.vehicle_category_id
                  )?.vehicle_category || 'N/A'
                  
                  return (
                    <div 
                      key={vehicle.id} 
                      className="bw-card"
                      style={{
                        borderRadius: 'clamp(8px, 1.5vw, 12px)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        padding: 0,
                        height: '100%',
                        transform: 'none',
                        border: '1px solid var(--bw-border)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                        e.currentTarget.style.transform = 'none'
                      }}
                      onClick={() => {
                        setEditingVehicleId(vehicle.id)
                        setShowVehicleEditModal(true)
                      }}
                    >
                      {/* Vehicle Image */}
                      <VehicleImageCard 
                        imageUrl={firstImage}
                        make={vehicle.make}
                        model={vehicle.model}
                      />
                      
                      {/* Vehicle Info */}
                      <div style={{
                        padding: 'clamp(16px, 3vw, 24px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(12px, 2vw, 16px)',
                        flex: 1
                      }}>
                        {/* Title */}
                        <div style={{
                          fontSize: isMobile ? 'clamp(18px, 3vw, 22px)' : '16px',
                          fontWeight: 600,
                          color: 'var(--bw-text)',
                          lineHeight: 1.3,
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        
                        {/* Category */}
                        <div>
                          <span className="bw-badge bw-badge-secondary" style={{
                            fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px',
                            padding: isMobile ? 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)' : '4px 8px',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            {category}
                          </span>
                        </div>
                        
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bw-content">
            <div className="bw-content-header">
              <h3>Tenant Settings</h3>
            </div>

            <div className="bw-card">
              <h4 style={{ margin: '0 0 16px 0' }}>Account Information</h4>
              <div className="bw-info-grid">
                <div className="bw-info-item">
                  <span className="bw-info-label">Email:</span>
                  <span className="bw-info-value">{info?.email}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Phone:</span>
                  <span className="bw-info-value">{info?.phone_no}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Address:</span>
                  <span className="bw-info-value">{info?.profile?.address || 'Not provided'}</span>
                </div>
                <div className="bw-info-item">
                  <span className="bw-info-label">Stripe Customer ID:</span>
                  <span className="bw-info-value">{info?.profile?.stripe_customer_id || 'Not connected'}</span>
                </div>
              </div>
            </div>

            <div className="bw-card">
              <h4 style={{ margin: '0 0 16px 0' }}>System Tools</h4>
              <div className="bw-info-grid">
                <div className="bw-info-item">
                  <span className="bw-info-label">Frontend Logs:</span>
                  <div className="bw-info-value">
                    <button 
                      className={`bw-btn-outline ${isDownloadLogsHovered ? 'custom-hover-border' : ''}`}
                      onClick={() => {
                        if (window.maisonLogs) {
                          window.maisonLogs.downloadLogs()
                        } else {
                          console.error('Logging system not available')
                        }
                      }}
                      onMouseEnter={() => setIsDownloadLogsHovered(true)}
                      onMouseLeave={() => setIsDownloadLogsHovered(false)}
                      style={{
                        fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                        padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center',
                        borderRadius: 7,
                        border: isDownloadLogsHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                        borderColor: isDownloadLogsHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                        color: isDownloadLogsHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                        transition: 'all 0.2s ease'
                      } as React.CSSProperties}
                    >
                      <span style={{ color: isDownloadLogsHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                        Download Logs
                      </span>
                    </button>
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>
                      {window.maisonLogs ? `${window.maisonLogs.getLogCount()} entries` : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bw-card">
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: vehicleSettingsOpen ? 16 : 0
                }}
                onClick={() => setVehicleSettingsOpen(!vehicleSettingsOpen)}
              >
                <h4 style={{ margin: 0 }}>Vehicle Settings</h4>
                {vehicleSettingsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {vehicleSettingsOpen && (
              <>
              <div style={{ marginBottom: 16 }}>
                <p className="small-muted" style={{ margin: 0 }}>
                  Configure default rates and settings for different vehicle categories
                </p>
              </div>
              
              <div className="bw-table">
                <div className="bw-table-header">
                  <div className="bw-table-cell">Vehicle Category</div>
                  <div className="bw-table-cell">Base Rate ($)</div>
                  <div className="bw-table-cell">Actions</div>
                </div>
                
                {/* Dynamic vehicle categories from API */}
                {vehicleCategories.length > 0 ? (
                  vehicleCategories.map((category) => {
                    const defaultRate = getVehicleRate(category.vehicle_category)
                    const currentRate = editingRates[category.vehicle_category] !== undefined 
                      ? editingRates[category.vehicle_category] 
                      : (category.vehicle_flat_rate > 0 ? category.vehicle_flat_rate : defaultRate)
                    const isSaving = savingRates[category.vehicle_category] || false
                    
                    return (
                      <div key={category.id} className="bw-table-row">
                        <div className="bw-table-cell">
                          <span className="bw-badge bw-badge-secondary" style={{ textTransform: 'capitalize' }}>
                            {category.vehicle_category}
                          </span>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={currentRate}
                              className="bw-input"
                              style={{ width: '80px', padding: '4px 8px', fontSize: '14px' }}
                              data-category={category.vehicle_category}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value) || 0
                                setEditingRates(prev => ({ ...prev, [category.vehicle_category]: newRate }))
                              }}
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-actions">
                            <button 
                              className={`bw-btn-outline ${isSaveRateHovered ? 'custom-hover-border' : ''}`}
                              style={{
                                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: 'center',
                                borderRadius: 7,
                                border: isSaveRateHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                                borderColor: isSaveRateHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                                color: isSaveRateHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                                transition: 'all 0.2s ease'
                              } as React.CSSProperties}
                              disabled={isSaving}
                              onMouseEnter={() => !isSaving && setIsSaveRateHovered(true)}
                              onMouseLeave={() => setIsSaveRateHovered(false)}
                              onClick={() => {
                                const newRate = parseFloat(document.querySelector(`input[data-category="${category.vehicle_category}"]`)?.value || '0') || 0
                                if (newRate > 0) {
                                  saveVehicleRate(category.vehicle_category, newRate)
                                } else {
                                  alert('Please enter a valid rate greater than 0')
                                }
                              }}
                            >
                              {isSaving ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <span style={{ color: isSaveRateHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                                  Save
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : null}
                
                {/* Add New Category Row */}
                <div className="bw-table-row" style={{ 
                  backgroundColor: 'var(--bw-bg-secondary)', 
                  border: '2px dashed var(--bw-border)',
                  color: 'var(--bw-text)'
                }}>
                  <div className="bw-table-cell">
                    <input
                      type="text"
                      placeholder="New category name"
                      className="bw-input"
                      style={{ 
                        width: '100%', 
                        padding: '4px 8px', 
                        fontSize: '14px',
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '4px'
                      }}
                      id="newCategoryName"
                    />
                  </div>
                  <div className="bw-table-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--bw-text)' }}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="1.0"
                        placeholder="0.00"
                        className="bw-input"
                        style={{ 
                          width: '80px', 
                          padding: '4px 8px', 
                          fontSize: '14px',
                          color: 'var(--bw-text)',
                          backgroundColor: 'var(--bw-bg)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '4px'
                        }}
                        id="newCategoryRate"
                      />
                    </div>
                  </div>
                  <div className="bw-table-cell">
                    <div className="bw-actions">
                      <button
                        className={`bw-btn-outline ${isAddCategoryHovered ? 'custom-hover-border' : ''}`}
                        style={{
                          fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                          padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                          width: isMobile ? '100%' : 'auto',
                          justifyContent: 'center',
                          borderRadius: 7,
                          border: isAddCategoryHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                          borderColor: isAddCategoryHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                          color: isAddCategoryHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                          transition: 'all 0.2s ease'
                        } as React.CSSProperties}
                        disabled={addingCategory}
                        onMouseEnter={() => !addingCategory && setIsAddCategoryHovered(true)}
                        onMouseLeave={() => setIsAddCategoryHovered(false)}
                        onClick={async () => {
                          const nameInput = document.getElementById('newCategoryName') as HTMLInputElement
                          const rateInput = document.getElementById('newCategoryRate') as HTMLInputElement

                          const name = nameInput.value.trim()
                          const rate = parseFloat(rateInput.value) || 0

                          if (name && rate > 0) {
                            setAddingCategory(true)
                            try {
                              const result = await createVehicleCategory({
                                vehicle_category: name,
                                vehicle_flat_rate: rate,
                                seating_capacity: 4 // Default seating capacity
                              })
                              if (result.success) {
                              nameInput.value = ''
                              rateInput.value = ''
                              alert('New category added successfully!')
                              await load() // Refresh data
                              } else {
                                throw new Error(result.message || 'Failed to create category')
                              }
                            } catch (error) {
                              console.error('Failed to add new category:', error)
                              alert('Failed to add new category. Please try again.')
                            } finally {
                              setAddingCategory(false)
                            }
                          } else {
                            alert('Please fill both fields with valid values')
                          }
                        }}
                      >
                        {addingCategory ? (
                          <svg className="animate-spin h-4 w-4" style={{ color: isAddCategoryHovered ? 'rgba(155, 97, 209, 0.81)' : 'var(--bw-text)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Plus className="w-4 h-4" style={{ 
                            color: isAddCategoryHovered ? 'rgba(155, 97, 209, 0.81)' : 'var(--bw-text)',
                            width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                            height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                            fill: isAddCategoryHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor'
                          }} />
                        )}
                        <span style={{ color: isAddCategoryHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                          Add
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: 16, padding: '16px', backgroundColor: 'var(--bw-bg-secondary)', border: '1px solid var(--bw-border)', borderRadius: '4px' }}>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--bw-text)' }}>How it works:</h5>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--bw-muted)' }}>
                  <li>These are default rates for new vehicles of each category</li>
                  <li>Individual vehicles can override these defaults</li>
                  <li>Changes apply to new vehicles, not existing ones</li>
                  <li>Rates are in USD and apply per ride</li>
                  <li>Add custom categories specific to your business needs</li>
                </ul>
              </div>
              </>
              )}
            </div>

            {/* Manage Settings Button - Centered at Bottom */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 'clamp(24px, 4vw, 32px)',
              paddingTop: 'clamp(24px, 4vw, 32px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button 
                className={`bw-btn-outline ${isMoreSettingsHovered ? 'custom-hover-border' : ''}`}
                onClick={() => navigate('/tenant_settings')}
                onMouseEnter={() => setIsMoreSettingsHovered(true)}
                onMouseLeave={() => setIsMoreSettingsHovered(false)}
                style={{
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  borderRadius: 7,
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  color: isMoreSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  border: isMoreSettingsHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                  borderColor: isMoreSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <Settings className="w-4 h-4" style={{ 
                  color: isMoreSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                  width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                  height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                  fill: isMoreSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : 'currentColor'
                }} />
                <span style={{ color: isMoreSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  More Settings
                </span>
              </button>
            </div>

          </div>
        )}
        </div>
        </div>

        {/* Add Driver Modal */}
      {showAddDriver && (
        <div className="bw-modal-overlay" onClick={() => setShowAddDriver(false)}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <div className="bw-modal-header">
              <h3>Add New Driver</h3>
              <button className="bw-btn-icon" onClick={() => setShowAddDriver(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body">
              <div className="bw-form-grid">
                <div className="bw-form-group">
                  <label>First Name</label>
                  <input 
                    className="bw-input" 
                    value={newDriver.first_name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, first_name: e.target.value })} 
                  />
                </div>
                <div className="bw-form-group">
                  <label>Last Name</label>
                  <input 
                    className="bw-input" 
                    value={newDriver.last_name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, last_name: e.target.value })} 
                  />
                </div>
                <div className="bw-form-group">
                  <label>Email</label>
                  <input 
                    className="bw-input" 
                    type="email" 
                    value={newDriver.email} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDriver({ ...newDriver, email: e.target.value })} 
                  />
                </div>
                <div className="bw-form-group">
                  <label>Driver Type</label>
                  <select 
                    className="bw-input" 
                    value={newDriver.driver_type} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDriver({ ...newDriver, driver_type: e.target.value as OnboardDriver['driver_type'] })}
                  >
                    <option value="outsourced">Outsourced</option>
                    <option value="in_house">In-House</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bw-modal-footer">
              <button 
                className={`bw-btn-outline ${isCancelAddDriverHovered ? 'custom-hover-border' : ''}`}
                onClick={() => setShowAddDriver(false)}
                onMouseEnter={() => setIsCancelAddDriverHovered(true)}
                onMouseLeave={() => setIsCancelAddDriverHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isCancelAddDriverHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCancelAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCancelAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isCancelAddDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  Cancel
                </span>
              </button>
              <button 
                className={`bw-btn bw-btn-action ${isCreateDriverHovered ? 'custom-hover-border' : ''}`}
                onClick={createDriver}
                onMouseEnter={() => setIsCreateDriverHovered(true)}
                onMouseLeave={() => setIsCreateDriverHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isCreateDriverHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCreateDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCreateDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isCreateDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  Create Driver
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriver && (
        <div className="bw-modal-overlay" onClick={() => setShowAssignDriver(false)}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <div className="bw-modal-header">
              <h3>Assign Driver to Vehicle</h3>
              <button className="bw-btn-icon" onClick={() => setShowAssignDriver(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body">
              <div className="bw-form-grid">
                <div className="bw-form-group">
                  <label>Select Vehicle</label>
                  <select 
                    value={assign.vehicleId} 
                    onChange={(e) => setAssign({ ...assign, vehicleId: e.target.value })}
                    className="bw-input"
                    style={{ color: '#374151', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Choose a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id} style={{ color: '#374151', backgroundColor: '#ffffff' }}>
                        {vehicle.make} {vehicle.model} {vehicle.year} - {vehicle.license_plate}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bw-form-group">
                  <label>Select Driver</label>
                  <select 
                    value={assign.driverId} 
                    onChange={(e) => setAssign({ ...assign, driverId: e.target.value })}
                    className="bw-input"
                    style={{ color: '#374151', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Choose a driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id} style={{ color: '#374151', backgroundColor: '#ffffff' }}>
                        {driver.first_name} {driver.last_name} - {driver.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="bw-modal-footer">
              <button 
                className={`bw-btn-outline ${isCancelAssignDriverHovered ? 'custom-hover-border' : ''}`}
                onClick={() => setShowAssignDriver(false)}
                onMouseEnter={() => setIsCancelAssignDriverHovered(true)}
                onMouseLeave={() => setIsCancelAssignDriverHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isCancelAssignDriverHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCancelAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCancelAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isCancelAssignDriverHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  Cancel
                </span>
              </button>
              <button 
                className={`bw-btn bw-btn-action ${isAssignDriverModalHovered ? 'custom-hover-border' : ''}`}
                onClick={assignVehicle}
                onMouseEnter={() => setIsAssignDriverModalHovered(true)}
                onMouseLeave={() => setIsAssignDriverModalHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isAssignDriverModalHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isAssignDriverModalHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isAssignDriverModalHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isAssignDriverModalHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  Assign Driver
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Edit Modal */}
      {showVehicleEditModal && editingVehicleId && (
        <VehicleEditModal
          vehicleId={editingVehicleId}
          isOpen={showVehicleEditModal}
          onClose={() => {
            setShowVehicleEditModal(false)
            setEditingVehicleId(null)
          }}
          onVehicleUpdated={() => {
            // Refresh vehicles list after update
            load()
          }}
          onDelete={handleDeleteVehicle}
          />
        )}

      {/* Booking Details Modal */}
      {showBookingDetails && (
        <div className="bw-modal-overlay" onClick={() => {
          setShowBookingDetails(false)
          setSelectedBooking(null)
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Booking Details
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  setShowBookingDetails(false)
                  setSelectedBooking(null)
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              {loadingBookingDetails ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--bw-muted)' }}>Loading booking details...</div>
                </div>
              ) : selectedBooking ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
                  {/* Booking ID and Status */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'clamp(12px, 2vw, 16px)',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <div>
                      <div style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        color: 'var(--bw-muted)',
                        marginBottom: '4px'
                      }}>
                        Booking ID
                      </div>
                      <div style={{
                        fontSize: 'clamp(18px, 2.5vw, 24px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        #{selectedBooking.id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(selectedBooking.booking_status)}
                      <span className={getStatusColor(selectedBooking.booking_status)} style={{
                        fontSize: 'clamp(13px, 1.5vw, 15px)',
                        fontWeight: 300,
                        textTransform: 'capitalize'
                      }}>
                        {selectedBooking.booking_status}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Customer Information
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Customer Name
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.customer_name || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Route Information
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <MapPin className="w-3 h-3" style={{ color: 'var(--bw-muted)' }} />
                          Pickup Location
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.pickup_location}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginTop: '4px'
                        }}>
                          {new Date(selectedBooking.pickup_time).toLocaleString()}
                        </div>
                      </div>
                      {selectedBooking.dropoff_location && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <MapPin className="w-3 h-3" style={{ color: 'var(--bw-muted)' }} />
                            Dropoff Location
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedBooking.dropoff_location}
                          </div>
                          {selectedBooking.dropoff_time && (
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginTop: '4px'
                            }}>
                              {new Date(selectedBooking.dropoff_time).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Service Details
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Service Type
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)',
                          textTransform: 'capitalize'
                        }}>
                          {selectedBooking.service_type || 'Standard'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Payment Method
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)',
                          textTransform: 'capitalize'
                        }}>
                          {selectedBooking.payment_method || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          City
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.city || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver & Vehicle */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Assignment
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Driver
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {selectedBooking.driver_name && selectedBooking.driver_name !== 'None' ? selectedBooking.driver_name : 'No assigned driver'}
                          <button
                            onClick={() => setShowAssignDriverToBooking(true)}
                            className="bw-btn-icon"
                            style={{
                              padding: '4px',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                            title="Assign Driver"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Vehicle
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.vehicle || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Pricing
                    </h4>
                    <div style={{
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      ${selectedBooking.estimated_price?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedBooking.notes && (
                    <div>
                      <h4 style={{
                        margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                        fontSize: 'clamp(14px, 2vw, 18px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        Notes
                      </h4>
                      <div style={{
                        fontSize: 'clamp(13px, 1.5vw, 15px)',
                        color: 'var(--bw-text)',
                        padding: 'clamp(12px, 2vw, 16px)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        borderRadius: '6px',
                        border: '1px solid var(--bw-border)'
                      }}>
                        {selectedBooking.notes}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div style={{
                    paddingTop: 'clamp(12px, 2vw, 16px)',
                    borderTop: '1px solid var(--bw-border)',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      Created: {selectedBooking.created_on ? new Date(selectedBooking.created_on).toLocaleString() : 'N/A'}
                    </div>
                    {selectedBooking.updated_on && (
                      <div>
                        Updated: {new Date(selectedBooking.updated_on).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--bw-muted)' }}>No booking details available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver to Booking Modal */}
      {showAssignDriverToBooking && selectedBooking && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!assigningDriver) {
            setShowAssignDriverToBooking(false)
            setSelectedDriverForBooking('')
            setShowOverrideConfirm(false)
          }
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '500px',
            width: '90vw'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif'
              }}>
                {showOverrideConfirm ? 'Override Existing Driver?' : 'Assign Driver to Booking'}
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  if (!assigningDriver) {
                    setShowAssignDriverToBooking(false)
                    setSelectedDriverForBooking('')
                    setShowOverrideConfirm(false)
                  }
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
                disabled={assigningDriver}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              {showOverrideConfirm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--bw-border)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--bw-text)', marginBottom: '8px' }}>
                      This booking already has a driver assigned:
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--bw-text)' }}>
                      {selectedBooking.driver_name}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--bw-muted)' }}>
                    Do you want to replace the current driver with a new one?
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--bw-text)',
                      marginBottom: '8px'
                    }}>
                      Select Driver
                    </label>
                    <select
                      value={selectedDriverForBooking}
                      onChange={(e) => setSelectedDriverForBooking(e.target.value)}
                      className="bw-input"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '6px'
                      }}
                    >
                      <option value="">Choose a driver</option>
                      {drivers
                        .filter(driver => driver.driver_type === 'in_house')
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.first_name} {driver.last_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  {selectedBooking.driver_name && selectedBooking.driver_name !== 'None' && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--bw-bg-secondary)',
                      borderRadius: '6px',
                      border: '1px solid var(--bw-border)',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Current driver: <span style={{ fontWeight: 500, color: 'var(--bw-text)' }}>{selectedBooking.driver_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                className={`bw-btn-outline ${isCancelAssignBookingHovered ? 'custom-hover-border' : ''}`}
                onClick={() => {
                  if (!assigningDriver) {
                    setShowAssignDriverToBooking(false)
                    setSelectedDriverForBooking('')
                    setShowOverrideConfirm(false)
                  }
                }}
                onMouseEnter={() => !assigningDriver && setIsCancelAssignBookingHovered(true)}
                onMouseLeave={() => setIsCancelAssignBookingHovered(false)}
                disabled={assigningDriver}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isCancelAssignBookingHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCancelAssignBookingHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCancelAssignBookingHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isCancelAssignBookingHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  {showOverrideConfirm ? 'Cancel' : 'Close'}
                </span>
              </button>
              {showOverrideConfirm ? (
                <>
                  <button
                    className={`bw-btn-outline ${isBackOverrideHovered ? 'custom-hover-border' : ''}`}
                    onClick={() => setShowOverrideConfirm(false)}
                    onMouseEnter={() => !assigningDriver && setIsBackOverrideHovered(true)}
                    onMouseLeave={() => setIsBackOverrideHovered(false)}
                    disabled={assigningDriver}
                    style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isBackOverrideHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                      borderColor: isBackOverrideHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      color: isBackOverrideHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isBackOverrideHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      Back
                    </span>
                  </button>
                  <button
                    className={`bw-btn bw-btn-action ${isOverrideConfirmHovered ? 'custom-hover-border' : ''}`}
                    onClick={handleAssignDriverToBooking}
                    onMouseEnter={() => !assigningDriver && !selectedDriverForBooking && setIsOverrideConfirmHovered(true)}
                    onMouseLeave={() => setIsOverrideConfirmHovered(false)}
                    disabled={assigningDriver || !selectedDriverForBooking}
                    style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isOverrideConfirmHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                      borderColor: isOverrideConfirmHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      color: isOverrideConfirmHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isOverrideConfirmHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      {assigningDriver ? 'Assigning...' : 'Yes, Override'}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  className={`bw-btn bw-btn-action ${isAssignDriverToBookingHovered ? 'custom-hover-border' : ''}`}
                  onClick={handleAssignDriverToBooking}
                  onMouseEnter={() => !assigningDriver && !selectedDriverForBooking && setIsAssignDriverToBookingHovered(true)}
                  onMouseLeave={() => setIsAssignDriverToBookingHovered(false)}
                  disabled={assigningDriver || !selectedDriverForBooking}
                  style={{
                    padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isAssignDriverToBookingHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                    borderColor: isAssignDriverToBookingHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    color: isAssignDriverToBookingHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isAssignDriverToBookingHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    {assigningDriver ? 'Assigning...' : 'Assign Driver'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Vehicle Confirmation Modal */}
      {showDeleteConfirm && deletingVehicleId && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!isDeleting) {
            setShowDeleteConfirm(false)
            setDeletingVehicleId(null)
          }
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '500px',
            width: '90vw'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-error, #C5483D)'
              }}>
                Delete Vehicle
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteConfirm(false)
                    setDeletingVehicleId(null)
                  }
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
                disabled={isDeleting}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
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
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--bw-error, #C5483D)', flexShrink: 0 }} />
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
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                className={`bw-btn-outline ${isCancelDeleteHovered ? 'custom-hover-border' : ''}`}
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteConfirm(false)
                    setDeletingVehicleId(null)
                  }
                }}
                onMouseEnter={() => !isDeleting && setIsCancelDeleteHovered(true)}
                onMouseLeave={() => setIsCancelDeleteHovered(false)}
                disabled={isDeleting}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isCancelDeleteHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  borderColor: isCancelDeleteHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  color: isCancelDeleteHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isCancelDeleteHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                  Cancel
                </span>
              </button>
              <button
                className={`bw-btn ${isDeleteVehicleHovered ? 'custom-hover-border' : ''}`}
                onClick={confirmDeleteVehicle}
                onMouseEnter={() => !isDeleting && setIsDeleteVehicleHovered(true)}
                onMouseLeave={() => setIsDeleteVehicleHovered(false)}
                disabled={isDeleting}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  backgroundColor: isDeleteVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : 'var(--bw-error, #C5483D)',
                  color: '#ffffff',
                  borderColor: isDeleteVehicleHovered ? 'rgba(155, 97, 209, 0.81)' : 'var(--bw-error, #C5483D)',
                  border: isDeleteVehicleHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span>
                  {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDriverDetails && (
        <div className="bw-modal-overlay" onClick={() => {
          setShowDriverDetails(false)
          setSelectedDriver(null)
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif'
              }}>
                Driver Details
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  setShowDriverDetails(false)
                  setSelectedDriver(null)
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              {loadingDriverDetails ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--bw-muted)' }}>Loading driver details...</div>
                </div>
              ) : selectedDriver ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
                  {/* Driver ID and Status */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'clamp(12px, 2vw, 16px)',
                    borderBottom: '1px solid var(--bw-border)'
                  }}>
                    <div>
                      <div style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        color: 'var(--bw-muted)',
                        marginBottom: '4px'
                      }}>
                        Driver ID
                      </div>
                      <div style={{
                        fontSize: 'clamp(18px, 2.5vw, 24px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        #{selectedDriver.id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={`bw-badge ${selectedDriver.is_active ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontWeight: 300,
                        textTransform: 'capitalize'
                      }}>
                        {selectedDriver.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`bw-badge ${selectedDriver.is_registered === 'registered' ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontWeight: 300,
                        textTransform: 'capitalize'
                      }}>
                        {selectedDriver.is_registered === 'registered' ? 'Registered' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Personal Information
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Full Name
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.first_name} {selectedDriver.last_name}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Email
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.email || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Phone Number
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.phone_no || 'N/A'}
                        </div>
                      </div>
                      {selectedDriver.state && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            State
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.state}
                          </div>
                        </div>
                      )}
                      {selectedDriver.postal_code && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            Postal Code
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.postal_code}
                          </div>
                        </div>
                      )}
                      {selectedDriver.license_number && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            License Number
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.license_number}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Driver Information
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Driver Type
                        </div>
                        <div>
                          <span className={`bw-badge ${selectedDriver.driver_type === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`} style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            fontWeight: 300,
                            textTransform: 'capitalize'
                          }}>
                            {selectedDriver.driver_type === 'in_house' ? 'In-House' : 'Outsourced'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Role
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.role || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Status
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.status || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Completed Rides
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.completed_rides || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  {selectedDriver.vehicle && (
                    <div>
                      <h4 style={{
                        margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                        fontSize: 'clamp(14px, 2vw, 18px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        Assigned Vehicle
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'clamp(8px, 1.5vw, 12px)',
                        padding: 'clamp(12px, 2vw, 16px)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        borderRadius: '6px',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            Make & Model
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                          </div>
                        </div>
                        {selectedDriver.vehicle.year && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Year
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.year}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.license_plate && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              License Plate
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.license_plate}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.color && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Color
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.color}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.seating_capacity && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Seating Capacity
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.seating_capacity}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.status && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Vehicle Status
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.status}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div style={{
                    paddingTop: 'clamp(12px, 2vw, 16px)',
                    borderTop: '1px solid var(--bw-border)',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      Created: {selectedDriver.created_on ? new Date(selectedDriver.created_on).toLocaleString() : 'N/A'}
                    </div>
                    {selectedDriver.updated_on && (
                      <div>
                        Updated: {new Date(selectedDriver.updated_on).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--bw-muted)' }}>No driver details available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* Responsive Vehicle Grid Styles */}
      <style>{`
        .bw-vehicle-grid {
          display: grid;
          gap: 20px;
          padding: 0;
        }
        
        /* Mobile: 2 columns */
        @media (max-width: 767px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        
        /* Large screens: 4 columns */
        @media (min-width: 768px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        /* Extra large screens: maintain 4 columns but allow more space */
        @media (min-width: 1200px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
      `}</style>
    </div>
  )
}