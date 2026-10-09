import { motion } from 'framer-motion'
import { fadeInUp, staggerChildren } from './shared'

// Slide 6: Mission & Values
export default function MissionValuesSlide() {
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
