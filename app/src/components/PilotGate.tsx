import { useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { SignOut, Warning } from '@phosphor-icons/react'
import { acceptLegal, getLegalStatus } from '@api/legal'
import { useAuthStore } from '@store/auth'
import { getApiErrorMessage } from '@utils/apiError'
import { CONTACT_EMAIL, LEGAL_VERSION } from '../constants/legal'
import Button from '@components/Button'
import LegalConsent from '@components/LegalConsent'

export const LEGAL_STATUS_KEY = ['legal', 'status']

export function useLegalStatus() {
  return useQuery({ queryKey: LEGAL_STATUS_KEY, queryFn: getLegalStatus, staleTime: 5 * 60_000 })
}

export const formatPilotEnd = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null

/**
 * Blocks the operator dashboard when the pilot has ended or when the legal documents changed
 * since the operator last accepted. Not dismissible: accept (re-consent) or log out.
 * Only an explicit server answer gates, so a failed status request never locks anyone out.
 */
export default function PilotGate({ children }: { children: ReactNode }) {
  const logout = useAuthStore((s) => s.logout)
  const qc = useQueryClient()
  const { data } = useLegalStatus()
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const expired = data?.expired === true
  const needsConsent = !expired && data?.accepted === false
  const gated = expired || needsConsent

  const accept = async () => {
    setBusy(true)
    setError(null)
    try {
      qc.setQueryData(LEGAL_STATUS_KEY, await acceptLegal(LEGAL_VERSION))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not record your acceptance. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div style={{ display: 'contents' }} {...(gated ? { inert: '' } : {})}>
        {children}
      </div>
      {gated && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pilot-gate-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'color-mix(in srgb, var(--bw-bg) 60%, transparent)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            fontFamily: '"Work Sans", sans-serif',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border-strong)',
              borderRadius: 16,
              padding: 'clamp(20px, 4vw, 32px)',
              color: 'var(--bw-text)',
            }}
          >
            <h2 id="pilot-gate-title" style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Warning size={22} weight="fill" style={{ color: 'var(--bw-warning)', flexShrink: 0 }} aria-hidden />
              {expired ? 'Your pilot has ended' : 'Our terms were updated'}
            </h2>
            {expired ? (
              <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--bw-muted)' }}>
                Your Maison pilot ended on {formatPilotEnd(data?.pilot_ends_at ?? null)}. To continue using Maison, or to request a copy of
                your data, email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>.
              </p>
            ) : (
              <>
                <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: 'var(--bw-muted)' }}>
                  Please review and accept the updated documents to keep using Maison.
                </p>
                <LegalConsent checked={checked} onChange={setChecked} />
                {error && <div role="alert" style={{ marginTop: 12, color: 'var(--bw-error)', fontSize: 14 }}>{error}</div>}
                <Button onClick={accept} disabled={!checked || busy} fullWidth style={{ marginTop: 20 }}>
                  {busy ? 'Saving...' : 'Accept and continue'}
                </Button>
              </>
            )}
            <Button variant="ghost" fullWidth onClick={logout} style={{ marginTop: 12 }}>
              <SignOut size={16} aria-hidden /> Log out
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

/** Sidebar chip: pilot status at a glance, links to the Legal and pilot settings page. */
export function PilotBadge({ onClick }: { onClick: () => void }) {
  const { data } = useLegalStatus()
  if (!data) return null
  const label = data.days_left === null ? 'Pilot version' : `Pilot version · ${data.days_left} day${data.days_left === 1 ? '' : 's'} left`
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '8px 10px',
        border: '1px solid var(--bw-warning)',
        borderRadius: 8,
        background: 'transparent',
        color: 'var(--bw-text)',
        fontFamily: '"Work Sans", sans-serif',
        fontSize: 12,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  )
}
