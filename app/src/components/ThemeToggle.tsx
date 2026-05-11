import React from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        border: '1px solid var(--bw-border)',
        background: 'var(--bw-bg)',
        color: 'var(--bw-text)',
        borderRadius: 9999,
        width: 40,
        height: 40,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 16,
        lineHeight: 1,
      }}
    >
      {isDark ? <Moon size={18} weight="regular" aria-hidden /> : <Sun size={18} weight="regular" aria-hidden />}
    </button>
  )
}
