# White Labeling Guide

## Overview

Maison supports white-labeling through tenant-specific slugs, allowing each tenant to have their own branded subdomain/URL path with custom branding and tenant-specific data.

## Core Components

### 1. Slug-Based Routing

Routes are prefixed with tenant slugs to create tenant-specific URLs:

- `/:slug/riders` - Rider dashboard
- `/:slug/riders/login` - Rider login
- `/:slug/riders/register` - Rider registration
- `/:slug/riders/profile` - Rider profile

**Example:** `http://localhost:3000/ridez/riders`

### 2. Slug Verification

All slug-based routes are wrapped with `SlugVerification` component that:

- Calls `GET /api/v1/slug/{slug}` to verify slug validity
- Shows 404 error page if slug doesn't exist
- Only renders child components if slug is valid

**Implementation:**
```tsx
<Route path="/:slug/riders" element={
  <SlugVerification>
    <RiderDashboard />
  </SlugVerification>
} />
```

### 3. Tenant Information

The `useTenantInfo` hook fetches tenant data based on the slug:

- Extracts slug from URL using `useTenantSlug()`
- Calls `GET /api/v1/tenant/by-slug/{slug}` (or `/v1/slug/{slug}`)
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

1. **User visits** `/{slug}/riders/login`
2. **SlugVerification** component verifies slug via API
3. If valid, **RiderLogin** component loads
4. **useTenantInfo** hook fetches tenant data
5. Component displays tenant-branded UI (logo, company name)
6. After login, redirects to `/{slug}/riders` dashboard

## Error Handling

- **Invalid Slug:** Shows 404 page with recommendations and contact info
- **Missing Tenant Data:** Falls back to default branding
- **API Errors:** Displays error messages to user

## Backward Compatibility

Legacy routes without slugs are still supported:
- `/riders/register`
- `/riders/profile`
- `/login` (general login)

These routes work without slug verification but don't have tenant-specific branding.

## Best Practices

1. Always wrap slug-based routes with `SlugVerification`
2. Use `useTenantInfo` hook for tenant data instead of direct API calls
3. Provide fallback values for tenant branding (logo, company name)
4. Handle loading and error states when fetching tenant info
5. Use slug from `useTenantSlug()` for navigation links

## File Structure

- `app/src/components/SlugVerification.tsx` - Slug verification wrapper
- `app/src/components/NotFound404.tsx` - 404 error page
- `app/src/hooks/useTenantSlug.ts` - Extract slug from URL
- `app/src/hooks/useTenantInfo.ts` - Fetch tenant data
- `app/src/api/tenant.ts` - Tenant API functions
- `app/src/pages/RiderLogin.tsx` - Tenant-branded login
- `app/src/pages/RiderRegistration.tsx` - Tenant-branded registration
- `app/src/pages/RiderDashboard.tsx` - Tenant-aware dashboard
