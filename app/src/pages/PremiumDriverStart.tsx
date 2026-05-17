import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CaretLeft, CaretRight, Car, EnvelopeSimple, Phone } from '@phosphor-icons/react'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'
import {
  getTenantStorefront,
  type PremiumStorefrontData,
  type StorefrontData,
} from '@api/tenant'
import './tenant-landing.css'

/**
 * Premium storefront only: explains driver sign-in vs onboarding and surfaces tenant contact.
 * Routed from the tenant home “driver?” link (`/driver/start`).
 */
export default function PremiumDriverStart() {
  useFavicon()
  const slug = useTenantSlug()
  const { tenantInfo } = useTenantInfo()
  const loadingPalette = resolveSubdomainLoadingPalette(slug)
  const [storefront, setStorefront] = useState<StorefrontData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setStorefront(null)
      setLoading(false)
      return
    }
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await getTenantStorefront(slug)
        if (!active) return
        if (res.success && res.data) setStorefront(res.data)
        else setStorefront(null)
      } catch {
        if (active) setStorefront(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [slug])

  if (!slug) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: loadingPalette.bg,
          color: loadingPalette.text,
          fontFamily: 'Work Sans, sans-serif',
          fontSize: 15,
        }}
      >
        Loading…
      </div>
    )
  }

  if (!storefront || storefront.template !== 'premium') {
    return <Navigate to="/" replace />
  }

  const premium = storefront as PremiumStorefrontData
  const fadedMuted = `color-mix(in srgb, ${premium.palette.muted} 34%, transparent)`
  const company =
    tenantInfo?.company_name?.trim() || premium.tenant_name?.trim() || premium.wordmark || 'Dispatch'

  const phoneRaw = tenantInfo?.contact_phone?.trim()
  const emailRaw = tenantInfo?.contact_email?.trim()

  const footerTel = premium.footer.links.find((l) => l.href.startsWith('tel:'))
  const footerMail = premium.footer.links.find((l) => l.href.startsWith('mailto:'))

  const phoneDisplay = phoneRaw || footerTel?.value
  const phoneHref = phoneRaw
    ? `tel:${phoneRaw.replace(/\D/g, '')}`
    : footerTel?.href
  const emailDisplay = emailRaw || footerMail?.value
  const emailHref = emailRaw ? `mailto:${emailRaw}` : footerMail?.href

  const cardBase = {
    padding: 'clamp(16px, 3vw, 22px)',
    borderRadius: 14,
    border: `0.5px solid ${fadedMuted}`,
    backgroundColor: `color-mix(in srgb, ${premium.palette.muted} 7%, transparent)`,
  } as const

  const expectations = [
    'Dispatch adds you (or sends an invite) before you can sign in—accounts are not opened automatically from this page.',
    'You’ll verify your email or token, create a password, and finish any steps your company requires.',
    'You may be asked for license, insurance, and vehicle details so trips stay compliant.',
    'Once active, use driver sign-in anytime on this same site (your company’s link).',
  ]

  return (
    <main
      style={{
        margin: 0,
        minHeight: '100vh',
        backgroundColor: premium.palette.background,
        color: premium.palette.text,
        fontFamily: 'Work Sans, sans-serif',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 0,
              fontSize: 13,
              fontWeight: 500,
              color: premium.palette.muted,
              textDecoration: 'none',
            }}
          >
            <CaretLeft size={16} aria-hidden />
            Back to home
          </Link>
          <p
            style={{
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 10px',
              minHeight: 22,
              borderRadius: 999,
              border: `0.5px solid ${fadedMuted}`,
              backgroundColor: `color-mix(in srgb, ${premium.palette.muted} 10%, transparent)`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 11,
              fontWeight: 500,
              color: premium.palette.muted,
            }}
          >
            <Car size={14} weight="duotone" aria-hidden />
            Drivers
          </p>
        </div>

        <h1
          style={{
            margin: '0 0 14px 0',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(26px, 5vw, 38px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          Chauffeurs &amp; drivers
        </h1>

        <p
          style={{
            margin: '0 0 28px 0',
            fontSize: 'clamp(15px, 1.4vw, 17px)',
            lineHeight: 1.65,
            color: premium.palette.muted,
          }}
        >
          {company} runs rider bookings separately from driver access. Use the options below depending on whether you
          already work with {company} in the app.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          <section style={cardBase} aria-labelledby="premium-driver-signin">
            <h2
              id="premium-driver-signin"
              style={{
                margin: '0 0 10px 0',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'clamp(17px, 2.5vw, 19px)',
                fontWeight: 600,
              }}
            >
              I&apos;m already registered
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, lineHeight: 1.6, color: premium.palette.muted }}>
              If dispatch has already activated your driver profile, sign in with the email and password you set during
              onboarding.
            </p>
            <Link
              to="/driver/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                borderRadius: 999,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: premium.palette.accent,
                color: premium.palette.button_text?.trim() || premium.palette.text,
              }}
            >
              Sign in to driver portal
            </Link>
          </section>

          <section style={cardBase} aria-labelledby="premium-driver-join">
            <h2
              id="premium-driver-join"
              style={{
                margin: '0 0 10px 0',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'clamp(17px, 2.5vw, 19px)',
                fontWeight: 600,
              }}
            >
              I&apos;d like to join the fleet
            </h2>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, lineHeight: 1.6, color: premium.palette.muted }}>
              New drivers are added by {company}. Reach dispatch using the contacts below and ask how to get your
              invite or registration link. Have your legal name, mobile number, and work email ready—they&apos;ll match
              what operations enters in the dashboard.
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: 14, lineHeight: 1.6, color: premium.palette.muted }}>
              <strong style={{ color: premium.palette.text, fontWeight: 600 }}>Say whether you&apos;re in-house or outsourced.</strong>{' '}
              Dispatch uses that to route your request and set expectations on how you&apos;re engaged—without mixing up
              roster types.
            </p>
            <div
              style={{
                margin: '0 0 14px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <details
                className="premium-driver-detail"
                style={{
                  borderRadius: 10,
                  border: `0.5px solid ${fadedMuted}`,
                  backgroundColor: `color-mix(in srgb, ${premium.palette.muted} 5%, transparent)`,
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: premium.palette.text,
                    fontFamily: 'DM Sans, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    listStyle: 'none',
                  }}
                >
                  <span>In-house</span>
                  <CaretRight
                    className="premium-driver-detail-caret"
                    size={18}
                    weight="bold"
                    aria-hidden
                    style={{ color: premium.palette.muted, flexShrink: 0 }}
                  />
                </summary>
                <div
                  style={{
                    padding: '0 14px 14px 14px',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: premium.palette.muted,
                  }}
                >
                  You drive vehicles we assign. We may assign or reassign you to any vehicle at any time. You have no
                  maintenance responsibility for those vehicles—we maintain the fleet. Whether trips are available to you
                  depends on how many vehicles we have free when a request comes in.
                </div>
              </details>

              <details
                className="premium-driver-detail"
                style={{
                  borderRadius: 10,
                  border: `0.5px solid ${fadedMuted}`,
                  backgroundColor: `color-mix(in srgb, ${premium.palette.muted} 5%, transparent)`,
                  overflow: 'hidden',
                }}
              >
                <summary
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: premium.palette.text,
                    fontFamily: 'DM Sans, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    listStyle: 'none',
                  }}
                >
                  <span>Outsourced</span>
                  <CaretRight
                    className="premium-driver-detail-caret"
                    size={18}
                    weight="bold"
                    aria-hidden
                    style={{ color: premium.palette.muted, flexShrink: 0 }}
                  />
                </summary>
                <div
                  style={{
                    padding: '0 14px 14px 14px',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: premium.palette.muted,
                  }}
                >
                  You bring your own vehicle; we must approve it before you drive for us. You are responsible for all damage
                  and maintenance to that vehicle. We are not liable for anything related to your vehicle—we provide the job
                  leads and receive an agreed percentage of the revenue; the exact arrangement is settled outside this page.
                </div>
              </details>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {phoneDisplay && phoneHref ? (
                <a
                  href={phoneHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: premium.palette.text,
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <Phone size={20} weight="duotone" style={{ color: premium.palette.muted }} aria-hidden />
                  {phoneDisplay}
                </a>
              ) : null}
              {emailDisplay && emailHref ? (
                <a
                  href={emailHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 14,
                    color: premium.palette.accent,
                    textDecoration: 'none',
                    fontWeight: 500,
                    wordBreak: 'break-word',
                  }}
                >
                  <EnvelopeSimple size={20} style={{ flexShrink: 0, color: premium.palette.muted, marginTop: 2 }} aria-hidden />
                  {emailDisplay}
                </a>
              ) : null}
              {!phoneDisplay && !emailDisplay ? (
                <p style={{ margin: 0, fontSize: 13, color: premium.palette.muted, lineHeight: 1.55 }}>
                  Contact details aren&apos;t listed here yet—go back to the main page and use the phone or email in the
                  footer, or ask your manager for the dispatch line.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <section style={{ marginBottom: 26 }}>
          <h2
            style={{
              margin: '0 0 12px 0',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(16px, 2.2vw, 18px)',
              fontWeight: 600,
            }}
          >
            What to expect after you&apos;re invited
          </h2>
          <ul style={{ margin: 0, paddingLeft: 22, color: premium.palette.muted, fontSize: 14, lineHeight: 1.65 }}>
            {expectations.map((line) => (
              <li key={line} style={{ marginBottom: 8 }}>
                {line}
              </li>
            ))}
          </ul>
        </section>

        <p style={{ margin: '32px 0 0 0', fontSize: 12, color: premium.palette.muted, fontStyle: 'italic', textAlign: 'center' }}>
          Rider bookings and accounts stay on the rider sign-up flow—this page is only for people driving on behalf of{' '}
          {company}.
        </p>
      </div>
    </main>
  )
}
