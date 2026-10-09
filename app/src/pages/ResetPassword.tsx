import React, { useState } from 'react'
import { ArrowLeft, Lock } from '@phosphor-icons/react'
import { Link, useSearchParams } from 'react-router-dom'
import MaisonWordmark from '@components/MaisonWordmark'
import { resetPassword } from '@api/auth'
import { getApiErrorMessage } from '@utils/apiError'

const RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

/** Landing page of the emailed reset link: /reset-password?token=... */
export default function ResetPassword() {
  const token = useSearchParams()[0].get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!RULE.test(password)) return setError('Use at least 8 characters with an uppercase letter, a lowercase letter and a number.')
    if (password !== confirm) return setError('The two passwords do not match.')
    setBusy(true)
    setError('')
    try {
      await resetPassword('tenant', token, password)
      setDone(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset your password. Please request a new link.'))
    } finally {
      setBusy(false)
    }
  }

  const heading = { margin: '0 0 8px 0', fontSize: 32, fontFamily: 'DM Sans, sans-serif', fontWeight: 200, textAlign: 'center' } as const
  const input = { padding: '14px 16px 14px 42px', borderRadius: 'var(--radius-field)', fontFamily: 'Work Sans, sans-serif', width: '100%', boxSizing: 'border-box' } as const
  const back = (
    <Link to="/tenant/login" style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', textDecoration: 'none' }}>
      <ArrowLeft size={14} />
      Back to sign in
    </Link>
  )

  return (
    <main className="bw" aria-label="Choose a new password" style={{ margin: 0, minHeight: 'var(--app-h)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bw-bg)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 40 }}><MaisonWordmark color={null} style={{ fontSize: '1.85rem' }} /></div>

        {done ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={heading}>Password updated</h1>
            <p className="small-muted" style={{ fontSize: 15, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, lineHeight: 1.6 }}>You can sign in with your new password.</p>
            {back}
          </div>
        ) : !token ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={heading}>Link not valid</h1>
            <p className="small-muted" style={{ fontSize: 15, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, lineHeight: 1.6 }}>
              This reset link is incomplete. <Link to="/forgot-password" style={{ textDecoration: 'underline' }}>Request a new one</Link>.
            </p>
          </div>
        ) : (
          <>
            <h1 style={heading}>New password</h1>
            <p className="small-muted" style={{ marginTop: 0, marginBottom: 28, fontSize: 15, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, textAlign: 'center', lineHeight: 1.5 }}>
              Choose a password for your operator account.
            </p>
            <form onSubmit={submit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['new-password', 'New password', password, setPassword], ['confirm-password', 'Confirm password', confirm, setConfirm]].map(([id, label, value, set]) => (
                <div key={id as string}>
                  <label className="small-muted" htmlFor={id as string} style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 13, display: 'block', marginBottom: 6 }}>{label as string}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input id={id as string} type="password" required autoComplete="new-password" className="bw-input" value={value as string} onChange={e => (set as (v: string) => void)(e.target.value)} style={input} />
                  </div>
                </div>
              ))}
              {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
              <button type="submit" disabled={busy} className="bw-btn" style={{ width: '100%', borderRadius: 'var(--radius-field)', padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500, backgroundColor: 'var(--bw-accent)', color: '#ffffff', border: '1px solid var(--bw-accent)' }}>
                {busy ? 'Saving…' : 'Update password'}
              </button>
            </form>
            {back}
          </>
        )}
      </div>
    </main>
  )
}
