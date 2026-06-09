import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getAdminTenantDetail,
  sendStripeCompletionReminder,
  type AdminTenantDetail,
} from '@api/admin'
import { AUTH_API_KEY } from '@config'
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  Car,
  CreditCard,
  KeyRound,
  Loader2,
  Mail,
  Palette,
  Receipt,
  Settings as SettingsIcon,
  Tags,
  User,
  Users,
} from 'lucide-react'
import { AxiosError } from 'axios'

async function errMessage(e: unknown): Promise<string> {
  if (e instanceof AxiosError) {
    const d = e.response?.data as { message?: string; error?: string; detail?: string } | undefined
    return d?.message || d?.error || d?.detail || e.message || 'Request failed'
  }
  if (e instanceof Error) return e.message
  return 'Something went wrong'
}

/** Humanize snake_case keys for labels. */
function label(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

/** A key/value grid for a single record (object), skipping nothing so admins see everything. */
function RecordGrid({ record }: { record: Record<string, unknown> }) {
  const entries = Object.entries(record)
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No data.</p>
  }
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
      {entries.map(([k, v]) => {
        const isObject = v !== null && typeof v === 'object'
        return (
          <div key={k} className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label(k)}</dt>
            <dd
              className={`mt-0.5 text-sm text-slate-200 break-words ${
                isObject ? 'font-mono text-xs whitespace-pre-wrap' : ''
              }`}
            >
              {formatValue(v)}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string
  icon: ReactNode
  count?: number
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#11161d] shadow-xl shadow-black/40 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          {icon}
          {title}
        </h2>
        {typeof count === 'number' && (
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {count} record{count === 1 ? '' : 's'}
          </span>
        )}
      </div>
      <div className="px-4 sm:px-6 py-5">{children}</div>
    </section>
  )
}

/** Renders a list of records as stacked cards. */
function RecordList({ items, emptyLabel }: { items: Record<string, unknown>[]; emptyLabel: string }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>
  }
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={(item.id as number | string | undefined) ?? i}
          className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
        >
          <RecordGrid record={item} />
        </div>
      ))}
    </div>
  )
}

