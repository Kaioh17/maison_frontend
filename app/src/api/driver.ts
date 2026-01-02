import { http } from './http'
import type { StandardResponse, BookingResponse } from './tenant'

export async function registerDriver(payload: DriverCreate, tenantId: number) {
  const { data } = await http.patch<StandardResponse<DriverResponse>>('/v1/driver/register', payload, {
    params: { tenant_id: tenantId },
  } as any)
  return data
}

export async function getDriverInfo() {
  const { data } = await http.get<StandardResponse<DriverResponse>>('/v1/driver/info')
  return data
}

export async function getAvailableRides(params?: { country?: string; service_type?: string }) {
  const { data } = await http.get<StandardResponse<BookingResponse[]>>('/v1/bookings/', {
    params,
  })
  return data
}

export async function respondToRide(bookingId: number, action: 'confirm' | 'cancelled' | 'completed', approveAction: boolean = true) {
  const { data } = await http.patch<StandardResponse<RideDecisionResponse>>(`/v1/driver/ride/${bookingId}/decision`, null, {
    params: { action, approve_action: approveAction },
  })
  return data
}

export async function getRiderDrivers(driverId?: number) {
  const params = driverId ? { driver_id: driverId } : undefined
  const { data } = await http.get<StandardResponse<RiderDriverResponse[]>>('/v1/driver/rider/info', { params })
  return data
}

export async function verifyDriverToken(slug: string, token: string) {
  const { data } = await http.get<StandardResponse<any>>(`/v1/driver/${slug}/verify`, {
    params: { token },
  })
  return data
}

export async function updateDriverStatus(isActive: boolean) {
  const { data } = await http.patch<StandardResponse<{ is_active: boolean }>>('/v1/driver/status', null, {
    params: { is_active: isActive },
  })
  return data
}

export type RiderDriverResponse = {
  id: number
  full_name: string
  driver_type: string
  completed_rides: number
  is_active: boolean
  status: string | null
  phone_no: string
  vehicle: {
    make: string
    model: string
    year: number
    license_plate: string
    color: string
    status: string
    seating_capacity: number
    tenant_id: number
    id: number
    created_on: string
    updated_on: string
    vehicle_category_id: number
  } | null
}

export type RideDecisionResponse = {
  booking_id: number
  ride_status: 'confirm' | 'cancelled'
}

export type DriverCreate = {
  email: string
  phone_no: string
  first_name: string
  last_name: string
  password: string
  state?: string
  postal_code?: string
  license_number?: string
  vehicle?: {
    make: string
    model: string
    year?: number
    license_plate?: string
    color?: string
    status?: string
    seating_capacity?: number
    vehicle_category?: string
  } | null
}
export type DriverResponse = {
  id: number
  email: string
  phone_no: string
  first_name: string
  last_name: string
  role: string
  driver_type: string
  completed_rides: number
  is_active: boolean
  is_registered?: string
  status?: string | null
  state?: string
  postal_code?: string
  license_number?: string
  created_on: string
  updated_on?: string | null
  vehicle?: {
    make: string
    model: string
    year?: number
    license_plate?: string
    color?: string
    status?: string
    seating_capacity?: number
    tenant_id?: number
    id?: number
    created_on?: string
    updated_on?: string
    vehicle_category_id?: number
    vehicle_images?: Record<string, string>
  } | null
} 