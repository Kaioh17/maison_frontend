import type { StandardResponse } from '@api/tenant'
import type { SlugVerificationResponse } from '@api/tenant'

/** Backend codes / detail strings that mean “slug exists but guest site is not open” (not unknown slug). */
const GUEST_ACCESS_DENIED_CODES = new Set([
  'tenant_not_public',
  'tenant_not_verified',
  'guest_access_denied',
  'TENANT_NOT_PUBLIC',
  'GUEST_ACCESS_DENIED',
  'TENANT_GUEST_ACCESS_DENIED',
])

function matchesDeniedCode(value: unknown): boolean {
  return typeof value === 'string' && GUEST_ACCESS_DENIED_CODES.has(value)
}

/**
 * Full slug payload returned with 200: explicit flags to hide guest experience.
 */
export function isGuestAccessDeniedPayload(data: SlugVerificationResponse | null | undefined): boolean {
  if (!data) return false
  const d = data as SlugVerificationResponse & {
    guest_site_enabled?: boolean
    public_guest_access?: boolean
  }
  if (d.guest_site_enabled === false) return true
  if (d.public_guest_access === false) return true
  return false
}

/**
 * 200 response envelope without usable tenant payload: error / meta may indicate guest access denied.
 */
export function isGuestAccessDeniedSuccessEnvelope(
  res: StandardResponse<SlugVerificationResponse>
): boolean {
  const r = res as StandardResponse<SlugVerificationResponse> & { error_code?: string; code?: string }
  if (matchesDeniedCode(r.error_code) || matchesDeniedCode(r.code)) return true
  if (matchesDeniedCode(r.error)) return true
  const meta = r.meta
  if (meta && meta.guest_access === false) return true
  if (meta && meta.public_guest_site === false) return true
  return false
}

function detailString(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object' && 'msg' in (detail[0] as object)) {
    return String((detail[0] as { msg?: string }).msg ?? '')
  }
  return ''
}

/**
 * Axios error from GET /v1/slug/:slug — 403 or structured body.
 */
export function isGuestAccessDeniedAxiosError(error: unknown): boolean {
  const err = error as { response?: { status?: number; data?: Record<string, unknown> } }
  const status = err.response?.status
  if (status === 403) return true

  const data = err.response?.data
  if (!data) return false

  // Works for 403/404/422 if the API puts a machine code on the body (some backends use 404 here).
  if (matchesDeniedCode(data.error_code) || matchesDeniedCode(data.code) || matchesDeniedCode(data.error)) {
    return true
  }

  const ds = detailString(data.detail)
  if (ds && GUEST_ACCESS_DENIED_CODES.has(ds)) return true

  return false
}
