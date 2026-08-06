# Legal review — scoping brief

**Prepared:** 2026-07-18
**For:** outside counsel with SaaS experience (US, ground transportation adjacent)
**Purpose:** scope a pre-launch review. This is a brief describing what exists and what we
believe needs attention — **it is not draft language and proposes none.**

Maison is pre-launch: zero paying customers, no signed contracts. Nothing here has been
reviewed by a lawyer. The self-serve Terms and Privacy Policy currently live at `/terms` and
`/privacy` were written in-house and are live in the product today, which is the reason this
review is time-sensitive rather than theoretical.

---

## 1. What Maison is, in one paragraph

A multi-tenant B2B2C SaaS platform for luxury ground transportation operators. One deployment
serves many independent operators ("tenants"), each on their own subdomain with their own
branding, fleet, drivers, and riders. **Maison is software; the operator is the carrier.**
Maison does not own vehicles, employ drivers, or provide transportation. Riders interact with
the operator's brand on the operator's subdomain and generally never see Maison's name.

Three user roles exist, and the distinction matters for almost every question below:
**operators** (who subscribe and pay), **drivers** (onboarded by an operator), and **riders**
(who book through an operator's branded site).

Revenue is two streams: operator subscriptions ($0 / $299.99 / $399.99 per month) and a
percentage take rate on rider card payments (3% / 2% / 1%, declining as the tier rises),
collected as a Stripe `application_fee_amount`.

---

## 2. What the existing documents already cover

### Terms of Service (`app/src/pages/Terms.tsx`, 16 sections)

| Section | Covers |
|---|---|
| Acceptance | Binding on entity, authority to bind, continued-use acceptance |
| Description of Service | Three roles; explicit "Maison is not a transportation provider, carrier, or employer of drivers" |
| Account Responsibilities | Credential security, accuracy, no sharing; operator responsibility for drivers/riders |
| Use of the Service | Lawful-use restrictions; operators must hold licenses, permits, insurance |
| Payments and Billing | Recurring subscription authorization, Stripe and Stripe Connect flow-down, taxes, 30-day price-change notice |
| Intellectual Property | Ownership, limited license, customer content license |
| Privacy | Processor/controller split, security, retention |
| Prohibited Conduct | Including anti-discrimination and no-permit-operation clauses |
| Termination | By user, by Maison, effect and survival |
| Disclaimers | AS IS; explicit no-carrier disclaimer in caps |
| Limitation of Liability | Consequential-damages exclusion; cap at greater of 12 months' fees or $100 |
| Indemnification | Five triggers, including transportation services provided by operator/drivers |
| Governing Law | Delaware; informal resolution; AAA arbitration; class-action waiver; small-claims carve-out |
| Changes to Terms | Notice mechanism |
| Contact | Email and mailing address |

### Privacy Policy (`app/src/pages/Privacy.tsx`, 13 sections)

Controller/processor split by role; collection inventory by role; use purposes; GDPR legal
bases; sharing (now including a link to the new subprocessors page); cookies and local
storage; retention with stated periods; data subject rights including a California section;
security measures; international transfers referencing SCCs; children's privacy; changes;
contact.

### Subprocessors (`app/src/pages/Subprocessors.tsx`, new)

Public list naming Stripe, Mapbox, Resend, Supabase, Cloudflare, and self-hosted
infrastructure, each with processing purpose, data categories, and location.

**Our own read:** the *structure* is more complete than is typical pre-launch. What has never
been tested is whether the substance holds — particularly the four areas in §4.

---

## 3. Blocking factual problems (not legal questions — fix before review)

These are ours to resolve, listed so counsel is not reviewing against false facts.

1. **No mailbox on the domain receives mail.** `privacy@`, `legal@`, and `support@usemaison.io`
   all appear in the live documents; none exist. A privacy policy naming an address that
   bounces is a live compliance exposure, because statutory response clocks under GDPR and
   CCPA start when the request is *sent*. In-product support currently falls back to a
   personal Gmail address (`TENANT_SUPPORT_EMAIL` in `app/src/config.ts`).
2. **"Maison Technologies, Inc." may not exist as a legal entity.** Both documents name it as
   the contracting party and assert Delaware governing law. Whether the Delaware entity is
   formed needs confirming before anything is signed. Related: 83(b) election timing if any
   restricted stock has been or will be issued.
3. **Mailing address is the literal placeholder `[Address on file]`** in both documents.
4. **Effective dates diverge** — Terms says June 14, 2026; Privacy says July 18, 2026. There is
   no version history or changelog for either.
5. **Application, database, and Redis are self-hosted on infrastructure we operate directly**,
   not on a managed cloud provider. That infrastructure holds rider PII, trip history, and
   driver licence numbers. Security representations in both documents should be checked against
   what is actually true of that environment.
6. **Uploaded assets are served from public Supabase buckets** (operator logos, vehicle images).
   Intended, but worth confirming nothing else is written to those buckets.

---

## 4. The four areas we specifically want reviewed

### 4.1 Limitation of liability — is the cap defensible, and is it right for a free tier?

Current construction caps total cumulative liability at **the greater of (a) 12 months of fees
paid, or (b) $100**.

What we want assessed:

- Whether a 12-month-fees cap is the right structure for a platform whose customers may be
  paying **$0** — the free tier is a real, promoted tier, so for those operators the cap
  collapses to the $100 floor. Is a nominal cap enforceable, and does it create problems it
  does not solve?
- Whether the cap should carve out the usual exceptions (indemnification obligations, breach
  of confidentiality, gross negligence or willful misconduct, and IP infringement), none of
  which are currently carved out.
- Interaction with the **take rate**: an operator paying $0 in subscription may still generate
  meaningful take-rate revenue to Maison. Whether "fees paid" should be defined to include
  platform fees collected on rider payments is an open question we have not decided.
- Whether the consequential-damages exclusion listing "personal injury" is appropriate given
  the transportation context, or whether it invites an unconscionability argument.

### 4.2 Auto-renewal compliance

Subscriptions bill on a recurring basis via Stripe. The Terms authorize recurring charges and
promise 30 days' notice of price changes. **We have not assessed state automatic-renewal law
at all**, and understand California's ARL and several other state statutes have real teeth.

What we want assessed:

- Whether the pre-purchase disclosure at checkout meets "clear and conspicuous" requirements,
  and whether affirmative consent to the recurring term is captured distinctly from general
  ToS acceptance.
- Whether a cancellation mechanism of equivalent ease to signup is required and present. Today
  cancellation is via account settings; we should confirm that satisfies the "click to cancel"
  direction of travel, including the FTC's rulemaking in this area.
- Whether renewal reminder notices are required for our billing period and price points, and
  what the acknowledgment/receipt obligations are after purchase.
- Whether annual prepay plans — which we intend to sell — change the analysis.
- Which states' statutes are triggered by selling to operators nationwide, and whether B2B
  sales are exempt in the relevant states (our operators are frequently sole proprietors, which
  may blur the B2B/consumer line).

### 4.3 Operator warranty — TCP permit and commercial livery insurance

This is the area we are least confident in, and we believe it is the highest-consequence one.

**Current state:** the Terms say operators "are responsible for ensuring that drivers hold any
required licenses and insurance" and must "hold all required business licenses, transportation
permits, and insurance policies." That is phrased as an allocation of responsibility, **not as
a warranty**, and it names nothing specific.

What we want assessed:

- Whether this should become an **affirmative, ongoing warranty** naming the actual instruments
  — operating authority such as a **CPUC TCP permit** in California and state equivalents
  elsewhere, and **commercial livery insurance** at the coverage levels the category requires
  (commonly $750K–$5M depending on seating capacity, with $1M+ typical for black-car work).
- Whether we should **collect proof at onboarding** rather than take a contractual promise, and
  what the liability difference is between the two postures. Today we collect driver licence
  number and a background-check status field; there is **no tenant-level permit or insurance
  verification anywhere in the product**.
- What our exposure is if we verify *some* operators and not others, or verify at onboarding
  and never re-check expiry — i.e. whether partial verification is worse than none.
- The known trap that **personal auto policies universally exclude commercial livery use**, so
  an operator or driver without a commercial policy is uninsured on every ride. Whether our
  documents should address this explicitly to riders.
- Whether Maison should carry **E&O / technology liability** coverage of its own, and what
  limits are appropriate at our stage. We understand it does not and is not meant to cover
  vehicle liability.

### 4.4 Indemnification for transportation claims

The indemnity currently runs from user to Maison and lists five triggers, including "any
transportation service provided by you or your drivers to riders."

What we want assessed:

- Whether that trigger is drafted broadly enough to actually reach a serious personal-injury or
  wrongful-death claim arising from a ride booked through the platform.
- Absent procedural terms: there is **no notice requirement, no defense-control provision, no
  settlement-consent provision, and no obligation to maintain insurance backing the indemnity**.
- Whether the indemnity should be expressly excluded from the liability cap, and whether it
  survives termination — the survival clause lists Indemnification, but the interaction with the
  cap is unstated.
- **Practical collectability.** Our operators are small businesses, frequently sole proprietors.
  An indemnity from a judgment-proof counterparty may not be worth much, which argues for
  insurance verification (§4.3) doing the real work.

---

## 5. Structural question we want a view on: do riders and drivers have any agreement with us?

We flag this because we do not think our current documents solve it, and it cuts across
everything above.

The Terms state they bind operators, drivers, **and riders**. But the entire product
architecture is designed so that **riders never see Maison's brand** — they sign up and book on
the operator's subdomain, under the operator's name and branding. A rider very plausibly has no
idea Maison exists.

Open questions:

- Whether riders and drivers are bound by terms they were never meaningfully presented with,
  and what that means for the **arbitration clause and class-action waiver** in particular.
- Whether the disclaimers and liability limitations are enforceable against a rider who never
  assented.
- Whether we need a separate, short rider-facing notice surfaced in the booking flow, and
  whether that would compromise the carrier/software boundary by putting Maison's name in front
  of riders — which we currently regard as a legal asset worth protecting, not just a product
  decision.
- Whether the operator should be contractually required to pass through specific terms to its
  own riders and drivers, and whether we must give them the language to do it.

---

## 6. Documents we know we are missing

- **A Data Processing Agreement.** None exists. Maison is a processor for operator-controlled
  rider and driver data. We understand Article 28 GDPR sets required processor obligations and
  that a DPA needs an annex of data types, purposes and retention; security measures; a
  subprocessor authorization framework with notification procedure; breach notification; and
  audit rights. The subprocessors page we just published presumes a general-authorization model
  with email notice — **that promise is currently unbacked by any agreement.**
- **A Master Services Agreement** for operators signed outside self-serve, including design
  partners receiving private discounts (see `PRICING_RATIONALE.md`).
- **Written DPAs with each subprocessor** — we have not confirmed which are executed.
- **A DMCA / abuse policy** and designated agent, if user-uploaded content warrants it.

Not pursuing now, flagged for the record: **SOC 2**. Our buyers are 3–15 vehicle operators who
we do not expect to ask. We would revisit only against a named prospect making it a condition.

---

## 7. Positions we have already taken, for confirmation not re-litigation

- **Stripe Connect over money transmitter licensing.** Payments use Connect Express with
  `application_fee_amount` on PaymentIntents created directly on the operator's connected
  account, so funds never rest on Maison's account. We understand this is the standard pattern
  for operating under Stripe's licenses rather than obtaining our own, and want it confirmed as
  applied rather than assumed.
- **PCI SAQ-A scope.** Card details are collected by Stripe's hosted elements and never touch
  our servers or DOM. We treat this as a constraint that no future change may break.
- **Direct charges, not destination charges.** Previously there was commented-out
  `transfer_data` code in the payment path — ambiguous as to whether it was disabled
  deliberately or abandoned mid-change. It has since been removed and the intent documented in
  `stripe_services/checkout.py`. Noted here because commented-out code in a money-movement path
  is the kind of thing that looks bad in diligence.
- **Delaware governing law and AAA arbitration**, subject to §2 confirmation that the entity
  exists.

---

## 8. What we are asking for

1. A review pass on §4.1–4.4 and a view on §5, with redlines to the existing Terms and Privacy
   Policy rather than a ground-up rewrite.
2. A DPA suitable for a processor in our position, GDPR-shaped from the start — we would rather
   not retrofit if a single EU-serving operator brings the platform into scope.
3. A short opinion on the operator warranty and verification posture in §4.3, since it drives a
   product decision (whether to build permit and insurance capture at onboarding) that we would
   rather make once.
4. An estimate split by item, so we can sequence rather than commission everything at once.

**Not asking for:** SOC 2 readiness, trademark work, or fundraising documents at this stage.
