import { useId } from 'react'
import { PILOT_DAYS } from '../constants/legal'

const linkStyle = { color: 'inherit', textDecoration: 'underline' } as const

/** Clickwrap checkbox: agreement to the legal documents plus acknowledgement of the pilot. Links open in a new tab so the form is not lost. */
export default function LegalConsent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId()
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 16, textAlign: 'left' }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--bw-text)' }}
      />
      <label htmlFor={id} className="small-muted" style={{ fontSize: 12, lineHeight: 1.6 }}>
        I have read and agree to the{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={linkStyle}>Terms of Service</a>,{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Privacy Policy</a> and{' '}
        <a href="/subprocessors" target="_blank" rel="noopener noreferrer" style={linkStyle}>Subprocessors</a>. I understand
        Maison is a {PILOT_DAYS}-day pilot for trying the workflow, testing with drivers and riders, and giving feedback. It is
        provided as is and may change or be interrupted.
      </label>
    </div>
  )
}
