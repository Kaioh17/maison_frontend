import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tabs from '../Tabs'
import Field from '../Field'
import Modal from '../Modal'
import StatTile from '../StatTile'
import Notice from '../Notice'
import { useNotice } from '../../hooks/useNotice'

describe('Tabs', () => {
  it('marks the active tab and reports changes', async () => {
    const onChange = vi.fn()
    render(<Tabs ariaLabel="t" value="a" onChange={onChange} tabs={[{ id: 'a', label: 'All', count: 3 }, { id: 'b', label: 'Done' }]} />)
    expect(screen.getByRole('tab', { name: /All/ }).getAttribute('aria-selected')).toBe('true')
    await userEvent.click(screen.getByRole('tab', { name: 'Done' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('Field', () => {
  it('links label, control and error', () => {
    render(<Field label="Email" error="Required">{(p) => <input className="bw-input" {...p} />}</Field>)
    const input = screen.getByLabelText('Email')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText('Required').id).toBe(input.getAttribute('aria-describedby'))
  })
})

describe('Modal', () => {
  it('closes on Escape', async () => {
    const onClose = vi.fn()
    render(<Modal title="Edit" onClose={onClose}>body</Modal>)
    expect(screen.getByRole('dialog')).toBeTruthy()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('moves focus in, traps Tab, and restores focus on close', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const { unmount } = render(<Modal title="Edit" onClose={() => {}} footer={<button>Save</button>}>body</Modal>)
    expect(document.activeElement).toBe(screen.getByRole('dialog'))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }))
    unmount()
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})

describe('StatTile', () => {
  it('is a button only when clickable', () => {
    const { rerender } = render(<StatTile label="Drivers" value={4} />)
    expect(screen.queryByRole('button')).toBeNull()
    rerender(<StatTile label="Drivers" value={4} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeTruthy()
  })
})

describe('useNotice', () => {
  function Probe() {
    const [notice, setNotice] = useNotice()
    return (
      <>
        <button onClick={() => setNotice({ ok: true, text: 'Saved.' })}>ok</button>
        <button onClick={() => setNotice({ ok: false, text: 'Failed.' })}>err</button>
        <Notice notice={notice} />
      </>
    )
  }

  it('auto-dismisses success after 4s and keeps errors', () => {
    vi.useFakeTimers()
    try {
      render(<Probe />)
      act(() => { screen.getByText('ok').click() })
      expect(screen.getByText('Saved.')).toBeTruthy()
      act(() => { vi.advanceTimersByTime(4000) })
      expect(screen.queryByText('Saved.')).toBeNull()
      act(() => { screen.getByText('err').click() })
      act(() => { vi.advanceTimersByTime(10000) })
      expect(screen.getByText('Failed.')).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })
})
