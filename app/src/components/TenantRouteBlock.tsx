import { isTenantAppSubdomain } from '@utils/subdomain'
import { getTenantAppUrl } from '@config/host'
import { useLocation } from 'react-router-dom'

interface TenantRouteBlockProps {
  children: React.ReactNode
}

/**
 * Component that guards tenant-operator routes to the dedicated
 * `app.{MAIN_DOMAIN}` subdomain (same pattern as AdminSubdomainGuard for
 * `admin.{MAIN_DOMAIN}`). Tenant routes used to live on the main domain;
 * this is a hard cutover, so anything hitting an old `/tenant/*` link from
 * the apex, a rider/driver tenant-slug subdomain, or anywhere else gets a
 * full cross-origin redirect to the same path on `app.{MAIN_DOMAIN}` rather
 * than a 404 or a client-side `<Navigate>` (which can't change origin).
 */
export default function TenantRouteBlock({ children }: TenantRouteBlockProps) {
  const location = useLocation()

  if (!isTenantAppSubdomain()) {
    if (typeof window !== 'undefined') {
      window.location.href = getTenantAppUrl('app', location.pathname + location.search)
    }
    return null
  }

  return <>{children}</>
}
