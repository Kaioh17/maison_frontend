import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Car, 
  CurrencyDollar, 
  Link as LinkIcon, 
  DeviceMobile, 
  NavigationArrow, 
  Star, 
  CheckCircle, 
  XCircle 
} from '@phosphor-icons/react'
import driverDashboardImage from '../images/driver_dashboard(!).jpg'
import laptopDashboardImage from '../images/laptop_dashboard.png'

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

// Header Component
function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-19 py-4 flex items-center justify-between">
        <div className="text-2xl font-medium text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>
          Maison
        </div>
        <nav className="hidden md:flex items-center gap-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
          <a href="#platform" className="text-gray-300 hover:text-white transition-colors">Product</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#mission" className="text-gray-300 hover:text-white transition-colors">About</a>
          <a href="#footer" className="text-gray-300 hover:text-white transition-colors">Company</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/tenant/login"
            className="text-gray-300 hover:text-white transition-colors"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg font-semibold hover:bg-[#7c3aed] transition-colors"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

// Placeholder Component for Videos/Dashboards
function Placeholder({ label, type = 'video' }: { label: string; type?: 'video' | 'dashboard' }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {type === 'video' ? 'Demo Video:' : 'Dashboard:'}
          </p>
          <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {label}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
    </div>
  )
}

// Slide 1: Hero
function HeroSlide() {
  return (
    <section className="h-screen flex items-center justify-center relative snap-start overflow-hidden">
      {/* Deep slate-to-black radial gradient background */}
      <div className="absolute inset-0 bg-black">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top left, rgba(30, 41, 59, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at top right, rgba(15, 23, 42, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(30, 41, 59, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(15, 23, 42, 0.3) 0%, transparent 50%),
              #000000
            `
          }}
        ></div>
      </div>
      
      <div className="relative z-10 w-full px-8">
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
              className="text-[72px] font-light text-white mb-4 leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Run Your Fleet. Own The Experience.
            </motion.h1>
            <motion.p
              {...fadeInUp}
              className="text-[16px] text-[#8b5cf6] uppercase tracking-wider mb-6 font-medium"
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
                className="px-8 py-4 bg-[#8b5cf6] text-white rounded-lg font-semibold text-lg hover:bg-[#7c3aed] transition-all transform hover:scale-105 text-center"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Get Started
              </Link>
              <a
                href="#platform"
                className="px-8 py-4 border-2 border-gray-700 text-white rounded-lg font-semibold text-lg hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all text-center"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                See Demo
              </a>
            </motion.div>
          </motion.div>

          {/* Right half: Glassmorphism Dashboard Preview */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="hidden md:block"
          >
            <div className="relative">
              {/* Glassmorphism card */}
              <div 
                className="rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}
              >
                <div className="text-white mb-4 text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  Main Dashboard Preview
                </div>
                
                {/* Revenue Chart */}
                <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/5">
                  <div className="text-gray-400 text-xs mb-3" style={{ fontFamily: "'Work Sans', sans-serif" }}>Revenue (Last 7 Days)</div>
                  <div className="flex items-end gap-2 h-24">
                    {[65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-[#8b5cf6] to-[#7c3aed] rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Bookings List */}
                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                  <div className="text-gray-400 text-xs mb-3" style={{ fontFamily: "'Work Sans', sans-serif" }}>Recent Bookings</div>
                  <div className="space-y-2">
                    {['Airport Transfer', 'Corporate Event', 'Wedding Service'].map((booking, i) => (
                      <div key={i} className="flex items-center justify-between text-sm text-gray-300 py-2 border-b border-white/5 last:border-0" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        <span>{booking}</span>
                        <span className="text-[#8b5cf6]">${(i + 1) * 150}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
    <section id="platform" className="h-screen flex items-center justify-center bg-black snap-start">
      <div className="max-w-[1280px] mx-auto px-8 w-full">
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
                <CheckCircle className="w-5 h-5 text-[#8b5cf6] flex-shrink-0 mt-1" weight="fill" />
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
    <section className="h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black snap-start">
      <div className="max-w-[1280px] mx-auto px-8 w-full">
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
            Give Drivers A Platform They Actually Like.
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
                <CheckCircle className="w-5 h-5 text-[#8b5cf6] flex-shrink-0 mt-1" weight="fill" />
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
    <section className="h-screen flex items-center justify-center bg-black snap-start">
      <div className="max-w-[1280px] mx-auto px-8 w-full">
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
                <CheckCircle className="w-5 h-5 text-[#8b5cf6] flex-shrink-0 mt-1" weight="fill" />
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 5: Pricing
function PricingSlide() {
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
      ]
    },
    {
      name: 'Growth',
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
      ]
    },
    {
      name: 'Fleet',
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
      ]
    }
  ]

  return (
    <section id="pricing" className="h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black snap-start overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 w-full py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="text-center mb-16"
        >
          {/* Trust Bar */}
          {/* <motion.p
            variants={fadeInUp}
            className="text-sm text-slate-500 mb-6"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Enterprise-grade security. No long-term contracts. Cancel anytime.
          </motion.p> */}
          
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
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="grid md:grid-cols-3 gap-8"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-900 border rounded-lg p-8 relative ${
                plan.popular ? 'border-[#8b5cf6] scale-105' : 'border-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#8b5cf6] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-light text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {plan.price}
                  </span>
                  <span className="text-gray-400" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-400 mb-6 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {plan.description}
                </p>
                <Link
                  to="/signup"
                  className={`block w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                      : 'border-2 border-gray-700 text-white hover:border-[#8b5cf6]'
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
                        <CheckCircle className="w-5 h-5 text-[#8b5cf6] flex-shrink-0" weight="fill" />
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Slide 6: Mission & Values
function MissionValuesSlide() {
  const coreValues = [
    {
      title: 'Developer-First Architecture',
      signal: 'Modular, API-first logic.'
    },
    {
      title: 'Brand Autonomy',
      signal: 'White-label primitives.'
    },
    {
      title: 'Transparent Operations',
      signal: 'Real-time data integrity.'
    }
  ]

  return (
    <section id="mission" className="h-screen flex items-center justify-center bg-black snap-start">
      <div className="max-w-[1280px] mx-auto px-8 w-full">
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
              className="text-[48px] font-light text-white mb-6 leading-tight"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The Infrastructure of Independence.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-[18px] text-gray-300 leading-relaxed mb-8"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Maison is a modular platform designed to help local operators reclaim their brand from marketplace "taxes." We believe that independent limo and black car businesses shouldn't have to surrender their identity, customer relationships, or pricing control to third-party platforms that extract value without adding it. Our architecture gives you the tools to build, scale, and operate your business on your terms—with your branding, your pricing, and your operational standards front and center.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link
                to="/about"
                className="inline-block px-6 py-3 border-2 border-gray-700 text-white rounded-lg font-semibold hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Read the full founder's vision and engineering roadmap
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Technical Core Values */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerChildren}
            className="space-y-6"
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
                  Signal: {value.signal}
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
    <section id="footer" className="min-h-screen flex flex-col bg-black snap-start">
      {/* Final CTA */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="w-full px-20 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-light text-white mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Maison is the Next Generation<br />
            of Limo Software.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Stop fighting with outdated systems. Start running your business on a platform built for you — operators, drivers, and riders.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-[#8b5cf6] text-white rounded-lg font-semibold text-lg hover:bg-[#7c3aed] transition-all transform hover:scale-105"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Start Free Today
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
        className="border-t border-gray-800 py-12"
      >
        <div className="w-full px-20">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Maison
              </div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                Minimal platform to build, ship and iterate faster.
              </p>
            </div>
            <nav>
              <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Product
              </h3>
              <ul className="space-y-2">
                <li><a href="#platform" className="text-gray-400 hover:text-white transition-colors text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>Overview</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>Docs</a></li>
              </ul>
            </nav>
            <nav>
              <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Company
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>Contact</a></li>
              </ul>
            </nav>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Newsletter
              </h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#8b5cf6] text-white rounded-lg font-semibold hover:bg-[#7c3aed] transition-colors"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              © {new Date().getFullYear()} Maison. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </section>
  )
}

// Main Landing Component
export default function Landing() {
  return (
    <main className="relative bg-black text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Work Sans', sans-serif" }}>
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
        <Header />
        <HeroSlide />
        <PlatformSlide />
        <DriverExperienceSlide />
        <RiderBookingSlide />
        <PricingSlide />
        <MissionValuesSlide />
        <ConclusionSlide />
      </div>
    </main>
  )
}
