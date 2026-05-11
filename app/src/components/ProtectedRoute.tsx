import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { UserRole } from '@config'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'

export default function ProtectedRoute({ allowRoles, children }: { allowRoles: UserRole[]; children: ReactNode }) {
  const { accessToken, role, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const slug = useTenantSlug()
  const loadingPalette = resolveSubdomainLoadingPalette(slug)

  // Determine redirect path based on role and slug
  const getLoginPath = () => {
    if (role === 'rider') {
      // Riders must have a valid subdomain
      return '/riders/login'
    }
    if (role === 'tenant') {
      return '/tenant/login'
    }
    if (role === 'driver') {
      // Drivers must have a valid subdomain
      return '/driver/login'
    }
    return '/tenant/login' // Default to tenant login
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !accessToken) {
    return <Navigate to={getLoginPath()} state={{ from: location }} replace />
  }

  // If role doesn't match allowed roles, redirect to login
  if (role && !allowRoles.includes(role)) {
    return <Navigate to={getLoginPath()} replace />
  }

  // If we have a token but no role yet, show loading
  if (accessToken && !role) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: loadingPalette.bg,
        }}
      >
        <div
          className="animate-spin"
          aria-label="Loading"
          style={{
            width: 32,
            height: 32,
            borderRadius: '999px',
            border: `2px solid ${loadingPalette.border}`,
            borderTopColor: loadingPalette.accent,
          }}
        />
      </div>
    )
  }

  return <>{children}</>
} 