/** US NANP mobile/landline: exactly 10 digits (optional leading country code 1 stripped). */
export const US_PHONE_DIGITS = 10

export function extractPhoneDigits(input: string): string {
  return input.replace(/\D/g, '')
}

/** Strip leading 1 for 11-digit input; keep at most US_PHONE_DIGITS. */
export function normalizeUsPhoneDigits(value: string): string {
  let d = extractPhoneDigits(value)
  if (d.length === 11 && d[0] === '1') d = d.slice(1)
  if (d.length > US_PHONE_DIGITS) d = d.slice(0, US_PHONE_DIGITS)
  return d
}

/** As-you-type / paste: `(555) 123-XXXX` up to 10 digits. */
export function formatUsPhoneInput(value: string): string {
  const d = normalizeUsPhoneDigits(value)
  if (d.length === 0) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export function usPhoneDigitCount(value: unknown): number {
  if (value == null) return 0
  return normalizeUsPhoneDigits(String(value)).length
}

export function isCompleteUsPhone(value: unknown): boolean {
  return usPhoneDigitCount(value) === US_PHONE_DIGITS
}

/** Empty or exactly 10 digits after normalization. */
export function isEmptyOrCompleteUsPhone(value: unknown): boolean {
  const n = usPhoneDigitCount(value)
  return n === 0 || n === US_PHONE_DIGITS
}
