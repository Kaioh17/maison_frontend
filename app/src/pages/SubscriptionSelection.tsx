import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckoutSession } from '@api/subscription'
import { useAuthStore } from '@store/auth'
import { getStripeSubscriptionPriceId } from '@config'
import { LANDING_PRICING_PLANS } from '@data/landingPricingPlans'
import SignupPlanSelection from '@components/SignupPlanSelection'
import './landing-theme.css'
import './landing-pricing.css'

export default function SubscriptionSelection() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated as tenant
  useEffect(() => {
    if (!isAuthenticated || role !== 'tenant') {
      navigate('/signup')
    }
  }, [isAuthenticated, role, navigate])

  if (!isAuthenticated || role !== 'tenant') {
    return null
  }

  const handleSelectPlan = async (plan: typeof LANDING_PRICING_PLANS[0]) => {
    // Free is a real $0 Checkout session like every other tier -- it still
    // collects a card (see create_checkout_session's payment_method_collection).
    setLoading(plan.product_type)
    setError(null)

    try {
      const response = await createCheckoutSession({
        price_id: getStripeSubscriptionPriceId(plan.product_type),
        product_type: plan.product_type
      })

      if (response.success && response.data.Checkout_session_url) {
        window.location.href = response.data.Checkout_session_url
      } else {
        setError(response.error || 'Failed to create checkout session')
        setLoading(null)
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to create checkout session')
      setLoading(null)
    }
  }

  return (
    <main
      className="bw landing-root landing-ambient landing-ambient--tl"
      style={{
        minHeight: 'var(--app-h)',
        padding: 'clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <h1 style={{
            fontFamily: 'var(--landing-font)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 500,
            letterSpacing: '-0.035em',
            color: 'var(--landing-fg)',
            marginBottom: 'clamp(12px, 2vw, 16px)'
          }}>
            Choose your plan
          </h1>
          <p style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--landing-fg-muted)',
            maxWidth: '600px',
            margin: '0 auto clamp(8px, 1.5vw, 12px)',
          }}>
            Fair, transparent pricing — same plans as on our homepage.
          </p>
          <p style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(13px, 1.8vw, 15px)',
            color: 'var(--landing-fg-faint)',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            You can upgrade or downgrade at any time from your account settings.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#fca5a5',
            padding: 'clamp(12px, 2vw, 16px)',
            borderRadius: 8,
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(14px, 2vw, 16px)'
          }}>
            {error}
          </div>
        )}

        <div className="landing-pricing">
          <SignupPlanSelection
            onSelectPlan={handleSelectPlan}
            loadingProductType={loading}
            disabled={loading !== null}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(24px, 4vw, 32px)' }}>
          <button
            onClick={() => navigate('/tenant/overview')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--landing-fg-faint)',
              fontFamily: "'Work Sans', sans-serif",
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '8px 16px',
            }}
          >
            Skip for now — continue with Free tier
          </button>
        </div>
      </div>
    </main>
  )
}

