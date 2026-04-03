import { http } from './http'
import type { StandardResponse } from './tenant'

export type AdminTenantRow = {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_no: string
  created_on: string
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
