import { useRef, useState, useEffect, useMemo } from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { getPlanLimits, foundingOperatorSlotsRemaining, type PlanCatalogEntry } from '@api/subscription'
import {
  LANDING_PRICING_PLANS,
  isPopularPlan,
  buildPlanDisplays,
  type LandingPricingPlanDisplay,
} from '@data/landingPricingPlans'
import '../pages/landing-pricing.css'

type Props = {
  onSelectPlan: (plan: LandingPricingPlanDisplay) => void
  loadingProductType: string | null
  disabled?: boolean
}

export default function SignupPlanSelection({ onSelectPlan, loadingProductType, disabled }: Props) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const featuredIndex = LANDING_PRICING_PLANS.findIndex(isPopularPlan)
  const [activeIndex, setActiveIndex] = useState(featuredIndex >= 0 ? featuredIndex : 0)
  const [catalog, setCatalog] = useState<PlanCatalogEntry[] | null>(null)
  const [foundingSlotsLeft, setFoundingSlotsLeft] = useState<number | null>(null)

  // Both mount points for this component (Signup's plan step, and
  // SubscriptionSelection) render only after the tenant is logged in, so the
  // tenant-JWT limits call is available here. A failure is non-fatal: the
  // static copy in LANDING_PRICING_PLANS stands in, because blocking plan
  // selection on a limits fetch would strand a tenant mid-signup.
  useEffect(() => {
    let cancelled = false
    getPlanLimits()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data?.catalog?.length) setCatalog(res.data.catalog)
        setFoundingSlotsLeft(foundingOperatorSlotsRemaining(res))
      })
      .catch(() => {
        /* keep the static fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Limits, take rate and price all come from the server when we have it, so
  // these cards cannot disagree with the marketing page or with what is
  // enforced at charge time. Only marketing copy is local.
  const plans = useMemo(
    () => (catalog ? buildPlanDisplays(catalog) : LANDING_PRICING_PLANS),
    [catalog]
  )

  useEffect(() => {
    const root = carouselRef.current
    if (!root) return

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!window.matchMedia('(max-width: 767px)').matches) return
        root.querySelector<HTMLElement>('.pricing-card.featured')?.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: 'auto',
        })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  useEffect(() => {
    const root = carouselRef.current
    if (!root) return

    let observer: IntersectionObserver | null = null
    const thresholds = Array.from({ length: 21 }, (_, i) => 0.5 + i * 0.025)

    const startObserver = () => {
      observer?.disconnect()
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const cards = root.querySelectorAll<HTMLElement>('.pricing-card')
      if (!mobile || cards.length === 0) return

      observer = new IntersectionObserver(
        (entries) => {
          let bestIdx = -1
          let bestRatio = 0
          for (const e of entries) {
            if (e.intersectionRatio < 0.5) continue
            const idx = Number(e.target.getAttribute('data-index'))
            if (Number.isNaN(idx)) continue
            if (e.intersectionRatio > bestRatio) {
              bestRatio = e.intersectionRatio
              bestIdx = idx
            }
          }
          if (bestIdx >= 0) setActiveIndex(bestIdx)
        },
        { root, threshold: thresholds }
      )
      cards.forEach((c) => observer!.observe(c))
    }

    startObserver()
    const mq = window.matchMedia('(max-width: 767px)')
    mq.addEventListener('change', startObserver)

    return () => {
      mq.removeEventListener('change', startObserver)
      observer?.disconnect()
    }
  }, [])

  const scrollToPlan = (index: number) => {
    const root = carouselRef.current
    const el = root?.querySelector<HTMLElement>(`.pricing-card[data-index="${index}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  return (
    <div className="landing-pricing w-full box-border">
      {foundingSlotsLeft !== null && foundingSlotsLeft > 0 ? (
        <p
          className="text-center text-sm mb-6"
          style={{ color: '#7c5cfc', fontFamily: "'Work Sans', sans-serif" }}
        >
          🎉 Only a few founding operator spots left — free
          subscription, card required. We'll email your code after signup.
        </p>
      ) : null}
      {foundingSlotsLeft !== null && foundingSlotsLeft > 0 ? (
        <p className="text-center text-xs text-gray-500 mb-6 -mt-4">
          Applies to the plan you choose today — upgrading later bills full price for the new plan.
        </p>
      ) : null}
      <div
        ref={carouselRef}
        className="pricing-carousel -mx-1 md:mx-0 max-w-full"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            data-index={index}
            className={`pricing-card bg-gray-900 border ${
              isPopularPlan(plan) ? 'featured border-[#7c5cfc]' : 'border-gray-800'
            }`}
          >
            {isPopularPlan(plan) ? (
              <div className="pricing-badge" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                Most Popular
              </div>
            ) : null}
            <div className="text-center mb-8">
              <h3
                className="text-2xl font-semibold text-white mb-0"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {plan.name}
              </h3>
              <div className="price-wrapper">
                <span className="price-amount text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {plan.price}
                </span>
                <span className="price-period" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {plan.period}
                </span>
              </div>
              <p className="text-gray-400 mb-6 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                {plan.description}
              </p>
              <button
                type="button"
                disabled={disabled || loadingProductType !== null}
                onClick={() => onSelectPlan(plan)}
                className={`inline-flex items-center justify-center w-full py-[13px] px-5 text-[15px] font-semibold rounded-[10px] transition-colors box-border ${
                  isPopularPlan(plan)
                    ? 'border-2 border-transparent bg-[#7c5cfc] text-white hover:bg-[#7c3aed] disabled:opacity-60'
                    : 'border-2 border-gray-700 text-white hover:border-[#7c5cfc] disabled:opacity-60'
                }`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {loadingProductType === plan.product_type
                  ? 'Processing…'
                  : plan.product_type === 'free'
                    ? 'Start free'
                    : 'Select plan'}
              </button>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-[#7c5cfc] flex-shrink-0" weight="fill" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0" weight="fill" />
                    )}
                    <span
                      className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}
                      style={{ fontFamily: "'Work Sans', sans-serif" }}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="dots" role="tablist" aria-label="Pricing plans">
        {plans.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`${plans[i].name} plan`}
            className={`dot${i === activeIndex ? ' active' : ''}`}
            onClick={() => scrollToPlan(i)}
          />
        ))}
      </div>
    </div>
  )
}
