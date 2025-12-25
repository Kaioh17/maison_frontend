import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme()

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--bw-text)',
        transition: 'opacity 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.7'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1'
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
      ) : (
        <Moon className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
      )}
    </button>
  )
}
