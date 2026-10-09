import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Which role app a path belongs to; null for everything else (landing, tenant dashboard, legal). */
export function roleForPath(pathname: string): 'driver' | 'rider' | null {
  if (/^\/driver(\/|$)/.test(pathname)) return 'driver'
  if (/^\/(riders?|booking)(\/|$)/.test(pathname)) return 'rider'
  return null
}

/**
 * Points `<link rel="manifest">` at the role's manifest so "Add to Home Screen" from a driver or rider
 * page installs an app that launches into that role (`start_url`) instead of the tenant landing page.
 * Browsers read the link at install time, so it must match the page the user is on.
 */
export function useRoleManifest() {
  const { pathname } = useLocation()
  const role = roleForPath(pathname)

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel='manifest']")
    if (link) link.href = role ? `/manifest.webmanifest?role=${role}` : '/manifest.webmanifest'
  }, [role])
}
