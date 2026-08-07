import { useState, useEffect } from 'react'
import { getPlanLimits, upgradeSubscription, type PlanLimitsResponse } from '@api/subscription'
import { useSettingsMenu } from '@components/SettingsMenuBar'
import { getStripeSubscriptionPriceId, type SubscriptionPlanKey } from '@config'
import { buildPlanDisplays } from '@data/landingPricingPlans'

export default function Plans() {
  const [limits, setLimits] = useState<PlanLimitsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadLimits = async () => {
    try {
      const res = await getPlanLimits()
      if (res.success && res.data) {
        setLimits(res.data)
        setLoadError(null)
      } else {
        setLoadError(res.error || 'Failed to load plans')
      }
    } catch {
      setLoadError('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLimits()
  }, [])

  const handleUpgradePlan = async (plan: { product_type: string; price_id: string; name: string }) => {
    // Safety pop-up before anything touches billing. What actually confirms
    // the card and the prorated amount is Stripe's own Billing Portal screen
    // below -- this is just "did you mean to click that" for a real charge.
    // See directives.md billing-confirm-2026-08.
    const currentPlanName = pricingPlans.find((p) => p.product_type === currentPlan)?.name ?? currentPlan
    const confirmed = window.confirm(
      `Move from ${currentPlanName} to ${plan.name}?\n\nYou'll confirm the card on file and the exact prorated amount on Stripe's page before anything is charged.`
    )
    if (!confirmed) return

    setUpgradingPlan(plan.product_type)
    setUpgradeError(null)

    try {
      const response = await upgradeSubscription({
        price_id: plan.price_id,
        product_type: plan.product_type
      })

      // Never a completed upgrade -- always a redirect to confirm on Stripe's
      // side: a Billing Portal URL for an existing subscription, a Checkout
      // URL for a tenant's first paid plan.
      const redirectUrl = response.success && response.data
        ? ('portal_url' in response.data ? response.data.portal_url : response.data.Checkout_session_url)
        : null

      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        setUpgradeError(response.error || 'Failed to start plan change')
        setUpgradingPlan(null)
      }
    } catch (err: any) {
      setUpgradeError(err?.response?.data?.error || err?.message || 'Failed to start plan change')
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

  // The ladder comes from the server: names, order, limits and take rate are
  // whatever `/subscription/limits` reports, so this page can never advertise a
  // quota the backend won't honour. Only price and marketing copy are local,
  // because the dollar amount lives in Stripe rather than in PLAN_REGISTRY.
  const catalog = limits?.catalog ?? []
  const pricingPlans = buildPlanDisplays(catalog).map((plan) => ({
    ...plan,
    price_id: getStripeSubscriptionPriceId(plan.product_type),
  }))

  const currentPlan = limits?.plan?.toLowerCase() || 'free'
  const planOrder = catalog.map((c) => c.name.toLowerCase())

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-success)' }}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box', flex: 1 }}>
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
        padding: 'clamp(24px, 4vw, 40px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {loadError && (
          <div
            role="alert"
            style={{
              marginBottom: 'clamp(16px, 3vw, 24px)',
              padding: 'clamp(12px, 2vw, 16px)',
              border: '1px solid var(--bw-border)',
              borderRadius: 'clamp(4px, 0.8vw, 8px)',
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              fontFamily: '"Work Sans", sans-serif',
              color: 'var(--bw-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <span>{loadError}. Plan details are unavailable right now.</span>
            <button
              className="bw-btn-outline"
              onClick={() => { setLoading(true); loadLimits() }}
              style={{
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                padding: '8px 16px',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                borderRadius: 7,
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

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
                  padding: 'clamp(32px, 4vw, 40px) clamp(20px, 3vw, 24px) clamp(20px, 3vw, 24px) clamp(20px, 3vw, 24px)',
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  border: plan.popular && !isDisabled ? '2px solid var(--bw-accent)' : '1px solid var(--bw-border)',
                  position: 'relative',
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
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
                    flexWrap: 'wrap',
                    gap: 'clamp(4px, 1vw, 8px)',
                    rowGap: '2px',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 'clamp(20px, 5.5vw, 36px)',
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

      </div>
  )
}

