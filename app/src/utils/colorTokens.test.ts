import { describe, it, expect } from 'vitest'
import { brandingCssVars } from './colorTokens'

describe('brandingCssVars', () => {
  it('maps brand colors to tokens and derives text-based tints', () => {
    const v = brandingCssVars({ primary_color: '#112233', accent_color: '#445566', text_color: '#ffffff', button_text_color: '#000000' })
    expect(v['--bw-accent']).toBe('#112233')
    expect(v['--bw-accent-hover']).toBe('#445566')
    expect(v['--rider-on-primary']).toBe('#000000')
    expect(v['--bw-border']).toBe('rgba(255,255,255,0.1)')
  })

  it('omits tokens for blank colors so the global theme shows through', () => {
    const v = brandingCssVars({ primary_color: '', text_color: null })
    expect(v).toEqual({})
  })
})
