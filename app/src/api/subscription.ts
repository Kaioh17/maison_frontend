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

/**
 * `data` payload for `PATCH /v1/subscription/` when the tenant already has a
 * subscription. Never bills directly -- `portal_url` is a Stripe Billing
 * Portal session scoped to confirming this one price change (card on file +
 * prorated amount shown by Stripe itself). See directives.md
 * billing-confirm-2026-08. A tenant with no subscription yet gets a
 * `CheckoutSessionResponse` instead (nothing to update).
 */
export type PortalSessionResponse = {
  portal_url: string
  tenant_id: number
  customer_id: string
  product_type: string
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
  /** `null` when unsubscribed: free is a real subscription, so no subscription means no plan. */
  plan: string | null
  /** `'unsubscribed'` means no Stripe subscription on file; the dashboard is gated until one exists. */
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

/**
 * Returns a redirect URL, never a completed upgrade -- `portal_url`
 * (existing subscription) or `Checkout_session_url` (first paid plan). The
 * caller must send the tenant there to confirm before anything bills.
 */
export async function upgradeSubscription(payload: CreateCheckoutSessionRequest) {
  const { data } = await http.patch<StandardResponse<PortalSessionResponse | CheckoutSessionResponse>>(
    '/v1/subscription/',
    payload
  )
  return data
}


export type BillingInvoice = {
  id: string
  number: string | null
  /** Unix seconds. */
  created: number
  status: string | null
  /** Cents. */
  amount_due: number
  amount_paid: number
  currency: string
  hosted_invoice_url: string | null
  invoice_pdf: string | null
}

export type BillingStripe = {
  status: string
  currency: string
  interval: string | null
  interval_count: number
  /** Cents per interval at list price. */
  recurring_amount: number
  /** Cents the next invoice will actually charge, after discounts. `null` when nothing is coming. */
  next_invoice_amount: number | null
  /** Unix seconds. `current_period_end` is the next renewal, or the end date if cancelling. */
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean
  started_on: number | null
  discount: {
    name: string | null
    percent_off: number | null
    amount_off: number | null
    duration: string | null
    duration_in_months: number | null
  } | null
  payment_method: { brand: string | null; last4: string | null; exp_month: number | null; exp_year: number | null } | null
  invoices: BillingInvoice[]
}

/** `data` payload for `GET /v1/subscription/billing`. */
export type BillingOverview = {
  subscription_id: string | null
  customer_id: string | null
  /** `null` when there is no subscription, or when Stripe could not be reached (see `stripe_error`). */
  stripe: BillingStripe | null
  stripe_error: string | null
}

/** What Stripe is actually charging this tenant, plus their subscription ids. Tenant JWT, not subscription-gated. */
export async function getBillingOverview() {
  const { data } = await http.get<StandardResponse<BillingOverview>>('/v1/subscription/billing')
  return data
}

/**
 * Starts a Stripe Checkout for a brand-new subscription and sends the browser there.
 * Resolves only if no redirect URL came back; the caller shows the error.
 */
export async function redirectToCheckout(payload: CreateCheckoutSessionRequest): Promise<string | null> {
  const res = await createCheckoutSession(payload)
  if (res.success && res.data.Checkout_session_url) {
    window.location.href = res.data.Checkout_session_url
    return null
  }
  return res.error || 'Failed to create checkout session'
}
