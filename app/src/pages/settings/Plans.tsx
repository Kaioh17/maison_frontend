import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { upgradeSubscription } from '@api/subscription'
import { useNavigate } from 'react-router-dom'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

export default function Plans() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleUpgradePlan = async (plan: { product_type: string; price_id: string }) => {
    setUpgradingPlan(plan.product_type)
    setUpgradeError(null)

    try {
      const response = await upgradeSubscription({
        price_id: plan.price_id,
        product_type: plan.product_type
      })

      if (response.success) {
        alert('Subscription upgrade initiated successfully!')
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
        setUpgradingPlan(null)
      } else {
        setUpgradeError(response.error || 'Failed to upgrade subscription')
        setUpgradingPlan(null)
      }
    } catch (err: any) {
      setUpgradeError(err?.response?.data?.error || err?.message || 'Failed to upgrade subscription')
      setUpgradingPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="bw bw-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: 'clamp(16px, 3vw, 24px) 0'
      }}>
        <div className="bw-loading" style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          fontFamily: '"Work Sans", sans-serif',
          color: 'var(--bw-muted)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  const pricingPlans = [
    {
      name: 'Starter',
      product_type: 'starter',
      price: '$0.00',
      period: '/month',
      description: 'Perfect for solo drivers and small fleets.',
      price_id: 'price_1ShzxJQtWPwjkVcEAMWx8Sgq',
      features: [
        { text: 'Up to 5 vehicles', included: true },
        { text: 'Up to 10 drivers', included: true },
        { text: 'Basic booking system', included: true },
        { text: 'Email support', included: true }
      ]
    },
    {
      name: 'Premium',
      product_type: 'premium',
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
        { text: 'Advanced analytics', included: true }
      ]
    },
    {
      name: 'Diamond',
      product_type: 'diamond',
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
        { text: 'Advanced analytics', included: true }
      ]
    }
  ]

  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'
  const planOrder = ['starter', 'premium', 'diamond']

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-success)' }}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar />
      
      {/* Main Content */}
      <div style={{ 
        marginLeft: isMobile ? '0' : (menuIsOpen ? '20%' : '64px'),
        transition: 'margin-left 0.3s ease',
        width: isMobile ? '100%' : (menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)'),
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ 
          width: '100%',
          maxWidth: '100%',
          padding: `clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)`,
          marginBottom: 'clamp(24px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            margin: 0,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 200,
            color: 'var(--bw-text)'
          }}>
            Subscription Plans
          </h1>
        </div>

      {/* Content Container */}
      <div className="bw-container" style={{ 
        padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {upgradeError && (
          <div style={{
            marginBottom: 'clamp(16px, 3vw, 24px)',
            padding: 'clamp(12px, 2vw, 16px)',
            backgroundColor: 'var(--bw-error, #C5483D)',
            color: '#ffffff',
            borderRadius: 'clamp(4px, 0.8vw, 8px)',
            fontSize: 'clamp(12px, 1.5vw, 14px)',
            fontFamily: '"Work Sans", sans-serif'
          }}>
            {upgradeError}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          width: '100%',
          maxWidth: '100%'
        }}>
          {pricingPlans.map((plan) => {
            const currentPlanIndex = planOrder.indexOf(currentPlan)
            const planIndex = planOrder.indexOf(plan.product_type)
            const isCurrentPlan = currentPlan === plan.product_type
            const isLowerPlan = planIndex < currentPlanIndex
            const isDisabled = isCurrentPlan || isLowerPlan

            return (
              <div
                key={plan.product_type}
                className="bw-card"
                style={{
                  padding: 'clamp(20px, 3vw, 24px)',
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  border: plan.popular && !isDisabled ? '2px solid var(--bw-accent)' : '1px solid var(--bw-border)',
                  position: 'relative',
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  backgroundColor: 'var(--bw-bg-secondary)'
                }}
              >
                {plan.popular && !isDisabled && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bw-accent)',
                    color: '#ffffff',
                    padding: '4px 16px',
                    fontSize: 'clamp(11px, 1.3vw, 12px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 600,
                    borderRadius: '4px'
                  }}>
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bw-muted)',
                    color: '#ffffff',
                    padding: '4px 16px',
                    fontSize: 'clamp(11px, 1.3vw, 12px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 600,
                    borderRadius: '4px'
                  }}>
                    Current Plan
                  </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2.5vw, 20px)' }}>
                  <h4 style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 'clamp(20px, 3vw, 24px)',
                    fontWeight: 400,
                    color: 'var(--bw-text)',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>{plan.name}</h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: 'clamp(4px, 1vw, 8px)',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 'clamp(28px, 4vw, 36px)',
                      fontWeight: 200,
                      color: 'var(--bw-text)'
                    }}>{plan.price}</span>
                    <span style={{
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      color: 'var(--bw-muted)'
                    }}>{plan.period}</span>
                  </div>
                  <p style={{
                    fontFamily: '"Work Sans", sans-serif',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    color: 'var(--bw-muted)',
                    marginBottom: 'clamp(12px, 2vw, 16px)'
                  }}>{plan.description}</p>
                  <button
                    className={plan.popular && !isDisabled ? "bw-btn" : "bw-btn-outline"}
                    onClick={() => !isDisabled && handleUpgradePlan(plan)}
                    disabled={isDisabled || upgradingPlan !== null}
                    style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 2.5vw, 20px)',
                      width: '100%',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: upgradingPlan === plan.product_type ? 0.6 : 1,
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      borderRadius: 7
                    }}
                  >
                    {upgradingPlan === plan.product_type ? 'Processing...' : isCurrentPlan ? 'Current Plan' : isLowerPlan ? 'Lower Plan' : 'Upgrade'}
                  </button>
                </div>
                <div style={{
                  borderTop: '1px solid var(--bw-border)',
                  paddingTop: 'clamp(16px, 2.5vw, 20px)',
                  marginTop: 'clamp(16px, 2.5vw, 20px)'
                }}>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(8px, 1.5vw, 12px)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {feature.included ? <CheckIcon /> : null}
                        </div>
                        <span style={{
                          fontFamily: '"Work Sans", sans-serif',
                          fontSize: 'clamp(12px, 1.5vw, 14px)',
                          color: feature.included ? 'var(--bw-text)' : 'var(--bw-muted)'
                        }}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

        {/* Upgrade Plan Button - Only show if not diamond */}
        <UpgradePlanButton 
          currentPlan={currentPlan}
          onUpgradeClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}

