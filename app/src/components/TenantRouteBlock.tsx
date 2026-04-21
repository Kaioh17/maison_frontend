import { isMainDomain } from '@utils/subdomain'
import { Navigate } from 'react-router-dom'

interface TenantRouteBlockProps {
  children: React.ReactNode
}

/**
 * Component that guards tenant routes from subdomains.
 * Tenant routes should only be accessible from the main domain.
 * If accessed from a subdomain, redirect to that subdomain's landing page.
 */
export default function TenantRouteBlock({ children }: TenantRouteBlockProps) {
  // On tenant subdomains, always fall back to the subdomain root landing page.
  if (!isMainDomain()) {
    return <Navigate to="/" replace />
  }

  // If on main domain, show children
  return <>{children}</>
}

