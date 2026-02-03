import { useEffect, useState } from 'react'
import { createBooking, getBookings, getBookingAnalytics, type BookingResponse, type BookingAnalyticsResponse } from '@api/bookings'
import { getVehicles, type VehicleResponse } from '@api/vehicles'
import { useAuthStore } from '@store/auth'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import { MapPin, Calendar, CreditCard, Car, User, SignOut, UserCircle, List, X, SquaresFour, BookOpen, Truck, CheckCircle, XCircle, Clock, WarningCircle } from '@phosphor-icons/react'
import LocationAutocomplete from '@components/LocationAutocomplete'
import CountryAutocomplete from '@components/CountryAutocomplete'

type MenuSection = 'dashboard' | 'book-ride' | 'all-bookings' | 'vehicles'

export default function RiderDashboard() {
  useFavicon()
  const [form, setForm] = useState({
    vehicle_id: 0,
    country: '',
    service_type: 'dropoff' as 'airport' | 'hourly' | 'dropoff',
    airport_service: '' as 'to_airport' | 'from_airport' | '',
    pickup_location: '',
    dropoff_location: '',
    airport_location: '',
    pickup_time_local: '',
    hours: 0,
    notes: '',
    pickup_coordinates: null as { lat: number; lng: number } | null,
    dropoff_coordinates: null as { lat: number; lng: number } | null,
    airport_coordinates: null as { lat: number; lng: number } | null,
  })
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [analytics, setAnalytics] = useState<BookingAnalyticsResponse | null>(null)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Only for booking creation
  const [error, setError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  // Limit-based loading state (replacing pagination)
  const [bookingsLimit, setBookingsLimit] = useState(5)
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')
  const [lastSelectedFilter, setLastSelectedFilter] = useState<string>('')
  const [hasMoreBookings, setHasMoreBookings] = useState(true)
  
  const { tenantInfo, slug } = useTenantInfo()
  const navigate = useNavigate()
  const location = useLocation()

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

  // Separate loading functions
  const loadBookings = async (page: number = 1, limit?: number, section?: MenuSection) => {
    try {
      setIsLoadingBookings(true)
      setError('')
      
      // For dashboard, load all bookings (no pagination) to get accurate stats
      const currentSection = section || activeSection
      const params = currentSection === 'dashboard' 
        ? undefined // Load all bookings for dashboard stats
        : undefined // This function is only used for dashboard now
      
      const bookingsResponse = await getBookings(params)
      
      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data)
      } else {
        setBookings([])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load bookings')
      setBookings([])
    } finally {
      setIsLoadingBookings(false)
    }
  }

  // Load all bookings with filters (for all-bookings section)
  const loadAllBookings = async (limit: number, status?: string, serviceType?: string) => {
    try {
      setIsLoadingBookings(true)
      setError('')
      const previousCount = bookings.length
      const params: { limit: number; booking_status?: string; service_type?: string } = { limit }
      if (status) {
        params.booking_status = status
      }
      if (serviceType) {
        params.service_type = serviceType
      }
      const response = await getBookings(params)
      if (response.success && response.data) {
        const newBookings = response.data
        setBookings(newBookings)
        
        // If we got fewer bookings than requested, we've reached the end
        // Also check if the count didn't increase (edge case)
        if (newBookings.length < limit || (previousCount > 0 && newBookings.length === previousCount)) {
          setHasMoreBookings(false)
        } else {
          setHasMoreBookings(true)
        }
      } else {
        setError(response.message || 'Failed to load bookings')
        setHasMoreBookings(false)
      }
    } catch (err: any) {
      console.error('Failed to load bookings:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load bookings')
      setHasMoreBookings(false)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const loadVehicles = async () => {
    try {
      setIsLoadingVehicles(true)
      setError('')
      
      const vehiclesResponse = await getVehicles()
      
      if (vehiclesResponse.success && vehiclesResponse.data) {
        setVehicles(vehiclesResponse.data)
      } else {
        setVehicles([])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load vehicles')
      setVehicles([])
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true)
      setError('')
      
      const analyticsResponse = await getBookingAnalytics()
      
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data)
      } else {
        setAnalytics(null)
      }
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
      setError(err.response?.data?.detail || 'Failed to load analytics')
      setAnalytics(null)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  // Determine active section from URL
  const getActiveSectionFromUrl = (): MenuSection => {
    const path = location.pathname
    if (path.includes('/rider/book')) return 'book-ride'
    if (path.includes('/rider/see-bookings')) return 'all-bookings'
    if (path.includes('/rider/vehicles')) return 'vehicles'
    if (path.includes('/rider/dashboard')) return 'dashboard'
    // Default to dashboard
    return 'dashboard'
  }

  const activeSection = getActiveSectionFromUrl()

  // Track which section last loaded bookings to avoid unnecessary reloads
  const [lastBookingsSection, setLastBookingsSection] = useState<MenuSection | null>(null)

  // Section-based loading
  useEffect(() => {
    // Load analytics and bookings for dashboard section
    if (activeSection === 'dashboard') {
      // Load analytics for dashboard stats
      if (!analytics && !isLoadingAnalytics) {
        loadAnalytics()
      }
      // Load all bookings for dashboard (for recent/upcoming rides display)
      if (lastBookingsSection !== 'dashboard' && !isLoadingBookings) {
        loadBookings(1, undefined, 'dashboard')
        setLastBookingsSection('dashboard')
      }
    }
    
    // Load bookings for all-bookings section
    if (activeSection === 'all-bookings') {
      const needsReload = lastBookingsSection !== 'all-bookings' || bookings.length === 0
      
      if (needsReload && !isLoadingBookings) {
        // Reset hasMoreBookings when first loading the section
        if (bookingsLimit === 5) {
          setHasMoreBookings(true)
        }
        loadAllBookings(
          bookingsLimit, 
          bookingStatusFilter || undefined,
          serviceTypeFilter || undefined
        )
        setLastBookingsSection('all-bookings')
      }
    }
    
    // Load vehicles for book-ride or vehicles sections
    if (activeSection === 'book-ride' || activeSection === 'vehicles') {
      if (vehicles.length === 0 && !isLoadingVehicles) {
        loadVehicles()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, location.pathname])

  // Reload bookings when limit or filters change in all-bookings section
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/rider/see-bookings')) {
      // Reset hasMoreBookings when first loading the section
      if (bookingsLimit === 5) {
        setHasMoreBookings(true)
      }
      loadAllBookings(
        bookingsLimit, 
        bookingStatusFilter || undefined,
        serviceTypeFilter || undefined
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, bookingsLimit, bookingStatusFilter, serviceTypeFilter])

  const book = async () => {
    // Dynamic validation based on service type
    let isValid = true
    let errorMessage = 'Please fill in all required fields including vehicle selection'

    if (!form.country || !form.pickup_time_local || !form.vehicle_id) {
      isValid = false
    }

    if (form.service_type === 'airport') {
      if (!form.airport_service) {
        isValid = false
        errorMessage = 'Please select airport service type (To Airport or From Airport)'
      } else if (form.airport_service === 'to_airport') {
        if (!form.pickup_location || !form.airport_location) {
          isValid = false
          errorMessage = 'Please fill in pickup location and airport location'
        }
      } else if (form.airport_service === 'from_airport') {
        if (!form.airport_location || !form.dropoff_location) {
          isValid = false
          errorMessage = 'Please fill in airport location and dropoff location'
        }
      }
    } else if (form.service_type === 'hourly') {
      if (!form.pickup_location || form.hours <= 0) {
        isValid = false
        errorMessage = 'Please fill in pickup location and hours (must be greater than 0)'
      }
    } else {
      // dropoff service
      if (!form.pickup_location || !form.dropoff_location) {
        isValid = false
        errorMessage = 'Please fill in pickup and dropoff locations'
      }
    }

    if (!isValid) {
      setError(errorMessage)
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      // Build coordinates object based on service type
      let coordinates: { plat: number; plon: number; dlat: number; dlon: number } | undefined

      if (form.service_type === 'airport') {
        if (form.airport_service === 'to_airport') {
          // Pickup location + Airport location
          if (form.pickup_coordinates && form.airport_coordinates) {
            coordinates = {
              plat: form.pickup_coordinates.lat,
              plon: form.pickup_coordinates.lng,
              dlat: form.airport_coordinates.lat,
              dlon: form.airport_coordinates.lng,
            }
          }
        } else if (form.airport_service === 'from_airport') {
          // Airport location + Dropoff location
          if (form.airport_coordinates && form.dropoff_coordinates) {
            coordinates = {
              plat: form.airport_coordinates.lat,
              plon: form.airport_coordinates.lng,
              dlat: form.dropoff_coordinates.lat,
              dlon: form.dropoff_coordinates.lng,
            }
          }
        }
      } else if (form.service_type === 'hourly') {
        // Hourly service - dropoff is optional, so use 0 if not provided
        if (form.pickup_coordinates) {
          coordinates = {
            plat: form.pickup_coordinates.lat,
            plon: form.pickup_coordinates.lng,
            dlat: form.dropoff_coordinates?.lat || 0,
            dlon: form.dropoff_coordinates?.lng || 0,
          }
        }
      } else {
        // Regular dropoff service
        if (form.pickup_coordinates && form.dropoff_coordinates) {
          coordinates = {
            plat: form.pickup_coordinates.lat,
            plon: form.pickup_coordinates.lng,
            dlat: form.dropoff_coordinates.lat,
            dlon: form.dropoff_coordinates.lng,
          }
        }
      }

      // Log coordinates for debugging
      console.log('Coordinates being sent:', coordinates)
      console.log('Form coordinates state:', {
        pickup: form.pickup_coordinates,
        dropoff: form.dropoff_coordinates,
        airport: form.airport_coordinates
      })

      // Determine pickup and dropoff locations based on service type
      let pickupLocation = form.pickup_location
      let dropoffLocation = form.dropoff_location

      if (form.service_type === 'airport') {
        if (form.airport_service === 'to_airport') {
          dropoffLocation = form.airport_location
        } else if (form.airport_service === 'from_airport') {
          pickupLocation = form.airport_location
        }
      }

      const bookingPayload = {
        vehicle_id: form.vehicle_id,
        country: form.country,
        service_type: form.service_type,
        pickup_location: pickupLocation,
        pickup_time: new Date(form.pickup_time_local).toISOString(),
        dropoff_location: dropoffLocation,
        notes: form.notes || undefined,
        coordinates,
        airport_service: form.service_type === 'airport' && form.airport_service ? (form.airport_service as 'to_airport' | 'from_airport') : undefined,
        hours: form.service_type === 'hourly' ? form.hours : undefined,
      }

      // Log the booking request to console
      console.log('Booking Request:', bookingPayload)

      const response = await createBooking(bookingPayload)
      if (response.success && response.data) {
        setForm({ 
          vehicle_id: 0, 
          country: '', 
          service_type: 'dropoff',
          airport_service: '',
          pickup_location: '', 
          dropoff_location: '',
          airport_location: '',
          pickup_time_local: '',
          hours: 0,
          notes: '',
          pickup_coordinates: null,
          dropoff_coordinates: null,
          airport_coordinates: null,
        })
        setError('')
        // Navigate to confirmation page with booking data
        navigate('/rider/confirm-booking', {
          state: { booking: response.data }
        })
      } else {
        setError(response.message || 'Failed to create booking')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'cancelled':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusColorHex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'confirmed':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'cancelled':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    const color = getStatusColorHex(status)
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
      case 'confirmed':
        return <CheckCircle size={14} style={{ color }} />
      case 'pending':
        return <Clock size={14} style={{ color }} />
      case 'cancelled':
        return <XCircle size={14} style={{ color }} />
      default:
        return <WarningCircle size={14} style={{ color }} />
    }
  }

  const handleStatusFilterChange = (value: string) => {
    setBookingStatusFilter(value)
    // Reset limit when filter changes
    setBookingsLimit(5)
    setHasMoreBookings(true)
  }

  const handleServiceTypeFilterChange = (value: string) => {
    setServiceTypeFilter(value)
    // Reset limit when filter changes
    setBookingsLimit(5)
    setHasMoreBookings(true)
  }

  const handleNestedFilterChange = (value: string) => {
    setLastSelectedFilter(value)
    
    if (!value) {
      // Clear all filters
      setBookingStatusFilter('')
      setServiceTypeFilter('')
      setBookingsLimit(5)
      setHasMoreBookings(true)
      return
    }
    
    const [category, filterValue] = value.split(':')
    
    if (category === 'status') {
      setBookingStatusFilter(filterValue || '')
    } else if (category === 'service_type') {
      setServiceTypeFilter(filterValue || '')
    }
    
    // Reset limit when filter changes
    setBookingsLimit(5)
    setHasMoreBookings(true)
  }

  const removeFilter = (type: 'status' | 'service_type') => {
    if (type === 'status') {
      setBookingStatusFilter('')
    } else {
      setServiceTypeFilter('')
    }
    setBookingsLimit(5)
    setHasMoreBookings(true)
  }

  const handleShowMore = () => {
    setBookingsLimit(prev => prev + 5)
  }

  // Filter bookings
  const now = new Date()
  const recentBookings = bookings
    .filter(b => {
      const pickupDate = new Date(b.pickup_time)
      return pickupDate < now
    })
    .sort((a, b) => new Date(b.pickup_time).getTime() - new Date(a.pickup_time).getTime())
    .slice(0, 5)

  const upcomingBookings = bookings
    .filter(b => {
      const pickupDate = new Date(b.pickup_time)
      return pickupDate >= now && b.booking_status?.toLowerCase() !== 'cancelled'
    })
    .sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime())
    .slice(0, 5)

  // Use analytics data if available, otherwise fallback to calculated values
  const dashboardTotalBookings = analytics?.total ?? bookings.length
  const completedBookings = analytics?.completed ?? bookings.filter(b => b.booking_status?.toLowerCase() === 'completed').length
  const pendingBookings = analytics?.pending ?? bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length
  const confirmedBookings = analytics?.confirmed ?? 0
  const cancelledBookings = analytics?.cancelled ?? 0

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'Dashboard', icon: SquaresFour },
    { id: 'book-ride' as MenuSection, label: 'Book a Ride', icon: BookOpen },
    { id: 'all-bookings' as MenuSection, label: 'See All Bookings', icon: List },
    { id: 'vehicles' as MenuSection, label: 'See Vehicles', icon: Truck },
  ]

  const handleMenuSelect = (section: MenuSection) => {
    // Navigate to the appropriate URL
    if (section === 'dashboard') {
      navigate('/rider/dashboard')
    } else if (section === 'book-ride') {
      navigate('/rider/book')
    } else if (section === 'all-bookings') {
      navigate('/rider/see-bookings')
    } else if (section === 'vehicles') {
      navigate('/rider/vehicles')
    }
    setIsMenuOpen(false) // Close menu on mobile when selecting
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bw-bg)',
      fontFamily: 'Work Sans, sans-serif',
      position: 'relative'
    }}>
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

      {/* Sidebar Menu */}
      <div
        className="rider-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: isMobile ? (isMenuOpen ? '0' : '-100%') : '0',
          width: isMobile ? '100%' : 'clamp(280px, 25vw, 320px)',
          height: '100vh',
          backgroundColor: 'var(--bw-bg)',
          borderRight: '1px solid var(--bw-border)',
          zIndex: 999,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--bw-shadow, 0 4px 6px rgba(0, 0, 0, 0.1))'
        }}
      >
        {/* Company Logo/Name in Sidebar */}
        <div style={{
          padding: 'clamp(16px, 2.5vw, 24px)',
          borderBottom: '1px solid var(--bw-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {tenantInfo ? (
            tenantInfo.logo_url ? (
              <img 
                src={tenantInfo.logo_url} 
                alt={tenantInfo.company_name || 'Company Logo'}
                style={{
                  maxHeight: 'clamp(40px, 5vw, 50px)',
                  maxWidth: 'clamp(120px, 20vw, 180px)',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 600,
                color: 'var(--bw-text)',
                fontFamily: 'DM Sans, sans-serif',
                flex: 1
              }}>
                {tenantInfo.company_name}
              </h1>
            )
          ) : (
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: 600,
              color: 'var(--bw-text)',
              fontFamily: 'DM Sans, sans-serif',
              flex: 1
            }}>
              Rider Dashboard
            </h1>
          )}
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              minWidth: '40px',
              minHeight: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--bw-text)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{
          flex: 1,
          padding: 'clamp(12px, 2vw, 20px) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleMenuSelect(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(12px, 2vw, 16px)',
                  padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
                  backgroundColor: activeSection === item.id ? 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))' : 'transparent',
                  border: 'none',
                  borderLeft: activeSection === item.id ? '3px solid var(--bw-fg)' : '3px solid transparent',
                  color: 'var(--bw-text)',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: activeSection === item.id ? 500 : 300,
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <IconComponent size={20} style={{ flexShrink: 0, width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer Section */}
        <div style={{
          padding: 'clamp(12px, 2vw, 20px)',
          borderTop: '1px solid var(--bw-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Link 
            to="/riders/profile" 
            style={{ textDecoration: 'none' }}
          >
            <button 
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 3vw, 24px)',
                backgroundColor: 'transparent',
                border: '1px solid var(--bw-border)',
                borderRadius: '6px',
                color: 'var(--bw-text)',
                cursor: 'pointer',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: 'Work Sans, sans-serif',
                fontWeight: 300
              }}
            >
              <UserCircle size={18} />
              Profile
            </button>
          </Link>
          <button
            onClick={() => {
              useAuthStore.getState().logout()
              // Login URL - subdomain handles tenant context
              navigate('/riders/login', { replace: true })
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 3vw, 24px)',
              backgroundColor: 'transparent',
              border: '1px solid var(--bw-border)',
              borderRadius: '6px',
              color: 'var(--bw-text)',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 300
            }}
          >
            <SignOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        padding: 'clamp(12px, 2.5vw, 24px)',
        marginLeft: isMobile ? '0' : 'clamp(280px, 25vw, 320px)',
        transition: 'margin-left 0.3s ease'
      }}
      className="rider-main-content"
      >
        {/* Top Bar with Hamburger Menu */}
        <div style={{ 
          marginBottom: 'clamp(16px, 3vw, 24px)',
          paddingBottom: 'clamp(12px, 2vw, 16px)',
          borderBottom: '1px solid var(--bw-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          {isMobile && (
            <button
              className="rider-hamburger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                minWidth: '40px',
                minHeight: '40px',
                backgroundColor: 'transparent',
                border: '1px solid var(--bw-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'var(--bw-text)'
              }}
            >
              <List size={20} />
            </button>
          )}

          <h1 style={{
            margin: 0,
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: 200,
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--bw-text)',
            flex: 1
          }}>
            {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: 'clamp(10px, 2vw, 12px)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#ef4444',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(13px, 2vw, 14px)'
          }}>
            {error}
          </div>
        )}

        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 3vw, 24px)' }}>
            {(isLoadingAnalytics || (isLoadingBookings && bookings.length === 0)) ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                Loading dashboard...
              </div>
            ) : (
              <>
            {/* Stats Cards - 2x2 Grid on Mobile */}
            <div 
              className="rider-stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'clamp(12px, 2vw, 16px)'
              }}
            >
              <div style={{
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                padding: 'clamp(16px, 3vw, 24px)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 700,
                  color: 'var(--bw-text)',
                  marginBottom: '8px',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  {dashboardTotalBookings}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 300
                }}>
                  Total Bookings
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                padding: 'clamp(16px, 3vw, 24px)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 700,
                  color: 'var(--bw-text)',
                  marginBottom: '8px',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  {completedBookings}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 300
                }}>
                  Completed
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                padding: 'clamp(16px, 3vw, 24px)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 700,
                  color: 'var(--bw-text)',
                  marginBottom: '8px',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  {pendingBookings}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 300
                }}>
                  Pending
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 30vw, 250px), 1fr))',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <button
                onClick={() => handleMenuSelect('book-ride')}
                style={{
                  padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)',
                  backgroundColor: 'var(--bw-fg)',
                  color: 'var(--bw-bg)',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 600
                }}
              >
                Book a Ride
              </button>
              <button
                onClick={() => handleMenuSelect('all-bookings')}
                style={{
                  padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)',
                  backgroundColor: 'transparent',
                  color: 'var(--bw-text)',
                  border: '1px solid var(--bw-border)',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 600
                }}
              >
                See All Bookings
              </button>
            </div>

            {/* Recent Rides */}
            {recentBookings.length > 0 && (
              <div style={{
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                padding: 'clamp(16px, 3vw, 20px)'
              }}>
                <h2 style={{
                  margin: '0 0 clamp(16px, 3vw, 20px) 0',
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 400,
                  fontFamily: 'Work Sans, sans-serif',
                  color: 'var(--bw-text)'
                }}>
                  Recent Rides
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        border: '1px solid var(--bw-border)',
                        borderRadius: '8px',
                        padding: 'clamp(12px, 2vw, 16px)',
                        backgroundColor: 'var(--bw-bg)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(14px, 2.5vw, 16px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            marginBottom: '4px'
                          }}>
                            Booking #{booking.id}
                          </div>
                          <div style={{
                            fontSize: 'clamp(10px, 1.5vw, 11px)',
                            color: '#9ca3af',
                            fontWeight: 300
                          }}>
                            {formatDate(booking.pickup_time)}
                          </div>
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: booking.booking_status?.toLowerCase() === 'pending' 
                            ? '#fed7aa' 
                            : getStatusColor(booking.booking_status) + '20',
                          color: booking.booking_status?.toLowerCase() === 'pending'
                            ? '#c2410c'
                            : getStatusColor(booking.booking_status),
                          fontSize: 'clamp(11px, 1.8vw, 12px)',
                          fontWeight: 500
                        }}>
                          {booking.booking_status}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        opacity: 0.8
                      }}>
                        <MapPin size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                        <span>{booking.pickup_location} → {booking.dropoff_location || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Rides */}
            {upcomingBookings.length > 0 && (
              <div style={{
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                padding: 'clamp(16px, 3vw, 20px)'
              }}>
                <h2 style={{
                  margin: '0 0 clamp(16px, 3vw, 20px) 0',
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 400,
                  fontFamily: 'Work Sans, sans-serif',
                  color: 'var(--bw-text)'
                }}>
                  Upcoming Rides
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      style={{
                        border: '1px solid var(--bw-border)',
                        borderRadius: '8px',
                        padding: 'clamp(12px, 2vw, 16px)',
                        backgroundColor: 'var(--bw-bg)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(14px, 2.5vw, 16px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            marginBottom: '4px'
                          }}>
                            Booking #{booking.id}
                          </div>
                          <div style={{
                            fontSize: 'clamp(10px, 1.5vw, 11px)',
                            color: '#9ca3af',
                            fontWeight: 300
                          }}>
                            {formatDate(booking.pickup_time)}
                          </div>
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: booking.booking_status?.toLowerCase() === 'pending' 
                            ? '#fed7aa' 
                            : getStatusColor(booking.booking_status) + '20',
                          color: booking.booking_status?.toLowerCase() === 'pending'
                            ? '#c2410c'
                            : getStatusColor(booking.booking_status),
                          fontSize: 'clamp(11px, 1.8vw, 12px)',
                          fontWeight: 500
                        }}>
                          {booking.booking_status}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        opacity: 0.8
                      }}>
                        <MapPin size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                        <span>{booking.pickup_location} → {booking.dropoff_location || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentBookings.length === 0 && upcomingBookings.length === 0 && !isLoadingBookings && (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                No bookings yet. Book your first ride!
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* Book a Ride Section */}
        {activeSection === 'book-ride' && (
          <div style={{
            backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
            border: '1px solid var(--bw-border)',
            borderRadius: '12px',
            padding: 'clamp(16px, 3vw, 20px)',
            position: 'relative',
            overflow: 'visible'
          }}>
            <h2 style={{
              margin: '0 0 clamp(16px, 3vw, 20px) 0',
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: 400,
              fontFamily: 'Work Sans, sans-serif',
              color: 'var(--bw-text)'
            }}>
              Book a Ride
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 2.5vw, 16px)',
              position: 'relative',
              overflow: 'visible'
            }}>
              {/* Service Type and Payment Method */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 25vw, 200px), 1fr))',
                gap: 'clamp(12px, 2.5vw, 16px)'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    Service Type
                  </label>
                  <select 
                    className="bw-input" 
                    value={form.service_type} 
                    onChange={(e) => setForm({ 
                      ...form, 
                      service_type: e.target.value as any,
                      airport_service: '', // Reset airport service when changing service type
                      hours: 0, // Reset hours when changing service type
                    })}
                    style={{
                      width: '100%',
                      padding: 'clamp(10px, 2vw, 12px)',
                      borderRadius: '8px',
                      border: '1px solid var(--bw-border)',
                      backgroundColor: 'var(--bw-bg)',
                      color: 'var(--bw-text)',
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: 'clamp(13px, 2vw, 14px)'
                    }}
                  >
                    <option value="dropoff">Dropoff</option>
                    <option value="airport">Airport</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>

                {/* Airport Service Type - Only show when service_type is airport */}
                {form.service_type === 'airport' && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      fontWeight: 500,
                      color: 'var(--bw-text)'
                    }}>
                      Airport Service *
                    </label>
                    <select 
                      className="bw-input" 
                      value={form.airport_service} 
                      onChange={(e) => setForm({ ...form, airport_service: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: 'clamp(10px, 2vw, 12px)',
                        borderRadius: '8px',
                        border: '1px solid var(--bw-border)',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)',
                        fontFamily: 'Work Sans, sans-serif',
                        fontSize: 'clamp(13px, 2vw, 14px)'
                      }}
                    >
                      <option value="">Select airport service</option>
                      <option value="to_airport">To Airport</option>
                      <option value="from_airport">From Airport</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Vehicle */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontWeight: 500,
                  color: 'var(--bw-text)'
                }}>
                  Vehicle *
                </label>
                <select 
                  className="bw-input vehicle-select" 
                  value={form.vehicle_id || ''} 
                  onChange={(e) => setForm({ ...form, vehicle_id: parseInt(e.target.value) || 0 })}
                  required
                  style={{
                    width: '100%',
                    padding: 'clamp(10px, 2vw, 12px)',
                    borderRadius: '8px',
                    border: '1px solid var(--bw-border)',
                    backgroundColor: 'var(--bw-bg)',
                    color: 'var(--bw-text)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    position: 'relative',
                    zIndex: 10,
                    WebkitAppearance: 'menulist',
                    appearance: 'menulist',
                    cursor: 'pointer',
                    minHeight: '44px'
                  }}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''} - {vehicle.vehicle_category?.vehicle_category || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <CountryAutocomplete
                  value={form.country}
                  onChange={(value) => setForm({ ...form, country: value })}
                  placeholder="Enter country"
                  label="Country"
                  required
                  disabled={isLoading || isLoadingVehicles}
                />
              </div>

              {/* Pickup Location - Hidden when airport service is from_airport */}
              {!(form.service_type === 'airport' && form.airport_service === 'from_airport') && (
                <div>
                  <LocationAutocomplete
                    value={form.pickup_location}
                    onChange={(value) => setForm({ ...form, pickup_location: value })}
                    onLocationSelect={(address, coordinates) => {
                      setForm({ 
                        ...form, 
                        pickup_location: address,
                        pickup_coordinates: coordinates || null
                      })
                    }}
                    placeholder="Enter pickup address"
                    label="Pickup Location *"
                    isAirportOnly={false}
                    disabled={isLoading || isLoadingVehicles}
                    country={form.country}
                  />
                </div>
              )}

              {/* Airport Location - Shown when airport service is selected */}
              {form.service_type === 'airport' && form.airport_service && (
                <div>
                  <LocationAutocomplete
                    value={form.airport_location}
                    onChange={(value) => setForm({ ...form, airport_location: value })}
                    onLocationSelect={(address, coordinates) => {
                      setForm({ 
                        ...form, 
                        airport_location: address,
                        airport_coordinates: coordinates || null
                      })
                    }}
                    placeholder="Enter airport location"
                    label="Airport Location *"
                    isAirportOnly={true}
                    disabled={isLoading || isLoadingVehicles}
                    country={form.country}
                  />
                </div>
              )}

              {/* Dropoff Location - Hidden when airport service is to_airport, optional when hourly */}
              {!(form.service_type === 'airport' && form.airport_service === 'to_airport') && (
                <div>
                  <LocationAutocomplete
                    value={form.dropoff_location}
                    onChange={(value) => setForm({ ...form, dropoff_location: value })}
                    onLocationSelect={(address, coordinates) => {
                      setForm({ 
                        ...form, 
                        dropoff_location: address,
                        dropoff_coordinates: coordinates || null
                      })
                    }}
                    placeholder="Enter dropoff address"
                    label={form.service_type === 'hourly' ? 'Dropoff Location (Optional)' : 'Dropoff Location *'}
                    isAirportOnly={false}
                    disabled={isLoading || isLoadingVehicles}
                    country={form.country}
                  />
                </div>
              )}

              {/* Hours - Only show when service_type is hourly */}
              {form.service_type === 'hourly' && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    Hours *
                  </label>
                  <input 
                    className="bw-input" 
                    type="number"
                    min="1"
                    placeholder="Enter number of hours" 
                    value={form.hours || ''} 
                    onChange={(e) => setForm({ ...form, hours: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: 'clamp(10px, 2vw, 12px)',
                      borderRadius: '8px',
                      border: '1px solid var(--bw-border)',
                      backgroundColor: 'var(--bw-bg)',
                      color: 'var(--bw-text)',
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: 'clamp(13px, 2vw, 14px)'
                    }}
                  />
                </div>
              )}

              {/* Pickup Time */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontWeight: 500,
                  color: 'var(--bw-text)'
                }}>
                  <Calendar size={16} />
                  Pickup Time *
                </label>
                <input 
                  className="bw-input datetime-input" 
                  type="datetime-local" 
                  value={form.pickup_time_local} 
                  onChange={(e) => setForm({ ...form, pickup_time_local: e.target.value })}
                  onClick={(e) => {
                    const input = e.currentTarget
                    input.focus()
                    // Try to show picker if available (modern browsers)
                    if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
                      try {
                        (input as any).showPicker()
                      } catch (err) {
                        // Fallback to focus if showPicker fails
                        input.focus()
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: 'clamp(10px, 2vw, 12px)',
                    borderRadius: '8px',
                    border: '1px solid var(--bw-border)',
                    backgroundColor: 'var(--bw-bg)',
                    color: 'var(--bw-text)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    minHeight: '44px',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontWeight: 500,
                  color: 'var(--bw-text)'
                }}>
                  Notes (Optional)
                </label>
                <textarea 
                  className="bw-input" 
                  placeholder="Any special instructions..." 
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: 'clamp(10px, 2vw, 12px)',
                    borderRadius: '8px',
                    border: '1px solid var(--bw-border)',
                    backgroundColor: 'var(--bw-bg)',
                    color: 'var(--bw-text)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button 
                className="bw-btn" 
                onClick={book}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)',
                  borderRadius: 7,
                  backgroundColor: 'var(--bw-fg)',
                  color: 'var(--bw-bg)',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Booking...' : 'Book Ride'}
              </button>
            </div>
          </div>
        )}

        {/* All Bookings Section */}
        {activeSection === 'all-bookings' && (
          <div style={{
            backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
            border: '1px solid var(--bw-border)',
            borderRadius: '12px',
            padding: 'clamp(16px, 3vw, 20px)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: 'clamp(16px, 3vw, 20px)',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              {/* Filter Dropdown */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 1.5vw, 12px)',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(8px, 1.5vw, 12px)',
                  flexWrap: 'wrap'
                }}>
                  <label style={{
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    color: 'var(--bw-text)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: 300,
                    opacity: 0.8
                  }}>
                    Filter by:
                  </label>
                  
                  {/* Single Nested Filter Dropdown */}
                  <select
                    value={lastSelectedFilter}
                    onChange={(e) => {
                      const optionValue = e.target.value
                      handleNestedFilterChange(optionValue)
                    }}
                    disabled={isLoadingBookings}
                    style={{
                      padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                      border: '1px solid var(--bw-border)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bw-bg)',
                      color: 'var(--bw-text)',
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      fontFamily: 'Work Sans, sans-serif',
                      fontWeight: 300,
                      cursor: isLoadingBookings ? 'not-allowed' : 'pointer',
                      opacity: isLoadingBookings ? 0.6 : 1,
                      minWidth: 'clamp(180px, 25vw, 220px)'
                    }}
                  >
                    <option value="" style={{ color: 'var(--bw-text)', opacity: 0.6, fontWeight: 300 }}>Select Filter</option>
                    
                    {/* Status Group */}
                    <optgroup label="Status" style={{ 
                      color: 'var(--bw-text)', 
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}>
                      <option value="status:" style={{ 
                        color: 'var(--bw-text)', 
                        opacity: 0.6, 
                        fontWeight: 300
                      }}>All Statuses</option>
                      <option value="status:pending" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Pending</option>
                      <option value="status:confirmed" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Confirmed</option>
                      <option value="status:completed" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Completed</option>
                      <option value="status:cancelled" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Cancelled</option>
                    </optgroup>
                    
                    {/* Service Type Group */}
                    <optgroup label="Service Type" style={{ 
                      color: 'var(--bw-text)', 
                      fontWeight: 400,
                      fontStyle: 'normal'
                    }}>
                      <option value="service_type:" style={{ 
                        color: 'var(--bw-text)', 
                        opacity: 0.6, 
                        fontWeight: 300
                      }}>All Service Types</option>
                      <option value="service_type:airport" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Airport</option>
                      <option value="service_type:dropoff" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Dropoff</option>
                      <option value="service_type:hourly" style={{ 
                        color: 'var(--bw-text)', 
                        fontWeight: 300
                      }}>Hourly</option>
                    </optgroup>
                  </select>
                </div>

                {/* Selected Filter Tags */}
                {(bookingStatusFilter || serviceTypeFilter) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1.5vw, 8px)',
                    flexWrap: 'wrap'
                  }}>
                    {bookingStatusFilter && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 'clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 12px)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '6px',
                        fontSize: 'clamp(12px, 1.8vw, 13px)',
                        fontFamily: 'Work Sans, sans-serif',
                        fontWeight: 300,
                        color: 'var(--bw-text)'
                      }}>
                        <span>Status: {bookingStatusFilter.charAt(0).toUpperCase() + bookingStatusFilter.slice(1)}</span>
                        <button
                          onClick={() => removeFilter('status')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.7
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {serviceTypeFilter && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 'clamp(4px, 1vw, 6px) clamp(8px, 1.5vw, 12px)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '6px',
                        fontSize: 'clamp(12px, 1.8vw, 13px)',
                        fontFamily: 'Work Sans, sans-serif',
                        fontWeight: 300,
                        color: 'var(--bw-text)'
                      }}>
                        <span>Service: {serviceTypeFilter === 'dropoff' ? 'Dropoff' : serviceTypeFilter.charAt(0).toUpperCase() + serviceTypeFilter.slice(1)}</span>
                        <button
                          onClick={() => removeFilter('service_type')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.7
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isLoadingBookings && bookings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                No bookings yet. Book your first ride!
              </div>
            ) : (
              <>
              {isLoadingBookings && bookings.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: 'clamp(20px, 4vw, 30px)',
                  color: 'var(--bw-text)',
                  opacity: 0.6,
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  marginBottom: 'clamp(12px, 2.5vw, 16px)'
                }}>
                  Loading...
                </div>
              )}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(12px, 2.5vw, 16px)'
              }}>
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      border: '1px solid var(--bw-border)',
                      borderRadius: '8px',
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      backgroundColor: 'var(--bw-bg)'
                    }}
                  >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(16px, 3vw, 18px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            marginBottom: '4px'
                          }}>
                            Booking #{booking.id}
                          </div>
                        </div>
                        {booking.booking_status && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: getStatusColorHex(booking.booking_status) + '20',
                            border: `1px solid ${getStatusColorHex(booking.booking_status)}`,
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            fontFamily: 'Work Sans, sans-serif',
                            fontWeight: 500,
                            color: getStatusColorHex(booking.booking_status)
                          }}>
                            {getStatusIcon(booking.booking_status)}
                            <span style={{ textTransform: 'capitalize' }}>
                              {booking.booking_status}
                            </span>
                          </div>
                        )}
                      </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(10px, 2vw, 12px)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <MapPin size={16} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Pickup</div>
                          <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.pickup_location}</div>
                          <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#9ca3af', fontWeight: 300, marginTop: '4px' }}>
                            {formatDate(booking.pickup_time)}
                          </div>
                        </div>
                      </div>

                      {booking.dropoff_location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          <MapPin size={16} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Dropoff</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.dropoff_location}</div>
                            {booking.dropoff_time && (
                              <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#9ca3af', fontWeight: 300, marginTop: '4px' }}>
                                {formatDate(booking.dropoff_time)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 20vw, 150px), 1fr))',
                        gap: 'clamp(10px, 2vw, 12px)',
                        marginTop: '8px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--bw-border)'
                      }}>
                        <div>
                          <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Service</div>
                          <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif', textTransform: 'capitalize' }}>
                            {booking.service_type}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Payment</div>
                          <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif', textTransform: 'capitalize' }}>
                            {booking.payment_method}
                          </div>
                        </div>
                        {booking.estimated_price > 0 && (
                          <div>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Price</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                              ${booking.estimated_price.toFixed(2)}
                            </div>
                          </div>
                        )}
                        {booking.vehicle && (
                          <div>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Vehicle</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.vehicle}</div>
                          </div>
                        )}
                        {booking.driver_name && (
                          <div>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Driver</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.driver_name}</div>
                          </div>
                        )}
                      </div>

                      {booking.notes && (
                        <div style={{
                          marginTop: '8px',
                          padding: 'clamp(10px, 2vw, 12px)',
                          backgroundColor: 'var(--bw-bg)',
                          borderRadius: '6px',
                          fontSize: 'clamp(12px, 2vw, 14px)',
                          color: 'var(--bw-text)',
                          opacity: 0.8
                        }}>
                          <strong>Notes:</strong> {booking.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'clamp(8px, 2vw, 12px)',
                marginTop: 'clamp(16px, 3vw, 24px)'
              }}>
                {!hasMoreBookings && bookings.length > 0 && (
                  <div style={{
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    color: 'var(--bw-text)',
                    opacity: 0.7,
                    fontFamily: 'Work Sans, sans-serif',
                    textAlign: 'center'
                  }}>
                    That's all your bookings so far
                  </div>
                )}
                <button
                  onClick={handleShowMore}
                  disabled={isLoadingBookings || !hasMoreBookings}
                  style={{
                    padding: 'clamp(12px, 2.5vw, 16px) clamp(24px, 4vw, 32px)',
                    backgroundColor: 'var(--bw-fg)',
                    color: 'var(--bw-bg)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: (isLoadingBookings || !hasMoreBookings) ? 'not-allowed' : 'pointer',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: 600,
                    opacity: (isLoadingBookings || !hasMoreBookings) ? 0.4 : 1,
                    filter: !hasMoreBookings ? 'blur(0.5px)' : 'none',
                    transition: 'opacity 0.2s ease, filter 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoadingBookings && hasMoreBookings) {
                      e.currentTarget.style.opacity = '0.9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoadingBookings && hasMoreBookings) {
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                >
                  {isLoadingBookings ? 'Loading...' : 'Show More'}
                </button>
              </div>
              </>
            )}
          </div>
        )}

        {/* Vehicles Section */}
        {activeSection === 'vehicles' && (
          <div style={{
            backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
            border: '1px solid var(--bw-border)',
            borderRadius: '12px',
            padding: 'clamp(16px, 3vw, 20px)'
          }}>
            <h2 style={{
              margin: '0 0 clamp(16px, 3vw, 20px) 0',
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: 400,
              fontFamily: 'Work Sans, sans-serif',
              color: 'var(--bw-text)'
            }}>
              Vehicles
            </h2>

            {isLoadingVehicles && vehicles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                Loading vehicles...
              </div>
            ) : vehicles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                No vehicles available.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 35vw, 300px), 1fr))',
                gap: 'clamp(12px, 2.5vw, 16px)'
              }}>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    style={{
                      border: '1px solid var(--bw-border)',
                      borderRadius: '8px',
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      backgroundColor: 'var(--bw-bg)'
                    }}
                  >
                    {/* Vehicle Images */}
                    {vehicle.vehicle_images && Object.keys(vehicle.vehicle_images).length > 0 && (
                      <div style={{
                        marginBottom: 'clamp(12px, 2vw, 16px)',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollBehavior: 'smooth',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--bw-border) var(--bw-bg)',
                        WebkitOverflowScrolling: 'touch'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: 'clamp(8px, 1.5vw, 12px)',
                          paddingBottom: '4px'
                        }}>
                          {Object.entries(vehicle.vehicle_images).map(([imageType, imageUrl]) => (
                            <img
                              key={imageType}
                              src={imageUrl}
                              alt={`${vehicle.make} ${vehicle.model} - ${imageType.replace('_', ' ')}`}
                              style={{
                                minWidth: 'clamp(120px, 25vw, 180px)',
                                width: 'clamp(120px, 25vw, 180px)',
                                height: 'clamp(90px, 20vw, 135px)',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid var(--bw-border)',
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <Car size={24} style={{ color: 'var(--bw-text)', opacity: 0.7 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 'clamp(16px, 3vw, 18px)',
                          fontWeight: 600,
                          color: 'var(--bw-text)',
                          marginBottom: '4px'
                        }}>
                          {vehicle.make} {vehicle.model}
                        </div>
                        {vehicle.year && (
                          <div style={{
                            fontSize: 'clamp(12px, 2vw, 13px)',
                            color: 'var(--bw-text)',
                            opacity: 0.7
                          }}>
                            {vehicle.year}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--bw-border)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'clamp(12px, 2vw, 13px)'
                      }}>
                        <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Category:</span>
                        <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                          {vehicle.vehicle_category?.vehicle_category || 'N/A'}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'clamp(12px, 2vw, 13px)'
                      }}>
                        <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Seating:</span>
                        <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                          {vehicle.seating_capacity || 'N/A'}
                        </span>
                      </div>
                      {vehicle.license_plate && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'clamp(12px, 2vw, 13px)'
                        }}>
                          <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>License:</span>
                          <span style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                            {vehicle.license_plate}
                          </span>
                        </div>
                      )}
                      {vehicle.color && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 'clamp(12px, 2vw, 13px)'
                        }}>
                          <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Color:</span>
                          <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                            {vehicle.color}
                          </span>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 'clamp(12px, 2vw, 13px)'
                      }}>
                        <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Status:</span>
                        <span style={{
                          color: vehicle.status === 'active' ? '#10b981' : '#6b7280',
                          fontWeight: 300,
                          fontFamily: 'Work Sans, sans-serif'
                        }}>
                          {vehicle.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responsive Styles */}
      <style>{`
        /* Stats Grid: 2x2 on mobile, 3 columns on desktop */
        @media (max-width: 768px) {
          .rider-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .datetime-inputs-container {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (min-width: 769px) {
          .rider-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        /* Ensure datetime-local inputs work properly on all devices */
        input[type="datetime-local"] {
          position: relative;
          z-index: 1;
        }
        
        /* Mobile-specific datetime input styling */
        @media (max-width: 768px) {
          input[type="datetime-local"] {
            font-size: 16px !important; /* Prevents zoom on iOS */
            padding: 12px !important;
            min-height: 44px !important; /* Touch-friendly size */
          }
          
          /* Ensure calendar picker is accessible */
          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            padding: 4px;
            cursor: pointer;
            opacity: 0.8;
          }
          
          input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
        }
        
        /* Ensure calendar picker displays properly */
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.7;
          padding: 4px;
        }
        
        input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        /* iOS-specific select dropdown fixes */
        select.vehicle-select {
          position: relative !important;
          z-index: 10 !important;
          -webkit-appearance: menulist !important;
          appearance: menulist !important;
        }
        
        /* Ensure select dropdown works on iOS */
        @media (max-width: 768px) {
          select.vehicle-select {
            font-size: 16px !important; /* Prevents zoom on iOS */
            min-height: 44px !important; /* Touch-friendly size */
            padding: 12px 40px 12px 12px !important; /* Extra padding for dropdown arrow */
            -webkit-appearance: menulist !important;
            appearance: menulist !important;
            background-image: none !important;
            position: relative !important;
            z-index: 10 !important;
          }
          
          /* Ensure parent containers don't clip the dropdown */
          select.vehicle-select:focus {
            z-index: 1000 !important;
            position: relative !important;
          }
        }
        
        /* Fix for iOS Safari select dropdown visibility */
        @supports (-webkit-touch-callout: none) {
          select.vehicle-select {
            -webkit-appearance: menulist !important;
            appearance: menulist !important;
            position: relative !important;
            z-index: 10 !important;
          }
          
          select.vehicle-select:active,
          select.vehicle-select:focus {
            z-index: 1000 !important;
            position: relative !important;
          }
          
          /* Ensure parent containers don't create stacking contexts that clip dropdowns */
          .rider-main-content {
            overflow: visible !important;
          }
          
          /* Allow select dropdown to escape container bounds on iOS */
          select.vehicle-select {
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
        }
        
        /* Additional iOS fix: ensure select is clickable and dropdown appears */
        @media (max-width: 768px) {
          select.vehicle-select {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          /* Prevent parent from clipping dropdown */
          .rider-main-content > div {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  )
}
