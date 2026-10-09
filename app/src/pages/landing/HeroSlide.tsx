import { getTenantAppUrl } from '@config/host'
import { ArrowUpRight, Check, CreditCard, Link as LinkIcon, SlidersHorizontal } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { EASE, HeroIPhoneMockup, HeroParticleField, fadeInUp, staggerChildren } from './shared'

// Slide 1: Hero
export default function HeroSlide() {
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
          <motion.p
            variants={fadeInUp}
            className="m-0 mt-3 max-w-[28rem] text-[12px] text-[color:var(--landing-fg-faint)] md:text-[13px]"
          >
            This site is a test run. We&apos;re onboarding early operators and want your feedback.
          </motion.p>
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
