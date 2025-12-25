import { Link } from 'react-router-dom'
import { useState } from 'react'
import './landing.css'

function Header() {
  return (
    <header className="bw-topnav" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'transparent', borderBottom: 'none' }}>
      <div className="bw-container bw-topnav-inner" role="navigation" aria-label="Main" style={{ padding: `clamp(12px, 2vw, 16px) clamp(8px, 1.5vw, 16px) clamp(16px, 3vw, 24px)` }}>
        <div className="bw-brand" style={{ 
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(24px, 3vw, 32px)',
          color: 'var(--bw-text)',
          marginLeft: 0,
          paddingLeft: 0
        }}>Maison</div>
        <nav className="bw-nav" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          <a href="#product" style={{ color: 'var(--bw-text)' }}>Product</a>
          <a href="#pricing" style={{ color: 'var(--bw-text)' }}>Pricing</a>
          <a href="#docs" style={{ color: 'var(--bw-text)' }}>Docs</a>
        </nav>
        <div className="bw-cta">
          <Link to="/tenant/login" className="bw-btn-outline" aria-label="Login">Login</Link>
          <Link to="/signup" className="bw-btn" aria-label="Get started">Get started</Link>
        </div>
        <button className="bw-menu" aria-label="Open menu" style={{ color: 'var(--bw-text)', borderColor: 'var(--bw-border-strong)' }}>≡</button>
      </div>
    </header>
  )
}

function FullScreenHero() {
  return (
    <section className="landing-hero-fullscreen" aria-labelledby="hero-title">
      <img 
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
        alt="Luxury black sedan on elegant road" 
        className="landing-hero-image"
      />
      <div className="landing-hero-overlay"></div>
      <div className="landing-hero-content">
        <h1 id="hero-title">Run Your Fleet. Your Brand. Your Way.</h1>
        <p>Run your limo business your way — bookings, drivers, payments, and branding all in one simple, scalable platform.</p>
        <div className="landing-hero-buttons">
          <Link to="/signup" className="bw-btn" aria-label="Get started">Get started</Link>
          <a href="#demo" className="bw-btn-outline" aria-label="See demo">See demo</a>
        </div>
      </div>
    </section>
  )
}


