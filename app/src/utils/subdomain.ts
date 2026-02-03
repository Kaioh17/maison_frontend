/**
 * Utility functions for subdomain handling.
 * Host/domain constants come from @config/host (single source of truth).
 */

import { MAIN_DOMAIN, DEV_HOSTS, getEffectiveMainDomain } from '@config/host'

/**
 * Checks if a hostname is a dev host (e.g. localhost, 127.0.0.1).
 */
export function isLocalhost(hostname?: string): boolean {
  const host = (hostname || (typeof window !== 'undefined' ? window.location.hostname : ''))
    .split(':')[0]
  return DEV_HOSTS.includes(host) || host.startsWith('127.0.0.1')
}

/**
 * Gets the main domain from central config or infers from hostname when appropriate.
 * When the app is opened on a dev host (localhost/127.0.0.1), returns the dev main domain
 * so that the root URL is treated as main domain (no 404).
 */
export function getMainDomain(): string {
  if (typeof window !== 'undefined') {
    const hostnameWithoutPort = window.location.hostname.split(':')[0]
    if (DEV_HOSTS.includes(hostnameWithoutPort) || hostnameWithoutPort.startsWith('127.0.0.1')) {
      return getEffectiveMainDomain()
    }
  }

  const envDomain = import.meta.env.VITE_MAIN_DOMAIN
  if (envDomain) {
    return envDomain
  }

  const environment = import.meta.env.VITE_ENVIRONMENT
  if (environment === 'production') {
    return MAIN_DOMAIN
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const hostnameWithoutPort = hostname.split(':')[0]

    if (hostnameWithoutPort === MAIN_DOMAIN) {
      return MAIN_DOMAIN
    }

    const parts = hostnameWithoutPort.split('.')
    if (parts.length === 2) {
      return parts.join('.')
    }
    if (parts.length > 2) {
      return parts.slice(-2).join('.')
    }
  }

  return MAIN_DOMAIN
}

/**
 * Checks if current hostname is the main domain (not a subdomain).
 * Examples: main domain → true; tenant subdomain → false.
 */
export function isMainDomain(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname
  const mainDomain = getMainDomain()
  const hostnameWithoutPort = hostname.split(':')[0]

  if (hostnameWithoutPort === mainDomain) {
    return true
  }

  const parts = hostnameWithoutPort.split('.')
  const mainParts = mainDomain.split('.')

  if (parts.length > mainParts.length) {
    return false
  }
  if (parts.length < mainParts.length) {
    return false
  }
  if (parts.length === mainParts.length) {
    return hostnameWithoutPort === mainDomain
  }

  return false
}

/**
 * Checks if a given hostname is the main domain (not a subdomain).
 */
export function isMainDomainHost(hostname: string): boolean {
  const mainDomain = getMainDomain()
  const hostnameWithoutPort = hostname.split(':')[0]

  if (hostnameWithoutPort === mainDomain) {
    return true
  }

  const parts = hostnameWithoutPort.split('.')
  const mainParts = mainDomain.split('.')

  if (parts.length > mainParts.length) {
    return false
  }
  if (parts.length < mainParts.length) {
    return false
  }
  if (parts.length === mainParts.length) {
    return hostnameWithoutPort === mainDomain
  }

  return false
}

/**
 * Extracts subdomain from hostname.
 * Examples: "tenant-slug.localhost" → "tenant-slug"; "localhost" → null; "tenant-slug.example.com" → "tenant-slug".
 */
export function extractSubdomain(hostname: string): string | null {
  const hostnameWithoutPort = hostname.split(':')[0]
  const parts = hostnameWithoutPort.split('.')

  // Dev-style host (e.g. tenant.localhost): last part is MAIN_DOMAIN
  const lastPartIsMainDomain = parts[parts.length - 1] === MAIN_DOMAIN
  const isExactDevHost = hostnameWithoutPort === MAIN_DOMAIN || DEV_HOSTS.includes(hostnameWithoutPort)
  if (lastPartIsMainDomain || isExactDevHost) {
    if (parts.length >= 2 && parts[0] !== MAIN_DOMAIN && parts[parts.length - 1] === MAIN_DOMAIN) {
      return parts[0]
    }
    return null
  }

  if (parts.length >= 3) {
    return parts[0]
  }

  const mainDomain = getMainDomain()
  const mainDomainParts = mainDomain.split('.')

  if (parts.length === mainDomainParts.length + 1) {
    const domainMatch = parts.slice(1).join('.') === mainDomain
    if (domainMatch) {
      return parts[0]
    }
  }

  return null
}
