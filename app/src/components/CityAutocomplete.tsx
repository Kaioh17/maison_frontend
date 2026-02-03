import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import usaData from '../data/USA.json'

// Type assertion for JSON import
const statesData = usaData as Record<string, { name: string; cities: string[] }>

interface CityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onCitySelect?: (cityName: string) => void
  selectedState?: string // State code like "AL", "CA", etc.
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function CityAutocomplete({
  value,
  onChange,
  onCitySelect,
  selectedState,
  placeholder = 'Enter city',
  label,
  disabled = false,
  required = false,
  className = 'bw-input',
  style,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Get cities for the selected state
  const getAvailableCities = useCallback((): string[] => {
    if (!selectedState) {
      // If no state selected, return empty array or all cities from all states
      // For now, return empty to encourage state selection first
      return []
    }
    
    const stateData = statesData[selectedState.toUpperCase()]
    return stateData ? stateData.cities : []
  }, [selectedState])

  // Filter cities based on search query
  const filterCities = useCallback((query: string): string[] => {
    const availableCities = getAvailableCities()
    if (availableCities.length === 0) {
      return []
    }

    if (!query.trim() || query.length < 1) {
      return []
    }

    const lowerQuery = query.toLowerCase()
    return availableCities
      .filter((city) => city.toLowerCase().includes(lowerQuery))
      .slice(0, 10) // Limit to 10 suggestions
  }, [getAvailableCities])

  // Track if user is typing (not selecting from dropdown)
  const [isTyping, setIsTyping] = useState(false)
  const [displayText, setDisplayText] = useState('')

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setIsTyping(true)
    setDisplayText(newValue)
    setShowSuggestions(true)

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced search
    if (newValue.trim().length >= 1 && selectedState) {
      debounceTimerRef.current = setTimeout(() => {
        const filtered = filterCities(newValue)
        setSuggestions(filtered)
        setSelectedIndex(-1)
      }, 200)
    } else {
      setSuggestions([])
      if (!selectedState) {
        onChange('') // Clear the stored value if no state selected
      }
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (city: string) => {
    onChange(city)
    setIsTyping(false)
    setDisplayText('')
    setShowSuggestions(false)
    setSuggestions([])
    
    if (onCitySelect) {
      onCitySelect(city)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && displayText.trim() && selectedState) {
        // Try to find exact match by what user typed
        const availableCities = getAvailableCities()
        const exactMatch = availableCities.find(
          (c) => c.toLowerCase() === displayText.toLowerCase()
        )
        if (exactMatch) {
          handleSelectSuggestion(exactMatch)
        }
      }
      return
    }

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

  // Show cities when input is focused and state is selected
  const handleFocus = () => {
    if (!selectedState) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const availableCities = getAvailableCities()
    if (value.trim() && !isTyping) {
      // If we have a stored value, show suggestions for that city
      const filtered = filterCities(value)
      setSuggestions(filtered.length > 0 ? filtered : availableCities.slice(0, 10))
    } else {
      setSuggestions(availableCities.slice(0, 10))
    }
    setShowSuggestions(true)
  }

  // Get display value for the input
  const getDisplayValue = (): string => {
    // If user is typing, show what they're typing
    if (isTyping) {
      return displayText
    }
    
    // Otherwise show the stored value
    return value || ''
  }

  // Clear city when state changes
  useEffect(() => {
    if (!selectedState && value) {
      onChange('')
      setIsTyping(false)
      setDisplayText('')
    }
  }, [selectedState, value, onChange])

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

  const isDisabled = disabled || !selectedState

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: 'clamp(13px, 2vw, 14px)',
            fontWeight: 500,
            color: 'var(--bw-text)',
          }}
        >
          {label} {required && '*'}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          className={className}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={selectedState ? placeholder : 'Select state first'}
          disabled={isDisabled}
          required={required}
          style={{
            width: '100%',
            padding: 'clamp(10px, 2vw, 12px)',
            borderRadius: '8px',
            border: '1px solid var(--bw-border)',
            backgroundColor: 'var(--bw-bg)',
            color: 'var(--bw-text)',
            fontFamily: 'Work Sans, sans-serif',
            fontSize: 'clamp(13px, 2vw, 14px)',
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? 'not-allowed' : 'text',
            ...style,
          }}
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && selectedState && (
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
          {suggestions.map((city, index) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelectSuggestion(city)}
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
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MapPin size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {city}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
