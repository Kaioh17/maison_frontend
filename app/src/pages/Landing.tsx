import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, MotionConfig } from 'framer-motion'
import MaisonWordmark from '@components/MaisonWordmark'
import MaisonDarkModeLogo from '@components/MaisonDarkModeLogo'
import heroOverviewPhone from '../images/app_view/overview_phone view.png'
import { LANDING_PRICING_PLANS, isPopularPlan, buildPlanDisplays } from '@data/landingPricingPlans'
import { getPublicPlans, foundingOperatorSlotsRemaining, type PlanCatalogEntry } from '@api/subscription'
import { getTenantAppUrl } from '@config/host'
import './landing-theme.css'
import './landing-pricing.css'
import './landing-snap-nav.css'
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Link as LinkIcon,
  List,
  RocketLaunch,
  SignIn,
  SlidersHorizontal,
  TrendUp,
  X,
} from '@phosphor-icons/react'

// Heavy, springy ease shared with the CSS (--landing-ease)
const EASE = [0.32, 0.72, 0, 1] as const

// Animation variants. `transition` lives inside `animate` so it applies both
// when spread onto an element and when used as `variants` under a stagger parent.
const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
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
  'How it works',
  'Drivers',
  'Rider experience',
  'Mission',
  'Pricing',
  'Get started',
] as const

const PRICING_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Pricing')
const MISSION_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Mission')
const FOOTER_SECTION_INDEX = SNAP_SECTION_LABELS.indexOf('Get started')

const QUESTIONS_FORM_URL = 'https://forms.gle/eJDkYht52iGe5dgm7'

const smoothScrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const snapContainer = el.closest('.landing-snap-page')
  if (snapContainer instanceof HTMLElement) {
    const top =
      el.getBoundingClientRect().top -
      snapContainer.getBoundingClientRect().top +
      snapContainer.scrollTop
    snapContainer.scrollTo({ top, behavior: 'smooth' })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

type HeroParticle = {
  x: number
  y: number
  vx: number
  vy: number
  targetVx: number
  targetVy: number
  radius: number
  pulsePhase: number
  pulseSpeed: number
  isAnchor: boolean
}

function HeroParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const mediaQuery = window.matchMedia('(max-width: 767px)')
    if (mediaQuery.matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let animationFrame = 0
    let particles: HeroParticle[] = []
    let lastTime = 0
    const maxLinksDistance = 100
    const targetFrameInterval = 1000 / 60
    const easing = 0.03
    const fieldRightPadding = 36
    const horizontalMargin = 18
    const verticalMargin = 18
    const baseVelocityRange: [number, number] = [0.3, 0.6]

    const random = (min: number, max: number) => Math.random() * (max - min) + min
    const pickVelocity = (sign: number) => random(baseVelocityRange[0], baseVelocityRange[1]) * sign

    const initializeParticles = () => {
      const particleCount = Math.floor(random(60, 81))
      const anchorCount = Math.floor(random(4, 7))
      const anchorIndices = new Set<number>()

      while (anchorIndices.size < anchorCount) {
        anchorIndices.add(Math.floor(Math.random() * particleCount))
      }

      const safeMaxX = Math.max(horizontalMargin, width - fieldRightPadding)

      particles = Array.from({ length: particleCount }, (_, idx) => {
        const signX = Math.random() < 0.5 ? -1 : 1
        const signY = Math.random() < 0.5 ? -1 : 1
        const isAnchor = anchorIndices.has(idx)

        return {
          x: random(horizontalMargin, safeMaxX),
          y: random(verticalMargin, Math.max(verticalMargin, height - verticalMargin)),
          vx: pickVelocity(signX),
          vy: pickVelocity(signY),
          targetVx: pickVelocity(signX),
          targetVy: pickVelocity(signY),
          radius: isAnchor ? 4 : random(1.5, 2.5),
          pulsePhase: random(0, Math.PI * 2),
          pulseSpeed: random(0.0006, 0.0012),
          isAnchor,
        }
      })
    }

    const resize = () => {
      width = Math.floor(window.innerWidth * 0.55)
      height = Math.floor(window.innerHeight)
      dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initializeParticles()
    }

    const draw = (time: number) => {
      animationFrame = window.requestAnimationFrame(draw)

      if (time - lastTime < targetFrameInterval) return
      lastTime = time

      ctx.clearRect(0, 0, width, height)

      const safeMaxX = Math.max(horizontalMargin, width - fieldRightPadding)
      const safeMaxY = Math.max(verticalMargin, height - verticalMargin)

      for (const particle of particles) {
        if (particle.x <= horizontalMargin && particle.targetVx < 0) {
          particle.targetVx = pickVelocity(1)
        } else if (particle.x >= safeMaxX && particle.targetVx > 0) {
          particle.targetVx = pickVelocity(-1)
        }

        if (particle.y <= verticalMargin && particle.targetVy < 0) {
          particle.targetVy = pickVelocity(1)
        } else if (particle.y >= safeMaxY && particle.targetVy > 0) {
          particle.targetVy = pickVelocity(-1)
        }

        particle.vx += (particle.targetVx - particle.vx) * easing
        particle.vy += (particle.targetVy - particle.vy) * easing
        particle.x += particle.vx
        particle.y += particle.vy

        const pulse = 0.5 + 0.5 * Math.sin(time * particle.pulseSpeed + particle.pulsePhase)
        const opacity = 0.3 + pulse * 0.4
        const alpha = particle.isAnchor ? Math.min(0.9, opacity + 0.15) : opacity

        ctx.beginPath()
        ctx.fillStyle = `rgba(169, 156, 242, ${alpha.toFixed(3)})`
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy)
          if (distance > maxLinksDistance) continue

          const proximity = 1 - distance / maxLinksDistance
          const phase = (i * 0.21 + j * 0.13) % (Math.PI * 2)
          const linkPulse = 0.5 + 0.5 * Math.sin(time * 0.001 + phase)
          const alpha = proximity * linkPulse * 0.15
          if (alpha < 0.01) continue

          ctx.beginPath()
          ctx.strokeStyle = `rgba(169, 156, 242, ${alpha.toFixed(3)})`
          ctx.lineWidth = 1
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    resize()
    animationFrame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-0 hidden h-screen w-[55vw] md:block"
      style={{
        maskImage:
          'linear-gradient(to right, black 40%, transparent 75%), radial-gradient(90% 100% at 30% 50%, black 45%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, black 40%, transparent 75%), radial-gradient(90% 100% at 30% 50%, black 45%, transparent 100%)',
      }}
    />
  )
}

/** iPhone-style frame with real overview screenshot + titanium bezel. */
function HeroIPhoneMockup({ className }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto ${className ?? ''}`}
      style={{
        aspectRatio: '393 / 852',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        filter:
          'drop-shadow(0 28px 56px rgba(0,0,0,0.42)) drop-shadow(0 14px 32px rgba(0,0,0,0.28)) drop-shadow(0 0 48px rgba(110,91,216,0.16))',
      }}
    >
      {/* Side buttons (subtle, scaled with device) */}
      <div
        className="pointer-events-none absolute left-[-3px] top-[22%] z-20 h-8 w-[3px] rounded-[2px]"
        style={{
          background: 'linear-gradient(90deg, #2b2b32, #15151a)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 2px 0 3px rgba(0,0,0,0.35)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[-3px] top-[calc(22%+2.25rem)] z-20 h-8 w-[3px] rounded-[2px]"
        style={{
          background: 'linear-gradient(90deg, #2b2b32, #15151a)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 2px 0 3px rgba(0,0,0,0.35)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[-3px] top-[26%] z-20 h-14 w-[3px] rounded-[2px]"
        style={{
          background: 'linear-gradient(-90deg, #2b2b32, #15151a)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), -2px 0 3px rgba(0,0,0,0.35)',
        }}
        aria-hidden
      />

      <div
        className="box-border h-full w-full"
        style={{
          borderRadius: '2.75rem',
          padding: '10px 10px 13px',
          boxSizing: 'border-box',
          background:
            'linear-gradient(168deg, #3a3a42 0%, #1c1c22 20%, #121218 52%, #0e0e14 82%, #25252c 100%)',
          boxShadow:
            'inset 0 2px 2px rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.55)',
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{
            borderRadius: '2.15rem',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            boxSizing: 'border-box',
          }}
        >
          <img
            src={heroOverviewPhone}
            alt="Maison tenant dashboard on mobile"
            className="h-full w-full object-cover object-top"
            width={786}
            height={1704}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  )
}

// Slide 1: Hero
function HeroSlide() {
  return (
    <section className="landing-snap-section landing-ambient landing-ambient--tr relative min-h-0 overflow-x-hidden">
      <HeroParticleField />

      <div className="relative z-10 box-border flex h-full min-h-0 w-full max-w-[1280px] flex-col px-5 pt-[4.5rem] pb-3 md:mx-auto md:flex-row md:items-center md:justify-center md:gap-10 md:px-8 md:pt-[4.75rem] md:pb-6 lg:gap-14">
        {/* Product visual: above headline on mobile; right column on desktop */}
        <div className="relative order-1 hidden min-h-0 w-full min-w-0 max-md:flex-none max-md:shrink-0 flex-1 flex-col items-center justify-start md:order-2 md:mt-0 md:max-w-[min(44%,420px)] md:flex-none md:justify-center">
          <div
            className="relative z-10 mx-auto w-[min(300px,88vw)] overflow-hidden max-md:translate-y-14 md:hidden"
            style={{
              height: 'calc(min(300px, 88vw) * 852 / 393 / 2)',
            }}
          >
            <div className="w-[min(300px,88vw)]">
              <HeroIPhoneMockup />
            </div>
          </div>
          <div className="relative mx-auto hidden w-[min(280px,32vw)] max-w-full md:block lg:w-[min(300px,30vw)]">
            <HeroIPhoneMockup />
            <motion.div
              aria-hidden
              className="landing-chip absolute -left-10 bottom-[16%] z-30 -rotate-2 lg:-left-16"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE, delay: 0.5 } }}
            >
              <span className="text-white/55">limo.</span>
              <span className="text-white">usemaison.io</span>
            </motion.div>
          </div>
        </div>

        {/* Copy column */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="order-2 flex min-h-0 min-w-0 flex-1 flex-col justify-center max-md:mt-1 md:order-1 md:max-w-3xl md:shrink md:pt-0 items-center text-center mx-auto"
        >
          <motion.p variants={fadeInUp} className="landing-eyebrow mb-4 max-sm:!hidden md:mb-6">
            For independent limo &amp; black car operators
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="text-white [text-wrap:balance]"
            style={{
              fontSize: 'clamp(2.25rem, 3.6vw + 1rem, 4rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
              fontWeight: 500,
            }}
          >
            Run your fleet.
            <br />
            <span className="landing-accent-text">Own the experience.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="landing-lead mt-3 max-w-[24rem] md:mt-5 md:max-w-[32rem]">
            Your branded booking link, your drivers, your rates. No aggregator fees, no middlemen.
          </motion.p>
          <motion.ul
            variants={fadeInUp}
            className="m-0 mt-4 flex list-none flex-wrap justify-center gap-x-5 gap-y-1 p-0 text-[12px] text-[color:var(--landing-fg-faint)] md:mt-6 md:text-[13px]"
          >
            {['Free to start', 'No contracts', 'White-label URLs'].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={14} weight="bold" className="landing-accent-text" aria-hidden />
                {item}
              </li>
            ))}
          </motion.ul>
          <motion.div
            variants={fadeInUp}
            className="mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center md:mt-9"
          >
            <Link
              to="/signup"
              className="landing-btn landing-btn--primary landing-btn--icon w-full justify-between sm:w-auto sm:justify-center"
            >
              Get started
              <span className="landing-btn__icon">
                <ArrowUpRight size={16} weight="bold" aria-hidden />
              </span>
            </Link>
            <a
              href={getTenantAppUrl('app', '/tenant/login?demo=1')}
              className="landing-btn landing-btn--ghost w-full sm:w-auto"
            >
              See the demo
            </a>
          </motion.div>
          <motion.ul
            variants={fadeInUp}
            className="m-0 mt-8 hidden w-full max-w-3xl list-none grid-cols-3 gap-3 p-0 text-left md:grid"
          >
            {[
              { Icon: LinkIcon, title: 'Your booking link', text: 'Clients book on your branded page, on your own URL.' },
              { Icon: SlidersHorizontal, title: 'Your rates', text: 'Set pricing and manage drivers and vehicles from one dashboard.' },
              { Icon: CreditCard, title: 'Your payouts', text: 'Riders pay by card and the money goes straight to you.' },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Icon size={20} weight="bold" className="landing-accent-text" aria-hidden />
                <p className="m-0 mt-3 text-[14px] font-medium text-white">{title}</p>
                <p className="m-0 mt-1 text-[12.5px] leading-snug text-[color:var(--landing-fg-faint)]">{text}</p>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 2: Scalability & Onboarding
function PlatformSlide() {
  const featureCards = [
    {
      id: 'launch',
      Icon: RocketLaunch,
      title: 'Launch in one day',
      description: 'Your booking page goes live fast. No dev, no waiting, no back-and-forth.',
      span: 'md:col-span-7',
    },
    {
      id: 'invites',
      Icon: LinkIcon,
      title: 'Secure invite links',
      description: 'Share access with drivers and clients. No accounts to manage, no exposure.',
      span: 'md:col-span-5',
    },
    {
      id: 'rates',
      Icon: SlidersHorizontal,
      title: 'Instant rate config',
      description: 'Set and adjust your pricing from the dashboard. No code, no tickets.',
      span: 'md:col-span-5',
    },
    {
      id: 'scale',
      Icon: TrendUp,
      title: 'Scale without migration',
      description: 'Add vehicles, drivers, and clients. The platform moves with you.',
      span: 'md:col-span-7',
    },
    {
      id: 'billing',
      Icon: CreditCard,
      title: 'Start free, upgrade when it makes sense',
      description:
        'No inbox pings, no pressure. Level up when your bookings need the headroom, not when we do.',
      span: 'md:col-span-12',
      featured: true,
    },
  ] as const

  return (
    <section
      id="platform"
      className="landing-snap-section landing-ambient landing-ambient--tl flex items-center justify-center"
    >
      <div className="mx-auto box-border w-full max-w-[1280px] px-5 pt-14">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="text-left"
        >
          <div className="mb-6 md:mb-9 md:flex md:items-end md:justify-between md:gap-12">
            <div>
              <motion.p variants={fadeInUp} className="landing-eyebrow mb-4">
                Platform
              </motion.p>
              <motion.h2 variants={fadeInUp} className="landing-h2 md:max-w-[22ch]">
                From solo operator to growing fleet.
              </motion.h2>
            </div>
            <motion.p variants={fadeInUp} className="landing-lead mt-4 md:mt-0 md:max-w-[26rem]">
              Stop duct-taping your business together with WhatsApp and spreadsheets. A platform built for operators
              like you, not aggregators, not enterprises.
            </motion.p>
          </div>

          <motion.div
            variants={staggerChildren}
            className="landing-platform-carousel -mx-5 flex w-auto max-md:gap-3 max-md:overflow-x-auto max-md:overflow-y-visible max-md:px-5 max-md:pb-1 max-md:pr-6 md:mx-0 md:grid md:w-full md:grid-cols-12 md:gap-3 md:overflow-visible md:px-0 md:pr-0"
          >
            {featureCards.map((item) => {
              const Icon = item.Icon
              const featured = 'featured' in item && item.featured
              return (
                <motion.article
                  key={item.id}
                  variants={fadeInUp}
                  className={`landing-bezel w-[min(88vw,20rem)] shrink-0 snap-start sm:w-[min(86vw,22rem)] md:w-auto md:min-w-0 md:snap-normal ${item.span} ${featured ? 'landing-bezel--accent max-md:min-w-[min(92vw,24rem)]' : ''}`}
                >
                  <div className="landing-bezel__core !p-5 md:!p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="landing-icon-well !h-9 !w-9" aria-hidden>
                        <Icon size={18} weight="light" />
                      </span>
                      <h3 className="m-0 text-[1.0625rem] font-medium leading-snug tracking-[-0.02em] text-white md:text-[1.125rem]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="m-0 text-[0.875rem] leading-relaxed text-[color:var(--landing-fg-muted)] md:text-[0.9375rem]">
                      {item.description}
                    </p>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 3: How It Works
function HowItWorksSlide() {
  const steps = [
    {
      num: '01',
      title: 'Claim your platform',
      description:
        'Sign up and get a branded booking URL at yourname.usemaison.io. Live in minutes, no dev work required.',
    },
    {
      num: '02',
      title: 'Configure your fleet',
      description:
        'Add vehicles, set your rates, and upload your logo. Your booking page reflects your brand from day one.',
    },
    {
      num: '03',
      title: 'Share your link',
      description:
        'Send riders your booking URL. They book directly with you: no app download, no marketplace cut.',
    },
    {
      num: '04',
      title: 'Get paid',
      description:
        'Assign drivers, track rides in real time, and receive payments straight to your account.',
    },
  ] as const

  return (
    <section
      id="how-it-works"
      className="landing-snap-section landing-ambient landing-ambient--br flex items-center justify-center"
    >
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerChildren}
        className="mx-auto box-border grid w-full max-w-[1280px] gap-7 px-5 pt-14 md:grid-cols-12 md:items-center md:gap-14"
      >
        <div className="md:col-span-5">
          <motion.p variants={fadeInUp} className="landing-eyebrow mb-4">
            How Maison works
          </motion.p>
          <motion.h2 variants={fadeInUp} className="landing-h2">
            Up and running in a day.
          </motion.h2>
          <motion.p variants={fadeInUp} className="landing-lead mt-4 max-md:hidden">
            Four steps from sign-up to your first paid ride. No developer, no migration, no sales call.
          </motion.p>
        </div>

        <motion.div variants={fadeInUp} className="landing-bezel md:col-span-7">
          <ol className="landing-bezel__core m-0 list-none !p-1.5 md:!p-2">
            {steps.map((step, i) => (
              <li
                key={step.num}
                className={`grid grid-cols-[2.25rem_1fr] gap-x-3 px-3.5 py-3.5 md:grid-cols-[3rem_1fr] md:gap-x-4 md:px-5 md:py-5 ${
                  i > 0 ? 'border-t border-[color:var(--landing-hairline)]' : ''
                }`}
              >
                <span className="landing-mono landing-accent-text pt-0.5 text-[12px] md:text-[13px]">{step.num}</span>
                <div>
                  <h3 className="m-0 mb-1 text-[1rem] font-medium tracking-[-0.02em] text-white md:text-[1.125rem]">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[0.8125rem] leading-relaxed text-[color:var(--landing-fg-muted)] md:text-[0.9375rem]">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>
      </motion.div>
    </section>
  )
}

// Slide 4: Driver Experience
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

  // Hover previews on fine pointers; click / Enter / Space pins a panel open (keyboard + touch).
  const revealDetail = (id: string) => (hoverPointer && hoverId === id) || tappedId === id

  return (
    <section
      id="drivers"
      className="landing-snap-section landing-ambient landing-ambient--br flex items-center justify-center"
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
      <div className="relative z-10 mx-auto box-border w-full max-w-[1280px] px-5 pt-12">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="max-w-xl text-left md:max-w-[min(34rem,50vw)]"
        >
          <motion.p variants={fadeInUp} className="landing-eyebrow mb-4">
            Drivers
          </motion.p>
          <motion.h2 variants={fadeInUp} className="landing-h2 mb-4">
            Give drivers a platform they can trust.
          </motion.h2>
          <motion.p variants={fadeInUp} className="landing-lead mb-7">
            Tools that help drivers stay informed, organized, and ready for every trip. Everything in one place, so they
            spend less time checking texts and more time focused on the road.
          </motion.p>

          <motion.div variants={staggerChildren} className="flex flex-col gap-3">
            {leadPoints.map((item) => {
              const open = revealDetail(item.id)
              return (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  className="border-l-2 pl-5 transition-colors duration-300"
                  style={{
                    borderColor: open ? 'var(--landing-accent-soft)' : 'var(--landing-hairline-strong)',
                  }}
                >
                  <button
                    type="button"
                    className="w-full rounded-r-xl py-1 text-left transition-colors duration-300 hover:bg-white/[0.03]"
                    aria-expanded={open}
                    onMouseEnter={() => hoverPointer && setHoverId(item.id)}
                    onMouseLeave={() => hoverPointer && setHoverId(null)}
                    onClick={() => setTappedId((prev) => (prev === item.id ? null : item.id))}
                  >
                    <span className="block text-[17px] font-medium leading-snug tracking-[-0.02em] text-white md:text-[18px]">
                      {item.title}
                    </span>
                    {!hoverPointer ? (
                      <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--landing-fg-faint)]">
                        Tap for details
                      </span>
                    ) : null}
                    <div
                      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="m-0 pt-2 text-[14px] leading-relaxed text-[color:var(--landing-fg-muted)] md:text-[15px]">
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
            className="mt-8 border-t border-[color:var(--landing-hairline)] pt-6"
          >
            <p className="mb-2 text-[14px] leading-relaxed text-[color:var(--landing-fg-muted)] md:text-[15px]">
              Built to support smoother operations today, with deeper payout workflows as we scale. Payouts are handled
              by the tenant for now. We provide the data foundation; automation is on the roadmap.
            </p>
            <p className="m-0 text-[12px] leading-relaxed text-[color:var(--landing-fg-faint)] md:text-[13px]">
              Payout workflows vary by tenant setup.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Slide 5: Rider Experience / White-Label
function RiderBookingSlide() {
  const actionItems = [
    'Single branded link for all services.',
    'Choose vehicle class and add VIP notes.',
    'Flexible checkout: riders pay securely; saved cards speed up repeat bookings.',
    'Your brand on every confirmation.',
  ]

  const brandedLinkPills = [
    {
      path: '/driver',
      top: '6%',
      left: '4%',
      rotate: -2.5,
      yAmp: 6,
      duration: 5.2,
      delay: 0,
    },
    {
      path: '/riders',
      top: '42%',
      left: '-2%',
      rotate: 1.8,
      yAmp: 7,
      duration: 4.6,
      delay: 0.45,
    },
    {
      path: '/landing',
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
      className="landing-snap-section landing-ambient landing-ambient--c flex items-center justify-center"
    >
      <div className="relative mx-auto box-border flex w-full max-w-[1280px] flex-col items-stretch gap-10 px-5 pt-12 md:flex-row md:items-center md:gap-12 lg:gap-16">
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
              key={pill.path}
              className="landing-chip absolute max-w-[calc(100vw-2.5rem)] !text-[12px] md:max-w-[19rem] md:!text-[13px]"
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
              <span className="block truncate">
                <span className="text-white/55">limo.usemaison.io</span>
                <span className="landing-accent-text">{pill.path}</span>
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
          <motion.p variants={fadeInUp} className="landing-eyebrow mb-4">
            Rider experience
          </motion.p>
          <motion.h2 variants={fadeInUp} className="landing-h2 mb-4">
            Your brand at every touchpoint.
          </motion.h2>
          <motion.p variants={fadeInUp} className="landing-lead mb-7">
            Riders see your name, your logo, your standards.
          </motion.p>
          <motion.ul variants={staggerChildren} className="m-0 list-none space-y-3.5 p-0">
            {actionItems.map((item) => (
              <motion.li
                key={item}
                variants={fadeInUp}
                className="flex items-start gap-3.5 text-[15px] leading-normal text-[color:var(--landing-fg-muted)] md:text-[17px]"
              >
                <span className="landing-icon-well mt-0.5 !h-6 !w-6 shrink-0 !rounded-lg" aria-hidden>
                  <Check size={13} weight="bold" />
                </span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

/** Scroll horizontal carousel only — never use scrollIntoView on cards or the page snap container will jump. */
function scrollPricingCarouselToCard(
  carousel: HTMLElement,
  card: HTMLElement,
  behavior: ScrollBehavior
) {
  const cr = carousel.getBoundingClientRect()
  const rr = card.getBoundingClientRect()
  const next =
    carousel.scrollLeft + (rr.left - cr.left) - (cr.width / 2 - rr.width / 2)
  carousel.scrollTo({ left: Math.max(0, next), behavior })
}

// Slide 7: Pricing
function PricingSlide() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const featuredIndex = LANDING_PRICING_PLANS.findIndex(isPopularPlan)
  const [activeIndex, setActiveIndex] = useState(featuredIndex >= 0 ? featuredIndex : 0)
  const [catalog, setCatalog] = useState<PlanCatalogEntry[] | null>(null)
  const [foundingSlotsLeft, setFoundingSlotsLeft] = useState<number | null>(null)

  // The public catalogue endpoint needs no auth, which is the whole point: this
  // marketing page renders the same prices, limits and take rate that the
  // signed-in app does. On failure the static fallback stands in rather than
  // leaving the pricing section blank.
  useEffect(() => {
    let cancelled = false
    getPublicPlans()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data?.length) setCatalog(res.data)
        setFoundingSlotsLeft(foundingOperatorSlotsRemaining(res))
      })
      .catch(() => {
        /* keep the static fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const plans = useMemo(
    () => (catalog ? buildPlanDisplays(catalog) : LANDING_PRICING_PLANS),
    [catalog]
  )

  useEffect(() => {
    const root = carouselRef.current
    if (!root) return

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!window.matchMedia('(max-width: 767px)').matches) return
        const card = root.querySelector<HTMLElement>('.pricing-card.featured')
        if (card) scrollPricingCarouselToCard(root, card, 'auto')
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
    if (root && el) scrollPricingCarouselToCard(root, el, 'smooth')
  }

  return (
    <section
      id="pricing"
      className="landing-pricing landing-snap-section landing-snap-section--scroll landing-ambient landing-ambient--tl flex items-center justify-center"
    >
      <div className="mx-auto box-border w-full max-w-7xl px-5 pb-20 pt-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          className="mb-8 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-12"
        >
          <div>
            <motion.p variants={fadeInUp} className="landing-eyebrow mb-4">
              Pricing
            </motion.p>
            <motion.h2 variants={fadeInUp} className="landing-h2">
              Fair, transparent pricing.
            </motion.h2>
          </div>
          <div className="md:max-w-md">
            <motion.p variants={fadeInUp} className="landing-lead">
              Priced for operators at every stage. Start free, upgrade when your bookings need the headroom. No
              long-term contracts.
            </motion.p>
            {foundingSlotsLeft !== null && foundingSlotsLeft > 0 ? (
              <>
                <motion.p variants={fadeInUp} className="landing-accent-text mb-1 mt-4 text-sm font-medium">
                  Only a few founding operator spots left. Sign up now and your subscription is free.
                </motion.p>
                <motion.p variants={fadeInUp} className="m-0 text-xs text-[color:var(--landing-fg-faint)]">
                  Applies to the plan you choose today. Upgrading later bills full price for the new plan.
                </motion.p>
              </>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div ref={carouselRef} className="pricing-carousel -mx-5 md:mx-0">
            {plans.map((plan, index) => {
              const popular = isPopularPlan(plan)
              return (
                <div
                  key={plan.name}
                  data-index={index}
                  className={`pricing-card landing-bezel${popular ? ' featured landing-bezel--accent' : ''}`}
                >
                  <div className="landing-bezel__core relative flex flex-col !p-6 md:!p-7">
                    {popular ? <div className="pricing-badge absolute right-5 top-5 !mb-0">Most popular</div> : null}
                    <h3 className="m-0 text-xl font-medium tracking-[-0.02em] text-white">{plan.name}</h3>
                    <div className="price-wrapper">
                      <span className="price-amount text-white">{plan.price}</span>
                      <span className="price-period">{plan.period}</span>
                    </div>
                    <p className="m-0 mb-6 min-h-[3.75rem] text-sm leading-relaxed text-[color:var(--landing-fg-muted)]">
                      {plan.description}
                    </p>
                    <ul className="m-0 flex-1 list-none space-y-3 border-t border-[color:var(--landing-hairline)] p-0 pt-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check size={16} weight="bold" className="landing-accent-text mt-0.5 shrink-0" aria-hidden />
                          ) : (
                            <X
                              size={16}
                              weight="regular"
                              className="mt-0.5 shrink-0 text-[color:var(--landing-fg-faint)]"
                              aria-hidden
                            />
                          )}
                          <span
                            className={`text-sm leading-snug ${
                              feature.included
                                ? 'text-[color:var(--landing-fg)]'
                                : 'text-[color:var(--landing-fg-faint)]'
                            }`}
                          >
                            {feature.included ? null : <span className="sr-only">Not included: </span>}
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/signup"
                      className={`landing-btn landing-btn--block mt-8 ${
                        popular ? 'landing-btn--primary landing-btn--icon !justify-between' : 'landing-btn--ghost'
                      }`}
                    >
                      Get started
                      {popular ? (
                        <span className="landing-btn__icon">
                          <ArrowUpRight size={16} weight="bold" aria-hidden />
                        </span>
                      ) : null}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="dots" role="tablist" aria-label="Pricing plans">
            {plans.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`${plans[i].name} plan`}
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

// Slide 6: Mission & Values
function MissionValuesSlide() {
  const coreValues = [
    {
      title: 'Your brand, your subdomain',
      signal: "Every account gets a dedicated space at tito.usemaison.io. Your drivers and riders never see anyone else's name.",
    },
    {
      title: 'Brand autonomy',
      signal: 'Upload your logo and set your company name across every rider and driver touchpoint from day one.',
    },
    {
      title: 'Operations that run themselves',
      signal:
        'Live driver and vehicle tracking on your dashboard. Automatic emails keep drivers and riders informed at every step. Assign a driver, they get notified.',
    },
    {
      title: 'Honest MVP momentum',
      signal:
        "We're not pretending to be a decade-old suite. Maison ships continuously, and early operators get direct input on the roadmap.",
    },
  ]

  return (
    <section
      id="mission"
      className="landing-snap-section landing-ambient landing-ambient--tr flex items-center justify-center"
    >
      <div className="mx-auto box-border w-full max-w-[1280px] px-5 pt-14">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerChildren}
            className="text-left md:col-span-5"
          >
            <motion.p variants={fadeInUp} className="landing-eyebrow mb-4">
              Mission
            </motion.p>
            <motion.h2 variants={fadeInUp} className="landing-h2 mb-5 md:mb-7">
              The infrastructure of independence.
            </motion.h2>
            <motion.p variants={fadeInUp} className="landing-lead mb-4 !text-[color:var(--landing-fg)] md:mb-5">
              Independent limo and black car operators shouldn&apos;t have to surrender their brand, their customer
              relationships, or their pricing control to platforms that extract value without adding it.
            </motion.p>
            <motion.p variants={fadeInUp} className="landing-lead">
              Maison gives you the infrastructure to run your business on your terms: your branding, your pricing, your
              standards. Free to start. Transparent as you scale. Built weekly with real operator feedback.
            </motion.p>
          </motion.div>

          {/* Desktop only, keeps mobile to one viewport */}
          <motion.ol
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerChildren}
            className="m-0 hidden list-none p-0 md:col-span-7 md:block"
          >
            {coreValues.map((value, index) => (
              <motion.li
                key={value.title}
                variants={fadeInUp}
                className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-[color:var(--landing-hairline)] py-5 last:border-b"
              >
                <span className="landing-mono landing-accent-text pt-1 text-[13px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="m-0 mb-1.5 text-[1.25rem] font-medium tracking-[-0.02em] text-white">{value.title}</h3>
                  <p className="m-0 max-w-[34rem] text-[0.9375rem] leading-relaxed text-[color:var(--landing-fg-muted)]">
                    {value.signal}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  )
}

// Slide 8: Conclusion & Footer
function ConclusionSlide() {
  const linkClass = 'landing-link text-[13px]'

  return (
    <section
      id="footer"
      className="landing-snap-section landing-snap-section--scroll landing-ambient landing-ambient--c flex flex-col"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center py-10 pt-20 md:py-14 md:pt-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="mx-auto w-full max-w-[min(100%,56rem)] box-border px-5 text-center"
        >
          <motion.h2 variants={fadeInUp} className="landing-h2 mx-auto mb-6 max-w-[18ch] md:mb-8">
            Built for operators who don&apos;t compromise.
          </motion.h2>
          <motion.figure variants={fadeInUp} className="landing-bezel mx-auto mb-6 max-w-2xl text-left md:mb-8">
            <div className="landing-bezel__core !p-5 md:!p-6">
              <blockquote className="m-0 text-[15px] font-medium leading-snug tracking-[-0.01em] text-white sm:text-base md:text-lg">
                &ldquo;Professional chauffeurs and independent operators deserve the same tools as any serious
                business, without the tax.&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-[13px] text-[color:var(--landing-fg-faint)]">
                Mubaraq Odumeso, Founder{' · '}
                <Link to="/about" className="landing-accent-text underline-offset-4 hover:underline">
                  Read the vision
                </Link>
              </figcaption>
            </div>
          </motion.figure>
          <motion.p variants={fadeInUp} className="landing-lead mx-auto mb-7 md:mb-9">
            Your brand. Your riders. Your drivers. All in one place, without giving up control. Join while we&apos;re
            still early: your feedback shapes the product.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link to="/signup" className="landing-btn landing-btn--primary landing-btn--icon">
              Start free today
              <span className="landing-btn__icon">
                <ArrowUpRight size={16} weight="bold" aria-hidden />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.footer
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
        className="shrink-0 border-t border-[color:var(--landing-hairline)]"
      >
        <div className="box-border w-full px-5 pb-6 pt-8 md:px-[60px] md:pb-8 md:pt-12">
          <div className="mb-6 md:mb-8 md:grid md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:items-start md:gap-x-12">
            <div className="mb-6 hidden md:mb-0 md:block">
              <MaisonDarkModeLogo
                forceDark
                className="block"
                style={{
                  height: 'clamp(1.5rem, 4vw, 2rem)',
                  width: 'auto',
                }}
              />
              <p className="mt-3.5 max-w-xs text-[14px] leading-[1.55] tracking-[-0.01em] text-[color:var(--landing-fg-muted)]">
                Built for operators who run their business like a brand.
              </p>
              <span className="landing-chip mt-4 !py-1 !text-[11px]">slug.usemaison.io</span>
            </div>

            <div className="grid grid-cols-3 gap-x-5 text-left sm:gap-x-8 md:contents">
              <nav className="min-w-0" aria-label="Product">
                <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-fg-faint)] md:text-[11px]">
                  Product
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0 md:space-y-2">
                  <li>
                    <a
                      href="#platform"
                      onClick={(e) => {
                        e.preventDefault()
                        smoothScrollToSection('platform')
                      }}
                      className={linkClass}
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
                      className={linkClass}
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <Link to="/signup" className={linkClass}>
                      Get started
                    </Link>
                  </li>
                </ul>
              </nav>

              <nav className="min-w-0" aria-label="Company">
                <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-fg-faint)] md:text-[11px]">
                  Company
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0 md:space-y-2">
                  <li>
                    <a href="/about" target="_blank" rel="noopener noreferrer" className={linkClass}>
                      About
                    </a>
                  </li>
                  <li>
                    <a href="/about#founders-vision" target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Founder&apos;s vision
                    </a>
                  </li>
                  <li>
                    <a href="mailto:hello@usemaison.io" className={linkClass}>
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href={QUESTIONS_FORM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      Questions
                    </a>
                  </li>
                </ul>
              </nav>

              <nav className="min-w-0" aria-label="Legal">
                <h3 className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[color:var(--landing-fg-faint)] md:text-[11px]">
                  Legal
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0 md:space-y-2">
                  <li>
                    <Link to="/privacy" className={linkClass}>
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className={linkClass}>
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link to="/subprocessors" className={linkClass}>
                      Subprocessors
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <div className="border-t border-[color:var(--landing-hairline)] pt-4">
            <p className="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[color:var(--landing-fg-faint)] md:hidden">
              <span>© 2026</span>
              <MaisonWordmark
                color="var(--landing-fg-faint)"
                className="shrink-0"
                style={{ fontSize: 12, display: 'inline-block', verticalAlign: 'baseline' }}
              />
              <span>. All rights reserved.</span>
            </p>
            <p className="m-0 hidden text-xs text-[color:var(--landing-fg-faint)] md:block">
              © 2026 Maison. All rights reserved.
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
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollToTop = useCallback(() => {
    scrollRootRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToSnapIndex = useCallback((index: number) => {
    const root = scrollRootRef.current
    if (!root) return
    const sections = root.querySelectorAll<HTMLElement>('.landing-snap-section')
    const section = sections[index]
    if (!section) return
    const top =
      section.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop
    root.scrollTo({ top, behavior: 'smooth' })
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
      const index = [...sections].indexOf(best.target as HTMLElement)
      if (index < 0) return
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

  // Which top-nav link owns the section currently in view.
  const activeNavKey =
    activeSection >= 1 && activeSection <= 4
      ? 'platform'
      : activeSection === MISSION_SECTION_INDEX
        ? 'mission'
        : activeSection === PRICING_SECTION_INDEX
          ? 'pricing'
          : activeSection === FOOTER_SECTION_INDEX
            ? 'footer'
            : null

  const navLinks = [
    { id: 'platform', label: 'Product' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'mission', label: 'About' },
    { id: 'footer', label: 'Company' },
  ] as const

  return (
    <MotionConfig reducedMotion="user">
      <main className="landing-root relative overflow-x-hidden">
        <div ref={scrollRootRef} className="landing-snap-page scroll-smooth">
          <HeroSlide />
          <PlatformSlide />
          <HowItWorksSlide />
          <DriverExperienceSlide />
          <RiderBookingSlide />
          <MissionValuesSlide />
          <PricingSlide />
          <ConclusionSlide />
        </div>

        <div className="landing-snap-brand-row">
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
            <List className="h-7 w-7" weight="light" aria-hidden />
          </button>
          <button
            type="button"
            className="landing-snap-logo"
            aria-label="Maison, back to top"
            tabIndex={hideFloatingChromeOnPricing ? -1 : undefined}
            onClick={scrollToTop}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'clamp(0.75rem, 2.2vw, 1rem)',
              opacity: hideFloatingChromeOnPricing ? 0 : 1,
              pointerEvents: hideFloatingChromeOnPricing ? 'none' : 'auto',
            }}
          >
            <MaisonDarkModeLogo
              forceDark
              style={{
                height: 'clamp(1.625rem, 4vw, 2.125rem)',
                width: 'auto',
              }}
            />
            <MaisonWordmark
              color={null}
              style={{
                fontSize: 'clamp(1.2rem, 2.8vw, 1.5rem)',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}
            />
          </button>
        </div>

        <div
          className="landing-snap-actions"
          style={{
            opacity: ctaHidden ? 0 : 1,
            pointerEvents: ctaHidden ? 'none' : 'auto',
          }}
        >
          <a href={getTenantAppUrl('app', '/tenant/login')} className="landing-snap-login-cta" aria-label="Log in">
            <SignIn className="h-4 w-4" weight="regular" aria-hidden />
          </a>
          {activeSection !== 0 ? (
            <Link to="/signup" className="landing-btn landing-btn--primary landing-snap-cta">
              Get started
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
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={activeNavKey === link.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                scrollToSectionById(link.id)
              }}
            >
              {link.label}
            </a>
          ))}
          <a href={QUESTIONS_FORM_URL} target="_blank" rel="noopener noreferrer">
            Questions
          </a>
        </nav>

        <nav className="landing-snap-dot-nav" aria-label="Section navigation">
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
                autoFocus
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-8 w-8" weight="light" aria-hidden />
              </button>
            </div>
            <nav className="landing-snap-menu-overlay__nav" aria-label="Secondary">
              <a
                href={getTenantAppUrl('app', '/tenant/login')}
                style={{ '--i': 0 } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </a>
              {navLinks.map((link, i) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  style={{ '--i': i + 1 } as CSSProperties}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSectionById(link.id)
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href={QUESTIONS_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ '--i': navLinks.length + 1 } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                Questions
              </a>
              <div className="landing-snap-menu-overlay__divider" aria-hidden />
              <Link
                to="/signup"
                style={{ '--i': navLinks.length + 2 } as CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </nav>
          </div>
        ) : null}
      </main>
    </MotionConfig>
  )
}
