import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckoutSession } from '@api/subscription'
import { useAuthStore } from '@store/auth'
import { getStripeSubscriptionPriceId } from '@config'
import { LANDING_PRICING_PLANS } from '@data/landingPricingPlans'
import SignupPlanSelection from '@components/SignupPlanSelection'
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
    // Free has no Stripe price -- it is the tier you hold by not subscribing,
    // so there is nothing to check out. Go straight to the dashboard.
    if (plan.product_type === 'free') {
      navigate('/tenant/overview')
      return
    }
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
      className="bw"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0a0a0f 0%, rgb(17 24 39) 50%, #0a0a0f 100%)',
        padding: 'clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 200,
            color: '#ffffff',
            marginBottom: 'clamp(12px, 2vw, 16px)'
          }}>
            Choose your plan
          </h1>
          <p style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto clamp(8px, 1.5vw, 12px)',
          }}>
            Fair, transparent pricing — same plans as on our homepage.
          </p>
          <p style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(13px, 1.8vw, 15px)',
            color: '#64748b',
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
              color: '#64748b',
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

