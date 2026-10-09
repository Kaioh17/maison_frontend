import { useQuery } from '@tanstack/react-query'
import { getTenantInfo, getTenantDrivers, getTenantVehicles, getTenantBookings, getTenantRiderEmails, getTenantAnalysis } from '@api/tenant'
import { getVehicleCategoriesByTenant } from '@api/vehicles'
import { getTenantConfig } from '@api/tenantSettings'
import { useAuthStore } from '@store/auth'

/** Dashboard server data. Every hook shares one TanStack cache entry, so tabs call these directly instead of receiving data from the shell. */

/** Stable fallback so `data ?? EMPTY_LIST` does not change identity (and re-run memos) on every render. */
export const EMPTY_LIST: never[] = []

export type BookingFilters = { bookingStatusFilter: string; serviceTypeFilter: string; vehicleIdFilter: number | null }

export const NO_BOOKING_FILTERS: BookingFilters = { bookingStatusFilter: '', serviceTypeFilter: '', vehicleIdFilter: null }

export const useOperatorInfo = () =>
  useQuery({ queryKey: ['tenant', 'info'], queryFn: () => getTenantInfo().then(r => r.data ?? null) })

export const useTenantDrivers = () =>
  useQuery({
    queryKey: ['tenant', 'drivers'],
    queryFn: () => getTenantDrivers().then(r => r.data ?? EMPTY_LIST),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

export const useTenantVehicles = () =>
  useQuery({ queryKey: ['tenant', 'vehicles'], queryFn: () => getTenantVehicles().then(r => r.data ?? EMPTY_LIST) })

export const useTenantRiders = () =>
  useQuery({
    queryKey: ['tenant', 'riders'],
    queryFn: () => getTenantRiderEmails().then(r => r.data ?? EMPTY_LIST),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

export const bookingsQueryKey = (f: BookingFilters) => ['tenant', 'bookings', f] as const

export const useTenantBookings = (f: BookingFilters) =>
  useQuery({
    queryKey: bookingsQueryKey(f),
    queryFn: () => {
      const params: { booking_status?: string; service_type?: string; vehicle_id?: number } = {}
      if (f.bookingStatusFilter) params.booking_status = f.bookingStatusFilter
      if (f.serviceTypeFilter) params.service_type = f.serviceTypeFilter
      if (f.vehicleIdFilter) params.vehicle_id = f.vehicleIdFilter
      return getTenantBookings(Object.keys(params).length > 0 ? params : undefined).then(r => r.data ?? EMPTY_LIST)
    },
  })

export const useTenantConfigQuery = () =>
  useQuery({ queryKey: ['tenant', 'config'], queryFn: () => getTenantConfig('all') })

export const useTenantAnalysis = () =>
  useQuery({
    queryKey: ['tenant', 'analysis'],
    queryFn: () => getTenantAnalysis().then(r => r.success && r.data ? r.data : null),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })

export const vehicleCategoriesQueryKey = (tenantId: number) => ['tenant', 'vehicleCategories', tenantId] as const

export function useVehicleCategories() {
  const tenantId = Number(useAuthStore((s) => s.tenantId))
  return useQuery({
    queryKey: vehicleCategoriesQueryKey(tenantId),
    queryFn: () => getVehicleCategoriesByTenant(tenantId).then(r => r.data ?? EMPTY_LIST),
    enabled: Number.isFinite(tenantId) && tenantId > 0,
  })
}
