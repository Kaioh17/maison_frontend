import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Settings, User, Building, Wrench, Car, CreditCard, HelpCircle, X, Menu, Palette, DollarSign, ChevronRight } from 'lucide-react'
import { getStripeLoginLink } from '@api/tenantSettings'

interface MenuItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { path: '/tenant/settings/general', label: 'General View', icon: Settings },
  { path: '/tenant/settings/account', label: 'Account Information', icon: User },
  { path: '/tenant/settings/company', label: 'Company Information', icon: Building },
  { path: '/tenant/settings/tenant-settings', label: 'Tenant Settings', icon: Wrench },
  { path: '/tenant/settings/branding', label: 'Branding Settings', icon: Palette },
  { path: '/tenant/settings/pricing', label: 'Pricing Settings', icon: DollarSign },
  { path: '/tenant/settings/vehicle-config', label: 'Vehicle Configuration', icon: Car },
  { path: '/tenant/settings/plans', label: 'Plans', icon: CreditCard },
  { 
    path: '/tenant/settings/help', 
    label: 'Help', 
    icon: HelpCircle,
    submenu: [
      { path: '/tenant/settings/help/stripe', label: 'Stripe Integration', icon: CreditCard }
    ]
  }
]

interface SettingsMenuContextType {
  isOpen: boolean
  isMobile: boolean
}

const SettingsMenuContext = createContext<SettingsMenuContextType>({
  isOpen: false,
  isMobile: false
})

export const useSettingsMenu = () => useContext(SettingsMenuContext)

