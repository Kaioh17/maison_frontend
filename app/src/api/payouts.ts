import { http } from './http'
import type { StandardResponse } from './tenant'

export type PayoutStatus = 'pending' | 'paid' | 'disputed' | 'verified'

/** One completed ride's pay line. Net movement for the ride is `amount + adjustment`. */
export type PayoutRow = {
  booking_id: number
  payout_id: number
  driver_id: number
  driver_name: string
  pickup_time: string
  fare: number
  payment_method: string | null
  /** Driver's share, frozen when the ride was completed. */
  earning: number
  /** + operator owes driver, - driver owes operator (cash held). */
  amount: number
  adjustment: number
  status: PayoutStatus
  status_by_role: 'tenant' | 'driver' | null
  status_on: string | null
  note: string | null
}

export type PayoutsResponse = {
  /** False until the operator has set a driver pay rule. */
  configured: boolean
  rows: PayoutRow[]
}

export type PayoutUpdate = { status?: PayoutStatus; adjustment?: number; note?: string }

export async function getTenantPayouts() {
  const { data } = await http.get<StandardResponse<PayoutsResponse>>('/v1/tenant/payouts')
  return data.data
}

export async function updateTenantPayout(id: number, body: PayoutUpdate) {
  const { data } = await http.patch<StandardResponse<{ payout_id: number; status: PayoutStatus }>>(`/v1/tenant/payouts/${id}`, body)
  return data
}

export async function bulkUpdateTenantPayouts(payoutIds: number[], status: PayoutStatus, note?: string) {
  const { data } = await http.post<StandardResponse<{ updated: number }>>('/v1/tenant/payouts/bulk', { payout_ids: payoutIds, status, note })
  return data
}

export async function getDriverPayouts() {
  const { data } = await http.get<StandardResponse<PayoutsResponse>>('/v1/driver/payouts')
  return data.data
}

export async function updateDriverPayout(id: number, body: Pick<PayoutUpdate, 'status' | 'note'>) {
  const { data } = await http.patch<StandardResponse<{ payout_id: number; status: PayoutStatus }>>(`/v1/driver/payouts/${id}`, body)
  return data
}
