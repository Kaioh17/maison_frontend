import { useEffect, useState } from 'react'
import { getDriverInfo, getAvailableRides, respondToRide, updateDriverStatus, type DriverResponse } from '@api/driver'
import { getVehicles, type VehicleResponse } from '@api/vehicles'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import { MapPin, Calendar, CreditCard, Car, User, LogOut, UserCircle, Menu, X, LayoutDashboard, List, CheckCircle, XCircle, Phone, AlertCircle, Clock } from 'lucide-react'
import type { BookingResponse } from '@api/tenant'

type MenuSection = 'dashboard' | 'rides' | 'vehicles'

export default function DriverDashboard() {
  useFavicon()
  const [info, setInfo] = useState<DriverResponse | null>(null)
  const [rides, setRides] = useState<BookingResponse[]>([])
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
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
        // Filter rides to only show those updated within the last 24 hours
        const recentRides = r.data.filter(ride => isWithin24Hours(ride.updated_on))
        setRides(recentRides)
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
  }, [])

  const getActionMessage = (action: 'confirm' | 'cancelled' | 'completed'): string => {
    switch (action) {
      case 'confirm':
        return 'accept this ride'
      case 'cancelled':
        return 'decline this ride'
      case 'completed':
        return 'mark this ride as completed'
      default:
        return 'perform this action'
    }
  }

  const act = async (id: number, action: 'confirm' | 'cancelled' | 'completed') => {
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
        return <AlertCircle size={14} style={{ color }} />
    }
  }

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rides' as MenuSection, label: 'Available Rides', icon: List },
    { id: 'vehicles' as MenuSection, label: 'Vehicles', icon: Car },
  ]

  const getActiveSectionFromUrl = (): MenuSection => {
    const path = location.pathname
    if (path.includes('/driver/rides')) return 'rides'
    if (path.includes('/driver/vehicles')) return 'vehicles'
    return 'dashboard'
  }

  const activeSection = getActiveSectionFromUrl()

  const handleMenuSelect = (section: MenuSection) => {
    if (section === 'dashboard') {
      navigate('/driver/dashboard', { replace: true })
    } else if (section === 'rides') {
      navigate('/driver/rides', { replace: true })
    } else if (section === 'vehicles') {
      navigate('/driver/vehicles', { replace: true })
    }
    setIsMenuOpen(false)
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
                  {info?.completed_rides || 0}
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
                  {rides.length}
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

            {/* Action Button */}
            <button
              onClick={() => handleMenuSelect('rides')}
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
              View Available Rides
            </button>
          </div>
        )}

        {/* Rides Section */}
        {activeSection === 'rides' && (
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
              Available Rides
            </h2>

            {isLoading && rides.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                Loading rides...
              </div>
            ) : rides.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 8vw, 60px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                No available rides at the moment.
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(12px, 2.5vw, 16px)'
              }}>
                {rides.map((ride) => (
                  <div
                    key={ride.id}
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
                          Booking #{ride.id}
                        </div>
                      </div>
                      {ride.booking_status && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: getStatusColorHex(ride.booking_status) + '20',
                          border: `1px solid ${getStatusColorHex(ride.booking_status)}`,
                          fontSize: 'clamp(11px, 1.8vw, 12px)',
                          fontFamily: 'Work Sans, sans-serif',
                          fontWeight: 500,
                          color: getStatusColorHex(ride.booking_status)
                        }}>
                          {getStatusIcon(ride.booking_status)}
                          <span style={{ textTransform: 'capitalize' }}>
                            {ride.booking_status}
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
                          <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{ride.pickup_location}</div>
                          <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#9ca3af', fontWeight: 300, marginTop: '4px' }}>
                            {formatDate(ride.pickup_time)}
                          </div>
                        </div>
                      </div>

                      {ride.dropoff_location && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          <MapPin size={16} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Dropoff</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{ride.dropoff_location}</div>
                            {ride.dropoff_time && (
                              <div style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#9ca3af', fontWeight: 300, marginTop: '4px' }}>
                                {formatDate(ride.dropoff_time)}
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
                            {ride.service_type}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Payment</div>
                          <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif', textTransform: 'capitalize' }}>
                            {ride.payment_method}
                          </div>
                        </div>
                        {ride.estimated_price > 0 && (
                          <div>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Price</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>
                              ${ride.estimated_price.toFixed(2)}
                            </div>
                          </div>
                        )}
                        {ride.customer_name && (
                          <div>
                            <div style={{ fontSize: 'clamp(11px, 1.8vw, 12px)', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Customer</div>
                            <div style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'var(--bw-text)', fontWeight: 300, fontFamily: 'Work Sans, sans-serif' }}>{ride.customer_name}</div>
                          </div>
                        )}
                      </div>

                      {ride.notes && (
                        <div style={{
                          marginTop: '8px',
                          padding: 'clamp(10px, 2vw, 12px)',
                          backgroundColor: 'var(--bw-bg)',
                          borderRadius: '6px',
                          fontSize: 'clamp(12px, 2vw, 14px)',
                          color: 'var(--bw-text)',
                          opacity: 0.8
                        }}>
                          <strong>Notes:</strong> {ride.notes}
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => act(ride.id, 'confirm')}
                        disabled={ride.booking_status?.toLowerCase() === 'completed'}
                        style={{
                          flex: 1,
                          minWidth: 'clamp(100px, 25vw, 120px)',
                          padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                          backgroundColor: ride.booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                          fontSize: 'clamp(13px, 2vw, 14px)',
                          fontFamily: 'Work Sans, sans-serif',
                          fontWeight: 500,
                          opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => act(ride.id, 'cancelled')}
                        disabled={ride.booking_status?.toLowerCase() === 'completed'}
                        style={{
                          flex: 1,
                          minWidth: 'clamp(100px, 25vw, 120px)',
                          padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                          backgroundColor: 'transparent',
                          color: ride.booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#ef4444',
                          border: `1px solid ${ride.booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#ef4444'}`,
                          borderRadius: '6px',
                          cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                          fontSize: 'clamp(13px, 2vw, 14px)',
                          fontFamily: 'Work Sans, sans-serif',
                          fontWeight: 500,
                          opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                        }}
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => act(ride.id, 'completed')}
                        disabled={ride.booking_status?.toLowerCase() === 'completed'}
                        style={{
                          flex: 1,
                          minWidth: 'clamp(100px, 25vw, 120px)',
                          padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                          backgroundColor: ride.booking_status?.toLowerCase() === 'completed' ? '#6b7280' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: ride.booking_status?.toLowerCase() === 'completed' ? 'not-allowed' : 'pointer',
                          fontSize: 'clamp(13px, 2vw, 14px)',
                          fontFamily: 'Work Sans, sans-serif',
                          fontWeight: 500,
                          opacity: ride.booking_status?.toLowerCase() === 'completed' ? 0.6 : 1
                        }}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                            gap: '8px'
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
                            gap: '8px'
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
