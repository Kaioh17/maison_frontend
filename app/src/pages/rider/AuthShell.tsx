import type { ReactNode } from 'react'
import { useFavicon } from '@hooks/useFavicon'
import { useTenantInfo } from '@hooks/useTenantInfo'
import PoweredByMaison from '@components/PoweredByMaison'
import BrandIcon from './BrandIcon'
import { RIDER_CSS } from './riderCss'

/** Sign in / sign up frame: the operator's mark and name centered above the form, one column. */
export default function AuthShell({ label, children }: { label: string; children: ReactNode }) {
  useFavicon()
  const { tenantInfo } = useTenantInfo()
  return (
    <div className="bw rdr-canvas">
      <style>{RIDER_CSS}</style>
      <main className="rdr rdr-auth rdr-auth-page" aria-label={label}>
        <div className="rdr-auth-brand">
          <BrandIcon tenantInfo={tenantInfo} size="xl" />
          <span>{tenantInfo?.company_name?.trim() || ''}</span>
        </div>
        {children}
        <PoweredByMaison />
      </main>
    </div>
  )
}
