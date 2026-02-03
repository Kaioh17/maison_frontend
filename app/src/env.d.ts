/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_MAPBOX_TOKEN?: string
  readonly VITE_ENVIRONMENT?: string
  readonly VITE_MAIN_DOMAIN?: string
  readonly VITE_DEV_DOMAIN?: string
  readonly VITE_API_PROXY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 