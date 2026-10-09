import { CONTACT_EMAIL, PILOT_DAYS } from '../constants/legal'

/** Callout shown at the top of every legal document. */
export default function PilotNotice() {
  return (
    <div
      role="note"
      style={{
        margin: '0 0 32px',
        padding: '16px 18px',
        border: '1px solid var(--bw-warning)',
        borderRadius: 12,
        background: 'var(--bw-bg-secondary)',
        fontFamily: 'Work Sans, sans-serif',
        fontSize: 14,
        lineHeight: 1.65,
        color: 'var(--bw-text)',
      }}
    >
      <strong>Pilot version.</strong> Maison is currently a {PILOT_DAYS}-day pilot (the Founding Operators Program). It is
      offered so operators can try the workflow, test it with their drivers and riders, and give feedback. It is provided
      as is, may change or be interrupted, and should not be your only system for live commercial operations. Questions:{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--bw-text)', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
    </div>
  )
}
