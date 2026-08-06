import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'

/**
 * Button is the single sanctioned button (maison-ui skill §2). These tests pin the
 * class contract the `.btn*` CSS in styles.css depends on — if the emitted classes
 * drift, every button in the app silently loses its styling.
 */
describe('Button', () => {
  it('renders as btn btn-primary by default', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('btn', 'btn-primary')
  })

  it.each(['primary', 'secondary', 'destructive', 'ghost'] as const)(
    'maps variant %s to btn-%s',
    (variant) => {
      render(<Button variant={variant}>Go</Button>)
      expect(screen.getByRole('button')).toHaveClass('btn', `btn-${variant}`)
    }
  )

  it('adds btn-block only when fullWidth is set', () => {
    const { rerender } = render(<Button>Go</Button>)
    expect(screen.getByRole('button')).not.toHaveClass('btn-block')

    rerender(<Button fullWidth>Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-block')
  })

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('honors an explicit type', () => {
    render(<Button type="submit">Go</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('merges a caller-supplied className without dropping the variant classes', () => {
    render(<Button className="w-full mt-4">Go</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn', 'btn-primary', 'w-full', 'mt-4')
  })

  it('forwards a ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Go</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('forwards onClick and respects disabled', async () => {
    const onClick = vi.fn()
    const { rerender } = render(<Button onClick={onClick}>Go</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
