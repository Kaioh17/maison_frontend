import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  listAdminTenants,
  deleteAdminTenant,
  type AdminTenantRow,
} from '@api/admin'
import { AUTH_API_KEY } from '@config'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cloud,
  Database,
  KeyRound,
  Loader2,
  Radio,
  RefreshCw,
  Server,
  Trash2,
} from 'lucide-react'
import { AxiosError } from 'axios'

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

async function errMessage(e: unknown): Promise<string> {
  if (e instanceof AxiosError) {
    const d = e.response?.data as { message?: string; error?: string } | undefined
    return d?.message || d?.error || e.message || 'Request failed'
  }
  if (e instanceof Error) return e.message
  return 'Something went wrong'
}

type SoonCard = {
  title: string
  description: string
  icon: ReactNode
}

const comingSoon: SoonCard[] = [
  {
    title: 'Platform analytics',
    description:
      'Signups, bookings, GMV, and cohort funnels across tenants — exportable and filterable.',
    icon: <BarChart3 className="h-5 w-5 text-cyan-400/90" />,
  },
  {
    title: 'Infrastructure cost & usage',
    description:
      'Approximate API, storage, and egress per tenant — tie-ins to cloud billing when ready.',
    icon: <Cloud className="h-5 w-5 text-amber-400/90" />,
  },
  {
    title: 'Audit log & exports',
    description: 'Immutable history of admin actions and config changes with CSV/S3 archive.',
    icon: <Database className="h-5 w-5 text-emerald-400/90" />,
  },
  {
    title: 'Webhooks & event stream',
    description: 'Replayable delivery of tenant lifecycle and billing events for downstream systems.',
    icon: <Radio className="h-5 w-5 text-violet-400/90" />,
  },
  {
    title: 'Health & SLOs',
    description: 'Synthetic checks, error budgets, and dependency status for on-call.',
    icon: <Activity className="h-5 w-5 text-rose-400/90" />,
  },
  {
    title: 'Rate limits & quotas',
    description: 'Per-tenant throttles and fair-use caps with override workflows.',
    icon: <Server className="h-5 w-5 text-sky-400/90" />,
  },
]

export default function DeveloperOperations() {
  const [rows, setRows] = useState<AdminTenantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminTenantRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const hasApiKey = Boolean(AUTH_API_KEY)

  const load = useCallback(async (soft: boolean) => {
    if (soft) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await listAdminTenants()
      const list = Array.isArray(res.data) ? res.data : []
      setRows(list)
      if (res.success === false && res.message) {
        setError(res.message)
      }
    } catch (e) {
      setError(await errMessage(e))
      setRows([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load(false)
  }, [load])

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      ),
    [rows]
  )

  const openDelete = (row: AdminTenantRow) => {
    setDeleteTarget(row)
    setDeleteConfirm('')
  }

  const closeDelete = () => {
    if (deleteBusy) return
    setDeleteTarget(null)
    setDeleteConfirm('')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setError(null)
    try {
      await deleteAdminTenant(deleteTarget.id)
      setDeleteTarget(null)
      setDeleteConfirm('')
      await load(true)
    } catch (e) {
      setError(await errMessage(e))
    } finally {
      setDeleteBusy(false)
    }
  }

  const deleteReady =
    deleteTarget &&
    deleteConfirm.trim() === String(deleteTarget.id)

  return (
    <div className="min-h-screen bg-[#0c0f14] text-slate-200">
      <div className="border-b border-white/[0.06] bg-[#0c0f14]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/90 font-semibold">
              Local dev only
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white mt-0.5">
              Developer operations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tenant registry — destructive controls require confirmation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => load(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 flex flex-wrap gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-100/90 space-y-1">
            <p className="font-medium text-amber-100">
              Not secured for production — hosts under <code className="text-amber-200/95">admin.localhost</code> only.
            </p>
            <p className="text-amber-200/70">
              Deleting a tenant is irreversible. Ensure you are pointed at a safe backend.
            </p>
          </div>
        </div>

        {!hasApiKey && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.07] px-4 py-3 flex gap-3 items-start">
            <KeyRound className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-rose-100">Missing API key</p>
              <p className="text-rose-200/75 mt-1">
                Set <code className="text-rose-100/90">VITE_API_KEY</code> in{' '}
                <code className="text-rose-100/90">.env</code> so requests send{' '}
                <code className="text-rose-100/90">X-API-Key</code> to{' '}
                <code className="text-rose-100/90">/v1/admin/**</code>.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-white/[0.08] bg-[#11161d] shadow-xl shadow-black/40 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Tenants
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {sorted.length} record{sorted.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading tenants…
              </div>
            ) : sorted.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                No tenants returned. Check API key and backend logs.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {sorted.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-slate-300 tabular-nums">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        {r.full_name || `${r.first_name} ${r.last_name}`.trim() || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.email}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        {r.phone_no || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatWhen(r.created_on)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openDelete(r)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/35 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Roadmap / coming soon
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingSoon.map((c) => (
              <div
                key={c.title}
                className="group relative rounded-xl border border-white/[0.07] bg-[#11161d]/80 p-4 overflow-hidden"
              >
                <div className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-semibold text-slate-600 border border-white/10 rounded px-1.5 py-0.5">
                  Soon
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-200 text-sm">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-tenant-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141a22] shadow-2xl shadow-black/60 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/25">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3
                  id="delete-tenant-title"
                  className="text-lg font-semibold text-white"
                >
                  Delete tenant permanently?
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  <span className="text-white font-medium">
                    {deleteTarget.full_name ||
                      `${deleteTarget.first_name} ${deleteTarget.last_name}`.trim()}
                  </span>{' '}
                  <span className="font-mono text-slate-500">({deleteTarget.id})</span>
                </p>
                <p className="text-xs text-rose-300/90 mt-3">
                  This calls{' '}
                  <code className="text-rose-200/80 bg-black/30 px-1 rounded">
                    DELETE /v1/admin/delete/{deleteTarget.id}/tenant
                  </code>
                  . There is no undo.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Type the tenant id <span className="font-mono text-amber-200/80">{deleteTarget.id}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                placeholder={String(deleteTarget.id)}
                autoComplete="off"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleteBusy}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={!deleteReady || deleteBusy}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-600/90 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-40 disabled:pointer-events-none"
              >
                {deleteBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
