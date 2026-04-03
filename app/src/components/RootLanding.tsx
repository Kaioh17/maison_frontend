import SlugVerification from '@components/SlugVerification'
import { isAdminAppSubdomain, isMainDomain } from '@utils/subdomain'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import type { LazyExoticComponent } from 'react'
import type { ComponentType } from 'react'

type RootLandingProps = {
  MainLanding: LazyExoticComponent<ComponentType>
  TenantLanding: LazyExoticComponent<ComponentType>
}

/**
 * `/` on the marketing domain → main product landing.
 * `/` on `https://{slug}.{domain}/` → tenant-branded home for riders and drivers.
 */
export default function RootLanding({ MainLanding, TenantLanding }: RootLandingProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)

  if (isMainDomain()) {
    return <MainLanding />
  }
  if (isAdminAppSubdomain()) {
    if (isAuthenticated && role === 'admin') {
      return <Navigate to="/operations" replace />
    }
    return <Navigate to="/login" replace />
  }
  return (
    <SlugVerification>
      <TenantLanding />
    </SlugVerification>
  )
}
