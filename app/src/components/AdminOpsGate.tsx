import NotFound404 from './NotFound404'
import { isAdminDeveloperSubdomain } from '@utils/subdomain'

type AdminOpsGateProps = {
  children: React.ReactNode
}

/**
 * Renders children only on `admin.localhost` (or other *.localhost admin host) in non-production.
 * Main-domain URLs to the same path are blocked — use the admin subdomain.
 */
export default function AdminOpsGate({ children }: AdminOpsGateProps) {
  if (!isAdminDeveloperSubdomain()) {
    return <NotFound404 />
  }
  return <>{children}</>
}
