import { usePwaUpdate } from '@hooks/usePwaUpdate'

/** Shown when a new service worker is waiting. The user decides when to reload. */
export default function UpdateBanner() {
  const { needRefresh, apply } = usePwaUpdate()
  if (!needRefresh) return null
  return (
    <div className="pwa-update" role="status">
      <span>A new version is available.</span>
      <button type="button" className="btn" onClick={apply}>Refresh</button>
    </div>
  )
}
