import { useState, useMemo, useCallback, useRef } from 'react'
import type { BookingResponse } from '@api/bookings'
import { validateAndSanitizeQuery, logSearchQuery } from '../utils/searchSecurity'

/**
 * Custom hook for secure client-side booking search
 * Searches through customer names and driver names
 */
export function useBookingSearch(bookings: BookingResponse[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Filter bookings based on search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookings
    }

    // Validate and sanitize query
    const validation = validateAndSanitizeQuery(searchQuery)
    
    if (!validation.isValid) {
      setSearchError(null) // Clear error for empty/invalid queries
      return bookings
    }

    // Log the search query for security monitoring
    logSearchQuery(searchQuery, validation, {
      component: 'BookingSearch',
    })

    // Show warning if suspicious
    if (validation.isSuspicious) {
      setSearchError('Suspicious characters detected and removed from search')
      console.warn('[BookingSearch] Suspicious query detected:', validation.warnings)
    } else {
      setSearchError(null)
    }

    // Split search query into individual words
    const searchWords = validation.sanitized
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)

    // Filter bookings - search in customer_name and driver_name
    return bookings.filter(booking => {
      // Get searchable text
      const customerName = (booking.customer_name || '').toLowerCase()
      const driverName = (booking.driver_name || '').toLowerCase()

      // Check if ALL words match in ANY of the search fields
      return searchWords.every(word => {
        return customerName.includes(word) || driverName.includes(word)
      })
    })
  }, [bookings, searchQuery])

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Update search query immediately for responsive UI
    setSearchQuery(value)
    setSearchError(null)

    // Debounce validation (small delay for better UX)
    debounceTimerRef.current = setTimeout(() => {
      const validation = validateAndSanitizeQuery(value)
      if (validation.isSuspicious && value.trim().length > 0) {
        setSearchError('Suspicious characters detected and removed')
      }
    }, 100)
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchError(null)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    filteredBookings,
    searchError,
    clearSearch,
    hasActiveSearch: searchQuery.trim().length > 0,
  }
}

