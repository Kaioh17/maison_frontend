import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { loginAdmin } from '@api/auth'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '@utils/apiError'
import { EMAIL_FORMAT_HINT, getEmailFormatError, isValidEmail } from '@utils/emailValidation'
import AdminSubdomainGuard from '@components/AdminSubdomainGuard'

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname
      navigate(from && from !== '/login' ? from : '/operations', { replace: true })
    }
  }, [isAuthenticated, role, location.state, navigate])

  const emailErr = getEmailFormatError(email)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setBusy(true)
    try {
      const data = await loginAdmin(email, password)
      useAuthStore.getState().login({ token: data.access_token })
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname
      navigate(from && from !== '/login' ? from : '/operations', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Sign-in failed. Check your credentials.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0f14] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-[#11161d] shadow-xl shadow-black/40 p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/90 font-semibold">
          Maison admin
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Use your admin account. This page is only available on the admin host.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-white/10 bg-black/25 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            {emailErr && (
              <p className="text-xs text-rose-400/90 mt-1">{emailErr}</p>
            )}
            <p className="text-[11px] text-slate-600 mt-1">{EMAIL_FORMAT_HINT}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/25 pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.07] px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/35 bg-amber-500/15 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/25 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <AdminSubdomainGuard>
      <AdminLoginForm />
    </AdminSubdomainGuard>
  )
}
