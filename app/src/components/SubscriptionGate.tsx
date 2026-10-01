import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Warning, SignOut } from '@phosphor-icons/react'
import { getPlanLimits, redirectToCheckout } from '@api/subscription'
import { getStripeSubscriptionPriceId } from '@config'
import { useAuthStore } from '@store/auth'
import { getApiErrorMessage } from '@utils/apiError'
import type { LandingPricingPlanDisplay } from '@data/landingPricingPlans'
import Button from '@components/Button'
import SignupPlanSelection from '@components/SignupPlanSelection'
import '../pages/landing-theme.css'

const REASONS = [
  'A subscription is required to verify your account.',
  "We need your subscription ID on file to process any future upgrades. Without one, you can't change plans later.",
  'The Free plan costs $0. Your account will not be charged for any reason on the free platform.',
]

/**
 * Blocks the tenant dashboard until a Stripe subscription exists. Free is a
 * real $0 subscription, so a tenant with no subscription id has no plan at all
 * and could never be upgraded. Not dismissible by design: the only ways out are
 * subscribing or logging out. Only the explicit `unsubscribed` status gates, so
 * a failed limits request never locks a paying tenant out.
 */
export default function SubscriptionGate({ children }: { children: ReactNode }) {
  const logout = useAuthStore((s) => s.logout)
  const [busyPlan, setBusyPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['subscription', 'limits'],
    queryFn: () => getPlanLimits().then((r) => r.data ?? null),
    // Checkout confirms through a webhook, so poll until the status flips.
    refetchInterval: (q) => (q.state.data?.status === 'unsubscribed' ? 4000 : false),
  })
  const gated = data?.status === 'unsubscribed'

  const choosePlan = async (plan: LandingPricingPlanDisplay) => {
    setBusyPlan(plan.product_type)
    setError(null)
    try {
      const failure = await redirectToCheckout({
        price_id: getStripeSubscriptionPriceId(plan.product_type),
        product_type: plan.product_type,
      })
      if (failure) {
        setError(failure)
        setBusyPlan(null)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to start checkout'))
      setBusyPlan(null)
    }
  }

  return (
    <>
      {/* React 18 has no `inert` prop; the attribute keeps keyboard focus out of the blurred page. */}
      <div style={{ display: 'contents' }} {...(gated ? { inert: '' } : {})}>
        {children}
      </div>
      {gated && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscription-gate-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            overflowY: 'auto',
            background: 'color-mix(in srgb, var(--bw-bg) 60%, transparent)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            fontFamily: '"Work Sans", sans-serif',
          }}
        >
          <div
            role="alert"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: 'calc(10px + env(safe-area-inset-top, 0px)) 16px 10px',
              background: 'var(--bw-bg-secondary)',
              borderBottom: '2px solid var(--bw-warning)',
              color: 'var(--bw-text)',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            <Warning size={18} weight="fill" style={{ color: 'var(--bw-warning)', flexShrink: 0 }} aria-hidden />
            You are not subscribed. Your account is locked until you choose a plan.
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) 16px 40px' }}>
            <div
              style={{
                background: 'var(--bw-bg-secondary)',
                border: '1px solid var(--bw-border-strong)',
                borderRadius: 16,
                padding: 'clamp(20px, 4vw, 32px)',
              }}
            >
              <h2
                id="subscription-gate-title"
                style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 500, color: 'var(--bw-text)' }}
              >
                Subscribe to continue
              </h2>
              <ul style={{ margin: '14px 0 0', paddingLeft: 20, listStyle: 'disc', color: 'var(--bw-muted)', fontSize: 15, lineHeight: 1.6 }}>
                {REASONS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              {error && (
                <div role="alert" style={{ marginTop: 16, color: 'var(--bw-error)', fontSize: 14 }}>
                  {error}
                </div>
              )}

              <div
                className="landing-root"
                style={{ marginTop: 20, borderRadius: 14, padding: 'clamp(16px, 3vw, 24px)', minHeight: 0 }}
              >
                <SignupPlanSelection onSelectPlan={choosePlan} loadingProductType={busyPlan} disabled={busyPlan !== null} />
              </div>

              <div
                style={{
                  marginTop: 20,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span style={{ color: 'var(--bw-muted)', fontSize: 13 }}>
                  Just subscribed? We are confirming it with Stripe. This screen clears on its own.
                </span>
                <Button variant="ghost" onClick={logout}>
                  <SignOut size={16} aria-hidden /> Log out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
