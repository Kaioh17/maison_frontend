import { CreditCard, Link as LinkIcon, RocketLaunch, SlidersHorizontal, TrendUp } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerChildren } from './shared'

// Slide 2: Scalability & Onboarding
export default function PlatformSlide() {
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
