import type { CSSProperties, HTMLAttributes } from 'react'
import wordmarkUrl from '../images/maison_wordmark.png'

export type MaisonWordmarkProps = {
  className?: string
  style?: CSSProperties
  /** Logo color. Defaults to `var(--bw-fg)` for tenant shell. Pass `null` to inherit `currentColor` from the parent. */
  color?: string | null
} & Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'children'>

/**
 * Maison wordmark (with the pin "i"). The PNG is used as an alpha mask so one asset takes any color.
 * Sized by `font-size` (height 1.3em) so it drops in wherever the text wordmark used to be.
 */
export default function MaisonWordmark({
  className,
  style,
  color = 'var(--bw-fg)',
  ...rest
}: MaisonWordmarkProps) {
  const mask = `url(${wordmarkUrl}) center / contain no-repeat`
  return (
    <span
      role="img"
      aria-label="Maison"
      className={className}
      style={{
        display: 'inline-block',
        height: '1.3em',
        aspectRatio: '388 / 127',
        verticalAlign: '-0.05em', // letter baseline sits slightly above the image bottom
        backgroundColor: color ?? 'currentColor',
        WebkitMask: mask,
        mask,
        ...style,
      }}
      {...rest}
    />
  )
}
