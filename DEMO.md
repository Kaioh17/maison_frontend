# Live demo script — signup to installed branded PWA in under 8 minutes

**Audience:** a 3–15 vehicle limo or black-car operator, on a 20-minute call
(`OUTREACH.md`). The demo is the middle 8 minutes.

**The one thing you are proving:** the rider installs *their* app, with *their* logo, on *their*
domain — and Maison's name appears nowhere. Every step below serves that. Cut anything that
doesn't.

**Do this live, with their logo.** A recorded walkthrough of a fake company proves nothing that
matters here. Get their logo file before the call — the cold email already promised it.

---

## Before the call (15 minutes, once)

### Seed data

You need a **second, already-populated tenant** to show the dashboard with real content, because
the tenant you create live will be empty. Build it once and reuse it.

| What | Why | How |
|---|---|---|
| Demo tenant, slug `prestige` | Populated dashboard for step 6 | Sign up once, keep it |
| 3 vehicles with categories + rates | Booking needs a vehicle category to price against | `/tenant/settings/vehicle-config`, then `/tenant/rates` |
| 2 drivers, onboarded | Dashboard looks dead without them | `/tenant/drivers` → onboard by link |
| ~8 completed bookings, varied prices | Revenue tile and recent-bookings list | Create via `/tenant/bookings`, mark complete |
| Branding fully set | The contrast in step 6 | `/tenant/settings/branding` |

The demo constants already point at this slug — see `src/pages/demo/mockData.ts`
(`DEMO_RIDER_URL`, `DEMO_DRIVER_URL` both use `prestige.usemaison.io`).

### Local dev only

If demoing off localhost rather than production, subdomains need `/etc/hosts` entries:

```
127.0.0.1 prestige.localhost
127.0.0.1 <live-slug>.localhost
```

Then run backend (`docker compose up -d`) and frontend (`cd maison_frontend/app && npm run dev`).
**Prefer production if it is up** — `.localhost:3000` in the URL bar undercuts the entire
white-label pitch.

### Have ready

- Their logo as PNG/SVG
- Their brand hex colour
- A phone, screen mirrored, **not already signed in**
- Their real service area for a plausible pickup/dropoff

---

## The 8 minutes

### 0:00 — Frame it (30s)

> "I'm going to create a brand new account for {operator_name}, brand it with your logo, and
> install it on this phone as an app. Stop me whenever."

Say the time budget out loud. It makes the speed the point.

---

### 0:30 — Signup (90s) → `/signup`

On the apex domain. Fill in their real company name and pick their real slug.

**Say while typing:** "The slug is the whole architecture. It becomes your subdomain, and every
piece of data in the system is scoped to it. Nobody else's operation can see yours."

At the plan step, **click Free** — it routes straight to the dashboard, no card required.

> "Free tier, one vehicle and one driver, we take 3% of card payments. Nothing to cancel. Paid
> tiers lift the caps and *lower* the take rate — 2% on Growth, 1% on Fleet."

**Do not linger on pricing.** They can read `/pricing`. Ninety seconds, land on
`/tenant/overview`.

---

### 2:00 — Branding (2 min) → `/tenant/settings/branding`

**The centrepiece. Do not rush this — it is the thing competitors cannot do.**

1. Upload their logo.
2. Set **Primary** to their brand hex. Mention Secondary, Accent, Background, Surface, Text,
   Muted Text and Button Text exist, but change only Primary live — watching eight pickers is
   boring, watching one repaint the app is not.
3. Save.
4. **Reload the page in front of them.** The dashboard is now their colour.

> "That's not a theme we built for you. It's per-tenant config — every operator on Maison gets
> their own, and it applies to the operator dashboard, the driver app, and the rider booking
> site."

---

### 4:00 — The rider's view (90s) → `https://{slug}.usemaison.io/`

**Open in a fresh tab so they see the URL bar. The URL is part of the demo.**

Their logo, their colours, their domain. Point at the URL bar explicitly:

