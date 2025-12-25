import { ReactNode } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { UserRole } from '@config'

export default function ProtectedRoute({ allowRoles, children }: { allowRoles: UserRole[]; children: ReactNode }) {
  const { accessToken, role, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const { slug } = useParams<{ slug?: string }>()

  // Determine redirect path based on role and slug
  const getLoginPath = () => {
    if (role === 'rider' && slug) {
      return `/${slug}/riders/login`
    }
    if (role === 'tenant') {
      return '/tenant/login'
    }
    if (role === 'driver') {
      return '/driver' // Drivers might have their own login, adjust if needed
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
} 