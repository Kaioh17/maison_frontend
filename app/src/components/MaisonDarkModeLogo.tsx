import { useEffect, useState, type CSSProperties, type ImgHTMLAttributes } from 'react'
import maisonDarkLogo from '../images/maison_dark_mode_logo.png'
import lightModeLogo from '../images/light_mode_logo.png'

export type MaisonDarkModeLogoProps = {
  className?: string
  /** Locks logo height; width follows intrinsic aspect ratio unless overridden by `style`. */
  height?: number
  /** When true, always render the dark logo asset regardless of active theme. */
  forceDark?: boolean
  style?: CSSProperties
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'style'>

/** Geometric Maison mark — transparent PNG (opaque black keyed to alpha; inverted cutout preserved). */
function getResolvedTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  const theme =
    document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme')
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme === 'light' ? 'light' : 'dark'
}

export default function MaisonDarkModeLogo({
  className,
  height,
  forceDark = false,
  style,
  alt = 'Maison',
  ...rest
}: MaisonDarkModeLogoProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getResolvedTheme())

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getResolvedTheme())
    }

    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] })

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [])

  const src = forceDark ? maisonDarkLogo : theme === 'light' ? lightModeLogo : maisonDarkLogo

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        display: 'block',
        objectFit: 'contain',
        ...(height != null ? { height, width: 'auto' as const } : {}),
        ...style,
      }}
      {...rest}
    />
  )
}
