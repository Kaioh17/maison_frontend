import { http } from './http'
import type { StandardResponse } from './tenant'

export async function getVehicles() {
  const { data } = await http.get<StandardResponse<VehicleResponse[]>>('/v1/vehicles')
  return data
}

export async function getVehicleById(vehicleId: number) {
  const { data } = await http.get<StandardResponse<VehicleResponse[]>>('/v1/vehicles', { params: { vehicle_id: vehicleId } })
  // API returns an array, extract the first item
  if (data.success && data.data && data.data.length > 0) {
    return {
      ...data,
      data: data.data[0]
    } as StandardResponse<VehicleResponse>
  }
  return {
    success: false,
    message: 'Vehicle not found',
    data: null as any
  } as StandardResponse<VehicleResponse>
}

export async function addVehicle(payload: VehicleCreate) {
  const { data } = await http.post<StandardResponse<VehicleResponse>>('/v1/vehicles/add', payload)
  return data
}

export async function updateVehicleImage(
  vehicleId: number, 
  imageFiles: File[], 
  imageTypes: string[]
) {
  const formData = new FormData()
  
  // Append image types array
  imageTypes.forEach((type) => {
    formData.append('image_type', type)
  })
  
  // Append image files
  imageFiles.forEach((file) => {
    formData.append('vehicle_image', file)
  })
  
  const { data } = await http.patch<StandardResponse<Record<string, unknown>>>(
    `/v1/vehicles/add/image/${vehicleId}`, 
    formData, 
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return data
}

export async function setVehicleRates(payload: VehicleRate) {
  const { data } = await http.patch<StandardResponse<VehicleCategoryRateResponse>>('/v1/vehicles/set_rates', payload)
  return data
}

export async function getVehicleRates() {
  const { data } = await http.get<StandardResponse<VehicleCategoryRateResponse[]>>('/v1/vehicles/vehicle_rates')
  return data
}

export async function getVehicleCategories() {
  const { data } = await http.get<StandardResponse<VehicleCategoryResponse[]>>('/v1/vehicles/category')
  return data
}

export async function createVehicleCategory(payload: VehicleCategoryCreate) {
  const { data } = await http.post<StandardResponse<VehicleCategoryResponse>>('/v1/vehicles/create_category', payload)
  return data
}

export async function getVehicleImageTypes() {
  const { data } = await http.get<StandardResponse<{ allowed_image_types: string[] }>>('/v1/vehicles/image/types')
  return data
}

export async function deleteVehicle(vehicleId: number) {
  const { data } = await http.delete<StandardResponse<Record<string, unknown>>>(`/v1/vehicles/${vehicleId}`, {
    params: { approve_delete: true }
  })
  return data
}

export type VehicleCreate = {
  make: string
  model: string
  year?: number
  license_plate?: string
  color?: string
  status?: string
  vehicle_category: string
  vehicle_flat_rate: number
  seating_capacity: number
}

export type VehicleResponse = {
  tenant_id: number
  id: number
  make: string
  model: string
  year?: number
  license_plate?: string
  color?: string
  status?: string
  seating_capacity: number
  vehicle_category_id: number
  created_on: string
  updated_on?: string | null
  vehicle_images?: Record<string, string> | null
}

export type VehicleRate = {
  vehicle_category: string
  vehicle_flat_rate: number
}

export type VehicleCategoryRateResponse = {
  id: number
  tenant_id: number
  vehicle_category: string
  vehicle_flat_rate: number
  created_on: string
  updated_on?: string | null
}

export type VehicleCategoryRateCreate = VehicleRate 

export type VehicleCategoryCreate = {
  vehicle_category: string
  vehicle_flat_rate: number
  seating_capacity: number
}

export type VehicleCategoryResponse = {
  id: number
  tenant_id: number
  vehicle_category: string
  vehicle_flat_rate: number
  created_on: string
  updated_on?: string | null
  allowed_image_types?: string[]
} 