# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `app/`:

```bash
npm run dev           # Dev server on port 3000 (WSL: use dev:network for cross-device)
npm run dev:network   # Dev server bound to 0.0.0.0 (mobile testing)
npm run build         # tsc -b && vite build
npm run preview       # Preview production build on port 3000

npm run lint          # ESLint (flat config). Exits 0 today; conventions are warnings
npm run lint:fix      # Auto-fix
npm run test          # Vitest + jsdom, single run
npm run test:watch    # Vitest watch mode
npm run typecheck     # tsc for app (tsconfig.json) + tests (tsconfig.test.json)
```

`vite.config.js` / `vite.config.d.ts` / `*.tsbuildinfo` are gitignored build artifacts.
If a `vite.config.js` ever reappears it **shadows `vite.config.ts`** — Vite resolves
`.js` first — so delete it rather than editing it.

## UI conventions

Frontend UI work is governed by the **`maison-ui` skill**
(`.claude/skills/maison-ui/SKILL.md` at the workspace root): `--bw-*` token contract,
the shared `Button` / `StatusPill` / `Skeleton` primitives, tenant dashboard structure
under `src/pages/tenant/`, typography, Phosphor icons, and responsive rules. It
supersedes the older design docs, which now live in that skill's `references/`.

### Local Subdomain Testing

To test white-label tenant subdomains, add entries to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 ridez.localhost
127.0.0.1 demo.localhost
```

Then access `http://ridez.localhost:3000`.

### Environment Variables

Copy `.env.example` to `.env` in `app/`. Key variables:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | Backend API base URL (default: auto-detected) |
| `VITE_API_PROXY` | Vite dev proxy target (default: `http://127.0.0.1:8000`) |
| `VITE_API_PORT` | Backend port for local dev (default: `8000`) |
| `VITE_MAPBOX_TOKEN` | Mapbox GL for location autocomplete |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe client key |
| `VITE_STRIPE_PRICE_FREE/GROWTH/FLEET` | Stripe subscription price IDs |
| `VITE_API_KEY` | Shared `X-API-Key` for auth and public driver verify endpoints |

## Architecture

### Multi-Tenant White-Labeling

The app is a **multi-tenant SaaS platform for ride-hailing operators**. Tenants get white-labeled subdomains (e.g., `ridez.localhost`). The subdomain is the "slug" that identifies the tenant.

- `useTenantSlug` (`src/hooks/useTenantSlug.ts`) — extracts slug from `window.location.hostname`
- `SlugVerification` (`src/components/SlugVerification.tsx`) — fetches tenant config and populates a cache; wraps routes that need tenant context
- `RiderBrandedShell` (`src/components/RiderBrandedShell.tsx`) — applies tenant CSS custom properties (`--bw-*`) to the tree; must be nested inside `SlugVerification`
- `SubdomainBlock` — blocks access on subdomains; used for root-only pages like `/signup`, `/about`
- `TenantRouteBlock` — blocks access on the apex/root domain; used for tenant operator routes

### User Roles

Three distinct user types with separate auth flows:

- **tenant** — ride-hailing company operators; login at `/tenant/login`, dashboard at `/tenant/overview`
- **driver** — subcontractor drivers; login at `/driver/login` (subdomain) or `/driver` (apex)
- **rider** — end customers booking rides; login at `/riders/login` (subdomain only)

Auth state is in Zustand (`src/store/auth.ts`) with `localStorage` persistence via `persist` middleware. JWT tokens are decoded to extract `role`, `userId`, and `tenantId`.

### Route Guards

`ProtectedRoute` (`src/components/ProtectedRoute.tsx`) checks `useAuthStore` and `allowRoles`. The route composition wrappers in `App.tsx` are:

- `RiderRoute` — `SlugVerification > RiderBrandedShell > ProtectedRoute(rider)`
- `DriverRoute` — `SlugVerification > RiderBrandedShell > ProtectedRoute(driver)`
- `TenantRouteBlock > ProtectedRoute(tenant)` — for tenant operator pages

### API Layer

- `src/api/http.ts` — axios instance with JWT bearer injection, automatic token refresh on 401, and `X-API-Key` header for auth/admin/driver-verify endpoints
- `src/config.ts` — resolves `API_BASE` at runtime based on hostname/port; subdomains always use relative `/api` to go through Vite proxy
- Vite proxy (`vite.config.ts`) forwards `/api/*`, `/manifest.webmanifest`, and PWA icon paths to the backend, forwarding `X-Forwarded-Host` so the backend can resolve tenant by hostname

### PWA

Uses `vite-plugin-pwa` with `injectManifest` strategy and a custom `src/sw.ts` service worker.

- **Install metadata is per tenant and server-side.** `index.html` links a static `/manifest.webmanifest` and `/apple-touch-icon.png`; the backend (`backend/backend/app/api/routers/pwa.py`) resolves the tenant from the Host header and answers with that tenant's manifest and generated PNG icons (tenant icon, then logo, then initials on the brand colour, then the Maison icon). They are never precached and always `NetworkOnly` in the worker. `useFavicon` only fills in the title, `apple-mobile-web-app-title` (short name), and `theme-color` at runtime; it must not rewrite the manifest or apple-touch-icon links.
- **The worker caches only the precached app shell.** No API, auth, or image responses ever go into Cache Storage (they carry personal data). Navigations are network-first with the precached offline page as fallback. `clearRuntimeCaches()` runs on logout.
- **Updates are never automatic.** `registerType: 'prompt'`; a waiting worker sets `usePwaUpdate().needRefresh` and `UpdateBanner` lets the user choose when to reload.
- **Screen containment.** `.app-root` (in `App.tsx`) pads for the notch; page heights use `var(--app-h)` (dynamic viewport minus the top inset, with a `100vh` fallback), never `100vh`/`100vw`. Fixed bars and drawers add `env(safe-area-inset-*)` themselves. Dialog heights use `--modal-max-h`, which follows the visual viewport (`src/viewport.ts`) so the on-screen keyboard cannot cover them. Touch devices get 16px field text and 44px hit areas from the `@media (pointer: coarse)` block at the end of `styles.css`.
- Keep `shortAppName` (`src/utils/tenantName.ts`) in sync with `make_short_name` in `pwa_service.py`.

### Path Aliases

Configured via `vite-tsconfig-paths` + `tsconfig.json`:

| Alias | Path |
|---|---|
| `@components/*` | `src/components/*` |
| `@pages/*` | `src/pages/*` |
| `@api/*` | `src/api/*` |
| `@hooks/*` | `src/hooks/*` |
| `@store/*` | `src/store/*` |
| `@utils/*` | `src/utils/*` |
| `@config` | `src/config.ts` |

### Styling

Tailwind CSS + PostCSS. No CSS modules — component-level styles use Tailwind classes and CSS custom properties for tenant theming (`--bw-*` variables set by `RiderBrandedShell`). Page-level CSS files exist for the landing pages (e.g., `landing.css`, `tenant-landing.css`).

See the `maison-ui` skill before writing UI. The short version: never hardcode a hex color — `--bw-*` is what makes white-labeling work — and use `@components/Button` rather than a hand-rolled `<button>` with hover state.
