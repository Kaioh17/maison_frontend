import type { ReactNode } from 'react'

/**
 * Greys out UI for a feature Maison does not have a backend for yet.
 * Children are inert (no pointer events, hidden from assistive tech focus via `inert`)
 * and a "Not connected" tag is shown next to the label.
 */
export default function ComingSoon({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div>
      {label !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--bw-text)' }}>
          {label}
          <span className="bw-soon-tag">Not connected</span>
        </div>
      )}
      <div className="bw-soon" aria-disabled="true" {...({ inert: '' } as object)}>
        {children}
      </div>
    </div>
  )
}
