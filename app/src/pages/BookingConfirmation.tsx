import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  approveBooking,
  approveBookingByToken,
  getBookingByConfirmToken,
  type BookingResponse,
} from '@api/bookings'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { listAllowedRiderPaymentMethods, RIDER_PAYMENT_METHOD_LABELS, type RiderPaymentMethodId } from '@utils/allowedPaymentMethods'
import { useFavicon } from '@hooks/useFavicon'
import { CaretDown, Info, X } from '@phosphor-icons/react'
import Button from '@components/Button'
import Modal from '@components/Modal'
import { RIDER_CSS } from './rider/riderCss'

export default function BookingConfirmation() {
  useFavicon()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const confirmToken = searchParams.get('token')
  const isGuestConfirm = Boolean(confirmToken)
  const { tenantInfo } = useTenantInfo()
  const permittedPaymentMethods = useMemo(
    () =>
      listAllowedRiderPaymentMethods(
        tenantInfo?.settings?.config?.booking?.allowed_payment_method
      ),
    [tenantInfo?.settings?.config?.booking?.allowed_payment_method]
  )
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<RiderPaymentMethodId | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [showPaymentSheet, setShowPaymentSheet] = useState(false)
  const [showDeclineWarning, setShowDeclineWarning] = useState(false)
  const [showZelleInfoModal, setShowZelleInfoModal] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(isGuestConfirm)

  const zelleOffered = permittedPaymentMethods.includes('zelle')

  useEffect(() => {
    if (isGuestConfirm && confirmToken) {
      let cancelled = false
      ;(async () => {
        try {
          setLoadingBooking(true)
          setError('')
          const response = await getBookingByConfirmToken(confirmToken)
          if (cancelled) return
          if (response.success && response.data) {
            setBooking(response.data)
          } else {
            setError(response.message || 'Unable to load this booking.')
          }
        } catch (err: any) {
          if (!cancelled) {
            setError(err.response?.data?.detail || 'This confirmation link is invalid or has expired.')
          }
        } finally {
          if (!cancelled) setLoadingBooking(false)
        }
      })()
      return () => {
        cancelled = true
      }
    }

    const bookingData = location.state?.booking as BookingResponse | undefined
    if (!bookingData) {
      if (!isGuestConfirm) {
        navigate('/rider/book', { replace: true })
      }
      return
    }
    setBooking(bookingData)
  }, [confirmToken, isGuestConfirm, location.state, navigate])

  useEffect(() => {
    setSelectedPaymentMethod((prev) => {
      if (permittedPaymentMethods.length === 0) return null
      if (permittedPaymentMethods.length === 1) return permittedPaymentMethods[0]
      if (prev != null && !permittedPaymentMethods.includes(prev)) return null
      return prev
    })
  }, [permittedPaymentMethods])

  useEffect(() => {
    if (selectedPaymentMethod === 'zelle' && zelleOffered) {
      setShowZelleInfoModal(true)
    } else {
      setShowZelleInfoModal(false)
    }
  }, [selectedPaymentMethod, zelleOffered])

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

    const successPath = isGuestConfirm ? '/riders/booking-success' : '/rider/booking-success'
    const paymentPath = isGuestConfirm ? '/riders/payment' : '/rider/payment'

    try {
      setIsLoading(true)
      setError('')
      const response = isGuestConfirm && confirmToken
        ? await approveBookingByToken(confirmToken, true, selectedPaymentMethod)
        : await approveBooking(booking.id, true, selectedPaymentMethod)
      if (response.success) {
        // Merge response data with existing booking data
        const updatedBooking = {
          ...booking,
          ...response.data,
          is_approved: response.data.is_approved ?? true
        }

        // If card payment is selected and client_secret is provided, navigate to payment page
        if (selectedPaymentMethod === 'card' && response.data.payment?.client_secret) {
          navigate(paymentPath, {
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
        navigate(successPath, {
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
      if (isGuestConfirm && confirmToken) {
        await approveBookingByToken(confirmToken, false, 'cash')
        navigate('/', { replace: true })
        return
      }
      await approveBooking(booking.id, false, 'cash')
      // Navigate back to dashboard
      navigate('/rider/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to decline booking')
      setIsLoading(false)
    }
  }

  const handlePaymentMethodSelect = (method: RiderPaymentMethodId) => {
    setSelectedPaymentMethod(method)
    setShowPaymentSheet(false)
  }

  const getPaymentMethodDisplayName = (method: RiderPaymentMethodId | null) => {
    if (!method) return 'Select Payment Method'
    return RIDER_PAYMENT_METHOD_LABELS[method]
  }

  const frame = (children: React.ReactNode) => (
    <div className="bw rdr-canvas">
      <style>{RIDER_CSS}</style>
      <div className="rdr">{children}</div>
    </div>
  )

  if (loadingBooking || !booking) {
    return frame(
      <main className="rdr-main" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <p className="rdr-sub" role="status">{loadingBooking ? 'Loading your ride details…' : 'Unable to load booking'}</p>
        {!loadingBooking && error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
      </main>
    )
  }

  const canConfirm = !isLoading && !!selectedPaymentMethod && permittedPaymentMethods.length > 0
  const balance = booking.deposit != null ? booking.estimated_price - booking.deposit : null
  const paymentNote: Record<RiderPaymentMethodId, string> = {
    card: 'Card payments are powered by Stripe. Your payment information is secure and encrypted.',
    zelle: "You'll see Zelle payment details on the next screen after you confirm your ride.",
    cash: 'Cash is collected in person at the time of service. Please have exact change ready.',
    card_pickup: 'The driver will run your card in person at the time of service, using a card/tap reader (e.g. Square), not a prepaid Stripe charge.',
  }

  return (
    <>
      {frame(
        <>
          <main className="rdr-main">
            <div className="rdr-head-row" style={{ alignItems: 'center' }}>
              <h1 className="rdr-title">Confirm your ride</h1>
              <button type="button" className="rdr-iconbtn" aria-label="Cancel this booking" disabled={isLoading} onClick={() => setShowDeclineWarning(true)}>
                <X size={22} aria-hidden />
              </button>
            </div>

            {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}

            {booking.estimated_price > 0 && (
              <section className="rdr-trip" aria-label="Price">
                <div className="rdr-label" style={{ margin: 0 }}>Estimated price</div>
                <div className="rdr-amount">${booking.estimated_price.toFixed(2)}</div>
                {booking.deposit != null && (
                  <div className="rdr-trip-foot" style={{ flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, textAlign: 'left' }}>
                      <span>Deposit, charged now</span>
                      <strong style={{ color: 'var(--bw-text)' }}>${booking.deposit.toFixed(2)}</strong>
                    </span>
                    <span style={{ textAlign: 'left', lineHeight: 1.45 }}>
                      The remaining ${balance!.toFixed(2)} plus tax is charged when the trip is completed.
                    </span>
                  </div>
                )}
              </section>
            )}

            <section className="rdr-route" aria-label="Trip details">
              <div className="rdr-route-body">
                <div className="rdr-stops">
                  <div className="rdr-stop">
                    <span className="rdr-stop-label">Pickup</span>
                    <span style={{ fontSize: 16, padding: '4px 0', overflowWrap: 'anywhere' }}>{booking.pickup_location}</span>
                  </div>
                  {booking.dropoff_location && (
                    <div className="rdr-stop">
                      <span className="rdr-stop-label">Dropoff</span>
                      <span style={{ fontSize: 16, padding: '4px 0', overflowWrap: 'anywhere' }}>{booking.dropoff_location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="rdr-route-body" style={{ borderTop: '1px solid var(--bw-border)' }}>
                <dl className="rdr-rows">
                  <div className="rdr-row"><dt>Service</dt><dd style={{ textTransform: 'capitalize' }}>{booking.service_type}</dd></div>
                  {booking.vehicle && <div className="rdr-row"><dt>Vehicle</dt><dd>{booking.vehicle}</dd></div>}
                  <div className="rdr-row"><dt>Pickup time</dt><dd>{formatDate(booking.pickup_time)}</dd></div>
                  {booking.dropoff_time && <div className="rdr-row"><dt>ETA</dt><dd>{formatDate(booking.dropoff_time)}</dd></div>}
                </dl>
                {booking.notes?.trim() && (
                  <div className="rdr-note" style={{ margin: '4px 0 10px' }}>
                    <strong>Your notes</strong>
                    {booking.notes}
                  </div>
                )}
              </div>
            </section>

            <div className="rdr-field">
              <span>Payment method</span>
              <button
                type="button"
                className="rdr-pick"
                aria-haspopup="dialog"
                disabled={permittedPaymentMethods.length === 0}
                onClick={() => setShowPaymentSheet(true)}
              >
                <span className="rdr-pick-main">
                  <strong>{selectedPaymentMethod ? RIDER_PAYMENT_METHOD_LABELS[selectedPaymentMethod] : 'Select a payment method'}</strong>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{selectedPaymentMethod ? 'Change' : 'Choose'}<CaretDown size={14} aria-hidden /></span>
              </button>
              {permittedPaymentMethods.length === 0 && (
                <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>
                  No payment methods are enabled for this company. Please contact support to complete your booking.
                </div>
              )}
              {selectedPaymentMethod && <p className="rdr-note" style={{ margin: 0 }}>{paymentNote[selectedPaymentMethod]}</p>}
            </div>
          </main>

          <div className="rdr-bar">
            <Button fullWidth disabled={!canConfirm} onClick={handleConfirm} style={{ minHeight: 54, fontSize: 16 }}>
              {isLoading ? 'Processing…' : 'Confirm ride'}
            </Button>
          </div>
        </>
      )}

      {showPaymentSheet && (
        <Modal variant="sheet" title="Payment method" onClose={() => setShowPaymentSheet(false)}>
          <div className="rdr-options" role="radiogroup" aria-label="Payment method">
            {permittedPaymentMethods.map((method) => (
              <button
                key={method}
                type="button"
                role="radio"
                className="rdr-option"
                aria-checked={selectedPaymentMethod === method}
                onClick={() => handlePaymentMethodSelect(method)}
              >
                <span className="rdr-option-main"><strong>{RIDER_PAYMENT_METHOD_LABELS[method]}</strong></span>
                <span className="rdr-radio" aria-hidden />
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showZelleInfoModal && zelleOffered && (
        <Modal variant="sheet" title="Pay with Zelle" onClose={() => setShowZelleInfoModal(false)}>
          <div className="rdr-stack">
            <p className="rdr-sub" style={{ margin: 0, display: 'flex', gap: 10 }}>
              <Info size={20} weight="fill" aria-hidden style={{ flex: 'none', color: 'var(--bw-accent)' }} />
              You&apos;ll see Zelle payment details after you confirm your ride. Complete payment from your banking app using the details on the next screen.
            </p>
            <Button fullWidth onClick={() => setShowZelleInfoModal(false)}>Got it</Button>
          </div>
        </Modal>
      )}

      {showDeclineWarning && (
        <Modal variant="sheet" title="Cancel this booking?" onClose={() => setShowDeclineWarning(false)}>
          <div className="rdr-stack">
            <p className="rdr-sub" style={{ margin: 0 }}>This ends the booking and cannot be undone.</p>
            <div className="rdr-dialog-actions">
              <Button variant="destructive" fullWidth disabled={isLoading} onClick={handleDecline}>
                {isLoading ? 'Cancelling…' : 'Cancel booking'}
              </Button>
              <Button variant="secondary" fullWidth disabled={isLoading} onClick={() => setShowDeclineWarning(false)}>Keep booking</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
