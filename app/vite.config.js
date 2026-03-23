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
                manualChunks(id) {
                    if (!id.includes('node_modules'))
                        return undefined;
                    if (id.includes('/node_modules/react/') ||
                        id.includes('/node_modules/react-dom/') ||
                        id.includes('/node_modules/scheduler/') ||
                        id.includes('/node_modules/react-is/') ||
                        id.includes('/node_modules/use-sync-external-store/') ||
                        id.includes('/node_modules/use-sync-external-store-shim/')) {
                        return 'react-vendor';
                    }
                    if (id.includes('/node_modules/react-router/') || id.includes('/node_modules/react-router-dom/')) {
                        return 'router';
                    }
                    if (id.includes('/node_modules/@stripe/'))
                        return 'stripe';
                    if (id.includes('/node_modules/framer-motion/'))
                        return 'framer-motion';
                    if (id.includes('/node_modules/lucide-react/') ||
                        id.includes('/node_modules/@heroicons/') ||
                        id.includes('/node_modules/@phosphor-icons/')) {
                        return 'icons';
                    }
                    if (id.includes('/node_modules/axios/') ||
                        id.includes('/node_modules/zustand/') ||
                        id.includes('/node_modules/jwt-decode/')) {
                        return 'utils';
                    }
                    return undefined;
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
