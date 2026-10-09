import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, X } from '@phosphor-icons/react'
import {
  LANDING_PRICING_PLANS,
  isPopularPlan,
  buildPlanDisplays,
  type LandingPricingPlanDisplay,
} from '@data/landingPricingPlans'
import { getPublicPlans, foundingOperatorSlotsRemaining, type PlanCatalogEntry } from '@api/subscription'

/**
 * The public catalogue endpoint needs no auth, so marketing pages render the same
 * prices, limits and take rate as the signed-in app. On failure the static
 * fallback stands in rather than leaving the section blank.
 */
export function usePricingPlans() {
  const [catalog, setCatalog] = useState<PlanCatalogEntry[] | null>(null)
  const [foundingSlotsLeft, setFoundingSlotsLeft] = useState<number | null>(null)
  /** True once the request settles (success or failure). Pages that sit in the first viewport wait on it so the cards do not resize under the reader. */
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPublicPlans()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data?.length) setCatalog(res.data)
        setFoundingSlotsLeft(foundingOperatorSlotsRemaining(res))
      })
      .catch(() => {
        /* keep the static fallback */
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const plans = useMemo(() => (catalog ? buildPlanDisplays(catalog) : LANDING_PRICING_PLANS), [catalog])
  return { plans, foundingSlotsLeft, ready }
}

export function PricingCard({
  plan,
  index,
  Heading = 'h3',
}: {
  plan: LandingPricingPlanDisplay
  index: number
  /** Pass 'h2' where the card sits directly under the page h1. */
  Heading?: 'h2' | 'h3'
}) {
  const popular = isPopularPlan(plan)
  return (
    <div
      data-index={index}
      className={`pricing-card landing-bezel${popular ? ' featured landing-bezel--accent' : ''}`}
    >
      <div className="landing-bezel__core relative flex flex-col !p-6 md:!p-7">
        {popular ? <div className="pricing-badge absolute right-5 top-5 !mb-0">Most popular</div> : null}
        <Heading className="m-0 text-xl font-medium tracking-[-0.02em] text-white">{plan.name}</Heading>
        <div className="price-wrapper">
          <span className="price-amount text-white">{plan.price}</span>
          <span className="price-period">{plan.period}</span>
        </div>
        <p className="m-0 mb-6 min-h-[3.75rem] text-sm leading-relaxed text-[color:var(--landing-fg-muted)]">
          {plan.description}
        </p>
        <ul className="m-0 flex-1 list-none space-y-3 border-t border-[color:var(--landing-hairline)] p-0 pt-6">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              {feature.included ? (
                <Check size={16} weight="bold" className="landing-accent-text mt-0.5 shrink-0" aria-hidden />
              ) : (
                <X size={16} weight="regular" className="mt-0.5 shrink-0 text-[color:var(--landing-fg-faint)]" aria-hidden />
              )}
              <span
                className={`text-sm leading-snug ${
                  feature.included ? 'text-[color:var(--landing-fg)]' : 'text-[color:var(--landing-fg-faint)]'
                }`}
              >
                {feature.included ? null : <span className="sr-only">Not included: </span>}
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        <Link
          to="/signup"
          className={`landing-btn landing-btn--block mt-8 ${
            popular ? 'landing-btn--primary landing-btn--icon !justify-between' : 'landing-btn--ghost'
          }`}
        >
          Get started
          {popular ? (
            <span className="landing-btn__icon">
              <ArrowUpRight size={16} weight="bold" aria-hidden />
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  )
}
