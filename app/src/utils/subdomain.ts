/**
 * Utility functions for subdomain handling
 */

/**
 * Checks if a hostname is localhost or 127.0.0.1
 */
export function isLocalhost(hostname?: string): boolean {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '')
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.0.0.1')
}

/**
 * Gets the main domain from environment or infers from hostname
 * Uses VITE_ENVIRONMENT to determine dev vs production mode
 */
export function getMainDomain(): string {
  const envDomain = import.meta.env.VITE_MAIN_DOMAIN
  if (envDomain) {
    return envDomain
  }
  
  // Use VITE_ENVIRONMENT to determine dev vs production
  const environment = import.meta.env.VITE_ENVIRONMENT
  if (environment === 'production') {
    // Production mode: default to usemaison.ie
    return 'usemaison.ie'
  }
  
  // Development mode: default to localhost
  // Fallback: try to infer from current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const hostnameWithoutPort = hostname.split(':')[0]
    
    // Special handling for localhost - main domain is always just "localhost"
    // Whether it's "localhost" or "tenant.localhost", the main domain is "localhost"
    if (hostnameWithoutPort.includes('localhost')) {
      return 'localhost'
    }
    
    // If not localhost, try to infer from hostname structure
    const parts = hostnameWithoutPort.split('.')
    
    // For production domains, if we have at least 2 parts, return the last 2 as domain.tld
    // But only if it's not a subdomain (more than 2 parts means it's a subdomain)
    if (parts.length === 2) {
      return parts.join('.')
    }
    
    // If it has more than 2 parts, it's a subdomain - extract the main domain
    // Example: "tenant.usemaison.com" -> "usemaison.com"
    if (parts.length > 2) {
      return parts.slice(-2).join('.')
    }
  }
  
  // Default fallback based on environment
  if (environment === 'production') {
    return 'usemaison.ie'
  }
  
  return 'localhost'
}

/**
 * Checks if current hostname is the main domain (not a subdomain)
 * 
 * Examples:
 * - "localhost" → true (main domain)
 * - "usemaison.com" → true (main domain)
 * - "tenant.localhost" → false (subdomain)
 * - "tenant.usemaison.com" → false (subdomain)
 * - "www.usemaison.com" → false (subdomain, if main domain is "usemaison.com")
 */
export function isMainDomain(): boolean {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  const mainDomain = getMainDomain()
  
  // Remove port if present (e.g., "localhost:3000" → "localhost")
  const hostnameWithoutPort = hostname.split(':')[0]
  
  // Exact match with main domain - this is the primary check
  if (hostnameWithoutPort === mainDomain) {
    return true
  }
  
  // Split into parts for comparison
  const parts = hostnameWithoutPort.split('.')
  const mainParts = mainDomain.split('.')
  
  // If hostname has more parts than main domain, it's definitely a subdomain
  // Example: "tenant.usemaison.com" (3 parts) vs "usemaison.com" (2 parts)
  if (parts.length > mainParts.length) {
    return false
  }
  
  // If hostname has fewer parts than main domain, it can't be the main domain
  // Example: "localhost" (1 part) vs "usemaison.com" (2 parts)
  if (parts.length < mainParts.length) {
    return false
  }
  
  // If they have the same number of parts, they must match exactly
  // This handles cases where mainDomain might be inferred incorrectly
  // Example: "example.com" (2 parts) vs "usemaison.com" (2 parts) → false
  if (parts.length === mainParts.length) {
    return hostnameWithoutPort === mainDomain
  }
  
  // Fallback: should never reach here, but return false for safety
  return false
}

/**
 * Checks if a given hostname is the main domain (not a subdomain)
 * This is a wrapper around isMainDomain() that accepts a hostname parameter
 */
export function isMainDomainHost(hostname: string): boolean {
  const mainDomain = getMainDomain()
  const hostnameWithoutPort = hostname.split(':')[0]
  
  // Exact match with main domain
  if (hostnameWithoutPort === mainDomain) {
    return true
  }
  
  // Split into parts for comparison
  const parts = hostnameWithoutPort.split('.')
  const mainParts = mainDomain.split('.')
  
  // If hostname has more parts than main domain, it's definitely a subdomain
  if (parts.length > mainParts.length) {
    return false
  }
  
  // If hostname has fewer parts than main domain, it can't be the main domain
  if (parts.length < mainParts.length) {
    return false
  }
  
  // If they have the same number of parts, they must match exactly
  if (parts.length === mainParts.length) {
    return hostnameWithoutPort === mainDomain
  }
  
  return false
}

/**
 * Extracts subdomain from hostname
 * Examples:
 * - "tenant-slug.localhost" -> "tenant-slug"
 * - "ridez.localhost" -> "ridez"
 * - "localhost" -> null
 * - "tenant-slug.example.com" -> "tenant-slug"
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const hostnameWithoutPort = hostname.split(':')[0]
  
  // Split by dots
  const parts = hostnameWithoutPort.split('.')
  
  // Handle localhost subdomains (e.g., tenant-slug.localhost)
  if (hostnameWithoutPort.includes('localhost')) {
    // For localhost, check if there's a subdomain prefix
    // Format: subdomain.localhost
    if (parts.length >= 2 && parts[0] !== 'localhost' && parts[parts.length - 1] === 'localhost') {
      return parts[0]
    }
    return null
  }
  
  // For production domains (e.g., tenant-slug.example.com)
  // We need at least 3 parts: subdomain, domain, tld
  if (parts.length >= 3) {
    // The first part is the subdomain
    return parts[0]
  }
  
  // For domains like tenant-slug.com (2 parts), check if it's a subdomain
  // This depends on your domain structure
  const mainDomain = getMainDomain()
  const mainDomainParts = mainDomain.split('.')
  
  if (parts.length === mainDomainParts.length + 1) {
    // Check if the last parts match the main domain
    const domainMatch = parts.slice(1).join('.') === mainDomain
    if (domainMatch) {
      return parts[0]
    }
  }
  
  return null
}

