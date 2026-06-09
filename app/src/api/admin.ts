import { http } from './http'
import type { StandardResponse } from './tenant'

/** `/v1/admin/tenants` — one row per tenant user account */
export type AdminTenantRow = {
  created_on: string
  email: string
  first_name: string
  full_name: string
  id: number
  is_verified?: boolean
  last_name: string
  phone_no: string
}

/** `/v1/admin/tenants/:id` — one tenant fully expanded across every related model. */
export type AdminTenantDetail = {
  account: {
    id: number
    email: string
    first_name: string
    last_name: string
    full_name?: string | null
    phone_no: string
    role: string
    is_verified: boolean
    is_active: boolean
    created_on: string
    updated_on?: string | null
  }
  profile?: Record<string, unknown> | null
  stats?: Record<string, unknown> | null
  settings?: Record<string, unknown> | null
  branding?: Record<string, unknown> | null
  pricing?: Record<string, unknown> | null
  booking_pricing: Record<string, unknown>[]
  drivers: Record<string, unknown>[]
  riders: Record<string, unknown>[]
  vehicles: Record<string, unknown>[]
  bookings: Record<string, unknown>[]
  payouts: Record<string, unknown>[]
  transactions: Record<string, unknown>[]
  counts: {
    drivers: number
    riders: number
    vehicles: number
    bookings: number
    booking_pricing: number
    payouts: number
    transactions: number
  }
}

export type CreateAdminAccountBody = {
  email: string
  first_name: string
  last_name: string
  password: string
}

export type CreateAdminAccountData = {
  email: string
  first_name: string
  last_name: string
}

/** POST `/v1/admin/` — requires `X-API-Key` (bootstrap; not JWT). */
export async function createAdminAccount(body: CreateAdminAccountBody) {
  const { data } = await http.post<StandardResponse<CreateAdminAccountData>>(
    '/v1/admin/',
    body,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
  return data
}

export async function listAdminTenants() {
  const { data } = await http.get<StandardResponse<AdminTenantRow[]>>('/v1/admin/tenants', {
    headers: {
      Accept: 'application/json',
    },
  })
  return data
}

export async function getAdminTenantDetail(tenantId: number) {
  const { data } = await http.get<StandardResponse<AdminTenantDetail>>(
    `/v1/admin/tenants/${tenantId}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )
  return data
}

export async function sendStripeCompletionReminder(tenantId: number) {
  const { data } = await http.post<StandardResponse<{ tenant_id: number; email: string }>>(
    `/v1/admin/tenants/${tenantId}/stripe-reminder`,
    null,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )
  return data
}

export async function deleteAdminTenant(tenantId: number) {
  const { data } = await http.delete<StandardResponse<unknown>>(
    `/v1/admin/delete/${tenantId}/tenant`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  )
  return data
}

export async function forceVerifyTenant(tenantId: number, permission: boolean) {
  const { data } = await http.patch<StandardResponse<unknown>>(
    '/v1/admin/force/verify',
    null,
    {
      params: {
        tenant_id: tenantId,
        permission,
      },
      headers: {
        Accept: 'application/json',
      },
    }
  )
  return data
}
