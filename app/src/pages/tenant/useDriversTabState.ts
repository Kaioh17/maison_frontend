import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { NavigateFunction } from 'react-router-dom'
import { getTenantDrivers, setDriverActive, type DriverResponse, type DriverDetailResponse, type OnboardDriver } from '@api/tenant'
import { getApiErrorMessage, getRequestErrorMessage } from '@utils/apiError'
import { useTenantDrivers, EMPTY_LIST } from './useTenantData'
import { useTenantMutations } from './useTenantMutations'

const EMPTY_DRIVER: OnboardDriver = { first_name: '', last_name: '', email: '', driver_type: 'outsourced' }

type ShellActions = {
  navigate: NavigateFunction
  isMobile: boolean
  setIsMenuOpen: (open: boolean) => void
  setError: (message: string | null) => void
  setShowAddDriver: (open: boolean) => void
}

/** Add-driver error text keyed off the HTTP status the API answers with. */
function addDriverErrorMessage(err: unknown): string {
  const error = err as { response?: { status: number; data?: { detail?: string; message?: string } }; request?: unknown; message?: string }
  if (!error.response) return error.request
    ? 'No response from server. Please check your connection and try again.'
    : error.message || 'Failed to add driver. Please try again.'
  const { status, data } = error.response
  switch (status) {
    case 409: return 'This email is already registered. Please use a different email address.'
    case 400: return data?.detail || data?.message || 'Invalid input. Please check your information and try again.'
    case 401: return 'Authentication failed. Please log in again.'
    case 403: return 'You do not have permission to add drivers.'
    case 422: return data?.detail || data?.message || 'Validation error. Please check all fields are correct.'
    case 500: return 'Server error. Please try again later.'
    default: return data?.detail || data?.message || `Failed to add driver. Error code: ${status}`
  }
}

