import { http } from './http'

export type StandardResponse<T> = {
  data: T
  message?: string
  meta?: Record<string, unknown> | null
  success?: boolean
  error?: string | null
}

export async function getTenantInfo() {
  const { data } = await http.get<StandardResponse<TenantResponse>>('/v1/tenant/')
  return data
}

export async function getTenantBySlug(slug: string) {
  const { data } = await http.get<StandardResponse<SlugVerificationResponse>>(`/v1/slug/${slug}`)
  return data
}

export type TenantSettings = {
  slug: string
  enable_branding: boolean
  logo_url?: string | null
  rider_tiers_enabled: boolean
  per_minute_rate: number
  per_mile_rate: number
  per_hour_rate: number
  cancellation_fee: number
}

export type TenantProfileBasic = {
  company_name: string
}

export type TenantSettingsResponse = {
  rider_tiers_enabled: boolean
  config: {
    booking: {
      show_vehicle_images: boolean
      allow_guest_bookings: boolean
    }
    branding: {
      font_family: string
      button_radius: number
    }
    features: {
      vip_profiles: boolean
      show_loyalty_banner: boolean
    }
  }
}

export type TenantBranding = {
  theme: string
  primary_color: string
  secondary_color: string
  accent_color: string
  favicon_url: string | null
  slug: string
  email_from_name: string | null
  email_from_address: string | null
  logo_url: string | null
  enable_branding: boolean
}

export type SlugVerificationResponse = {
  settings: TenantSettingsResponse
  profile: TenantProfileBasic
  branding: TenantBranding
}

export async function verifySlug(slug: string) {
  const { data } = await http.get<StandardResponse<SlugVerificationResponse>>(`/v1/slug/${slug}`)
  return data
}

