import { motion } from 'framer-motion'
import { fadeInUp, staggerChildren } from './shared'

// Slide 3: How It Works
export default function HowItWorksSlide() {
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
