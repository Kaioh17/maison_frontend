import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCircle, Car, ArrowRight } from '@phosphor-icons/react'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { useFavicon } from '@hooks/useFavicon'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'
import './tenant-landing.css'
import {
  getTenantStorefront,
  type DefaultStorefrontData,
  type PremiumStorefrontData,
  type StorefrontAction,
  type StorefrontData,
} from '@api/tenant'

/**
 * Tenant white-label home at https://{slug}.{domain}/ — entry for riders and drivers.
 */
export default function TenantLanding() {
  useFavicon()
  const slug = useTenantSlug()
  const loadingPalette = resolveSubdomainLoadingPalette(slug)
  const [storefront, setStorefront] = useState<StorefrontData | null>(null)
  const [tenantLoading, setTenantLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setStorefront(null)
      setTenantLoading(false)
      setError('Tenant slug is missing.')
      return
    }

    let active = true

    const fetchStorefront = async () => {
      try {
        setTenantLoading(true)
        setError(null)
        const response = await getTenantStorefront(slug)
        if (!active) return

        if (response.success && response.data) {
          setStorefront(response.data)
          return
        }

        setStorefront(null)
        setError(response.message || 'This tenant could not be loaded.')
      } catch (err: any) {
        if (!active) return
        setStorefront(null)
        setError(err.response?.data?.detail || err.message || 'This tenant could not be loaded.')
      } finally {
        if (active) {
          setTenantLoading(false)
        }
      }
    }

    fetchStorefront()

    return () => {
      active = false
    }
  }, [slug])

  if (tenantLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'var(--app-h)',
          backgroundColor: loadingPalette.bg,
        }}
      >
        <div
          style={{
            color: loadingPalette.text,
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '16px',
          }}
        >
          Loading…
        </div>
      </div>
    )
  }

  const companyName = storefront?.tenant_name?.trim() || slug || 'Our service'

  const isBookRideCta = (action?: StorefrontAction | null) => {
    if (!action?.label) return false
    return /\bbook(?:\s+a)?\s+ride\b/i.test(action.label)
  }

  const resolveRoute = (action?: StorefrontAction | null) => {
    if (!action?.route) return '#'
    if (isBookRideCta(action)) return '/riders/login'
    const routeMap: Record<string, string> = {
      rider_login: '/riders/login',
      rider_signup: '/riders/register',
      driver_login: '/driver/login',
    }
    return routeMap[action.route] || '#'
  }

  if (!storefront && error) {
    return (
      <main className="bw" style={{ margin: 0, padding: '48px 24px', minHeight: 'var(--app-h)', backgroundColor: 'var(--bw-bg)' }}>
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            textAlign: 'center',
            color: 'var(--bw-error)',
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '16px',
          }}
        >
          {error || 'This tenant could not be loaded.'}
        </div>
      </main>
    )
  }

  if (!storefront) {
    return null
  }

  if (storefront.template === 'premium') {
    const premium = storefront as PremiumStorefrontData
    const primaryCtaLabelColor =
      premium.palette.button_text?.trim() || premium.palette.text
    const fadedMuted = `color-mix(in srgb, ${premium.palette.muted} 34%, transparent)`
    return (
      <main
        className="tl-premium-main"
        aria-label={`${companyName} home`}
        style={{
          margin: 0,
          minHeight: 'var(--app-h)',
          backgroundColor: premium.palette.background,
          color: premium.palette.text,
          fontFamily: 'Work Sans, sans-serif',
        }}
      >
        <div className="tl-premium-shell" style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 14,
            }}
          >
            <Link
              to="/driver/start"
              className="tl-premium-driver-hint"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '7px 13px',
                borderRadius: 999,
                border: `0.5px solid ${fadedMuted}`,
                backgroundColor: `color-mix(in srgb, ${premium.palette.muted} 8%, transparent)`,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.04em',
                color: premium.palette.muted,
                textDecoration: 'none',
              }}
            >
              Driver?
            </Link>
          </div>
          <header style={{ marginBottom: 28 }}>
            <p
              style={{
                margin: 0,
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 22,
                padding: '0 10px',
                borderRadius: 999,
                border: `0.5px solid ${fadedMuted}`,
                backgroundColor: `color-mix(in srgb, ${premium.palette.muted} 10%, transparent)`,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontSize: 11,
                fontWeight: 500,
                color: premium.palette.muted,
              }}
            >
              {premium.caption}
            </p>
            <h1
              style={{
                margin: '12px 0 0 0',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 600,
                lineHeight: 1.18,
                letterSpacing: '-0.01em',
              }}
            >
              {premium.wordmark}
            </h1>
          </header>

          <section style={{ marginBottom: 28 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(22px, 3.2vw, 34px)',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {premium.hero.title}
            </h2>
            <p
              style={{
                margin: '12px 0 0 0',
                fontSize: 'clamp(15px, 1.35vw, 18px)',
                fontWeight: 400,
                lineHeight: 1.65,
                color: premium.palette.muted,
              }}
            >
              {premium.hero.supporting}
            </p>
          </section>

          <section
            className="tl-premium-cta-row"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}
          >
            <Link
              to={resolveRoute(premium.ctas.primary)}
              className="tl-premium-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                borderRadius: 999,
                padding: '13px 18px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: premium.palette.accent,
                color: primaryCtaLabelColor,
              }}
            >
              {premium.ctas.primary.label}
            </Link>
            <Link
              to={resolveRoute(premium.ctas.secondary)}
              className="tl-premium-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                borderRadius: 999,
                padding: '13px 18px',
                fontSize: 14,
                fontWeight: 400,
                border: `0.5px solid ${premium.palette.muted}`,
                color: premium.palette.muted,
                backgroundColor: 'transparent',
              }}
            >
              {premium.ctas.secondary.label}
            </Link>
          </section>

          <section
            className="tl-premium-props"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              marginBottom: 28,
            }}
          >
            {premium.value_props.map((item, index) => {
              const isLast = index === premium.value_props.length - 1
              return (
                <article
                  key={item.title}
                  style={{
                    padding: '12px 0',
                    borderBottom: isLast ? 'none' : `0.5px solid ${fadedMuted}`,
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 6px 0',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: premium.palette.muted,
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    {item.description}
                  </p>
                </article>
              )
            })}
          </section>

          <p
            style={{
              margin: '36px 0 28px 0',
              color: premium.palette.muted,
              textAlign: 'center',
              fontSize: 12,
              fontStyle: 'italic',
            }}
          >
            {premium.trust_line}
          </p>

          <footer style={{ borderTop: `0.5px solid ${fadedMuted}`, paddingTop: 18 }}>
            <p style={{ margin: 0, color: premium.palette.muted, fontSize: 12 }}>
              {premium.footer.copyright}
            </p>
            {premium.footer.links.length > 0 ? (
              <div
                className="tl-premium-footer-links"
                style={{ display: 'flex', gap: 6, marginTop: 12 }}
              >
                {premium.footer.links.map((link) => (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      minHeight: 38,
                      textDecoration: 'none',
                      borderRadius: 10,
                      border: `0.5px solid ${fadedMuted}`,
                      padding: '0 12px',
                      color: premium.palette.muted,
                      fontSize: 12,
                    }}
                  >
                    <span>{link.label}</span>
                    <span style={{ color: premium.palette.text, fontSize: 13 }}>{link.value}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </footer>
        </div>
      </main>
    )
  }

  const defaultStorefront = storefront as DefaultStorefrontData
  const { rider_card: riderCard, driver_card: driverCard } = defaultStorefront

  return (
    <main className="tl-default-main" aria-label={`${companyName} home`}>
      <header className="tl-default-brand">{defaultStorefront.wordmark}</header>

      <div className="tl-default-shell">
        <section className="tl-default-hero">
          <p className="tl-default-eyebrow">
            <span className="tl-default-eyebrow-dot" aria-hidden />
            {defaultStorefront.welcome_label}
          </p>
          <h1 className="tl-default-title">{defaultStorefront.hero_title}</h1>
          <p className="tl-default-lede">{defaultStorefront.hero_description}</p>
        </section>

        <div className="tl-default-grid">
          <article className="tl-default-card tl-default-card--rider">
            <div className="tl-default-icon">
              <UserCircle size={26} weight="duotone" aria-hidden />
            </div>
            <h2 className="tl-default-card-title">{riderCard.title}</h2>
            <p className="tl-default-card-text">{riderCard.description}</p>
            <div className="tl-default-actions">
              <Link to={resolveRoute(riderCard.primary_cta)} className="btn btn-primary">
                {riderCard.primary_cta.label}
                <ArrowRight size={18} aria-hidden />
              </Link>
              {riderCard.secondary_cta ? (
                <Link to={resolveRoute(riderCard.secondary_cta)} className="btn btn-secondary">
                  {riderCard.secondary_cta.label}
                </Link>
              ) : null}
            </div>
          </article>

          <article className="tl-default-card tl-default-card--driver">
            <div className="tl-default-icon">
              <Car size={26} weight="duotone" aria-hidden />
            </div>
            <h2 className="tl-default-card-title">{driverCard.title}</h2>
            <p className="tl-default-card-text">{driverCard.description}</p>
            <div className="tl-default-actions">
              <Link to={resolveRoute(driverCard.primary_cta)} className="btn btn-secondary">
                {driverCard.primary_cta.label}
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </article>
        </div>
      </div>

      <footer className="tl-default-footer">{defaultStorefront.footer.copyright}</footer>
    </main>
  )
}