export async function createTenant(payload: TenantCreate) {
  const formData = new FormData()
  
  // Add all text fields
  formData.append('email', payload.email)
  formData.append('first_name', payload.first_name)
  formData.append('last_name', payload.last_name)
  formData.append('password', payload.password)
  formData.append('phone_no', payload.phone_no)
  formData.append('company_name', payload.company_name)
  formData.append('slug', payload.slug)
  formData.append('city', payload.city)
  
  if (payload.address) {
    formData.append('address', payload.address)
  }
  
  if (payload.drivers_count !== undefined) {
    formData.append('drivers_count', payload.drivers_count.toString())
  }
  
  // Add logo file if provided
  if (payload.logo_url instanceof File) {
    formData.append('logo_url', payload.logo_url)
  }
  
  const { data } = await http.post<StandardResponse<TenantResponse>>('/v1/tenant/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function getTenantDrivers(driverId?: number) {
  const params = driverId ? { driver_id: driverId } : undefined
  const { data } = await http.get<StandardResponse<DriverResponse[] | DriverDetailResponse[]>>('/v1/tenant/drivers', { params })
  return data
}

export async function getTenantVehicles(params?: { driver_id?: number; vehicle_id?: number }) {
  const { data } = await http.get<StandardResponse<VehicleResponse[]>>('/v1/vehicles', { params })
  return data
}

export async function getTenantBookings(params?: { 
  booking_status?: string
  service_type?: string
  vehicle_id?: number
}) {
  const { data } = await http.get<StandardResponse<BookingResponse[]>>('/v1/tenant/bookings', { params })
  return data
}

export async function getTenantBookingById(bookingId: number) {
  const { data } = await http.get<StandardResponse<BookingResponse[]>>('/v1/tenant/bookings', { params: { booking_id: bookingId } })
  return data
}

export async function onboardDriver(payload: OnboardDriver) {
  const { data } = await http.post<StandardResponse<OnboardDriverResponse>>('/v1/tenant/onboard', payload)
  return data
}

export async function assignDriverToRide(riderId: number, payload: AssignDriver) {
  const { data } = await http.patch(`/v1/tenant/riders/${riderId}/assign-driver`, payload)
  return data
}

export async function assignDriverToVehicle(vehicleId: number, payload: AssignDriver) {
  const { data } = await http.patch(`/v1/tenant/vehicles/${vehicleId}/assign-driver`, payload)
  return data
}

export async function assignDriverToVehicleNew(vehicleId: number, driverId: number) {
  const { data } = await http.patch(`/v1/tenant/vehicles/${vehicleId}/assign/${driverId}`)
  return data
}

export async function unassignDriverFromVehicle(vehicleId: number, override: boolean) {
  const { data } = await http.patch(`/v1/tenant/vehicles/${vehicleId}/unassign/driver`, {}, {
    params: { override: override }
  })
  return data
}

export async function assignDriverToBooking(bookingId: number, payload: { driver_id: number; override: boolean }) {
  const { data } = await http.patch(`/v1/tenant/bookings/${bookingId}/assign-driver`, payload)
  return data
}

// Types aligned to backend
export type TenantCreate = {
  email: string
  first_name: string
  last_name: string
  password: string
  phone_no: string
  company_name: string
  logo_url?: File | null
  slug: string
  address?: string | null
  city: string
  drivers_count?: number
}
export type TenantProfile = {
  tenant_id: number
  company_name: string
  logo_url?: string | null
  slug: string
  address?: string | null
  city: string
  role: string
  stripe_customer_id?: string | null
  stripe_account_id?: string | null
  subscription_status?: string | null
  subscription_plan?: string | null
  created_on: string
  updated_on?: string | null
  company: string
}

export type TenantStats = {
  tenant_id: number
  drivers_count: number
  daily_ride_count: number
  last_ride_count_reset?: string | null
  total_ride_count: number
  created_on: string
  updated_on?: string | null
}

export type TenantResponse = {
  id: number
  email: string
  first_name: string
  last_name: string
  password?: string
  phone_no: string
  created_on: string
  updated_on?: string | null
  full_name: string
  profile: TenantProfile
  stats: TenantStats
  is_verified?: boolean
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
  is_registered: string
  status?: string | null
  created_on: string
  updated_on?: string | null
}

export type DriverDetailResponse = {
  id: number
  email: string
  phone_no: string
  first_name: string
  last_name: string
  state?: string | null
  postal_code?: string | null
  license_number?: string | null
  role: string
  driver_type: string
  completed_rides: number
  is_active: boolean
  is_registered: string
  status?: string | null
  created_on: string
  updated_on?: string | null
  vehicle?: {
    id: number
    tenant_id: number
    make: string
    model: string
    year?: number | null
    license_plate?: string | null
    color?: string | null
    status?: string | null
    seating_capacity?: number | null
    vehicle_category_id?: number | null
    vehicle_images?: Record<string, unknown> | null
    created_on: string
    updated_on?: string | null
  } | null
}

export type VehicleDriverInfo = {
  id: number
  role: string
  full_name: string
  driver_type: string
  completed_rides: number
  is_active: boolean
  is_registered: string
  status?: string | null
  phone_no?: string | null
  created_on: string
  updated_on?: string | null
}

export type VehicleResponse = {
  id: number
  tenant_id: number
  make: string
  model: string
  year?: number
  license_plate?: string
  color?: string
  status?: string
  seating_capacity: number
  vehicle_category_id?: number
  driver?: VehicleDriverInfo | null
  vehicle_images?: Record<string, string> | null
  created_on: string
  updated_on?: string | null
  // Legacy support for old API response format
  vehicle_config?: {
    vehicle_category: string
    vehicle_flat_rate: number
    seating_capacity: number
  }
  // Legacy fields for backward compatibility
  driver_id?: number | null
  driver_type?: string | null
  driver_name?: string | null
}

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
}

export type OnboardDriver = {
  first_name: string
  last_name: string
  email: string
  driver_type: 'outsourced' | 'in_house'
}
export type OnboardDriverResponse = OnboardDriver & {
  id: number
  driver_token: string
  created_on: string
}

export type AssignDriver = { driver_id: number } 