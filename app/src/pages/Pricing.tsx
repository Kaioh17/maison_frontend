import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import MaisonWordmark from '@components/MaisonWordmark'
import { PricingCard, usePricingPlans } from '@components/PricingCards'
import './landing-theme.css'
import './landing-pricing.css'

export default function Pricing() {
  const { plans, foundingSlotsLeft, ready } = usePricingPlans()

  return (
    <main className="landing-root landing-pricing landing-ambient landing-ambient--tl min-h-[var(--app-h)] overflow-x-hidden">
      <div className="mx-auto box-border w-full max-w-7xl px-5 pb-16 pt-6 md:pt-10">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link to="/" className="landing-btn landing-btn--ghost" aria-label="Back to home">
            <ArrowLeft size={16} weight="bold" aria-hidden />
            Home
          </Link>
          <MaisonWordmark />
        </div>

        <p className="landing-eyebrow mb-4">Pricing</p>
        <h1 className="landing-h2 mb-4">Fair, transparent pricing.</h1>
        <p className="landing-lead">
          Priced for operators at every stage. Start free, upgrade when your bookings need the headroom. No long-term
          contracts.
        </p>
        {/* Everything under the lead waits on the live catalogue, so nothing visible moves when it lands. */}
        {ready && (
          <>
            <p className="landing-accent-text mb-1 mt-4 text-sm font-medium">
              {foundingSlotsLeft !== null && foundingSlotsLeft > 0 ? 'Only a few founding operator spots left. ' : ''}
              Founding operators receive a promo code by email after signup for a free subscription.
            </p>
            <p className="m-0 text-xs text-[color:var(--landing-fg-faint)]">
              Applies to the plan you choose today. Upgrading later bills full price for the new plan.
            </p>

            <div className="pricing-stack mt-8">
              {plans.map((plan, index) => (
                <PricingCard key={plan.name} plan={plan} index={index} Heading="h2" />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
