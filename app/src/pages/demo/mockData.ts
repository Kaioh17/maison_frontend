/** Static demo content — no network, no auth. */

export const DEMO_STRIPE_REDIRECT_PATH = '/demo/stripe-redirect' as const

export const DEMO_TENANT = {
  companyName: 'Prestige Ground',
  city: 'Chicago',
  slug: 'prestige',
  status: 'active' as const,
  memberSince: 'January 2025',
}

export const DEMO_KPI = {
  activeRides: 4,
  pending: 7,
  driversOnline: 6,
  driversTotal: 8,
  todayRevenue: 2340,
  weekRevenue: 9820,
}

export type DemoDriverPresence = 'available' | 'on_ride' | 'offline'

export type DemoDriver = {
  firstName: string
  lastInitial: string
  vehicleLine: string
  presence: DemoDriverPresence
}

export const DEMO_DRIVERS: DemoDriver[] = [
  { firstName: 'Marcus', lastInitial: 'J.', vehicleLine: 'Lincoln Navigator #04', presence: 'available' },
  { firstName: 'David', lastInitial: 'W.', vehicleLine: 'Cadillac Escalade #02', presence: 'on_ride' },
  { firstName: 'Tony', lastInitial: 'R.', vehicleLine: 'Suburban #07', presence: 'available' },
  { firstName: 'Kevin', lastInitial: 'L.', vehicleLine: 'Mercedes S-Class #01', presence: 'offline' },
  { firstName: 'Priya', lastInitial: 'S.', vehicleLine: 'Lincoln Continental #05', presence: 'available' },
  { firstName: 'James', lastInitial: 'O.', vehicleLine: 'Escalade ESV #03', presence: 'on_ride' },
]

export type DemoBookingStatus = 'active' | 'pending' | 'completed'

export type DemoBooking = {
  customer: string
  pickup: string
  dropoff: string
  amount: number
  status: DemoBookingStatus
}

export const DEMO_BOOKINGS: DemoBooking[] = [
  { customer: 'Sarah M.', pickup: 'ORD', dropoff: 'Waldorf Astoria', amount: 180, status: 'active' },
  { customer: 'James K.', pickup: 'Hyatt Regency', dropoff: 'Midway', amount: 95, status: 'pending' },
  { customer: 'Priya L.', pickup: 'Magnificent Mile', dropoff: 'ORD', amount: 140, status: 'completed' },
  { customer: 'Robert C.', pickup: 'Union Station', dropoff: 'Kimpton Hotel', amount: 210, status: 'active' },
  { customer: 'Diana F.', pickup: 'Four Seasons', dropoff: "O'Hare", amount: 165, status: 'completed' },
]

export const DEMO_RIDER_URL = 'https://prestige.usemaison.io/riders/login'
export const DEMO_DRIVER_URL = 'https://prestige.usemaison.io/drivers/login'

/** Last 7 days: Wed → Tue */
export const CHART_DAY_LABELS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'] as const

export const REVENUE_SERIES = [1820, 2100, 3400, 4200, 1900, 2050, 2340] as const

export const RIDE_VOLUME_SERIES = [8, 10, 14, 18, 9, 11, 13] as const

export function demoDriverDisplayName(d: DemoDriver): string {
  return `${d.firstName} ${d.lastInitial}`.trim()
}

export function demoDriverInitials(d: DemoDriver): string {
  const a = (d.firstName[0] || '').toUpperCase()
  const b = (d.lastInitial[0] || '').toUpperCase()
  return (a + b) || '?'
}
