import type React from 'react'

/** Shimmering placeholder block. Sized by the caller; shimmer comes from .bw-skeleton in styles.css. */
export function Skeleton({ width, height, radius = 8, style }: {
  width?: number | string
  height?: number | string
  radius?: number | string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="bw-skeleton"
      aria-hidden
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

function SkeletonStatTile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderRadius: 16, backgroundColor: 'var(--bw-bg-secondary)' }}>
      <Skeleton width={20} height={20} radius={6} />
      <Skeleton width="55%" height={26} />
      <Skeleton width="75%" height={12} />
    </div>
  )
}

function SkeletonListRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
      <Skeleton width={40} height={40} radius={999} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width="60%" height={13} />
        <Skeleton width="40%" height={11} />
      </div>
      <Skeleton width={56} height={20} radius={999} />
    </div>
  )
}

/** Shaped placeholder for the tenant dashboard: hero card, stat tiles, recent list. */
export function TenantDashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      style={{ width: '100%', maxWidth: 960, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width={160} height={20} />
          <Skeleton width={110} height={12} />
        </div>
        <Skeleton width={40} height={40} radius={999} />
      </div>
      <div style={{ padding: 20, borderRadius: 16, backgroundColor: 'var(--bw-bg-secondary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton width={120} height={12} />
        <Skeleton width="45%" height={34} />
        <Skeleton width={90} height={12} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <SkeletonStatTile />
        <SkeletonStatTile />
        <SkeletonStatTile />
        <SkeletonStatTile />
      </div>
      <div style={{ borderRadius: 16, backgroundColor: 'var(--bw-bg-secondary)', padding: '8px 0' }}>
        <SkeletonListRow />
        <SkeletonListRow />
        <SkeletonListRow />
        <SkeletonListRow />
        <SkeletonListRow />
      </div>
    </div>
  )
}

export default Skeleton