function Features() {
  const items = [
    { title: 'Easy company registration', desc: 'Get your ride-sharing business up and running quickly with streamlined onboarding.', link: '#', icon: '🏢' },
    { title: 'Register vehicles & drivers', desc: 'Add your fleet and team members with just one click for efficient management.', link: '#', icon: '🚗' },
    { title: 'Flexible pricing setup', desc: 'Configure pricing models including per hour, per mile, base fares, and more.', link: '#', icon: '💰' },
    { title: 'Custom branded experience', desc: 'Configure your own branded site and booking flow to match your brand.', link: '#', icon: '🎨' },
    { title: 'Scalable growth plans', desc: 'Upgrade plans as your team grows, from solo driver to growing fleet.', link: '#', icon: '📈' },
  ]
  return (
    <section id="product" className="section bw-container" aria-label="Key features" style={{ padding: `clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)` }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h2 style={{ 
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 200,
          color: 'var(--bw-text)',
          marginBottom: 'clamp(12px, 2vw, 16px)'
        }}>Everything You Need. Nothing You Don't</h2>
        <p className="small-muted" style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(16px, 3vw, 24px)', 
          fontSize: 'clamp(14px, 2vw, 16px)',
          fontFamily: "'Work Sans', sans-serif"
        }}>
          Maison scales with you — from solo driver to growing fleet.
        </p>
      </div>
      <div className="bw-grid-3" style={{ gap: 'clamp(16px, 3vw, 24px)' }}>
        {items.map((it) => (
          <article key={it.title} className="bw-card" role="article" style={{ 
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 0
          }}>
            <div style={{ 
              width: 'clamp(28px, 3vw, 32px)', 
              height: 'clamp(28px, 3vw, 32px)', 
              marginBottom: 'clamp(12px, 2vw, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bw-accent)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {it.title === 'Easy company registration' && (
                  <path d="M3 21h18M9 7h6M9 11h6M9 15h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                )}
                {it.title === 'Register vehicles & drivers' && (
                  <>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="9" cy="10" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </>
                )}
                {it.title === 'Flexible pricing setup' && (
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                )}
                {it.title === 'Custom branded experience' && (
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                )}
                {it.title === 'Scalable growth plans' && (
                  <path d="M3 3v18h18M8 12l3 3 5-5"/>
                )}
              </svg>
            </div>
            <h3 style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 400,
              color: 'var(--bw-text)',
              marginBottom: 'clamp(8px, 1.5vw, 12px)'
            }}>{it.title}</h3>
            <p className="small-muted" style={{ 
              marginTop: 'clamp(6px, 1vw, 8px)',
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(13px, 1.8vw, 15px)'
            }}>{it.desc}</p>
            <a href={it.link} className="small-muted" style={{ 
              marginTop: 'clamp(10px, 2vw, 12px)', 
              display: 'inline-block',
              fontFamily: "'Work Sans', sans-serif"
            }} aria-label={`${it.title} — learn more`}>
              Learn more
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

function DriverFeatures() {
  const driverFeatures = [
    { 
      title: 'Self-service onboarding', 
      desc: 'Drivers can join via secure links without complex paperwork or waiting for admin approval.',
      icon: 'link'
    },
    { 
      title: 'Flexible documentation', 
      desc: 'Upload vehicle & document info for outsourced drivers or personal details for in-house teams.',
      icon: 'document'
    },
    { 
      title: 'Real-time tracking', 
      desc: 'Track jobs, pay, and tips in real time for complete transparency and better driver satisfaction.',
      icon: 'tracking'
    },
    { 
      title: 'Mobile-first design', 
      desc: 'Mobile-friendly access without clunky dispatcher systems - drivers stay connected on the go.',
      icon: 'mobile'
    },
  ]
  
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'link':
        return <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>;
      case 'document':
        return <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>;
      case 'tracking':
        return <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>;
      case 'mobile':
        return <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>;
      default:
        return <circle cx="12" cy="12" r="10"/>;
    }
  };

  return (
    <section className="section bw-container" aria-label="Driver-friendly features" style={{ padding: `clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)` }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h2 style={{ 
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 200,
          color: 'var(--bw-text)',
          marginBottom: 'clamp(12px, 2vw, 16px)'
        }}>Driver-Friendly From Day One</h2>
        <p className="small-muted" style={{ 
          fontSize: 'clamp(14px, 2vw, 16px)', 
          marginTop: 'clamp(8px, 1.5vw, 12px)',
          fontFamily: "'Work Sans', sans-serif"
        }}>
          Your drivers aren't "assets" — they're users.
        </p>
      </div>
      <div className="driver-features-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: 'clamp(32px, 5vw, 64px)', 
        alignItems: 'center', 
        marginBottom: 'clamp(32px, 4vw, 48px)',
        padding: 'clamp(24px, 3vw, 32px) 0'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          gap: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(20px, 3vw, 24px)', 
            marginBottom: 'clamp(12px, 2vw, 16px)', 
            color: 'var(--bw-text)',
            fontWeight: 400,
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Built for Professional Excellence
          </h3>
          <p style={{ 
            fontSize: 'clamp(16px, 2.2vw, 18px)', 
            lineHeight: '1.7', 
            color: 'var(--bw-fg)',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            fontFamily: "'Work Sans', sans-serif"
          }}>
            Experience the difference of a platform designed specifically for luxury transportation professionals. 
            Our driver-focused approach ensures your team has everything they need to deliver exceptional service.
          </p>
          <p style={{ 
            fontSize: 'clamp(14px, 2vw, 16px)', 
            lineHeight: '1.6', 
            color: 'var(--bw-muted)',
            fontStyle: 'italic',
            fontFamily: "'Work Sans', sans-serif"
          }}>
            From seamless onboarding to real-time operations, every feature is crafted with your drivers' success in mind.
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Gloved hand opening luxury car door - representing premium service" 
            style={{ 
              width: '100%', 
              maxWidth: 'clamp(300px, 40vw, 500px)', 
              borderRadius: 0,
              boxShadow: 'var(--bw-shadow)'
            }}
          />
        </div>
      </div>
      <div className="bw-grid-3" style={{ gap: 'clamp(16px, 3vw, 24px)' }}>
        {driverFeatures.map((feature) => (
          <article key={feature.title} className="bw-card" role="article" style={{ 
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 0
          }}>
            <div style={{ 
              width: 'clamp(28px, 3vw, 32px)', 
              height: 'clamp(28px, 3vw, 32px)', 
              marginBottom: 'clamp(12px, 2vw, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bw-accent)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {getIcon(feature.icon)}
              </svg>
            </div>
            <h3 style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 400,
              color: 'var(--bw-text)',
              marginBottom: 'clamp(8px, 1.5vw, 12px)'
            }}>{feature.title}</h3>
            <p className="small-muted" style={{ 
              marginTop: 'clamp(6px, 1vw, 8px)',
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(13px, 1.8vw, 15px)'
            }}>{feature.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function BookingExperience() {
  const bookingFeatures = [
    { 
      title: 'Unique booking link', 
      desc: 'Riders book through your branded page — not ours. Unique URL: maison.com/ride/{yourcompany}',
      icon: 'link'
    },
    { 
      title: 'Your brand, your way', 
      desc: 'See your logo, your prices, your services. Complete white-label experience for your business.',
      icon: 'brand'
    },
    { 
      title: 'Simple 4-step process', 
      desc: 'Select vehicle, set service type, choose pickup/drop-off, confirm & pay. Streamlined for riders.',
      icon: 'process'
    },
    { 
      title: 'Secure payments', 
      desc: 'Cash or card payments with Stripe-secured transactions. Multiple payment options for convenience.',
      icon: 'payment'
    },
    { 
      title: 'Automated confirmations & reminders', 
      desc: 'Keep riders informed with automatic booking confirmations, pickup reminders, and status updates.',
      icon: 'notification'
    },
  ]
  
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'link':
        return <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>;
      case 'brand':
        return <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>;
      case 'process':
        return <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>;
      case 'payment':
        return <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>;
      case 'notification':
        return <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>;
      default:
        return <circle cx="12" cy="12" r="10"/>;
    }
  };

  return (
    <section className="section bw-container" aria-label="Smooth booking experience" style={{ padding: `clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)` }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h2 style={{ 
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 200,
          color: 'var(--bw-text)',
          marginBottom: 'clamp(12px, 2vw, 16px)'
        }}>A Smooth Booking Experience</h2>
        <p className="small-muted" style={{ 
          fontSize: 'clamp(14px, 2vw, 16px)', 
          marginTop: 'clamp(8px, 1.5vw, 12px)',
          fontFamily: "'Work Sans', sans-serif"
        }}>
          Riders book through your branded page — not ours.
        </p>
      </div>
      <div className="booking-features-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: 'clamp(32px, 5vw, 64px)', 
        alignItems: 'center', 
        marginBottom: 'clamp(32px, 4vw, 48px)',
        padding: 'clamp(24px, 3vw, 32px) 0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Professional chauffeur holding car door open for passenger with suitcase" 
            style={{ 
              width: '100%', 
              maxWidth: 'clamp(300px, 40vw, 400px)', 
              maxHeight: 'clamp(300px, 40vw, 400px)', 
              borderRadius: 0,
              boxShadow: 'var(--bw-shadow)'
            }}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          gap: 'clamp(16px, 2.5vw, 24px)'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(20px, 3vw, 24px)', 
            marginBottom: 'clamp(12px, 2vw, 16px)', 
            color: 'var(--bw-text)',
            fontWeight: 400,
            fontFamily: "'DM Sans', sans-serif"
          }}>
            Seamless Rider Experience
          </h3>
          <p style={{ 
            fontSize: 'clamp(16px, 2.2vw, 18px)', 
            lineHeight: '1.7', 
            color: 'var(--bw-fg)',
            marginBottom: 'clamp(12px, 2vw, 16px)',
            fontFamily: "'Work Sans', sans-serif"
          }}>
            Create a booking experience that reflects your brand's excellence. Every touchpoint is designed to 
            make riders feel confident and comfortable choosing your service.
          </p>
          <p style={{ 
            fontSize: 'clamp(14px, 2vw, 16px)', 
            lineHeight: '1.6', 
            color: 'var(--bw-muted)',
            fontStyle: 'italic',
            fontFamily: "'Work Sans', sans-serif"
          }}>
            From the first click to the final ride, your riders enjoy a premium, branded experience that builds loyalty.
          </p>
        </div>
      </div>
      <div className="bw-grid-3" style={{ gap: 'clamp(16px, 3vw, 24px)' }}>
        {bookingFeatures.map((feature) => (
          <article key={feature.title} className="bw-card" role="article" style={{ 
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 0
          }}>
            <div style={{ 
              width: 'clamp(28px, 3vw, 32px)', 
              height: 'clamp(28px, 3vw, 32px)', 
              marginBottom: 'clamp(12px, 2vw, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bw-accent)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {getIcon(feature.icon)}
              </svg>
            </div>
            <h3 style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 400,
              color: 'var(--bw-text)',
              marginBottom: 'clamp(8px, 1.5vw, 12px)'
            }}>{feature.title}</h3>
            <p className="small-muted" style={{ 
              marginTop: 'clamp(6px, 1vw, 8px)',
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(13px, 1.8vw, 15px)'
            }}>{feature.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Pricing() {
  const [showPlans, setShowPlans] = useState(false)

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$0.00',
      period: '/month',
      description: 'Perfect for solo drivers and small fleets. We charge a percentage on payments made on app higher than $100.',
      features: [
        { text: 'Up to 5 vehicles', included: true },
        { text: 'Up to 10 drivers', included: true },
        { text: 'Basic booking system', included: true },
        { text: 'Email support', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'API access', included: false },
        { text: 'Priority support', included: false },
        { text: 'SMS notifications', included: false },
        { text: 'Multi-language support', included: false },
      ]
    },
    {
      name: 'Premium',
      price: '$100',
      period: '/month',
      description: 'Ideal for growing businesses',
      popular: true,
      features: [
        { text: 'Up to 25 vehicles', included: true },
        { text: 'Up to 50 drivers', included: true },
        { text: 'Advanced booking system', included: true },
        { text: 'Email & phone support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'API access', included: true },
        { text: 'Priority support', included: false },
        { text: 'SMS notifications', included: true },
        { text: 'Multi-language support', included: false },
      ]
    },
    {
      name: 'Diamond',
      price: '$300',
      period: '/month',
      description: 'For large fleets and enterprises',
      features: [
        { text: 'Unlimited vehicles', included: true },
        { text: 'Unlimited drivers', included: true },
        { text: 'Enterprise booking system', included: true },
        { text: '24/7 dedicated support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'API access', included: true },
        { text: 'Priority support', included: true },
        { text: 'SMS notifications', included: true },
        { text: 'Multi-language support', included: true },
      ]
    }
  ]

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-success)' }}>
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )

  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bw-muted)' }}>
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  )

  return (
    <section id="pricing" className="section bw-container" aria-label="Pricing" style={{ padding: `clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)` }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 32px)' }}>
        <h2 style={{ 
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 200,
          color: 'var(--bw-text)',
          marginBottom: 'clamp(12px, 2vw, 16px)'
        }}>Fair, Transparent Pricing</h2>
        <p className="small-muted" style={{ 
          fontSize: 'clamp(14px, 2vw, 16px)', 
          marginTop: 'clamp(8px, 1.5vw, 12px)',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          fontFamily: "'Work Sans', sans-serif"
        }}>
          No contracts. No mystery fees.
        </p>
        {!showPlans && (
          <button 
            className="bw-btn" 
            onClick={() => setShowPlans(true)}
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)'
            }}
          >
            View Subscription Plans
          </button>
        )}
      </div>

      {showPlans && (
        <div className="pricing-plans-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: 'clamp(24px, 4vw, 32px)',
          marginTop: 'clamp(32px, 5vw, 48px)'
        }}>
            {pricingPlans.map((plan, index) => (
              <div 
                key={plan.name} 
                className="bw-card" 
                style={{ 
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: 0,
                  border: plan.popular ? '2px solid var(--bw-accent)' : '1px solid var(--bw-border)',
                  position: 'relative'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bw-accent)',
                    color: '#ffffff',
                    padding: '4px 16px',
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: "'Work Sans', sans-serif",
                    fontWeight: 600
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 3vw, 32px)' }}>
                  <h3 style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 'clamp(24px, 3.5vw, 32px)',
                    fontWeight: 400,
                    color: 'var(--bw-text)',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>{plan.name}</h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    justifyContent: 'center',
                    gap: 'clamp(4px, 1vw, 8px)',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <span style={{ 
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 'clamp(36px, 5vw, 48px)',
                      fontWeight: 200,
                      color: 'var(--bw-text)'
                    }}>{plan.price}</span>
                    <span style={{ 
                      fontFamily: "'Work Sans', sans-serif",
                      fontSize: 'clamp(14px, 2vw, 16px)',
                      color: 'var(--bw-muted)'
                    }}>{plan.period}</span>
                  </div>
                  <p style={{ 
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    color: 'var(--bw-muted)',
                    marginBottom: 'clamp(16px, 2.5vw, 24px)'
                  }}>{plan.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Link 
                      to="/signup" 
                      className={plan.popular ? "bw-btn" : "bw-btn-outline"}
                      style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)',
                        width: '100%',
                        maxWidth: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
                <div style={{ 
                  borderTop: '1px solid var(--bw-border)',
                  paddingTop: 'clamp(20px, 3vw, 24px)',
                  marginTop: 'clamp(20px, 3vw, 24px)'
                }}>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(12px, 2vw, 16px)'
                  }}>
                    {plan.features.map((feature, idx) => (
                      <li key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'clamp(12px, 2vw, 16px)'
                      }}>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {feature.included ? <CheckIcon /> : <XIcon />}
                        </div>
                        <span style={{ 
                          fontFamily: "'Work Sans', sans-serif",
                          fontSize: 'clamp(14px, 2vw, 16px)',
                          color: feature.included ? 'var(--bw-fg)' : 'var(--bw-muted)',
                          textDecoration: feature.included ? 'none' : 'none'
                        }}>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      )}

      {showPlans && (
        <div style={{ textAlign: 'center', marginTop: 'clamp(32px, 4vw, 48px)' }}>
          <button 
            className="bw-btn-outline" 
            onClick={() => setShowPlans(false)}
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)'
            }}
          >
            Hide Plans
          </button>
        </div>
      )}
    </section>
  )
}

function Steps() {
  const steps = [
    { n: 1, t: 'Plan', d: 'Outline scope and invite your team.' },
    { n: 2, t: 'Build', d: 'Track progress with structured reviews.' },
    { n: 3, t: 'Ship', d: 'Publish confidently with audit trails.' },
  ]
  return (
    <section className="section bw-container" aria-label="How it works" style={{ padding: `clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)` }}>
      <h2 style={{ 
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 200,
        color: 'var(--bw-text)',
        marginBottom: 'clamp(24px, 4vw, 32px)'
      }}>How it works</h2>
      <div className="bw-grid-3" style={{ gap: 'clamp(16px, 3vw, 24px)' }}>
        {steps.map((s) => (
          <div key={s.n} className="bw-card" role="group" aria-label={`Step ${s.n}`} style={{ 
            padding: 'clamp(16px, 3vw, 24px)',
            borderRadius: 0
          }}>
            <div className="small-muted" style={{ 
              marginBottom: 'clamp(8px, 1.5vw, 12px)',
              fontFamily: "'Work Sans', sans-serif"
            }}>Step {s.n}</div>
            <h3 style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 400,
              color: 'var(--bw-text)',
              marginBottom: 'clamp(8px, 1.5vw, 12px)'
            }}>{s.t}</h3>
            <p className="small-muted" style={{ 
              marginTop: 'clamp(6px, 1vw, 8px)',
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(13px, 1.8vw, 15px)'
            }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonial() {
  return (
    <section className="section bw-container" aria-label="Testimonial" style={{ padding: `clamp(48px, 6vw, 64px) clamp(16px, 3vw, 24px)` }}>
      <blockquote className="bw-card" style={{ 
        textAlign: 'center',
        padding: 'clamp(24px, 4vw, 32px)',
        borderRadius: 0
      }}>
        <p style={{ 
          margin: 0,
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          fontFamily: "'Work Sans', sans-serif",
          color: 'var(--bw-fg)',
          lineHeight: 1.6
        }}>
          "Clean, focused and predictable. We move from idea to release without distractions."
        </p>
        <footer className="small-muted" style={{ 
          marginTop: 'clamp(12px, 2vw, 16px)',
          fontFamily: "'Work Sans', sans-serif"
        }}>Alex M. · Product Lead</footer>
      </blockquote>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="section bw-container" aria-label="Final call to action" style={{
      backgroundColor: 'var(--bw-bg-secondary)',
      color: 'var(--bw-fg)',
      position: 'relative',
      borderRadius: 0,
      margin: 'clamp(32px, 4vw, 48px) auto',
      padding: 'clamp(32px, 5vw, 48px) clamp(24px, 4vw, 32px)',
      maxWidth: '1000px',
      textAlign: 'center',
      border: '1px solid var(--bw-border)'
    }}>
      <div style={{ 
        position: 'relative',
        zIndex: 2
      }}>
        <h2 style={{ 
          fontSize: 'clamp(28px, 4vw, 40px)', 
          marginBottom: 'clamp(16px, 2.5vw, 24px)', 
          color: 'var(--bw-text)',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 200
        }}>Maison is the Next Generation of Limo Software.</h2>
        <p className="bw-sub" style={{ 
          fontSize: 'clamp(16px, 2.5vw, 20px)', 
          marginBottom: 'clamp(24px, 4vw, 32px)', 
          lineHeight: 1.6, 
          color: 'var(--bw-muted)',
          fontFamily: "'Work Sans', sans-serif"
        }}>
          Stop fighting with outdated systems. Start running your business on a platform built for you — operators, drivers, and riders.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
          <Link to="/signup" className="bw-btn" style={{ 
            fontSize: 'clamp(14px, 2vw, 18px)', 
            padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)'
          }}>
            Start Free Today
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bw-footer" role="contentinfo" style={{ padding: `clamp(32px, 4vw, 48px) clamp(16px, 3vw, 24px)` }}>
      <div className="bw-container bw-footer-grid" style={{ gap: 'clamp(24px, 4vw, 32px)' }}>
        <div>
          <div className="bw-brand" style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(24px, 3vw, 32px)',
            color: 'var(--bw-text)'
          }}>Maison</div>
          <p className="small-muted" style={{ 
            marginTop: 'clamp(8px, 1.5vw, 12px)',
            fontFamily: "'Work Sans', sans-serif"
          }}>Minimal platform to build, ship and iterate faster.</p>
        </div>
        <nav aria-label="Footer Product">
          <h3 style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(16px, 2.2vw, 18px)',
            fontWeight: 400,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(8px, 1.5vw, 12px)'
          }}>Product</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 'clamp(8px, 1.5vw, 12px) 0 0 0' }}>
            <li style={{ marginBottom: 'clamp(6px, 1vw, 8px)' }}><a href="#product" style={{ fontFamily: "'Work Sans', sans-serif" }}>Overview</a></li>
            <li style={{ marginBottom: 'clamp(6px, 1vw, 8px)' }}><a href="#docs" style={{ fontFamily: "'Work Sans', sans-serif" }}>Docs</a></li>
            <li style={{ marginBottom: 'clamp(6px, 1vw, 8px)' }}><a href="#pricing" style={{ fontFamily: "'Work Sans', sans-serif" }}>Pricing</a></li>
          </ul>
        </nav>
        <nav aria-label="Footer Company">
          <h3 style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(16px, 2.2vw, 18px)',
            fontWeight: 400,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(8px, 1.5vw, 12px)'
          }}>Company</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 'clamp(8px, 1.5vw, 12px) 0 0 0' }}>
            <li style={{ marginBottom: 'clamp(6px, 1vw, 8px)' }}><a href="#about" style={{ fontFamily: "'Work Sans', sans-serif" }}>About</a></li>
            <li style={{ marginBottom: 'clamp(6px, 1vw, 8px)' }}><a href="#blog" style={{ fontFamily: "'Work Sans', sans-serif" }}>Blog</a></li>
            <li style={{ marginBottom: 'clamp(6px, 1vw, 8px)' }}><a href="#contact" style={{ fontFamily: "'Work Sans', sans-serif" }}>Contact</a></li>
          </ul>
        </nav>
        <form aria-label="Newsletter signup" onSubmit={(e) => e.preventDefault()}>
          <h3 style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(16px, 2.2vw, 18px)',
            fontWeight: 400,
            color: 'var(--bw-text)',
            marginBottom: 'clamp(8px, 1.5vw, 12px)'
          }}>Newsletter</h3>
          <label className="small-muted" htmlFor="email" style={{ 
            display: 'block', 
            marginTop: 'clamp(8px, 1.5vw, 12px)',
            fontFamily: "'Work Sans', sans-serif"
          }}>Email</label>
          <input id="email" className="bw-input" type="email" placeholder="you@email" aria-required="true" style={{ marginTop: 'clamp(6px, 1vw, 8px)' }} />
          <button className="bw-btn" style={{ marginTop: 'clamp(8px, 1.5vw, 12px)' }}>Subscribe</button>
        </form>
      </div>
      <div className="bw-container" style={{ marginTop: 'clamp(16px, 2.5vw, 24px)' }}>
        <div className="small-muted" style={{ fontFamily: "'Work Sans', sans-serif" }}>© {new Date().getFullYear()} Maison. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <main className="bw landing-page" aria-label="Landing">
      <FullScreenHero />
      <Header />
      <Features />
      <DriverFeatures />
      <BookingExperience />
      <Pricing />
      <Steps />
      <Testimonial />
      <FinalCTA />
      <Footer />
    </main>
  )
}