import type { ReactNode } from 'react'
import type { SubscriptionPlanKey } from '@config'

export type LandingPricingPlanDisplay = {
  name: string
  product_type: SubscriptionPlanKey
  price: ReactNode
  period: string
  description: string
  popular?: boolean
  features: { text: string; included: boolean }[]
}

export const LANDING_PRICING_PLANS: LandingPricingPlanDisplay[] = [
  {
    name: 'Starter',
    product_type: 'starter',
    price: '$0.00',
    period: '/month',
    description:
      'Perfect for solo drivers and small fleets. We charge a percentage on payments made on app higher than $50.',
    features: [
      { text: 'Up to 1 vehicle', included: true },
      { text: 'Up to 1 driver', included: true },
      { text: 'Basic booking system', included: true },
      { text: 'Email support', included: true },
    ],
  },
  {
    name: 'Growth',
    product_type: 'growth',
    price: (
      <>
        <span className="old">
          299.<span className="cent">99</span>
        </span>
        <span className="new">
          99.<span className="cent">99</span>
        </span>
      </>
    ),
    period: '/month',
    description: 'Ideal for growing businesses',
    popular: true,
    features: [
      { text: 'Up to 5 vehicles', included: true },
      { text: 'Up to 7 drivers', included: true },
      { text: 'Advanced booking system', included: true },
      { text: 'Email & phone support', included: true },
    ],
  },
  {
    name: 'Fleet',
    product_type: 'fleet',
    price: (
      <>
        <span className="old">
          399.<span className="cent">99</span>
        </span>
        <span className="new">
          299.<span className="cent">99</span>
        </span>
      </>
    ),
    period: '/month',
    description: 'For large fleets and enterprises',
    features: [
      { text: 'Unlimited vehicles', included: true },
      { text: 'Unlimited drivers', included: true },
      { text: 'Enterprise booking system', included: true },
      { text: '24/7 dedicated support', included: true },
    ],
  },
]

export function isPopularPlan(
  plan: LandingPricingPlanDisplay
): plan is LandingPricingPlanDisplay & { popular: true } {
  return 'popular' in plan && plan.popular === true
}
