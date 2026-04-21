import { http } from './http'
import type { StandardResponse } from './tenant'

export interface UserCreate {
  email: string
  first_name: string
  last_name: string
  phone_no: string
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
  password: string
}

export interface UserResponse {
  email: string
  first_name: string
  last_name: string
  phone_no: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  id: number
  role: string
  tier: string
  created_on: string
  updated_on: string
}

export async function createUser(slug: string, payload: UserCreate) {
  const { data } = await http.post<StandardResponse<UserResponse>>(`/v1/users/add/${slug}`, payload)
  return data
}

export async function getUserInfo() {
  const { data } = await http.get<StandardResponse<UserResponse>>('/v1/users/')
  return data
}
