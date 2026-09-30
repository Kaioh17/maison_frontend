import { useEffect, useRef, useState } from 'react'

/**
 * Tracks scroll direction and returns true once the user scrolls down past
 * a small threshold, false again near the top or when scrolling up.
 * Pass `enabled={false}` to force it back to visible (e.g. desktop breakpoints).
 */
export function useHideOnScroll(enabled: boolean) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setHidden(false)
      return
    }
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current
      if (y < 24) {
        setHidden(false)
      } else if (delta > 8) {
        setHidden(true)
      } else if (delta < -8) {
        setHidden(false)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled])

  return hidden
}
