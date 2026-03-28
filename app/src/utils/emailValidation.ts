/** Practical format check aligned with registration flows (not full RFC 5322). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  const t = email.trim()
  if (!t) return false
  return EMAIL_REGEX.test(t)
}

/** Inline feedback: empty field yields no error; invalid non-empty shows a message. */
export function getEmailFormatError(email: string): string | null {
  const t = email.trim()
  if (!t) return null
  if (!EMAIL_REGEX.test(t)) {
    return 'Enter a valid email address (for example, name@gmail.com).'
  }
  return null
}

export const EMAIL_FORMAT_HINT =
  'Use a working email you can access, with @ and a domain (e.g. name@gmail.com).'
