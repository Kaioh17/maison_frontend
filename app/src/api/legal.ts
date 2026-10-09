import { http } from './http'

export type LegalStatus = {
  current_version: string
  accepted: boolean
  pilot_ends_at: string | null
  days_left: number | null
  expired: boolean
  contact_email: string
}

export const getLegalStatus = async () => (await http.get<LegalStatus>('/v1/legal/status')).data
export const acceptLegal = async (version: string) => (await http.post<LegalStatus>('/v1/legal/accept', { version })).data
