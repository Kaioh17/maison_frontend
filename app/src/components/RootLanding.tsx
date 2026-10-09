import SlugVerification from '@components/SlugVerification'
import { isAdminAppSubdomain, isMainDomain, isTenantAppSubdomain } from '@utils/subdomain'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import { isStandalone } from '@hooks/useInstallApp'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { brandingFontVars } from '@utils/colorTokens'
import type { CSSProperties, LazyExoticComponent, ReactNode } from 'react'
import type { ComponentType } from 'react'

type RootLandingProps = {
  MainLanding: LazyExoticComponent<ComponentType>
  TenantLanding: LazyExoticComponent<ComponentType>
}

/** Carries the tenant's fonts to the landing page when their scope includes it. `display: contents` adds no box. */
function LandingFonts({ children }: { children: ReactNode }) {
  const branding = useTenantInfo().tenantInfo?.branding
  const vars = branding?.enable_branding ? brandingFontVars(branding, 'landing') : {}
  return <div style={{ display: 'contents', ...vars } as CSSProperties}>{children}</div>
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
  if (isTenantAppSubdomain()) {
    if (isAuthenticated && role === 'tenant') {
      return <Navigate to="/tenant/overview" replace />
    }
    return <Navigate to="/tenant/login" replace />
  }
  // Fallback for installs whose manifest start_url was ignored or predates per-role manifests:
  // an installed app opened at "/" while signed in goes straight to that role's home.
  if (isStandalone() && isAuthenticated) {
    if (role === 'rider') return <Navigate to="/rider/dashboard" replace />
    if (role === 'driver') return <Navigate to="/driver/dashboard" replace />
  }
  return (
    <SlugVerification>
      <LandingFonts>
        <TenantLanding />
      </LandingFonts>
    </SlugVerification>
  )
}
