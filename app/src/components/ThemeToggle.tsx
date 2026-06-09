import React from 'react'
import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@contexts/ThemeContext'

export type ThemeToggleMode = 'dark' | 'light'

interface ThemeToggleProps {
  mode?: 'icon' | 'segmented'
  value?: ThemeToggleMode
  onChange?: (mode: ThemeToggleMode) => void
}

export default function ThemeToggle({
  mode = 'icon',
  value,
  onChange,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  if (mode === 'segmented') {
    const selectedMode: ThemeToggleMode = value || (isDark ? 'dark' : 'light')
    const options: Array<{ id: ThemeToggleMode; label: string }> = [
      { id: 'dark', label: 'Dark' },
      { id: 'light', label: 'Light' },
    ]

    const handleSelect = (next: ThemeToggleMode) => {
      if (onChange) {
        onChange(next)
        return
      }
      setTheme(next)
    }

    return (
      <div
        role="group"
        aria-label="Theme mode"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid var(--bw-border)',
          borderRadius: 9999,
          background: 'var(--bw-bg)',
          overflow: 'hidden',
        }}
      >
        {options.map((option) => {
          const isActive = selectedMode === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              aria-pressed={isActive}
              style={{
                border: 'none',
                background: isActive ? 'var(--bw-accent)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--bw-text)',
                padding: '6px 10px',
                fontSize: 12,
                lineHeight: 1.2,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
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
