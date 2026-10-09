import { useEffect, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginRider } from '@api/auth'
import { createUser } from '@api/user'
import Button from '@components/Button'
import CityAutocomplete from '@components/CityAutocomplete'
import CountryAutocomplete from '@components/CountryAutocomplete'
import StateAutocomplete from '@components/StateAutocomplete'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useAuthStore } from '@store/auth'
import { getApiErrorMessage } from '@utils/apiError'
import { getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import { formatPasswordPolicySentence, getPasswordPolicyFailures, PASSWORD_POLICY_HINT } from '@utils/passwordPolicy'
import AuthShell from './AuthShell'

const EMPTY = { email: '', password: '', first_name: '', last_name: '', phone_no: '', address: '', city: '', state: '', country: '', postal_code: '' }

// The autocompletes style their own input inline; this makes them match `.rdr-input`.
const FIELD: CSSProperties = { height: 50, padding: '0 14px', borderRadius: 12, border: '1px solid var(--bw-border)', backgroundColor: 'var(--bw-bg-secondary)', fontSize: 15 }

const formatPhone = (value: string) => {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}
const optional = (v: string) => v.trim() || null

export default function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuthStore()
  const { tenantInfo, isLoading: tenantLoading, slug } = useTenantInfo()
  const [form, setForm] = useState(EMPTY)
  const [withAddress, setWithAddress] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const signedIn = isAuthenticated && role === 'rider'

  useEffect(() => { if (signedIn) navigate('/rider/dashboard', { replace: true }) }, [signedIn, navigate])
  if (signedIn) return null

  const patch = (p: Partial<typeof EMPTY>) => setForm(f => ({ ...f, ...p }))
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    patch({ [name]: name === 'phone_no' ? formatPhone(value) : value })
  }
  const company = tenantInfo?.company_name?.trim() || 'us'
  const emailError = form.email ? getEmailFormatError(form.email) : null

  const validate = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return 'Please enter your first and last name.'
    if (!isValidEmail(form.email)) return 'Please enter a valid email address.'
    if (form.phone_no.replace(/\D/g, '').length < 10) return 'Please enter a valid 10-digit phone number.'
    if (!form.password.trim()) return 'Please choose a password.'
    const failures = getPasswordPolicyFailures(form.password)
    return failures.length ? formatPasswordPolicySentence(failures) : ''
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (tenantLoading) return setError('Loading tenant information...')
    if (!slug) return setError('Tenant information is required. Please open this page from your operator\'s address.')
    const problem = validate()
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      await createUser(slug, {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone_no: form.phone_no.replace(/\D/g, ''),
        address: withAddress ? optional(form.address) : null,
        city: withAddress ? optional(form.city) : null,
        state: withAddress ? optional(form.state) : null,
        country: withAddress ? optional(form.country) : null,
        postal_code: withAddress ? optional(form.postal_code) : null,
        password: form.password,
      })
      const data = await loginRider(form.email, form.password)
      useAuthStore.getState().login({ token: data.access_token })
      navigate('/riders/profile', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const input = (name: keyof typeof EMPTY, label: string, props: Record<string, unknown> = {}) => (
    <label className="rdr-field">
      <span>{label}</span>
      <input name={name} className="rdr-input" value={form[name]} onChange={onChange} {...props} />
    </label>
  )

  return (
    <AuthShell label="Rider sign up">
      <form className="rdr-auth-form" onSubmit={submit} noValidate>
        <div>
          <h1 className="rdr-title">Create your account</h1>
          <p className="rdr-sub">Ride with {company} in under a minute.</p>
        </div>
        <div className="rdr-auth-fields">
          <div className="rdr-grid-2">
            {input('first_name', 'First name', { autoComplete: 'given-name', required: true, placeholder: 'Hann' })}
            {input('last_name', 'Last name', { autoComplete: 'family-name', required: true, placeholder: 'Jordan' })}
          </div>
          <div className="rdr-field">
            <label className="rdr-field-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="rdr-input" autoComplete="email" required placeholder="you@email.com" value={form.email} onChange={onChange} aria-invalid={!!emailError} aria-describedby={emailError ? 'email-error' : undefined} />
            {emailError && <div id="email-error" className="rdr-field-note is-error" role="alert">{emailError}</div>}
          </div>
          {input('phone_no', 'Phone', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', required: true, placeholder: '(555) 555-5555' })}
          <div className="rdr-field">
            <div className="rdr-field-head">
              <label htmlFor="password">Password</label>
              <button type="button" className="rdr-field-toggle" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="rdr-input" autoComplete="new-password" required placeholder="••••••••" value={form.password} onChange={onChange} aria-describedby="password-hint" />
            <div id="password-hint" className="rdr-field-note">{PASSWORD_POLICY_HINT}</div>
          </div>

          <label className="rdr-check">
            <input type="checkbox" checked={withAddress} onChange={e => { setWithAddress(e.target.checked); if (!e.target.checked) patch({ address: '', city: '', state: '', country: '', postal_code: '' }) }} />
            Add a pickup address now (optional)
          </label>

          {withAddress && (
            <>
              {input('address', 'Address', { autoComplete: 'street-address', placeholder: '123 Main St' })}
              <div className="rdr-grid-2">
                <label className="rdr-field"><span>City</span><CityAutocomplete value={form.city} onChange={city => patch({ city })} selectedState={form.state} placeholder="New York" className="rdr-input" style={FIELD} /></label>
                <label className="rdr-field"><span>State</span><StateAutocomplete value={form.state} onChange={state => patch({ state, city: '' })} placeholder="NY" className="rdr-input" style={FIELD} /></label>
              </div>
              <div className="rdr-grid-2">
                <label className="rdr-field"><span>Country</span><CountryAutocomplete value={form.country} onChange={country => patch({ country })} placeholder="USA" className="rdr-input" style={FIELD} /></label>
                {input('postal_code', 'Postal code', { autoComplete: 'postal-code', maxLength: 10, placeholder: '10001' })}
              </div>
            </>
          )}
        </div>
        {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
        <Button type="submit" fullWidth disabled={busy} style={{ minHeight: 52, fontSize: 15 }}>{busy ? 'Creating…' : 'Create account'}</Button>
        <div className="rdr-auth-switch">Already have an account? <Link to="/riders/login">Sign in</Link></div>
      </form>
    </AuthShell>
  )
}
