import { http } from './http'
import type { StandardResponse } from './tenant'

export type BookingResponse = {
  country: string
  service_type: 'airport' | 'hourly' | 'dropoff'
  pickup_location: string
  pickup_time: string
  airport_service?: 'to_airport' | 'from_airport' | null
  dropoff_location: string
  dropoff_time: string
  payment_method: 'cash' | 'card' | 'zelle'
  hours: number | null
  notes: string | null
  estimated_price: number
  booking_status: string
  customer_name: string
  vehicle: string
  driver_name: string
  // Optional fields that may still be present in some responses
  vehicle_id?: number
  id?: number
  updated_on?: string | null
  is_approved?: boolean
  payment?: {
    client_secret: string
    payment_type: string
    tenant_acct_id?: string
    // Legacy field for backwards compatibility
    checkout_session?: string
    line_items?: Array<{
      price_data: {
        currency: string
        product_data: {
          name: string
          description: string
        }
        unit_amount: number
      }
      quantity: number
    }>
  }
}

export async function createBooking(payload: CreateBooking) {
  const { data } = await http.post<StandardResponse<BookingResponse>>('/v1/bookings/set', payload)
  return data
}

export async function getBookings(params?: { page?: number; limit?: number; offset?: number }) {
  const { data } = await http.get<StandardResponse<BookingResponse[]>>('/v1/bookings/', { params })
  return data
}

export type CreateBooking = {
  vehicle_id?: number
  country: string
  service_type: 'airport' | 'hourly' | 'dropoff'
  pickup_location: string
  pickup_time: string
  dropoff_location?: string
  payment_method?: 'cash' | 'card' | 'zelle'
  notes?: string
  coordinates?: {
    plat: number // pickup latitude
    plon: number // pickup longitude
    dlat: number // dropoff latitude
    dlon: number // dropoff longitude
  }
  airport_service?: 'to_airport' | 'from_airport'
  hours?: number
}

export async function approveBooking(
  bookingId: number,
  isApproved: boolean,
  paymentMethod: 'cash' | 'card' | 'zelle'
) {
  const { data } = await http.patch<StandardResponse<BookingResponse>>(
    `/v1/bookings/${bookingId}`,
    {
      is_approved: isApproved,
      payment_method: paymentMethod,
    }
  )
  return data
} 