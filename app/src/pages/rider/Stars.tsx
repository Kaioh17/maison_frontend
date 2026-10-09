import { useId } from 'react'

const STAR = 'M12 2.35l2.96 6 6.62.96-4.79 4.67 1.13 6.59L12 17.45 6.08 20.57l1.13-6.59L2.42 9.31l6.62-.96L12 2.35z'

/** `fill` is 0, 50 or 100: empty, half, or full star. */
export function starFill(value: number, index: number): number {
  if (value >= index) return 100
  if (value >= index - 0.5) return 50
  return 0
}

export function Star({ fill, size = 30 }: { fill: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fill}%`} style={{ stopColor: 'var(--bw-warning)' }} />
          <stop offset={`${fill}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={STAR} fill={`url(#${id})`} strokeWidth="1.45" strokeLinejoin="round" style={{ stroke: fill > 0 ? 'var(--bw-warning)' : 'var(--bw-border-strong)' }} />
    </svg>
  )
}
