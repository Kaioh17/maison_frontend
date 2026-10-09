import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@config'
import { jwtDecode } from 'jwt-decode'
import { logout as logoutApi } from '@api/auth'
import { clearRuntimeCaches } from '@utils/pwaCaches'

type TokenPayload = { id: string; role: UserRole; tenant_id?: string; exp?: number }

type AuthState = {
  accessToken: string | null
  role: UserRole | null
  userId: string | null
  tenantId: string | null
  isAuthenticated: boolean
  setAccessToken: (token: string) => void
  login: (args: { token: string }) => void
  logout: () => void
  getUserId: () => string | null
  getTenantId: () => string | null
  checkAuthStatus: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      role: null,
      userId: null,
      tenantId: null,
      isAuthenticated: false,
      setAccessToken: (token) => {
        let role: UserRole | null = null
        let userId: string | null = null
        let tenantId: string | null = null
        try {
          const decoded = jwtDecode<TokenPayload>(token)
          role = decoded.role
          userId = decoded.id
          tenantId = decoded.tenant_id || null
        } catch {}
        set({ 
          accessToken: token, 
          role, 
          userId, 
          tenantId,
          isAuthenticated: !!token 
        })
      },
      login: ({ token }) => {
        let role: UserRole | null = null
        let userId: string | null = null
        let tenantId: string | null = null
        try {
          const decoded = jwtDecode<TokenPayload>(token)
          role = decoded.role
          userId = decoded.id
          tenantId = decoded.tenant_id || null
        } catch {}
        set({ 
          accessToken: token, 
          role, 
          userId, 
          tenantId,
          isAuthenticated: true 
        })
      },
      logout: () => {
        // Call logout API endpoint in background (fire-and-forget)
        logoutApi().catch((error) => {
          // Log error but continue with logout even if API call fails
          console.error('Logout API call failed:', error)
        })
        void clearRuntimeCaches()
        // Clear local state immediately
        set({ 
          accessToken: null, 
          role: null, 
          userId: null, 
          tenantId: null,
          isAuthenticated: false 
        })
      },
      getUserId: () => get().userId,
      getTenantId: () => get().tenantId,
      // Pure check: never logs out, so callers can try a cookie refresh before giving up.
      checkAuthStatus: () => {
        const { accessToken } = get()
        if (!accessToken) return false
        try {
          const { exp } = jwtDecode<TokenPayload>(accessToken)
          return !(exp && exp < Date.now() / 1000)
        } catch {
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        userId: state.userId,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 