> "Your customer is on your domain looking at your brand. Maison's name is not on this page.
> Compare that to sending them to a marketplace where you're one listing among forty."

Click through to `/riders/register`, then `/riders/login`. Do not complete a booking — you are
selling the brand ownership, not the form.

---

### 5:30 — Install the PWA (90s) — **the moment that closes**

On the phone, at `https://{slug}.usemaison.io/`:

- **iOS Safari:** Share → Add to Home Screen
- **Android Chrome:** menu → Install app / Add to Home screen

**Then close the browser entirely and open it from the home screen.** Watch for the reaction —
it launches full-screen with their icon and their splash colour, no browser chrome.

> "Their logo on your customer's home screen. No App Store, no review, no $99 a year, no
> separate build. Same for your drivers."

**Why this works:** the manifest and icons are served per-host by the backend
(`/manifest.webmanifest`), resolved from the `Host` header — which is why each operator gets a
genuinely different installed app rather than a shared one.

If the install prompt misbehaves on their device, fall back to the pre-built `prestige` install
you already have on the phone. **Never debug live.**

---

### 7:00 — The populated dashboard (45s) → log in as `prestige`

Their new tenant is empty. Switch to the seeded one.

> "Two weeks in, this is what yours looks like."

Revenue, drivers, recent bookings. Fifteen seconds each. Do not tour every tab.

---

### 7:45 — Name the gaps, then ask (15s)

**Say this before they discover it. Same reason as the cold email — it buys credibility.**

> "Two things it doesn't do: there's no automated dispatch, you assign rides yourself; and
> notifications are email, not SMS. If those are dealbreakers, tell me now."

Then stop talking.

---

## After the demo — ask the question

Do not leave the call without it (`OUTREACH.md` §3):

> "Of your last 20 rides, how many were paid by card, and how many by Zelle, cash, or invoice?"

Record it in `zelle_share_pct`. It is worth more than the demo.

---

## Route reference

| Step | Route | Domain |
|---|---|---|
| Signup | `/signup` | apex only (blocked on subdomains) |
| Dashboard | `/tenant/overview` | apex |
| Branding | `/tenant/settings/branding` | apex |
| Plans | `/tenant/settings/plans` | apex |
| Vehicle categories | `/tenant/settings/vehicle-config` | apex |
| Rates | `/tenant/rates` | apex |
| Drivers | `/tenant/drivers` | apex |
| Bookings | `/tenant/bookings` | apex |
| **Rider landing** | `/` | **`{slug}.` subdomain** |
| Rider register / login | `/riders/register`, `/riders/login` | `{slug}.` subdomain |
| Rider booking | `/rider/book` | `{slug}.` subdomain |
| Driver entry | `/driver/start` | `{slug}.` subdomain |
| PWA manifest | `/manifest.webmanifest` | per-host, backend-served |

Apex-only routes are wrapped in `SubdomainBlock`; tenant operator routes are wrapped in
`TenantRouteBlock` and blocked on the apex. If a route 404s or bounces, you are on the wrong
domain — check that first.

---

## Failure modes

| Symptom | Cause | Do this |
|---|---|---|
| Subdomain won't resolve locally | Missing `/etc/hosts` entry | Fall back to `prestige` |
| Branding didn't change | Cached config | Hard reload; if it persists, move on and mention it updates within a minute |
| Install prompt doesn't appear | Browser/device quirk | Use the pre-installed `prestige` app on your phone |
| Logo looks wrong | Aspect ratio | Do not fix live — "we'll size that properly for you" |
| Asked about dispatch/SMS early | | Answer honestly, immediately, then return to the script |

**The rule: never debug in front of a prospect.** Every failure above has a fallback. Use it and
keep moving.

---

## What to cut if you are over time

In order: the populated dashboard (7:00), the rider register/login click-through (4:00), the
non-Primary colour fields.

**Never cut the branding upload or the PWA install.** Those two are the demo.
