import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Dev / preview: forward browser `/api/*` to the backend (reads `VITE_API_PROXY` from `.env`).
 *
 * Also forwards the per-host PWA install metadata endpoints. iOS Safari and
 * Android Chrome snapshot manifest/apple-touch-icon at "Add to Home Screen"
 * time before client JS runs, so these must be served by the backend (which
 * resolves the tenant from the request Host header). Static fallbacks in
 * `public/` ship for the case where the backend is unreachable.
 */
function apiProxyConfig(mode: string) {
  const env = loadEnv(mode, __dirname, '')
  const target = (env.VITE_API_PROXY || 'http://127.0.0.1:8000').replace(/\/$/, '')
  const passthrough = {
    target,
    changeOrigin: true,
    configure: (proxy: unknown) => {
      const { on } = proxy as { on: (e: string, fn: (...a: unknown[]) => void) => void }
      on('proxyReq', (proxyReq: { setHeader: (k: string, v: string) => void }, req: { headers: { host?: string } }) => {
        const host = req.headers.host
        if (host) proxyReq.setHeader('X-Forwarded-Host', host)
      })
    },
  } as const
  return {
    '/api': passthrough,
    '/manifest.webmanifest': passthrough,
    '/apple-touch-icon.png': passthrough,
    '/apple-touch-icon-precomposed.png': passthrough,
    '^/apple-touch-icon-[^/]+\\.png$': passthrough,
    '^/icons/icon-[^/]+\\.png$': passthrough,
    '/favicon.png': passthrough,
    '/favicon.ico': passthrough,
  } as const
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      /**
       * Use `public/manifest.webmanifest` (static fallback). In production
       * nginx rewrites `/manifest.webmanifest` to the backend so per-host
       * tenant branding is returned instead. The static file is only used
       * if the proxy is unreachable.
       */
      manifest: false,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,woff2,woff}'],
        // Per-host PWA install metadata MUST hit the network so tenants get
        // their own white-label branding. Precaching these would let the SW
        // serve the first tenant's manifest/icons to every other subdomain.
        globIgnores: [
          '**/manifest.webmanifest',
          '**/apple-touch-icon*.png',
          '**/icons/icon*.png',
          '**/favicon.*',
          '**/favicon1.png',
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      includeAssets: ['offline.html', 'favicon.svg', 'icons/icon.svg'],
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        /** Fewer HTTP round-trips; app + router + other deps share the entry/async chunks except this vendor split. */
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 400,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: apiProxyConfig(mode),
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    proxy: apiProxyConfig(mode),
    strictPort: false,
  },
}))
