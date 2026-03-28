import type { CSSProperties, HTMLAttributes } from 'react'

export type MaisonWordmarkProps = {
  className?: string
  style?: CSSProperties
  /** Text color. Defaults to `var(--bw-fg)` for tenant shell. Pass `null` to omit (parent/CSS sets color, e.g. landing nav). */
  color?: string | null
} & Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'children'>

/**
 * Poppins wordmark — same treatment as tenant login/signup (weight 500, tight tracking).
 */
export default function MaisonWordmark({
  className,
  style,
  color = 'var(--bw-fg)',
  ...rest
}: MaisonWordmarkProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 500,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        ...(color === null ? {} : { color: color ?? 'var(--bw-fg)' }),
        ...style,
      }}
      aria-label="Maison"
      {...rest}
    >
      Maison
    </span>
  )
}