export default function SettingsMenuBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [loadingStripeLink, setLoadingStripeLink] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsOpen(true) // Auto-open on desktop
      } else {
        setIsOpen(false) // Auto-close on mobile
      }
    }
    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMenuClick = (path: string, hasSubmenu?: boolean) => {
    if (hasSubmenu && isOpen) {
      // Toggle submenu expansion
      setExpandedMenus(prev => {
        const newSet = new Set(prev)
        if (newSet.has(path)) {
          newSet.delete(path)
        } else {
          newSet.add(path)
        }
        return newSet
      })
    } else {
      navigate(path)
      if (isMobile) {
        setIsOpen(false) // Close menu on mobile after navigation
      }
    }
  }

  // Auto-expand menu if current path is in submenu
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu) {
        const isInSubmenu = item.submenu.some(sub => location.pathname === sub.path)
        if (isInSubmenu) {
          setExpandedMenus(prev => new Set(prev).add(item.path))
        }
      }
    })
  }, [location.pathname])

  const handleBackToDashboard = () => {
    navigate('/tenant/overview')
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const handleStripeLogin = async () => {
    try {
      setLoadingStripeLink(true)
      const response = await getStripeLoginLink()
      if (response.success && response.data.login_link) {
        // Open the login link in a new tab
        window.open(response.data.login_link, '_blank', 'noopener,noreferrer')
      } else {
        alert('Failed to get Stripe login link')
      }
    } catch (err: any) {
      console.error('Failed to get Stripe login link:', err)
      alert(err?.response?.data?.message || err?.message || 'Failed to get Stripe login link')
    } finally {
      setLoadingStripeLink(false)
    }
  }

  return (
    <SettingsMenuContext.Provider value={{ isOpen, isMobile }}>
      {/* Overlay when menu is open on mobile */}
      {isOpen && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Hamburger Button - Fixed position on mobile, inside header on desktop */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed',
            top: 'clamp(16px, 3vw, 24px)',
            left: isOpen ? 'calc(80% + clamp(16px, 3vw, 24px))' : 'clamp(16px, 3vw, 24px)',
            zIndex: 1001,
            padding: 'clamp(8px, 1.5vw, 12px)',
            backgroundColor: 'var(--bw-bg-secondary)',
            border: '1px solid var(--bw-border)',
            borderRadius: 'clamp(4px, 0.8vw, 8px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-5 h-5" style={{ width: 'clamp(20px, 2.5vw, 24px)', height: 'clamp(20px, 2.5vw, 24px)', color: 'var(--bw-text)' }} />
          ) : (
            <Menu className="w-5 h-5" style={{ width: 'clamp(20px, 2.5vw, 24px)', height: 'clamp(20px, 2.5vw, 24px)', color: 'var(--bw-text)' }} />
          )}
        </button>
      )}

      {/* Vertical Menu Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? '0' : (isMobile ? '-100%' : '0'),
          width: isOpen ? (isMobile ? '80%' : '20%') : (isMobile ? '0' : '64px'),
          maxWidth: isMobile ? '320px' : 'none',
          height: '100vh',
          backgroundColor: 'var(--bw-bg)',
          borderRight: '1px solid var(--bw-border)',
          zIndex: 999,
          transition: 'all 0.3s ease',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? 'var(--bw-shadow)' : 'none'
        }}
      >
        {/* Header */}
        {isOpen && (
          <div style={{
            padding: 'clamp(16px, 2vw, 24px)',
            borderBottom: '1px solid var(--bw-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <h2 style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: 300,
              margin: 0,
              color: 'var(--bw-text)',
              letterSpacing: '0.5px',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Settings
            </h2>
            {!isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  padding: 'clamp(6px, 1vw, 8px)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--bw-border)',
                  borderRadius: 'clamp(4px, 0.8vw, 6px)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                aria-label="Toggle menu"
              >
                <X className="w-5 h-5" style={{ width: 'clamp(18px, 2vw, 20px)', height: 'clamp(18px, 2vw, 20px)', color: 'var(--bw-text)' }} />
              </button>
            )}
          </div>
        )}
        
        {/* Hamburger button for collapsed state on desktop */}
        {!isMobile && !isOpen && (
          <div style={{
            padding: 'clamp(12px, 1.5vw, 16px)',
            borderBottom: '1px solid var(--bw-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                padding: 'clamp(8px, 1.2vw, 10px)',
                backgroundColor: 'transparent',
                border: '1px solid var(--bw-border)',
                borderRadius: 'clamp(4px, 0.8vw, 6px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '40px',
                height: '40px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" style={{ width: 'clamp(18px, 2vw, 20px)', height: 'clamp(18px, 2vw, 20px)', color: 'var(--bw-text)' }} />
            </button>
          </div>
        )}

        {/* Back to Dashboard Button */}
        {isOpen && (
          <div style={{
            padding: 'clamp(12px, 1.5vw, 20px) clamp(16px, 2vw, 24px)',
            borderBottom: '1px solid var(--bw-border)'
          }}>
            <button
              onClick={handleBackToDashboard}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 24px)',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--bw-text)',
                cursor: 'pointer',
                fontSize: 'clamp(13px, 1.5vw, 15px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                textAlign: 'left',
                transition: 'all 0.2s ease',
                borderRadius: 'clamp(4px, 0.8vw, 8px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <ArrowLeft className="w-4 h-4" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav style={{
          flex: 1,
          padding: isOpen ? 'clamp(12px, 1.5vw, 20px) 0' : 'clamp(12px, 1.5vw, 20px) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: isOpen ? 'stretch' : 'center'
        }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = location.pathname === item.path || (item.submenu && item.submenu.some(sub => location.pathname === sub.path))
            const isExpanded = expandedMenus.has(item.path)
            const hasSubmenu = item.submenu && item.submenu.length > 0
            
            return (
              <div key={item.path}>
                <button
                  onClick={() => handleMenuClick(item.path, hasSubmenu)}
                  title={!isOpen ? item.label : undefined}
                  style={{
                    width: isOpen ? '100%' : '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    gap: isOpen ? '12px' : '0',
                    padding: isOpen 
                      ? 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 24px)' 
                      : 'clamp(12px, 1.5vw, 16px)',
                    backgroundColor: isActive ? 'var(--bw-bg-hover)' : 'transparent',
                    border: 'none',
                    borderLeft: isActive ? '3px solid var(--bw-accent)' : '3px solid transparent',
                    color: 'var(--bw-text)',
                    cursor: 'pointer',
                    fontSize: 'clamp(13px, 1.5vw, 15px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: isActive ? 500 : 300,
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    borderRadius: isOpen ? '0' : 'clamp(4px, 0.8vw, 8px)',
                    margin: isOpen ? '0' : '0 8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isOpen ? '12px' : '0', flex: 1 }}>
                    <IconComponent className="w-4 h-4" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                    {isOpen && <span>{item.label}</span>}
                  </div>
                  {isOpen && hasSubmenu && (
                    <ChevronRight 
                      className="w-4 h-4" 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        flexShrink: 0,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  )}
                </button>
                {/* Submenu */}
                {isOpen && hasSubmenu && isExpanded && (
                  <div style={{
                    paddingLeft: 'clamp(30px, 4vw, 40px)',
                    paddingTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    {item.submenu!.map((subItem) => {
                      const SubIconComponent = subItem.icon
                      const isSubActive = location.pathname === subItem.path
                      return (
                        <button
                          key={subItem.path}
                          onClick={() => handleMenuClick(subItem.path)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: 'clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 24px)',
                            backgroundColor: isSubActive ? 'var(--bw-bg-hover)' : 'transparent',
                            border: 'none',
                            borderLeft: isSubActive ? '2px solid var(--bw-accent)' : '2px solid transparent',
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            fontSize: 'clamp(12px, 1.4vw, 14px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: isSubActive ? 500 : 300,
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            borderRadius: '0'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          }}
                        >
                          <SubIconComponent className="w-3 h-3" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                          <span>{subItem.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sticky Stripe Dashboard Button at Bottom */}
        <div style={{
          padding: 'clamp(12px, 1.5vw, 16px)',
          borderTop: '1px solid var(--bw-border)',
          marginTop: 'auto',
          flexShrink: 0
        }}>
          <button
            onClick={handleStripeLogin}
            disabled={loadingStripeLink}
            style={{
              width: isOpen ? '100%' : '48px',
              padding: isOpen 
                ? 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 24px)' 
                : 'clamp(12px, 1.5vw, 16px)',
              borderRadius: 'clamp(4px, 0.8vw, 8px)',
              backgroundColor: 'var(--bw-accent, rgba(155, 97, 209, 0.81))',
              color: '#ffffff',
              border: 'none',
              cursor: loadingStripeLink ? 'not-allowed' : 'pointer',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(13px, 1.5vw, 15px)',
              opacity: loadingStripeLink ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxShadow: loadingStripeLink ? 'none' : '0 2px 8px rgba(155, 97, 209, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isOpen ? '12px' : '0',
              minHeight: '48px',
              margin: isOpen ? '0' : '0 auto'
            }}
            onMouseEnter={(e) => {
              if (!loadingStripeLink) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(155, 97, 209, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingStripeLink) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(155, 97, 209, 0.3)'
              }
            }}
            title={!isOpen ? 'Stripe Dashboard' : undefined}
          >
            {isOpen && <span>Stripe Dashboard</span>}
            {!isOpen && !loadingStripeLink && <CreditCard className="w-4 h-4" style={{ width: '18px', height: '18px' }} />}
            {!isOpen && loadingStripeLink && <span style={{ fontSize: '12px' }}>...</span>}
            {isOpen && loadingStripeLink && <span>Loading...</span>}
          </button>
        </div>
      </div>

      {/* Content Offset - Add margin to main content when menu is visible */}
      {!isMobile && (
        <div style={{
          width: isOpen ? '20%' : '64px',
          flexShrink: 0,
          transition: 'width 0.3s ease'
        }} />
      )}
    </SettingsMenuContext.Provider>
  )
}

