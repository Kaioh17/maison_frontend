# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `app/`:

```bash
npm run dev           # Dev server on port 3000 (WSL: use dev:network for cross-device)
npm run dev:network   # Dev server bound to 0.0.0.0 (mobile testing)
npm run build         # tsc -b && vite build
npm run preview       # Preview production build on port 3000
```

No lint or test scripts are configured.

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
| `VITE_STRIPE_PRICE_STARTER/GROWTH/FLEET` | Stripe subscription price IDs |
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

Uses `vite-plugin-pwa` with `injectManifest` strategy and a custom `src/sw.ts` service worker. The manifest and app icons are intentionally **not** precached — they are proxied to the backend so each tenant subdomain gets its own white-labeled branding.

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
