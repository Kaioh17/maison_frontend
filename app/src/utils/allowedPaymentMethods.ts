/** Rider-facing payment methods aligned with booking APIs. */
export const RIDER_PAYMENT_METHOD_IDS = ['card', 'zelle', 'cash'] as const
export type RiderPaymentMethodId = (typeof RIDER_PAYMENT_METHOD_IDS)[number]

export const RIDER_PAYMENT_METHOD_LABELS: Record<RiderPaymentMethodId, string> = {
  card: 'Card',
  zelle: 'Zelle',
  cash: 'Cash',
}

export type AllowedPaymentMethodRow = { is_allowed: boolean }

/** Normalized map stored in tenant settings (fixed keys for the three methods). */
export type AllowedPaymentMethodMap = Record<RiderPaymentMethodId, AllowedPaymentMethodRow>

/**
 * Only explicit `is_allowed: false` hides a method (tenant JSONB / legacy payloads).
 * Missing `allowed_payment_method` or missing keys => allowed.
 */
export function isRiderPaymentMethodAllowed(
  method: RiderPaymentMethodId,
  allowed?: Partial<Record<string, { is_allowed?: boolean }>> | null
): boolean {
  if (!allowed) return true
  const row = allowed[method]
  if (row == null) return true
  return row.is_allowed !== false
}

/** Small fixed-length filter — O(1) per call, no extra allocations when used once per render. */
export function listAllowedRiderPaymentMethods(
  allowed?: Partial<Record<string, { is_allowed?: boolean }>> | null
): RiderPaymentMethodId[] {
  const out: RiderPaymentMethodId[] = []
  for (let i = 0; i < RIDER_PAYMENT_METHOD_IDS.length; i++) {
    const id = RIDER_PAYMENT_METHOD_IDS[i]
    if (isRiderPaymentMethodAllowed(id, allowed)) out.push(id)
  }
  return out
}

/** Full map for admin UI and PATCH payloads (always three keys). */
export function normalizeAllowedPaymentMethodMap(
  raw?: Partial<Record<string, { is_allowed?: boolean }>> | null
): AllowedPaymentMethodMap {
  return {
    card: { is_allowed: isRiderPaymentMethodAllowed('card', raw) },
    zelle: { is_allowed: isRiderPaymentMethodAllowed('zelle', raw) },
    cash: { is_allowed: isRiderPaymentMethodAllowed('cash', raw) },
  }
}
