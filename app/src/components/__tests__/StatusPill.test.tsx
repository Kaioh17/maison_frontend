import { render, screen } from '@testing-library/react'
import StatusPill from '../StatusPill'

/**
 * StatusPill styles inline from `--bw-status-{variant}-{bg,text}` tokens, so the
 * assertions below check the resolved custom-property references rather than a
 * class name. jsdom does not evaluate CSS variables — it preserves the literal
 * `var(...)` string, which is exactly what we want to pin.
 */
describe('StatusPill', () => {
  it('renders a humanized label for a known status', () => {
    render(<StatusPill status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each([
    ['active', 'active'],
    ['pending', 'pending'],
    ['completed', 'done'],
    ['complete', 'done'],
    ['cancelled', 'cancelled'],
    ['canceled', 'cancelled'],
    ['assigned', 'assigned'],
    ['confirmed', 'confirmed'],
  ])('maps status %s to the %s token pair', (status, variant) => {
    render(<StatusPill status={status} />)
    const pill = screen.getByText(/./)
    expect(pill).toHaveStyle({
      backgroundColor: `var(--bw-status-${variant}-bg)`,
      color: `var(--bw-status-${variant}-text)`,
    })
  })

  it('falls back to the default token pair for an unrecognized status', () => {
    render(<StatusPill status="in_transit" />)
    expect(screen.getByText('In_transit')).toHaveStyle({
      backgroundColor: 'var(--bw-status-default-bg)',
      color: 'var(--bw-status-default-text)',
    })
  })

  it('is case-insensitive on the incoming status string', () => {
    render(<StatusPill status="COMPLETED" />)
    expect(screen.getByText('Done')).toHaveStyle({
      backgroundColor: 'var(--bw-status-done-bg)',
    })
  })

  it('lets an explicit label override the derived text', () => {
    render(<StatusPill status="active" label="On shift" />)
    expect(screen.getByText('On shift')).toBeInTheDocument()
  })

  it('uses the compact metrics at size sm and the larger ones at md', () => {
    const { rerender } = render(<StatusPill status="active" />)
    expect(screen.getByText('Active')).toHaveStyle({ fontSize: '10px', padding: '3px 8px' })

    rerender(<StatusPill status="active" size="md" />)
    expect(screen.getByText('Active')).toHaveStyle({ fontSize: '12px', padding: '5px 12px' })
  })
})
