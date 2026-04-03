import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { isAdminAppSubdomain } from '@utils/subdomain'

/**
 * Restricts admin UI to `admin.{MAIN_DOMAIN}` and a valid admin JWT.
 */
export default function AdminOpsGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, role, accessToken } = useAuthStore()

  if (!isAdminAppSubdomain()) {
    return <Navigate to="/" replace />
  }
  if (!isAuthenticated || !accessToken || role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
