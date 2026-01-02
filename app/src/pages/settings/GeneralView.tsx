import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { useNavigate } from 'react-router-dom'
import { User, Building, CreditCard, TrendingUp } from 'lucide-react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'
import { upgradeSubscription } from '@api/subscription'

export default function GeneralView() {
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
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

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const handleUpgradePlan = async (plan: { product_type: string; price_id: string }) => {
    try {
      const response = await upgradeSubscription({
        price_id: plan.price_id,
        product_type: plan.product_type
      })
      if (response.success) {
        setShowUpgradeModal(false)
        alert('Subscription upgrade initiated successfully!')
        const tenantInfo = await getTenantInfo()
        setInfo(tenantInfo.data)
      }
    } catch (err: any) {
      console.error('Failed to upgrade:', err)
      alert('Failed to upgrade subscription. Please try again.')
    }
  }

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
          <h1 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            margin: 0,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 200,
            color: 'var(--bw-text)'
          }}>
            General View
          </h1>
        </div>

      {/* Content Container */}
      <div className="bw-container" style={{ 
        padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Account Information */}
          <div className="bw-card" style={{ 
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(16px, 2.5vw, 24px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <User className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Account Information
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
              {[
                { label: 'First Name:', value: info?.first_name },
                { label: 'Last Name:', value: info?.last_name },
                { label: 'Email:', value: info?.email },
                { label: 'Phone:', value: info?.phone_no },
                { label: 'Role:', value: info?.profile?.role },
                { label: 'Account Verified:', value: info?.is_verified ? 'Yes' : 'No' },
                { label: 'Member Since:', value: new Date(info?.created_on).toLocaleDateString() }
              ].map((item, idx, arr) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
                }}>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    fontFamily: '"Work Sans", sans-serif',
                    color: 'var(--bw-text)'
                  }}>
                    {item.value || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Information */}
          <div className="bw-card" style={{ 
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(16px, 2.5vw, 24px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <Building className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Company Information
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
              {[
                { label: 'Company Name:', value: info?.profile?.company_name },
                { label: 'Slug:', value: info?.profile?.slug },
                { label: 'City:', value: info?.profile?.city },
                { label: 'Address:', value: info?.profile?.address || 'Not provided' },
                { label: 'Subscription Status:', value: info?.profile?.subscription_status || 'Free', isStatus: true },
                { label: 'Account Status:', value: info?.profile?.subscription_status === 'active' ? 'Active' : info?.profile?.subscription_status || 'Free', isStatus: true }
              ].map((item, idx, arr) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
                }}>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    fontFamily: '"Work Sans", sans-serif',
                    color: item.isStatus && info?.profile?.subscription_status === 'active' ? 'var(--bw-success)' : item.isStatus ? 'var(--bw-warning)' : 'var(--bw-text)'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription & Billing */}
          <div className="bw-card" style={{ 
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(16px, 2.5vw, 24px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <CreditCard className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Subscription & Billing
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
              {[
                { label: 'Subscription Plan:', value: info?.profile?.subscription_plan || 'No plan' },
                { label: 'Subscription Status:', value: info?.profile?.subscription_status || 'N/A' },
                { label: 'Stripe Customer ID:', value: info?.profile?.stripe_customer_id || 'Not connected' },
                { label: 'Stripe Account ID:', value: info?.profile?.stripe_account_id || 'Not connected' }
              ].map((item, idx, arr) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
                }}>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    fontFamily: '"Work Sans", sans-serif',
                    color: 'var(--bw-text)'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bw-card" style={{ 
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(16px, 2.5vw, 24px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(12px, 2vw, 16px)' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--bw-text)' }} />
              <h3 style={{ 
                margin: 0,
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 400,
                color: 'var(--bw-text)'
              }}>
                Statistics
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
              {[
                { label: 'Total Drivers:', value: info?.stats?.drivers_count || 0 },
                { label: 'Total Rides:', value: info?.stats?.total_ride_count || 0 },
                { label: 'Daily Rides:', value: info?.stats?.daily_ride_count || 0 },
                { label: 'Last Reset:', value: info?.stats?.last_ride_count_reset ? new Date(info.stats.last_ride_count_reset).toLocaleDateString() : 'N/A' }
              ].map((item, idx, arr) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: idx < arr.length - 1 ? 'clamp(6px, 1vw, 8px)' : 0,
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--bw-border)' : 'none'
                }}>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif'
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontWeight: 300,
                    fontFamily: '"Work Sans", sans-serif',
                    color: 'var(--bw-text)'
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Upgrade Plan Button */}
        <UpgradePlanButton 
          currentPlan={currentPlan}
          onUpgradeClick={handleUpgradeClick}
          isMobile={isMobile}
        />

        {/* Upgrade Modal - Simplified version */}
        {showUpgradeModal && (
          <div className="bw-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
            <div className="bw-modal" onClick={(e) => e.stopPropagation()} style={{
              maxWidth: '600px',
              width: '90vw'
            }}>
              <div className="bw-modal-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(16px, 2.5vw, 24px)',
                borderBottom: '1px solid var(--bw-border)'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 400,
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Upgrade Plan
                </h3>
                <button onClick={() => setShowUpgradeModal(false)} style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--bw-text)'
                }}>
                  ×
                </button>
              </div>
              <div className="bw-modal-body" style={{
                padding: 'clamp(16px, 2.5vw, 24px)',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                <p style={{ marginBottom: '16px', color: 'var(--bw-text)' }}>
                  Please visit the Plans page to view all available plans and upgrade options.
                </p>
                <button
                  className="bw-btn bw-btn-action"
                  onClick={() => {
                    setShowUpgradeModal(false)
                    navigate('/tenant/settings/plans')
                  }}
                  style={{
                    padding: '14px 24px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    borderRadius: 7
                  }}
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

