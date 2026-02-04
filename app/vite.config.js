import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react-dom') || id.includes('react/')) {
                            return 'react-vendor';
                        }
                        if (id.includes('react-router')) {
                            return 'router';
                        }
                        if (id.includes('@stripe')) {
                            return 'stripe';
                        }
                        if (id.includes('framer-motion')) {
                            return 'framer-motion';
                        }
                        if (id.includes('lucide-react') || id.includes('@heroicons') || id.includes('@phosphor-icons')) {
                            return 'icons';
                        }
                        if (id.includes('axios') || id.includes('zustand') || id.includes('jwt-decode')) {
                            return 'utils';
                        }
                        // Other node_modules in a shared vendor chunk
                        return 'vendor';
                    }
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
        chunkSizeWarningLimit: 400,
    },
    server: {
        host: '0.0.0.0', // Allow external connections
    	allowedHosts: ['usemaison.io'],
        port: 3000,
        // Dev-only: set VITE_API_PROXY in .env (see env.example) for local API proxy; production build does not use this.
        proxy: process.env.VITE_API_PROXY ? { '/api': process.env.VITE_API_PROXY } : {},
        strictPort: false,
    },
});
