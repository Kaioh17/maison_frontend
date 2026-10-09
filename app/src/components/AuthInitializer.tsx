import { useEffect } from 'react'
import { useAuthStore } from '@store/auth'

export default function AuthInitializer() {
  const { accessToken, role, checkAuthStatus, logout } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // If we have a stored token, check if it's still valid
        if (accessToken && role) {
          const isValid = checkAuthStatus()
          
          if (!isValid) {
            // Token is invalid, clear it
            logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      }
    }

    initializeAuth()
  }, [accessToken, role, checkAuthStatus, logout])

  return null
} 