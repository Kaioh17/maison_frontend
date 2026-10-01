/// <reference lib="webworker" />

import { matchPrecache, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision?: string | null }>
}

/**
 * Only the static app shell is cached (the precache below). API responses,
 * auth responses and images are NEVER put in Cache Storage: they carry personal
 * data (rider names, phones, addresses) and tokens.
 */
const PRECACHE_PREFIX = 'workbox-precache'

// A new worker waits until the user accepts the "new version available" prompt;
// `updateSW(true)` from vite-plugin-pwa posts this message. No auto-reload.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop runtime caches left by older builds (they cached API/auth responses and navigations).
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => !k.startsWith(PRECACHE_PREFIX)).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

/**
 * PWA install metadata is served dynamically per Host by the backend. It must
 * always hit the network so each tenant gets its own manifest + icons.
 * Registered BEFORE `precacheAndRoute` so the precache route never sees these.
 */
const PWA_METADATA_PATTERNS: RegExp[] = [
  /^\/manifest\.webmanifest$/,
  /^\/apple-touch-icon(?:-[\w-]+)?(?:-precomposed)?\.png$/,
  /^\/icons\/icon(?:-[\w-]+)?\.png$/,
  /^\/favicon\.(?:png|ico|svg)$/,
  /^\/favicon-\d+x\d+\.png$/,
]

registerRoute(
  ({ url }) => url.hostname === self.location.hostname && PWA_METADATA_PATTERNS.some((re) => re.test(url.pathname)),
  new NetworkOnly(),
)

precacheAndRoute(self.__WB_MANIFEST, { cleanupOutdatedCaches: true })

/** Navigations: network first; when offline show the precached offline page (or app shell). */
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ request }) => {
    try {
      return await fetch(request)
    } catch {
      return (await matchPrecache('/offline.html')) ?? (await matchPrecache('/index.html')) ?? Response.error()
    }
  },
)
