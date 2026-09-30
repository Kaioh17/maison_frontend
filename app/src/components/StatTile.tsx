export interface StatTileProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  /** Makes the tile a button (navigates / filters) */
  onClick?: () => void
}

/** KPI tile (`.bw-stat`). Renders a <button> when clickable so it is keyboard reachable. */
export default function StatTile({ label, value, sub, onClick }: StatTileProps) {
  const body = (
    <>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub !== undefined && <span className="kpi-sub">{sub}</span>}
    </>
  )
  return onClick ? (
    <button type="button" className="kpi" onClick={onClick}>{body}</button>
  ) : (
    <div className="kpi">{body}</div>
  )
}
