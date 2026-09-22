import { useEffect, useState } from 'react'
import { http } from './http'

export type DemoRole = 'tenant' | 'driver' | 'rider'
export type DemoCredentials = { email: string; password: string }

/** Backend-flagged demo credentials (DEMO_* env). Resolves null for any non-demo tenant. */
export async function getDemoCredentials(role: DemoRole, slug?: string | null): Promise<DemoCredentials | null> {
  try {
    const { data } = await http.get(`/v1/demo/credentials/${role}`, { params: slug ? { slug } : undefined })
    return data?.data ?? null
  } catch {
    return null
  }
}

/** Credentials for driver/rider login pages on the demo subdomain; null everywhere else. */
export function useDemoCredentials(role: 'driver' | 'rider', slug: string | null | undefined) {
  const [creds, setCreds] = useState<DemoCredentials | null>(null)
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    getDemoCredentials(role, slug).then((c) => !cancelled && setCreds(c))
    return () => {
      cancelled = true
    }
  }, [role, slug])
  return creds
}
