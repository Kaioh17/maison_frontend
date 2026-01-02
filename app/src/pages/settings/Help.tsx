import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Mail, MessageCircle, Book, FileText } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

export default function Help() {
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

  const helpSections = [
    {
      title: 'Getting Started',
      icon: Book,
      items: [
        'How to add your first driver',
        'Setting up vehicle categories',
        'Configuring booking settings',
        'Understanding your dashboard'
      ]
    },
    {
      title: 'Account Management',
      icon: FileText,
      items: [
        'Updating your profile information',
        'Changing subscription plans',
        'Managing company settings',
        'Branding and customization'
      ]
    },
    {
      title: 'Support',
      icon: MessageCircle,
      items: [
        'Contact our support team',
        'Report a bug or issue',
        'Request a feature',
        'View documentation'
      ]
    }
  ]

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
            Our support team is here to help you. Contact us via email or check out our documentation.
          </p>
          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap' }}>
            <a
              href="mailto:support@example.com"
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
            <button
              className="bw-btn-outline"
              onClick={() => window.open('https://docs.example.com', '_blank')}
              style={{
                padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                borderRadius: 7,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#000000',
                border: '1px solid var(--bw-border)',
                backgroundColor: '#ffffff'
              }}
            >
              <Book className="w-4 h-4" style={{ width: '18px', height: '18px' }} />
              Documentation
            </button>
          </div>
        </div>

        {/* Help Sections */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          width: '100%',
          maxWidth: '100%'
        }}>
          {helpSections.map((section, idx) => {
            const IconComponent = section.icon
            return (
              <div key={idx} className="bw-card" style={{ 
                backgroundColor: 'var(--bw-bg-secondary)',
                border: '1px solid var(--bw-border)',
                borderRadius: 'clamp(8px, 1.5vw, 12px)',
                padding: 'clamp(16px, 2.5vw, 24px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                  <IconComponent className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
                  <h3 style={{ 
                    margin: 0,
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 400,
                    color: 'var(--bw-text)'
                  }}>
                    {section.title}
                  </h3>
                </div>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(8px, 1.5vw, 12px)'
                }}>
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-text)',
                      paddingLeft: 'clamp(16px, 2vw, 20px)',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bw-accent)'
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
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

