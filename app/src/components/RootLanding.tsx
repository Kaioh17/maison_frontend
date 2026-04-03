import SlugVerification from '@components/SlugVerification'
import { isAdminDeveloperSubdomain, isMainDomain } from '@utils/subdomain'
import { Navigate } from 'react-router-dom'
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
  if (isMainDomain()) {
    return <MainLanding />
  }
  if (isAdminDeveloperSubdomain()) {
    return <Navigate to="/operations" replace />
  }
  return (
    <SlugVerification>
      <TenantLanding />
    </SlugVerification>
  )
}
