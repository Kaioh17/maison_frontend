import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lifebuoy } from '@phosphor-icons/react'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { TENANT_SUPPORT_EMAIL } from '@config'

export default function DriverHelp() {
  const navigate = useNavigate()
  const { tenantInfo } = useTenantInfo()

  const block = (title: string, body: ReactNode) => (
    <section
      style={{
        backgroundColor: 'var(--bw-bg-secondary)',
        border: '1px solid var(--bw-border)',
        borderRadius: '12px',
        padding: 'clamp(16px, 3vw, 22px)',
        marginBottom: 'clamp(14px, 2.5vw, 18px)'
      }}
    >
      <h2
        style={{
          margin: '0 0 10px 0',
          fontSize: 'clamp(15px, 2.5vw, 17px)',
          fontWeight: 600,
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--bw-text)'
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 'clamp(13px, 2vw, 15px)',
          fontWeight: 300,
          fontFamily: 'Work Sans, sans-serif',
          color: 'var(--bw-text)',
          lineHeight: 1.55
        }}
      >
        {body}
      </div>
    </section>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bw-bg)',
        fontFamily: 'Work Sans, sans-serif',
        padding: 'clamp(16px, 3vw, 28px)'
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate('/driver/dashboard', { replace: true })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'clamp(18px, 3vw, 24px)',
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: '1px solid var(--bw-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'var(--bw-text)',
            fontSize: 'clamp(13px, 2vw, 14px)',
            fontFamily: 'Work Sans, sans-serif'
          }}
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Lifebuoy size={28} weight="duotone" style={{ color: 'var(--bw-text)' }} />
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(22px, 4vw, 28px)',
              fontWeight: 200,
              fontFamily: 'DM Sans, sans-serif',
              color: 'var(--bw-text)'
            }}
          >
            Help &amp; tips
          </h1>
        </div>
        {tenantInfo?.company_name && (
          <p style={{ margin: '0 0 clamp(20px, 3vw, 28px) 0', color: 'var(--bw-muted)', fontSize: 'clamp(13px, 2vw, 14px)' }}>
            {tenantInfo.company_name}
          </p>
        )}

        {block(
          'Logging in',
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '8px' }}>Use the login link your company gave you (their branded page).</li>
            <li style={{ marginBottom: '8px' }}>Use the same email you registered with.</li>
            <li>If you are locked out, ask your dispatcher or manager—they control driver accounts.</li>
          </ul>
        )}

        {block(
          'Going “active” and seeing trips',
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '8px' }}>
              Turn <strong>active</strong> when you are available; turn <strong>inactive</strong> when you are done for the day.
            </li>
            <li style={{ marginBottom: '8px' }}>
              New work often appears under <strong>Bookings → New requests</strong>. Accept or decline from there when your process allows.
            </li>
            <li>
              If nothing appears for a long time, your company may not have pending jobs, or filters may be hiding trips—check with dispatch.
            </li>
          </ul>
        )}

        {block(
          'Upcoming rides and history',
          <p style={{ margin: 0 }}>
            Use <strong>Upcoming rides</strong> for what is scheduled next. <strong>See all bookings</strong> lists past and current work; use filters if the list is long.
          </p>
        )}

        {block(
          'Vehicles',
          <p style={{ margin: 0 }}>
            The <strong>Vehicles</strong> section shows what is on file for you. If a car is missing or wrong, ask your manager to update your fleet in the office system—drivers usually cannot add company vehicles themselves.
          </p>
        )}

        {block(
          'Page errors or constant loading',
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li style={{ marginBottom: '8px' }}>Refresh the page.</li>
            <li style={{ marginBottom: '8px' }}>Try another browser or turn off private mode extensions that block cookies.</li>
            <li>Confirm you still have internet. If the problem continues, send your manager a screenshot and the time it happened.</li>
          </ul>
        )}

        {block(
          'Who to contact',
          <p style={{ margin: 0 }}>
            For assignments, cancellations, and pay questions, talk to <strong>your company</strong> first. For bugs that stop you from using the app after your manager has tried, they can reach platform support at{' '}
            <a href={`mailto:${TENANT_SUPPORT_EMAIL}`} style={{ color: 'var(--bw-accent)' }}>
              {TENANT_SUPPORT_EMAIL}
            </a>
            .
          </p>
        )}
      </div>
    </div>
  )
}
