import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	server: {
		host: '0.0.0.0', // Allow external connections
		port: 3000,
		proxy: {
			'/api': process.env.VITE_API_PROXY || 'http://localhost:8000',
		},
	},
})