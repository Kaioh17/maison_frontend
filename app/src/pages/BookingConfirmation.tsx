import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { approveBooking, type BookingResponse } from '@api/bookings'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import { MapPin, Calendar, Clock, DollarSign, Car, ChevronDown, X, Check } from 'lucide-react'

// Stripe Logo SVG Component
const StripeLogo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.397 2.8 5.747 6.976 7.076 2.172.806 3.356 1.426 3.356 2.409 0 .98-.84 1.545-2.354 1.545-1.905 0-4.515-.927-6.29-1.87L3.55 24.05c1.713.927 4.59 1.87 8.617 1.87 2.5 0 4.58-.654 6.063-1.87 1.545-1.305 2.227-3.15 2.227-5.376 0-4.397-2.8-5.747-6.976-7.076z" fill="#635BFF"/>
  </svg>
)

// Zelle Logo SVG Component
const ZelleLogo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.5-3.5h-3L4 12l3.5-3.5h3L7.5 12l3 4.5zm9 0h-3L13 12l3-3.5h3L16.5 12l3 4.5z" fill="#6D1ED4"/>
  </svg>
)

export default function BookingConfirmation() {
  useFavicon()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'zelle' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [showPaymentSheet, setShowPaymentSheet] = useState(false)

  useEffect(() => {
    // Get booking data from navigation state
    const bookingData = location.state?.booking as BookingResponse | undefined
    if (!bookingData) {
      // Redirect back to booking form if no booking data
      navigate('/rider/book', { replace: true })
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

  const handleConfirm = async () => {
    if (!selectedPaymentMethod || !booking || !booking.id) {
      setError('Please select a payment method')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      const response = await approveBooking(booking.id, true, selectedPaymentMethod)
      if (response.success) {
        // Merge response data with existing booking data
        const updatedBooking = {
          ...booking,
          ...response.data,
          is_approved: response.data.is_approved ?? true
        }

        // If card payment is selected and client_secret is provided, navigate to payment page
        if (selectedPaymentMethod === 'card' && response.data.payment?.client_secret) {
          navigate('/rider/payment', {
            state: { 
              booking: updatedBooking,
              clientSecret: response.data.payment.client_secret
            }
          })
          return
        }
        // Legacy: If card payment is selected and checkout session URL is provided, redirect to Stripe checkout
        if (selectedPaymentMethod === 'card' && response.data.payment?.checkout_session) {
          window.location.href = response.data.payment.checkout_session
          return
        }
        // Otherwise, navigate to booking success page
        navigate('/rider/booking-success', {
          state: { booking: updatedBooking }
        })
      } else {
        setError(response.message || 'Failed to confirm booking')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to confirm booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!booking || !booking.id) return

    try {
      setIsLoading(true)
      setError('')
      await approveBooking(booking.id, false, 'cash')
      // Navigate back to dashboard
      navigate('/rider/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to decline booking')
      setIsLoading(false)
    }
  }

  const handlePaymentMethodSelect = (method: 'cash' | 'card' | 'zelle') => {
    setSelectedPaymentMethod(method)
    setShowPaymentSheet(false)
  }

  const getPaymentMethodDisplayName = (method: 'cash' | 'card' | 'zelle' | null) => {
    if (!method) return 'Select Payment Method'
    return method.charAt(0).toUpperCase() + method.slice(1)
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
      flexDirection: 'column'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{
          margin: '0 0 clamp(24px, 4vw, 32px) 0',
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 200,
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--bw-text)',
          textAlign: 'center'
        }}>
          Confirm Your Ride
        </h1>

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

        {/* Booking Details Card */}
        <div style={{
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          border: '1px solid var(--bw-border)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 28px)',
          marginBottom: 'clamp(20px, 4vw, 24px)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.2s ease'
        }}>
          {/* Price */}
          {booking.estimated_price > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: 'clamp(20px, 4vw, 24px)',
              paddingBottom: 'clamp(16px, 3vw, 20px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bw-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--bw-border)'
              }}>
                <DollarSign size={24} style={{ color: 'var(--bw-text)', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  marginBottom: '4px',
                  fontFamily: 'Work Sans, sans-serif'
                }}>
                  Estimated Price
                </div>
                <div style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 600,
                  color: 'var(--bw-text)',
                  fontFamily: 'DM Sans, sans-serif',
                  letterSpacing: '-0.02em'
                }}>
                  ${booking.estimated_price.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Service Type */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: 'clamp(16px, 3vw, 20px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <Car size={20} style={{ color: 'var(--bw-text)', opacity: 0.7 }} />
              <div style={{
                fontSize: 'clamp(12px, 2vw, 14px)',
                color: 'var(--bw-text)',
                opacity: 0.7,
                fontFamily: 'Work Sans, sans-serif'
              }}>
                Service Type
              </div>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'clamp(6px, 1.2vw, 8px) clamp(12px, 2.5vw, 16px)',
              borderRadius: '20px',
              backgroundColor: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border)',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 500,
              color: 'var(--bw-text)',
              fontFamily: 'Work Sans, sans-serif',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              {booking.service_type}
            </div>
          </div>

          {/* Pickup Location */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(12px, 2.5vw, 16px)',
            marginBottom: 'clamp(16px, 3vw, 20px)',
            padding: 'clamp(12px, 2.5vw, 16px)',
            borderRadius: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            transition: 'all 0.2s ease'
          }}>
            <MapPin size={20} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'clamp(12px, 2vw, 14px)',
                color: 'var(--bw-text)',
                opacity: 0.7,
                marginBottom: '6px',
                fontFamily: 'Work Sans, sans-serif',
                fontWeight: 500
              }}>
                Pickup Location
              </div>
              <div style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                color: 'var(--bw-text)',
                fontWeight: 400,
                fontFamily: 'Work Sans, sans-serif',
                lineHeight: 1.5
              }}>
                {booking.pickup_location}
              </div>
            </div>
          </div>

          {/* Dropoff Location */}
          {booking.dropoff_location && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(12px, 2.5vw, 16px)',
              marginBottom: 'clamp(16px, 3vw, 20px)',
              padding: 'clamp(12px, 2.5vw, 16px)',
              borderRadius: '12px',
              backgroundColor: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border)',
              transition: 'all 0.2s ease'
            }}>
              <MapPin size={20} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  marginBottom: '6px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 500
                }}>
                  Dropoff Location
                </div>
                <div style={{
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  color: 'var(--bw-text)',
                  fontWeight: 400,
                  fontFamily: 'Work Sans, sans-serif',
                  lineHeight: 1.5
                }}>
                  {booking.dropoff_location}
                </div>
              </div>
            </div>
          )}

          {/* Pickup Time */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(12px, 2.5vw, 16px)',
            marginBottom: 'clamp(16px, 3vw, 20px)',
            padding: 'clamp(12px, 2.5vw, 16px)',
            borderRadius: '12px',
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            transition: 'all 0.2s ease'
          }}>
            <Calendar size={20} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'clamp(12px, 2vw, 14px)',
                color: 'var(--bw-text)',
                opacity: 0.7,
                marginBottom: '6px',
                fontFamily: 'Work Sans, sans-serif',
                fontWeight: 500
              }}>
                Pickup Time
              </div>
              <div style={{
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                color: 'var(--bw-text)',
                fontWeight: 400,
                fontFamily: 'Work Sans, sans-serif',
                lineHeight: 1.5
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
              gap: 'clamp(12px, 2.5vw, 16px)',
              marginBottom: 'clamp(16px, 3vw, 20px)',
              padding: 'clamp(12px, 2.5vw, 16px)',
              borderRadius: '12px',
              backgroundColor: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border)',
              transition: 'all 0.2s ease'
            }}>
              <Clock size={20} style={{ marginTop: '2px', color: 'var(--bw-text)', opacity: 0.7, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  color: 'var(--bw-text)',
                  opacity: 0.7,
                  marginBottom: '6px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 500
                }}>
                  Estimated Dropoff Time (ETA)
                </div>
                <div style={{
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  color: 'var(--bw-text)',
                  fontWeight: 400,
                  fontFamily: 'Work Sans, sans-serif',
                  lineHeight: 1.5
                }}>
                  {formatDate(booking.dropoff_time)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <div style={{
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          border: '1px solid var(--bw-border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 24px)',
          marginBottom: 'clamp(20px, 4vw, 24px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{
            margin: '0 0 clamp(16px, 3vw, 20px) 0',
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 400,
            fontFamily: 'Work Sans, sans-serif',
            color: 'var(--bw-text)'
          }}>
            Payment Method
          </h2>
          <button
            onClick={() => setShowPaymentSheet(true)}
            style={{
              width: '100%',
              padding: 'clamp(14px, 2.5vw, 18px) clamp(16px, 3vw, 20px)',
              borderRadius: '8px',
              border: '1px solid var(--bw-border)',
              backgroundColor: selectedPaymentMethod ? 'var(--bw-bg-secondary)' : 'var(--bw-bg)',
              color: 'var(--bw-text)',
              cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              boxShadow: selectedPaymentMethod ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!selectedPaymentMethod) {
                e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (!selectedPaymentMethod) {
                e.currentTarget.style.backgroundColor = 'var(--bw-bg)'
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedPaymentMethod === 'card' && <StripeLogo size={20} />}
              {selectedPaymentMethod === 'zelle' && <ZelleLogo size={20} />}
              <span>{getPaymentMethodDisplayName(selectedPaymentMethod)}</span>
            </div>
            <ChevronDown size={20} style={{ color: 'var(--bw-text)', opacity: 0.6 }} />
          </button>
          {/* Payment Method Information */}
          {selectedPaymentMethod && (
            <div style={{
              marginTop: 'clamp(16px, 3vw, 20px)',
              paddingTop: 'clamp(16px, 3vw, 20px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <p style={{
                fontSize: 'clamp(11px, 1.8vw, 12px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                margin: 0,
                fontFamily: 'Work Sans, sans-serif',
                lineHeight: 1.5
              }}>
                {selectedPaymentMethod === 'card' && 'Card payments are powered by Stripe. Your payment information is secure and encrypted.'}
                {selectedPaymentMethod === 'zelle' && 'Zelle payments are processed directly through your bank. Please have your Zelle account ready.'}
                {selectedPaymentMethod === 'cash' && 'Cash payments will be collected at the time of service. Please have exact change ready.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 2.5vw, 16px)',
          marginBottom: 'clamp(32px, 5vw, 48px)'
        }}>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !selectedPaymentMethod}
            style={{
              width: '100%',
              padding: 'clamp(16px, 2.5vw, 20px) clamp(20px, 4vw, 24px)',
              borderRadius: '12px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              cursor: isLoading || !selectedPaymentMethod ? 'not-allowed' : 'pointer',
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(16px, 3vw, 18px)',
              opacity: isLoading || !selectedPaymentMethod ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: isLoading || !selectedPaymentMethod ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && selectedPaymentMethod) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && selectedPaymentMethod) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
              }
            }}
          >
            {isLoading ? 'Processing...' : 'Confirm Ride'}
          </button>
          <button
            onClick={handleDecline}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Work Sans, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            Decline Ride
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: 'clamp(24px, 4vw, 32px)',
          borderTop: '1px solid var(--bw-border)',
          marginTop: 'auto'
        }}>
          <p style={{
            fontSize: 'clamp(11px, 1.8vw, 12px)',
            color: 'var(--bw-text)',
            opacity: 0.5,
            margin: 0,
            fontFamily: 'Work Sans, sans-serif'
          }}>
            Powered by Maison
          </p>
        </div>
      </div>

      {/* Payment Method Bottom Sheet */}
      {showPaymentSheet && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowPaymentSheet(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease',
              backdropFilter: 'blur(2px)'
            }}
          />
          {/* Bottom Sheet */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: 'clamp(20px, 4vw, 24px)',
              paddingBottom: 'clamp(32px, 6vw, 48px)',
              boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
              zIndex: 1001,
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease-out',
              borderTop: '1px solid var(--bw-border)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'clamp(20px, 4vw, 24px)'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif',
                color: 'var(--bw-text)'
              }}>
                Select Payment Method
              </h2>
              <button
                onClick={() => setShowPaymentSheet(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--bw-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.opacity = '0.7'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Payment Options */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 2.5vw, 16px)'
            }}>
              {(['card', 'zelle', 'cash'] as const).map((method) => {
                const isSelected = selectedPaymentMethod === method
                return (
                  <button
                    key={method}
                    onClick={() => handlePaymentMethodSelect(method)}
                    style={{
                      padding: 'clamp(16px, 3vw, 20px)',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--bw-accent)' : '1px solid var(--bw-border)',
                      backgroundColor: isSelected ? 'var(--bw-bg-secondary)' : 'var(--bw-bg)',
                      color: 'var(--bw-text)',
                      cursor: 'pointer',
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: 'clamp(15px, 2.5vw, 17px)',
                      fontWeight: isSelected ? 500 : 400,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                      textTransform: 'capitalize'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--bw-bg)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2.5vw, 16px)' }}>
                      {method === 'card' && <StripeLogo size={24} />}
                      {method === 'zelle' && <ZelleLogo size={24} />}
                      {method === 'cash' && (
                        <DollarSign size={24} style={{ color: 'var(--bw-text)', opacity: 0.7 }} />
                      )}
                      <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                    </div>
                    {isSelected && (
                      <Check size={20} style={{ color: 'var(--bw-accent)' }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Payment Method Information */}
            <div style={{
              marginTop: 'clamp(20px, 4vw, 24px)',
              paddingTop: 'clamp(16px, 3vw, 20px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <p style={{
                fontSize: 'clamp(12px, 2vw, 13px)',
                color: 'var(--bw-text)',
                opacity: 0.6,
                margin: 0,
                fontFamily: 'Work Sans, sans-serif',
                lineHeight: 1.6
              }}>
                Your payment information is secure and encrypted. Select a payment method to continue.
              </p>
            </div>
          </div>
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

