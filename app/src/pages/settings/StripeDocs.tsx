import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ExternalLink, ArrowLeft } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

export default function StripeDocs() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const navigate = useNavigate()

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

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar />
      
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)', marginBottom: 'clamp(16px, 2vw, 20px)' }}>
            <button
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
                color: 'var(--bw-text)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <ArrowLeft className="w-4 h-4" style={{ width: '16px', height: '16px' }} />
              Back to Help
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
            <CreditCard className="w-6 h-6" style={{ color: 'var(--bw-text)' }} />
            <h1 style={{ 
              fontSize: 'clamp(24px, 4vw, 32px)', 
              margin: 0,
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 200,
              color: 'var(--bw-text)'
            }}>
              Stripe Payment Integration
            </h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="bw-container" style={{ 
          padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* Document Content */}
          <div className="bw-card" style={{ 
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(24px, 4vw, 40px)',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Introduction Section */}
            <section style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
              <h2 style={{
                margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                borderBottom: '2px solid var(--bw-border)',
                paddingBottom: 'clamp(12px, 2vw, 16px)'
              }}>
                What is Stripe?
              </h2>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.7
              }}>
                Stripe is a leading payment processing platform that enables businesses to accept payments online securely. 
                It provides a comprehensive suite of tools for handling payments, managing subscriptions, and processing 
                transactions across multiple payment methods and currencies.
              </p>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.7
              }}>
                In Maison, Stripe powers our payment infrastructure, allowing you to receive payments from riders and 
                seamlessly distribute funds to drivers when needed. This integration ensures secure, reliable, and 
                compliant payment processing for your transportation business.
              </p>
            </section>

            {/* How Maison Uses Stripe */}
            <section style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
              <h2 style={{
                margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                borderBottom: '2px solid var(--bw-border)',
                paddingBottom: 'clamp(12px, 2vw, 16px)'
              }}>
                How Maison Uses Stripe
              </h2>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.7
              }}>
                Our integration with Stripe enables a complete payment ecosystem for your transportation business:
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(12px, 2vw, 16px)'
              }}>
                {[
                  {
                    title: 'Secure Payment Processing',
                    description: 'All rider bookings are processed through Stripe\'s secure payment gateway, ensuring PCI-compliant transactions and protecting sensitive payment information.'
                  },
                  {
                    title: 'Automatic Fund Distribution',
                    description: 'Funds received from riders can be automatically distributed to drivers based on your configured payout schedules and business rules.'
                  },
                  {
                    title: 'Real-time Payment Tracking',
                    description: 'Monitor all transactions, payments, and payouts in real-time through your Stripe dashboard, providing complete visibility into your financial operations.'
                  },
                  {
                    title: 'Multiple Payment Methods',
                    description: 'Support for credit cards, debit cards, digital wallets, and other payment methods, giving riders flexibility in how they pay for their rides.'
                  },
                  {
                    title: 'Automated Payouts',
                    description: 'Configure automatic payouts to your connected bank account, ensuring timely access to your funds without manual intervention.'
                  },
                  {
                    title: 'Comprehensive Reporting',
                    description: 'Access detailed financial reports, transaction history, and analytics through Stripe\'s reporting tools, helping you make informed business decisions.'
                  }
                ].map((item, idx) => (
                  <li key={idx} style={{
                    padding: 'clamp(16px, 2.5vw, 20px)',
                    backgroundColor: 'var(--bw-bg)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--bw-accent)'
                  }}>
                    <h3 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(15px, 2vw, 18px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 500,
                      color: 'var(--bw-text)'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(13px, 1.8vw, 15px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-text)',
                      lineHeight: 1.6
                    }}>
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Getting Started */}
            <section style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
              <h2 style={{
                margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                borderBottom: '2px solid var(--bw-border)',
                paddingBottom: 'clamp(12px, 2vw, 16px)'
              }}>
                Getting Started with Stripe
              </h2>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.7
              }}>
                To start accepting payments through Stripe, you need to complete your account setup:
              </p>
              <ol style={{
                paddingLeft: 'clamp(20px, 3vw, 28px)',
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0'
              }}>
                <li style={{
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  lineHeight: 1.7
                }}>
                  Navigate to <strong>Account Information</strong> in your settings
                </li>
                <li style={{
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  lineHeight: 1.7
                }}>
                  Click the <strong>Complete Account Setup</strong> button
                </li>
                <li style={{
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  lineHeight: 1.7
                }}>
                  Complete the Stripe onboarding process, providing necessary business information
                </li>
                <li style={{
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  lineHeight: 1.7
                }}>
                  Verify your account and connect your bank account for payouts
                </li>
                <li style={{
                  marginBottom: 'clamp(12px, 2vw, 16px)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  lineHeight: 1.7
                }}>
                  Once verified, you can start accepting payments from riders immediately
                </li>
              </ol>
            </section>

            {/* Documentation & Resources */}
            <section style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
              <h2 style={{
                margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                borderBottom: '2px solid var(--bw-border)',
                paddingBottom: 'clamp(12px, 2vw, 16px)'
              }}>
                Documentation & Resources
              </h2>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.7
              }}>
                For more detailed information about Stripe and its features, explore the following resources:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                gap: 'clamp(12px, 2vw, 16px)',
                marginTop: 'clamp(16px, 2.5vw, 24px)'
              }}>
                {[
                  {
                    title: 'Stripe Official Documentation',
                    description: 'Comprehensive guides and API references for all Stripe features',
                    url: 'https://stripe.com/docs'
                  },
                  {
                    title: 'Stripe Connect Guide',
                    description: 'Learn about Stripe Connect for marketplace and platform payments',
                    url: 'https://stripe.com/docs/connect'
                  },
                  {
                    title: 'Payment Processing Overview',
                    description: 'Understanding payment flows, methods, and best practices',
                    url: 'https://stripe.com/docs/payments'
                  },
                  {
                    title: 'Security & Compliance',
                    description: 'PCI compliance, security best practices, and data protection',
                    url: 'https://stripe.com/docs/security'
                  }
                ].map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: 'clamp(16px, 2.5vw, 20px)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                      e.currentTarget.style.borderColor = 'var(--bw-accent)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bw-bg)'
                      e.currentTarget.style.borderColor = 'var(--bw-border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 500,
                        color: 'var(--bw-text)'
                      }}>
                        {resource.title}
                      </h3>
                      <ExternalLink className="w-4 h-4" style={{ width: '16px', height: '16px', color: 'var(--bw-accent)', flexShrink: 0 }} />
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-muted)',
                      lineHeight: 1.5
                    }}>
                      {resource.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            {/* Support Section */}
            <section>
              <h2 style={{
                margin: '0 0 clamp(16px, 2.5vw, 24px) 0',
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                borderBottom: '2px solid var(--bw-border)',
                paddingBottom: 'clamp(12px, 2vw, 16px)'
              }}>
                Need Help?
              </h2>
              <p style={{
                margin: '0 0 clamp(16px, 2.5vw, 20px) 0',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)',
                lineHeight: 1.7
              }}>
                If you have questions about Stripe integration or need assistance with your payment setup, 
                please contact our support team or refer to the Stripe documentation linked above.
              </p>
            </section>
          </div>
        </div>

        {/* Upgrade Plan Button */}
        <UpgradePlanButton 
          currentPlan={currentPlan}
          onUpgradeClick={() => navigate('/tenant/settings/plans')}
          isMobile={isMobile}
        />
      </div>
    </div>
  )
}

