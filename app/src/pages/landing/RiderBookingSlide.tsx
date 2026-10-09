import { Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerChildren } from './shared'

// Slide 5: Rider Experience / White-Label
export default function RiderBookingSlide() {
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
              className="landing-chip absolute max-w-full !text-[12px] md:max-w-[19rem] md:!text-[13px]"
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
