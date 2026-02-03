import { MAPBOX_TOKEN } from '@config'

// Generate a session token for Mapbox Search API
export function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Mapbox Search Suggestion Response Types
export interface MapboxSuggestion {
  mapbox_id: string
  feature_type: string
  full_address: string
  name: string
  name_preferred: string
  place_formatted: string
  context: {
    country?: {
      name: string
      country_code: string
    }
    region?: {
      name: string
    }
    postcode?: {
      name: string
    }
    place?: {
      name: string
    }
    street?: {
      name: string
    }
  }
  coordinates?: {
    longitude: number
    latitude: number
  }
}

export interface MapboxSuggestResponse {
  suggestions: MapboxSuggestion[]
}

// Mapbox Location Details Response Types
export interface MapboxLocationDetails {
  type: string
  features: Array<{
    type: string
    geometry: {
      type: string
      coordinates: [number, number] // [longitude, latitude]
    }
    properties: {
      mapbox_id: string
      feature_type: string
      full_address: string
      name: string
      name_preferred: string
      place_formatted: string
      coordinates: {
        longitude: number
        latitude: number
      }
      context: {
        country?: {
          name: string
          country_code: string
        }
        region?: {
          name: string
        }
        postcode?: {
          name: string
        }
        place?: {
          name: string
        }
        street?: {
          name: string
        }
      }
    }
  }>
}

/**
 * Get general location suggestions for pickup/dropoff
 */
export async function getLocationSuggestions(
  query: string,
  sessionToken: string,
  limit: number = 5,
  country?: string
): Promise<MapboxSuggestion[]> {
  if (!query.trim() || !MAPBOX_TOKEN) {
    return []
  }

  try {
    const params = new URLSearchParams({
      q: query,
      session_token: sessionToken,
      limit: limit.toString(),
      navigation_profile: 'driving',
      access_token: MAPBOX_TOKEN,
    })

    // Add country filter if provided
    if (country && country.trim()) {
      params.append('country', country.toLowerCase().trim())
    }

    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`)
    }

    const data: MapboxSuggestResponse = await response.json()
    return data.suggestions || []
  } catch (error) {
    console.error('Error fetching location suggestions:', error)
    return []
  }
}

/**
 * Get airport-only suggestions for airport service bookings
 */
export async function getAirportSuggestions(
  query: string,
  sessionToken: string,
  limit: number = 4,
  country?: string
): Promise<MapboxSuggestion[]> {
  if (!query.trim() || !MAPBOX_TOKEN) {
    return []
  }

  try {
    const params = new URLSearchParams({
      q: query,
      session_token: sessionToken,
      types: 'poi,country',
      poi_category: 'airport,airport_gate,airport_terminal',
      limit: limit.toString(),
      navigation_profile: 'driving',
      access_token: MAPBOX_TOKEN,
    })

    // Add country filter if provided, otherwise default to 'us'
    if (country && country.trim()) {
      params.append('country', country.toLowerCase().trim())
    } else {
      params.append('country', 'us')
    }

    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`)
    }

    const data: MapboxSuggestResponse = await response.json()
    return data.suggestions || []
  } catch (error) {
    console.error('Error fetching airport suggestions:', error)
    return []
  }
}

/**
 * Retrieve full location details by mapbox_id
 */
export async function getLocationDetails(
  mapboxId: string,
  sessionToken: string
): Promise<MapboxLocationDetails | null> {
  if (!mapboxId || !MAPBOX_TOKEN) {
    return null
  }

  try {
    const params = new URLSearchParams({
      session_token: sessionToken,
      access_token: MAPBOX_TOKEN,
    })

    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`)
    }

    const data: MapboxLocationDetails = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching location details:', error)
    return null
  }
}

/**
 * Format a suggestion for display
 */
export function formatSuggestion(suggestion: MapboxSuggestion): string {
  return suggestion.name_preferred || suggestion.place_formatted || suggestion.full_address || suggestion.name || ''
}

/**
 * Format location details for display
 * For airports, prioritizes name (full airport name) over name_preferred (airport code)
 * For other locations, prioritizes name (location name like "5120 S Hydepark Boulevard Aprtments") 
 * over name_preferred or place_formatted (which may be full address)
 */
export function formatLocationDetails(details: MapboxLocationDetails, isAirport: boolean = false): string {
  if (details.features && details.features.length > 0) {
    const properties = details.features[0].properties
    
    // Check if it's an airport by feature_type or name
    const isAirportLocation = isAirport || 
      properties.feature_type === 'poi' && 
      (properties.name?.toLowerCase().includes('airport') || 
       properties.name?.toLowerCase().includes('international') ||
       properties.full_address?.toLowerCase().includes('airport'))
    
    if (isAirportLocation) {
      // For airports, prioritize name (full name) over name_preferred (code)
      return properties.name || properties.name_preferred || properties.place_formatted || properties.full_address || ''
    } else {
      // For other locations (pickup/dropoff), prioritize name (location name) over name_preferred/place_formatted
      return properties.name || properties.name_preferred || properties.place_formatted || properties.full_address || ''
    }
  }
  return ''
}