export default function AdminTenantDetail() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const [detail, setDetail] = useState<AdminTenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reminderBusy, setReminderBusy] = useState(false)
  const [reminderNote, setReminderNote] = useState<{ ok: boolean; text: string } | null>(null)

  const hasApiKey = Boolean(AUTH_API_KEY)

  const sendReminder = useCallback(async () => {
    if (!tenantId) return
    setReminderBusy(true)
    setReminderNote(null)
    try {
      const res = await sendStripeCompletionReminder(Number(tenantId))
      setReminderNote({
        ok: res.success !== false,
        text: res.message || 'Stripe completion reminder sent.',
      })
    } catch (e) {
      setReminderNote({ ok: false, text: await errMessage(e) })
    } finally {
      setReminderBusy(false)
    }
  }, [tenantId])

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminTenantDetail(Number(tenantId))
      setDetail(res.data ?? null)
      if (res.success === false && res.message) setError(res.message)
    } catch (e) {
      setError(await errMessage(e))
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    load()
  }, [load])

  const title = useMemo(() => {
    if (!detail) return `Tenant ${tenantId}`
    const company = (detail.profile?.company_name as string | undefined) || ''
    const name =
      detail.account.full_name ||
      `${detail.account.first_name} ${detail.account.last_name}`.trim()
    return company || name || `Tenant ${tenantId}`
  }, [detail, tenantId])

  return (
    <div className="min-h-screen bg-[#0c0f14] text-slate-200">
      <div className="border-b border-white/[0.06] bg-[#0c0f14]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              to="/operations"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to operations
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-1 truncate">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              Tenant #{tenantId}
              {detail && (
                <span
                  className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    detail.account.is_verified
                      ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-200'
                      : 'border border-amber-500/30 bg-amber-500/15 text-amber-200'
                  }`}
                >
                  {detail.account.is_verified ? 'Verified' : 'Pending'}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              type="button"
              onClick={sendReminder}
              disabled={!detail || reminderBusy}
              title="Email the tenant a fresh Stripe onboarding link"
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {reminderBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send Stripe reminder
            </button>
            {reminderNote && (
              <span
                className={`text-xs ${
                  reminderNote.ok ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {reminderNote.text}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {!hasApiKey && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.07] px-4 py-3 flex gap-3 items-start">
            <KeyRound className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-200/80">
              Missing <code className="text-rose-100/90">VITE_API_KEY</code> — admin requests need the{' '}
              <code className="text-rose-100/90">X-API-Key</code> header.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading tenant…
          </div>
        ) : !detail ? (
          <div className="py-20 text-center text-slate-500 text-sm">No tenant data.</div>
        ) : (
          <>
            <Section title="Account" icon={<User className="h-4 w-4 text-cyan-400/90" />}>
              <RecordGrid record={detail.account as unknown as Record<string, unknown>} />
            </Section>

            <Section title="Business profile" icon={<Building2 className="h-4 w-4 text-sky-400/90" />}>
              {detail.profile ? <RecordGrid record={detail.profile} /> : <p className="text-sm text-slate-500">No profile.</p>}
            </Section>

            <Section title="Stats" icon={<BadgeCheck className="h-4 w-4 text-emerald-400/90" />}>
              {detail.stats ? <RecordGrid record={detail.stats} /> : <p className="text-sm text-slate-500">No stats.</p>}
            </Section>

            <Section title="Settings" icon={<SettingsIcon className="h-4 w-4 text-slate-400" />}>
              {detail.settings ? <RecordGrid record={detail.settings} /> : <p className="text-sm text-slate-500">No settings.</p>}
            </Section>

            <Section title="Branding" icon={<Palette className="h-4 w-4 text-violet-400/90" />}>
              {detail.branding ? <RecordGrid record={detail.branding} /> : <p className="text-sm text-slate-500">No branding.</p>}
            </Section>

            <Section title="Pricing" icon={<CreditCard className="h-4 w-4 text-amber-400/90" />}>
              {detail.pricing ? <RecordGrid record={detail.pricing} /> : <p className="text-sm text-slate-500">No pricing.</p>}
            </Section>

            <Section title="Booking pricing" icon={<Tags className="h-4 w-4 text-amber-300/90" />} count={detail.counts.booking_pricing}>
              <RecordList items={detail.booking_pricing} emptyLabel="No per-service booking pricing." />
            </Section>

            <Section title="Drivers" icon={<Users className="h-4 w-4 text-cyan-300/90" />} count={detail.counts.drivers}>
              <RecordList items={detail.drivers} emptyLabel="No drivers." />
            </Section>

            <Section title="Riders" icon={<Users className="h-4 w-4 text-sky-300/90" />} count={detail.counts.riders}>
              <RecordList items={detail.riders} emptyLabel="No riders." />
            </Section>

            <Section title="Vehicles" icon={<Car className="h-4 w-4 text-emerald-300/90" />} count={detail.counts.vehicles}>
              <RecordList items={detail.vehicles} emptyLabel="No vehicles." />
            </Section>

            <Section title="Bookings" icon={<Receipt className="h-4 w-4 text-rose-300/90" />} count={detail.counts.bookings}>
              <RecordList items={detail.bookings} emptyLabel="No bookings." />
            </Section>

            <Section title="Payouts" icon={<Banknote className="h-4 w-4 text-emerald-400/90" />} count={detail.counts.payouts}>
              <RecordList items={detail.payouts} emptyLabel="No payouts." />
            </Section>

            <Section title="Transactions" icon={<Banknote className="h-4 w-4 text-amber-400/90" />} count={detail.counts.transactions}>
              <RecordList items={detail.transactions} emptyLabel="No transactions." />
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
