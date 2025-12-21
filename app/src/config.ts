// API base URL - use environment variable or fallback smartly based on runtime
// - Docker: use relative '/api' which resolves to the container's base URL
// - Local dev: use environment variable or fallback to relative '/api'
const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : ''
const runtimePort = typeof window !== 'undefined' ? window.location.port : ''
const apiPort = import.meta.env.VITE_API_PORT || '8000'
const isLocalVite = (runtimeHost === '127.0.0.1' || runtimeHost === 'localhost') && (runtimePort === '5173' || runtimePort === '3001')
const isLocalPort3000 = (runtimeHost === '127.0.0.1' || runtimeHost === 'localhost') && runtimePort === '3000'

const FALLBACK_API_BASE = (isLocalVite || isLocalPort3000) 
  ? `http://${runtimeHost}:${apiPort}/api` 
  : '/api'

export const API_BASE = import.meta.env.VITE_API_BASE || FALLBACK_API_BASE;

export type UserRole = 'tenant' | 'driver' | 'rider' | 'admin';

export const REFRESH_ENDPOINT_BY_ROLE: Record<UserRole, string> = {
  tenant: '/v1/login/refresh_tenants',
  driver: '/v1/login/refresh',
  rider: '/v1/login/refresh',
  admin: '/v1/login/refresh',
}; 