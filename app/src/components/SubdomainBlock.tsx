import { isMainDomain, isTenantAppSubdomain } from '@utils/subdomain'
import NotFound404 from './NotFound404'

interface SubdomainBlockProps {
  children: React.ReactNode
}

/**
 * Component that blocks access when accessed via a tenant-slug subdomain.
 * Used to prevent rider/driver white-label subdomains from reaching landing pages
 * and other root-only routes. The operator host (`app.{MAIN_DOMAIN}`) is allowed
 * too: its login page links to /signup and /forgot-password.
 */
export default function SubdomainBlock({ children }: SubdomainBlockProps) {
  // If on a tenant-slug subdomain, show 404
  if (!isMainDomain() && !isTenantAppSubdomain()) {
    return <NotFound404 />
  }

  // If on main domain or the operator app host, show children
  return <>{children}</>
}

