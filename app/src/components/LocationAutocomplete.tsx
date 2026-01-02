import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import {
  getLocationSuggestions,
  getAirportSuggestions,
  getLocationDetails,
  generateSessionToken,
  formatSuggestion,
  formatLocationDetails,
  type MapboxSuggestion,
} from '@api/mapbox'

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onLocationSelect?: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  label?: string
  isAirportOnly?: boolean
  disabled?: boolean
  country?: string // Country code (e.g., 'us', 'gb') to filter search results
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Enter address',
  label,
  isAirportOnly = false,
  disabled = false,
  country,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [sessionToken] = useState(() => generateSessionToken())
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced search function
  const searchLocations = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const results = isAirportOnly
          ? await getAirportSuggestions(query, sessionToken, 4, country)
          : await getLocationSuggestions(query, sessionToken, 5, country)
        setSuggestions(results)
        setShowSuggestions(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error searching locations:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [isAirportOnly, sessionToken, country]
  )

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(true)

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    if (newValue.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        searchLocations(newValue)
      }, 300)
    } else {
      setSuggestions([])
      setIsLoading(false)
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: MapboxSuggestion) => {
    // Get full location details to use name_preferred
    let displayAddress = formatSuggestion(suggestion) // Fallback to suggestion format
    
    if (suggestion.mapbox_id) {
      try {
        const details = await getLocationDetails(suggestion.mapbox_id, sessionToken)
        if (details && details.features && details.features.length > 0) {
          // Use name_preferred from the retrieved location details
          const formattedFromDetails = formatLocationDetails(details)
          if (formattedFromDetails) {
            displayAddress = formattedFromDetails
          }
          
          // Update the input with the preferred name
          onChange(displayAddress)
          setShowSuggestions(false)
          setSuggestions([])

          // Call onLocationSelect with coordinates if needed
          if (onLocationSelect) {
            const feature = details.features[0]
            const properties = feature.properties
            
            // Use coordinates from properties if available, otherwise use geometry coordinates
            let lat: number, lng: number
            if (properties.coordinates && properties.coordinates.latitude && properties.coordinates.longitude) {
              lat = properties.coordinates.latitude
              lng = properties.coordinates.longitude
            } else {
              // Fallback to geometry coordinates (GeoJSON format: [longitude, latitude])
              const [lngCoord, latCoord] = feature.geometry.coordinates
              lat = latCoord
              lng = lngCoord
            }
            console.log('Location coordinates captured:', { lat, lng, address: displayAddress })
            onLocationSelect(displayAddress, { lat, lng })
          }
          return
        }
      } catch (error) {
        console.error('Error getting location details:', error)
      }
    }
    
    // Fallback: use suggestion format if details retrieval fails
    onChange(displayAddress)
    setShowSuggestions(false)
    setSuggestions([])
    
    if (onLocationSelect) {
      // Try to get coordinates from suggestion if available
      if (suggestion.coordinates && suggestion.coordinates.latitude && suggestion.coordinates.longitude) {
        onLocationSelect(displayAddress, {
          lat: suggestion.coordinates.latitude,
          lng: suggestion.coordinates.longitude
        })
      } else {
        onLocationSelect(displayAddress)
      }
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: 'clamp(13px, 2vw, 14px)',
            fontWeight: 500,
            color: 'var(--bw-text)',
          }}
        >
          <MapPin size={16} />
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          className="bw-input"
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: 'clamp(10px, 2vw, 12px)',
            paddingRight: isLoading ? '40px' : 'clamp(10px, 2vw, 12px)',
            borderRadius: '8px',
            border: '1px solid var(--bw-border)',
            backgroundColor: 'var(--bw-bg)',
            color: 'var(--bw-text)',
            fontFamily: 'Work Sans, sans-serif',
            fontSize: 'clamp(13px, 2vw, 14px)',
          }}
        />
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: 'var(--bw-text)', opacity: 0.6 }} />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'var(--bw-bg)',
            border: '1px solid var(--bw-border)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.mapbox_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{
                width: '100%',
                padding: 'clamp(10px, 2vw, 12px)',
                textAlign: 'left',
                backgroundColor:
                  selectedIndex === index
                    ? 'var(--bw-bg-hover, rgba(0, 0, 0, 0.05))'
                    : 'transparent',
                border: 'none',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--bw-border)' : 'none',
                color: 'var(--bw-text)',
                cursor: 'pointer',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: 'clamp(13px, 2vw, 14px)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.7 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {suggestion.name_preferred || suggestion.name}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(11px, 1.5vw, 12px)',
                      opacity: 0.7,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {suggestion.place_formatted || suggestion.full_address}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading spinner animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

