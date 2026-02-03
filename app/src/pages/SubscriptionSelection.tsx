import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckoutSession } from '@api/subscription'
import { useAuthStore } from '@store/auth'
import './landing.css'

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

  const pricingPlans = [
    {
      name: 'Starter',
      product_type: 'starter',
      price: '$0.00',
      period: '/month',
      description: 'Perfect for solo drivers and small fleets. We charge a percentage on payments made on app higher than $100.',
      price_id: 'price_1ShzxJQtWPwjkVcEAMWx8Sgq',
      features: [
        { text: 'Up to 5 vehicles', included: true },
        { text: 'Up to 10 drivers', included: true },
        { text: 'Basic booking system', included: true },
        { text: 'Email support', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'API access', included: false },
        { text: 'Priority support', included: false },
        { text: 'SMS notifications', included: false },
        { text: 'Multi-language support', included: false },
      ]
    },
    {
      name: 'Growth',
      product_type: 'growth',
      price: '$100',
      period: '/month',
      description: 'Ideal for growing businesses',
      popular: true,
      price_id: 'price_1Si00KQtWPwjkVcEa7LKC5EM',
      features: [
        { text: 'Up to 25 vehicles', included: true },
        { text: 'Up to 50 drivers', included: true },
        { text: 'Advanced booking system', included: true },
        { text: 'Email & phone support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'API access', included: true },
        { text: 'Priority support', included: false },
        { text: 'SMS notifications', included: true },
        { text: 'Multi-language support', included: false },
      ]
    },
    {
      name: 'Fleet',
      product_type: 'fleet',
      price: '$300',
      period: '/month',
      description: 'For large fleets and enterprises',
      price_id: 'price_1Si01bQtWPwjkVcEMk6XJREA',
      features: [
        { text: 'Unlimited vehicles', included: true },
        { text: 'Unlimited drivers', included: true },
        { text: 'Enterprise booking system', included: true },
        { text: '24/7 dedicated support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'API access', included: true },
        { text: 'Priority support', included: true },
        { text: 'SMS notifications', included: true },
        { text: 'Multi-language support', included: true },
      ]
    }
  ]

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-success)' }}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )

  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-muted)' }}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )

  const handleSelectPlan = async (plan: typeof pricingPlans[0]) => {
    setLoading(plan.product_type)
    setError(null)

    try {
      const response = await createCheckoutSession({
        price_id: plan.price_id,
        product_type: plan.product_type
      })

      if (response.success && response.data.Checkout_session_url) {
        // Redirect to Stripe checkout
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
    <main className="bw landing-page" style={{ minHeight: '100vh', padding: 'clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)' }}>
      <div className="bw-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <h1 style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 200,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(16px, 2.5vw, 24px)'
          }}>Choose Your Plan</h1>
          <p style={{ 
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--bw-muted)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Select a subscription plan that fits your business needs. You can upgrade or downgrade at any time.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--bw-error)',
            color: '#ffffff',
            padding: 'clamp(12px, 2vw, 16px)',
            borderRadius: 0,
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(14px, 2vw, 16px)'
          }}>
            {error}
          </div>
        )}

        <div className="pricing-plans-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: 'clamp(24px, 4vw, 32px)',
          marginTop: 'clamp(32px, 5vw, 48px)'
        }}>
          {pricingPlans.map((plan) => (
            <div 
              key={plan.product_type} 
              className="bw-card" 
              style={{ 
                padding: 'clamp(24px, 4vw, 32px)',
                borderRadius: 0,
                border: plan.popular ? '2px solid var(--bw-accent)' : '1px solid var(--bw-border)',
                position: 'relative'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--bw-accent)',
                  color: '#ffffff',
                  padding: '4px 16px',
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontFamily: "'Work Sans', sans-serif",
                  fontWeight: 600
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
                <h3 style={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'clamp(24px, 3.5vw, 32px)',
                  fontWeight: 400,
                  color: 'var(--bw-text)',
                  marginBottom: 'clamp(8px, 1.5vw, 12px)'
                }}>{plan.name}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'baseline', 
                  justifyContent: 'center',
                  gap: 'clamp(4px, 1vw, 8px)',
                  marginBottom: 'clamp(8px, 1.5vw, 12px)'
                }}>
                  <span style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(36px, 5vw, 48px)',
                    fontWeight: 200,
                    color: 'var(--bw-text)'
                  }}>{plan.price}</span>
                  <span style={{ 
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    color: 'var(--bw-muted)'
                  }}>{plan.period}</span>
                </div>
                <p style={{ 
                  fontFamily: "'Work Sans', sans-serif",
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(16px, 2.5vw, 24px)'
                }}>{plan.description}</p>
                <button
                  className={plan.popular ? "bw-btn" : "bw-btn-outline"}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading !== null}
                  style={{
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)',
                    width: '100%',
                    maxWidth: '300px',
                    cursor: loading !== null ? 'not-allowed' : 'pointer',
                    opacity: loading === plan.product_type ? 0.6 : 1
                  }}
                >
                  {loading === plan.product_type ? 'Processing...' : 'Select Plan'}
                </button>
              </div>
              <div style={{ 
                borderTop: '1px solid var(--bw-border)',
                paddingTop: 'clamp(20px, 3vw, 24px)',
                marginTop: 'clamp(20px, 3vw, 24px)'
              }}>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(12px, 2vw, 16px)'
                }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'clamp(12px, 2vw, 16px)'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {feature.included ? <CheckIcon /> : <XIcon />}
                      </div>
                      <span style={{ 
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: feature.included ? 'var(--bw-fg)' : 'var(--bw-muted)',
                        textDecoration: feature.included ? 'none' : 'none'
                      }}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

