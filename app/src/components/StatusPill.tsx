import type React from 'react'

type StatusVariant = 'active' | 'pending' | 'done' | 'cancelled' | 'assigned' | 'confirmed' | 'default'

function variantFrom(status: string): StatusVariant {
  const s = status.toLowerCase()
  if (s === 'active') return 'active'
  if (s === 'pending') return 'pending'
  if (s === 'completed' || s === 'done' || s === 'complete') return 'done'
  if (s === 'cancelled' || s === 'canceled') return 'cancelled'
  if (s === 'assigned') return 'assigned'
  if (s === 'confirmed') return 'confirmed'
  return 'default'
}

const LABELS: Record<StatusVariant, string> = {
  active: 'Active',
  pending: 'Pending',
  done: 'Done',
  cancelled: 'Cancelled',
  assigned: 'Assigned',
  confirmed: 'Confirmed',
  default: '',
}

interface StatusPillProps {
  status: string
  label?: string
  size?: 'sm' | 'md'
  style?: React.CSSProperties
  className?: string
}

export default function StatusPill({ status, label, size = 'sm', style, className }: StatusPillProps) {
  const v = variantFrom(status)
  const text = label ?? (LABELS[v] || (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()))
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '3px 8px' : '5px 12px',
        borderRadius: size === 'sm' ? 4 : 6,
        fontSize: size === 'sm' ? 10 : 12,
        fontWeight: 600,
        fontFamily: '"Work Sans", sans-serif',
        whiteSpace: 'nowrap',
        backgroundColor: `var(--bw-status-${v}-bg)`,
        color: `var(--bw-status-${v}-text)`,
        ...style,
      }}
    >
      {text}
    </span>
  )
}
