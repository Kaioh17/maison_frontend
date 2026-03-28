import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MaisonWordmark from '@components/MaisonWordmark'
import { LANDING_PRICING_PLANS, isPopularPlan } from '@data/landingPricingPlans'
import './landing-pricing.css'
import './landing-snap-nav.css'
import { CheckCircle, XCircle, List, X, SignIn } from '@phosphor-icons/react'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, ease: 'easeOut' }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const SNAP_SECTION_LABELS = [
  'Hero',
  'Platform',
  'Drivers',
  'Rider experience',
  'Mission',
  'Pricing',
  'Get started',
] as const

const PRICING_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Pricing')

const smoothScrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Slide 1: Hero
function HeroSlide() {
  return (
    <section className="landing-snap-section flex items-center justify-center relative" data-nav-theme="dark">
      {/* Deep slate-to-black radial gradient background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top left, rgba(30, 41, 59, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at top right, rgba(15, 23, 42, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(30, 41, 59, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(15, 23, 42, 0.3) 0%, transparent 50%),
              #0a0a0f
            `
          }}
        ></div>
      </div>
      
      <div className="relative z-10 w-full box-border px-5">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left half: Text */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-left"
          >
            <motion.h1
              {...fadeInUp}
              className="text-white mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(2.4rem, 11vw, 6rem)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontWeight: 700,
              }}
            >
              Run Your Fleet. Own The Experience.
            </motion.h1>
            <motion.p
              {...fadeInUp}
              className="text-[16px] text-[#7c5cfc] uppercase tracking-wider mb-6 font-medium"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Modern limo software for operators who think like brands.
            </motion.p>
            <motion.p
              {...fadeInUp}
              className="text-[18px] text-gray-300 mb-8 leading-relaxed"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Maison centralizes bookings, drivers, payments, and branding into one clean platform built for black car and limo businesses. Launch fast, operate with confidence, and deliver a level of service that looks and feels as premium as the rides you provide.
            </motion.p>
            <motion.div
              {...fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center w-full sm:flex-1 sm:min-w-0 py-[13px] px-5 text-[15px] font-semibold rounded-[10px] text-center box-border border-2 border-transparent bg-[#7c5cfc] text-white hover:bg-[#7c3aed] transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Get Started
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center w-full sm:flex-1 sm:min-w-0 py-[13px] px-5 text-[15px] font-semibold rounded-[10px] text-center box-border border-2 border-gray-700 text-white hover:border-[#7c5cfc] hover:text-[#7c5cfc] transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                See Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Right half: Abstract animated brand shape */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="hidden md:block"
          >
            <div className="landing-hero-art" aria-hidden="true">
              <div className="landing-hero-art__noise"></div>
              <div className="landing-hero-art__orb landing-hero-art__orb--main"></div>
              <div className="landing-hero-art__orb landing-hero-art__orb--accent"></div>
              <div className="landing-hero-art__orb landing-hero-art__orb--deep"></div>
              <div className="landing-hero-art__grid"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Slide 2: Scalability & Onboarding
function PlatformSlide() {
  const actionItems = [
    'Launch in one day.',
    'Invite with secure links.',
    'Configure rates instantly.',
    'Scale without migration.'
  ]

  return (
    <section id="platform" className="landing-snap-section flex items-center justify-center bg-[#0a0a0f]" data-nav-theme="dark">
      <div className="max-w-[1280px] mx-auto px-5 box-border w-full">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="text-left"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-[48px] font-light text-white mb-4 leading-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            From Solo Operator To Growing Fleet.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[16px] text-gray-400 mb-8"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Onboard in days, not months.
          </motion.p>
          <motion.ul
            variants={staggerChildren}
            className="space-y-4"
          >
            {actionItems.map((item, index) => (
              <motion.li
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-3 text-[18px] text-slate-400"
                style={{ fontFamily: "'Work Sans', sans-serif", lineHeight: '1.5' }}
              >
                <CheckCircle className="w-5 h-5 text-[#7c5cfc] flex-shrink-0 mt-1" weight="fill" />
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 3: Driver Experience
function DriverExperienceSlide() {
  const actionItems = [
    'Mobile view of today\'s rides and pickups.',
    'Live earnings and tips always visible.',
    'Real-time status updates for everyone.',
    'Transparent payouts reduce churn.'
  ]

  return (
    <section className="landing-snap-section flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-gray-900 to-[#0a0a0f]" data-nav-theme="dark">
      <div className="max-w-[1280px] mx-auto px-5 box-border w-full">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="text-left"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-[48px] font-light text-white mb-4 leading-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Give Drivers A Platform Preferred
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[16px] text-gray-400 mb-8"
            
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Transparent, mobile-first, and built for trust.
          </motion.p>
          <motion.ul
            variants={staggerChildren}
            className="space-y-4"
          >
            {actionItems.map((item, index) => (
              <motion.li
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-3 text-[18px] text-slate-400"
                style={{ fontFamily: "'Work Sans', sans-serif", lineHeight: '1.5' }}
              >
                <CheckCircle className="w-5 h-5 text-[#7c5cfc] flex-shrink-0 mt-1" weight="fill" />
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 4: Rider Experience / White-Label
function RiderBookingSlide() {
  const actionItems = [
    'Single branded link for all services.',
    'Choose vehicle class and add VIP notes.',
    'Secure payment details for repeat bookings.',
    'Your brand on every confirmation.'
  ]

  return (
    <section className="landing-snap-section flex items-center justify-center bg-[#0a0a0f]" data-nav-theme="dark">
      <div className="max-w-[1280px] mx-auto px-5 box-border w-full">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="text-left"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-[48px] font-light text-white mb-4 leading-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Your Brand At Every Touchpoint.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-[16px] text-gray-400 mb-8"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Riders see your name, your logo, your standards.
          </motion.p>
          <motion.ul
            variants={staggerChildren}
            className="space-y-4"
          >
            {actionItems.map((item, index) => (
              <motion.li
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-3 text-[18px] text-slate-400"
                style={{ fontFamily: "'Work Sans', sans-serif", lineHeight: '1.5' }}
              >
                <CheckCircle className="w-5 h-5 text-[#7c5cfc] flex-shrink-0 mt-1" weight="fill" />
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 6: Pricing
function PricingSlide() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const featuredIndex = LANDING_PRICING_PLANS.findIndex(isPopularPlan)
  const [activeIndex, setActiveIndex] = useState(featuredIndex >= 0 ? featuredIndex : 0)

  useEffect(() => {
    const root = carouselRef.current
    if (!root) return

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!window.matchMedia('(max-width: 767px)').matches) return
        root.querySelector<HTMLElement>('.pricing-card.featured')?.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: 'auto',
        })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  useEffect(() => {
    const root = carouselRef.current
    if (!root) return

    let observer: IntersectionObserver | null = null
    const thresholds = Array.from({ length: 21 }, (_, i) => 0.5 + i * 0.025)

    const startObserver = () => {
      observer?.disconnect()
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const cards = root.querySelectorAll<HTMLElement>('.pricing-card')
      if (!mobile || cards.length === 0) return

      observer = new IntersectionObserver(
        (entries) => {
          let bestIdx = -1
          let bestRatio = 0
          for (const e of entries) {
            if (e.intersectionRatio < 0.5) continue
            const idx = Number(e.target.getAttribute('data-index'))
            if (Number.isNaN(idx)) continue
            if (e.intersectionRatio > bestRatio) {
              bestRatio = e.intersectionRatio
              bestIdx = idx
            }
          }
          if (bestIdx >= 0) setActiveIndex(bestIdx)
        },
        { root, threshold: thresholds }
      )
      cards.forEach((c) => observer!.observe(c))
    }

    startObserver()
    const mq = window.matchMedia('(max-width: 767px)')
    mq.addEventListener('change', startObserver)

    return () => {
      mq.removeEventListener('change', startObserver)
      observer?.disconnect()
    }
  }, [])

  const scrollToPlan = (index: number) => {
    const root = carouselRef.current
    const el = root?.querySelector<HTMLElement>(`.pricing-card[data-index="${index}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }

  return (
    <section
      id="pricing"
      className="landing-pricing landing-snap-section landing-snap-section--scroll flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-gray-900 to-[#0a0a0f]"
      data-nav-theme="dark"
    >
      <div className="max-w-7xl mx-auto px-5 box-border w-full py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="text-center mb-8 md:mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-light text-white mb-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Fair, Transparent Pricing.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-sm text-slate-500 mb-6"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Enterprise-grade security. No long-term contracts. Cancel anytime.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div ref={carouselRef} className="pricing-carousel -mx-5 md:mx-0">
            {LANDING_PRICING_PLANS.map((plan, index) => (
              <div
                key={plan.name}
                data-index={index}
                className={`pricing-card bg-gray-900 border ${
                  isPopularPlan(plan) ? 'featured border-[#7c5cfc]' : 'border-gray-800'
                }`}
              >
                {isPopularPlan(plan) ? (
                  <div className="pricing-badge" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    Most Popular
                  </div>
                ) : null}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {plan.name}
                  </h3>
                  <div className="price-wrapper">
                    <span className="price-amount text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {plan.price}
                    </span>
                    <span className="price-period" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-6 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {plan.description}
                  </p>
                  <Link
                    to="/signup"
                    className={`inline-flex items-center justify-center w-full py-[13px] px-5 text-[15px] font-semibold rounded-[10px] transition-colors box-border ${
                      isPopularPlan(plan)
                        ? 'border-2 border-transparent bg-[#7c5cfc] text-white hover:bg-[#7c3aed]'
                        : 'border-2 border-gray-700 text-white hover:border-[#7c5cfc]'
                    }`}
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Get Started
                  </Link>
                </div>
                <div className="border-t border-gray-800 pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-[#7c5cfc] flex-shrink-0" weight="fill" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0" weight="fill" />
                        )}
                        <span
                          className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="dots" role="tablist" aria-label="Pricing plans">
            {LANDING_PRICING_PLANS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`${LANDING_PRICING_PLANS[i].name} plan`}
                className={`dot${i === activeIndex ? ' active' : ''}`}
                onClick={() => scrollToPlan(i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 5: Mission & Values
function MissionValuesSlide() {
  const coreValues = [
    {
      title: 'Your Brand, Your Subdomain',
      signal: "Every account gets a dedicated space at tito.usemaison.io — your drivers and rider never see anyone else's name."
    },
    {
      title: 'Brand Autonomy',
      signal: 'Upload your logo and set your company name across every rider and driver touchpoint from day one.'
    },
    {
      title: 'Operations That Run Themselves',
      signal: 'Live driver and vehicle tracking on your dashboard. Automatic emails keep drivers and riders informed at every step, no manual follow-up needed. Assign a driver. They get notified. '
    }
  ]

  return (
    <section id="mission" className="landing-snap-section flex items-center justify-center bg-[#0a0a0f]" data-nav-theme="dark">
      <div className="max-w-[1280px] mx-auto px-5 box-border w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Strategic Vision */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerChildren}
            className="text-left"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-[clamp(1.5rem,5.5vw,2.25rem)] md:text-[48px] font-light text-white mb-3 md:mb-6 leading-[1.1] md:leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The Infrastructure of Independence.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-[14px] md:text-[18px] text-gray-300 leading-snug md:leading-relaxed mb-4 md:mb-8"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Maison is a modular platform designed to help local operators reclaim their brand from marketplace "taxes." We believe that independent limo and black car businesses shouldn't have to surrender their identity, customer relationships, or pricing control to third-party platforms that extract value without adding it. Our architecture gives you the tools to build, scale, and operate your business on your terms—with your branding, your pricing, and your operational standards front and center.
            </motion.p>
          </motion.div>

          {/* Right Column: Technical Core Values (desktop only — keeps mobile to one viewport) */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerChildren}
            className="hidden md:block space-y-6"
          >
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 border border-gray-800 p-6 rounded-lg"
              >
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {value.title}
                </h3>
                <p className="text-gray-400 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {value.signal}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Slide 7: Conclusion & Footer
function ConclusionSlide() {
  return (
    <section id="footer" className="landing-snap-section landing-snap-section--scroll flex flex-col bg-[#0d0c18]" data-nav-theme="dark">
      <div className="flex-1 flex items-center justify-center py-10 md:py-14 min-h-0">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="w-full box-border px-5 text-center max-w-[min(100%,56rem)] mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-white mb-3 md:mb-5 leading-[1.12] text-[clamp(1.7rem,5vw,2.625rem)] font-semibold"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Built for Operators Who Don&apos;t Compromise.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="max-w-3xl mx-auto mb-7 md:mb-10 text-[13px] leading-snug sm:text-base md:text-[18px] md:leading-normal"
            style={{ color: '#8a87a8', fontFamily: "'Work Sans', sans-serif" }}
          >
            Your brand. Your riders. Your drivers. All in one place - without giving up control.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center text-white font-semibold transition-colors hover:bg-[#6d28d9]"
              style={{
                fontFamily: "'Work Sans', sans-serif",
                background: '#7C3AED',
                padding: '14px 32px',
                borderRadius: 8,
              }}
            >
              Start Free Today
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
        className="shrink-0"
        style={{ borderTop: '0.5px solid #1e1c30' }}
      >
        <div className="w-full box-border" style={{ padding: '52px 60px 32px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-10 mb-6 text-left">
            <div>
              <div className="mb-3">
                <MaisonWordmark color="#ffffff" style={{ fontSize: 18 }} />
              </div>
              <p
                className="leading-relaxed max-w-xs"
                style={{ color: '#8a87a8', fontFamily: "'Work Sans', sans-serif", fontSize: 13 }}
              >
                Built for black car and limo operators who run their business like a brand.
              </p>
              <span
                className="inline-flex items-center mt-4 rounded-full"
                style={{
                  background: '#1e1640',
                  border: '0.5px solid #3d2f7a',
                  color: '#9d6fff',
                  fontSize: 11,
                  lineHeight: '16px',
                  padding: '4px 10px',
                  fontFamily: "'Work Sans', sans-serif",
                }}
              >
                slug.usemaison.io
              </span>
            </div>

            <nav>
              <h3
                className="mb-3 uppercase tracking-[0.16em]"
                style={{ color: '#4a4768', fontSize: 11, fontFamily: "'Work Sans', sans-serif" }}
              >
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#platform"
                    onClick={(e) => {
                      e.preventDefault()
                      smoothScrollToSection('platform')
                    }}
                    className="transition-colors hover:text-[#a89fd4]"
                    style={{ color: '#6b6888', fontSize: 13, fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Overview
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      smoothScrollToSection('pricing')
                    }}
                    className="transition-colors hover:text-[#a89fd4]"
                    style={{ color: '#6b6888', fontSize: 13, fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="transition-colors hover:text-[#a89fd4]"
                    style={{ color: '#6b6888', fontSize: 13, fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </nav>

            <nav>
              <h3
                className="mb-3 uppercase tracking-[0.16em]"
                style={{ color: '#4a4768', fontSize: 11, fontFamily: "'Work Sans', sans-serif" }}
              >
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#a89fd4]"
                    style={{ color: '#6b6888', fontSize: 13, fontFamily: "'Work Sans', sans-serif" }}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/about#founders-vision"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#a89fd4]"
                    style={{ color: '#6b6888', fontSize: 13, fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Founder&apos;s Vision
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@usemaison.io"
                    className="transition-colors hover:text-[#a89fd4]"
                    style={{ color: '#6b6888', fontSize: 13, fontFamily: "'Work Sans', sans-serif" }}
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="pt-4" style={{ borderTop: '0.5px solid #1e1c30' }}>
            <p
              style={{ color: '#3d3b54', fontSize: 12, fontFamily: "'Work Sans', sans-serif" }}
            >
              © 2026{' '}
              <MaisonWordmark
                color="#3d3b54"
                style={{ fontSize: 12, display: 'inline', verticalAlign: 'baseline' }}
              />
              . All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </section>
  )
}

// Main Landing Component
export default function Landing() {
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollToTop = useCallback(() => {
    scrollRootRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToSnapIndex = useCallback((index: number) => {
    const root = scrollRootRef.current
    if (!root) return
    const sections = root.querySelectorAll<HTMLElement>('.landing-snap-section')
    sections[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const scrollToSectionById = useCallback((id: string) => {
    smoothScrollToSection(id)
    setMenuOpen(false)
  }, [])

  useEffect(() => {
    const root = scrollRootRef.current
    if (!root) return
    const sections = root.querySelectorAll<HTMLElement>('.landing-snap-section')
    if (!sections.length) return

    const pickPrimary = (entries: IntersectionObserverEntry[]) => {
      const candidates = entries.filter((e) => e.isIntersecting && e.intersectionRatio >= 0.6)
      if (!candidates.length) return
      const best = candidates.reduce((a, b) =>
        a.intersectionRatio >= b.intersectionRatio ? a : b
      )
      const theme = (best.target as HTMLElement).dataset.navTheme === 'light' ? 'light' : 'dark'
      const index = [...sections].indexOf(best.target as HTMLElement)
      if (index < 0) return
      setNavTheme(theme)
      setActiveSection(index)
    }

    const observer = new IntersectionObserver(pickPrimary, {
      root,
      threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
    })
    sections.forEach((s) => observer.observe(s))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    if (activeSection === PRICING_SECTION_INDEX && menuOpen) setMenuOpen(false)
  }, [activeSection, menuOpen])

  const hideFloatingChromeOnPricing = activeSection === PRICING_SECTION_INDEX
  // On the first (Hero) slide, we want Login visible in the top-right,
  // but keep the existing "Get Started" CTA out of the way (it's already in-page).
  const ctaHidden = hideFloatingChromeOnPricing

  return (
    <main className="relative bg-[#0a0a0f] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Work Sans', sans-serif" }}>
      <div ref={scrollRootRef} className="landing-snap-page scroll-smooth">
        <HeroSlide />
        <PlatformSlide />
        <DriverExperienceSlide />
        <RiderBookingSlide />
        <MissionValuesSlide />
        <PricingSlide />
        <ConclusionSlide />
      </div>

      <div className="landing-snap-brand-row" data-theme={navTheme}>
        <button
          type="button"
          className="landing-snap-menu-btn"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          tabIndex={hideFloatingChromeOnPricing ? -1 : undefined}
          onClick={() => setMenuOpen(true)}
          style={{
            opacity: hideFloatingChromeOnPricing ? 0 : 1,
            pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
          }}
        >
          <List className="w-7 h-7" weight="bold" aria-hidden />
        </button>
        <button
          type="button"
          className="landing-snap-logo"
          data-theme={navTheme}
          onClick={scrollToTop}
          style={{
            opacity: hideFloatingChromeOnPricing ? 0 : 1,
            pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
          }}
        >
          <MaisonWordmark color={null} style={{ fontSize: 'inherit' }} />
        </button>
      </div>

      <div
        className="landing-snap-actions"
        style={{
          opacity: ctaHidden ? 0 : 1,
          pointerEvents: ctaHidden ? 'none' : 'auto',
        }}
      >
        <Link to="/tenant/login" className="landing-snap-login-cta" aria-label="Login">
          <SignIn className="w-4 h-4" weight="bold" aria-hidden />
        </Link>
        {activeSection !== 0 ? (
          <Link to="/signup" className="landing-snap-cta">
            Get Started
          </Link>
        ) : null}
      </div>

      <nav
        className="landing-snap-top-links"
        aria-label="Primary"
        style={{
          opacity: hideFloatingChromeOnPricing ? 0 : 1,
          pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
        }}
      >
        <a
          href="#platform"
          onClick={(e) => {
            e.preventDefault()
            scrollToSectionById('platform')
          }}
        >
          Product
        </a>
        <a
          href="#pricing"
          onClick={(e) => {
            e.preventDefault()
            scrollToSectionById('pricing')
          }}
        >
          Pricing
        </a>
        <a
          href="#mission"
          onClick={(e) => {
            e.preventDefault()
            scrollToSectionById('mission')
          }}
        >
          About
        </a>
        <a
          href="#footer"
          onClick={(e) => {
            e.preventDefault()
            scrollToSectionById('footer')
          }}
        >
          Company
        </a>
      </nav>

      <nav className="landing-snap-dot-nav" aria-label="Section navigation" data-theme={navTheme}>
        {SNAP_SECTION_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`landing-snap-dot-nav__btn${i === activeSection ? ' active' : ''}`}
            data-index={i}
            aria-label={label}
            aria-current={i === activeSection ? 'true' : undefined}
            onClick={() => scrollToSnapIndex(i)}
          />
        ))}
      </nav>

      {menuOpen ? (
        <div className="landing-snap-menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="landing-snap-menu-overlay__top">
            <button
              type="button"
              className="landing-snap-menu-close"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X className="w-8 h-8" weight="bold" aria-hidden />
            </button>
          </div>
          <nav className="landing-snap-menu-overlay__nav" aria-label="Secondary">
            <Link to="/tenant/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
            <a
              href="#platform"
              onClick={(e) => {
                e.preventDefault()
                scrollToSectionById('platform')
              }}
            >
              Product
            </a>
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault()
                scrollToSectionById('pricing')
              }}
            >
              Pricing
            </a>
            <a
              href="#mission"
              onClick={(e) => {
                e.preventDefault()
                scrollToSectionById('mission')
              }}
            >
              About
            </a>
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault()
                scrollToSectionById('footer')
              }}
            >
              Company
            </a>
            <div className="landing-snap-menu-overlay__divider" aria-hidden />
            <Link to="/signup" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </nav>
        </div>
      ) : null}
    </main>
  )
}
