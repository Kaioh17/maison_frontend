import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { API_BASE, AUTH_API_KEY, REFRESH_ENDPOINT_BY_ROLE, UserRole } from '@config'
import { useAuthStore } from '@store/auth'
import { extractSubdomain, isLocalhost, isMainDomainHost } from '@utils/subdomain'

function resolveApiBase(): string {
	try {
		if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
			const url = new URL(API_BASE, typeof window !== 'undefined' ? window.location.href : undefined)
			if (isLocalhost(url.hostname) && !url.port) {
				url.port = import.meta.env.VITE_API_PORT || '8000'
			}
			return url.origin + url.pathname.replace(/\/$/, '')
		}
		// For relative URLs like '/api', return as is
		return API_BASE
	} catch {
		return API_BASE
	}
}

const RESOLVED_BASE = resolveApiBase()

/** True when API lives on an absolute URL (e.g. prod `https://api.example.com/api`). */
function isAbsoluteApiBase(): boolean {
	return RESOLVED_BASE.startsWith('http://') || RESOLVED_BASE.startsWith('https://')
}

/** Paths under axios `baseURL` that map to backend `/api/v1/auth/**`. */
function isV1AuthRequestPath(url: string | undefined): boolean {
	if (!url) return false
	const path = url.split('?')[0]
	return path === '/v1/auth' || path.startsWith('/v1/auth/')
}

/** Pre-login driver onboarding: `GET /api/v1/driver/{slug}/verify` expects `X-API-Key`. */
function isDriverVerifyRequestPath(url: string | undefined): boolean {
	if (!url) return false
	const path = url.split('?')[0]
	return /^\/v1\/driver\/[^/]+\/verify$/.test(path)
}

export const http = axios.create({
	baseURL: RESOLVED_BASE,
	withCredentials: true,
	maxRedirects: 5,
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = useAuthStore.getState().accessToken
	if (token) {
		config.headers = config.headers || {}
		config.headers.Authorization = `Bearer ${token}`
	}
	if (
		AUTH_API_KEY &&
		(isV1AuthRequestPath(config.url) || isDriverVerifyRequestPath(config.url))
	) {
		config.headers = config.headers || {}
		config.headers['X-API-Key'] = AUTH_API_KEY
	}
	
	// Dev: tenant subdomains use relative `/api` so the Vite dev server can proxy.
	// Prod: absolute `VITE_API_BASE` must stay (API on api.*); do not force same-origin `/api`.
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname
		const isSubdomain = !isMainDomainHost(hostname)
		
		if (isSubdomain && !isAbsoluteApiBase()) {
			config.baseURL = '/api'
		}
		
		// Add tenant slug header for rider requests on subdomains
		const slug = extractSubdomain(hostname)
		const role = useAuthStore.getState().role
		if (slug && role === 'rider') {
			config.headers = config.headers || {}
			config.headers['X-Tenant-Slug'] = slug
		}
	}
	
	return config
})

let isRefreshing = false
let pendingQueue: Array<() => void> = []

async function performTokenRefresh(): Promise<string> {
	const store = useAuthStore.getState()
	
	if (!store.role) {
		throw new Error('No role available for refresh')
	}
	
	// Tenants should not auto-refresh via interceptor (only manual refresh)
	if (store.role === 'tenant') {
		throw new Error('Tenant tokens must be refreshed manually')
	}
	
	const refreshPath = REFRESH_ENDPOINT_BY_ROLE[store.role as UserRole]
	
	// Use fetch with credentials for cookie-based refresh
	const baseURL = RESOLVED_BASE
	const fullUrl = `${baseURL}${refreshPath}`
	
	const response = await fetch(fullUrl, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(AUTH_API_KEY && isV1AuthRequestPath(refreshPath) ? { 'X-API-Key': AUTH_API_KEY } : {}),
		}
	})
	
	if (!response.ok) {
		throw new Error('Token refresh failed')
	}
	
	const data = await response.json()
	const newToken = data?.access_token
	
	if (newToken) {
		store.setAccessToken(newToken)
		return newToken
	} else {
		throw new Error('No new token received')
	}
}

function onRefreshed() {
	pendingQueue.forEach((cb) => cb())
	pendingQueue = []
}

http.interceptors.response.use(
	(res: AxiosResponse) => res,
	async (error: AxiosError) => {
		const original = error.config
		const status = error?.response?.status
		
		if (status === 401 && original && !(original as any)._retry) {
			(original as any)._retry = true

			if (isRefreshing) {
				await new Promise<void>((resolve) => pendingQueue.push(resolve))
			} else {
				try {
					isRefreshing = true
					await performTokenRefresh()
				} catch (err) {
					useAuthStore.getState().logout()
					return Promise.reject(error)
				} finally {
					isRefreshing = false
					onRefreshed()
				}
			}

			const newToken = useAuthStore.getState().accessToken
			if (newToken && original) {
				original.headers = original.headers || {}
				original.headers.Authorization = `Bearer ${newToken}`
				return http(original)
			} else {
				return Promise.reject(error)
			}
		}

		return Promise.reject(error)
	}
) 