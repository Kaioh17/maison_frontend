import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, PILOT_DAYS } from '../../constants/legal'
import { formatPilotEnd, useLegalStatus } from '@components/PilotGate'

const card = {
  backgroundColor: 'var(--bw-bg-secondary)',
  border: '1px solid var(--bw-border)',
  borderRadius: 'clamp(8px, 1.5vw, 12px)',
  padding: 'clamp(16px, 2.5vw, 24px)',
  marginBottom: 'clamp(16px, 2vw, 20px)',
  fontFamily: '"Work Sans", sans-serif',
  color: 'var(--bw-text)',
  lineHeight: 1.6,
} as const
const link = { color: 'var(--bw-text)', textDecoration: 'underline' } as const

export default function LegalPilot() {
  const { data } = useLegalStatus()
  return (
    <div>
      <h1 style={{ margin: '0 0 clamp(16px, 2vw, 20px)', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
        Legal and pilot
      </h1>
      <section style={card}>
        <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 500 }}>Pilot program</h2>
        <p style={{ margin: 0, fontSize: 14 }}>
          Maison is a {PILOT_DAYS}-day pilot (the Founding Operators Program) for trying the workflow, testing with your drivers and
          riders, and giving feedback.
          {data?.pilot_ends_at && (
            <> Your pilot ends on <strong>{formatPilotEnd(data.pilot_ends_at)}</strong> ({data.days_left} day{data.days_left === 1 ? '' : 's'} left).</>
          )}
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          Feedback and data requests: <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a>
        </p>
      </section>
      <section style={card}>
        <h2 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 500 }}>Legal documents</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
          <li><Link to="/terms" target="_blank" rel="noopener noreferrer" style={link}>Terms of Service</Link></li>
          <li><Link to="/privacy" target="_blank" rel="noopener noreferrer" style={link}>Privacy Policy</Link></li>
          <li><Link to="/subprocessors" target="_blank" rel="noopener noreferrer" style={link}>Subprocessors</Link></li>
        </ul>
        {data && <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--bw-muted)' }}>Version {data.current_version}{data.accepted ? ' (accepted)' : ''}</p>}
      </section>
    </div>
  )
}
