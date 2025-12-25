import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  isLight: boolean
  restoreTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Theme
}

// Helper function to get initial theme from localStorage or system preference
function getInitialTheme(): Theme {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'dark' // Default for SSR
    }
    
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme
    
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      return savedTheme
    }
    
    // Default to dark if no saved theme
    return 'dark'
  } catch (error) {
    console.warn('Theme: Error getting initial theme:', error)
    return 'dark' // Fallback to dark theme
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme state with the value from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme() === 'dark')
  const [isLight, setIsLight] = useState<boolean>(getInitialTheme() === 'light')
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // Ensure theme is properly applied on mount
  useEffect(() => {
    try {
      const root = document.documentElement
      const body = document.body
      
      // Check if theme is already set correctly
      const currentRootTheme = root.getAttribute('data-theme')
      const currentBodyTheme = body.getAttribute('data-theme')
      
      // Only update if different
      if (currentRootTheme !== theme) {
        root.setAttribute('data-theme', theme)
      }
      
      if (currentBodyTheme !== theme) {
        body.setAttribute('data-theme', theme)
      }
    } catch (error) {
      console.warn('Theme: Error applying theme on mount:', error)
    }
  }, []) // Empty dependency array - only run once on mount

  // Monitor theme changes and restore if overridden
  useEffect(() => {
    const checkThemeConsistency = () => {
      try {
        const root = document.documentElement
        const body = document.body
        const currentRootTheme = root.getAttribute('data-theme')
        const currentBodyTheme = body.getAttribute('data-theme')
        
        // If theme attributes don't match our state, restore them
        if (currentRootTheme !== theme || currentBodyTheme !== theme) {
          root.setAttribute('data-theme', theme)
          body.setAttribute('data-theme', theme)
        }
      } catch (error) {
        console.warn('Theme: Error checking theme consistency:', error)
      }
    }
    
    // Check every 1 second for more responsive theme restoration
    const interval = setInterval(checkThemeConsistency, 1000)
    
    // Also check when the page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkThemeConsistency()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [theme])

  // Apply theme to document body
  useEffect(() => {
    try {
      const root = document.documentElement
      const body = document.body
      
      // Only remove and reapply if the theme actually changed
      const currentRootTheme = root.getAttribute('data-theme')
      const currentBodyTheme = body.getAttribute('data-theme')
      
      if (currentRootTheme !== theme || currentBodyTheme !== theme) {
        // Remove existing theme attributes
        root.removeAttribute('data-theme')
        body.removeAttribute('data-theme')
        
        // Apply theme
        root.setAttribute('data-theme', theme)
        body.setAttribute('data-theme', theme)
        setIsDark(theme === 'dark')
        setIsLight(theme === 'light')
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.warn('Theme: Error applying theme:', error)
      // Fallback to dark theme
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.setAttribute('data-theme', 'dark')
      setIsDark(true)
      setIsLight(false)
      setIsInitialized(true)
    }
  }, [theme])

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (isInitialized) { // Only save after initial theme is applied
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', theme)
          
          // Also update the document attribute immediately for better persistence
          document.documentElement.setAttribute('data-theme', theme)
          document.body.setAttribute('data-theme', theme)
        }
      } catch (error) {
        console.warn('Theme: Error saving theme to localStorage:', error)
      }
    }
  }, [theme, isInitialized])

  const restoreTheme = () => {
    try {
      const root = document.documentElement
      const body = document.body
      root.setAttribute('data-theme', theme)
      body.setAttribute('data-theme', theme)
    } catch (error) {
      console.warn('Theme: Error restoring theme:', error)
    }
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    isLight,
    restoreTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook to sync theme with tenant settings
export function useTenantTheme(tenantTheme?: string) {
  const { theme, setTheme } = useTheme()
  
  useEffect(() => {
    // Only override user's theme if they haven't explicitly set one
    if (tenantTheme && ['dark', 'light'].includes(tenantTheme)) {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme
        
        // If user has explicitly set a theme, don't override it
        if (savedTheme) {
          return
        }
        
        // Only set tenant theme if no user preference
        if (!savedTheme) {
          setTheme(tenantTheme as Theme)
        }
      } catch (error) {
        console.warn('Theme: Error checking localStorage for theme preference:', error)
      }
    }
  }, [tenantTheme, setTheme, theme])
} 