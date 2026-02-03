import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { type BookingResponse } from '@api/bookings'
import { CheckCircle, MapPin, Calendar, Clock, CurrencyDollar } from '@phosphor-icons/react'

export default function BookingSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const { slug } = useTenantInfo()
  const [booking, setBooking] = useState<BookingResponse | null>(null)

  useEffect(() => {
    // Get booking data from navigation state
    const bookingData = location.state?.booking as BookingResponse | undefined
    if (!bookingData) {
      // Redirect back to dashboard if no booking data
      navigate('/rider/dashboard', { replace: true })
      return
    }
    setBooking(bookingData)
  }, [location.state, navigate])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!booking) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bw-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Work Sans, sans-serif'
      }}>
        <div style={{ color: 'var(--bw-text)', fontSize: '16px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bw-bg)',
      fontFamily: 'Work Sans, sans-serif',
      padding: 'clamp(16px, 3vw, 24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          width: 'clamp(80px, 10vw, 120px)',
          height: 'clamp(80px, 10vw, 120px)',
          margin: '0 auto clamp(24px, 3vw, 32px)',
          borderRadius: '50%',
          backgroundColor: 'var(--bw-success, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle size={60} style={{ color: '#ffffff' }} />
        </div>

        {/* Success Message */}
        <h1 style={{
          margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 200,
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--bw-text)'
        }}>
          Ride Confirmed!
        </h1>
        <p style={{
          margin: '0 0 clamp(32px, 5vw, 48px) 0',
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--bw-muted)',
          lineHeight: 1.6,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Your ride has been successfully confirmed. We'll see you soon!
        </p>

        {/* Booking Details Card */}
        <div style={{
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          border: '1px solid var(--bw-border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 24px)',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          textAlign: 'left'
        }}>
          {/* Price */}
          {booking.estimated_price > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: 'clamp(16px, 3vw, 20px)',
              paddingBottom: 'clamp(16px, 3vw, 20px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <CurrencyDollar size={20} style={{ color: 'var(--bw-text)', opacity: 0.7 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  marginBottom: '4px'
                }}>
                  Estimated Price
                </div>
                <div style={{
                  fontSize: 'clamp(20px, 3vw, 24px)',
                  fontWeight: 600,
                  color: 'var(--bw-text)',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  ${booking.estimated_price.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Pickup Location */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: 'clamp(12px, 2vw, 16px)'
          }}>
            <MapPin size={18} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'clamp(11px, 1.8vw, 12px)',
                color: 'var(--bw-text)',
                opacity: 0.7,
                marginBottom: '4px'
              }}>
                Pickup Location
              </div>
              <div style={{
                fontSize: 'clamp(13px, 2vw, 14px)',
                color: 'var(--bw-text)',
                fontWeight: 300,
                fontFamily: 'Work Sans, sans-serif'
              }}>
                {booking.pickup_location}
              </div>
            </div>
          </div>

          {/* Pickup Time */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: 'clamp(12px, 2vw, 16px)'
          }}>
            <Calendar size={18} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'clamp(11px, 1.8vw, 12px)',
                color: 'var(--bw-text)',
                opacity: 0.7,
                marginBottom: '4px'
              }}>
                Pickup Time
              </div>
              <div style={{
                fontSize: 'clamp(13px, 2vw, 14px)',
                color: 'var(--bw-text)',
                fontWeight: 300,
                fontFamily: 'Work Sans, sans-serif'
              }}>
                {formatDate(booking.pickup_time)}
              </div>
            </div>
          </div>

          {/* Dropoff Time (ETA) */}
          {booking.dropoff_time && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: 'clamp(12px, 2vw, 16px)'
            }}>
              <Clock size={18} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'clamp(11px, 1.8vw, 12px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  marginBottom: '4px'
                }}>
                  Estimated Dropoff Time (ETA)
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  fontWeight: 300,
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  {formatDate(booking.dropoff_time)}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {booking.payment_method && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              paddingTop: 'clamp(12px, 2vw, 16px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'clamp(11px, 1.8vw, 12px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  marginBottom: '4px'
                }}>
                  Payment Method
                </div>
                <div style={{
                  fontSize: 'clamp(13px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  fontWeight: 300,
                  fontFamily: 'Work Sans, sans-serif',
                  textTransform: 'capitalize'
                }}>
                  {booking.payment_method}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/rider/dashboard', { replace: true })}
          style={{
            padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)',
            borderRadius: 7,
            backgroundColor: 'var(--bw-fg)',
            color: 'var(--bw-bg)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Work Sans, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

