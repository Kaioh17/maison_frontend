# Tenant Dashboard Modernization — Handoff & Next Phases

Working doc for the multi-phase modernization of the tenant dashboard in `maison_frontend/app`.
Phases A and B are **done and verified**. This file carries the context, rules, and specs needed to
execute Phase C in a fresh session.

---

## 1. Goal

Make the tenant dashboard feel like a premium mobile product (Uber/Stripe/Revolut caliber, not
a generic admin panel) and make the PWA measurably faster (perceived and real). Approved
proposal lives in the plan history; this doc is the actionable remainder.

---

## 2. What is already done (Phase A — shipped, build verified)

All changes below are merged into the working tree and `npm run build` passes (tsc + Vite + SW).

| Change | Where |
|---|---|
| Mobile **bottom tab bar** (≤768px): Overview, Drivers, Bookings, Vehicles + **Menu** tab that opens the old drawer. Hamburger removed on mobile; drawer starts closed on mobile; Phosphor `fill` weight + `--bw-accent` for active tab; safe-area inset + blur backdrop | `src/pages/TenantDashboard.tsx` (CSS in `TENANT_DASHBOARD_LAYOUT_CSS`, nav JSX before "Main Content Area") |
| **Skeleton loading**: shared `Skeleton` + shaped `TenantDashboardSkeleton` replaces "Loading dashboard…" text; shimmer respects `prefers-reduced-motion` | `src/components/Skeleton.tsx`, shimmer CSS in `src/styles.css` (`.bw-skeleton`) |
| **Waterfall fix**: vehicle categories fetched in parallel using `tenantId` from the Zustand auth store (JWT), with sequential fallback; parallel promise self-catches errors | `src/pages/TenantDashboard.tsx` `load()` |
| **Service worker tuning**: API GETs → `StaleWhileRevalidate` (cache `maison-api-v2`, 5 min cap); `/v1/auth/*` stays `NetworkFirst` (4s) in `maison-auth-v1`; nav timeout 5s→3s; old `maison-api-v1` deleted on activate; tenant-branding `NetworkOnly` untouched | `src/sw.ts` |
| **Visual quick wins**: `tabular-nums` dashboard-wide; 16px card radius (scoped to dashboard — global `.bw-card` is still 2px); pressed-state `scale(0.98)` on tappable cards; sticky blurred mobile top bar (`.tenant-dashboard-topbar`) | `src/pages/TenantDashboard.tsx` |
| **qrcode lazy-loaded** via dynamic `import()` at generation time (both call sites) | `src/pages/TenantDashboard.tsx`, `src/pages/demo/index.tsx` |
| Drawer auto-closes when viewport crosses into mobile breakpoint | `src/pages/TenantDashboard.tsx` effect on `isMobile` |

**Build baseline (post-Phase A):** `TenantDashboard` chunk = **243.6 kB (45.4 kB gzip)**;
`vendor` 141 kB; qrcode split into its own ~24 kB async chunk. Compare against these after Phase B.

---

## 3. NEW RULE — Uniform button UI & colors across ALL stages

Buttons are currently inconsistent: per-button inline styles, dozens of `useState` hover flags
(`isRetryHovered`, `isAddDriverHovered`, …~30 of them in `TenantDashboard.tsx`), mixed radii
(7px buttons vs 16px cards), hardcoded hex colors, and different hover treatments per button.

Going forward, **every stage of the dashboard (Overview, Drivers, Bookings, Vehicles, Settings,
modals, confirm dialogs) must use one shared button system**:

- Create `src/components/Button.tsx` (or CSS classes `.btn .btn-primary` etc. in `styles.css`) with variants:
  - **primary** — `--bw-accent` bg, white text, hover `--bw-accent-hover`
  - **secondary / outline** — transparent bg, `1px solid var(--bw-border)`, text `--bw-text`, hover `--bw-bg-hover`
  - **destructive** — `--bw-error` bg/text treatment for delete/unassign confirms
  - **ghost** — no border, used for icon buttons and low-emphasis actions
- All colors come from `--bw-*` CSS variables only (white-label safe; never hardcode hex —
  tenant branding overrides these vars via `RiderBrandedShell`). No `lightMode ?` ternaries:
  `data-theme` + vars already handle both themes.
- Uniform metrics: radius 10px, padding 12px 20px (44px min touch target on mobile), font
  `"Work Sans"` 600, `:hover` via CSS (delete the hover `useState` flags as buttons are migrated),
  `:active { transform: scale(0.98) }`, visible `:focus-visible` outline, `disabled` at 50% opacity
  with no hover.
- Migrate every existing button during Phase B's tab extraction (each extracted tab adopts the
  shared Button on the way out). Confirm-dialog button pairs (Cancel/Confirm) must look identical
  in every dialog.

---

## 4. Phase B — Structure (next up)

### 4.1 Split the monolith into per-tab routes
`src/pages/TenantDashboard.tsx` is ~9,400 lines; all four tabs ship and render as one component.

- Create `TenantShell` layout: sidebar (desktop) + bottom tab bar (mobile) + sticky top bar +
  `<Outlet/>`. Move `TENANT_DASHBOARD_LAYOUT_CSS`, drawer, bottom nav, footer actions there.
- Lazy children under existing URLs (URLs must not change):
  `/tenant/overview` → `OverviewTab`, `/tenant/drivers` → `DriversTab`,
  `/tenant/bookings` → `BookingsTab`, `/tenant/vehicles` → `VehiclesTab`.
  Use React Router nested routes in `src/App.tsx` (keep `TenantRouteBlock` + `ProtectedRoute(tenant)` wrappers).
