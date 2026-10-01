import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAvailableRides, getBookingAnalytics, getDriverInfo, respondToRide, updateDriverStatus, type DriverResponse } from '@api/driver'
import { useAuthStore } from '@store/auth'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useNotice } from '@hooks/useNotice'
import { getApiErrorMessage } from '@utils/apiError'
import { byPickup } from './rideHelpers'

export type RideAction = 'confirmed' | 'cancelled' | 'completed'

const DONE_TEXT: Record<RideAction, string> = {
  confirmed: 'Ride accepted',
  cancelled: 'Ride declined',
  completed: 'Ride completed',
}

/**
 * All driver server state, owned by `DriverShell` and handed to the tabs through outlet context
 * (same pattern as `TenantShell`). Query keys carry the user id: the cache is never cleared on
 * logout, so without it a second driver on the same browser would briefly see the first one's rides.
 */
export function useDriverState() {
  const userId = useAuthStore(s => s.userId)
  const qc = useQueryClient()
  const { tenantInfo } = useTenantInfo()
  const [notice, notify] = useNotice()
  const key = (name: string, ...rest: unknown[]) => ['driver', userId, name, ...rest]

  const infoQuery = useQuery({
    queryKey: key('info'),
    queryFn: () => getDriverInfo().then(r => r.data ?? null),
  })
  // Requests are the time-sensitive list: poll, and refresh when the driver returns to the app.
  const requestsQuery = useQuery({
    queryKey: key('requests'),
    queryFn: () => getAvailableRides({ booking_status: 'pending', limit: 25 }).then(r => byPickup(r.data ?? [])),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  })
  // Confirmed rides, not "upcoming": a ride whose pickup time has passed is still in progress until completed.
  const activeQuery = useQuery({
    queryKey: key('active'),
    queryFn: () => getAvailableRides({ booking_status: 'confirmed', limit: 25 }).then(r => byPickup(r.data ?? [])),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
  const analyticsQuery = useQuery({
    queryKey: key('analytics'),
    queryFn: () => getBookingAnalytics().then(r => r.data ?? null),
  })

  const refreshRides = useCallback(
    () => qc.invalidateQueries({ queryKey: ['driver', userId] }),
    [qc, userId],
  )

  const actMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: RideAction }) => respondToRide(id, action),
    onSuccess: (res, { action }) => {
      if (!res.success) return notify({ ok: false, text: res.message || 'Could not update the ride' })
      notify({ ok: true, text: DONE_TEXT[action] })
      void refreshRides()
    },
    onError: err => notify({ ok: false, text: getApiErrorMessage(err, 'Could not update the ride') }),
  })

  const onlineMutation = useMutation({
    mutationFn: (next: boolean) => updateDriverStatus(next),
    onSuccess: (res, next) => {
      if (!res.success) return notify({ ok: false, text: res.message || 'Could not change your status' })
      qc.setQueryData<DriverResponse | null>(key('info'), prev => (prev ? { ...prev, is_active: next } : prev))
    },
    onError: err => notify({ ok: false, text: getApiErrorMessage(err, 'Could not change your status') }),
  })

  return {
    tenantInfo,
    info: infoQuery.data ?? null,
    infoLoading: infoQuery.isLoading,
    requests: requestsQuery.data ?? [],
    active: activeQuery.data ?? [],
    ridesLoading: requestsQuery.isLoading || activeQuery.isLoading,
    completedCount: analyticsQuery.data?.completed ?? infoQuery.data?.completed_rides ?? 0,
    notice,
    notify,
    userId,
    actingId: actMutation.isPending ? actMutation.variables?.id ?? null : null,
    act: (id: number, action: RideAction) => actMutation.mutate({ id, action }),
    setOnline: (next: boolean) => onlineMutation.mutate(next),
    togglingOnline: onlineMutation.isPending,
    refreshRides,
  }
}

export type DriverShellCtx = ReturnType<typeof useDriverState>
