import { isLocalhost, isMainDomainHost } from '@utils/subdomain'

// API base URL - use environment variable or fallback smartly based on runtime
// - Docker: use relative '/api' which resolves to the container's base URL
// - Local dev: use environment variable or fallback to relative '/api'
// - For subdomains (e.g., ridez.localhost), always use relative '/api' to go through Vite proxy
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : ''
const runtimePort = typeof window !== 'undefined' ? window.location.port : ''
const apiPort = import.meta.env.VITE_API_PORT || '8000'
const isLocalVite = isLocalhost(runtimeHost) && (runtimePort === '5173' || runtimePort === '3001')
const isLocalPort3000 = isLocalhost(runtimeHost) && runtimePort === '3000'

// Check if we're on a subdomain (e.g., ridez.localhost, tenant.example.com)
const isSubdomain = typeof window !== 'undefined' && !isMainDomainHost(runtimeHost)

// For subdomains, always use relative '/api' to go through Vite proxy
const FALLBACK_API_BASE = isSubdomain
  ? '/api'
  : (isLocalVite || isLocalPort3000) 
    ? `http://${runtimeHost}:${apiPort}/api` 
    : '/api'

export const API_BASE = import.meta.env.VITE_API_BASE || FALLBACK_API_BASE;

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export type SubscriptionPlanKey = 'starter' | 'growth' | 'fleet'

/**
 * Stripe subscription Price IDs from `.env`:
 * `VITE_STRIPE_PRICE_STARTER`, `VITE_STRIPE_PRICE_GROWTH`, `VITE_STRIPE_PRICE_FLEET`.
 */
export function getStripeSubscriptionPriceId(plan: SubscriptionPlanKey): string {
  const ids: Record<SubscriptionPlanKey, string> = {
    starter: import.meta.env.VITE_STRIPE_PRICE_STARTER ?? '',
    growth: import.meta.env.VITE_STRIPE_PRICE_GROWTH ?? '',
    fleet: import.meta.env.VITE_STRIPE_PRICE_FLEET ?? '',
  }
  return ids[plan]
}

/** Shared `X-API-Key` for `/api/v1/auth/**` and public `GET /api/v1/driver/{slug}/verify`. */
export const AUTH_API_KEY = import.meta.env.VITE_API_KEY || '';

export type UserRole = 'tenant' | 'driver' | 'rider' | 'admin';

export const REFRESH_ENDPOINT_BY_ROLE: Record<UserRole, string> = {
  tenant: '/v1/auth/refresh/manual',
  driver: '/v1/auth/refresh',
  rider: '/v1/auth/refresh',
  admin: '/v1/auth/refresh',
}; 