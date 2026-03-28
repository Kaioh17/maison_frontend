# White Labeling Guide

## Overview

Maison supports white-labeling through tenant-specific **slugs**. Each slug is the **subdomain** on the main app domain (for example `ridez.usemaison.io` in production). Riders and drivers open that hostname; paths on that host (such as `/riders/login`) are tenant-scoped and show branded UI.

Use `getTenantAppUrl(slug, path)` from `@config/host` to build full URLs (e.g. `https://ridez.usemaison.io/riders/login`).

## Core Components

### 1. Slug-based hostnames (subdomain)

In production, tenant URLs look like:

- `https://{slug}.usemaison.io/riders/login` — Rider login
- `https://{slug}.usemaison.io/riders/register` — Rider registration
- `https://{slug}.usemaison.io/rider/dashboard` — Rider dashboard (after login)

In local development, the same paths are typically served on `http://{slug}.localhost:3000/...` (see `MAIN_DOMAIN` / `VITE_DEV_DOMAIN` in `@config/host`).

**Example:** `https://ridez.usemaison.io/riders/login`

### 2. Slug Verification

Slug-based routes are wrapped with the `SlugVerification` component that:

- Calls `GET /api/v1/slug/{slug}` to verify slug validity
- Shows 404 error page if slug doesn't exist
- Only renders child components if slug is valid

**Implementation:**
```tsx
<Route path="/riders/login" element={
  <SlugVerification>
    <RiderLogin />
  </SlugVerification>
} />
```

The slug is resolved from the **subdomain** (see `useTenantSlug()`), not from the first path segment.

### 3. Tenant Information

The `useTenantInfo` hook fetches tenant data based on the slug:

- Extracts slug from the hostname using `useTenantSlug()`
- Calls `GET /api/v1/slug/{slug}` (or related tenant endpoints)
- Returns tenant profile including:
  - Company name
  - Logo URL
  - Tenant ID
  - Custom settings

**Usage:**
```tsx
const { tenantInfo, isLoading, error, slug } = useTenantInfo()
```

### 4. Tenant Branding

Components automatically use tenant-specific branding:

- **Logo:** Uses `tenantInfo.logo_url` if available, falls back to default
- **Company Name:** Displays `tenantInfo.company_name` in UI
- **Theme:** Supports tenant-specific theme customization (via tenant settings)

**Example in RiderRegistration:**
```tsx
const companyName = tenantInfo?.company_name || 'Our Service'
// Used throughout the component for branding
```

### 5. API Endpoints

**Slug Verification:**
- `GET /api/v1/slug/{slug}` - Verifies slug exists, returns `{ slug, tenant_id }`

**Tenant Data:**
- `GET /api/v1/tenant/by-slug/{slug}` - Gets full tenant profile
- `GET /api/v1/slug/{slug}` - Alternative endpoint for slug verification

**Response Format:**
```json
{
  "success": true,
  "message": "Slug exists",
  "data": {
    "slug": "ridez",
    "tenant_id": 131
  }
}
```

## Implementation Flow

1. **User visits** `https://{slug}.usemaison.io/riders/login` (or the dev equivalent on `{slug}.localhost`)
2. **SlugVerification** component verifies slug via API
3. If valid, **RiderLogin** component loads
4. **useTenantInfo** hook fetches tenant data
5. Component displays tenant-branded UI (logo, company name)
6. After login, redirects to `/rider/dashboard` on the same host

## Error Handling

- **Invalid Slug:** Shows 404 page with recommendations and contact info
- **Missing Tenant Data:** Falls back to default branding
- **API Errors:** Displays error messages to user

## Backward Compatibility

Some routes may exist on the main domain without a tenant subdomain; behavior depends on deployment. Prefer linking with `getTenantAppUrl(slug, path)` for tenant-specific links.

## Best Practices

1. Always wrap slug-based routes with `SlugVerification`
2. Use `useTenantInfo` hook for tenant data instead of direct API calls
3. Provide fallback values for tenant branding (logo, company name)
4. Handle loading and error states when fetching tenant data
5. Use slug from `useTenantSlug()` and `@config/host` helpers for navigation links

## File Structure

- `app/src/components/SlugVerification.tsx` - Slug verification wrapper
- `app/src/components/NotFound404.tsx` - 404 error page
- `app/src/hooks/useTenantSlug.ts` - Extract slug from subdomain / URL
- `app/src/hooks/useTenantInfo.ts` - Fetch tenant data
- `app/src/config/host.ts` - `MAIN_DOMAIN`, `getTenantAppUrl`
- `app/src/api/tenant.ts` - Tenant API functions
- `app/src/pages/RiderLogin.tsx` - Tenant-branded login
- `app/src/pages/RiderRegistration.tsx` - Tenant-branded registration
- `app/src/pages/RiderDashboard.tsx` - Tenant-aware dashboard
