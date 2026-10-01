import type { PayoutRow, PayoutStatus } from '@api/payouts'

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/** Net money movement for one ride: + operator owes driver, - driver owes operator. */
export const rowNet = (r: PayoutRow) => r2(r.amount + r.adjustment)
/** Only cash leaves the money with the driver (matches backend DRIVER_HELD_METHODS). */
export const isCash = (r: PayoutRow) => r.payment_method === 'cash'
/** Settleable now. Disputed lines wait for a resolution, so they are kept out of settlement totals. */
export const isPending = (r: PayoutRow) => r.status === 'pending'

export const STATUS_LABEL: Record<PayoutStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  disputed: 'Disputed',
  verified: 'Verified',
}
/** StatusPill has no payout variants; reuse the closest colours (amber, blue, red, green). */
export const STATUS_PILL: Record<PayoutStatus, string> = {
  pending: 'pending',
  paid: 'confirmed',
  disputed: 'cancelled',
  verified: 'active',
}

export interface Totals {
  rides: number
  fares: number
  earned: number
  /** Operator owes driver: earnings on rides the operator collected (card, Zelle, card at pickup). */
  owedToDriver: number
  /** Fares the driver collected in person. */
  cashCollected: number
  /** Operator's share of that cash: what the driver hands in. */
  fees: number
  adjustments: number
  /** owedToDriver - fees + adjustments. Positive: operator owes driver. */
  net: number
}

export function totals(rows: PayoutRow[]): Totals {
  const t = { rides: rows.length, fares: 0, earned: 0, owedToDriver: 0, cashCollected: 0, fees: 0, adjustments: 0 }
  for (const r of rows) {
    t.fares += r.fare
    t.earned += r.earning
    t.adjustments += r.adjustment
    if (isCash(r)) {
      t.cashCollected += r.fare
      t.fees += r.fare - r.earning
    } else {
      t.owedToDriver += r.earning
    }
  }
  const fares = r2(t.fares), earned = r2(t.earned), owedToDriver = r2(t.owedToDriver)
  const cashCollected = r2(t.cashCollected), fees = r2(t.fees), adjustments = r2(t.adjustments)
  return { rides: t.rides, fares, earned, owedToDriver, cashCollected, fees, adjustments, net: r2(owedToDriver - fees + adjustments) }
}

export interface DriverGroup { driverId: number; driverName: string; rows: PayoutRow[]; totals: Totals }

export function byDriver(rows: PayoutRow[]): DriverGroup[] {
  const m = new Map<number, PayoutRow[]>()
  for (const r of rows) m.set(r.driver_id, [...(m.get(r.driver_id) ?? []), r])
  return [...m.values()]
    .map(rs => ({ driverId: rs[0].driver_id, driverName: rs[0].driver_name, rows: rs, totals: totals(rs) }))
    .sort((a, b) => a.driverName.localeCompare(b.driverName))
}

export type PeriodId = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'last_30' | 'all' | 'custom'

export const PERIODS: ReadonlyArray<{ id: PeriodId; label: string }> = [
  { id: 'this_week', label: 'This week' },
  { id: 'last_week', label: 'Last week' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_30', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom range' },
]

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Half-open [from, to) in the browser's timezone. Weeks start on Monday. `null` = unbounded. */
export function periodRange(id: PeriodId, now = new Date(), custom?: { from: string; to: string }): { from: Date | null; to: Date | null } {
  const today = startOfDay(now)
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
  switch (id) {
    case 'this_week': return { from: monday, to: addDays(monday, 7) }
    case 'last_week': return { from: addDays(monday, -7), to: monday }
    case 'this_month': return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 1) }
    case 'last_month': return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1) }
    case 'last_30': return { from: addDays(today, -29), to: addDays(today, 1) }
    case 'custom': {
      // <input type="date"> yields yyyy-mm-dd; parse as local midnight, and make "to" inclusive.
      const parse = (s: string) => (s ? new Date(`${s}T00:00:00`) : null)
      const to = parse(custom?.to ?? '')
      return { from: parse(custom?.from ?? ''), to: to ? addDays(to, 1) : null }
    }
    default: return { from: null, to: null }
  }
}

export function inRange(rows: PayoutRow[], range: { from: Date | null; to: Date | null }): PayoutRow[] {
  return rows.filter(r => {
    const t = new Date(r.pickup_time).getTime()
    return (!range.from || t >= range.from.getTime()) && (!range.to || t < range.to.getTime())
  })
}

const csvCell = (v: string | number) => {
  let s = String(v)
  // A leading = + - @ makes spreadsheets run the cell as a formula; names and notes are user text.
  if (/^[=+\-@\t\r]/.test(s) && typeof v === 'string') s = `'${s}`
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** One driver's statement for the rows given: a line per ride, then totals. */
export function statementCsv(group: DriverGroup, periodLabel: string): string {
  const t = group.totals
  const lines: Array<Array<string | number>> = [
    ['Driver statement'], ['Driver', group.driverName], ['Period', periodLabel], [],
    ['Date', 'Booking', 'Payment method', 'Fare', 'Driver earned', 'Adjustment', 'Net', 'Status', 'Note'],
    ...[...group.rows].sort((a, b) => +new Date(a.pickup_time) - +new Date(b.pickup_time)).map(r => [
      new Date(r.pickup_time).toLocaleDateString('en-CA'), `#${r.booking_id}`, r.payment_method ?? '',
      r.fare.toFixed(2), r.earning.toFixed(2), r.adjustment.toFixed(2), rowNet(r).toFixed(2), STATUS_LABEL[r.status], r.note ?? '',
    ]),
    [],
    ['Rides', t.rides], ['Total fares', t.fares.toFixed(2)], ['Driver earned', t.earned.toFixed(2)],
    ['Cash collected by driver', t.cashCollected.toFixed(2)], ['Operator share of cash (driver hands in)', t.fees.toFixed(2)],
    ['Adjustments', t.adjustments.toFixed(2)], ['Net (positive: operator owes driver)', t.net.toFixed(2)],
  ]
  return lines.map(l => l.map(csvCell).join(',')).join('\r\n')
}
