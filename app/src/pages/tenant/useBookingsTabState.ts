import { useEffect, useState } from 'react'
import type { Location, NavigateFunction } from 'react-router-dom'
import { getTenantBookingById, type BookingResponse } from '@api/tenant'
import { getBookingRating, type BookingRatingResponse } from '@api/bookings'
import { useBookingSearch } from '@hooks/useBookingSearch'
import { useTenantBookings, useTenantDrivers, useTenantVehicles, type BookingFilters, EMPTY_LIST } from './useTenantData'
import { useTenantMutations } from './useTenantMutations'

type ShellActions = {
  filters: BookingFilters
  location: Location
  navigate: NavigateFunction
  setError: (message: string | null) => void
}

/** State and handlers for the Bookings tab: search, details modal, assign-driver flow. */
export function useBookingsTabState({ filters, location, navigate, setError }: ShellActions) {
  const bookings = useTenantBookings(filters).data ?? EMPTY_LIST
  const drivers = useTenantDrivers().data ?? EMPTY_LIST
  const vehicles = useTenantVehicles().data ?? EMPTY_LIST
  const { assignDriverToBookingMut } = useTenantMutations()
  const { searchQuery, handleSearchChange, filteredBookings, searchError, clearSearch, hasActiveSearch } = useBookingSearch(bookings)

  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false)
  const [selectedBookingRating, setSelectedBookingRating] = useState<BookingRatingResponse | null>(null)
  const [loadingBookingRating, setLoadingBookingRating] = useState(false)

  const [showAssignDriverToBooking, setShowAssignDriverToBooking] = useState(false)
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<string>('')
  const [assigningDriver, setAssigningDriver] = useState(false)
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)

  // The Drivers tab's "ride history" action lands here with the driver's name to pre-fill the search.
  useEffect(() => {
    if (location.pathname !== '/tenant/bookings') return
    const st = location.state as { driverRideSearch?: string } | null | undefined
    const q = typeof st?.driverRideSearch === 'string' ? st.driverRideSearch.trim() : ''
    if (!q) return
    handleSearchChange(q)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
  }, [location.pathname, location.search, location.state, handleSearchChange, navigate])

  const handleBookingClick = async (bookingId: number) => {
    setLoadingBookingDetails(true)
    setLoadingBookingRating(true)
    setSelectedBookingRating(null)
    setShowBookingDetails(true)
    try {
      const [response, bookingRatingResponse] = await Promise.all([
        getTenantBookingById(bookingId),
        getBookingRating(bookingId).catch(() => null),
      ])

      if (response.data && response.data.length > 0) {
        setSelectedBooking(response.data[0])
        setSelectedBookingRating(bookingRatingResponse?.data || null)
      } else {
        setError('Booking not found')
        setShowBookingDetails(false)
      }
    } catch (error) {
      console.error('Failed to load booking details:', error)
      setError('Failed to load booking details')
      setShowBookingDetails(false)
    } finally {
      setLoadingBookingDetails(false)
      setLoadingBookingRating(false)
    }
  }

  const handleAssignDriverToBooking = async () => {
    if (!selectedBooking || !selectedDriverForBooking) return

    const driverId = Number(selectedDriverForBooking)
    if (!driverId) return

    const hasDriver = !!(selectedBooking.driver_name && selectedBooking.driver_name !== 'None')

    // If a driver is already assigned, ask for confirmation before overriding.
    if (hasDriver && !showOverrideConfirm) {
      setShowOverrideConfirm(true)
      return
    }

    if (!selectedBooking.id) return

    setAssigningDriver(true)
    try {
      await assignDriverToBookingMut.mutateAsync({ bookingId: selectedBooking.id, driverId, override: hasDriver })

      // Refresh booking details modal
      const response = await getTenantBookingById(selectedBooking.id)
      if (response.data && response.data.length > 0) {
        setSelectedBooking(response.data[0])
      }

      setShowAssignDriverToBooking(false)
      setSelectedDriverForBooking('')
      setShowOverrideConfirm(false)
    } catch (error) {
      console.error('Failed to assign driver to booking:', error)
      setError('Failed to assign driver. Please try again.')
    } finally {
      setAssigningDriver(false)
    }
  }

  return {
    drivers,
    vehicles,
    bookings,
    searchQuery, handleSearchChange, filteredBookings, searchError, clearSearch, hasActiveSearch,
    selectedBooking, setSelectedBooking,
    showBookingDetails, setShowBookingDetails,
    loadingBookingDetails,
    selectedBookingRating, setSelectedBookingRating,
    loadingBookingRating,
    showAssignDriverToBooking, setShowAssignDriverToBooking,
    selectedDriverForBooking, setSelectedDriverForBooking,
    assigningDriver,
    showOverrideConfirm, setShowOverrideConfirm,
    handleBookingClick,
    handleAssignDriverToBooking,
  }
}
