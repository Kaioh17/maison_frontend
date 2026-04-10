import { useState, useEffect, type ReactNode } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

type Qa = { q: string; a: ReactNode }

function FaqBlock({ title, items }: { title: string; items: Qa[] }) {
  return (
    <div
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
          margin: '0 0 clamp(14px, 2vw, 18px) 0',
          fontSize: 'clamp(16px, 2.5vw, 18px)',
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 500,
          color: 'var(--bw-text)'
        }}
      >
        {title}
      </h2>
      <dl style={{ margin: 0 }}>
        {items.map(({ q, a }) => (
          <div key={q} style={{ marginBottom: 'clamp(14px, 2vw, 18px)' }}>
            <dt
              style={{
                fontSize: 'clamp(13px, 1.8vw, 15px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                color: 'var(--bw-text)',
                marginBottom: '6px'
              }}
            >
              {q}
            </dt>
            <dd
              style={{
                margin: 0,
                fontSize: 'clamp(13px, 1.8vw, 15px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.55,
                paddingLeft: 0
              }}
            >
              {a}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function HelpTroubleshooting() {
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

  const operatorItems: Qa[] = [
    {
      q: 'I can’t log in to the dashboard',
      a: (
        <>
          Confirm you are on the correct company URL and using the email you signed up with. Use password reset if available.
          If your subscription or account was paused, contact support from the Help page.
        </>
      )
    },
    {
      q: 'Riders say payment failed or Stripe errors',
      a: (
        <>
          In Settings → Help → <strong>Stripe integration</strong>, verify your Stripe connection is complete. Ensure the
          payment method you expect (card, etc.) is turned on in Stripe. Retry the booking after a few minutes.
        </>
      )
    },
    {
      q: 'Prices look wrong on the booking page',
      a: 'Open Vehicle rates and Pricing settings. Save each screen after edits, then open a fresh booking in a private browser window to confirm.'
    },
    {
      q: 'A driver never got access or the wrong company shows',
      a: 'Send the driver your branded driver login link (same subdomain as riders). New drivers must finish registration. If the site shows another company, the link is for the wrong address—double-check the URL.'
    },
    {
      q: 'Something worked yesterday and today it doesn’t',
      a: 'Note the exact page, time, and what you clicked. Take a screenshot of any error message and email support from the Help page so we can trace it quickly.'
    }
  ]

  const driverNote = (
    <p
      style={{
        fontSize: 'clamp(13px, 1.8vw, 15px)',
        fontFamily: '"Work Sans", sans-serif',
        color: 'var(--bw-muted)',
        lineHeight: 1.55,
        margin: '0 0 clamp(16px, 2vw, 20px) 0',
        maxWidth: '720px'
      }}
    >
      Drivers: open <strong>Help &amp; tips</strong> in the driver app sidebar. Topics there cover accepting trips, availability, and vehicles.
    </p>
  )

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
              marginBottom: 'clamp(8px, 2vw, 12px)',
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
              <Wrench className="w-6 h-6" style={{ color: 'var(--bw-text)' }} />
              <h1
                style={{
                  fontSize: 'clamp(22px, 4vw, 30px)',
                  margin: 0,
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 200,
                  color: 'var(--bw-text)'
                }}
              >
                Common issues
              </h1>
            </div>
          </div>

          <div className="bw-container" style={{ padding: '0 clamp(16px, 2vw, 24px) clamp(24px, 4vw, 40px)' }}>
            {driverNote}
            <FaqBlock title="Operators and dispatch" items={operatorItems} />
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
