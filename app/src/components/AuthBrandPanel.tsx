import { Link } from 'react-router-dom'
import MaisonWordmark from '@components/MaisonWordmark'
import AuthHeroImages from '@components/AuthHeroImages'

type AuthBrandPanelProps = {
  headline: string
  accent: string
  lead: string
  /** Logo row only (no photo or copy) - for full-width steps like plan selection. */
  compact?: boolean
}

/** Left column of the landing-styled auth pages: one photo card with the logo and headline on it (see `pages/landing-auth.css`). */
export default function AuthBrandPanel({ headline, accent, lead, compact = false }: AuthBrandPanelProps) {
  return (
    <div className={`landing-auth-brand${compact ? ' landing-auth-brand--compact' : ''}`}>
      {!compact && <AuthHeroImages />}
      <Link to="/" className="landing-auth-brand__logo" aria-label="Maison home">
        <MaisonWordmark color="var(--landing-fg)" style={{ fontSize: '2.25rem' }} />
      </Link>
      {!compact && (
        <div className="landing-auth-brand__copy">
          <span className="landing-eyebrow">For independent operators</span>
          <h2 className="landing-h2">
            {headline}
            <br />
            <span className="landing-accent-text">{accent}</span>
          </h2>
          <p className="landing-lead">{lead}</p>
        </div>
      )}
    </div>
  )
}
