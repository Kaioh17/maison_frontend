import { PricingCard, usePricingPlans } from '@components/PricingCards'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { EASE, fadeInUp, staggerChildren } from './shared'

// Slide 7: Pricing. Desktop shows the plan grid; mobile gets a short teaser that
// links to the dedicated vertical /pricing page.
export default function PricingSlide() {
  const { plans, foundingSlotsLeft } = usePricingPlans()

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
            <motion.div variants={fadeInUp} className="mt-6 md:hidden">
              <Link to="/pricing" className="landing-btn landing-btn--primary landing-btn--block">
                See pricing
              </Link>
            </motion.div>
            <motion.p variants={fadeInUp} className="landing-accent-text mb-1 mt-4 hidden text-sm font-medium md:block">
              {foundingSlotsLeft !== null && foundingSlotsLeft > 0 ? 'Only a few founding operator spots left. ' : ''}
              Founding operators receive a promo code by email after signup for a free subscription.
            </motion.p>
            <motion.p variants={fadeInUp} className="m-0 hidden text-xs text-[color:var(--landing-fg-faint)] md:block">
              Applies to the plan you choose today. Upgrading later bills full price for the new plan.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="pricing-carousel">
            {plans.map((plan, index) => (
              <PricingCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