/** State and handlers for the Drivers tab: list filters, add form, details modal, assign-vehicle dialog. */
export function useDriversTabState({ navigate, isMobile, setIsMenuOpen, setError, setShowAddDriver }: ShellActions) {
  const queryClient = useQueryClient()
  const drivers = useTenantDrivers().data ?? EMPTY_LIST
  const { createDriver: createDriverMut, approveDriverMut, assignDriverToVehicleMut } = useTenantMutations()

  const [driverListSearch, setDriverListSearch] = useState('')
  const [driverFilterStatus, setDriverFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [driverFilterType, setDriverFilterType] = useState<'all' | 'in_house' | 'outsourced'>('all')

  const [newDriver, setNewDriver] = useState<OnboardDriver>(EMPTY_DRIVER)
  const [addDriverError, setAddDriverError] = useState<string | null>(null)
  const [isCreatingDriver, setIsCreatingDriver] = useState(false)
  const [approvingDriverId, setApprovingDriverId] = useState<number | null>(null)
  const [approveDriverError, setApproveDriverError] = useState<string | null>(null)

  const [selectedDriver, setSelectedDriver] = useState<DriverDetailResponse | null>(null)
  const [showDriverDetails, setShowDriverDetails] = useState(false)
  const [loadingDriverDetails, setLoadingDriverDetails] = useState(false)

  const [togglingActive, setTogglingActive] = useState(false)
  const [toggleActiveError, setToggleActiveError] = useState<string | null>(null)

  const [isAssigning, setIsAssigning] = useState(false)
  const [showAssignVehicleToDriver, setShowAssignVehicleToDriver] = useState(false)
  const [assignVehicleToDriverId, setAssignVehicleToDriverId] = useState<number | null>(null)
  const [selectedVehicleIdForDriverAssign, setSelectedVehicleIdForDriverAssign] = useState('')
  const [assignVehicleToDriverError, setAssignVehicleToDriverError] = useState<string | null>(null)

  const filteredDriversForList = useMemo(() => {
    let list = [...drivers]
    const q = driverListSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (d) =>
          `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) ||
          (d.email || '').toLowerCase().includes(q)
      )
    }
    if (driverFilterStatus === 'active') list = list.filter((d) => d.is_active)
    if (driverFilterStatus === 'inactive') list = list.filter((d) => !d.is_active)
    if (driverFilterType === 'in_house') list = list.filter((d) => d.driver_type === 'in_house')
    if (driverFilterType === 'outsourced') list = list.filter((d) => d.driver_type !== 'in_house')
    return list
  }, [drivers, driverListSearch, driverFilterStatus, driverFilterType])

  const openDriverRideHistory = useCallback(
    (d: DriverResponse) => {
      navigate('/tenant/bookings', { state: { driverRideSearch: `${d.first_name} ${d.last_name}`.trim() } })
      if (isMobile) setIsMenuOpen(false)
    },
    [navigate, isMobile, setIsMenuOpen]
  )

  const createDriver = async () => {
    if (!newDriver.email || !newDriver.first_name || !newDriver.last_name) {
      setAddDriverError('Please fill in all required fields')
      return
    }

    setAddDriverError(null)
    setIsCreatingDriver(true)

    try {
      await createDriverMut.mutateAsync(newDriver)
      setNewDriver(EMPTY_DRIVER)
      setShowAddDriver(false)
    } catch (error) {
      console.error('Failed to create driver:', error)
      setAddDriverError(addDriverErrorMessage(error))
    } finally {
      setIsCreatingDriver(false)
    }
  }

  const approveDriverAction = async (driverId: number) => {
    setApproveDriverError(null)
    setApprovingDriverId(driverId)
    try {
      await approveDriverMut.mutateAsync(driverId)
    } catch (error) {
      setApproveDriverError(getApiErrorMessage(error, 'Failed to approve driver. Please try again.'))
    } finally {
      setApprovingDriverId(null)
    }
  }

  const openAssignVehicleToDriver = (driverId: number) => {
    setAssignVehicleToDriverId(driverId)
    setSelectedVehicleIdForDriverAssign('')
    setAssignVehicleToDriverError(null)
    setShowAssignVehicleToDriver(true)
  }

  const confirmAssignVehicleToDriver = async () => {
    if (!assignVehicleToDriverId || !selectedVehicleIdForDriverAssign) return

    setIsAssigning(true)
    setAssignVehicleToDriverError(null)

    try {
      await assignDriverToVehicleMut.mutateAsync({ vehicleId: Number(selectedVehicleIdForDriverAssign), driverId: assignVehicleToDriverId })
      setShowAssignVehicleToDriver(false)
      setAssignVehicleToDriverId(null)
      setSelectedVehicleIdForDriverAssign('')
    } catch (error) {
      console.error('Failed to assign vehicle to driver:', error)
      setAssignVehicleToDriverError(getRequestErrorMessage(error, 'Failed to assign vehicle. Please try again.'))
    } finally {
      setIsAssigning(false)
    }
  }

  const toggleDriverActive = async () => {
    if (!selectedDriver) return
    const next = !selectedDriver.is_active
    setTogglingActive(true)
    setToggleActiveError(null)
    try {
      await setDriverActive(selectedDriver.id, next)
      setSelectedDriver({ ...selectedDriver, is_active: next })
      await queryClient.invalidateQueries({ queryKey: ['tenant', 'drivers'] })
    } catch (e) {
      setToggleActiveError(getApiErrorMessage(e, 'Failed to update driver status. Please try again.'))
    } finally {
      setTogglingActive(false)
    }
  }

  const handleDriverClick = async (driverId: number) => {
    setLoadingDriverDetails(true)
    setShowDriverDetails(true)
    try {
      const response = await getTenantDrivers(driverId)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSelectedDriver(response.data[0] as DriverDetailResponse)
      } else {
        setError('Driver not found')
        setShowDriverDetails(false)
      }
    } catch (error) {
      console.error('Failed to load driver details:', error)
      setError('Failed to load driver details')
      setShowDriverDetails(false)
    } finally {
      setLoadingDriverDetails(false)
    }
  }

  return {
    drivers,
    driverListSearch, setDriverListSearch,
    driverFilterStatus, setDriverFilterStatus,
    driverFilterType, setDriverFilterType,
    newDriver, setNewDriver,
    addDriverError, setAddDriverError,
    isCreatingDriver,
    approvingDriverId,
    approveDriverError,
    selectedDriver, setSelectedDriver,
    showDriverDetails, setShowDriverDetails,
    loadingDriverDetails,
    togglingActive, toggleActiveError, toggleDriverActive,
    isAssigning,
    showAssignVehicleToDriver, setShowAssignVehicleToDriver,
    assignVehicleToDriverId, setAssignVehicleToDriverId,
    selectedVehicleIdForDriverAssign, setSelectedVehicleIdForDriverAssign,
    assignVehicleToDriverError, setAssignVehicleToDriverError,
    filteredDriversForList,
    openDriverRideHistory,
    createDriver,
    approveDriverAction,
    openAssignVehicleToDriver,
    confirmAssignVehicleToDriver,
    handleDriverClick,
  }
}

export type DriversTabState = ReturnType<typeof useDriversTabState>
