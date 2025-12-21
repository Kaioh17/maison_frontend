import { http } from './http'

export type StandardResponse<T> = {
  success: boolean
  message?: string
  meta?: Record<string, unknown>
  data: T
}

export async function getTenantSettings() {
  const { data } = await http.get<StandardResponse<TenantSettingsResponse>>('/v1/tenant_setting/')
  return data.data
}

export async function updateTenantSettings(payload: UpdateTenantSetting) {
  // Build JSON payload - logo_url is handled separately via /logo endpoint
  const jsonPayload = {
    theme: payload.theme,
    slug: payload.slug,
    enable_branding: payload.enable_branding,
    base_fare: payload.base_fare,
    per_minute_rate: payload.per_minute_rate,
    per_mile_rate: payload.per_mile_rate,
    per_hour_rate: payload.per_hour_rate,
    rider_tiers_enabled: payload.rider_tiers_enabled,
    cancellation_fee: payload.cancellation_fee,
    discounts: payload.discounts,
  }
  
  const { data } = await http.patch<StandardResponse<TenantSettingsResponse>>('/v1/tenant_setting/', jsonPayload)
  return data.data
}

export async function updateTenantLogo(logoFile: File) {
  try {
    const formData = new FormData()
    formData.append('logo_url', logoFile)
    
    // Don't set Content-Type header - let axios set it automatically with boundary
    const response = await http.patch('/v1/tenant_setting/logo', formData)
    
    // Return the response data directly, don't assume it's TenantSettingsResponse
    return response.data
  } catch (error: any) {
    console.error('Logo update failed:', error)
    throw error
  }
}

export async function updateTenantLogoOnly(logoFile: File) {
  try {
    const formData = new FormData()
    formData.append('logo_url', logoFile)
    
    // Don't set Content-Type header - let axios set it automatically with boundary
    const response = await http.patch('/v1/tenant_setting/logo', formData)
    
    // Return the response data directly, don't assume it's TenantSettingsResponse
    return response.data
  } catch (error: any) {
    console.error('Logo update failed:', error)
    throw error
  }
}

export async function testLogoEndpoint() {
  try {
    const response = await http.get('/v1/tenant_setting/logo')
    return response
  } catch (error) {
    console.error('Logo endpoint test failed:', error)
    throw error
  }
}

export type TenantSettingsResponse = {
  id: number
  tenant_id: number
  theme: string
  logo_url: string
  slug: string
  enable_branding: boolean
  base_fare: number
  per_minute_rate: number
  per_mile_rate: number
  per_hour_rate: number
  rider_tiers_enabled: boolean
  cancellation_fee: number
  discounts: boolean
  created_on: string
  updated_on?: string | null
}

export type UpdateTenantSetting = {
  theme: string
  slug: string
  enable_branding: boolean
  base_fare: number
  per_minute_rate: number
  per_mile_rate: number
  per_hour_rate: number
  rider_tiers_enabled: boolean
  cancellation_fee: number
  discounts: boolean
} 