/**
 * Cache Storage should hold only the precached app shell. Called on logout so
 * nothing else (e.g. from an older build) outlives the session.
 */
export async function clearRuntimeCaches() {
  if (typeof caches === 'undefined') return
  try {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => !k.startsWith('workbox-precache')).map((k) => caches.delete(k)))
  } catch {
    // Cache Storage can be unavailable (private mode); nothing to clear then.
  }
}
