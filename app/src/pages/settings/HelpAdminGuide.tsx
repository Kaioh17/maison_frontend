import { useState, useEffect, type ReactNode } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

function Section({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section
      className="bw-card"
      style={{
        backgroundColor: 'var(--bw-bg-secondary)',
        border: '1px solid var(--bw-border)',
        borderRadius: 'clamp(8px, 1.5vw, 12px)',
        padding: 'clamp(16px, 2.5vw, 24px)',
        marginBottom: 'clamp(16px, 2vw, 20px)'
      }}
    >
      <h2
        style={{
          margin: '0 0 clamp(12px, 2vw, 16px) 0',
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 500,
          color: 'var(--bw-text)'
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 'clamp(13px, 1.8vw, 15px)',
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 300,
          color: 'var(--bw-text)',
          lineHeight: 1.55
        }}
      >
        {children}
      </div>
    </section>
  )
}

export default function HelpAdminGuide() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div
        className="bw bw-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          padding: 'clamp(16px, 3vw, 24px) 0'
        }}
      >
        <div
          className="bw-loading"
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontFamily: '"Work Sans", sans-serif',
            color: 'var(--bw-muted)'
          }}
        >
          Loading...
        </div>
      </div>
    )
  }

  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar>
        <div
          style={{
            marginLeft: isMobile ? '0' : menuIsOpen ? '20%' : '64px',
            transition: 'margin-left 0.3s ease',
            width: isMobile ? '100%' : menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)',
            maxWidth: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: `clamp(16px, 2vw, 24px)`,
              marginBottom: 'clamp(16px, 3vw, 24px)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ marginBottom: 'clamp(16px, 2vw, 20px)' }}>
              <button
                type="button"
                onClick={() => navigate('/tenant/settings/help')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 'clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--bw-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: '"Work Sans", sans-serif',
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  color: 'var(--bw-text)'
                }}
              >
                <ArrowLeft className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
                Back to Help
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
              <BookOpen className="w-6 h-6" style={{ color: 'var(--bw-text)' }} />
              <h1
                style={{
                  fontSize: 'clamp(22px, 4vw, 30px)',
                  margin: 0,
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 200,
                  color: 'var(--bw-text)'
                }}
              >
                Guide for operators
              </h1>
            </div>
            <p
              style={{
                margin: 'clamp(12px, 2vw, 16px) 0 0 0',
                fontSize: 'clamp(13px, 1.8vw, 14px)',
                fontFamily: '"Work Sans", sans-serif',
                color: 'var(--bw-muted)',
                maxWidth: '720px',
                lineHeight: 1.5
              }}
            >
              Short overview of the main screens. Use the left menu in Settings for detailed options.
            </p>
          </div>

          <div className="bw-container" style={{ padding: '0 clamp(16px, 2vw, 24px) clamp(24px, 4vw, 40px)' }}>
            <Section title="Home and bookings">
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Overview</strong> shows a snapshot of your operation.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Bookings</strong> lists trips. Open a trip to see status, customer, and vehicle info.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong>Drivers</strong> is where you add staff and send them login access when your workflow uses driver accounts.
                </li>
                <li>
                  <strong>Vehicles</strong> is your fleet and vehicle types customers can book.
                </li>
              </ul>
            </Section>

            <Section title="Rates and pricing">
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Rates / Vehicle rates</strong> control what riders see and pay. After you change prices, double-check a test booking so amounts look right.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Pricing settings</strong> (under Settings) cover deposits, fees, and related rules. Save after each change.
              </p>
            </Section>

            <Section title="Branding and customer-facing links">
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Branding</strong> sets your logo and colors on rider and driver pages.
              </p>
              <p style={{ margin: 0 }}>
                Riders and drivers should always use <strong>your company link</strong> (your web address for this app), not someone else&apos;s—otherwise they may see the wrong company or be unable to log in.
              </p>
            </Section>

            <Section title="Payments (Stripe)">
              <p style={{ margin: 0 }}>
                Card payments run through Stripe. If payouts or checkout fail, open{' '}
                <button
                  type="button"
                  onClick={() => navigate('/tenant/settings/help/stripe')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--bw-accent)',
                    cursor: 'pointer',
                    font: 'inherit',
                    textDecoration: 'underline'
                  }}
                >
                  Stripe integration
                </button>{' '}
                for setup steps, then use <strong>Common issues</strong> if something still errors.
              </p>
            </Section>

            <Section title="Who to contact">
              <p style={{ margin: 0 }}>
                Day-to-day ride questions: your dispatch or internal procedures. Billing, access, or bugs in the app: email support from the main Help page.
              </p>
            </Section>
          </div>

          <UpgradePlanButton
            currentPlan={currentPlan}
            onUpgradeClick={() => navigate('/tenant/settings/plans')}
            isMobile={isMobile}
          />
        </div>
      </SettingsMenuBar>
    </div>
  )
}
