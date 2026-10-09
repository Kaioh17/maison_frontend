import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRider } from '@api/auth'
import { useDemoCredentials } from '@api/demo'
import Button from '@components/Button'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useAuthStore } from '@store/auth'
import { getApiErrorMessage } from '@utils/apiError'
import { getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import AuthShell from './AuthShell'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()
  const { tenantInfo, slug } = useTenantInfo()
  const demo = useDemoCredentials('rider', slug)
  // Demo credentials arrive asynchronously; whatever the rider types takes over from them.
  const [typed, setTyped] = useState<{ email: string; password: string } | null>(null)
  const form = typed ?? demo ?? { email: '', password: '' }
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const signedIn = isAuthenticated && role === 'rider'

  useEffect(() => { if (signedIn) navigate('/rider/dashboard', { replace: true }) }, [signedIn, navigate])
  if (signedIn) return null

  const onChange = (e: ChangeEvent<HTMLInputElement>) => setTyped({ ...form, [e.target.name]: e.target.value })
  const emailError = form.email ? getEmailFormatError(form.email) : null
  const company = tenantInfo?.company_name?.trim() || 'this service'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValidEmail(form.email)) return setError('Please enter a valid email address.')
    setBusy(true)
    try {
      const data = await loginRider(form.email, form.password)
      useAuthStore.getState().login({ token: data.access_token })
      navigate('/rider/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell label="Rider sign in">
      <form className="rdr-auth-form" onSubmit={submit} noValidate>
        <div>
          <h1 className="rdr-title">Welcome back</h1>
          <p className="rdr-sub">Sign in to book and manage your rides.</p>
        </div>
        <div className="rdr-auth-fields">
          <div className="rdr-field">
            <label className="rdr-field-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="rdr-input" autoComplete="email" required placeholder="you@email.com" value={form.email} onChange={onChange} aria-invalid={!!emailError} aria-describedby={emailError ? 'email-error' : undefined} />
            {emailError && <div id="email-error" className="rdr-field-note is-error" role="alert">{emailError}</div>}
          </div>
          <div className="rdr-field">
            <div className="rdr-field-head">
              <label htmlFor="password">Password</label>
              <button type="button" className="rdr-field-toggle" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="rdr-input" autoComplete="current-password" required placeholder="••••••••" value={form.password} onChange={onChange} />
            <Link className="rdr-field-toggle" to="/riders/forgot-password" style={{ alignSelf: 'flex-end' }}>Forgot password?</Link>
          </div>
        </div>
        {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
        <Button type="submit" fullWidth disabled={busy} style={{ minHeight: 52, fontSize: 15 }}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <div className="rdr-auth-switch">New to {company}? <Link to="/riders/register">Create an account</Link></div>
      </form>
    </AuthShell>
  )
}
