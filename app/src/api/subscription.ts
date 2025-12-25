import { http } from './http'

export type StandardResponse<T> = {
  success: boolean
  message?: string
  meta?: Record<string, unknown>
  data: T
  error?: string
}

export type CreateCheckoutSessionRequest = {
  price_id: string
  product_type: string
}

export type CheckoutSessionResponse = {
  Checkout_session_url: string
  tenant_id: number
  customer_id: string
  product_type: string
  sub_total: number
}

export async function createCheckoutSession(payload: CreateCheckoutSessionRequest) {
  const { data } = await http.post<StandardResponse<CheckoutSessionResponse>>('/v1/subscription/', payload)
  return data
}

export async function upgradeSubscription(payload: CreateCheckoutSessionRequest) {
  const { data } = await http.patch<StandardResponse<CheckoutSessionResponse>>('/v1/subscription/', payload)
  return data
}

