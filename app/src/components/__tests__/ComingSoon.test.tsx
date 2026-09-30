import { render, screen } from '@testing-library/react'
import ComingSoon from '../ComingSoon'
import Card from '../Card'

describe('ComingSoon', () => {
  it('labels the feature as not connected and greys the content', () => {
    const { container } = render(<ComingSoon label="Corner style"><button>Rounded</button></ComingSoon>)
    expect(screen.getByText('Not connected')).toBeTruthy()
    expect(container.querySelector('.bw-soon')?.getAttribute('aria-disabled')).toBe('true')
  })
})

describe('Card', () => {
  it('renders title, meta and children', () => {
    render(<Card title="Reviews" meta="7 days">body</Card>)
    expect(screen.getByText('Reviews')).toBeTruthy()
    expect(screen.getByText('7 days')).toBeTruthy()
    expect(screen.getByText('body')).toBeTruthy()
  })
})
