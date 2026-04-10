import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MaisonWordmark from '@components/MaisonWordmark'
import { LANDING_PRICING_PLANS, isPopularPlan } from '@data/landingPricingPlans'
import './landing-pricing.css'
import './landing-snap-nav.css'
import {
  CheckCircle,
  CreditCard,
  Link as LinkIcon,
  List,
  RocketLaunch,
  SignIn,
  SlidersHorizontal,
  TrendUp,
  X,
  XCircle,
} from '@phosphor-icons/react'

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

/** True when the device is likely using mouse/trackpad hover (not primary touch). */
function useFinePointerHover() {
  const [value, setValue] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setValue(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return value
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
        <div className="max-w-[1280px] mx-auto">
          {/* Hero orb column removed temporarily */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-center max-w-4xl mx-auto"
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
              className="text-[16px] text-[#7c5cfc] uppercase tracking-wider mb-4 font-medium"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Modern limo software for operators who think like brands.
            </motion.p>
            <motion.div
              {...fadeInUp}
              className="flex flex-wrap items-center justify-center gap-2 mb-6"
            >
              <span
                className="inline-flex rounded-full border border-[#7c5cfc]/35 bg-[#7c5cfc]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#c4b5fd]"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                MVP · shipping fast
              </span>
              <span
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-300"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Flexible billing · $0 Starter · cancel anytime
              </span>
            </motion.div>
            <motion.p
              {...fadeInUp}
              className="text-[17px] text-gray-300 mb-8 leading-relaxed md:hidden"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              One platform for bookings, drivers, payments, and your brand—built for black car and limo operators. Start
              free, upgrade when you grow, no long-term contracts.
            </motion.p>
            <motion.p
              {...fadeInUp}
              className="hidden text-[18px] text-gray-300 mb-8 leading-relaxed md:block"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              Maison centralizes bookings, drivers, payments, and branding into one clean platform built for black car and limo businesses. Start on a free Starter tier with ride-based pricing on larger fares, upgrade when you grow, or lock in predictable monthly plans—all without long-term contracts. Launch fast, operate with confidence, and deliver a level of service that looks and feels as premium as the rides you provide.
            </motion.p>
            <motion.div
              {...fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center"
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[168px] py-[13px] px-5 text-[15px] font-semibold rounded-[10px] text-center box-border border-2 border-transparent bg-[#7c5cfc] text-white hover:bg-[#7c3aed] transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Get Started
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center w-full sm:w-auto sm:min-w-[168px] py-[13px] px-5 text-[15px] font-semibold rounded-[10px] text-center box-border border-2 border-gray-700 text-white hover:border-[#7c5cfc] hover:text-[#7c5cfc] transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                See Demo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Slide 2: Scalability & Onboarding
function PlatformSlide() {
  const CARD_BG = 'rgba(124, 92, 252, 0.1)'
  const CARD_BORDER = 'rgba(124, 92, 252, 0.3)'
  const ICON_WELL_BG = 'rgba(124, 92, 252, 0.18)'

  const featureCards = [
    {
      id: 'launch',
      Icon: RocketLaunch,
      title: 'Launch in one day',
      description: 'Your booking page goes live fast. No dev, no waiting, no back-and-forth.',
    },
    {
      id: 'invites',
      Icon: LinkIcon,
      title: 'Secure invite links',
      description: 'Share access with drivers and clients. No accounts to manage, no exposure.',
    },
    {
      id: 'rates',
      Icon: SlidersHorizontal,
      title: 'Instant rate config',
      description: 'Set and adjust your pricing from the dashboard. No code, no tickets.',
    },
    {
      id: 'scale',
      Icon: TrendUp,
      title: 'Scale without migration',
      description: 'Add vehicles, drivers, and clients. The platform moves with you.',
    },
    {
      id: 'billing',
      Icon: CreditCard,
      title: 'Start free, upgrade when it makes sense',
      description:
        'No inbox pings, no pressure. Level up when your bookings need the headroom — not when we do.',
      fullWidth: true,
      warm: true,
    },
  ] as const

  return (
    <section
      id="platform"
      className="landing-snap-section flex items-center justify-center"
      style={{ backgroundColor: '#0d0d12' }}
      data-nav-theme="dark"
    >
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
            className="text-[48px] font-light text-white mb-4 leading-tight max-md:text-[clamp(1.75rem,6vw,2.25rem)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            From Solo Operator To Growing Fleet.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mb-5 max-w-[42rem] text-[14px] leading-relaxed text-[#9ca3af] sm:text-[15px] md:mb-8 md:text-[16px]"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Onboard in days, not months. Maison is an active MVP — founding operators help steer what we build next.
          </motion.p>
          <motion.div
            variants={staggerChildren}
            className="landing-platform-carousel -mx-5 flex w-auto max-md:gap-3 max-md:overflow-x-auto max-md:overflow-y-visible max-md:px-5 max-md:pb-1 max-md:pr-6 md:mx-0 md:grid md:w-full md:grid-cols-2 md:gap-[10px] md:overflow-visible md:px-0 md:pr-0"
          >
            {featureCards.map((item) => {
              const Icon = item.Icon
              const fullWidth = 'fullWidth' in item && item.fullWidth
              const warm = 'warm' in item && item.warm
              return (
                <motion.article
                  key={item.id}
                  variants={fadeInUp}
                  className={`w-[min(88vw,20rem)] shrink-0 snap-start rounded-[8px] p-4 sm:w-[min(86vw,22rem)] sm:p-5 md:w-auto md:min-w-0 md:snap-normal md:p-7 md:min-h-0 ${fullWidth ? 'max-md:min-w-[min(92vw,24rem)] md:col-span-2' : ''}`}
                  style={{
                    backgroundColor: warm ? 'rgba(110, 88, 92, 0.22)' : CARD_BG,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: warm ? 'rgba(212, 175, 130, 0.42)' : CARD_BORDER,
                  }}
                >
                  <div
                    className="mb-3 flex h-8 w-8 items-center justify-center rounded-[6px] md:mb-4 md:h-9 md:w-9"
                    style={{ backgroundColor: ICON_WELL_BG }}
                    aria-hidden
                  >
                    <Icon
                      className="h-4 w-4 text-[#7c5cfc] sm:h-[17px] sm:w-[17px] md:h-[18px] md:w-[18px]"
                      weight="regular"
                    />
                  </div>
                  <h3
                    className="mb-1.5 text-[clamp(0.94rem,3.9vw,1.05rem)] font-semibold leading-snug text-white sm:mb-2 sm:text-[1.05rem] md:text-[18px]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[clamp(0.8125rem,3.35vw,0.9375rem)] leading-relaxed text-[#9ca3af] sm:text-[14px] md:text-[15px]"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    {item.description}
                  </p>
                </motion.article>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 3: Driver Experience
function DriverExperienceSlide() {
  const hoverPointer = useFinePointerHover()
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [tappedId, setTappedId] = useState<string | null>(null)

  const leadPoints = [
    {
      id: 'rides',
      title: "Today's rides and pickups, one clear screen.",
      detail:
        'Clear trip visibility for quick glances between jobs—no hunting through menus or threads.',
    },
    {
      id: 'earnings',
      title: 'Earnings and trip details in view—without digging through messages.',
      detail:
        'Tracking and payout-ready context drivers can trust, so nothing gets lost in the shuffle.',
    },
    {
      id: 'status',
      title: 'Automatic notifications at every step of the ride.',
      detail: 'When a ride is created or a status changes, Maison emails the right people automatically. Dispatch, drivers, and riders stay informed without anyone lifting a finger.'
    },
  ] as const

  const revealDetail = (id: string) =>
    (hoverPointer && hoverId === id) || (!hoverPointer && tappedId === id)

  return (
    <section
      id="drivers"
      className="landing-snap-section flex items-center justify-center"
      style={{ backgroundColor: '#0d0d18' }}
      data-nav-theme="dark"
    >
      <div className="landing-driver-route-map" aria-hidden>
        <svg
          className="landing-driver-route-map__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="landing-route-map__grid" aria-hidden>
            <line x1="0" y1="20" x2="100" y2="20" />
            <line x1="0" y1="40" x2="100" y2="40" />
            <line x1="0" y1="60" x2="100" y2="60" />
            <line x1="0" y1="80" x2="100" y2="80" />
            <line x1="20" y1="0" x2="20" y2="100" />
            <line x1="40" y1="0" x2="40" y2="100" />
            <line x1="60" y1="0" x2="60" y2="100" />
            <line x1="80" y1="0" x2="80" y2="100" />
          </g>
          <g className="landing-route-map__routes" fill="none" aria-hidden>
            <path
              className="landing-route-map__path landing-route-map__path--a"
              pathLength="100"
              d="M 15 75 C 15 56 16 44 15 35 C 24 33 38 37 45 35 C 47 28 46 20 45 15"
            />
            <path
              className="landing-route-map__path landing-route-map__path--b"
              pathLength="100"
              d="M 85 70 C 76 52 58 48 48 40 S 28 32 25 25"
            />
            <path
              className="landing-route-map__path landing-route-map__path--c"
              pathLength="100"
              d="M 55 20 Q 58 38 55 55 C 48 62 38 72 30 80"
            />
          </g>
          <g className="landing-route-map__stops" aria-hidden>
            <g transform="translate(15 75)">
              <g className="landing-route-map__pulse">
                <circle className="landing-route-map__ring" r="4.2" cx="0" cy="0" />
                <circle className="landing-route-map__dot" r="2.1" cx="0" cy="0" />
              </g>
            </g>
            <circle className="landing-route-map__dot" cx="45" cy="15" r="2.1" />
            <g transform="translate(25 25)">
              <g className="landing-route-map__pulse landing-route-map__pulse--delay">
                <circle className="landing-route-map__ring" r="4.2" cx="0" cy="0" />
                <circle className="landing-route-map__dot" r="2.1" cx="0" cy="0" />
              </g>
            </g>
            <circle className="landing-route-map__dot" cx="30" cy="80" r="2.1" />
            <circle className="landing-route-map__dot" cx="85" cy="70" r="2.1" />
            <circle className="landing-route-map__dot" cx="55" cy="20" r="2.1" />
          </g>
        </svg>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 85% 55% at 100% 45%, rgba(124, 92, 252, 0.09) 0%, transparent 58%), radial-gradient(ellipse 60% 40% at 0% 80%, rgba(15, 23, 42, 0.35) 0%, transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto box-border w-full max-w-[1280px] px-5">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="max-w-xl text-left md:max-w-[min(32rem,48vw)]"
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-[48px] font-light leading-tight text-white max-md:text-[clamp(1.75rem,6vw,2.25rem)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Give Drivers a Platform They Can Trust
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mb-8 max-w-[28rem] text-[15px] leading-relaxed text-[#9ca3af] md:text-[16px]"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Tools that help drivers stay informed, organized, and ready for every trip—everything in one place, so they
            spend less time checking texts and more time focused on the road.
          </motion.p>

          <motion.div variants={staggerChildren} className="flex flex-col gap-3">
            {leadPoints.map((item) => {
              const open = revealDetail(item.id)
              return (
                <motion.div key={item.id} variants={fadeInUp} className="border-l-2 border-[#7c5cfc]/45 pl-5">
                  <button
                    type="button"
                    className="w-full rounded-r-md text-left outline-none transition-colors hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-[#7c5cfc]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d18]"
                    aria-expanded={open}
                    aria-label={`${item.title}. ${open ? 'Hide' : 'Show'} details.`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={() => hoverPointer && setHoverId(item.id)}
                    onMouseLeave={() => hoverPointer && setHoverId(null)}
                    onClick={() => {
                      if (hoverPointer) return
                      setTappedId((prev) => (prev === item.id ? null : item.id))
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      setTappedId((prev) => (prev === item.id ? null : item.id))
                    }}
                  >
                    <span
                      className="block text-[17px] font-semibold leading-snug text-white md:text-[18px]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {item.title}
                    </span>
                    {!hoverPointer ? (
                      <span
                        className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-slate-500"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        Tap for details
                      </span>
                    ) : null}
                    <div
                      className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p
                          className="pt-2 text-[14px] leading-relaxed text-[#94a3b8] md:text-[15px]"
                          style={{ fontFamily: "'Work Sans', sans-serif" }}
                        >
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-8 border-t border-white/10 pt-8"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            <p className="mb-3 text-[14px] leading-relaxed text-[#94a3b8] md:text-[15px]">
              Built to support smoother operations today, with deeper payout workflows as we scale. Payouts are handled
              by the tenant for now—we provide the data foundation; automation is on the roadmap.
            </p>
            <p className="text-[12px] leading-relaxed text-slate-500 md:text-[13px]">
              Payout workflows vary by tenant setup.
            </p>
          </motion.div>
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
    'Flexible checkout: riders pay securely; saved cards speed up repeat bookings.',
    'Your brand on every confirmation.',
  ]

  const brandedLinkPills = [
    {
      full: 'limo.usemaison.io/driver',
      top: '6%',
      left: '4%',
      rotate: -2.5,
      yAmp: 6,
      duration: 5.2,
      delay: 0,
    },
    {
      full: 'limo.usemaison.io/riders',
      top: '42%',
      left: '-2%',
      rotate: 1.8,
      yAmp: 7,
      duration: 4.6,
      delay: 0.45,
    },
    {
      full: 'limo.usemaison.io/landing',
      top: '72%',
      left: '8%',
      rotate: -1.2,
      yAmp: 5,
      duration: 5.8,
      delay: 0.9,
    },
  ] as const

  return (
    <section
      id="rider-experience"
      className="landing-snap-section flex items-center justify-center bg-[#0a0a0f]"
      data-nav-theme="dark"
    >
      <div className="relative mx-auto box-border flex w-full max-w-[1280px] flex-col items-stretch gap-10 px-5 md:flex-row md:items-center md:gap-12 lg:gap-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="relative order-2 -mx-1 h-[220px] w-full shrink-0 overflow-visible md:order-1 md:mx-0 md:h-[min(380px,52vh)] md:w-[min(100%,340px)] lg:w-[380px]"
          aria-hidden
        >
          {brandedLinkPills.map((pill) => (
            <motion.div
              key={pill.full}
              className="absolute max-w-[calc(100vw-2.5rem)] rounded-full border border-white/12 bg-[#12121a]/95 px-3.5 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-sm md:max-w-[19rem]"
              style={{
                top: pill.top,
                left: pill.left,
                rotate: `${pill.rotate}deg`,
              }}
              animate={{ y: [0, -pill.yAmp, 0] }}
              transition={{
                duration: pill.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pill.delay,
              }}
            >
              <span
                className="block truncate font-mono text-[11px] tracking-tight text-white/88 sm:text-[12px] md:text-[13px]"
                style={{ fontFamily: "ui-monospace, 'Cascadia Code', 'SF Mono', Menlo, monospace" }}
              >
                <span className="text-white/55">limo.usemaison.io</span>
                <span className="text-[#c4b5fd]">
                  {pill.full.replace('limo.usemaison.io', '')}
                </span>
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="order-1 min-w-0 flex-1 text-left md:order-2"
        >
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-[48px] font-light leading-tight text-white max-md:text-[clamp(1.75rem,6vw,2.25rem)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Your Brand At Every Touchpoint.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mb-8 text-[16px] text-gray-400"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Riders see your name, your logo, your standards.
          </motion.p>
          <motion.ul variants={staggerChildren} className="space-y-4">
            {actionItems.map((item, index) => (
              <motion.li
                key={index}
                variants={fadeInUp}
                className="flex items-start gap-3 text-[18px] text-slate-400"
                style={{ fontFamily: "'Work Sans', sans-serif", lineHeight: '1.5' }}
              >
                <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-[#7c5cfc]" weight="fill" />
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
            className="text-sm text-slate-500 mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Enterprise-grade security. No long-term contracts—cancel anytime. Starter stays at $0 with a small share on
            in-app payments over $50; Growth and Fleet are simple monthly seats when you&apos;re ready for more volume.
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
    },
    {
      title: 'Honest MVP Momentum',
      signal:
        "We're not pretending to be a decade-old suite. Maison ships continuously, and early operators get direct input on the roadmap—your workflow matters more than a polished slide deck.",
    },
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
              Maison is a modular platform designed to help local operators reclaim their brand from marketplace "taxes." We believe that independent limo and black car businesses shouldn't have to surrender their identity, customer relationships, or pricing control to third-party platforms that extract value without adding it. Our architecture gives you the tools to build, scale, and operate your business on your terms—with your branding, your pricing, and your operational standards front and center. That includes billing you can grow into: free to try, transparent when you scale. We ship as an active MVP and improve weekly with real operator feedback.
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
          <motion.figure
            variants={fadeInUp}
            className="mx-auto mb-7 md:mb-8 max-w-2xl rounded-xl border border-[#7c5cfc]/35 bg-[#151425]/80 px-5 py-4 text-left"
          >
            <blockquote
              className="text-[15px] font-medium leading-snug text-white sm:text-base md:text-lg"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              &ldquo;Professional chauffeurs and independent operators deserve the same tools as any serious business,
              without the tax.&rdquo;
            </blockquote>
            <figcaption
              className="mt-3 text-[13px] text-[#8a87a8]"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              — Mubaraq Odumeso, Founder{' '}
              <Link to="/about" className="text-[#a78bfa] underline-offset-2 hover:underline">
                Read the vision
              </Link>
            </figcaption>
          </motion.figure>
          <motion.p
            variants={fadeInUp}
            className="max-w-3xl mx-auto mb-7 md:mb-10 text-[13px] leading-snug sm:text-base md:text-[18px] md:leading-normal"
            style={{ color: '#8a87a8', fontFamily: "'Work Sans', sans-serif" }}
          >
            Your brand. Your riders. Your drivers. All in one place—without giving up control. Join while we&apos;re
            still early: your feedback shapes the product.
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
