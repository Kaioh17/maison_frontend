# Pricing rationale

**Status:** decided, unvalidated — no customer has paid anything yet.
**Date:** 2026-07-18
**Supersedes:** the four-tier ladder and struck-through promo pricing.

This is the decision record for what Maison charges and why. It exists because
the repo had ~30 markdown files and not one of them explained the pricing; the
numbers lived in `domain/plans.py` and in two hardcoded React arrays, and the
reasoning lived nowhere. When a number here disagrees with the code, the code is
authoritative and this document is stale — fix it.

---

## 1. The ladder

Three tiers. Free, Growth, Fleet.

| Tier | Price | Vehicles | Drivers | Take rate | Analytics | Property support |
|---|---|---|---|---|---|---|
| Free | $0 | 1 | 1 | 3% | no | no |
| Growth | $299.99/mo | 5 | 7 | 2% | yes | no |
| Fleet | $399.99/mo | unlimited | unlimited | 1% | yes | yes |

Canonical in `backend/backend/app/domain/plans.py` (`PLAN_LADDER`). Served to
clients by `GET /api/v1/subscription/limits`.

### Why three, and why `starter` is gone

There used to be four tiers, and `free` and `starter` were byte-for-byte
identical: 1 vehicle, 1 driver, no analytics, 2% fee — with `starter` displayed
at `$0.00`. Two indistinguishable tiers on a pricing page do not read as
generous. They read as unfinished, and it was the first thing a prospect saw.

`starter` was deleted rather than differentiated. Three is where SaaS pricing
pages converge, and the alternative — giving starter a reason to exist at ~$49 —
would have added a rung without adding a reason for anyone to climb it.

Migration `b7f2c14a9d30` rewrites any stored `subscription_plan = 'starter'` to
`'free'`. The two tiers had identical quotas, so no operator lost capacity. What
changed for them is the take rate: 2% → 3%. See §2.

### Why these prices

The market band, from the competitor pricing in `.claude/skills/maison-ceo/references/monetization.md`:

- **Moovs** — from ~$299/mo, all-in, scales with fleet.
- **Limo Anywhere** — ~$99/mo (1 user) to ~$499/mo (10 users), flat base *plus*
  per-active-driver and per-vehicle module billing.

$299.99 / $399.99 sits correctly in-band. More importantly, the loudest
complaint in this category is not high prices — it is *unpredictable* prices.
Limo Anywhere's own competitor attacks it on exactly one axis: costs buried in
add-ons for payments, SMS, and websites. An operator with 8 vehicles cannot
forecast their invoice.

That is the positioning wedge: **one number you can forecast.** Vehicle and
driver caps are the tier boundaries precisely because they track operator size
and are stable month to month. Ride-count metering is deliberately *not* used —
`TenantStats.daily_ride_count` exists and is unmetered on purpose. Capping rides
would punish the exact behavior Maison wants (more volume through the platform)
and would forfeit the forecastability wedge in the process.

---

## 2. The declining take rate

**3% free → 2% growth → 1% fleet.** Applied as Stripe `application_fee_amount`
on the rider PaymentIntent in `stripe_services/checkout.py`.

Before this, `Plan.maison_fee` was `0.02` on all four tiers. A per-plan pricing
lever was modeled and unused.

The rate declines as the subscription rises, and that inversion is the whole
point. It does three things at once:

- **It makes every upgrade legible in the operator's own revenue.** "Growth pays
  for itself at $30k/mo of card volume" is an arithmetic claim an operator can
  check. "Growth has better analytics" is a claim they have to take on faith.
- **It aligns Maison with GMV growth** rather than against it. A big operator on
  a flat 3% eventually resents the platform; a big operator on 1% has a reason
  to route *more* volume through it.
- **It makes free a genuine acquisition channel instead of pure cost.** Free at
  3% means Maison earns on operators who never subscribe. A free-tier-plus-3%
  offer is the lowest-friction ask available to a product with no brand — no
  committed spend, and Maison only earns when the operator does.

The strategy this encodes: **acquire on take rate, migrate to subscription as
operators grow.** The take rate is the better acquisition tool; the subscription
is the better business.

### The cost of this decision, stated honestly

Fee changes touch live payment code, and any change to what operators pay per
ride is a trust event. Raising free from 2% to 3% is a real increase for the
five tenants currently on it — none of whom are paying customers yet, which is
the only reason it is safe to do now. **This gets materially harder after the
first paying operator signs.** That timing is why it happens today.

### What was rejected

Leaving the take rate flat at 2% and competing purely on "a single predictable
number, no fee engineering." Defensible — but it leaves the only modeled pricing
lever unused, and it gives the Fleet tier no argument beyond unlimited seats.
Rejected, not overlooked.

