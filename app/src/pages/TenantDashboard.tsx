import { useEffect, useState } from 'react'
import type React from 'react'
import { getTenantInfo, getTenantDrivers, getTenantVehicles, getTenantBookings, getTenantBookingById, onboardDriver, assignDriverToVehicle, type TenantResponse, type DriverResponse, type VehicleResponse, type BookingResponse, type OnboardDriver } from '@api/tenant'
import { getVehicleRates, getVehicleCategories, createVehicleCategory, setVehicleRates } from '@api/vehicles'
import { getTenantSettings, updateTenantSettings, updateTenantLogo, type TenantSettingsResponse, type UpdateTenantSetting } from '@api/tenantSettings'
import { useAuthStore } from '@store/auth'
import { useNavigate } from 'react-router-dom'
import { useTenantTheme } from '@contexts/ThemeContext'
import ThemeToggle from '@components/ThemeToggle'
import VehicleEditModal from '@components/VehicleEditModal'
import { Car, Users, Calendar, Settings, TrendingUp, DollarSign, Clock, MapPin, User, Phone, Mail, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Palette, Save, Menu, ChevronDown, ChevronUp } from 'lucide-react'
import { API_BASE } from '@config'

type TabType = 'overview' | 'drivers' | 'bookings' | 'vehicles' | 'settings'

