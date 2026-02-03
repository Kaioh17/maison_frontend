import { useEffect, useState, useRef } from 'react'
import { getDriverInfo, getAvailableRides, respondToRide, updateDriverStatus, getUpcomingRides, getBookingAnalytics, type DriverResponse, type BookingAnalytics } from '@api/driver'
import { getVehicles, type VehicleResponse } from '@api/vehicles'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import { MapPin, Calendar, CreditCard, Car, User, SignOut, UserCircle, List, X, SquaresFour, CheckCircle, XCircle, Phone, WarningCircle, Clock, FileText, CaretLeft, CaretRight, NavigationArrow, ArrowRight, MapTrifold } from '@phosphor-icons/react'
import type { BookingResponse } from '@api/tenant'
import { getBookings } from '@api/bookings'

type MenuSection = 'dashboard' | 'vehicles' | 'bookings'
type BookingsSubSection = 'upcoming' | 'new-requests' | 'all'

export default function DriverDashboard() {
  useFavicon()
  const [info, setInfo] = useState<DriverResponse | null>(null)
  const [rides, setRides] = useState<BookingResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [allBookings, setAllBookings] = useState<BookingResponse[]>([])
  const [bookingsLimit, setBookingsLimit] = useState(5)
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')
  const [lastSelectedFilter, setLastSelectedFilter] = useState<string>('')
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [hasMoreBookings, setHasMoreBookings] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [upcomingRides, setUpcomingRides] = useState<BookingResponse[]>([])
  const [isLoadingUpcomingRides, setIsLoadingUpcomingRides] = useState(false)
  const [newRequests, setNewRequests] = useState<BookingResponse[]>([])
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [isLoadingNewRequests, setIsLoadingNewRequests] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [activeBookingsSubSection, setActiveBookingsSubSection] = useState<BookingsSubSection | null>(null)
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [swipeProgress, setSwipeProgress] = useState<{ [key: number]: number }>({})
  const [isSwiping, setIsSwiping] = useState<{ [key: number]: boolean }>({})
  const { tenantInfo } = useTenantInfo()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle token from URL when switching from tenant to driver
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const token = searchParams.get('token')
    
    if (token) {
      try {
        // Set the driver token in auth store
        useAuthStore.getState().login({ token })
        
        // Clean up URL by removing token parameter
        const newSearchParams = new URLSearchParams(location.search)
        newSearchParams.delete('token')
        const newSearch = newSearchParams.toString()
        const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname
        navigate(newPath, { replace: true })
        
        // Clear any sessionStorage token if present
        sessionStorage.removeItem('driver-switch-token')
      } catch (err) {
        console.error('Failed to set driver token from URL:', err)
      }
    }
  }, [location.search, location.pathname, navigate])

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A'
    const phoneNumber = phone.replace(/\D/g, '')
    
    if (phoneNumber.length === 0) {
      return phone
    } else if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)} ${phoneNumber.slice(10)}`
    }
  }

  const isWithin24Hours = (updatedOn: string | null | undefined): boolean => {
    if (!updatedOn) return false
    const updatedDate = new Date(updatedOn)
    const now = new Date()
    const diffInHours = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60)
    return diffInHours <= 24 && diffInHours >= 0
  }

  const loadUpcomingRides = async () => {
    try {
      setIsLoadingUpcomingRides(true)
      const response = await getUpcomingRides()
      if (response.success && response.data) {
        setUpcomingRides(response.data)
      }
    } catch (err: any) {
      console.error('Failed to load upcoming rides:', err)
    } finally {
      setIsLoadingUpcomingRides(false)
    }
  }

  const loadNewRequests = async () => {
    try {
      setIsLoadingNewRequests(true)
      const response = await getAvailableRides({ limit: 5, booking_status: 'pending' })
      if (response.success && response.data) {
        setNewRequests(response.data)
        setCurrentRequestIndex(0) // Reset to first ride
      }
    } catch (err: any) {
      console.error('Failed to load new requests:', err)
    } finally {
      setIsLoadingNewRequests(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true)
      const response = await getBookingAnalytics()
      if (response.success && response.data) {
        setAnalytics(response.data)
      }
    } catch (err: any) {
      console.error('Failed to load analytics:', err)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const load = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const [i, r, v] = await Promise.all([
        getDriverInfo().catch((err: any) => {
          console.error('Failed to load driver info:', err)
          const errorMsg = err.response?.data?.detail || err.message || 'Failed to load driver information'
          setError(errorMsg)
          return { success: false, data: null, message: errorMsg } as any
        }),
        getAvailableRides().catch((err: any) => {
          console.error('Failed to load available rides:', err)
          // Don't set error for rides if driver info loaded successfully
          if (!info) {
            const errorMsg = err.response?.data?.detail || err.message || 'Failed to load available rides'
            setError(errorMsg)
          }
          return { success: false, data: [], message: err.response?.data?.detail || err.message } as any
        }),
        getVehicles().catch((err: any) => {
          console.error('Failed to load vehicles:', err)
          // Don't set error for vehicles if other data loaded successfully
          return { success: false, data: [], message: err.response?.data?.detail || err.message } as any
        })
      ])
      
      if (i.success && i.data) {
        setInfo(i.data)
      } else if (!i.success && i.message) {
        setError(i.message)
      }
      
      if (r.success && r.data) {
        // Show all non-completed rides
        // Filter out only completed rides, show all others regardless of update time
        const availableRides = r.data.filter((ride: BookingResponse) => {
          // Don't show completed rides
          return ride.booking_status?.toLowerCase() !== 'completed'
        })
        console.log('Available rides:', availableRides.length, 'out of', r.data.length, 'total rides')
        setRides(availableRides)
      }
      
      if (v.success && v.data) {
        setVehicles(v.data)
      }
    } catch (err: any) {
      console.error('Unexpected error loading data:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadUpcomingRides()
    loadNewRequests()
    loadAnalytics()
  }, [])

  const getActionMessage = (action: 'confirmed' | 'cancelled' | 'completed'): string => {
    switch (action) {
      case 'confirmed':
        return 'accept this ride'
      case 'cancelled':
        return 'decline this ride'
      case 'completed':
        return 'mark this ride as completed'
      default:
        return 'perform this action'
    }
  }

  const act = async (id: number, action: 'confirmed' | 'cancelled' | 'completed') => {
    const actionMessage = getActionMessage(action)
    const confirmed = window.confirm(`Are you sure you want to ${actionMessage}? Please confirm your action.`)
    
    if (!confirmed) {
      return
    }

    try {
      setError('')
      const response = await respondToRide(id, action)
      if (response.success) {
        // Reload data after successful action
        await load()
      } else {
        setError(response.message || 'Failed to update ride status')
      }
    } catch (err: any) {
      console.error('Failed to update ride status:', err)
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to update ride status')
    }
  }

  const handleStatusToggle = async (newStatus: boolean) => {
    try {
      setIsTogglingStatus(true)
      setError('')
      const response = await updateDriverStatus(newStatus)
      if (response.success && response.data) {
        // Update local state immediately
        if (info) {
          setInfo({ ...info, is_active: response.data.is_active })
        }
      } else {
        setError(response.message || 'Failed to update driver status')
      }
    } catch (err: any) {
      console.error('Failed to update driver status:', err)
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to update driver status')
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColorHex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
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
        return <CheckCircle size={14} style={{ color }} />
      case 'pending':
        return <Clock size={14} style={{ color }} />
      case 'cancelled':
        return <XCircle size={14} style={{ color }} />
      default:
        return <WarningCircle size={14} style={{ color }} />
    }
  }

  const renderStatusActionButton = (booking: BookingResponse, padding?: string) => {
    if (!booking.booking_status || !booking.id) return null

    const status = booking.booking_status
    const statusColor = getStatusColorHex(status)
    const buttonPadding = padding || '6px 12px'

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: buttonPadding,
          borderRadius: '8px',
          backgroundColor: statusColor + '20',
          border: `1px solid ${statusColor}`,
          fontSize: 'clamp(11px, 1.8vw, 12px)',
          fontFamily: 'Work Sans, sans-serif',
          fontWeight: 500,
          color: statusColor
        }}
      >
        {getStatusIcon(status)}
        <span style={{ textTransform: 'capitalize' }}>
          {status}
        </span>
      </div>
    )
  }

  const swipeStartPositions = useRef<{ [key: number]: number }>({})

  const handleSwipeStart = (rideId: number, clientX: number) => {
    swipeStartPositions.current[rideId] = clientX
    setIsSwiping(prev => ({ ...prev, [rideId]: true }))
    setSwipeProgress(prev => ({ ...prev, [rideId]: 0 }))
  }

  const handleSwipeMove = (rideId: number, clientX: number, buttonWidth: number) => {
    const startX = swipeStartPositions.current[rideId] || clientX
    const deltaX = clientX - startX
    const progress = Math.min(Math.max((deltaX / buttonWidth) * 100, 0), 100)
    setSwipeProgress(prev => ({ ...prev, [rideId]: progress }))
  }

  const handleSwipeEnd = (rideId: number, onComplete: () => void) => {
    const progress = swipeProgress[rideId] || 0
    if (progress >= 85) {
      onComplete()
    }
    setIsSwiping(prev => ({ ...prev, [rideId]: false }))
    setSwipeProgress(prev => ({ ...prev, [rideId]: 0 }))
    delete swipeStartPositions.current[rideId]
  }

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'Dashboard', icon: SquaresFour },
    { 
      id: 'bookings' as MenuSection, 
      label: 'Bookings', 
      icon: FileText,
      branches: [
        { id: 'upcoming' as BookingsSubSection, label: 'Upcoming Rides' },
        { id: 'new-requests' as BookingsSubSection, label: 'New Requests' },
        { id: 'all' as BookingsSubSection, label: 'See All Bookings' }
      ]
    },
    { id: 'vehicles' as MenuSection, label: 'Vehicles', icon: Car },
  ]

  const getActiveSectionFromUrl = (): MenuSection => {
    const path = location.pathname
    if (path.includes('/driver/bookings')) return 'bookings'
    if (path.includes('/driver/vehicles')) return 'vehicles'
    return 'dashboard'
  }

  const getActiveBookingsSubSectionFromUrl = (): BookingsSubSection | null => {
    const path = location.pathname
    if (path.includes('/driver/bookings/upcoming')) return 'upcoming'
    if (path.includes('/driver/bookings/new-requests')) return 'new-requests'
    if (path.includes('/driver/bookings/all') || path === '/driver/bookings') return 'all'
    return null
  }

  const activeSection = getActiveSectionFromUrl()
  const activeBookingsSubSectionFromUrl = getActiveBookingsSubSectionFromUrl()

  // Sync state with URL
  useEffect(() => {
    if (activeSection === 'bookings') {
      // Auto-expand bookings menu when on bookings routes
      setExpandedMenus(prev => new Set(prev).add('/driver/bookings'))
      
      if (activeBookingsSubSectionFromUrl) {
        setActiveBookingsSubSection(activeBookingsSubSectionFromUrl)
        // Navigate to default 'all' if no sub-section specified
        if (location.pathname === '/driver/bookings') {
          navigate('/driver/bookings/all', { replace: true })
        }
      } else {
        // Default to 'all' if no sub-section
        setActiveBookingsSubSection('all')
        navigate('/driver/bookings/all', { replace: true })
      }
    } else {
      setActiveBookingsSubSection(null)
    }
  }, [activeSection, activeBookingsSubSectionFromUrl, location.pathname, navigate])

  const handleMenuSelect = (section: MenuSection) => {
    if (section === 'dashboard') {
      navigate('/driver/dashboard', { replace: true })
    } else if (section === 'bookings') {
      // Toggle bookings menu expansion
      setExpandedMenus(prev => {
        const newSet = new Set(prev)
        if (newSet.has('/driver/bookings')) {
          newSet.delete('/driver/bookings')
        } else {
          newSet.add('/driver/bookings')
        }
        return newSet
      })
      // If expanding, navigate to first branch (upcoming) if none selected
      if (!expandedMenus.has('/driver/bookings')) {
        if (!activeBookingsSubSection) {
          navigate('/driver/bookings/upcoming', { replace: true })
        }
      }
    } else if (section === 'vehicles') {
      navigate('/driver/vehicles', { replace: true })
    }
    setIsMenuOpen(false)
  }

  const handleBookingsBranchSelect = (branch: BookingsSubSection) => {
    setActiveBookingsSubSection(branch)
    if (branch === 'upcoming') {
      navigate('/driver/bookings/upcoming', { replace: true })
    } else if (branch === 'new-requests') {
      navigate('/driver/bookings/new-requests', { replace: true })
    } else if (branch === 'all') {
      navigate('/driver/bookings/all', { replace: true })
    }
    setIsMenuOpen(false)
  }

  const loadAllBookings = async (limit: number, status?: string, serviceType?: string) => {
    try {
      setIsLoadingBookings(true)
      setError('')
      const previousCount = allBookings.length
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
        setAllBookings(newBookings)
        
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

  useEffect(() => {
    const path = location.pathname
    if (path.includes('/driver/bookings')) {
      if (activeBookingsSubSection === 'upcoming') {
        loadUpcomingRides()
      } else if (activeBookingsSubSection === 'new-requests') {
        loadNewRequests()
      } else if (activeBookingsSubSection === 'all') {
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
    }
  }, [location.pathname, activeBookingsSubSection, bookingsLimit, bookingStatusFilter, serviceTypeFilter])

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
        className="driver-sidebar"
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
              Driver Dashboard
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
          gap: '4px',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0
        }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isBookings = item.id === 'bookings'
            const isBookingsActive = activeSection === 'bookings'
            const hasBranches = isBookings && item.branches
            const isExpanded = hasBranches && expandedMenus.has('/driver/bookings')
            const isActive = activeSection === item.id || (hasBranches && isBookingsActive)
            
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  onClick={() => handleMenuSelect(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'clamp(12px, 2vw, 16px)',
                    padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)',
                    backgroundColor: isActive ? 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--bw-fg)' : '3px solid transparent',
                    color: 'var(--bw-text)',
                    cursor: 'pointer',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: isActive ? 500 : 300,
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
                    <IconComponent size={20} style={{ flexShrink: 0, width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />
                    <span>{item.label}</span>
                  </div>
                  {hasBranches && (
                    <CaretRight 
                      size={16} 
                      style={{ 
                        flexShrink: 0,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  )}
                </button>
                {/* Submenu */}
                {hasBranches && isExpanded && (
                  <div style={{
                    paddingLeft: 'clamp(30px, 4vw, 40px)',
                    paddingTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    {item.branches?.map((branch) => {
                      const isBranchActive = activeBookingsSubSection === branch.id
                      return (
                        <button
                          key={branch.id}
                          onClick={() => handleBookingsBranchSelect(branch.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(8px, 1.5vw, 12px)',
                            padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                            backgroundColor: isBranchActive ? 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))' : 'transparent',
                            border: 'none',
                            borderLeft: isBranchActive ? '2px solid var(--bw-fg)' : '2px solid transparent',
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            fontSize: 'clamp(13px, 1.8vw, 14px)',
                            fontFamily: 'Work Sans, sans-serif',
                            fontWeight: isBranchActive ? 500 : 300,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            opacity: isBranchActive ? 1 : 0.8
                          }}
                          onMouseEnter={(e) => {
                            if (!isBranchActive) {
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))'
                              e.currentTarget.style.opacity = '1'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isBranchActive) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.opacity = '0.8'
                            }
                          }}
                        >
                          <span>{branch.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
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
          <button
            onClick={() => {
              useAuthStore.getState().logout()
              // Login URL - subdomain handles tenant context
              navigate('/driver/login', { replace: true })
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
      className="driver-main-content"
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
              className="driver-hamburger"
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
            {activeSection === 'bookings' && activeBookingsSubSection
              ? menuItems.find(item => item.id === 'bookings')?.branches?.find(b => b.id === activeBookingsSubSection)?.label || 'Bookings'
              : menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
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
            {/* Driver Status Toggle Card */}
            {info && (
              <div style={{
                backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px',
                padding: 'clamp(16px, 3vw, 24px)'
              }}>
                <h2 style={{
                  margin: '0 0 clamp(16px, 3vw, 20px) 0',
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  fontWeight: 400,
                  fontFamily: 'Work Sans, sans-serif',
                  color: 'var(--bw-text)'
                }}>
                  Driver Status
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      color: 'var(--bw-text)',
                      fontWeight: 300,
                      fontFamily: 'Work Sans, sans-serif',
                      marginBottom: '4px'
                    }}>
                      {info.is_active ? 'You are currently active and available for rides' : 'You are currently inactive and not accepting rides'}
                    </div>
                    <div style={{
                      fontSize: 'clamp(11px, 1.8vw, 12px)',
                      color: 'var(--bw-text)',
                      opacity: 0.7,
                      fontFamily: 'Work Sans, sans-serif'
                    }}>
                      {info.is_active ? 'Toggle off to stop receiving ride requests' : 'Toggle on to start receiving ride requests'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStatusToggle(!info.is_active)}
                    disabled={isTogglingStatus}
                    style={{
                      position: 'relative',
                      width: '56px',
                      height: '32px',
                      borderRadius: '16px',
                      border: 'none',
                      cursor: isTogglingStatus ? 'not-allowed' : 'pointer',
                      backgroundColor: info.is_active ? '#10b981' : '#6b7280',
                      transition: 'background-color 0.3s ease',
                      opacity: isTogglingStatus ? 0.6 : 1,
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      if (!isTogglingStatus) {
                        e.currentTarget.style.opacity = '0.8'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isTogglingStatus) {
                        e.currentTarget.style.opacity = '1'
                      }
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      transform: info.is_active ? 'translateX(24px)' : 'translateX(0)',
                      transition: 'transform 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }} />
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div 
              className="driver-stats-grid"
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
                  {analytics?.completed ?? info?.completed_rides ?? 0}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 300
                }}>
                  Completed Rides
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
                  {analytics?.pending ?? rides.length}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 300
                }}>
                  Available Rides
                </div>
              </div>
            </div>

            {/* Driver Info Card */}
            {info && (
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
                  My Information
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 25vw, 200px), 1fr))',
                    gap: 'clamp(12px, 2vw, 16px)'
                  }}>
                    <div>
                      <div style={{
                        fontSize: 'clamp(11px, 1.8vw, 12px)',
                        color: 'var(--bw-text)',
                        opacity: 0.7,
                        marginBottom: '4px'
                      }}>
                        Name
                      </div>
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        fontWeight: 300,
                        fontFamily: 'Work Sans, sans-serif'
                      }}>
                        {info.first_name} {info.last_name}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'clamp(11px, 1.8vw, 12px)',
                        color: 'var(--bw-text)',
                        opacity: 0.7,
                        marginBottom: '4px'
                      }}>
                        Email
                      </div>
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        fontWeight: 300,
                        fontFamily: 'Work Sans, sans-serif'
                      }}>
                        {info.email}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'clamp(11px, 1.8vw, 12px)',
                        color: 'var(--bw-text)',
                        opacity: 0.7,
                        marginBottom: '4px'
                      }}>
                        Phone
                      </div>
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        fontWeight: 300,
                        fontFamily: 'Work Sans, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Phone size={14} />
                        {formatPhoneNumber(info.phone_no)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'clamp(11px, 1.8vw, 12px)',
                        color: 'var(--bw-text)',
                        opacity: 0.7,
                        marginBottom: '4px'
                      }}>
                        Status
                      </div>
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: info.is_active ? '#10b981' : '#6b7280',
                        fontWeight: 300,
                        fontFamily: 'Work Sans, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {info.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {info.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  {info.vehicle && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--bw-border)'
                    }}>
                      <div style={{
                        fontSize: 'clamp(11px, 1.8vw, 12px)',
                        color: 'var(--bw-text)',
                        opacity: 0.7,
                        marginBottom: '8px'
                      }}>
                        Vehicle
                      </div>
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        fontWeight: 300,
                        fontFamily: 'Work Sans, sans-serif'
                      }}>
                        {info.vehicle.make} {info.vehicle.model} {info.vehicle.year ? `(${info.vehicle.year})` : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* New Requests Section */}
            <div style={{
              backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
              border: '1px solid var(--bw-border)',
              borderRadius: '12px',
              padding: 'clamp(10px, 2vw, 14px)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h2 style={{
                margin: '0 0 clamp(10px, 2vw, 14px) 0',
                fontSize: 'clamp(18px, 3vw, 22px)',
                fontWeight: 400,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)'
              }}>
                New Requests
              </h2>
              {isLoadingNewRequests && newRequests.length === 0 ? (
                <div style={{
                  padding: 'clamp(12px, 2vw, 20px)',
                  textAlign: 'center',
                  color: 'var(--bw-muted)',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  Loading new requests...
                </div>
              ) : newRequests.length === 0 ? (
                <div style={{
                  padding: 'clamp(12px, 2vw, 20px)',
                  textAlign: 'center',
                  color: 'var(--bw-muted)',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  No new requests
                </div>
              ) : (
                <>
                  {/* Current Request Display */}
                  <div style={{
                    position: 'relative',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {newRequests[currentRequestIndex] && (
                      <div
                        style={{
                          padding: 'clamp(10px, 1.5vw, 12px)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(6px, 1vw, 10px)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '10px',
                          flexWrap: 'wrap',
                          marginBottom: '6px'
                        }}>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{
                              fontSize: 'clamp(12px, 1.8vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px',
                              fontFamily: 'Work Sans, sans-serif'
                            }}>
                              Customer
                            </div>
                            <div style={{
                              fontSize: 'clamp(14px, 2vw, 15px)',
                              color: 'var(--bw-text)',
                              fontWeight: 500,
                              fontFamily: 'Work Sans, sans-serif'
                            }}>
                              {newRequests[currentRequestIndex].customer_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px'
                          }}>
                            <MapPin size={16} style={{ color: 'var(--bw-muted)', marginTop: '2px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: 'clamp(11px, 1.5vw, 12px)',
                                color: 'var(--bw-muted)',
                                marginBottom: '2px',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                Pickup
                              </div>
                              <div style={{
                                fontSize: 'clamp(13px, 2vw, 14px)',
                                color: 'var(--bw-text)',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                {newRequests[currentRequestIndex].pickup_location || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px'
                          }}>
                            <MapPin size={16} style={{ color: 'var(--bw-muted)', marginTop: '2px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: 'clamp(11px, 1.5vw, 12px)',
                                color: 'var(--bw-muted)',
                                marginBottom: '2px',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                Dropoff
                              </div>
                              <div style={{
                                fontSize: 'clamp(13px, 2vw, 14px)',
                                color: 'var(--bw-text)',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                {newRequests[currentRequestIndex].dropoff_location || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <Calendar size={16} style={{ color: 'var(--bw-muted)', flexShrink: 0 }} />
                            <div style={{
                              fontSize: 'clamp(12px, 1.8vw, 13px)',
                              color: 'var(--bw-text)',
                              fontFamily: 'Work Sans, sans-serif'
                            }}>
                              {newRequests[currentRequestIndex].pickup_time ? new Date(newRequests[currentRequestIndex].pickup_time).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          {newRequests[currentRequestIndex].estimated_price && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <CreditCard size={16} style={{ color: 'var(--bw-muted)', flexShrink: 0 }} />
                              <div style={{
                                fontSize: 'clamp(12px, 1.8vw, 13px)',
                                color: 'var(--bw-text)',
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 500
                              }}>
                                ${newRequests[currentRequestIndex].estimated_price.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <button
                            onClick={() => newRequests[currentRequestIndex].id && act(newRequests[currentRequestIndex].id, 'confirmed')}
                            disabled={newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' || !newRequests[currentRequestIndex].id}
                            style={{
                              flex: 1,
                              minWidth: 'clamp(70px, 20vw, 90px)',
                              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                              backgroundColor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              fontFamily: 'Work Sans, sans-serif',
                              fontWeight: 500,
                              opacity: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => newRequests[currentRequestIndex].id && act(newRequests[currentRequestIndex].id, 'cancelled')}
                            disabled={newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' || !newRequests[currentRequestIndex].id}
                            style={{
                              flex: 1,
                              minWidth: 'clamp(70px, 20vw, 90px)',
                              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                              backgroundColor: 'transparent',
                              color: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#ef4444',
                              border: `1px solid ${newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#ef4444'}`,
                              borderRadius: '6px',
                              cursor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              fontFamily: 'Work Sans, sans-serif',
                              fontWeight: 500,
                              opacity: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                            }}
                          >
                            Decline
                          </button>
                          {(newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'confirmed' || newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'active') && (
                            <button
                              onClick={() => newRequests[currentRequestIndex].id && act(newRequests[currentRequestIndex].id, 'completed')}
                              disabled={newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' || !newRequests[currentRequestIndex].id}
                              style={{
                                flex: 1,
                                minWidth: 'clamp(70px, 20vw, 90px)',
                                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                                backgroundColor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                fontSize: 'clamp(11px, 1.8vw, 12px)',
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 500,
                                opacity: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                              }}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Controls */}
                  {newRequests.length > 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      marginTop: 'clamp(10px, 2vw, 14px)',
                      paddingTop: 'clamp(10px, 2vw, 14px)',
                      borderTop: '1px solid var(--bw-border)'
                    }}>
                      <button
                        onClick={() => setCurrentRequestIndex(prev => prev > 0 ? prev - 1 : newRequests.length - 1)}
                        disabled={isLoadingNewRequests}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'clamp(8px, 1.5vw, 10px)',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '6px',
                          cursor: isLoadingNewRequests ? 'not-allowed' : 'pointer',
                          color: 'var(--bw-text)',
                          opacity: isLoadingNewRequests ? 0.6 : 1,
                          transition: 'all 0.2s ease',
                          minWidth: '44px',
                          minHeight: '44px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoadingNewRequests) {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                            e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoadingNewRequests) {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--bw-border)'
                          }
                        }}
                      >
                        <CaretLeft size={20} />
                      </button>
                      
                      <div style={{
                        fontSize: 'clamp(13px, 2vw, 14px)',
                        color: 'var(--bw-text)',
                        fontFamily: 'Work Sans, sans-serif',
                        fontWeight: 300
                      }}>
                        {currentRequestIndex + 1} of {newRequests.length}
                      </div>
                      
                      <button
                        onClick={() => setCurrentRequestIndex(prev => prev < newRequests.length - 1 ? prev + 1 : 0)}
                        disabled={isLoadingNewRequests}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'clamp(8px, 1.5vw, 10px)',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '6px',
                          cursor: isLoadingNewRequests ? 'not-allowed' : 'pointer',
                          color: 'var(--bw-text)',
                          opacity: isLoadingNewRequests ? 0.6 : 1,
                          transition: 'all 0.2s ease',
                          minWidth: '44px',
                          minHeight: '44px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isLoadingNewRequests) {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                            e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLoadingNewRequests) {
                            e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                            e.currentTarget.style.borderColor = 'var(--bw-border)'
                          }
                        }}
                      >
                        <CaretRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Upcoming Rides Section */}
            <div style={{
              backgroundColor: 'unset',
              border: 'none',
              borderRadius: '12px',
              padding: 'clamp(4px, 1vw, 8px)',
              display: 'flex',
              flexDirection: 'column',
              width: '100%'
            }}>
              {isLoadingUpcomingRides && upcomingRides.length === 0 ? (
                <div style={{
                  padding: 'clamp(12px, 2vw, 20px)',
                  textAlign: 'center',
                  color: 'var(--bw-muted)',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  Loading upcoming rides...
                </div>
              ) : upcomingRides.length === 0 ? (
                <div style={{
                  padding: 'clamp(12px, 2vw, 20px)',
                  textAlign: 'center',
                  color: 'var(--bw-muted)',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  No upcoming rides
                </div>
              ) : (
                <>
                  <div style={{
                    maxHeight: 'clamp(400px, 60vh, 600px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'clamp(16px, 2.5vw, 20px)',
                    paddingRight: '8px',
                    width: '100%'
                  }}>
                      {upcomingRides.map((ride, index) => {
                        const rideId = ride.id || index
                        const progress = swipeProgress[rideId] || 0
                        const swiping = isSwiping[rideId] || false
                        let buttonRef: HTMLButtonElement | null = null

                        return (
                        <div
                          key={rideId}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr clamp(200px, 25vw, 280px)',
                            gap: 'clamp(16px, 2vw, 20px)',
                            padding: 'clamp(16px, 2.5vw, 20px)',
                            border: '1px solid var(--bw-border)',
                            borderRadius: '12px',
                            backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Main Trip Card Content */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(16px, 2vw, 20px)'
                          }}>
                            {/* Header with Customer Name and Status */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '12px',
                              paddingBottom: 'clamp(12px, 1.5vw, 16px)',
                              borderBottom: '1px solid var(--bw-border)'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: 'clamp(11px, 1.5vw, 12px)',
                                  color: 'var(--bw-text)',
                                  opacity: 0.5,
                                  marginBottom: '6px',
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 267,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Customer
                                </div>
                                <div style={{
                                  fontSize: 'clamp(20px, 3vw, 24px)',
                                  color: 'var(--bw-text)',
                                  fontWeight: 400,
                                  fontFamily: 'Work Sans, sans-serif',
                                  lineHeight: 1.2
                                }}>
                                  {ride.customer_name || 'N/A'}
                                </div>
                              </div>
                              {renderStatusActionButton(ride, '6px 12px')}
                            </div>

                            {/* Pickup Section */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              <div style={{
                                fontSize: 'clamp(12px, 1.8vw, 13px)',
                                color: 'var(--bw-text)',
                                opacity: 0.6,
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 333,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                              }}>
                                Pickup
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--bw-bg-secondary)',
                                  flexShrink: 0
                                }}>
                                  <MapPin size={18} style={{ color: 'var(--bw-text)', opacity: 0.8 }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontSize: 'clamp(15px, 2.2vw, 17px)',
                                    color: 'var(--bw-text)',
                                    fontFamily: 'Work Sans, sans-serif',
                                    fontWeight: 333,
                                    lineHeight: 1.4,
                                    wordBreak: 'break-word'
                                  }}>
                                    {ride.pickup_location || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Dropoff Section */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              <div style={{
                                fontSize: 'clamp(12px, 1.8vw, 13px)',
                                color: 'var(--bw-text)',
                                opacity: 0.6,
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 333,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '4px'
                              }}>
                                Dropoff
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--bw-bg-secondary)',
                                  flexShrink: 0
                                }}>
                                  <NavigationArrow size={18} style={{ color: 'var(--bw-text)', opacity: 0.8 }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontSize: 'clamp(15px, 2.2vw, 17px)',
                                    color: 'var(--bw-text)',
                                    fontFamily: 'Work Sans, sans-serif',
                                    fontWeight: 333,
                                    lineHeight: 1.4,
                                    wordBreak: 'break-word'
                                  }}>
                                    {ride.dropoff_location || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Trip Details Row */}
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 'clamp(16px, 2vw, 24px)',
                              paddingTop: 'clamp(12px, 1.5vw, 16px)',
                              borderTop: '1px solid var(--bw-border)'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <Calendar size={16} style={{ color: 'var(--bw-text)', opacity: 0.6 }} />
                                <div style={{
                                  fontSize: 'clamp(13px, 1.8vw, 14px)',
                                  color: 'var(--bw-text)',
                                  fontFamily: 'Work Sans, sans-serif',
                                  opacity: 0.8
                                }}>
                                  {ride.pickup_time ? new Date(ride.pickup_time).toLocaleString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  }) : 'N/A'}
                                </div>
                              </div>
                              {ride.estimated_price && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <CreditCard size={16} style={{ color: 'var(--bw-text)', opacity: 0.6 }} />
                                  <div style={{
                                    fontSize: 'clamp(15px, 2vw, 16px)',
                                    color: 'var(--bw-text)',
                                    fontFamily: 'Work Sans, sans-serif',
                                    fontWeight: 400
                                  }}>
                                    ${ride.estimated_price.toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                              display: 'flex',
                              gap: '12px',
                              marginTop: '8px'
                            }}>
                              {/* Decline Button */}
                              <button
                                onClick={() => ride.id && act(ride.id, 'cancelled')}
                                disabled={ride.booking_status?.toLowerCase() === 'completed' || !ride.id}
                                style={{
                                  flex: 1,
                                  padding: 'clamp(12px, 2vw, 14px)',
                                  backgroundColor: 'transparent',
                                  color: ride.booking_status?.toLowerCase() === 'completed' ? 'var(--bw-text)' : '#ef4444',
                                  border: `1px solid ${ride.booking_status?.toLowerCase() === 'completed' ? 'var(--bw-border)' : '#ef4444'}`,
                                  borderRadius: '10px',
                                  fontSize: 'clamp(14px, 2vw, 15px)',
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 400,
                                  cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                  opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.5 : 1,
                                  transition: 'all 0.2s ease',
                                  minHeight: '48px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  if (ride.booking_status?.toLowerCase() !== 'completed' && ride.id) {
                                    e.currentTarget.style.backgroundColor = '#ef444410'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                              >
                                <XCircle size={18} />
                                Decline
                              </button>

                              {/* Complete Button with Swipe-to-Confirm */}
                              <button
                                ref={(el) => { buttonRef = el }}
                                onClick={() => {
                                  if (progress >= 85 && ride.id) {
                                    act(ride.id, 'completed')
                                  }
                                }}
                                disabled={ride.booking_status?.toLowerCase() === 'completed' || !ride.id}
                                onTouchStart={(e) => {
                                  if (ride.id && ride.booking_status?.toLowerCase() !== 'completed') {
                                    handleSwipeStart(rideId, e.touches[0].clientX)
                                  }
                                }}
                                onTouchMove={(e) => {
                                  if (ride.id && ride.booking_status?.toLowerCase() !== 'completed' && buttonRef) {
                                    const buttonWidth = buttonRef.offsetWidth
                                    handleSwipeMove(rideId, e.touches[0].clientX, buttonWidth)
                                  }
                                }}
                                onTouchEnd={() => {
                                  if (ride.id && ride.booking_status?.toLowerCase() !== 'completed') {
                                    handleSwipeEnd(rideId, () => {
                                      if (ride.id) act(ride.id, 'completed')
                                    })
                                  }
                                }}
                                onMouseDown={(e) => {
                                  if (ride.id && ride.booking_status?.toLowerCase() !== 'completed' && buttonRef) {
                                    handleSwipeStart(rideId, e.clientX)
                                  }
                                }}
                                onMouseMove={(e) => {
                                  if (swiping && ride.id && ride.booking_status?.toLowerCase() !== 'completed' && buttonRef) {
                                    const buttonWidth = buttonRef.offsetWidth
                                    handleSwipeMove(rideId, e.clientX, buttonWidth)
                                  }
                                }}
                                onMouseUp={() => {
                                  if (ride.id && ride.booking_status?.toLowerCase() !== 'completed') {
                                    handleSwipeEnd(rideId, () => {
                                      if (ride.id) act(ride.id, 'completed')
                                    })
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (swiping && ride.id) {
                                    handleSwipeEnd(rideId, () => {
                                      if (ride.id) act(ride.id, 'completed')
                                    })
                                  }
                                }}
                                style={{
                                  flex: 2,
                                  padding: 'clamp(12px, 2vw, 14px)',
                                  backgroundColor: progress >= 85 ? '#10b981' : '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '10px',
                                  fontSize: 'clamp(14px, 2vw, 15px)',
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 400,
                                  cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                  opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.5 : 1,
                                  transition: progress >= 85 ? 'all 0.2s ease' : 'background-color 0.2s ease',
                                  minHeight: '48px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  height: '100%',
                                  width: `${progress}%`,
                                  backgroundColor: '#059669',
                                  transition: 'width 0.1s ease',
                                  zIndex: 0
                                }} />
                                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {progress >= 85 ? (
                                    <>
                                      <CheckCircle size={18} />
                                      Release to Complete
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight size={18} />
                                      Swipe to Complete
                                    </>
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Map Preview Section */}
                          {!isMobile && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'var(--bw-bg-secondary)',
                              borderRadius: '10px',
                              border: '1px solid var(--bw-border)',
                              minHeight: '200px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                color: 'var(--bw-text)',
                                opacity: 0.4
                              }}>
                                <MapTrifold size={48} />
                                <div style={{
                                  fontSize: 'clamp(12px, 1.5vw, 13px)',
                                  fontFamily: 'Work Sans, sans-serif'
                                }}>
                                  Map Preview
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bookings Section with Sub-sections */}
        {activeSection === 'bookings' && (
          <>
            {/* Upcoming Rides Sub-section */}
            {activeBookingsSubSection === 'upcoming' && (
              <div style={{
                border: 'none',
                borderRadius: '12px',
                padding: 'clamp(4px, 1vw, 8px)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'clamp(600px, 70vh, 900px)',
                width: '100%'
              }}>
                {isLoadingUpcomingRides && upcomingRides.length === 0 ? (
                  <div style={{
                    padding: 'clamp(12px, 2vw, 20px)',
                    textAlign: 'center',
                    color: 'var(--bw-muted)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: 'Work Sans, sans-serif'
                  }}>
                    Loading upcoming rides...
                  </div>
                ) : upcomingRides.length === 0 ? (
                  <div style={{
                    padding: 'clamp(12px, 2vw, 20px)',
                    textAlign: 'center',
                    color: 'var(--bw-muted)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: 'Work Sans, sans-serif'
                  }}>
                    No upcoming rides
                  </div>
                ) : (
                  <>
                    <div style={{
                      maxHeight: 'clamp(500px, 70vh, 900px)',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: 'clamp(16px, 2.5vw, 20px)',
                      paddingRight: '8px',
                      width: '100%'
                    }}>
                      {upcomingRides.map((ride, index) => {
                        const rideId = ride.id || index
                        const progress = swipeProgress[rideId] || 0
                        const swiping = isSwiping[rideId] || false
                        let buttonRef: HTMLButtonElement | null = null

                        return (
                          <div
                            key={rideId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isMobile ? '1fr' : '1fr clamp(200px, 25vw, 280px)',
                              gap: 'clamp(16px, 2vw, 20px)',
                              padding: 'clamp(16px, 2.5vw, 20px)',
                              border: '1px solid var(--bw-border)',
                              borderRadius: '12px',
                              backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Main Trip Card Content */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 'clamp(16px, 2vw, 20px)'
                            }}>
                              {/* Header with Customer Name and Status */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '12px',
                                paddingBottom: 'clamp(12px, 1.5vw, 16px)',
                                borderBottom: '1px solid var(--bw-border)'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    fontSize: 'clamp(11px, 1.5vw, 12px)',
                                    color: 'var(--bw-text)',
                                    opacity: 0.5,
                                    marginBottom: '6px',
                                    fontFamily: 'Work Sans, sans-serif',
                                    fontWeight: 267,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                  }}>
                                    Customer
                                  </div>
                                  <div style={{
                                    fontSize: 'clamp(20px, 3vw, 24px)',
                                    color: 'var(--bw-text)',
                                    fontWeight: 400,
                                    fontFamily: 'Work Sans, sans-serif',
                                    lineHeight: 1.2
                                  }}>
                                    {ride.customer_name || 'N/A'}
                                  </div>
                                </div>
                                {renderStatusActionButton(ride, '6px 12px')}
                              </div>

                              {/* Pickup Section */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}>
                                <div style={{
                                  fontSize: 'clamp(12px, 1.8vw, 13px)',
                                  color: 'var(--bw-text)',
                                  opacity: 0.6,
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 333,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  marginBottom: '4px'
                                }}>
                                  Pickup
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bw-bg-secondary)',
                                    flexShrink: 0
                                  }}>
                                    <MapPin size={18} style={{ color: 'var(--bw-text)', opacity: 0.8 }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: 'clamp(15px, 2.2vw, 17px)',
                                      color: 'var(--bw-text)',
                                      fontFamily: 'Work Sans, sans-serif',
                                      fontWeight: 333,
                                      lineHeight: 1.4,
                                      wordBreak: 'break-word'
                                    }}>
                                      {ride.pickup_location || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Dropoff Section */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}>
                                <div style={{
                                  fontSize: 'clamp(12px, 1.8vw, 13px)',
                                  color: 'var(--bw-text)',
                                  opacity: 0.6,
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 333,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  marginBottom: '4px'
                                }}>
                                  Dropoff
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '12px'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--bw-bg-secondary)',
                                    flexShrink: 0
                                  }}>
                                    <NavigationArrow size={18} style={{ color: 'var(--bw-text)', opacity: 0.8 }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: 'clamp(15px, 2.2vw, 17px)',
                                      color: 'var(--bw-text)',
                                      fontFamily: 'Work Sans, sans-serif',
                                      fontWeight: 333,
                                      lineHeight: 1.4,
                                      wordBreak: 'break-word'
                                    }}>
                                      {ride.dropoff_location || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Trip Details Row */}
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'clamp(16px, 2vw, 24px)',
                                paddingTop: 'clamp(12px, 1.5vw, 16px)',
                                borderTop: '1px solid var(--bw-border)'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <Calendar size={16} style={{ color: 'var(--bw-text)', opacity: 0.6 }} />
                                  <div style={{
                                    fontSize: 'clamp(13px, 1.8vw, 14px)',
                                    color: 'var(--bw-text)',
                                    fontFamily: 'Work Sans, sans-serif',
                                    opacity: 0.8
                                  }}>
                                    {ride.pickup_time ? new Date(ride.pickup_time).toLocaleString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      hour: 'numeric', 
                                      minute: '2-digit' 
                                    }) : 'N/A'}
                                  </div>
                                </div>
                                {ride.estimated_price && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}>
                                    <CreditCard size={16} style={{ color: 'var(--bw-text)', opacity: 0.6 }} />
                                    <div style={{
                                      fontSize: 'clamp(15px, 2vw, 16px)',
                                      color: 'var(--bw-text)',
                                      fontFamily: 'Work Sans, sans-serif',
                                      fontWeight: 400
                                    }}>
                                      ${ride.estimated_price.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '8px'
                              }}>
                                {/* Decline Button */}
                                <button
                                  onClick={() => ride.id && act(ride.id, 'cancelled')}
                                  disabled={ride.booking_status?.toLowerCase() === 'completed' || !ride.id}
                                  style={{
                                    flex: 1,
                                    padding: 'clamp(12px, 2vw, 14px)',
                                    backgroundColor: 'transparent',
                                    color: ride.booking_status?.toLowerCase() === 'completed' ? 'var(--bw-text)' : '#ef4444',
                                    border: `1px solid ${ride.booking_status?.toLowerCase() === 'completed' ? 'var(--bw-border)' : '#ef4444'}`,
                                    borderRadius: '10px',
                                    fontSize: 'clamp(14px, 2vw, 15px)',
                                    fontFamily: 'Work Sans, sans-serif',
                                    fontWeight: 400,
                                    cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                    opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.5 : 1,
                                    transition: 'all 0.2s ease',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (ride.booking_status?.toLowerCase() !== 'completed' && ride.id) {
                                      e.currentTarget.style.backgroundColor = '#ef444410'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                  }}
                                >
                                  <XCircle size={18} />
                                  Decline
                                </button>

                                {/* Complete Button with Swipe-to-Confirm */}
                                <button
                                  ref={(el) => { buttonRef = el }}
                                  onClick={() => {
                                    if (progress >= 85 && ride.id) {
                                      act(ride.id, 'completed')
                                    }
                                  }}
                                  disabled={ride.booking_status?.toLowerCase() === 'completed' || !ride.id}
                                  onTouchStart={(e) => {
                                    if (ride.id && ride.booking_status?.toLowerCase() !== 'completed') {
                                      handleSwipeStart(rideId, e.touches[0].clientX)
                                    }
                                  }}
                                  onTouchMove={(e) => {
                                    if (ride.id && ride.booking_status?.toLowerCase() !== 'completed' && buttonRef) {
                                      const buttonWidth = buttonRef.offsetWidth
                                      handleSwipeMove(rideId, e.touches[0].clientX, buttonWidth)
                                    }
                                  }}
                                  onTouchEnd={() => {
                                    if (ride.id && ride.booking_status?.toLowerCase() !== 'completed') {
                                      handleSwipeEnd(rideId, () => {
                                        if (ride.id) act(ride.id, 'completed')
                                      })
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    if (ride.id && ride.booking_status?.toLowerCase() !== 'completed' && buttonRef) {
                                      handleSwipeStart(rideId, e.clientX)
                                    }
                                  }}
                                  onMouseMove={(e) => {
                                    if (swiping && ride.id && ride.booking_status?.toLowerCase() !== 'completed' && buttonRef) {
                                      const buttonWidth = buttonRef.offsetWidth
                                      handleSwipeMove(rideId, e.clientX, buttonWidth)
                                    }
                                  }}
                                  onMouseUp={() => {
                                    if (ride.id && ride.booking_status?.toLowerCase() !== 'completed') {
                                      handleSwipeEnd(rideId, () => {
                                        if (ride.id) act(ride.id, 'completed')
                                      })
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    if (swiping && ride.id) {
                                      handleSwipeEnd(rideId, () => {
                                        if (ride.id) act(ride.id, 'completed')
                                      })
                                    }
                                  }}
                                  style={{
                                    flex: 2,
                                    padding: 'clamp(12px, 2vw, 14px)',
                                    backgroundColor: progress >= 85 ? '#10b981' : '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: 'clamp(14px, 2vw, 15px)',
                                    fontFamily: 'Work Sans, sans-serif',
                                    fontWeight: 400,
                                    cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                    opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.5 : 1,
                                    transition: progress >= 85 ? 'all 0.2s ease' : 'background-color 0.2s ease',
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${progress}%`,
                                    backgroundColor: '#059669',
                                    transition: 'width 0.1s ease',
                                    zIndex: 0
                                  }} />
                                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {progress >= 85 ? (
                                      <>
                                        <CheckCircle size={18} />
                                        Release to Complete
                                      </>
                                    ) : (
                                      <>
                                        <ArrowRight size={18} />
                                        Swipe to Complete
                                      </>
                                    )}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Map Preview Section */}
                            {!isMobile && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--bw-bg-secondary)',
                                borderRadius: '10px',
                                border: '1px solid var(--bw-border)',
                                minHeight: '200px',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '12px',
                                  color: 'var(--bw-text)',
                                  opacity: 0.4
                                }}>
                                  <MapTrifold size={48} />
                                  <div style={{
                                    fontSize: 'clamp(12px, 1.5vw, 13px)',
                                    fontFamily: 'Work Sans, sans-serif'
                                  }}>
                                    Map Preview
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* New Requests Sub-section */}
            {activeBookingsSubSection === 'new-requests' && (
              <div style={{
                border: 'none',
                borderRadius: '12px',
                padding: 'clamp(10px, 2vw, 14px)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {isLoadingNewRequests && newRequests.length === 0 ? (
                  <div style={{
                    padding: 'clamp(12px, 2vw, 20px)',
                    textAlign: 'center',
                    color: 'var(--bw-muted)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: 'Work Sans, sans-serif'
                  }}>
                    Loading new requests...
                  </div>
                ) : newRequests.length === 0 ? (
                  <div style={{
                    padding: 'clamp(12px, 2vw, 20px)',
                    textAlign: 'center',
                    color: 'var(--bw-muted)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: 'Work Sans, sans-serif'
                  }}>
                    No new requests
                  </div>
                ) : (
                  <>
                    <div style={{
                      position: 'relative',
                      minHeight: '100px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {newRequests[currentRequestIndex] && (
                        <div
                          style={{
                            padding: 'clamp(10px, 1.5vw, 12px)',
                            border: '1px solid var(--bw-border)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(6px, 1vw, 10px)'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '10px',
                            flexWrap: 'wrap',
                            marginBottom: '6px'
                          }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{
                                fontSize: 'clamp(12px, 1.8vw, 13px)',
                                color: 'var(--bw-muted)',
                                marginBottom: '4px',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                Customer
                              </div>
                              <div style={{
                                fontSize: 'clamp(14px, 2vw, 15px)',
                                color: 'var(--bw-text)',
                                fontWeight: 500,
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                {newRequests[currentRequestIndex].customer_name || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px'
                            }}>
                              <MapPin size={16} style={{ color: 'var(--bw-muted)', marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: 'clamp(11px, 1.5vw, 12px)',
                                  color: 'var(--bw-muted)',
                                  marginBottom: '2px',
                                  fontFamily: 'Work Sans, sans-serif'
                                }}>
                                  Pickup
                                </div>
                                <div style={{
                                  fontSize: 'clamp(13px, 2vw, 14px)',
                                  color: 'var(--bw-text)',
                                  fontFamily: 'Work Sans, sans-serif'
                                }}>
                                  {newRequests[currentRequestIndex].pickup_location || 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px'
                            }}>
                              <MapPin size={16} style={{ color: 'var(--bw-muted)', marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: 'clamp(11px, 1.5vw, 12px)',
                                  color: 'var(--bw-muted)',
                                  marginBottom: '2px',
                                  fontFamily: 'Work Sans, sans-serif'
                                }}>
                                  Dropoff
                                </div>
                                <div style={{
                                  fontSize: 'clamp(13px, 2vw, 14px)',
                                  color: 'var(--bw-text)',
                                  fontFamily: 'Work Sans, sans-serif'
                                }}>
                                  {newRequests[currentRequestIndex].dropoff_location || 'N/A'}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Calendar size={16} style={{ color: 'var(--bw-muted)', flexShrink: 0 }} />
                              <div style={{
                                fontSize: 'clamp(12px, 1.8vw, 13px)',
                                color: 'var(--bw-text)',
                                fontFamily: 'Work Sans, sans-serif'
                              }}>
                                {newRequests[currentRequestIndex].pickup_time ? new Date(newRequests[currentRequestIndex].pickup_time).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                            {newRequests[currentRequestIndex].estimated_price && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <CreditCard size={16} style={{ color: 'var(--bw-muted)', flexShrink: 0 }} />
                                <div style={{
                                  fontSize: 'clamp(12px, 1.8vw, 13px)',
                                  color: 'var(--bw-text)',
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 500
                                }}>
                                  ${newRequests[currentRequestIndex].estimated_price.toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => newRequests[currentRequestIndex].id && act(newRequests[currentRequestIndex].id, 'confirmed')}
                              disabled={newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' || !newRequests[currentRequestIndex].id}
                              style={{
                                flex: 1,
                                minWidth: 'clamp(70px, 20vw, 90px)',
                                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                                backgroundColor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                fontSize: 'clamp(11px, 1.8vw, 12px)',
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 500,
                                opacity: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => newRequests[currentRequestIndex].id && act(newRequests[currentRequestIndex].id, 'cancelled')}
                              disabled={newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' || !newRequests[currentRequestIndex].id}
                              style={{
                                flex: 1,
                                minWidth: 'clamp(70px, 20vw, 90px)',
                                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                                backgroundColor: 'transparent',
                                color: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#ef4444',
                                border: `1px solid ${newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#ef4444'}`,
                                borderRadius: '6px',
                                cursor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                fontSize: 'clamp(11px, 1.8vw, 12px)',
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 500,
                                opacity: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                              }}
                            >
                              Decline
                            </button>
                            {(newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'confirmed' || newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'active') && (
                              <button
                                onClick={() => newRequests[currentRequestIndex].id && act(newRequests[currentRequestIndex].id, 'completed')}
                                disabled={newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' || !newRequests[currentRequestIndex].id}
                                style={{
                                  flex: 1,
                                  minWidth: 'clamp(70px, 20vw, 90px)',
                                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 14px)',
                                  backgroundColor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                                  fontSize: 'clamp(11px, 1.8vw, 12px)',
                                  fontFamily: 'Work Sans, sans-serif',
                                  fontWeight: 500,
                                  opacity: newRequests[currentRequestIndex].booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                                }}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Controls */}
                    {newRequests.length > 1 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginTop: 'clamp(10px, 2vw, 14px)',
                        paddingTop: 'clamp(10px, 2vw, 14px)',
                        borderTop: '1px solid var(--bw-border)'
                      }}>
                        <button
                          onClick={() => setCurrentRequestIndex(prev => prev > 0 ? prev - 1 : newRequests.length - 1)}
                          disabled={isLoadingNewRequests}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'clamp(8px, 1.5vw, 10px)',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            border: '1px solid var(--bw-border)',
                            borderRadius: '6px',
                            cursor: isLoadingNewRequests ? 'not-allowed' : 'pointer',
                            color: 'var(--bw-text)',
                            opacity: isLoadingNewRequests ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            minWidth: '44px',
                            minHeight: '44px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoadingNewRequests) {
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                              e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoadingNewRequests) {
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                              e.currentTarget.style.borderColor = 'var(--bw-border)'
                            }
                          }}
                        >
                          <CaretLeft size={20} />
                        </button>
                        
                        <div style={{
                          fontSize: 'clamp(13px, 2vw, 14px)',
                          color: 'var(--bw-text)',
                          fontFamily: 'Work Sans, sans-serif',
                          fontWeight: 300
                        }}>
                          {currentRequestIndex + 1} of {newRequests.length}
                        </div>
                        
                        <button
                          onClick={() => setCurrentRequestIndex(prev => prev < newRequests.length - 1 ? prev + 1 : 0)}
                          disabled={isLoadingNewRequests}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'clamp(8px, 1.5vw, 10px)',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            border: '1px solid var(--bw-border)',
                            borderRadius: '6px',
                            cursor: isLoadingNewRequests ? 'not-allowed' : 'pointer',
                            color: 'var(--bw-text)',
                            opacity: isLoadingNewRequests ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            minWidth: '44px',
                            minHeight: '44px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoadingNewRequests) {
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                              e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoadingNewRequests) {
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                              e.currentTarget.style.borderColor = 'var(--bw-border)'
                            }
                          }}
                        >
                          <CaretRight size={20} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* See All Bookings Sub-section */}
            {activeBookingsSubSection === 'all' && (
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
              {/* <h2 style={{
                margin: 0,
                fontSize: 'clamp(18px, 3vw, 22px)',
                fontWeight: 400,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)'
              }}>
                All Bookings
              </h2> */}
              
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

            {isLoadingBookings && allBookings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                Loading bookings...
              </div>
            ) : allBookings.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                No bookings found.
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(12px, 2.5vw, 16px)',
                  marginBottom: 'clamp(16px, 3vw, 24px)'
                }}>
                  {allBookings.map((booking) => (
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
                        gap: 'clamp(10px, 2vw, 12px)',
                        marginBottom: '16px'
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
                          {booking.customer_name && (
                            <div>
                              <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Customer</div>
                              <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.customer_name}</div>
                            </div>
                          )}
                          {booking.driver_name && (
                            <div>
                              <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Driver</div>
                              <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.driver_name || 'Unassigned'}</div>
                            </div>
                          )}
                          {booking.vehicle && (
                            <div>
                              <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Vehicle</div>
                              <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{booking.vehicle}</div>
                            </div>
                          )}
                        </div>

                        {booking.notes && (
                          <div style={{
                            marginTop: '8px',
                            padding: 'clamp(8px, 1.5vw, 10px)',
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
                  {!hasMoreBookings && allBookings.length > 0 && (
                    <div style={{
                      fontSize: 'clamp(13px, 2vw, 14px)',
                      color: 'var(--bw-text)',
                      opacity: 0.7,
                      fontFamily: 'Work Sans, sans-serif',
                      textAlign: 'center'
                    }}>
                      That's all your rides so far
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
          </>
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

            {isLoading && vehicles.length === 0 ? (
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 350px), 1fr))',
                gap: 'clamp(16px, 3vw, 20px)'
              }}>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    style={{
                      border: '1px solid var(--bw-border)',
                      borderRadius: '12px',
                      padding: 'clamp(16px, 3vw, 20px)',
                      backgroundColor: 'var(--bw-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* Vehicle Image */}
                    {vehicle.vehicle_images && Object.keys(vehicle.vehicle_images).length > 0 ? (
                      <div style={{
                        width: '100%',
                        height: 'clamp(150px, 25vw, 200px)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={Object.values(vehicle.vehicle_images)[0]}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: 'clamp(150px, 25vw, 200px)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--bw-text)',
                        opacity: 0.5
                      }}>
                        <Car size={48} />
                      </div>
                    )}

                    {/* Vehicle Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 'clamp(18px, 3vw, 22px)',
                        fontWeight: 600,
                        color: 'var(--bw-text)',
                        marginBottom: '8px',
                        fontFamily: 'Work Sans, sans-serif'
                      }}>
                        {vehicle.make} {vehicle.model}
                        {vehicle.year && ` (${vehicle.year})`}
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {vehicle.license_plate && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <div style={{
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              color: 'var(--bw-text)',
                              opacity: 0.7
                            }}>
                              License Plate:
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 2vw, 14px)',
                              color: 'var(--bw-text)',
                              fontWeight: 500,
                              fontFamily: 'Work Sans, sans-serif'
                            }}>
                              {vehicle.license_plate}
                            </div>
                          </div>
                        )}

                        {vehicle.color && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <div style={{
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              color: 'var(--bw-text)',
                              opacity: 0.7
                            }}>
                              Color:
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 2vw, 14px)',
                              color: 'var(--bw-text)',
                              fontWeight: 300,
                              fontFamily: 'Work Sans, sans-serif',
                              textTransform: 'capitalize'
                            }}>
                              {vehicle.color}
                            </div>
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            color: 'var(--bw-text)',
                            opacity: 0.7
                          }}>
                            Seating Capacity:
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 2vw, 14px)',
                            color: 'var(--bw-text)',
                            fontWeight: 300,
                            fontFamily: 'Work Sans, sans-serif'
                          }}>
                            {vehicle.seating_capacity}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            color: 'var(--bw-text)',
                            opacity: 0.7
                          }}>
                            Status:
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 2vw, 14px)',
                            color: vehicle.status === 'available' ? '#10b981' : '#6b7280',
                            fontWeight: 500,
                            fontFamily: 'Work Sans, sans-serif',
                            textTransform: 'capitalize',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {vehicle.status === 'available' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {vehicle.status || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .driver-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}
