import { useEffect, useRef, useState } from 'react'
import { composeEmailToTenant, type AdminTenantRow } from '@api/admin'
import { CaretDown, CircleNotch, Envelope, PaperPlaneTilt, X } from '@phosphor-icons/react'
import { AxiosError } from 'axios'

const FROM_OPTIONS = [
  { alias: 'noreply', label: 'noreply — system / automated' },
  { alias: 'support', label: 'support — help & issues' },
  { alias: 'billing', label: 'billing — payments & invoices' },
  { alias: 'hello', label: 'hello — general outreach' },
  { alias: 'notifications', label: 'notifications — platform alerts' },
  { alias: 'onboarding', label: 'onboarding — setup & activation' },
  { alias: 'team', label: 'team — from the Maison team' },
]

async function errMessage(e: unknown): Promise<string> {
  if (e instanceof AxiosError) {
    const d = e.response?.data as { message?: string; error?: string; detail?: string } | undefined
    return d?.message || d?.error || d?.detail || e.message || 'Request failed'
  }
  if (e instanceof Error) return e.message
  return 'Something went wrong'
}

type Props = {
  tenants: AdminTenantRow[]
  onClose: () => void
}

export default function AdminComposeEmail({ tenants, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<AdminTenantRow | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [fromAlias, setFromAlias] = useState(FROM_OPTIONS[0].alias)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = query.trim()
    ? tenants.filter((t) => {
        const q = query.toLowerCase()
        return (
          t.email.toLowerCase().includes(q) ||
          (t.full_name || `${t.first_name} ${t.last_name}`).toLowerCase().includes(q)
        )
      })
    : tenants

  function pickTenant(t: AdminTenantRow) {
    setSelectedTenant(t)
    setQuery(t.email)
    setDropdownOpen(false)
    setNote(null)
  }

  function clearTenant() {
    setSelectedTenant(null)
    setQuery('')
    setNote(null)
    inputRef.current?.focus()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTenant || !subject.trim() || !body.trim()) return
    setBusy(true)
    setNote(null)
    try {
      const res = await composeEmailToTenant({
        to_tenant_id: selectedTenant.id,
        from_alias: fromAlias,
        subject: subject.trim(),
        body: body.trim(),
      })
      setNote({ ok: res.success !== false, text: res.message || `Email sent to ${selectedTenant.email}` })
      if (res.success !== false) {
        setSubject('')
        setBody('')
      }
    } catch (e) {
      setNote({ ok: false, text: await errMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  const canSend = Boolean(selectedTenant && subject.trim() && body.trim() && !busy)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-8 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#141a22] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h3 id="compose-title" className="flex items-center gap-2 text-base font-semibold text-white">
            <Envelope className="h-4 w-4 text-indigo-400" />
            Compose email
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-5 space-y-4">
          {/* To */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              To — tenant email
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedTenant(null)
                  setDropdownOpen(true)
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search by name or email…"
                autoComplete="off"
                className="w-full rounded-lg border border-white/10 bg-black/25 pl-3 pr-8 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <span className="absolute right-2.5 text-slate-500 pointer-events-none">
                {selectedTenant ? (
                  <button
                    type="button"
                    onClick={clearTenant}
                    className="pointer-events-auto text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <CaretDown className="h-3.5 w-3.5" />
                )}
              </span>
            </div>

            {dropdownOpen && filtered.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#1c2433] shadow-xl max-h-52 overflow-y-auto text-sm">
                {filtered.slice(0, 20).map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onMouseDown={() => pickTenant(t)}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
                    >
                      <span className="block text-slate-200 truncate">
                        {t.full_name || `${t.first_name} ${t.last_name}`.trim()}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">{t.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {dropdownOpen && query.trim() && filtered.length === 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#1c2433] px-3 py-3 text-sm text-slate-500">
                No tenants match "{query}"
              </div>
            )}
          </div>

          {/* From */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              From
            </label>
            <div className="relative">
              <select
                value={fromAlias}
                onChange={(e) => setFromAlias(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/10 bg-black/25 pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {FROM_OPTIONS.map((o) => (
                  <option key={o.alias} value={o.alias} className="bg-[#1c2433]">
                    {o.label}
                  </option>
                ))}
              </select>
              <CaretDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={7}
              placeholder="Write your message here…"
              className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
            />
          </div>

          {note && (
            <p className={`text-sm ${note.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
              {note.text}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-600/90 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              {busy ? <CircleNotch className="h-4 w-4 animate-spin" /> : <PaperPlaneTilt className="h-4 w-4" />}
              PaperPlaneTilt email
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
