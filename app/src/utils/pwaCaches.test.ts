import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearRuntimeCaches } from './pwaCaches'

describe('clearRuntimeCaches', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('deletes every cache except the precached app shell', async () => {
    const del = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue(['workbox-precache-v2-https://x/', 'maison-api-v2', 'maison-auth-v1']),
      delete: del,
    })
    await clearRuntimeCaches()
    expect(del.mock.calls.map((c) => c[0]).sort()).toEqual(['maison-api-v2', 'maison-auth-v1'])
  })

  it('does not throw when Cache Storage is unavailable', async () => {
    vi.stubGlobal('caches', undefined)
    await expect(clearRuntimeCaches()).resolves.toBeUndefined()
    vi.stubGlobal('caches', { keys: () => Promise.reject(new Error('blocked')), delete: vi.fn() })
    await expect(clearRuntimeCaches()).resolves.toBeUndefined()
  })
})
