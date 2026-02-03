import { isMainDomain } from '@utils/subdomain'
import TenantRoute404 from './TenantRoute404'

interface TenantRouteBlockProps {
  children: React.ReactNode
}

/**
 * Component that blocks tenant routes when accessed via subdomain
 * Tenant routes should only be accessible from the main domain
 * If accessed from a subdomain, shows a 404 page with driver/rider options
 */
export default function TenantRouteBlock({ children }: TenantRouteBlockProps) {
  // If on subdomain, show 404 with driver/rider options
  if (!isMainDomain()) {
    return <TenantRoute404 />
  }

  // If on main domain, show children
  return <>{children}</>
}

