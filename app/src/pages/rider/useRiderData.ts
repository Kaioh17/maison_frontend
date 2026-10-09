import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getVehicles } from '@api/vehicles'
import { getUserInfo } from '@api/user'
import { useAuthStore } from '@store/auth'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useNotice } from '@hooks/useNotice'
import { EMPTY_FORM, type BookingForm } from './bookingForm'

/**
 * Rider state shared by every tab, owned by `RiderShell` and handed down through outlet context
 * (same pattern as `DriverShell`). The booking form lives here so a half-filled request survives a
 * trip to the Fleet tab. Query keys carry the user id: the cache is never cleared on logout, so
 * without it a second rider on the same browser would briefly see the first one's trips.
 */
export function useRiderState() {
  const userId = useAuthStore(s => s.userId)
  const qc = useQueryClient()
  const { tenantInfo } = useTenantInfo()
  const [notice, notify] = useNotice()
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM)

  const meQuery = useQuery({
    queryKey: ['rider', userId, 'me'],
    queryFn: () => getUserInfo().then(r => r.data ?? null),
  })
  const vehiclesQuery = useQuery({
    queryKey: ['rider', userId, 'vehicles'],
    queryFn: () => getVehicles().then(r => r.data ?? []),
  })

  /** Bookings or the profile changed on the server: refetch everything the rider can see. */
  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: ['rider', userId] }), [qc, userId])

  return {
    userId,
    tenantInfo,
    me: meQuery.data ?? null,
    meLoading: meQuery.isLoading,
    vehicles: vehiclesQuery.data ?? [],
    vehiclesLoading: vehiclesQuery.isLoading,
    notice,
    notify,
    form,
    setForm,
    resetForm: () => setForm(EMPTY_FORM),
    refresh,
  }
}

export type RiderShellCtx = ReturnType<typeof useRiderState>
