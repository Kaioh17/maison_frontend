import { act, fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ConfirmButton from '../ConfirmButton'
import type { BookingResponse } from '@api/tenant'
import { appleMapsUrl, byPickup, collectionNote, formatWhen, googleMapsUrl, telHref, untilLabel } from '../rideHelpers'

describe('rideHelpers', () => {
  const now = new Date(2026, 9, 1, 12, 0) // local noon, Oct 1

  it('tells the driver what to collect per payment method', () => {
    expect(collectionNote({ payment_method: 'cash', estimated_price: 85 })).toEqual({ tone: 'collect', label: 'Collect $85.00 cash' })
    expect(collectionNote({ payment_method: 'card_pickup', estimated_price: 85 })?.tone).toBe('collect')
    expect(collectionNote({ payment_method: 'card', estimated_price: 85 })?.tone).toBe('none')
    expect(collectionNote({ payment_method: 'zelle', estimated_price: 85 })?.tone).toBe('none')
  })

  it('builds maps and tel links, and encodes the address', () => {
    expect(googleMapsUrl('1 Main St & 2nd')).toBe('https://www.google.com/maps/dir/?api=1&destination=1+Main+St+%26+2nd&travelmode=driving')
    expect(appleMapsUrl('1 Main St & 2nd')).toBe('https://maps.apple.com/?daddr=1+Main+St+%26+2nd&dirflg=d')
    expect(appleMapsUrl('41.8781,-87.6298')).toContain('daddr=41.8781%2C-87.6298')
    expect(telHref('(555) 123-4567')).toBe('tel:5551234567')
    expect(telHref('+1 555 123 4567')).toBe('tel:+15551234567')
    expect(telHref('')).toBeNull()
  })

  it('sorts by earliest pickup without mutating', () => {
    const rides = [{ pickup_time: '2026-10-03T10:00:00Z' }, { pickup_time: '2026-10-02T10:00:00Z' }] as BookingResponse[]
    expect(byPickup(rides)[0]).toBe(rides[1])
    expect(rides[0].pickup_time).toBe('2026-10-03T10:00:00Z')
  })

  it('labels day and relative time', () => {
    expect(formatWhen(new Date(2026, 9, 1, 15, 30).toISOString(), now)).toEqual({ day: 'Today', time: '3:30 PM' })
    expect(formatWhen(new Date(2026, 9, 2, 9, 0).toISOString(), now).day).toBe('Tomorrow')
    expect(untilLabel(new Date(2026, 9, 1, 12, 25).toISOString(), now)).toBe('in 25 min')
    expect(untilLabel(new Date(2026, 9, 1, 13, 30).toISOString(), now)).toBe('in 1 h 30 min')
    expect(untilLabel(new Date(2026, 9, 1, 11, 50).toISOString(), now)).toBe('10 min ago')
    expect(untilLabel(new Date(2026, 9, 4, 12, 0).toISOString(), now)).toBeNull()
  })
})

describe('ConfirmButton', () => {
  it('needs two taps, and disarms after 4s', () => {
    vi.useFakeTimers()
    const onConfirm = vi.fn()
    render(<ConfirmButton confirmLabel="Tap again" onConfirm={onConfirm}>Complete</ConfirmButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))
    expect(onConfirm).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(4100) })
    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tap again' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
