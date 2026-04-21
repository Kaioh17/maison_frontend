import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Dev / preview: forward browser `/api/*` to the backend (reads `VITE_API_PROXY` from `.env`). */
function apiProxyConfig(mode) {
    const env = loadEnv(mode, __dirname, '');
    const target = (env.VITE_API_PROXY || 'http://127.0.0.1:8000').replace(/\/$/, '');
    return {
        '/api': {
            target,
            changeOrigin: true,
        },
    };
}
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        tsconfigPaths(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: false,
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,webmanifest}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            },
            includeAssets: ['favicon.png', 'offline.html', 'manifest.webmanifest', 'icons/**/*.png'],
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
}));
