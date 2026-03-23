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

/** Stripe subscription Price IDs — test/dev (current sandbox prices). */
const STRIPE_PRICE_ID_DEV = {
  starter: 'price_1ShzxJQtWPwjkVcEAMWx8Sgq',
  growth: 'price_1Si00KQtWPwjkVcEa7LKC5EM',
  fleet: 'price_1Si01bQtWPwjkVcEMk6XJREA',
} as const

/** Stripe subscription Price IDs — production. */
const STRIPE_PRICE_ID_PROD = {
  starter: 'price_1TDvIxJPGLvkvoDLQhKTg29a',
  growth: 'price_1TDvNjJPGLvkvoDLLkMZWP9n',
  fleet: 'price_1TDvQRJPGLvkvoDLIr6C97KN',
} as const

export type SubscriptionPlanKey = keyof typeof STRIPE_PRICE_ID_DEV

/**
 * Resolves Stripe Price ID for tenant subscription plans.
 * - `import.meta.env.PROD` → production IDs; otherwise dev/test IDs.
 * - Optional overrides: `VITE_STRIPE_PRICE_STARTER`, `VITE_STRIPE_PRICE_GROWTH`, `VITE_STRIPE_PRICE_FLEET`.
 */
export function getStripeSubscriptionPriceId(plan: SubscriptionPlanKey): string {
  const envMap: Record<SubscriptionPlanKey, string | undefined> = {
    starter: import.meta.env.VITE_STRIPE_PRICE_STARTER,
    growth: import.meta.env.VITE_STRIPE_PRICE_GROWTH,
    fleet: import.meta.env.VITE_STRIPE_PRICE_FLEET,
  }
  const fromEnv = envMap[plan]
  if (fromEnv && fromEnv.length > 0) return fromEnv
  const table = import.meta.env.PROD ? STRIPE_PRICE_ID_PROD : STRIPE_PRICE_ID_DEV
  return table[plan]
}

/** Shared secret for `/api/v1/auth/**` — set per environment; never commit production values. */
export const AUTH_API_KEY = import.meta.env.VITE_API_KEY || '';

export type UserRole = 'tenant' | 'driver' | 'rider' | 'admin';

export const REFRESH_ENDPOINT_BY_ROLE: Record<UserRole, string> = {
  tenant: '/v1/auth/refresh/manual',
  driver: '/v1/auth/refresh',
  rider: '/v1/auth/refresh',
  admin: '/v1/auth/refresh',
}; 