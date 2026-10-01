import { useRef, useState, useEffect, useMemo } from 'react'
import { Check, X, ArrowUpRight } from '@phosphor-icons/react'
import { getPlanLimits, foundingOperatorSlotsRemaining, type PlanCatalogEntry } from '@api/subscription'
import {
  LANDING_PRICING_PLANS,
  isPopularPlan,
  buildPlanDisplays,
  type LandingPricingPlanDisplay,
} from '@data/landingPricingPlans'
import { scrollPricingCarouselToCard } from '@utils/pricingCarousel'
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
        const featured = root.querySelector<HTMLElement>('.pricing-card.featured')
        if (featured) scrollPricingCarouselToCard(root, featured, 'auto')
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
    if (root && el) scrollPricingCarouselToCard(root, el, 'smooth')
  }

  return (
    <div className="landing-pricing w-full box-border">
      <div className="mb-6 text-center">
        <p className="m-0 text-sm landing-accent-text">
          {foundingSlotsLeft !== null && foundingSlotsLeft > 0 ? 'Only a few founding operator spots left. ' : ''}
          Founding operators receive a promo code by email after signup for a free subscription (card required).
        </p>
        <p className="m-0 mt-1 text-xs text-[color:var(--landing-fg-faint)]">
          Applies to the plan you choose today - upgrading later bills full price for the new plan.
        </p>
      </div>
      <div
        ref={carouselRef}
        className="pricing-carousel -mx-1 md:mx-0 max-w-full"
        style={{ marginLeft: 0, marginRight: 0 }}
      >
        {plans.map((plan, index) => {
          const popular = isPopularPlan(plan)
          const busy = loadingProductType === plan.product_type
          return (
            <div
              key={plan.name}
              data-index={index}
              className={`pricing-card landing-bezel${popular ? ' featured landing-bezel--accent' : ''}`}
            >
              <div className="landing-bezel__core relative flex h-full flex-col !p-6 md:!p-7">
                {popular ? <div className="pricing-badge absolute right-5 top-5 !mb-0">Most popular</div> : null}
                <h3 className="m-0 text-xl font-medium tracking-[-0.02em] text-[color:var(--landing-fg)]">{plan.name}</h3>
                <div className="price-wrapper">
                  <span className="price-amount text-[color:var(--landing-fg)]">{plan.price}</span>
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
                        <X size={16} className="mt-0.5 shrink-0 text-[color:var(--landing-fg-faint)]" aria-hidden />
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
                <button
                  type="button"
                  disabled={disabled || loadingProductType !== null}
                  onClick={() => onSelectPlan(plan)}
                  className={`landing-btn landing-btn--block mt-8 disabled:cursor-not-allowed disabled:opacity-60 ${
                    popular ? 'landing-btn--primary landing-btn--icon !justify-between' : 'landing-btn--ghost'
                  }`}
                >
                  {busy ? 'Processing…' : plan.product_type === 'free' ? 'Start free' : 'Select plan'}
                  {popular ? (
                    <span className="landing-btn__icon">
                      <ArrowUpRight size={16} weight="bold" aria-hidden />
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          )
        })}
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
