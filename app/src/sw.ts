/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision?: string | null }>
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clientsClaim())
})

function isApiRequest(url: URL, request: Request): boolean {
  if (request.mode === 'navigate') return false
  const path = url.pathname
  if (path === '/api' || path.startsWith('/api/')) return true
  // Dedicated API host: paths like `/v1/...` (see `src/api/http.ts` + `API_BASE`)
  if (url.hostname !== self.location.hostname && /^\/v1\//.test(path)) return true
  return false
}

/**
 * PWA install metadata is served dynamically per Host by the backend. Caching
 * it in the service worker would shadow tenant-specific branding because the
 * SW is registered against a single subdomain and the first response would be
 * reused across navigations. Force-network for these so each install fetches
 * the right manifest + apple-touch-icon for the current tenant.
 *
 * Registered BEFORE `precacheAndRoute` so the precache route never sees these
 * requests (Workbox matches routes in registration order).
 */
const PWA_METADATA_PATTERNS: RegExp[] = [
  /^\/manifest\.webmanifest$/,
  /^\/apple-touch-icon(?:-[\w-]+)?(?:-precomposed)?\.png$/,
  /^\/icons\/icon(?:-[\w-]+)?\.png$/,
  /^\/favicon1\.png$/,
  /^\/favicon\.(?:png|ico|svg)$/,
]

function isPwaMetadataRequest(url: URL): boolean {
  if (url.hostname !== self.location.hostname) return false
  return PWA_METADATA_PATTERNS.some((re) => re.test(url.pathname))
}

registerRoute(
  ({ url }) => isPwaMetadataRequest(url),
  new NetworkOnly(),
)

// Precaching of build assets is registered AFTER the PWA-metadata bypass so
// it can never intercept manifest/icon URLs even if a stale precache entry
// existed from an older deploy.
precacheAndRoute(self.__WB_MANIFEST, { cleanupOutdatedCaches: true })

/** Network-first for API traffic; failures pass through (no stale auth JSON). */
registerRoute(
  ({ url, request }) => isApiRequest(url, request),
  new NetworkFirst({
    cacheName: 'maison-api-v1',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 24 * 60 * 60,
      }),
    ],
  }),
)

/** Cache-first for static asset requests. */
registerRoute(
  ({ url, request }) => {
    if (isPwaMetadataRequest(url)) return false
    return (
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font'
    )
  },
  new CacheFirst({
    cacheName: 'maison-static-v1',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
)

/** Navigations: try network, then cache; if unavailable show offline shell. */
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'maison-nav-v1',
    networkTimeoutSeconds: 5,
    plugins: [
      {
        handlerDidError: async () => {
          const offline = await caches.match('/offline.html')
          if (offline) return offline
          const index = await caches.match('/index.html')
          if (index) return index
          return Response.error()
        },
      },
    ],
  }),
)
