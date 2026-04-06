import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
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
    plugins: [react(), tsconfigPaths()],
    build: {
        rollupOptions: {
            output: {
                /** Fewer HTTP round-trips on the demo shell; let Rollup merge app + most deps into the entry/async chunks. */
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router', 'react-router-dom'],
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
