/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  /** Backend `X-API-Key`: `/api/v1/auth/**` and `GET /api/v1/driver/{slug}/verify`. */
  readonly VITE_API_KEY?: string
  readonly VITE_MAPBOX_TOKEN?: string
  readonly VITE_ENVIRONMENT?: string
  readonly VITE_MAIN_DOMAIN?: string
  readonly VITE_DEV_DOMAIN?: string
  readonly VITE_API_PROXY?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string

  readonly VITE_STRIPE_PRICE_STARTER?: string
  readonly VITE_STRIPE_PRICE_GROWTH?: string
  readonly VITE_STRIPE_PRICE_FLEET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 