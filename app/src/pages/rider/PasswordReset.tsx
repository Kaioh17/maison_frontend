import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { requestPasswordReset, resetPassword } from '@api/auth'
import Button from '@components/Button'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { getApiErrorMessage } from '@utils/apiError'
import { getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import AuthShell from './AuthShell'

type Role = 'rider' | 'driver'

const AREA: Record<Role, { login: string; forgot: string; label: string }> = {
  rider: { login: '/riders/login', forgot: '/riders/forgot-password', label: 'Rider' },
  driver: { login: '/driver/login', forgot: '/driver/forgot-password', label: 'Driver' },
}
const RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

/** "Forgot password" for riders and drivers, in the operator's branding (the page sits inside RiderBrandedShell). */
export function ForgotPasswordPage({ role }: { role: Role }) {
  const { slug } = useTenantInfo()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const back = <div className="rdr-auth-switch"><Link to={AREA[role].login}>Back to sign in</Link></div>

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) return setError('Please enter a valid email address.')
    setBusy(true)
    setError('')
    try {
      await requestPasswordReset(role, email.trim(), slug ?? undefined)
      setSent(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send the reset link. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell label={`${AREA[role].label} password reset`}>
      {sent ? (
        <div className="rdr-auth-form">
          <div>
            <h1 className="rdr-title">Check your email</h1>
            <p className="rdr-sub">If an account exists for <strong>{email}</strong>, a reset link is on its way.</p>
          </div>
          {back}
        </div>
      ) : (
        <form className="rdr-auth-form" onSubmit={submit} noValidate>
          <div>
            <h1 className="rdr-title">Reset password</h1>
            <p className="rdr-sub">Enter your email and we will send you a reset link.</p>
          </div>
          <div className="rdr-field">
            <label className="rdr-field-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="rdr-input" autoComplete="email" required placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!email && !!getEmailFormatError(email)} />
          </div>
          {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
          <Button type="submit" fullWidth disabled={busy} style={{ minHeight: 52, fontSize: 15 }}>{busy ? 'Sending…' : 'Send reset link'}</Button>
          {back}
        </form>
      )}
    </AuthShell>
  )
}

/** Landing page of the emailed link: `?token=...` */
export function ResetPasswordPage({ role }: { role: Role }) {
  const token = useSearchParams()[0].get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!RULE.test(password)) return setError('Use at least 8 characters with an uppercase letter, a lowercase letter and a number.')
    if (password !== confirm) return setError('The two passwords do not match.')
    setBusy(true)
    setError('')
    try {
      await resetPassword(role, token, password)
      setDone(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset your password. Please request a new link.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell label={`${AREA[role].label} new password`}>
      {done ? (
        <div className="rdr-auth-form">
          <div>
            <h1 className="rdr-title">Password updated</h1>
            <p className="rdr-sub">You can sign in with your new password.</p>
          </div>
          <Link className="btn btn-primary btn-block" to={AREA[role].login} style={{ minHeight: 52, fontSize: 15 }}>Sign in</Link>
        </div>
      ) : !token ? (
        <div className="rdr-auth-form">
          <div>
            <h1 className="rdr-title">Link not valid</h1>
            <p className="rdr-sub">This reset link is incomplete. <Link to={AREA[role].forgot} style={{ textDecoration: 'underline' }}>Request a new one</Link>.</p>
          </div>
        </div>
      ) : (
        <form className="rdr-auth-form" onSubmit={submit} noValidate>
          <div>
            <h1 className="rdr-title">New password</h1>
            <p className="rdr-sub">Choose a password for your account.</p>
          </div>
          <div className="rdr-auth-fields">
            <div className="rdr-field">
              <div className="rdr-field-head">
                <label htmlFor="new-password">New password</label>
                <button type="button" className="rdr-field-toggle" onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Show'}</button>
              </div>
              <input id="new-password" type={show ? 'text' : 'password'} className="rdr-input" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} />
              <div className="rdr-field-note">At least 8 characters, with an uppercase letter, a lowercase letter and a number.</div>
            </div>
            <div className="rdr-field">
              <label className="rdr-field-label" htmlFor="confirm-password">Confirm password</label>
              <input id="confirm-password" type={show ? 'text' : 'password'} className="rdr-input" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>
          </div>
          {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
          <Button type="submit" fullWidth disabled={busy} style={{ minHeight: 52, fontSize: 15 }}>{busy ? 'Saving…' : 'Update password'}</Button>
        </form>
      )}
    </AuthShell>
  )
}