- `getActiveTab()` path-parsing goes away (derive from route). Keep the
  `navigate('/tenant/bookings', { state: { driverRideSearch } })` cross-tab handoff working.
- Shared modals (`VehicleEditModal`, `TenantBookRideModal`, booking/driver detail modals) move to
  the owning tab; genuinely shared state moves to hooks or the shell.
- Watch out: tab components must keep reading branding/theme via `useTenantTheme` /
  `ThemeContext`; settings submenu lives in the drawer (shell).

### 4.2 TanStack Query
- Add `@tanstack/react-query`; `QueryClientProvider` in `src/main.tsx`.
- Per-resource queries replacing `load()`/`Promise.all` + ~6 `useState`s:
  `['tenant','info']`, `['tenant','drivers']`, `['tenant','vehicles']`,
  `['tenant','bookings', filters]`, `['tenant','config']`, `['tenant','analysis']`,
  `['tenant','vehicleCategories', tenantId]`.
- `staleTime` 30–60s; sections render as their own data arrives (per-section skeletons from
  `@components/Skeleton`, not one global gate).
- Live data: `refetchInterval: 15_000–30_000` + `refetchIntervalInBackground: false` on
  active-trips / drivers-online numbers.
- Existing axios client (`src/api/http.ts`) stays — queries call the same `@api/*` functions.

### 4.3 Optimistic mutations (after 4.2)
`useMutation` + `onMutate` cache update + rollback for: assign driver to booking,
booking status changes, driver add, vehicle add/edit/delete, driver↔vehicle assign/unassign.
Replace "Assigning driver…" dead-button states with instant row updates + subtle pending indicator.

### 4.4 Chunk prefetch
After splitting: prefetch sibling tab chunks on `requestIdleCallback` (or `touchstart` on
bottom-nav items) so tab switches feel native.

---

## 5. Phase C — Polish

1. **Overview "today screen"** replacing the 7-card KPI carousel:
   hero revenue card (large figure, delta vs yesterday, inline pure-SVG sparkline — no chart lib),
   2×2 stat tile grid (active trips, drivers online w/ pulse dot, bookings today, completion rate;
   tiles deep-link to tabs), Revolut-style recent-bookings rows (avatar/initials, rider + route,
   right-aligned amount + status pill), quick-action pill row (Book ride, Add driver).
2. **Icon consolidation**: migrate ~20 files using `lucide-react`/`@heroicons/react` to
   **Phosphor** (`regular` idle / `fill` active / `duotone` empty-states), then
   `npm uninstall lucide-react @heroicons/react`. Affected files include the autocompletes
   (`CityAutocomplete`, `StateAutocomplete`, `CountryAutocomplete`, `LocationAutocomplete`),
   `VehicleEditModal`, `TokenExpirationNotification`, `ImageUploadPanel`, settings pages
   (`GeneralView`, `CompanyInformation`, Help pages), `AddVehicle`, `Signup`, `NotFound`,
   admin pages, `StripeReauth`, `DeveloperOperations`, `AdminComposeEmail`.
3. **framer-motion audit**: keep for marketing/landing pages; in dashboard chunks prefer CSS
   transitions or `LazyMotion`.
4. Status pills everywhere (soft tinted bg + colored text) replacing icon+colored-text pairs —
   one shared component, same colors at every stage (ties into the button-uniformity rule).
5. Typography pass: 12px uppercase tracked labels / 15–16px body / 22px section titles /
   28–32px hero figures; 4px spacing grid; 16px mobile gutter.

---

## 6. Key facts for the next context (avoid re-deriving)

- **Run**: `cd maison_frontend/app && npm run dev` (`dev:network` for device testing);
  build = `npm run build` (runs `tsc -b` first). No lint/test scripts exist.
- **Stack**: Vite 5, React 18, React Router 6 (all pages already `React.lazy`), Zustand
  (`src/store/auth.ts` — has `tenantId` as *string* from JWT), Tailwind + `--bw-*` CSS vars,
  Phosphor icons, vite-plugin-pwa `injectManifest` with custom `src/sw.ts`.
- **White-label invariant**: manifest/icons/branding are per-tenant and must stay `NetworkOnly`
  in the SW; never hardcode colors — tenant branding overrides `--bw-*` vars.
- **Drawer is load-bearing on mobile**: it's the only home of Logout, ThemeToggle,
  "Switch to Driver Mode", Feedback link, and the Settings submenu — the bottom-nav **Menu**
  tab opens it. Don't remove it without relocating those.
- **Path aliases**: `@components/*`, `@pages/*`, `@api/*`, `@hooks/*`, `@store/*`, `@utils/*`, `@config`.
- `registerRoute` in Workbox matches GET only — mutations are never cached.
- Tenant routes are wrapped `TenantRouteBlock > ProtectedRoute(allowRoles=["tenant"])` in `App.tsx`.
- Settings pages live in `src/pages/settings/` with `SettingsMenuBar`; `/tenant/settings/*` is a
  separate area from the four dashboard tabs.

## 7. Verification checklist (run after each phase)

- `npm run build` — compare `TenantDashboard`/shell chunk sizes vs the 243.6 kB baseline.
- Mobile emulation on Slow 4G: skeletons < 1s, sections fill independently, repeat visit paints
  from cache instantly, tab switches < 100ms, offline reload serves the shell (`/offline.html`).
- Bottom nav: active fill icons, safe-area padding, Menu opens/closes drawer.
- White-label: test on a subdomain (`ridez.localhost:3000` via /etc/hosts) — branding colors
  flow into nav/buttons/pills; manifest still fetched fresh.
- Buttons: every stage shows identical variants (primary/secondary/destructive/ghost), hover via
  CSS only, no remaining `isXHovered` state for migrated areas.
