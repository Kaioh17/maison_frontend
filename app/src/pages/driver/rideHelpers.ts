import type { BookingResponse } from '@api/tenant'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const formatMoney = (n: number | null | undefined) => money.format(n ?? 0)

/** Driving directions from the phone's live location (no origin) to the address. */
export const googleMapsUrl = (address: string) =>
  `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: address, travelmode: 'driving' })}`

export const appleMapsUrl = (address: string) =>
  `https://maps.apple.com/?${new URLSearchParams({ daddr: address, dirflg: 'd' })}`

/** iPhone/iPad (iPadOS reports as a touch-capable Mac): lead with Apple Maps there, Google elsewhere. */
export const prefersAppleMaps = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

export const telHref = (phone?: string | null) => {
  const digits = (phone ?? '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

/** Earliest pickup first. Does not mutate the input. */
export const byPickup = (rides: BookingResponse[]) =>
  [...rides].sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime())

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/** `{ day: 'Today', time: '3:30 PM' }` in the driver's local time. */
export function formatWhen(iso: string, now = new Date()) {
  const d = new Date(iso)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const days = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000)
  const day =
    days === 0 ? 'Today'
    : days === 1 ? 'Tomorrow'
    : days === -1 ? 'Yesterday'
    : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  return { day, time }
}

/** "in 25 min" / "10 min ago"; null when more than a day away (the date already says it). */
export function untilLabel(iso: string, now = new Date()): string | null {
  const mins = Math.round((new Date(iso).getTime() - now.getTime()) / 60_000)
  const abs = Math.abs(mins)
  if (abs >= 24 * 60) return null
  if (abs < 1) return 'now'
  const span = abs < 60 ? `${abs} min` : `${Math.floor(abs / 60)} h${abs % 60 ? ` ${abs % 60} min` : ''}`
  return mins > 0 ? `in ${span}` : `${span} ago`
}

export type Collection = { tone: 'collect' | 'none'; label: string }

/**
 * What the driver has to do about money at the curb. Cash and card-at-pickup are collected by the
 * driver; card and Zelle never touch the driver. The server does not expose `payment_status` to
 * drivers, so card is described by what the driver does ("nothing to collect"), not by "paid".
 */
export function collectionNote(ride: Pick<BookingResponse, 'payment_method' | 'estimated_price'>): Collection | null {
  const amount = formatMoney(ride.estimated_price)
  switch (ride.payment_method) {
    case 'cash': return { tone: 'collect', label: `Collect ${amount} cash` }
    case 'card_pickup': return { tone: 'collect', label: `Charge ${amount} on your device` }
    case 'card': return { tone: 'none', label: 'Card - nothing to collect' }
    case 'zelle': return { tone: 'none', label: 'Zelle to the company - nothing to collect' }
    default: return null
  }
}
