import { useEffect, useState } from 'react'
import { createBooking, getBookings, type BookingResponse } from '@api/bookings'
import { useAuthStore } from '@store/auth'
import { Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { MapPin, Calendar, CreditCard, Car, User, LogOut, UserCircle } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { tenantInfo, slug } = useTenantInfo()

  const load = async () => {
    try {
      setIsLoading(true)
      const response = await getBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        setBookings([])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load bookings')
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const book = async () => {
    if (!form.pickup_location || !form.dropoff_location || !form.city || !form.pickup_time_local) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      const response = await createBooking({
        vehicle_id: form.vehicle_id || undefined,
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
        await load()
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bw-bg)',
      padding: '16px',
      fontFamily: 'Work Sans, sans-serif'
    }}>
      {/* Header - Mobile First */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--bw-text)'
          }}>
            Rider Dashboard
          </h1>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <Link 
              to={slug ? `/${slug}/riders/profile` : '/riders/profile'} 
              style={{ textDecoration: 'none' }}
            >
              <button 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--bw-border)',
                  borderRadius: '6px',
                  color: 'var(--bw-text)',
                  cursor: 'pointer',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '14px'
                }}
              >
                <UserCircle size={16} />
                Profile
              </button>
            </Link>
            <button 
              onClick={() => useAuthStore.getState().logout()} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--bw-border)',
                borderRadius: '6px',
                color: 'var(--bw-text)',
                cursor: 'pointer',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '14px'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Book a Ride Form - Mobile First */}
      <div style={{
        backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
        border: '1px solid var(--bw-border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--bw-text)'
        }}>
          Book a Ride
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Service Type and Payment Method - Stack on mobile, side by side on desktop */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px'
          }}
          className="booking-form-row"
          >
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
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
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--bw-border)',
                  backgroundColor: 'var(--bw-bg)',
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
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
                fontSize: '14px',
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
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--bw-border)',
                  backgroundColor: 'var(--bw-bg)',
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="zelle">Zelle</option>
              </select>
            </div>
          </div>

          {/* City and Vehicle ID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px'
          }}
          className="booking-form-row"
          >
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
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
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--bw-border)',
                  backgroundColor: 'var(--bw-bg)',
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--bw-text)'
              }}>
                Vehicle ID (Optional)
              </label>
              <input 
                type="number"
                className="bw-input" 
                placeholder="Vehicle ID" 
                value={form.vehicle_id || ''} 
                onChange={(e) => setForm({ ...form, vehicle_id: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--bw-border)',
                  backgroundColor: 'var(--bw-bg)',
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              fontSize: '14px',
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
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--bw-border)',
                backgroundColor: 'var(--bw-bg)',
                color: 'var(--bw-text)',
                fontFamily: 'Work Sans, sans-serif'
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
              fontSize: '14px',
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
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--bw-border)',
                backgroundColor: 'var(--bw-bg)',
                color: 'var(--bw-text)',
                fontFamily: 'Work Sans, sans-serif'
              }}
            />
          </div>

          {/* Pickup and Dropoff Time */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px'
          }}
          className="booking-form-row"
          >
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--bw-text)'
              }}>
                <Calendar size={16} />
                Pickup Time *
              </label>
              <input 
                className="bw-input" 
                type="datetime-local" 
                value={form.pickup_time_local} 
                onChange={(e) => setForm({ ...form, pickup_time_local: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--bw-border)',
                  backgroundColor: 'var(--bw-bg)',
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--bw-text)'
              }}>
                <Calendar size={16} />
                Dropoff Time (Optional)
              </label>
              <input 
                className="bw-input" 
                type="datetime-local" 
                value={form.dropoff_time_local} 
                onChange={(e) => setForm({ ...form, dropoff_time_local: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--bw-border)',
                  backgroundColor: 'var(--bw-bg)',
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
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
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--bw-border)',
                backgroundColor: 'var(--bw-bg)',
                color: 'var(--bw-text)',
                fontFamily: 'Work Sans, sans-serif',
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
              padding: '14px 24px',
              borderRadius: '8px',
              backgroundColor: 'var(--bw-fg)',
              color: 'var(--bw-bg)',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Booking...' : 'Book Ride'}
          </button>
        </div>
      </div>

      {/* My Bookings - Mobile First */}
      <div style={{
        backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
        border: '1px solid var(--bw-border)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--bw-text)'
        }}>
          My Bookings
        </h2>

        {isLoading && bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--bw-text)',
            opacity: 0.6
          }}>
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--bw-text)',
            opacity: 0.6
          }}>
            No bookings yet. Book your first ride!
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: '1px solid var(--bw-border)',
                  borderRadius: '8px',
                  padding: '16px',
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
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--bw-text)',
                      marginBottom: '4px'
                    }}>
                      Booking #{booking.id}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--bw-text)',
                      opacity: 0.7
                    }}>
                      {formatDate(booking.created_on)}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: getStatusColor(booking.booking_status) + '20',
                    color: getStatusColor(booking.booking_status),
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {booking.booking_status}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <MapPin size={16} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Pickup</div>
                      <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500 }}>{booking.pickup_location}</div>
                      <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginTop: '4px' }}>
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
                        <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Dropoff</div>
                        <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500 }}>{booking.dropoff_location}</div>
                        {booking.dropoff_time && (
                          <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginTop: '4px' }}>
                            {formatDate(booking.dropoff_time)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px',
                    marginTop: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--bw-border)'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Service</div>
                      <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500, textTransform: 'capitalize' }}>
                        {booking.service_type}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Payment</div>
                      <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500, textTransform: 'capitalize' }}>
                        {booking.payment_method}
                      </div>
                    </div>
                    {booking.estimated_price > 0 && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Price</div>
                        <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500 }}>
                          ${booking.estimated_price.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {booking.vehicle && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Vehicle</div>
                        <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500 }}>{booking.vehicle}</div>
                      </div>
                    )}
                    {booking.driver_fullname && (
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--bw-text)', opacity: 0.7, marginBottom: '4px' }}>Driver</div>
                        <div style={{ fontSize: '14px', color: 'var(--bw-text)', fontWeight: 500 }}>{booking.driver_fullname}</div>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div style={{
                      marginTop: '8px',
                      padding: '12px',
                      backgroundColor: 'var(--bw-bg)',
                      borderRadius: '6px',
                      fontSize: '14px',
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

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (min-width: 640px) {
          .booking-form-row {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        
        @media (max-width: 639px) {
          .booking-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
