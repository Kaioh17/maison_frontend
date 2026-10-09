import type { TenantInfo } from '@hooks/useTenantInfo'

/** Tenant mark: favicon (an icon) or logo (often a wordmark, so it is inset), else the company initial. */
export default function BrandIcon({ tenantInfo, size = 'md' }: { tenantInfo: TenantInfo | null; size?: 'md' | 'lg' | 'xl' }) {
  const src = tenantInfo?.favicon_url || tenantInfo?.logo_url
  const name = tenantInfo?.company_name?.trim() || ''
  return (
    <span className={`rdr-icon${tenantInfo?.favicon_url ? '' : ' is-logo'}${size === 'md' ? '' : ` is-${size}`}`} aria-hidden>
      {src ? <img src={src} alt="" /> : name.charAt(0).toUpperCase()}
    </span>
  )
}
