import { http } from './http'

export type StandardResponse<T> = {
  success: boolean
  message?: string
  meta?: Record<string, unknown>
  data: T
  error?: string
}

export type CreateCheckoutSessionRequest = {
  price_id: string
  product_type: string
}

export type CheckoutSessionResponse = {
  Checkout_session_url: string
  tenant_id: number
  customer_id: string
  product_type: string
  sub_total: number
}

/** `data` payload for `PATCH /v1/subscription/` (upgrade / change plan). */
export type SubscriptionUpgradeResponse = {
  subscription_id: string
  tenant_id: number
  customer_id: string
  product_type: string
  status: string
}

export type QuotaUsage = {
  used: number
  /** `null` == unlimited. */
  allowed: number | null
  remaining: number | null
  over_limit: boolean
}

/** One tier from the server's plan ladder. `null` limits mean unlimited. */
export type PlanCatalogEntry = {
  name: string
  max_vehicle: number | null
  max_driver_count: number | null
  /** Take rate as a fraction, e.g. `0.02` == 2%. */
  maison_fee: number
  allow_property_support: boolean
  allow_analytics: boolean
  /** List price in cents. `0` == free, which is not purchasable. */
  monthly_price_cents: number
}

/**
 * Public plan catalogue — no auth. This is what the marketing page reads, and
 * it is the same shape `/limits` returns in `catalog[]`, so the two surfaces
 * cannot show different numbers.
 */
export async function getPublicPlans() {
  const { data } = await http.get<StandardResponse<PlanCatalogEntry[]>>('/v1/subscription/plans')
  return data
}

/**
 * Reads `meta.founding_operator_slots_remaining` off a `/subscription/plans`
 * or `/subscription/limits` response. The coupon code itself is never sent to
 * the client -- this is marketing copy only ("3 founding spots left").
 */
export function foundingOperatorSlotsRemaining(res: StandardResponse<unknown>): number | null {
  const v = res.meta?.founding_operator_slots_remaining
  return typeof v === 'number' ? v : null
}

/** `data` payload for `GET /v1/subscription/limits`. */
export type PlanLimitsResponse = {
  plan: string
  status: string
  is_entitled: boolean
  maison_fee: number
  allow_property_support: boolean
  vehicles: QuotaUsage
  drivers: QuotaUsage
  /** Every tier, cheapest first — the authoritative source for pricing tables. */
  catalog: PlanCatalogEntry[]
}

/**
 * Authoritative plan ladder + this tenant's live usage. Requires a tenant JWT.
 * Deliberately not subscription-gated, so an inactive tenant can still read
 * their own state to see the upgrade prompt.
 */
export async function getPlanLimits() {
  const { data } = await http.get<StandardResponse<PlanLimitsResponse>>('/v1/subscription/limits')
  return data
}

export async function createCheckoutSession(payload: CreateCheckoutSessionRequest) {
  const { data } = await http.post<StandardResponse<CheckoutSessionResponse>>('/v1/subscription/', payload)
  return data
}

export async function upgradeSubscription(payload: CreateCheckoutSessionRequest) {
  const { data } = await http.patch<StandardResponse<SubscriptionUpgradeResponse>>('/v1/subscription/', payload)
  return data
}

