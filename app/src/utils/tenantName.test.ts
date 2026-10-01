import { describe, expect, it } from 'vitest'
import { cleanName, shortAppName } from './tenantName'

describe('shortAppName (must match backend make_short_name)', () => {
  it.each([
    ['BHS', 'BHS'],
    ['Elvis Executive Cars', 'Elvis'],
    ['Jane Skyline Chauffeur LLC', 'Jane Skyline'],
    ['Supercalifragilistic Limousines', 'Supercalifrag'.slice(0, 12)],
    ['Café & Co', 'Café & Co'],
  ])('%s -> %s', (name, expected) => {
    expect(shortAppName(name)).toBe(expected)
    expect([...shortAppName(name)].length).toBeLessThanOrEqual(12)
  })
})

describe('cleanName', () => {
  it('strips control and invisible characters and collapses whitespace', () => {
    expect(cleanName('A\u0000B​\n C')).toBe('A B C')
    expect(cleanName('   ')).toBe('')
    expect(cleanName(undefined)).toBe('')
  })
})
