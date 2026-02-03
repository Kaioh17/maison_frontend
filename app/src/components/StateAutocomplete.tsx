import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import usaData from '../data/USA.json'

// Type assertion for JSON import
const statesData = usaData as Record<string, { name: string; cities: string[] }>

interface StateAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onStateSelect?: (stateCode: string, stateName: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  required?: boolean
  className?: string
  style?: React.CSSProperties
}

type StateEntry = {
  code: string
  name: string
}

export default function StateAutocomplete({
  value,
  onChange,
  onStateSelect,
  placeholder = 'Enter state',
  label,
  disabled = false,
  required = false,
  className = 'bw-input',
  style,
}: StateAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<StateEntry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Convert states JSON to array format
  const statesList: StateEntry[] = Object.entries(statesData).map(([code, data]) => ({
    code,
    name: data.name,
  }))

  // Filter states based on search query
  const filterStates = useCallback((query: string): StateEntry[] => {
    if (!query.trim() || query.length < 1) {
      return []
    }

    const lowerQuery = query.toLowerCase()
    return statesList
      .filter((state) => {
        const searchText = `${state.code} ${state.name}`.toLowerCase()
        return searchText.includes(lowerQuery)
      })
      .slice(0, 10) // Limit to 10 suggestions
  }, [])

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
    if (newValue.trim().length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        const filtered = filterStates(newValue)
        setSuggestions(filtered)
        setSelectedIndex(-1)
      }, 200)
    } else {
      setSuggestions([])
      onChange('') // Clear the stored code
    }
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (state: StateEntry) => {
    // Pass the state code (key) instead of display value
    const stateCode = state.code
    onChange(stateCode)
    setIsTyping(false)
    setDisplayText('')
    setShowSuggestions(false)
    setSuggestions([])
    
    if (onStateSelect) {
      onStateSelect(stateCode, state.name)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && displayText.trim()) {
        // Try to find exact match by what user typed
        const exactMatch = statesList.find(
          (s) => s.name.toLowerCase() === displayText.toLowerCase() ||
                 s.code.toLowerCase() === displayText.toLowerCase()
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

  // Show all states when input is focused and empty
  const handleFocus = () => {
    // If we have a stored code, show suggestions for that state name
    if (value.trim() && !isTyping) {
      const state = statesList.find(
        (s) => s.code.toLowerCase() === value.toLowerCase().trim()
      )
      if (state) {
        const filtered = filterStates(state.name)
        setSuggestions(filtered.length > 0 ? filtered : statesList.slice(0, 10))
      } else {
        setSuggestions(statesList.slice(0, 10))
      }
    } else {
      setSuggestions(statesList.slice(0, 10))
    }
    setShowSuggestions(true)
  }

  // Get display value for the input - show state name if code is entered
  const getDisplayValue = (): string => {
    // If user is typing, show what they're typing
    if (isTyping) {
      return displayText
    }
    
    // If value is a state code, show the state name
    if (value.trim()) {
      const state = statesList.find(
        (s) => s.code.toLowerCase() === value.toLowerCase().trim()
      )
      if (state) {
        return state.name
      }
    }
    
    return ''
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
          placeholder={placeholder}
          disabled={disabled}
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
            ...style,
          }}
        />
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
          {suggestions.map((state, index) => (
            <button
              key={state.code}
              type="button"
              onClick={() => handleSelectSuggestion(state)}
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
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {state.name}
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
                    {state.code}
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
