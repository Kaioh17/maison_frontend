import { useEffect, useState } from 'react'
import { createBooking, getBookings, type BookingResponse } from '@api/bookings'
import { getVehicles, getVehicleCategories, type VehicleResponse, type VehicleCategoryResponse } from '@api/vehicles'
import { getRiderDrivers, type RiderDriverResponse } from '@api/driver'
import { useAuthStore } from '@store/auth'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { MapPin, Calendar, CreditCard, Car, User, LogOut, UserCircle, Menu, X, LayoutDashboard, BookOpen, List, Users, Truck, Phone, CheckCircle, XCircle } from 'lucide-react'

type MenuSection = 'dashboard' | 'book-ride' | 'all-bookings' | 'drivers' | 'vehicles'

export default function RiderDashboard() {
  const [form, setForm] = useState({
    vehicle_id: 0,
    city: '',
    service_type: 'dropoff' as 'airport' | 'hourly' | 'dropoff',
    pickup_location: '',
    dropoff_location: '',
    pickup_time_local: '',
    dropoff_time_local: '',
    payment_method: 'cash' as 'cash' | 'card' | 'zelle',
    notes: ''
  })
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategoryResponse[]>([])
  const [drivers, setDrivers] = useState<RiderDriverResponse[]>([])
  const [selectedDriver, setSelectedDriver] = useState<RiderDriverResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDriver, setIsLoadingDriver] = useState(false)
  const [error, setError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
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

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A'
    // Remove all non-digit characters
    const phoneNumber = phone.replace(/\D/g, '')
    
    // Format based on length
    if (phoneNumber.length === 0) {
      return phone // Return original if no digits
    } else if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
    } else {
      // For longer numbers, format first 10 digits
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)} ${phoneNumber.slice(10)}`
    }
  }

  const load = async () => {
    try {
      setIsLoading(true)
      const [bookingsResponse, vehiclesResponse, categoriesResponse, driversResponse] = await Promise.all([
        getBookings(),
        getVehicles().catch(() => ({ success: false, data: [] })), // Fallback if fails
        getVehicleCategories().catch(() => ({ success: false, data: [] })), // Fallback if fails
        getRiderDrivers().catch(() => ({ success: false, data: [] })) // Fallback if fails
      ])
      
      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data)
      } else {
        setBookings([])
      }
      
      if (vehiclesResponse.success && vehiclesResponse.data) {
        setVehicles(vehiclesResponse.data)
      } else {
        setVehicles([])
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setVehicleCategories(categoriesResponse.data)
      } else {
        setVehicleCategories([])
      }

      if (driversResponse.success && driversResponse.data) {
        setDrivers(driversResponse.data)
      } else {
        setDrivers([])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data')
      setBookings([])
      setVehicles([])
      setVehicleCategories([])
      setDrivers([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadDriverDetails = async (driverId: number) => {
    try {
      setIsLoadingDriver(true)
      const response = await getRiderDrivers(driverId)
      if (response.success && response.data && response.data.length > 0) {
        setSelectedDriver(response.data[0])
      } else {
        setError('Driver details not found')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load driver details')
    } finally {
      setIsLoadingDriver(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const book = async () => {
    if (!form.pickup_location || !form.dropoff_location || !form.city || !form.pickup_time_local || !form.vehicle_id) {
      setError('Please fill in all required fields including vehicle selection')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      const response = await createBooking({
        vehicle_id: form.vehicle_id,
        city: form.city,
        service_type: form.service_type,
        pickup_location: form.pickup_location,
        pickup_time: new Date(form.pickup_time_local).toISOString(),
        dropoff_location: form.dropoff_location,
        dropoff_time: form.dropoff_time_local ? new Date(form.dropoff_time_local).toISOString() : undefined,
        payment_method: form.payment_method,
        notes: form.notes || undefined,
      })
      if (response.success) {
        setForm({ 
          vehicle_id: 0, 
          city: '', 
          service_type: 'dropoff', 
          pickup_location: '', 
          dropoff_location: '', 
          pickup_time_local: '', 
          dropoff_time_local: '',
          payment_method: 'cash', 
          notes: '' 
        })
        setError('')
        await load()
        handleMenuSelect('all-bookings')
        setIsMenuOpen(false)
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

  const totalBookings = bookings.length
  const completedBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'completed').length
  const pendingBookings = bookings.filter(b => b.booking_status?.toLowerCase() === 'pending').length

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'book-ride' as MenuSection, label: 'Book a Ride', icon: BookOpen },
    { id: 'all-bookings' as MenuSection, label: 'See All Bookings', icon: List },
    { id: 'drivers' as MenuSection, label: 'See Drivers', icon: Users },
    { id: 'vehicles' as MenuSection, label: 'See Vehicles', icon: Truck },
  ]

  // Determine active section from URL
  const getActiveSectionFromUrl = (): MenuSection => {
    const path = location.pathname
    if (path.includes('/rider/book')) return 'book-ride'
    if (path.includes('/rider/see-bookings')) return 'all-bookings'
    if (path.includes('/rider/drivers')) return 'drivers'
    if (path.includes('/rider/vehicles')) return 'vehicles'
    if (path.includes('/rider/dashboard')) return 'dashboard'
    // Default to dashboard
    return 'dashboard'
  }

  const activeSection = getActiveSectionFromUrl()

  const handleMenuSelect = (section: MenuSection) => {
    // Navigate to the appropriate URL
    if (section === 'dashboard') {
      navigate(slug ? `/${slug}/rider/dashboard` : '/rider/dashboard')
    } else if (section === 'book-ride') {
      navigate(slug ? `/${slug}/rider/book` : '/rider/book')
    } else if (section === 'all-bookings') {
      navigate(slug ? `/${slug}/rider/see-bookings` : '/rider/see-bookings')
    } else if (section === 'drivers') {
      navigate(slug ? `/${slug}/rider/drivers` : '/rider/drivers')
    } else if (section === 'vehicles') {
      navigate(slug ? `/${slug}/rider/vehicles` : '/rider/vehicles')
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
            to={slug ? `/${slug}/riders/profile` : '/riders/profile'} 
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
              navigate(slug ? `/${slug}/riders/login` : '/', { replace: true })
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
            <LogOut size={18} />
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
              <Menu size={20} />
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
                  {totalBookings}
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

            {recentBookings.length === 0 && upcomingBookings.length === 0 && (
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
          </div>
        )}

        {/* Book a Ride Section */}
        {activeSection === 'book-ride' && (
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
              Book a Ride
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 2.5vw, 16px)'
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
                    onChange={(e) => setForm({ ...form, service_type: e.target.value as any })}
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

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontWeight: 500,
                    color: 'var(--bw-text)'
                  }}>
                    Payment Method
                  </label>
                  <select 
                    className="bw-input" 
                    value={form.payment_method} 
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value as any })}
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
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="zelle">Zelle</option>
                  </select>
                </div>
              </div>

              {/* Vehicle */}
              <div>
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
                  className="bw-input" 
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
                    fontSize: 'clamp(13px, 2vw, 14px)'
                  }}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''} - {vehicleCategories.find(cat => cat.id === vehicle.vehicle_category_id)?.vehicle_category || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  fontWeight: 500,
                  color: 'var(--bw-text)'
                }}>
                  City *
                </label>
                <input 
                  className="bw-input" 
                  placeholder="Enter city" 
                  value={form.city} 
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
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

              {/* Pickup Location */}
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
                  <MapPin size={16} />
                  Pickup Location *
                </label>
                <input 
                  className="bw-input" 
                  placeholder="Enter pickup address" 
                  value={form.pickup_location} 
                  onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
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

              {/* Dropoff Location */}
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
                  <MapPin size={16} />
                  Dropoff Location *
                </label>
                <input 
                  className="bw-input" 
                  placeholder="Enter dropoff address" 
                  value={form.dropoff_location} 
                  onChange={(e) => setForm({ ...form, dropoff_location: e.target.value })}
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

              {/* Pickup and Dropoff Time */}
              <div className="datetime-inputs-container" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 25vw, 200px), 1fr))',
                gap: 'clamp(12px, 2.5vw, 16px)'
              }}>
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
                    Dropoff Time (Optional)
                  </label>
                  <input 
                    className="bw-input datetime-input" 
                    type="datetime-local" 
                    value={form.dropoff_time_local} 
                    onChange={(e) => setForm({ ...form, dropoff_time_local: e.target.value })}
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
            <h2 style={{
              margin: '0 0 clamp(16px, 3vw, 20px) 0',
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: 400,
              fontFamily: 'Work Sans, sans-serif',
              color: 'var(--bw-text)'
            }}>
              My Bookings
            </h2>

            {isLoading && bookings.length === 0 ? (
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
                        <div style={{
                          fontSize: 'clamp(10px, 1.5vw, 11px)',
                          color: '#9ca3af',
                          fontWeight: 300
                        }}>
                          {formatDate(booking.created_on)}
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
            )}
          </div>
        )}

        {/* Drivers Section */}
        {activeSection === 'drivers' && (
          <div style={{
            backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
            border: '1px solid var(--bw-border)',
            borderRadius: '12px',
            padding: 'clamp(16px, 3vw, 20px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(16px, 3vw, 20px)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(18px, 3vw, 22px)',
                fontWeight: 400,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)'
              }}>
                Drivers
              </h2>
              {selectedDriver && (
                <button
                  onClick={() => setSelectedDriver(null)}
                  style={{
                    padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2.5vw, 16px)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '6px',
                    color: 'var(--bw-text)',
                    cursor: 'pointer',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: 300
                  }}
                >
                  Back to List
                </button>
              )}
            </div>

            {selectedDriver ? (
              /* Driver Details View */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(16px, 3vw, 20px)'
              }}>
                {isLoadingDriver ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'clamp(40px, 8vw, 60px)',
                    color: 'var(--bw-text)',
                    opacity: 0.6,
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}>
                    Loading driver details...
                  </div>
                ) : (
                  <>
                    {/* Driver Info Card */}
                    <div style={{
                      border: '1px solid var(--bw-border)',
                      borderRadius: '8px',
                      padding: 'clamp(16px, 3vw, 20px)',
                      backgroundColor: 'var(--bw-bg)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(12px, 2.5vw, 16px)',
                        marginBottom: 'clamp(16px, 3vw, 20px)'
                      }}>
                        <div style={{
                          width: 'clamp(50px, 8vw, 60px)',
                          height: 'clamp(50px, 8vw, 60px)',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Users size={24} style={{ width: 'clamp(24px, 4vw, 28px)', height: 'clamp(24px, 4vw, 28px)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: '0 0 4px 0',
                            fontSize: 'clamp(18px, 3vw, 22px)',
                            fontWeight: 400,
                            fontFamily: 'Work Sans, sans-serif',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.full_name}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: 'clamp(12px, 2vw, 13px)',
                              color: selectedDriver.is_active ? '#10b981' : '#6b7280'
                            }}>
                              {selectedDriver.is_active ? (
                                <CheckCircle size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {selectedDriver.is_active ? 'Active' : 'Inactive'}
                            </div>
                            {selectedDriver.status && (
                              <div style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))',
                                fontSize: 'clamp(11px, 1.8vw, 12px)',
                                color: 'var(--bw-text)',
                                opacity: 0.8
                              }}>
                                {selectedDriver.status}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 25vw, 200px), 1fr))',
                        gap: 'clamp(12px, 2.5vw, 16px)',
                        paddingTop: 'clamp(12px, 2.5vw, 16px)',
                        borderTop: '1px solid var(--bw-border)'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            color: 'var(--bw-text)',
                            opacity: 0.7,
                            marginBottom: '4px'
                          }}>
                            Driver Type
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 2vw, 14px)',
                            color: 'var(--bw-text)',
                            fontWeight: 300,
                            fontFamily: 'Work Sans, sans-serif',
                            textTransform: 'capitalize'
                          }}>
                            {selectedDriver.driver_type || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            color: 'var(--bw-text)',
                            opacity: 0.7,
                            marginBottom: '4px'
                          }}>
                            Completed Rides
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 2vw, 14px)',
                            color: 'var(--bw-text)',
                            fontWeight: 300,
                            fontFamily: 'Work Sans, sans-serif'
                          }}>
                            {selectedDriver.completed_rides || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            color: 'var(--bw-text)',
                            opacity: 0.7,
                            marginBottom: '4px'
                          }}>
                            Phone Number
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
                            {formatPhoneNumber(selectedDriver.phone_no)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info Card */}
                    {selectedDriver.vehicle ? (
                      <div style={{
                        border: '1px solid var(--bw-border)',
                        borderRadius: '8px',
                        padding: 'clamp(16px, 3vw, 20px)',
                        backgroundColor: 'var(--bw-bg)'
                      }}>
                        {/* Vehicle Images */}
                        {(selectedDriver.vehicle as any)?.vehicle_images && Object.keys((selectedDriver.vehicle as any).vehicle_images).length > 0 && (
                          <div style={{
                            marginBottom: 'clamp(16px, 3vw, 20px)',
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
                              {Object.entries((selectedDriver.vehicle as any).vehicle_images as Record<string, string>).map(([imageType, imageUrl]) => (
                                <img
                                  key={imageType}
                                  src={imageUrl}
                                  alt={`${selectedDriver.vehicle.make} ${selectedDriver.vehicle.model} - ${imageType.replace('_', ' ')}`}
                                  style={{
                                    minWidth: 'clamp(150px, 30vw, 220px)',
                                    width: 'clamp(150px, 30vw, 220px)',
                                    height: 'clamp(112px, 22vw, 165px)',
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
                          gap: 'clamp(12px, 2.5vw, 16px)',
                          marginBottom: 'clamp(16px, 3vw, 20px)'
                        }}>
                          <div style={{
                            width: 'clamp(50px, 8vw, 60px)',
                            height: 'clamp(50px, 8vw, 60px)',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Car size={24} style={{ width: 'clamp(24px, 4vw, 28px)', height: 'clamp(24px, 4vw, 28px)' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{
                              margin: '0 0 4px 0',
                              fontSize: 'clamp(18px, 3vw, 22px)',
                              fontWeight: 400,
                              fontFamily: 'Work Sans, sans-serif',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                            </h3>
                            {selectedDriver.vehicle.year && (
                              <div style={{
                                fontSize: 'clamp(12px, 2vw, 13px)',
                                color: 'var(--bw-text)',
                                opacity: 0.7
                              }}>
                                {selectedDriver.vehicle.year}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 20vw, 150px), 1fr))',
                          gap: 'clamp(12px, 2.5vw, 16px)',
                          paddingTop: 'clamp(12px, 2.5vw, 16px)',
                          borderTop: '1px solid var(--bw-border)'
                        }}>
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              color: 'var(--bw-text)',
                              opacity: 0.7,
                              marginBottom: '4px'
                            }}>
                              License Plate
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 2vw, 14px)',
                              color: 'var(--bw-text)',
                              fontWeight: 300,
                              fontFamily: 'Work Sans, sans-serif'
                            }}>
                              {selectedDriver.vehicle.license_plate || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              color: 'var(--bw-text)',
                              opacity: 0.7,
                              marginBottom: '4px'
                            }}>
                              Color
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 2vw, 14px)',
                              color: 'var(--bw-text)',
                              fontWeight: 300,
                              fontFamily: 'Work Sans, sans-serif',
                              textTransform: 'capitalize'
                            }}>
                              {selectedDriver.vehicle.color || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              color: 'var(--bw-text)',
                              opacity: 0.7,
                              marginBottom: '4px'
                            }}>
                              Seating Capacity
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 2vw, 14px)',
                              color: 'var(--bw-text)',
                              fontWeight: 300,
                              fontFamily: 'Work Sans, sans-serif'
                            }}>
                              {selectedDriver.vehicle.seating_capacity || 'N/A'}
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
                              color: selectedDriver.vehicle.status === 'available' ? '#10b981' : '#6b7280',
                              fontWeight: 300,
                              fontFamily: 'Work Sans, sans-serif',
                              textTransform: 'capitalize'
                            }}>
                              {selectedDriver.vehicle.status || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        border: '1px solid var(--bw-border)',
                        borderRadius: '8px',
                        padding: 'clamp(16px, 3vw, 20px)',
                        backgroundColor: 'var(--bw-bg)',
                        textAlign: 'center',
                        color: 'var(--bw-text)',
                        opacity: 0.6,
                        fontSize: 'clamp(13px, 2vw, 14px)'
                      }}>
                        No vehicle assigned to this driver
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Drivers List View */
              <>
                {isLoading && drivers.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'clamp(40px, 8vw, 60px)',
                    color: 'var(--bw-text)',
                    opacity: 0.6,
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}>
                    Loading drivers...
                  </div>
                ) : drivers.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: 'clamp(40px, 8vw, 60px)',
                    color: 'var(--bw-text)',
                    opacity: 0.6,
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}>
                    No drivers available.
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 35vw, 300px), 1fr))',
                    gap: 'clamp(12px, 2.5vw, 16px)'
                  }}>
                    {drivers.map((driver) => (
                      <div
                        key={driver.id}
                        onClick={() => loadDriverDetails(driver.id)}
                        style={{
                          border: '1px solid var(--bw-border)',
                          borderRadius: '8px',
                          padding: 'clamp(12px, 2.5vw, 16px)',
                          backgroundColor: 'var(--bw-bg)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))'
                          e.currentTarget.style.borderColor = 'var(--bw-fg)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg)'
                          e.currentTarget.style.borderColor = 'var(--bw-border)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'clamp(12px, 2.5vw, 16px)',
                          marginBottom: 'clamp(12px, 2.5vw, 16px)'
                        }}>
                          <div style={{
                            width: 'clamp(40px, 6vw, 50px)',
                            height: 'clamp(40px, 6vw, 50px)',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Users size={20} style={{ width: 'clamp(20px, 3vw, 24px)', height: 'clamp(20px, 3vw, 24px)' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 'clamp(16px, 3vw, 18px)',
                              fontWeight: 600,
                              color: 'var(--bw-text)',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {driver.full_name}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: 'clamp(11px, 1.8vw, 12px)',
                              color: driver.is_active ? '#10b981' : '#6b7280'
                            }}>
                              {driver.is_active ? (
                                <CheckCircle size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {driver.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(8px, 1.5vw, 10px)',
                          paddingTop: 'clamp(10px, 2vw, 12px)',
                          borderTop: '1px solid var(--bw-border)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 'clamp(12px, 2vw, 13px)'
                          }}>
                            <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Type:</span>
                            <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif', textTransform: 'capitalize' }}>
                              {driver.driver_type || 'N/A'}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 'clamp(12px, 2vw, 13px)'
                          }}>
                            <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Rides:</span>
                            <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                              {driver.completed_rides || 0}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 'clamp(12px, 2vw, 13px)'
                          }}>
                            <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Phone:</span>
                            <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} />
                              {formatPhoneNumber(driver.phone_no)}
                            </span>
                          </div>
                          {driver.vehicle && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 'clamp(12px, 2vw, 13px)'
                            }}>
                              <span style={{ color: 'var(--bw-text)', opacity: 0.7 }}>Vehicle:</span>
                              <span style={{ color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                                {driver.vehicle.make} {driver.vehicle.model}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          {vehicleCategories.find(cat => cat.id === vehicle.vehicle_category_id)?.vehicle_category || 'N/A'}
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
      `}</style>
    </div>
  )
}