---

## 3. Private discounts for design partners

**Publish $299.99 / $399.99. Discount privately, never publicly.**

Design partners get up to **50% off for twelve months**, agreed in a direct
conversation, reverting to list at renewal.

The strikethrough promo pricing ($299.99 → $99.99, $399.99 → $299.99) has been
removed from the public pages for two reasons:

- **A published price is close to irreversible.** $99.99 on the pricing page
  becomes the permanent reference price. Walking a price *up* later reads as a
  betrayal to early customers and forces an awkward grandfather policy forever.
  Walking a private discount back is free — it expires quietly and gratefully.
- **Struck-through prices on a pre-launch product with zero customers signal
  desperation, not value.** There is no "before" for the discount to be measured
  against.

### Charge from the first customer

No free pilots. Free pilots produce polite feedback and no signal. A design
partner paying $149 tells you more about willingness to pay than fifty free
accounts. The goal of the first ten operators is not revenue — it is finding out
whether the price is real.

Sell annual prepay at ~2 months free where possible. It solves cash flow for a
solo founder and filters for operators who have actually committed.

### Mechanics

Discounts are Stripe coupons on the subscription, not new plan tiers and not
new price IDs. Adding a discounted tier to `PLAN_REGISTRY` would put a private
commercial term into the public API response — `GET /subscription/limits`
returns the whole catalog to any authenticated tenant.

---

## 4. Open question: Zelle and cash leak the take rate

**This is unresolved. It is the largest known hole in the revenue model.**

`booking_services.py` routes to Stripe only when `payment_method == 'card'`.
A Zelle booking hands the rider the operator's own Zelle handle from
`TenantSettings` and commits. A cash booking does neither. Neither path ever
creates a PaymentIntent, so neither ever accrues an `application_fee_amount`.

**Every Zelle and cash ride is a ride Maison earns nothing on.** The declining
take rate in §2 applies to card volume only, and any revenue forecast built on
it must be discounted by an unknown factor.

This is not simply a hole to plug. Operators in this segment are genuinely
card-fee-sensitive, and Zelle support may be part of why they would pick Maison
at all.

### Current posture: accept it deliberately, for now

Free at 3% still earns on the card volume that does flow, and subscription
revenue is unaffected. Closing the hole before knowing its size risks trading
away the operators most likely to sign early.

### The three postures, for when this is decided

1. **Accept it** as a concession that wins price-sensitive operators, and lean
   harder on subscription revenue.
2. **Price it in** — Zelle available only on paid tiers, or a higher
   subscription price where it is enabled.
3. **Close it** — require Stripe for platform-booked rides. Cleanest revenue,
   highest churn risk with exactly the wrong operators.

### What unblocks the decision

**One number: what fraction of this segment's GMV runs through Zelle and cash?**
It cannot be answered from the codebase and should not be guessed. Ask every one
of the first ten design partners, explicitly:

> Of your last 20 rides, how many were paid by card, and how many by Zelle,
> cash, or invoice?

If the answer is consistently under ~20%, posture 1 holds and this stops being
a problem. If it is over half, the take rate is not a real revenue stream for
this segment and the pricing model should move to subscription-only — which
would also mean revisiting §2 entirely.

---

## Revisit triggers

| Reopen this document when | Section |
|---|---|
| The tenth tenant signs | all — the prices become validated or refuted |
| Two consecutive design partners refuse the take rate | §2 |
| Any design partner reports >50% of GMV on Zelle/cash | §4, then §2 |
| A prospect asks for a tier between Free and Growth | §1 — the deleted `starter` rung |
| Before publishing any price change | §3 — published prices are near-irreversible |

## Where the numbers live

| Thing | Source of truth |
|---|---|
| Limits, take rate, tier order | `backend/backend/app/domain/plans.py` (`PLAN_LADDER`) |
| Served to clients | `GET /api/v1/subscription/limits` → `catalog[]` |
| Fee charged at checkout | `stripe_services/checkout.py`, via `resolve_plan(...).maison_fee` |
| Dollar prices | Stripe, via `VITE_STRIPE_PRICE_GROWTH` / `_FLEET` |
| Display copy | `app/src/data/landingPricingPlans.tsx` (presentation only) |

Limits and take rate are **not** duplicated in the frontend any more.
`Plans.tsx` and `SignupPlanSelection.tsx` render them from the API response, so
a tier change is a one-file backend edit rather than a two-repo change. That was
a precondition for this document: pricing that costs a coordinated deploy to
change is pricing that never gets experimented with.
