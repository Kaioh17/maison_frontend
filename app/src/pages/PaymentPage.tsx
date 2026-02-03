import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { STRIPE_PUBLISHABLE_KEY } from '@config'
import { type BookingResponse } from '@api/bookings'
import { useFavicon } from '@hooks/useFavicon'
import { Spinner, ArrowLeft, CreditCard } from '@phosphor-icons/react'

// Function to initialize Stripe with optional connected account
const getStripePromise = (tenantAcctId?: string) => {
  if (!STRIPE_PUBLISHABLE_KEY) return null
  
  const options: { stripeAccount?: string } = {}
  if (tenantAcctId) {
    options.stripeAccount = tenantAcctId
  }
  
  return loadStripe(STRIPE_PUBLISHABLE_KEY, options)
}

// Payment Form Component
function PaymentForm({ booking, clientSecret }: { booking: BookingResponse; clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [elementsError, setElementsError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // First, submit the elements to validate the form
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        setError(submitError.message || 'Please check your payment details.')
        setIsProcessing(false)
        return
      }

      // Then confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/rider/booking-success`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
        return
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Navigate to success page with booking data
        navigate('/rider/booking-success', {
          state: { booking }
        })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {error && (
        <div style={{
          padding: 'clamp(12px, 2vw, 16px)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: 'clamp(20px, 3vw, 24px)',
          fontSize: 'clamp(13px, 2vw, 14px)',
          fontFamily: 'Work Sans, sans-serif'
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
        border: '1px solid var(--bw-border)',
        borderRadius: '12px',
        padding: 'clamp(20px, 4vw, 24px)',
        marginBottom: 'clamp(24px, 4vw, 32px)'
      }}>
        <PaymentElement />
        <style>{`
          /* Reduce font size of Stripe terms text */
          .pii-consent-text,
          [data-testid="pii-consent-text"],
          .pii-consent-text p,
          div[class*="pii"],
          div[class*="consent"] {
            font-size: clamp(10px, 1.5vw, 11px) !important;
          }
          /* Target Stripe's terms text more specifically */
          form > div > div:last-child,
          .StripeElement + div,
          div[class*="Stripe"] div[class*="text"]:last-child {
            font-size: clamp(10px, 1.5vw, 11px) !important;
          }
        `}</style>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(12px, 2.5vw, 16px)'
      }}>
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          style={{
            width: '100%',
            padding: 'clamp(16px, 2.5vw, 20px) clamp(20px, 4vw, 24px)',
            borderRadius: '12px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            cursor: (!stripe || !elements || isProcessing) ? 'not-allowed' : 'pointer',
            fontFamily: 'Work Sans, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(16px, 3vw, 18px)',
            opacity: (!stripe || !elements || isProcessing) ? 0.6 : 1,
            transition: 'all 0.2s ease',
            boxShadow: (!stripe || !elements || isProcessing) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (stripe && elements && !isProcessing) {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (stripe && elements && !isProcessing) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
            }
          }}
        >
          {isProcessing ? (
            <>
              <Spinner size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              Pay ${booking.estimated_price.toFixed(2)}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/rider/dashboard', { replace: true })}
          disabled={isProcessing}
          style={{
            width: '100%',
            padding: 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)',
            borderRadius: '12px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid var(--bw-border)',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            fontFamily: 'Work Sans, sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            opacity: isProcessing ? 0.6 : 1,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          <ArrowLeft size={18} />
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Reduce font size of Stripe terms text */
        .pii-consent-text,
        [data-testid="pii-consent-text"],
        .pii-consent-text p,
        div[class*="pii"],
        div[class*="consent"],
        form > div > div:last-child p,
        .StripeElement + div p,
        div[class*="Stripe"] div[class*="text"]:last-child {
          font-size: clamp(10px, 1.5vw, 11px) !important;
        }
      `}</style>
    </form>
  )
}

// Main Payment Page Component
export default function PaymentPage() {
  useFavicon()
  const navigate = useNavigate()
  const location = useLocation()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

  useEffect(() => {
    // Get booking data and client_secret from navigation state
    const bookingData = location.state?.booking as BookingResponse | undefined
    const secret = location.state?.clientSecret as string | undefined

    if (!bookingData || !secret) {
      // Redirect back to booking form if no data
      navigate('/rider/book', { replace: true })
      return
    }

    setBooking(bookingData)
    setClientSecret(secret)
    
    // Initialize Stripe with tenant account ID if available
    const tenantAcctId = bookingData.payment?.tenant_acct_id
    const stripe = getStripePromise(tenantAcctId)
    setStripePromise(stripe)
  }, [location.state, navigate])

  if (!stripePromise) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bw-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Work Sans, sans-serif'
      }}>
        <div style={{
          padding: 'clamp(20px, 4vw, 24px)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          color: '#ef4444',
          fontSize: 'clamp(14px, 2.5vw, 16px)'
        }}>
          Stripe is not configured. Please contact support.
        </div>
      </div>
    )
  }

  if (!booking || !clientSecret) {
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

  // Get computed CSS variable values for Stripe (it doesn't accept CSS variables)
  const getComputedColor = (cssVar: string, fallback: string): string => {
    if (typeof window === 'undefined') return fallback
    try {
      const root = document.documentElement
      const value = getComputedStyle(root).getPropertyValue(cssVar).trim()
      return value || fallback
    } catch {
      return fallback
    }
  }

  const backgroundColor = getComputedColor('--bw-bg', '#121212')
  const textColor = getComputedColor('--bw-text', '#E0E0E0')

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#10b981',
        colorBackground: backgroundColor,
        colorText: textColor,
        colorDanger: '#ef4444',
        fontFamily: 'Work Sans, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    loader: 'auto' as const,
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
          Complete Payment
        </h1>

        {/* Booking Summary */}
        <div style={{
          backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
          border: '1px solid var(--bw-border)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 28px)',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'clamp(16px, 3vw, 20px)',
            paddingBottom: 'clamp(16px, 3vw, 20px)',
            borderBottom: '1px solid var(--bw-border)'
          }}>
            <div style={{
              fontSize: 'clamp(12px, 2vw, 14px)',
              color: 'var(--bw-text)',
              opacity: 0.7,
              fontFamily: 'Work Sans, sans-serif'
            }}>
              Total Amount
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

          <div style={{
            fontSize: 'clamp(11px, 1.8vw, 12px)',
            color: 'var(--bw-text)',
            opacity: 0.6,
            fontFamily: 'Work Sans, sans-serif',
            lineHeight: 1.5
          }}>
            Your payment information is secure and encrypted by Stripe.
          </div>
        </div>

        {/* Stripe Elements */}
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm booking={booking} clientSecret={clientSecret} />
        </Elements>

        {/* Global styles for Stripe terms text */}
        <style>{`
          /* Reduce font size of Stripe payment terms text */
          .pii-consent-text,
          [data-testid="pii-consent-text"],
          .pii-consent-text p,
          div[class*="pii"],
          div[class*="consent"],
          form[class*="Stripe"] p,
          div[class*="Stripe"] p:last-child,
          div[class*="Stripe"] div[class*="text"] p {
            font-size: clamp(10px, 1.5vw, 11px) !important;
            line-height: 1.4 !important;
          }
        `}</style>

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
    </div>
  )
}

