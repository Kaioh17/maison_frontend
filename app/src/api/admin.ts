import { http } from './http'
import type { StandardResponse } from './tenant'

/** `/v1/admin/tenants` — one row per tenant user account */
export type AdminTenantRow = {
  created_on: string
  email: string
  first_name: string
  full_name: string
  id: number
  last_name: string
  phone_no: string
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
