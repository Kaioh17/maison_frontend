import { http } from './http'

export type StandardResponse<T> = {
  success: boolean
  message?: string
  meta?: Record<string, unknown> | null
  data: T
  error?: string | null
}

export type ConfigType = 'branding' | 'pricing' | 'setting' | 'all'

// Settings Config nested structure
export type SettingsConfig = {
  booking: {
    allow_guest_bookings: boolean
    show_vehicle_images: boolean
    types: Record<string, { is_deposit_required: boolean }>
  }
  branding: {
    button_radius: number
    font_family: string
  }
  features: {
    vip_profiles: boolean
    show_loyalty_banner: boolean
  }
}

// Settings data structure
export type TenantSettingsData = {
  rider_tiers_enabled: boolean
  config: SettingsConfig
}

// Pricing data structure
export type TenantPricingData = {
  base_fare: number
  per_mile_rate: number
  per_minute_rate: number
  per_hour_rate: number
  cancellation_fee: number
  discounts: boolean
}

// Branding data structure
export type TenantBrandingData = {
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

// Full config response when config_type is 'all'
export type TenantConfigResponse = {
  settings?: TenantSettingsData
  pricing?: TenantPricingData
  branding?: TenantBrandingData
}

// Update payload types
export type UpdateTenantSettingsPayload = {
  rider_tiers_enabled?: boolean
  config?: SettingsConfig
}

export type UpdateTenantPricingPayload = {
  base_fare?: number
  per_mile_rate?: number
  per_minute_rate?: number
  per_hour_rate?: number
  cancellation_fee?: number
  discounts?: boolean
}

export type UpdateTenantBrandingPayload = {
  theme?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  favicon_url?: string | null
  slug?: string
  email_from_name?: string | null
  email_from_address?: string | null
  logo_url?: string | null
  enable_branding?: boolean
}

// Get tenant config by type
export async function getTenantConfig(config_type: ConfigType = 'all') {
  const { data } = await http.get<StandardResponse<TenantConfigResponse>>(`/v1/tenant/config/${config_type}`)
  return data.data
}

// Legacy function for backward compatibility - fetches all config
export async function getTenantSettings() {
  return getTenantConfig('all')
}

// Update tenant settings
export async function updateTenantSettings(payload: UpdateTenantSettingsPayload) {
  const { data } = await http.patch<StandardResponse<TenantSettingsData>>('/v1/tenant/config/settings', payload)
  return data.data
}

// Update tenant pricing
export async function updateTenantPricing(payload: UpdateTenantPricingPayload) {
  const { data } = await http.patch<StandardResponse<TenantPricingData>>('/v1/tenant/config/pricing', payload)
  return data.data
}

// Update tenant branding
export async function updateTenantBranding(payload: UpdateTenantBrandingPayload) {
  const { data } = await http.patch<StandardResponse<TenantBrandingData>>('/v1/tenant/config/branding', payload)
  return data.data
}

// Update tenant logo and/or favicon
export async function updateTenantLogo(logoFile?: File, faviconFile?: File) {
  try {
    const formData = new FormData()
    if (logoFile) {
      formData.append('logo_url', logoFile)
    }
    if (faviconFile) {
      formData.append('favicon_url', faviconFile)
    }
    
    // Don't set Content-Type header - let axios set it automatically with boundary
    const response = await http.patch('/v1/tenant/config/logo', formData)
    
    // Return the response data directly
    return response.data
  } catch (error: any) {
    console.error('Logo/Favicon update failed:', error)
    throw error
  }
}

// Legacy function for backward compatibility
export async function updateTenantLogoOnly(logoFile: File) {
  return updateTenantLogo(logoFile)
}

// Test logo endpoint (legacy - may need to be updated)
export async function testLogoEndpoint() {
  try {
    const response = await http.get('/v1/tenant/config/logo')
    return response
  } catch (error) {
    console.error('Logo endpoint test failed:', error)
    throw error
  }
}

// Stripe setup response
export type StripeSetupResponse = {
  onboarding_link: string
}

// Setup Stripe Express Account
export async function setupStripeAccount() {
  const { data } = await http.post<StandardResponse<StripeSetupResponse>>('/v1/tenant/stripe')
  return data.data
}

// Stripe login link response
export type StripeLoginLinkResponse = {
  login_link: string
}

// Get Stripe login link
export async function getStripeLoginLink() {
  const { data } = await http.get<StandardResponse<StripeLoginLinkResponse>>('/v1/tenant/stripe/link')
  return data
}

// Booking config data structure
export type BookingConfig = {
  deposit_fee: number
  deposit_type: 'percentage' | 'flat'
  service_type: 'airport' | 'hourly' | 'dropoff'
  updated_on: string | null
}

// Update booking config payload
export type UpdateBookingConfigPayload = {
  deposit_fee: number
  deposit_type: 'percentage' | 'flat'
}

// Get booking config response structure
export type BookingConfigResponse = {
  settings: null
  pricing: null
  branding: null
  booking: BookingConfig[]
}

// Get booking config
export async function getBookingConfig() {
  const { data } = await http.get<StandardResponse<BookingConfigResponse>>('/v1/tenant/config/booking')
  return data.data?.booking || []
}

// Update booking config for a specific service type
export async function updateBookingConfig(service_type: 'airport' | 'hourly' | 'dropoff', payload: UpdateBookingConfigPayload) {
  const { data } = await http.patch<StandardResponse<BookingConfig>>(`/v1/tenant/config/booking/${service_type}`, payload)
  return data.data
}

// Legacy types for backward compatibility
export type TenantSettingsResponse = TenantConfigResponse
export type UpdateTenantSetting = UpdateTenantSettingsPayload & UpdateTenantPricingPayload & UpdateTenantBrandingPayload
