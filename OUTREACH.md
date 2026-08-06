# Outreach — target list and cold email

**Goal:** ten design partners who pay. Not ten free pilots — see `PRICING_RATIONALE.md` §3
on why free pilots produce polite feedback and no signal.

Pre-launch, zero customers. The purpose of the first ten conversations is to find out whether
the price is real and how much revenue actually runs through cards. Everything below is built
around those two questions.

---

## 1. Target list schema

Track one row per operator. Tab-separated or a spreadsheet; the schema matters more than the
tool.

| Column | Type | Notes |
|---|---|---|
| `operator_name` | text | Legal or trading name. |
| `city` | text | Metro, not street. Density matters — clustering referrals in one metro beats scattering. |
| `est_fleet_size` | integer | Estimated vehicles. **The single most important qualifier.** |
| `current_software` | enum | `limo_anywhere` / `moovs` / `spreadsheet` / `phone_and_text` / `other` / `unknown` |
| `booking_flow_quality` | enum | `none` / `phone_only` / `web_form` / `real_booking` — see rubric below. |
| `contact_name` | text | A person. Not "info@". |
| `contact_email` | text | |
| `contact_phone` | text | Often the faster channel in this category. |
| `source` | text | Where you found them — Google Maps, GBP, association directory, referral. |
| `booking_url` | url | Their current booking page, if any. Evidence for the email's first line. |
| `status` | enum | `not_contacted` / `emailed` / `replied` / `demo_booked` / `demo_done` / `won` / `lost` |
| `last_touch` | date | |
| `zelle_share_pct` | integer | **Answer to the §4 question. Leave blank until asked on a call.** |
| `notes` | text | |

### Qualifying on `est_fleet_size`

| Fleet | Verdict |
|---|---|
| 1–2 | Free tier. Worth having for volume and referrals; do not spend a demo slot. |
| **3–15** | **The ICP.** Big enough to feel coordination pain, too small for enterprise tools. Growth or Fleet. |
| 16–30 | Fleet tier. Longer sales cycle, likely already on Limo Anywhere or Moovs. |
| 30+ | Out of scope pre-launch — they will ask about dispatch and be right to. |

### `booking_flow_quality` rubric

Judge from their public site in under a minute.

- **`none`** — no website, or social only. Highest pain, lowest sophistication.
- **`phone_only`** — site exists, but booking means calling a number. **Best targets.** The
  branded PWA is a visible, immediate upgrade.
- **`web_form`** — a contact form or quote request that a human answers. Strong targets; they
  have already decided online booking matters and have a bad version of it.
- **`real_booking`** — working online booking with live pricing. Hardest sell; they have already
  paid for a solution. Deprioritise unless `current_software` is `limo_anywhere` and they can be
  asked about their bill.

### Prioritisation

Sort by: `booking_flow_quality` in (`phone_only`, `web_form`) → `est_fleet_size` 3–15 →
`current_software` = `limo_anywhere` (billing frustration is the known wedge in this category)
→ same metro as an existing conversation.

---

## 2. Cold email

Six lines. Subject line is not one of them.

> **Subject:** your booking page, on your own domain
>
> Hi {first_name} — I saw {operator_name} takes bookings {by phone / through a quote form}, and built something for exactly that.
>
> Maison gives you your own branded booking app at {slug}.usemaison.io — your logo, your colours, your rates, installable on a rider's phone like a real app. Your riders never see our name.
>
> Straight about what it isn't: there's no automated dispatch — you assign rides yourself — and notifications are email, not SMS. If you need those today, I'm the wrong call.
>
> What it does do is give a 3–15 car operator a booking flow that looks like the big platforms', without handing over your brand or your customer list.
>
> Worth 20 minutes to show you? I'll use your logo so you can see your own version.
>
> — {your_name}, Maison

### Why it is shaped this way

- **Line 1 names specific evidence** from their site. It is the difference between cold email
  and spam, and it is why `booking_url` is in the schema.
- **Line 2 leads with the per-tenant white-label PWA** — the most commercially distinctive thing
  in the codebase and the one thing competitors do not do. "Your riders never see our name" is
  the whole pitch to an operator who fears becoming a commodity on someone else's platform.
- **Line 3 names the gaps before they find them.** No dispatch engine and no SMS are real
  ([`state-of-the-business.md`](../.claude/skills/maison-ceo/references/state-of-the-business.md)
  gaps 5 and 6). Naming them disqualifies the wrong prospects in line 3 instead of in minute 18
  of a demo, and buys credibility for everything else in the email. Do not soften this.
- **Line 4 reframes the gaps as a segment choice** rather than an apology.
- **Line 5 asks for 20 minutes and offers their logo.** The branding demo is the strongest thing
  we have and it costs one upload — see `DEMO.md`.

### Rules

- **Never say "book a ride with Maison" or anything that positions Maison as the carrier.**
  Maison is software; the operator is the carrier. That boundary is a legal asset
  (`LEGAL_REVIEW.md` §4.3), not just positioning.
- Do not promise dispatch, SMS, or live tracking on a roadmap you have not committed to.
- Do not send the discount in the first email. Anchor at list; discount privately, in
  conversation (`PRICING_RATIONALE.md` §3).
- One follow-up after five business days, then stop.

---

## 3. Ask on every call: the Zelle share

**This question decides whether the take rate is a real revenue stream. It is the highest-value
thing in any of these calls. Ask it every time, record the number in `zelle_share_pct`.**

> Of your last 20 rides, how many were paid by card, and how many by Zelle, cash, or invoice?

Ask for the last 20 specifically. "Roughly what percentage?" gets a guess; "your last 20" gets
a count.

**Why it matters:** Zelle and cash bookings never create a Stripe PaymentIntent, so Maison earns
**nothing** on them — the 3/2/1% take rate applies to card volume only. Every revenue forecast
built on the take rate has to be discounted by this number, and we do not know it.

**Do not lead the answer.** Do not say "we'd prefer card" or hint that Zelle is a problem. If
operators think card is the right answer they will give it, and the number becomes useless.

**Decision thresholds** (full reasoning in `PRICING_RATIONALE.md` §4):

| Consistent answer | What it means |
|---|---|
| Under ~20% non-card | Take rate holds. Current posture stands, no change. |
| 20–50% | Real leak. Reopen whether Zelle should be a paid-tier feature. |
| Over 50% | The take rate is not a revenue stream for this segment. Move to subscription-only pricing and revisit the whole ladder. |

### Worth asking while you have them

- What do you pay for software today, and can you predict the bill? (Tests the unpredictable-
  billing wedge that Limo Anywhere is attacked on.)
- What happens today when a driver cancels an hour out? (Sizes the dispatch gap honestly.)
- Do you hold a TCP permit or state equivalent, and commercial livery coverage? (Feeds the
  onboarding-verification decision in `LEGAL_REVIEW.md` §4.3.)

---

## 4. Tracking

Keep it in one file. `status` and `zelle_share_pct` are the only two fields that need to stay
current — the first tells you what to do next, the second is the one number the pricing model
is waiting on.

Review after ten `demo_done` rows: if two consecutive prospects refuse the take rate, that is
the trigger to reopen `PRICING_RATIONALE.md` §2.
