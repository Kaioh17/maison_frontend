import { describe, expect, it } from 'vitest'
import type { PayoutRow } from '@api/payouts'
import { byDriver, inRange, periodRange, rowNet, statementCsv, totals } from '../payoutsMath'

const row = (o: Partial<PayoutRow>): PayoutRow => ({
  booking_id: 1, payout_id: 1, driver_id: 1, driver_name: 'Ada Lee', pickup_time: '2026-10-07T12:00:00', fare: 200,
  payment_method: 'card', earning: 140, amount: 140, adjustment: 0, status: 'pending', status_by_role: null,
  status_on: null, note: null, ...o,
})

// The worked example from DRIVER_EARNINGS_PROPOSAL.md section 5: 70 percent split, three rides.
const example = [
  row({ booking_id: 1, fare: 200, payment_method: 'card', earning: 140, amount: 140 }),
  row({ booking_id: 2, fare: 100, payment_method: 'cash', earning: 70, amount: -30 }),
  row({ booking_id: 3, fare: 150, payment_method: 'zelle', earning: 105, amount: 105 }),
]

describe('totals', () => {
  it('nets cash against what the operator owes', () => {
    expect(totals(example)).toEqual({
      rides: 3, fares: 450, earned: 315, owedToDriver: 245, cashCollected: 100, fees: 30, adjustments: 0, net: 215,
    })
  })
  it('folds adjustments into the net', () => {
    expect(totals([row({ adjustment: -12.5 })]).net).toBe(127.5)
    expect(rowNet(row({ amount: -30, adjustment: 5 }))).toBe(-25)
  })
  it('is exact in cents', () => {
    expect(totals([row({ fare: 0.1, earning: 0.1, amount: 0.1 }), row({ fare: 0.2, earning: 0.2, amount: 0.2 })]).earned).toBe(0.3)
  })
})

it('groups by driver, sorted by name', () => {
  const g = byDriver([row({ driver_id: 2, driver_name: 'Zed' }), row({ driver_id: 1, driver_name: 'Ada' }), row({ driver_id: 2, driver_name: 'Zed' })])
  expect(g.map(x => [x.driverName, x.totals.rides])).toEqual([['Ada', 1], ['Zed', 2]])
})

describe('periods (browser timezone, Monday weeks)', () => {
  const wed = new Date(2026, 9, 7, 15, 30) // Wed 7 Oct 2026
  it('this week is Monday to next Monday, last week the one before', () => {
    expect(periodRange('this_week', wed)).toEqual({ from: new Date(2026, 9, 5), to: new Date(2026, 9, 12) })
    expect(periodRange('last_week', wed)).toEqual({ from: new Date(2026, 8, 28), to: new Date(2026, 9, 5) })
  })
  it('handles a Sunday as the end of its week', () => {
    expect(periodRange('this_week', new Date(2026, 9, 11, 23, 0)).from).toEqual(new Date(2026, 9, 5))
  })
  it('month ranges roll over the year', () => {
    expect(periodRange('last_month', new Date(2026, 0, 15))).toEqual({ from: new Date(2025, 11, 1), to: new Date(2026, 0, 1) })
  })
  it('custom range includes the whole last day', () => {
    const range = periodRange('custom', wed, { from: '2026-10-01', to: '2026-10-07' })
    expect(inRange([row({ pickup_time: '2026-10-07T23:30:00' }), row({ pickup_time: '2026-10-08T00:30:00' })], range)).toHaveLength(1)
  })
  it('all time is unbounded', () => {
    expect(inRange(example, periodRange('all', wed))).toHaveLength(3)
  })
})

describe('statementCsv', () => {
  it('lists each ride and the totals', () => {
    const csv = statementCsv(byDriver(example)[0], 'This week')
    expect(csv).toContain('Driver,Ada Lee')
    expect(csv).toContain('Net (positive: operator owes driver),215.00')
    expect(csv.split('\r\n').filter(l => l.includes(',cash,'))).toHaveLength(1)
  })
  it('neutralises spreadsheet formulas and quotes commas', () => {
    const csv = statementCsv(byDriver([row({ driver_name: '=HYPERLINK("x")', note: 'a, b' })])[0], 'All time')
    expect(csv).toContain(`'=HYPERLINK`)
    expect(csv).toContain('"a, b"')
  })
})
