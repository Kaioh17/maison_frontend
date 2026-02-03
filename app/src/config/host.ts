/**
 * Central host/domain config – single source of truth for app host, domain, and URL helpers.
 * All usages of production vs dev domain and dev host list should import from here.
 */

const env = import.meta.env.VITE_ENVIRONMENT
const envMainDomain = import.meta.env.VITE_MAIN_DOMAIN
const envDevDomain = import.meta.env.VITE_DEV_DOMAIN

/** Production mode (VITE_ENVIRONMENT === 'production'). */
export const IS_PRODUCTION = env === 'production'

/** Dev host list for "is this a dev host?" checks. */
export const DEV_HOSTS: readonly string[] = ['localhost', '127.0.0.1']

/** Main domain: production → VITE_MAIN_DOMAIN or default; else → VITE_DEV_DOMAIN or localhost. */
export const MAIN_DOMAIN: string = IS_PRODUCTION
  ? (envMainDomain || 'usemaison.io')
  : (envDevDomain || 'localhost')

/** Dev main domain (used when running on localhost/127.0.0.1 so routing treats it as main domain). */
export const DEV_MAIN_DOMAIN: string = envDevDomain || 'localhost'

/**
 * Effective main domain for the current context. When the app is opened on a dev host
 * (localhost/127.0.0.1), returns the dev main domain so isMainDomain() is true; otherwise MAIN_DOMAIN.
 */
export function getEffectiveMainDomain(): string {
  if (typeof window === 'undefined') return MAIN_DOMAIN
  const h = window.location.hostname.split(':')[0]
  if (DEV_HOSTS.includes(h) || h.startsWith('127.0.0.1')) return DEV_MAIN_DOMAIN
  return MAIN_DOMAIN
}

/**
 * Returns the current app origin (e.g. http://localhost:3000 in dev, https://usemaison.io in prod).
 */
export function getAppOrigin(): string {
  if (typeof window === 'undefined') {
    const protocol = IS_PRODUCTION ? 'https' : 'http'
    const port = IS_PRODUCTION ? '' : ':3000'
    return `${protocol}://${MAIN_DOMAIN}${port}`
  }
  const { protocol, hostname, port } = window.location
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//${hostname}${portSuffix}`
}

/**
 * Builds tenant subdomain URL (e.g. http://slug.localhost:3000/path or https://slug.usemaison.io/path).
 * Uses MAIN_DOMAIN, protocol (https in prod, http in dev), and port when in dev.
 */
export function getTenantAppUrl(slug: string, path: string = ''): string {
  const protocol = IS_PRODUCTION ? 'https' : 'http'
  const port = typeof window !== 'undefined' && !IS_PRODUCTION && window.location.port
    ? `:${window.location.port}`
    : ''
  const pathNorm = path.startsWith('/') ? path : `/${path}`
  return `${protocol}://${slug}.${MAIN_DOMAIN}${port}${pathNorm}`
}
