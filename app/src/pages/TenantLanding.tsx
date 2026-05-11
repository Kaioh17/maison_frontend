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
          minHeight: '100vh',
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

  const resolveRoute = (action?: StorefrontAction | null) => {
    if (!action?.route) return '#'
    const routeMap: Record<string, string> = {
      rider_login: '/riders/login',
      rider_signup: '/riders/register',
      driver_login: '/driver/login',
    }
    return routeMap[action.route] || '#'
  }

  if (!storefront && error) {
    return (
      <main className="bw" style={{ margin: 0, padding: '48px 24px', minHeight: '100vh', backgroundColor: 'var(--bw-bg)' }}>
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
          minHeight: '100vh',
          backgroundColor: premium.palette.background,
          color: premium.palette.text,
          fontFamily: 'Work Sans, sans-serif',
        }}
      >
        <div className="tl-premium-shell" style={{ maxWidth: 1120, margin: '0 auto' }}>
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

  return (
    <main
      className="bw"
      aria-label={`${companyName} home`}
      style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        backgroundColor: 'var(--bw-bg)',
      }}
    >
      <div
        className="tl-default-shell"
        style={{
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <header
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(36px, 7vw, 64px)',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(30px, 5.5vw, 44px)',
              fontWeight: 600,
              color: 'var(--bw-text)',
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            {defaultStorefront.wordmark}
          </h1>
        </header>

        <section
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(40px, 8vw, 72px)',
          }}
        >
          <p
            className="small-muted"
            style={{
              margin: '0 0 12px 0',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily: 'Work Sans, sans-serif',
              color: 'var(--bw-text)',
              opacity: 0.55,
            }}
          >
            {defaultStorefront.welcome_label}
          </p>
          <h2
            style={{
              margin: '0 0 16px 0',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 200,
              fontSize: 'clamp(30px, 6vw, 46px)',
              lineHeight: 1.12,
              color: 'var(--bw-text)',
            }}
          >
            {defaultStorefront.hero_title}
          </h2>
          <p
            style={{
              margin: 0,
              fontFamily: 'Work Sans, sans-serif',
              fontSize: 'clamp(15px, 2.4vw, 18px)',
              fontWeight: 300,
              lineHeight: 1.65,
              color: 'var(--bw-text)',
              opacity: 0.88,
              maxWidth: 540,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {defaultStorefront.hero_description}
          </p>
        </section>

        <div
          className="tl-default-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(18px, 3vw, 26px)',
          }}
        >
          <article
            className="bw-card tl-default-card"
            style={{
              padding: 'clamp(24px, 4vw, 34px)',
              border: '1px solid var(--bw-border)',
              borderRadius: 12,
              backgroundColor: 'var(--bw-card-bg, var(--bw-bg-secondary))',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                backgroundColor: 'rgba(108, 99, 232, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <UserCircle size={30} weight="duotone" style={{ color: 'var(--bw-accent)' }} aria-hidden />
            </div>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: 'clamp(18px, 2.5vw, 21px)',
                fontWeight: 600,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)',
              }}
            >
              {defaultStorefront.rider_card.title}
            </h3>
            <p
              style={{
                margin: '0 0 26px 0',
                flex: 1,
                fontSize: 14,
                lineHeight: 1.55,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)',
                opacity: 0.82,
              }}
            >
              {defaultStorefront.rider_card.description}
            </p>
            <div className="tl-default-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to={resolveRoute(defaultStorefront.rider_card.primary_cta)}
                className="bw-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  borderRadius: 0,
                  padding: '14px 22px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 500,
                  background: '#ffffff',
                  color: '#111827',
                  border: '1px solid #111827',
                }}
              >
                {defaultStorefront.rider_card.primary_cta.label}
                <ArrowRight size={18} aria-hidden color="#111827" />
              </Link>
              {defaultStorefront.rider_card.secondary_cta ? (
                <Link
                  to={resolveRoute(defaultStorefront.rider_card.secondary_cta)}
                  className="bw-btn-outline"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    textDecoration: 'none',
                    borderRadius: 0,
                    padding: '14px 22px',
                    fontFamily: 'Work Sans, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  {defaultStorefront.rider_card.secondary_cta.label}
                </Link>
              ) : null}
            </div>
          </article>

          <article
            className="bw-card tl-default-card"
            style={{
              padding: 'clamp(24px, 4vw, 34px)',
              border: '1px solid var(--bw-border)',
              borderRadius: 12,
              backgroundColor: 'var(--bw-card-bg, var(--bw-bg-secondary))',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                backgroundColor: 'rgba(34, 197, 94, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Car size={30} weight="duotone" style={{ color: '#22c55e' }} aria-hidden />
            </div>
            <h3
              style={{
                margin: '0 0 12px 0',
                fontSize: 'clamp(18px, 2.5vw, 21px)',
                fontWeight: 600,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)',
              }}
            >
              {defaultStorefront.driver_card.title}
            </h3>
            <p
              style={{
                margin: '0 0 26px 0',
                flex: 1,
                fontSize: 14,
                lineHeight: 1.55,
                fontFamily: 'Work Sans, sans-serif',
                color: 'var(--bw-text)',
                opacity: 0.82,
              }}
            >
              {defaultStorefront.driver_card.description}
            </p>
            <div className="tl-default-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to={resolveRoute(defaultStorefront.driver_card.primary_cta)}
                className="bw-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  borderRadius: 0,
                  padding: '14px 22px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: 500,
                  background: '#ffffff',
                  color: '#111827',
                  border: '1px solid #111827',
                }}
              >
                {defaultStorefront.driver_card.primary_cta.label}
                <ArrowRight size={18} aria-hidden color="#111827" />
              </Link>
            </div>
          </article>
        </div>

        <footer className="tl-default-footer" style={{ marginTop: 28, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--bw-text)', opacity: 0.55 }}>
            {defaultStorefront.footer.copyright}
          </p>
        </footer>
      </div>
    </main>
  )
}
