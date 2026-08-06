import type { ReactNode } from 'react'
import type { SubscriptionPlanKey } from '@config'
import type { PlanCatalogEntry } from '@api/subscription'

export type PlanFeature = { text: string; included: boolean }

export type LandingPricingPlanDisplay = {
  name: string
  product_type: SubscriptionPlanKey
  price: ReactNode
  period: string
  description: string
  popular?: boolean
  features: PlanFeature[]
}

/**
 * Marketing copy only — the things the API has no opinion on.
 *
 * Everything numeric (limits, take rate, price) comes from the server:
 * `GET /v1/subscription/plans` (public) or the `catalog[]` in
 * `GET /v1/subscription/limits` (authenticated). Both return the same shape, so
 * the marketing page and the in-app pricing table cannot disagree.
 */
const PLAN_COPY: Record<
  SubscriptionPlanKey,
  { name: string; description: string; popular?: boolean; supportLine: string }
> = {
  free: {
    name: 'Free',
    description:
      'For solo operators getting started. No subscription — Maison earns only when you get paid.',
    supportLine: 'Email support',
  },
  growth: {
    name: 'Growth',
    description: 'For operators running multiple vehicles who want full booking control.',
    popular: true,
    supportLine: 'Email & phone support',
  },
  fleet: {
    name: 'Fleet',
    description: 'For established fleets that need unlimited capacity and white-glove support.',
    supportLine: '24/7 dedicated support',
  },
}

/**
 * Last-resort copy of the server catalogue, used only when the API is
 * unreachable — the public landing page must still render something.
 *
 * This duplicates the backend and will go stale. It is deliberately the only
 * duplicate left, it is never preferred over a successful fetch, and if you
 * change `PLAN_LADDER` in `backend/backend/app/domain/plans.py` you should
 * change it here too.
 */
export const FALLBACK_PLAN_CATALOG: PlanCatalogEntry[] = [
  {
    name: 'free',
    max_vehicle: 1,
    max_driver_count: 1,
    maison_fee: 0.03,
    allow_property_support: false,
    allow_analytics: false,
    monthly_price_cents: 0,
  },
  {
    name: 'growth',
    max_vehicle: 5,
    max_driver_count: 7,
    maison_fee: 0.02,
    allow_property_support: false,
    allow_analytics: true,
    monthly_price_cents: 29999,
  },
  {
    name: 'fleet',
    max_vehicle: null,
    max_driver_count: null,
    maison_fee: 0.01,
    allow_property_support: true,
    allow_analytics: true,
    monthly_price_cents: 39999,
  },
]

/** `null` means unlimited on the wire, never zero. */
function quota(limit: number | null, noun: string): string {
  if (limit === null) return `Unlimited ${noun}s`
  return `${limit} ${noun}${limit === 1 ? '' : 's'}`
}

/** `0.025` -> `2.5%`, `0.02` -> `2%` — no trailing `.0`. */
export function formatTakeRate(fee: number): string {
  return `${Number((fee * 100).toFixed(2))}%`
}

/**
 * Render a cents amount as the two-tier price node the pricing cards expect:
 * a large dollar figure with the cents set smaller via `.cent`. A whole-dollar
 * amount (notably free, at `$0`) renders without a cents span at all.
 */
export function formatPriceNode(cents: number): ReactNode {
  const dollars = Math.floor(cents / 100)
  const remainder = cents % 100
  if (remainder === 0) return `$${dollars}`
  return (
    <>
      ${dollars}.<span className="cent">{String(remainder).padStart(2, '0')}</span>
    </>
  )
}

/** Plain-text price, for aria labels and non-JSX contexts. */
export function formatPriceText(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

/**
 * Build a tier's feature list from the server's catalog entry, so the limits
 * and take rate shown are the ones actually enforced at charge time.
 */
export function catalogFeatures(entry: PlanCatalogEntry): PlanFeature[] {
  const key = entry.name.toLowerCase() as SubscriptionPlanKey
  const copy = PLAN_COPY[key]
  const derived: PlanFeature[] = [
    { text: quota(entry.max_vehicle, 'vehicle'), included: true },
    { text: quota(entry.max_driver_count, 'driver'), included: true },
    { text: `${formatTakeRate(entry.maison_fee)} per card payment`, included: true },
    { text: 'Advanced analytics', included: entry.allow_analytics },
    { text: 'Property & concierge support', included: entry.allow_property_support },
  ]
  // Support level is marketing, not policy — the API has no field for it.
  return copy ? [...derived, { text: copy.supportLine, included: true }] : derived
}

/**
 * Merge the server catalogue with local marketing copy into the display shape
 * every pricing surface renders. This is the single funnel: Landing.tsx,
 * Plans.tsx and SignupPlanSelection.tsx all go through it.
 */
export function buildPlanDisplays(catalog: PlanCatalogEntry[]): LandingPricingPlanDisplay[] {
  return catalog.map((entry) => {
    const key = entry.name.toLowerCase() as SubscriptionPlanKey
    const copy = PLAN_COPY[key]
    return {
      name: copy?.name ?? entry.name,
      product_type: key,
      price: formatPriceNode(entry.monthly_price_cents),
      period: '/month',
      description: copy?.description ?? '',
      popular: copy?.popular,
      features: catalogFeatures(entry),
    }
  })
}

/**
 * Static fallback displays. Prefer `buildPlanDisplays()` against a fetched
 * catalogue; this exists so a page can render before the fetch resolves.
 */
export const LANDING_PRICING_PLANS: LandingPricingPlanDisplay[] =
  buildPlanDisplays(FALLBACK_PLAN_CATALOG)

export function isPopularPlan(
  plan: LandingPricingPlanDisplay
): plan is LandingPricingPlanDisplay & { popular: true } {
  return 'popular' in plan && plan.popular === true
}

/** Look a tier up in the live catalog by its product_type. */
export function findCatalogEntry(
  catalog: PlanCatalogEntry[],
  productType: SubscriptionPlanKey
): PlanCatalogEntry | undefined {
  return catalog.find((c) => c.name.toLowerCase() === productType)
}
