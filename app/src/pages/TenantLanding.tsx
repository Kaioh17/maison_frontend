import { Link } from 'react-router-dom'
import { UserCircle, Car, ArrowRight } from '@phosphor-icons/react'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { useFavicon } from '@hooks/useFavicon'

/**
 * Tenant white-label home at https://{slug}.{domain}/ — entry for riders and drivers.
 */
export default function TenantLanding() {
  useFavicon()
  const slug = useTenantSlug()
  const { tenantInfo, isLoading: tenantLoading, error } = useTenantInfo()

  if (tenantLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bw-bg)',
        }}
      >
        <div
          style={{
            color: 'var(--bw-text)',
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '16px',
          }}
        >
          Loading…
        </div>
      </div>
    )
  }

  const companyName = tenantInfo?.company_name?.trim() || slug || 'Our service'

  if (!tenantInfo && error) {
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
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: 'clamp(28px, 5vw, 56px) clamp(20px, 4vw, 32px) clamp(48px, 8vw, 80px)',
        }}
      >
        <header
          style={{
            textAlign: 'center',
            marginBottom: 'clamp(36px, 7vw, 64px)',
          }}
        >
          {tenantInfo?.logo_url ? (
            <img
              src={tenantInfo.logo_url}
              alt={companyName}
              width={240}
              height={72}
              loading="eager"
              decoding="async"
              style={{
                maxHeight: '72px',
                maxWidth: '240px',
                objectFit: 'contain',
              }}
            />
          ) : (
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
              {companyName}
            </h1>
          )}
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
            Welcome to {companyName}
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
            Your ride starts here
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
            Whether you are booking a trip or driving one, {companyName} runs this site for you. Choose an option below to
            sign in or get started.
          </p>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(18px, 3vw, 26px)',
          }}
        >
          <article
            className="bw-card"
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
              Riders & passengers
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
              Book and manage rides with {companyName}. Sign in to your rider account or create one—it only takes a minute.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/riders/login"
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
                Rider sign in
                <ArrowRight size={18} aria-hidden color="#111827" />
              </Link>
              <Link
                to="/riders/register"
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
                Create rider account
              </Link>
            </div>
          </article>

          <article
            className="bw-card"
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
              Drivers
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
              Partner with {companyName} on the road. Sign in to your driver dashboard to manage trips and availability.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/driver/login"
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
                Driver sign in
                <ArrowRight size={18} aria-hidden color="#111827" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
