import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { WarningOctagon } from '@phosphor-icons/react'
import Button from '@components/Button'
import Modal from '@components/Modal'
import { requestDriverDeletion, deleteDriver, type DriverDeletionRequest } from '@api/tenant'
import { getApiErrorMessage } from '@utils/apiError'

type Props = {
  driver: { id: number; first_name: string; last_name: string; email: string }
  onClose: () => void
}

/**
 * Permanent driver deletion, 3 screens: server warnings -> retype email + acknowledge -> done.
 * The server issues the token, builds the warnings and validates every flag; nothing here is trusted.
 */
export default function DeleteDriverModal({ driver, onClose }: Props) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'loading' | 'warnings' | 'confirm' | 'done'>('loading')
  const [req, setReq] = useState<DriverDeletionRequest | null>(null)
  const [email, setEmail] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    requestDriverDeletion(driver.id)
      .then((res) => { if (live) { setReq(res.data); setStep('warnings') } })
      .catch((e) => { if (live) { setError(getApiErrorMessage(e, 'Could not start deletion. Please try again.')); setStep('warnings') } })
    return () => { live = false }
  }, [driver.id])

  const submit = async () => {
    if (!req) return
    setBusy(true)
    setError(null)
    try {
      await deleteDriver(driver.id, { confirmation_token: req.confirmation_token, confirm_email: email.trim(), acknowledge_permanent: acknowledged })
      await queryClient.invalidateQueries({ queryKey: ['tenant', 'drivers'] })
      setStep('done')
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to delete driver. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = acknowledged && email.trim().toLowerCase() === driver.email.toLowerCase() && !busy
  const name = `${driver.first_name} ${driver.last_name}`

  const footer = step === 'done' ? (
    <Button onClick={onClose}>Close</Button>
  ) : step === 'confirm' ? (
    <>
      <Button variant="secondary" onClick={() => { setError(null); setStep('warnings') }} disabled={busy}>Back</Button>
      <Button variant="destructive" onClick={submit} disabled={!canSubmit}>{busy ? 'Deleting…' : 'Delete permanently'}</Button>
    </>
  ) : (
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="destructive" onClick={() => { setError(null); setStep('confirm') }} disabled={!req}>Continue</Button>
    </>
  )

  return (
    <Modal title={step === 'done' ? 'Driver deleted' : `Delete ${name}?`} width={520} onClose={onClose} footer={step === 'loading' ? undefined : footer}>
      {step === 'loading' && <div style={{ color: 'var(--bw-muted)' }}>Checking whether this driver can be deleted…</div>}

      {step === 'warnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--bw-error)', fontWeight: 600 }}>
            <WarningOctagon size={22} weight="fill" aria-hidden />
            Step 1 of 2: this action is permanent and cannot be undone.
          </div>
          {req?.warnings.length ? (
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--bw-text)', fontSize: 14 }}>
              {req.warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          ) : null}
          {error && <div role="alert" className="bw-notice bw-notice-err" style={{ margin: 0 }}>{error}</div>}
        </div>
      )}

      {step === 'confirm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ color: 'var(--bw-error)', fontWeight: 600 }}>Step 2 of 2: final confirmation. Deleted drivers cannot be restored.</div>
          <label className="bw-field">
            <span className="bw-field-label">Type the driver&apos;s email ({driver.email}) to confirm</span>
            <input className="bw-input" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--bw-text)' }}>
            <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} style={{ marginTop: 3 }} />
            I understand this deletion is permanent and cannot be undone.
          </label>
          {error && <div role="alert" className="bw-notice bw-notice-err" style={{ margin: 0 }}>{error}</div>}
        </div>
      )}

      {step === 'done' && <div style={{ color: 'var(--bw-text)' }}>{name} has been permanently deleted.</div>}
    </Modal>
  )
}
