export const PASSWORD_MIN_LENGTH = 8

/** Aligns with typical backend rules: minimum length, digit, and symbol (non-alphanumeric, not whitespace). */
export function getPasswordPolicyFailures(password: string): string[] {
  const failures: string[] = []
  if (password.length < PASSWORD_MIN_LENGTH) {
    failures.push(`at least ${PASSWORD_MIN_LENGTH} characters`)
  }
  if (!/\d/.test(password)) {
    failures.push('at least one number')
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    failures.push('at least one symbol')
  }
  return failures
}

export function isPasswordPolicyValid(password: string): boolean {
  return getPasswordPolicyFailures(password).length === 0
}

export function formatPasswordPolicySentence(failures: string[]): string {
  if (failures.length === 0) return ''
  return `Password must include ${failures.join(', ')}.`
}

export const PASSWORD_POLICY_HINT =
  'At least 8 characters, one number, and one symbol.'
