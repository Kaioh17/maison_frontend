import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Loader2, Lock, Mail, User } from 'lucide-react'
import { createAdminAccount, type CreateAdminAccountData } from '@api/admin'
import { AUTH_API_KEY } from '@config'
import { getApiErrorMessage } from '@utils/apiError'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import AdminSubdomainGuard from '@components/AdminSubdomainGuard'

function AdminCreateAccountForm() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<CreateAdminAccountData | null>(null)

  const emailErr = getEmailFormatError(email)
  const hasApiKey = Boolean(AUTH_API_KEY)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!hasApiKey) {
      setError('Configure VITE_API_KEY so requests include X-API-Key.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      const res = await createAdminAccount({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      })
      if (res.success === false && res.message) {
        setError(res.message)
        return
      }
      if (res.data) {
        setCreated(res.data)
        setPassword('')
      } else {
        setError('Unexpected response from server.')
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Could not create admin account.'))
    } finally {
      setBusy(false)
    }
  }

  if (created) {
    return (
      <div className="min-h-screen bg-[#0c0f14] flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px] rounded-2xl border border-emerald-500/25 bg-[#11161d] shadow-xl shadow-black/40 p-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500/90 font-semibold">
            Account created
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">Welcome, {created.first_name}</h1>
          <p className="text-sm text-slate-400 mt-2">
            {created.email}
          </p>
          <p className="text-xs text-slate-500 mt-4">
            You can sign in from the admin login page.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/25 transition-colors"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0f14] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-[#11161d] shadow-xl shadow-black/40 p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/90 font-semibold">
          Bootstrap
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">Create admin account</h1>
        <p className="text-sm text-slate-500 mt-1">
          This URL is not linked in the app. Use only with your API key configured.
        </p>

        {!hasApiKey && (
          <div className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/[0.07] px-3 py-2 text-xs text-rose-200 flex gap-2 items-start">
            <KeyRound className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Set <code className="text-rose-100/90">VITE_API_KEY</code> in{' '}
              <code className="text-rose-100/90">.env</code> so the request sends{' '}
              <code className="text-rose-100/90">X-API-Key</code>.
            </span>
          </div>
        )}

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/25 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            {emailErr && <p className="text-xs text-rose-400/90 mt-1">{emailErr}</p>}
            <p className="text-[11px] text-slate-600 mt-1">{EMAIL_FORMAT_HINT}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">First name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name="first_name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/25 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Last name</label>
              <input
                type="text"
                name="last_name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/25 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <p className="text-[11px] text-slate-600 mt-1">At least 8 characters.</p>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.07] px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !hasApiKey}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/35 bg-amber-500/15 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/25 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create account
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          <Link to="/login" className="text-amber-500/80 hover:text-amber-400">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function AdminCreateAccount() {
  return (
    <AdminSubdomainGuard>
      <AdminCreateAccountForm />
    </AdminSubdomainGuard>
  )
}
