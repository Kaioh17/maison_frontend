import { describe, expect, it } from 'vitest'
import { normalizeCompanyName } from './companyName'

describe('normalizeCompanyName', () => {
  it('title-cases all-caps names and keeps suffixes', () => {
    expect(normalizeCompanyName('ACME LIMO LLC')).toBe('Acme Limo LLC')
  })
  it('leaves mixed-case names alone', () => {
    expect(normalizeCompanyName('BLS Transportation')).toBe('BLS Transportation')
  })
})
