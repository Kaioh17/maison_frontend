import {
  US_PHONE_DIGITS,
  formatUsPhoneInput,
  normalizeUsPhoneDigits,
  isCompleteUsPhone,
  isEmptyOrCompleteUsPhone,
  usPhoneDigitCount,
} from './usPhoneFormat'

export { formatUsPhoneInput, isCompleteUsPhone, usPhoneDigitCount, US_PHONE_DIGITS }

/**
 * Canonical display/storage for Zelle phone: `(555) 123-4567`, or partial while editing, or null.
 * Legacy numeric JSON coerced via digits; empty / 0 → null.
 */
export function zelleNumberFromApi(v: unknown): string | null {
  if (v == null || v === '') return null
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v === 0) return null
    const d = normalizeUsPhoneDigits(String(Math.trunc(v)))
    if (d.length === 0) return null
    return formatUsPhoneInput(d)
  }
  const d = normalizeUsPhoneDigits(String(v))
  if (d.length === 0) return null
  return formatUsPhoneInput(d)
}

/** Saved value: null if empty, full `(XXX) XXX-XXXX` only when 10 digits; incomplete → null. */
export function zelleNumberForPayload(v: unknown): string | null {
  const d = normalizeUsPhoneDigits(v == null ? '' : String(v))
  if (d.length === 0) return null
  if (d.length !== US_PHONE_DIGITS) return null
  return formatUsPhoneInput(d)
}

export function zelleEmailFromApi(v: unknown): string | null {
  if (v == null || typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

/** For JSX / labels; empty → "". */
export function zelleEmailDisplay(v: unknown): string {
  return zelleEmailFromApi(v) ?? ''
}

export function hasZelleRecipient(number: unknown, email: unknown): boolean {
  return isCompleteUsPhone(number) || zelleEmailFromApi(email) != null
}

export function formatBookingZelleNumber(v: unknown): string | null {
  return zelleNumberFromApi(v)
}

/** Inline validation for tenant settings (partial digits = error). */
export function zellePhoneValidationError(v: unknown): string | null {
  if (isEmptyOrCompleteUsPhone(v)) return null
  const n = usPhoneDigitCount(v)
  return `Enter a complete ${US_PHONE_DIGITS}-digit US phone number or leave blank (${n}/${US_PHONE_DIGITS} digits).`
}

/** Root-level tenant settings for PATCH /config/settings. */
export function tenantZellePayload(edited: {
  zelle_number?: unknown
  zelle_email?: string | null
} | null | undefined) {
  const email = zelleEmailFromApi(
    edited?.zelle_email == null ? null : String(edited.zelle_email)
  )
  return {
    zelle_number: zelleNumberForPayload(edited?.zelle_number),
    zelle_email: email,
  }
}
