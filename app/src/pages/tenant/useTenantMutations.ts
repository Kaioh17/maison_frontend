import { useMutation, useQueryClient } from '@tanstack/react-query'
import { onboardDriver, approveDriver, assignDriverToBooking, unassignDriverFromVehicle, assignDriverToVehicleNew, type DriverResponse, type VehicleDriverInfo, type VehicleResponse, type BookingResponse, type OnboardDriver } from '@api/tenant'
import { deleteVehicle } from '@api/vehicles'

const DRIVERS = ['tenant', 'drivers'] as const
const VEHICLES = ['tenant', 'vehicles'] as const
const BOOKINGS = ['tenant', 'bookings'] as const

/** Optimistic dashboard mutations: update the cache immediately, roll back on error, refetch when settled. */
export function useTenantMutations() {
  const queryClient = useQueryClient()

  /** Optimistically replace the vehicles list, returning the snapshot to roll back to. */
  const optimisticVehicles = async (update: (old: VehicleResponse[]) => VehicleResponse[]) => {
    await queryClient.cancelQueries({ queryKey: VEHICLES })
    const prev = queryClient.getQueryData<VehicleResponse[]>(VEHICLES)
    queryClient.setQueryData(VEHICLES, (old: VehicleResponse[] = []) => update(old))
    return { prev }
  }
  const rollbackVehicles = (_e: unknown, _v: unknown, ctx?: { prev?: VehicleResponse[] }) => {
    if (ctx?.prev) queryClient.setQueryData(VEHICLES, ctx.prev)
  }
  const refetch = (key: readonly string[]) => () => queryClient.invalidateQueries({ queryKey: key })

  const createDriver = useMutation({
    mutationFn: (driver: OnboardDriver) => onboardDriver(driver),
    onMutate: async (newD) => {
      await queryClient.cancelQueries({ queryKey: DRIVERS })
      const prev = queryClient.getQueryData<DriverResponse[]>(DRIVERS)
      queryClient.setQueryData(DRIVERS, (old: DriverResponse[] = []) => [
        ...old,
        { id: -Date.now(), first_name: newD.first_name, last_name: newD.last_name, email: newD.email ?? '', is_active: true, driver_type: newD.driver_type, phone: null, vehicle: null } as unknown as DriverResponse,
      ])
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(DRIVERS, ctx.prev) },
    onSettled: refetch(DRIVERS),
  })

  // Approving sends the pending driver their registration email.
  const approveDriverMut = useMutation({
    mutationFn: (driverId: number) => approveDriver(driverId),
    onSettled: refetch(DRIVERS),
  })

  const deleteVehicleMut = useMutation({
    mutationFn: (vehicleId: number) => deleteVehicle(vehicleId),
    onMutate: (vehicleId) => optimisticVehicles(old => old.filter(v => v.id !== vehicleId)),
    onError: rollbackVehicles,
    onSettled: refetch(VEHICLES),
  })

  const assignDriverToBookingMut = useMutation({
    mutationFn: ({ bookingId, driverId, override }: { bookingId: number; driverId: number; override: boolean }) =>
      assignDriverToBooking(bookingId, { driver_id: driverId, override }),
    onMutate: async ({ bookingId, driverId }) => {
      await queryClient.cancelQueries({ queryKey: BOOKINGS })
      const snapshots: Array<[unknown, BookingResponse[] | undefined]> = []
      const driverInfo = queryClient.getQueryData<DriverResponse[]>(DRIVERS)?.find(d => d.id === driverId)
      const driverName = driverInfo ? `${driverInfo.first_name} ${driverInfo.last_name}` : undefined
      // Every filter combination of the bookings list is cached separately.
      queryClient.getQueriesData<BookingResponse[]>({ queryKey: BOOKINGS }).forEach(([key, data]) => {
        snapshots.push([key, data])
        if (data) {
          queryClient.setQueryData(key, data.map(b => b.id === bookingId ? { ...b, driver_name: driverName ?? b.driver_name, driver_id: driverId } : b))
        }
      })
      return { snapshots }
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => { if (data) queryClient.setQueryData(key as readonly unknown[], data) })
    },
    onSettled: refetch(BOOKINGS),
  })

  const assignDriverToVehicleMut = useMutation({
    mutationFn: ({ vehicleId, driverId }: { vehicleId: number; driverId: number }) =>
      assignDriverToVehicleNew(vehicleId, driverId),
    onMutate: ({ vehicleId, driverId }) => {
      const d = queryClient.getQueryData<DriverResponse[]>(DRIVERS)?.find(x => x.id === driverId)
      const driver: VehicleDriverInfo | undefined = d && { ...d, full_name: `${d.first_name} ${d.last_name}` }
      return optimisticVehicles(old => old.map(v => v.id === vehicleId ? { ...v, driver_id: driverId, driver: driver ?? v.driver } : v))
    },
    onError: rollbackVehicles,
    onSettled: refetch(VEHICLES),
  })

  const unassignDriverMut = useMutation({
    mutationFn: ({ vehicleId, override }: { vehicleId: number; override: boolean }) =>
      unassignDriverFromVehicle(vehicleId, override),
    onMutate: ({ vehicleId }) => optimisticVehicles(old => old.map(v => v.id === vehicleId ? { ...v, driver_id: null, driver: null } : v)),
    onError: rollbackVehicles,
    onSettled: refetch(VEHICLES),
  })

  return { createDriver, approveDriverMut, deleteVehicleMut, assignDriverToBookingMut, assignDriverToVehicleMut, unassignDriverMut }
}