export default function TenantDashboard() {
  const { accessToken, role } = useAuthStore()
  const navigate = useNavigate()
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
  const [activeTab, setActiveTab] = useState<TabType>('overview')
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

  // Booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false)

  // Vehicle Settings dropdown state
  const [vehicleSettingsOpen, setVehicleSettingsOpen] = useState(false)
  
  // Business Configuration dropdown state
  const [businessConfigurationOpen, setBusinessConfigurationOpen] = useState(false)

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

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

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
            className="bw-btn" 
            onClick={load}
            style={{ color: '#000' }}
          >
            Retry
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
            className="bw-btn" 
            onClick={() => {
              setError(null)
              load()
            }}
            style={{ color: '#000' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bw" style={{ position: 'relative', minHeight: '100vh', display: 'flex' }}>
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
          left: isMenuOpen ? '0' : '-20%',
          width: '20%',
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
          <h1 style={{ 
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 'clamp(20px, 3vw, 32px)',
            fontWeight: 200,
            margin: 0,
            color: 'var(--bw-text)',
            letterSpacing: '0.5px',
            lineHeight: '1.2',
            flex: 1
          }}>
            {info?.profile?.company_name || 'Dashboard'}
          </h1>
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
                onClick={() => {
                  setActiveTab(tab.id as TabType)
                  // Menu stays open - only closes on cancel button or outside click
                }}
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
            fontSize: 'clamp(11px, 1.2vw, 13px)',
            color: 'var(--bw-muted)',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 300
          }}>
            Welcome back, {info?.first_name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
          </div>
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
              borderRadius: '4px',
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
              display: 'none',
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
                      setActiveTab(tab.id as TabType)
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
              display: 'none',
              gap: '8px',
              alignItems: 'center'
            }}
            className="desktop-actions"
            >
              <ThemeToggle />
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
              
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 18vw, 200px), 1fr))',
                  gap: 'clamp(12px, 2vw, 20px)',
                  marginBottom: 'clamp(16px, 3vw, 24px)'
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
                    className="bw-btn-outline" 
                    onClick={() => setActiveTab('bookings')}
                    style={{ 
                      fontSize: 'clamp(10px, 1.2vw, 12px)', 
                      padding: 'clamp(4px, 0.8vw, 6px) clamp(8px, 1.5vw, 12px)',
                      fontWeight: 300,
                      fontFamily: '"Work Sans", sans-serif'
                    }}
                  >
                    View All
                  </button>
                </div>
              <div className="bw-recent-list">
                {bookings.length === 0 ? (
                  <div className="bw-empty-state" style={{ padding: '24px', textAlign: 'center' }}>
                    <Calendar className="w-8 h-8" style={{ color: '#9ca3af', marginBottom: '8px' }} />
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>No bookings yet</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Bookings will appear here</div>
                  </div>
                ) : (
                  <>
                    {/* Show first 3 pending trips */}
                    {bookings.slice(0, 3).map((booking) => (
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
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '8px', 
                          fontSize: '12px',
                          color: '#6b7280',
                          borderTop: '1px solid #f3f4f6',
                          paddingTop: '8px'
                        }}>
                          <div>
                            <span style={{ fontWeight: '500' }}>Customer:</span> {booking.customer_name || 'Anonymous Customer'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Driver:</span> {booking.driver_fullname || 'Unassigned'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Vehicle:</span> {booking.vehicle || 'N/A'}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Fare:</span> ${booking.estimated_price || '0.00'}
                          </div>
                        </div>
                        
                        {/* Time Information */}
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#9ca3af', 
                          marginTop: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Pickup: {new Date(booking.pickup_time).toLocaleTimeString()}</span>
                          {booking.dropoff_time && (
                            <span>Dropoff: {new Date(booking.dropoff_time).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Dropdown to show more bookings if there are more than 3 */}
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
                      onClick={() => setActiveTab('bookings')}
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
                          <span>View {bookings.length - 3} more bookings</span>
                          <span style={{ fontSize: '12px' }}>→</span>
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
            <div className="bw-content-header">
              <h3>Driver Management</h3>
              <button 
                className="bw-btn bw-btn-action" 
                onClick={() => setShowAddDriver(true)}
              >
                <Plus className="w-4 h-4" />
                Add Driver
              </button>
            </div>

            <div className="bw-card">
              <div className="bw-table">
                <div className="bw-table-header">
                  <div className="bw-table-cell">Driver</div>
                  <div className="bw-table-cell">Contact</div>
                  <div className="bw-table-cell">Type</div>
                  <div className="bw-table-cell">Status</div>
                  <div className="bw-table-cell">Rides</div>
                  <div className="bw-table-cell">Actions</div>
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
                    <div key={driver.id} className="bw-table-row">
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
                        {driver.completed_rides}
                      </div>
                      <div className="bw-table-cell">
                        <div className="bw-actions">
                          <button className="bw-btn-icon">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="bw-btn-icon bw-btn-icon-danger">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bw-content">
            <div className="bw-content-header">
              <h3>Booking Management</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="bw-text-muted">
                  Total: {bookings.length} • 
                  Completed: {bookings.filter(b => b.booking_status === 'completed').length} • 
                  Active: {bookings.filter(b => b.booking_status === 'active').length} • 
                  Pending: {bookings.filter(b => b.booking_status === 'pending').length}
                </span>
              </div>
            </div>

            <div className="bw-card">
              <div className="bw-table">
                <div className="bw-table-header">
                  <div className="bw-table-cell">Booking ID</div>
                  <div className="bw-table-cell">Customer & Route</div>
                  <div className="bw-table-cell">Service Details</div>
                  <div className="bw-table-cell">Date & Time</div>
                  <div className="bw-table-cell">Driver & Vehicle</div>
                  <div className="bw-table-cell">Status</div>
                  <div className="bw-table-cell">Fare</div>
                  <div className="bw-table-cell">Actions</div>
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
                            <span style={{ fontWeight: '500' }}>Driver:</span> {booking.driver_fullname || 'Unassigned'}
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
                      <div className="bw-table-cell">
                        <div className="bw-actions">
                          <button 
                            className="bw-btn-icon" 
                            title="View Details"
                            style={{ padding: '4px' }}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          {booking.booking_status === 'pending' && (
                            <button 
                              className="bw-btn-icon bw-btn-icon-success" 
                              title="Assign Driver"
                              style={{ padding: '4px' }}
                            >
                              <User className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="bw-content">
            <div className="bw-content-header">
              <h3>Vehicle Management</h3>
              <button 
                className="bw-btn bw-btn-action" 
                onClick={() => setShowAssignDriver(true)}
              >
                <Plus className="w-4 h-4" />
                Assign Driver
              </button>
              <button 
                className="bw-btn bw-btn-action" 
                onClick={() => navigate('/vehicles/add')}
                style={{ marginLeft: 16 }}
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>

            <div className="bw-card">
              <div className="bw-table">
                <div className="bw-table-header">
                  <div className="bw-table-cell">Vehicle</div>
                  <div className="bw-table-cell">Category</div>
                  <div className="bw-table-cell">Capacity</div>
                  <div className="bw-table-cell">Rate</div>
                  <div className="bw-table-cell">Status</div>
                  <div className="bw-table-cell">Actions</div>
                </div>
                {vehicles.length === 0 ? (
                  <div className="bw-empty-state">
                    <div className="bw-empty-icon">
                      <Car className="w-8 h-8" />
                    </div>
                    <div className="bw-empty-text">No vehicles yet</div>
                    <div className="bw-empty-subtext">Add vehicles to your fleet to start accepting rides</div>
                  </div>
                ) : (
                  vehicles.map((vehicle) => {
                    return (
                      <div key={vehicle.id} className="bw-table-row">
                        <div className="bw-table-cell">
                          <div className="bw-vehicle-info">
                            <div className="bw-vehicle-icon">
                              <Car className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="bw-vehicle-name">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </div>
                              <div className="bw-vehicle-details">
                                {vehicle.color} • {vehicle.license_plate}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <span className="bw-badge bw-badge-secondary">
                            {vehicle.vehicle_config?.vehicle_category}
                          </span>
                        </div>
                        <div className="bw-table-cell">
                          {vehicle.vehicle_config?.seating_capacity} seats
                        </div>
                        <div className="bw-table-cell">
                          {(() => {
                            const rate = getVehicleRate(vehicle.vehicle_config?.vehicle_category)
                            if (rate > 0) {
                              return `$${rate.toFixed(2)}`
                            } else if (vehicle.vehicle_config?.vehicle_flat_rate && vehicle.vehicle_config.vehicle_flat_rate > 0) {
                              return `$${vehicle.vehicle_config.vehicle_flat_rate.toFixed(2)}`
                            } else {
                              return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Not set</span>
                            }
                          })()}
                        </div>
                        <div className="bw-table-cell">
                          <span className={`bw-badge ${vehicle.status === 'active' ? 'bw-badge-success' : 'bw-badge-warning'}`}>
                            {vehicle.status || 'Unknown'}
                          </span>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-actions">
                            <button 
                              className="bw-btn-icon"
                              onClick={() => {
                                setEditingVehicleId(vehicle.id)
                                setShowVehicleEditModal(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="bw-btn-icon bw-btn-icon-danger">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bw-content">
            <div className="bw-content-header">
              <h3>Tenant Settings</h3>
              <button 
                className="bw-btn-outline" 
                onClick={() => navigate('/tenant_settings')}
              >
                <Settings className="w-4 h-4" />
                Manage Settings
              </button>
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
                      className="bw-btn-outline" 
                      onClick={() => {
                        if (window.maisonLogs) {
                          window.maisonLogs.downloadLogs()
                        } else {
                          console.error('Logging system not available')
                        }
                      }}
                      style={{ fontSize: '14px', padding: '4px 8px' }}
                    >
                      Download Logs
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
                              className="bw-btn-outline" 
                              style={{ fontSize: '12px', padding: '4px 8px' }}
                              disabled={isSaving}
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
                                'Save'
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
                        className="bw-btn-outline"
                        style={{ fontSize: '12px', padding: '4px 5px' }}
                        disabled={addingCategory}
                        onClick={async () => {
                          const nameInput = document.getElementById('newCategoryName') as HTMLInputElement
                          const rateInput = document.getElementById('newCategoryRate') as HTMLInputElement

                          const name = nameInput.value.trim()
                          const rate = parseFloat(rateInput.value) || 0

                          if (name && rate > 0) {
                            setAddingCategory(true)
                            try {
                              await createVehicleCategory({
                                vehicle_category: name,
                                vehicle_flat_rate: rate,
                                seating_capacity: 4 // Default seating capacity
                              })
                              nameInput.value = ''
                              rateInput.value = ''
                              alert('New category added successfully!')
                              await load() // Refresh data
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
                          <svg className="animate-spin h-4 w-4" style={{ color: 'var(--bw-text)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Plus className="w-4 h-4" style={{ color: 'var(--bw-text)' }} />
                        )}
                        Add
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

            {/* Tenant Settings Section */}
            {tenantSettings && (
              <div className="bw-card">
                <div 
                  className="bw-card-header" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => setBusinessConfigurationOpen(!businessConfigurationOpen)}
                >
                  <h4 style={{ margin: 0 }}>Business Configuration</h4>
                  {businessConfigurationOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>

                {businessConfigurationOpen && (
                <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  {editingSettings ? (
                    <>
                      <button 
                        className="bw-btn-outline" 
                        onClick={handleCancelEdit}
                        disabled={savingSettings}
                        style={{ marginRight: 8 }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="bw-btn" 
                        onClick={handleSaveSettings}
                        disabled={savingSettings}
                      >
                        {savingSettings ? 'Saving...' : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="bw-btn-outline" 
                      onClick={() => {
                        setEditedSettings(tenantSettings)
                        setEditingSettings(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit Settings
                    </button>
                  )}
                </div>
                {/* Branding & Theme Settings */}
                <div style={{ marginBottom: 32 }}>
                  <h5 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Palette className="w-4 h-4" />
                    Branding & Theme
                  </h5>
                  <div className="bw-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Theme</label>
                      {editingSettings ? (
                        <select 
                          className="bw-input" 
                          value={editedSettings?.theme || ''} 
                          onChange={(e) => {
                            const newTheme = e.target.value
                            handleSettingChange('theme', newTheme)
                            // Apply theme immediately for preview
                            document.documentElement.setAttribute('data-theme', newTheme)
                            document.body.setAttribute('data-theme', newTheme)
                          }}
                        >
                          <option value="light">Light Mode</option>
                          <option value="dark">Dark Mode</option>
                          <option value="auto">Auto (System)</option>
                        </select>
                      ) : (
                        <span className="bw-info-value">
                          {tenantSettings.theme === 'light' ? 'Light Mode' : 
                           tenantSettings.theme === 'dark' ? 'Dark Mode' : 
                           tenantSettings.theme === 'auto' ? 'Auto (System)' : 
                           'Not set'}
                        </span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Logo URL</label>
                      {editingSettings ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input 
                            className="bw-input" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange}
                            style={{ flex: 1 }}
                          />
                          {logoPreview && (
                            <img src={logoPreview} alt="Logo Preview" style={{ width: 50, height: 50, borderRadius: '4px' }} />
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span className="bw-info-value">{tenantSettings.logo_url || 'Not set'}</span>
                          {tenantSettings.logo_url && (
                            <img 
                              src={tenantSettings.logo_url} 
                              alt="Current logo" 
                              style={{ 
                                width: 50, 
                                height: 50, 
                                borderRadius: '4px',
                                objectFit: 'contain',
                                border: '1px solid #ddd'
                              }} 
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Slug</label>
                      {editingSettings ? (
                        <input 
                          className="bw-input" 
                          type="text" 
                          value={editedSettings?.slug || ''} 
                          onChange={(e) => handleSettingChange('slug', e.target.value)}
                          placeholder="company-name"
                        />
                      ) : (
                        <span className="bw-info-value">{tenantSettings.slug || 'Not set'}</span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Enable Branding</label>
                      {editingSettings ? (
                        <select 
                          className="bw-input" 
                          value={editedSettings?.enable_branding ? 'true' : 'false'} 
                          onChange={(e) => handleSettingChange('enable_branding', e.target.value === 'true')}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <span className="bw-info-value">{tenantSettings.enable_branding ? 'Yes' : 'No'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fare Settings */}
                <div style={{ marginBottom: 32 }}>
                  <h5 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign className="w-4 h-4" />
                    Fare Configuration
                  </h5>
                  <div className="bw-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Base Fare ($)</label>
                      {editingSettings ? (
                        <input 
                          className="bw-input" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={editedSettings?.base_fare || 0} 
                          onChange={(e) => handleSettingChange('base_fare', parseFloat(e.target.value) || 0)}
                          placeholder="5.00"
                        />
                      ) : (
                        <span className="bw-info-value">${tenantSettings.base_fare || 0}</span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Per Minute Rate ($)</label>
                      {editingSettings ? (
                        <input 
                          className="bw-input" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={editedSettings?.per_minute_rate || 0} 
                          onChange={(e) => handleSettingChange('per_minute_rate', parseFloat(e.target.value) || 0)}
                          placeholder="0.50"
                        />
                      ) : (
                        <span className="bw-info-value">${tenantSettings.per_minute_rate || 0}</span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Per Mile Rate ($)</label>
                      {editingSettings ? (
                        <input 
                          className="bw-input" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={editedSettings?.per_mile_rate || 0} 
                          onChange={(e) => handleSettingChange('per_mile_rate', parseFloat(e.target.value) || 0)}
                          placeholder="2.50"
                        />
                      ) : (
                        <span className="bw-info-value">${tenantSettings.per_mile_rate || 0}</span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Per Hour Rate ($)</label>
                      {editingSettings ? (
                        <input 
                          className="bw-input" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={editedSettings?.per_hour_rate || 0} 
                          onChange={(e) => handleSettingChange('per_hour_rate', parseFloat(e.target.value) || 0)}
                          placeholder="25.00"
                        />
                      ) : (
                        <span className="bw-info-value">${tenantSettings.per_hour_rate || 0}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rider Settings */}
                <div style={{ marginBottom: 32 }}>
                  <h5 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User className="w-4 h-4" />
                    Rider Configuration
                  </h5>
                  <div className="bw-form-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Rider Tiers Enabled</label>
                      {editingSettings ? (
                        <select 
                          className="bw-input" 
                          value={editedSettings?.rider_tiers_enabled ? 'true' : 'false'} 
                          onChange={(e) => handleSettingChange('rider_tiers_enabled', e.target.value === 'true')}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <span className="bw-info-value">{tenantSettings.rider_tiers_enabled ? 'Yes' : 'No'}</span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Cancellation Fee ($)</label>
                      {editingSettings ? (
                        <input 
                          className="bw-input" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={editedSettings?.cancellation_fee || 0} 
                          onChange={(e) => handleSettingChange('cancellation_fee', parseFloat(e.target.value) || 0)}
                          placeholder="10.00"
                        />
                      ) : (
                        <span className="bw-info-value">${tenantSettings.cancellation_fee || 0}</span>
                      )}
                    </div>
                    <div className="bw-form-group">
                      <label className="bw-form-label">Discounts Enabled</label>
                      {editingSettings ? (
                        <select 
                          className="bw-input" 
                          value={editedSettings?.discounts ? 'true' : 'false'} 
                          onChange={(e) => handleSettingChange('discounts', e.target.value === 'true')}
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <span className="bw-info-value">{tenantSettings.discounts ? 'Yes' : 'No'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last Updated Info */}
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: 'var(--bw-bg-secondary)', 
                  borderRadius: '4px', 
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bw-muted)', fontSize: '14px' }}>
                    <Clock className="w-4 h-4" />
                    Last updated: {tenantSettings.updated_on ? new Date(tenantSettings.updated_on).toLocaleString() : 'Never'}
                  </div>
                </div>
                </>
                )}
              </div>
            )}
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
              <button className="bw-btn-outline" onClick={() => setShowAddDriver(false)}>
                Cancel
              </button>
              <button 
                className="bw-btn bw-btn-action" 
                onClick={createDriver}
              >
                Create Driver
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
              <button className="bw-btn-outline" onClick={() => setShowAssignDriver(false)}>
                Cancel
              </button>
              <button 
                className="bw-btn bw-btn-action" 
                onClick={assignVehicle}
              >
                Assign Driver
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
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.driver_fullname || 'Unassigned'}
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
      </div>
    </div>
  )
}