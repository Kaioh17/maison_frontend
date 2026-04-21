import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate, useLocation } from 'react-router-dom'
import { HelpCircle, Mail, Book, AlertCircle, CreditCard, FileText, ChevronRight, Smartphone } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'
import { TENANT_SUPPORT_EMAIL } from '@config'

export default function Help() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [installGuideOpen, setInstallGuideOpen] = useState(false)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
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

  useEffect(() => {
    if (loading || location.hash !== '#install-web-app') return
    setInstallGuideOpen(true)
    const section = document.getElementById('install-web-app')
    if (section) {
      requestAnimationFrame(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [loading, location.hash])

  if (loading) {
    return (
      <div className="bw bw-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: 'clamp(16px, 3vw, 24px) 0'
      }}>
        <div className="bw-loading" style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          fontFamily: '"Work Sans", sans-serif',
          color: 'var(--bw-muted)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  const currentPlan = info?.profile?.subscription_plan?.toLowerCase() || 'free'

  const docCards = [
    {
      title: 'Operator guide',
      description: 'Where to find bookings, drivers, vehicles, rates, and branding—in plain language.',
      icon: Book,
      path: '/tenant/settings/help/admin'
    },
    {
      title: 'Common issues',
      description: 'Login problems, Stripe payments, wrong prices, and driver access—quick fixes.',
      icon: AlertCircle,
      path: '/tenant/settings/help/troubleshooting'
    },
    {
      title: 'Stripe & payments',
      description: 'Connect Stripe, understand checkout, and what to check when cards fail.',
      icon: CreditCard,
      path: '/tenant/settings/help/stripe'
    }
  ]

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar>
      {/* Main Content */}
      <div style={{ 
        marginLeft: isMobile ? '0' : (menuIsOpen ? '20%' : '64px'),
        transition: 'margin-left 0.3s ease',
        width: isMobile ? '100%' : (menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)'),
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ 
          width: '100%',
          maxWidth: '100%',
          padding: `clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)`,
          marginBottom: 'clamp(24px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            margin: 0,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 200,
            color: 'var(--bw-text)'
          }}>
            Help & Support
          </h1>
        </div>

      {/* Content Container */}
      <div className="bw-container" style={{ 
        padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Contact Support Card */}
        <div className="bw-card" style={{ 
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
            <HelpCircle className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
            <h3 style={{ 
              margin: 0,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Need Help?
            </h3>
          </div>
          <p style={{
            fontSize: 'clamp(12px, 1.5vw, 14px)',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 300,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(16px, 2.5vw, 24px)'
          }}>
            For problems with your dashboard, bookings, or account, email us. Short guides for operators are below; drivers have a separate Help page inside the driver app.
          </p>
          <p style={{
            fontSize: 'clamp(12px, 1.5vw, 14px)',
            fontFamily: '"Work Sans", sans-serif',
            fontWeight: 400,
            color: 'var(--bw-muted)',
            marginTop: '-12px',
            marginBottom: 'clamp(16px, 2.5vw, 24px)',
            wordBreak: 'break-all'
          }}>
            <a href={`mailto:${TENANT_SUPPORT_EMAIL}`} style={{ color: 'var(--bw-accent)' }}>
              {TENANT_SUPPORT_EMAIL}
            </a>
          </p>
          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap' }}>
            <a
              href={`mailto:${TENANT_SUPPORT_EMAIL}?subject=Maison%20tenant%20support`}
              className="bw-btn-outline"
              style={{
                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                borderRadius: 7,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#000000',
                border: '1px solid var(--bw-border)',
                backgroundColor: '#ffffff'
              }}
            >
              <Mail className="w-4 h-4" style={{ width: '18px', height: '18px' }} />
              Email Support
            </a>
          </div>
        </div>

        <h2 style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 500,
          color: 'var(--bw-text)',
          margin: '0 0 clamp(12px, 2vw, 16px) 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FileText className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
          Documentation
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          width: '100%',
          maxWidth: '100%',
          marginBottom: 'clamp(8px, 2vw, 12px)'
        }}>
          {docCards.map((card) => {
            const IconComponent = card.icon
            return (
              <button
                key={card.path}
                type="button"
                onClick={() => navigate(card.path)}
                className="bw-card"
                style={{
                  backgroundColor: 'var(--bw-bg-secondary)',
                  border: '1px solid var(--bw-border)',
                  borderRadius: 'clamp(8px, 1.5vw, 12px)',
                  padding: 'clamp(16px, 2.5vw, 24px)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(10px, 2vw, 14px)',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover, rgba(0,0,0,0.04))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                    <IconComponent className="w-5 h-5" style={{ color: 'var(--bw-text)', flexShrink: 0 }} />
                    <h3 style={{
                      margin: 0,
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 500,
                      color: 'var(--bw-text)'
                    }}>
                      {card.title}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--bw-muted)', flexShrink: 0 }} />
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  lineHeight: 1.5
                }}>
                  {card.description}
                </p>
              </button>
            )
          })}
        </div>

        <div
          id="install-web-app"
          className="bw-card"
          style={{
            marginTop: 'clamp(16px, 3vw, 24px)',
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(16px, 2.5vw, 24px)'
          }}
        >
          <button
            type="button"
            onClick={() => setInstallGuideOpen((open) => !open)}
            aria-expanded={installGuideOpen}
            aria-controls="install-web-app-content"
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              textAlign: 'left',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
              <Smartphone className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              <h3 style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)', fontFamily: '"Work Sans", sans-serif', fontWeight: 500, color: 'var(--bw-text)' }}>
                Install Maison as an app on your phone
              </h3>
            </div>
            <ChevronRight
              className="w-5 h-5"
              style={{
                color: 'var(--bw-muted)',
                transform: installGuideOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0
              }}
            />
          </button>
          {installGuideOpen && (
            <div id="install-web-app-content" style={{ marginTop: 12 }}>
              <p style={{ margin: '0 0 16px 0', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif', fontSize: 'clamp(12px, 1.5vw, 14px)', lineHeight: 1.5 }}>
                Save the Maison web app to your home screen for one-tap access like a native app.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'clamp(12px, 2vw, 16px)' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 'clamp(14px, 2vw, 16px)', fontFamily: '"Work Sans", sans-serif', fontWeight: 500, color: 'var(--bw-text)' }}>
                    iPhone (Safari)
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif', fontSize: 'clamp(12px, 1.5vw, 14px)', lineHeight: 1.6 }}>
                    <li>Open Maison in Safari.</li>
                    <li>Tap the Share icon (square with arrow).</li>
                    <li>Choose Add to Home Screen.</li>
                    <li>Tap Add.</li>
                  </ol>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 'clamp(14px, 2vw, 16px)', fontFamily: '"Work Sans", sans-serif', fontWeight: 500, color: 'var(--bw-text)' }}>
                    Android (Chrome)
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif', fontSize: 'clamp(12px, 1.5vw, 14px)', lineHeight: 1.6 }}>
                    <li>Open Maison in Chrome.</li>
                    <li>Tap the three-dot menu.</li>
                    <li>Tap Install app or Add to Home screen.</li>
                    <li>Confirm Install/Add.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Upgrade Plan Button */}
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

