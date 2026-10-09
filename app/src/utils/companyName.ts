const KEEP_UPPER = new Set(['LLC', 'INC', 'LTD', 'LLP', 'USA'])

/** 'ACME LIMO' -> 'Acme Limo'; names with any lowercase are left alone. Keep in sync with normalize_company_name in the backend (utils/text_normalize.py). */
export function normalizeCompanyName(value: string): string {
  const name = value.trim().replace(/\s+/g, ' ')
  if (!/[a-z]/i.test(name) || name !== name.toUpperCase()) return name
  return name.split(' ').map(w => (KEEP_UPPER.has(w) ? w : w.charAt(0) + w.slice(1).toLowerCase())).join(' ')
}
