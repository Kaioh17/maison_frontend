import { motion } from 'framer-motion'
import { useState } from 'react'
import { fadeInUp, staggerChildren, useFinePointerHover } from './shared'

// Slide 4: Driver Experience
export default function DriverExperienceSlide() {
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
