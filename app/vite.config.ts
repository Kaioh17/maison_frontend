// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tsconfigPaths from 'vite-tsconfig-paths'

// // https://vitejs.dev/config/
// export default defineConfig({
// 	plugins: [react(), tsconfigPaths()],
// 	build: {
// 		rollupOptions: {
// 			output: {
// 				manualChunks(id) {
// 					if (id.includes('node_modules')) {
// 						if (id.includes('react-dom') || id.includes('react/')) {
// 							return 'react-vendor'
// 						}
// 						if (id.includes('react-router')) {
// 							return 'router'
// 						}
// 						if (id.includes('@stripe')) {
// 							return 'stripe'
// 						}
// 						if (id.includes('framer-motion')) {
// 							return 'framer-motion'
// 						}
// 						if (id.includes('lucide-react') || id.includes('@heroicons') || id.includes('@phosphor-icons')) {
// 							return 'icons'
// 						}
// 						if (id.includes('axios') || id.includes('zustand') || id.includes('jwt-decode')) {
// 							return 'utils'
// 						}
// 						// Other node_modules in a shared vendor chunk
// 						return 'vendor'
// 					}
// 				},
// 				chunkFileNames: 'assets/[name]-[hash].js',
// 				entryFileNames: 'assets/[name]-[hash].js',
// 				assetFileNames: 'assets/[name]-[hash][extname]',
// 			},
// 		},
// 		chunkSizeWarningLimit: 400,
// 	},
// 	server: {
// 		host: '0.0.0.0', // Allow external connections
// 		port: 3000,
// 		// Dev-only: set VITE_API_PROXY in .env (see env.example) for local API proxy; production build does not use this.
// 		proxy: process.env.VITE_API_PROXY ? { '/api': process.env.VITE_API_PROXY } : {},
	
// 		strictPort: false,
// 	},
// })

// app/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // 1) Force ALL React internals into the same chunk
          //    This prevents react-vendor <-> vendor circular dependencies.
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/') ||
            id.includes('/node_modules/react-is/') ||
            id.includes('/node_modules/use-sync-external-store/') ||
            id.includes('/node_modules/use-sync-external-store-shim/')
          ) {
            return 'react-vendor'
          }
          // 2) Router (optional separate chunk)
          if (id.includes('/node_modules/react-router/') || id.includes('/node_modules/react-router-dom/')) {
            return 'router'
          }
          // 3) Your other libraries (optional)
          if (id.includes('/node_modules/@stripe/')) return 'stripe'
          if (id.includes('/node_modules/framer-motion/')) return 'framer-motion'
          if (
            id.includes('/node_modules/lucide-react/') ||
            id.includes('/node_modules/@heroicons/') ||
            id.includes('/node_modules/@phosphor-icons/')
          ) {
            return 'icons'
          }
          if (
            id.includes('/node_modules/axios/') ||
            id.includes('/node_modules/zustand/') ||
            id.includes('/node_modules/jwt-decode/')
          ) {
            return 'utils'
          }
          // 4) IMPORTANT: do NOT return a shared catch-all 'vendor' here.
          //    Let Rollup/Vite decide, otherwise you can re-introduce cycles.
          return undefined
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
    proxy: process.env.VITE_API_PROXY ? { '/api': process.env.VITE_API_PROXY } : {},
    strictPort: false,
  },
})