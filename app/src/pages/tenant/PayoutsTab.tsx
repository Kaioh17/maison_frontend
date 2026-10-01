import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowSquareOut, DownloadSimple, PencilSimple, WarningCircle } from '@phosphor-icons/react'
import Button from '@components/Button'
import Card from '@components/Card'
import Field from '@components/Field'
import Modal from '@components/Modal'
import Notice from '@components/Notice'
import StatusPill from '@components/StatusPill'
import Tabs from '@components/Tabs'
import Toggle from '@components/Toggle'
import { Skeleton } from '@components/Skeleton'
import { useNotice } from '@hooks/useNotice'
import { bulkUpdateTenantPayouts, getTenantPayouts, updateTenantPayout, type PayoutRow, type PayoutStatus } from '@api/payouts'
import { getStripeLoginLink, updateTenantSettings, type DriverPay, type PayRule } from '@api/tenantSettings'
import { getApiErrorMessage } from '@utils/apiError'
import { formatUsd } from './shared'
import type { TenantShellCtx } from './TenantShell'
import {
  PERIODS, STATUS_LABEL, STATUS_PILL, byDriver, inRange, isPending, periodRange, rowNet, statementCsv, totals,
  type DriverGroup, type PeriodId,
} from './payoutsMath'

type TabId = 'earnings' | 'balances' | 'statements' | 'verification'

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'earnings', label: 'Earnings' },
  { id: 'balances', label: 'Balances' },
  { id: 'statements', label: 'Statements' },
  { id: 'verification', label: 'Verification' },
]

const NUM = { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } as const
const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-'
const METHOD: Record<string, string> = { card: 'Card', cash: 'Cash', zelle: 'Zelle', card_pickup: 'Card at pickup' }
const method = (r: PayoutRow) => (r.payment_method ? METHOD[r.payment_method] ?? r.payment_method : 'Unknown')
const signed = (n: number) => (n < 0 ? `-${formatUsd(-n)}` : formatUsd(n))

/** Bold lead-in: the global reset flattens <strong>, so the weight is set here. */
const Lead = ({ children }: { children: React.ReactNode }) => <span style={{ fontWeight: 600, color: 'var(--bw-text)' }}>{children}</span>

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="bw-empty">{children}</div>
}

function Pill({ status }: { status: PayoutStatus }) {
  return <StatusPill status={STATUS_PILL[status]} label={STATUS_LABEL[status]} />
}

/** "You owe Ada" / "Ada owes you" under a net figure. */
function netCaption(net: number, name: string) {
  if (net > 0) return `You owe ${name}`
  if (net < 0) return `${name} owes you`
  return 'Nothing owed'
}

// ---------------------------------------------------------------- pay rule

const ruleText = (r: PayRule) => (r.type === 'percent' ? `${r.value}% of each fare` : `${formatUsd(r.value)} per ride`)
const toRule = (type: PayRule['type'], value: string): PayRule => ({ type, value: Number(value) })
const ruleError = (type: PayRule['type'], value: string) => {
  const n = Number(value)
  if (value.trim() === '' || !Number.isFinite(n) || n < 0) return 'Enter a number, 0 or more'
  if (type === 'percent' && n > 100) return 'A percent cannot be more than 100'
  return undefined
}

function RuleInputs({ label, type, value, onType, onValue, showError }: {
  label: string; type: PayRule['type']; value: string
  onType: (t: PayRule['type']) => void; onValue: (v: string) => void; showError: boolean
}) {
  const error = showError ? ruleError(type, value) : undefined
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <Field label={`${label} pay type`}>
        {(p) => (
          <select {...p} className="bw-input" value={type} onChange={(e) => onType(e.target.value as PayRule['type'])}>
            <option value="percent">Percent of the fare</option>
            <option value="flat">Flat amount per ride</option>
          </select>
        )}
      </Field>
      <Field label={type === 'percent' ? `${label} percent` : `${label} dollars per ride`} error={error}>
        {(p) => (
          <input {...p} className="bw-input" inputMode="decimal" value={value} onChange={(e) => onValue(e.target.value)} />
        )}
      </Field>
    </div>
  )
}

function PayRuleCard({ current, configured, onSaved }: { current: DriverPay | null | undefined; configured: boolean; onSaved: (msg: string) => void }) {
  const qc = useQueryClient()
  const initial = (r?: PayRule | null) => ({ type: r?.type ?? ('percent' as PayRule['type']), value: r ? String(r.value) : '' })
  const [def, setDef] = useState(() => initial(current?.default))
  const [split, setSplit] = useState(!!(current?.in_house || current?.outsourced))
  const [inHouse, setInHouse] = useState(() => initial(current?.in_house ?? current?.default))
  const [outsourced, setOutsourced] = useState(() => initial(current?.outsourced ?? current?.default))
  const [tried, setTried] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(!configured)

  const invalid = [def, ...(split ? [inHouse, outsourced] : [])].some((r) => ruleError(r.type, r.value))
  const save = useMutation({
    mutationFn: () => {
      const driver_pay: DriverPay = {
        default: toRule(def.type, def.value),
        in_house: split ? toRule(inHouse.type, inHouse.value) : null,
        outsourced: split ? toRule(outsourced.type, outsourced.value) : null,
      }
      return updateTenantSettings({ config: { driver_pay } })
    },
    onSuccess: () => {
      setError(null)
      void qc.invalidateQueries({ queryKey: ['tenant', 'config'] })
      void qc.invalidateQueries({ queryKey: ['tenant', 'payouts'] })
      setEditing(false)
      onSaved('Pay rule saved. It applies to rides completed from now on.')
    },
    onError: (e) => setError(getApiErrorMessage(e, 'Could not save the pay rule')),
  })

  const sample = 200
  const n = Number(def.value)
  const example = ruleError(def.type, def.value)
    ? null
    : def.type === 'percent'
      ? `On a ${formatUsd(sample, 0)} ride the driver earns ${formatUsd((sample * n) / 100)} and you keep ${formatUsd(sample - (sample * n) / 100)}.`
      : `The driver earns ${formatUsd(Math.min(n, sample))} on every ride (never more than the fare).`

  if (!editing && current) {
    const line = [
      `Drivers earn ${ruleText(current.default)}`,
      current.in_house && `in-house ${ruleText(current.in_house)}`,
      current.outsourced && `outsourced ${ruleText(current.outsourced)}`,
    ].filter(Boolean).join(', ')
    return (
      <Card title="Driver pay rule" meta="Applies to rides completed after you save">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '0 18px 18px' }}>
          <span style={{ fontSize: 14 }}>{line}.</span>
          <Button variant="secondary" onClick={() => setEditing(true)}>Change</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Driver pay rule" meta={configured ? 'Applies to rides completed after you save' : 'Not set - no earnings are recorded yet'}>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '0 18px 18px' }}
        onSubmit={(e) => { e.preventDefault(); setTried(true); if (!invalid) save.mutate() }}
      >
        <RuleInputs label="Default" type={def.type} value={def.value} showError={tried}
          onType={(type) => setDef({ ...def, type })} onValue={(value) => setDef({ ...def, value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <Toggle
            checked={split}
            onChange={(on) => {
              setSplit(on)
              // Start the type rates from the default the operator just typed, unless they already had their own.
              if (on && !current?.in_house) setInHouse(def)
              if (on && !current?.outsourced) setOutsourced(def)
            }}
            aria-label="Different rate for in-house and outsourced drivers" />
          Use a different rate for in-house and outsourced drivers
        </label>
        {split && (
          <>
            <RuleInputs label="In-house" type={inHouse.type} value={inHouse.value} showError={tried}
              onType={(type) => setInHouse({ ...inHouse, type })} onValue={(value) => setInHouse({ ...inHouse, value })} />
            <RuleInputs label="Outsourced" type={outsourced.type} value={outsourced.value} showError={tried}
              onType={(type) => setOutsourced({ ...outsourced, type })} onValue={(value) => setOutsourced({ ...outsourced, value })} />
          </>
        )}
        {example && <p className="bw-field-hint" style={{ margin: 0 }}>{example}</p>}
        <p className="bw-field-hint" style={{ margin: 0 }}>
          Each ride&apos;s earning is fixed when the ride is completed. Changing the rule later never changes what drivers
          have already earned.
        </p>
        {error && <div role="alert" className="bw-field-error">{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save pay rule'}</Button>
          {configured && <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
        </div>
      </form>
    </Card>
  )
}

// ---------------------------------------------------------------- earnings

function EarningsView({ rows, groups }: { rows: PayoutRow[]; groups: DriverGroup[] }) {
  const t = totals(rows)
  if (!rows.length) return <Card><Empty>No completed rides in this period. Earnings are recorded when a driver completes a ride.</Empty></Card>
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <div className="kpi"><span className="kpi-label">Driver earnings</span><span className="kpi-value">{formatUsd(t.earned)}</span></div>
        <div className="kpi"><span className="kpi-label">Completed rides</span><span className="kpi-value">{t.rides}</span></div>
        <div className="kpi"><span className="kpi-label">Total fares</span><span className="kpi-value">{formatUsd(t.fares)}</span></div>
        <div className="kpi"><span className="kpi-label">You keep</span><span className="kpi-value">{formatUsd(t.fares - t.earned)}</span></div>
      </div>
      <Card title="By driver" meta="Over the period above">
        <div className="dt-wrap">
          <table className="dt" style={{ minWidth: 560 }}>
            <thead><tr><th>Driver</th><th style={NUM}>Rides</th><th style={NUM}>Fares</th><th style={NUM}>Earned</th><th style={NUM}>Average per ride</th></tr></thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.driverId}>
                  <td className="strong">{g.driverName}</td>
                  <td data-label="Rides" style={NUM}>{g.totals.rides}</td>
                  <td data-label="Fares" style={NUM}>{formatUsd(g.totals.fares)}</td>
                  <td data-label="Earned" className="strong" style={NUM}>{formatUsd(g.totals.earned)}</td>
                  <td data-label="Average per ride" style={NUM}>{formatUsd(g.totals.earned / g.totals.rides)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Each ride">
        <div className="dt-wrap">
          <table className="dt" style={{ minWidth: 720 }}>
            <thead><tr><th>Date</th><th>Booking</th><th>Driver</th><th>Paid by</th><th style={NUM}>Fare</th><th style={NUM}>Driver earned</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.payout_id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{day(r.pickup_time)}</td>
                  <td data-label="Booking">#{r.booking_id}</td>
                  <td data-label="Driver">{r.driver_name}</td>
                  <td data-label="Paid by">{method(r)}</td>
                  <td data-label="Fare" style={NUM}>{formatUsd(r.fare)}</td>
                  <td data-label="Driver earned" className="strong" style={NUM}>{formatUsd(r.earning)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- stripe guide

/**
 * Maison does not split rider card payments to drivers (they are direct charges on the operator's Stripe
 * account), so the operator pays drivers themselves. This opens their Express dashboard to see what has
 * arrived and move it to their bank. That dashboard cannot send money to another person.
 */
function StripeGuide() {
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = async () => {
    // Open the tab inside the click: browsers block window.open once an await has passed.
    const tab = window.open('about:blank', '_blank')
    setOpening(true)
    setError(null)
    try {
      const res = await getStripeLoginLink()
      if (!res.success || !res.data.login_link) throw new Error('No link returned')
      if (tab) { tab.opener = null; tab.location.href = res.data.login_link } else window.location.assign(res.data.login_link)
    } catch (e) {
      tab?.close()
      setError(getApiErrorMessage(e, 'Could not open Stripe. Finish Stripe setup under Settings, Billing, then try again.'))
    } finally {
      setOpening(false)
    }
  }

  return (
    <Card title="Pay your drivers" meta="Rider card payments land in your Stripe account">
      <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.55 }}>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'decimal' }}>
          <li><Lead>Check your Stripe balance.</Lead> Open your Stripe dashboard to see the card payments you received (after fees) and move your balance to your bank account.</li>
          <li><Lead>Pay each driver the net shown above</Lead> from your bank: a bank transfer, Zelle or a check. Your Stripe dashboard cannot send money to another person, so this step happens outside Stripe.</li>
          <li><Lead>Come back and press Mark settled.</Lead> Doing this on a fixed day, such as every Monday, keeps it simple. The driver then confirms in their app, and you can see who confirmed and when under Verification.</li>
        </ol>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => void open()} disabled={opening}>
            <ArrowSquareOut size={16} aria-hidden /> {opening ? 'Opening...' : 'Open Stripe dashboard'}
          </Button>
          <Link to="/tenant/settings/help/admin">Read the payouts guide</Link>
        </div>
        {error && <div role="alert" className="bw-field-error">{error}</div>}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------- balances

function BalancesView({ groups, onSettle }: { groups: DriverGroup[]; onSettle: (g: DriverGroup) => void }) {
  const open = groups.map((g) => {
    const pending = g.rows.filter(isPending)
    const disputed = g.rows.filter((r) => r.status === 'disputed')
    return { g, pending, disputed, t: totals(pending), disputedNet: totals(disputed).net }
  }).filter((x) => x.pending.length || x.disputed.length)

  return (
    <>
      <Card title="Who owes what" meta="Pending rides, all time">
        {open.length === 0 ? (
          <Empty>Everything is settled. New balances appear when drivers complete rides.</Empty>
        ) : (
          <div className="dt-wrap">
            <table className="dt" style={{ minWidth: 860 }}>
              <thead>
                <tr>
                  <th>Driver</th><th style={NUM}>Rides</th><th style={NUM}>You owe driver</th><th style={NUM}>Cash collected</th>
                  <th style={NUM}>Driver owes you (fees)</th><th style={NUM}>Adjustments</th><th style={NUM}>Net</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {open.map(({ g, pending, disputed, t, disputedNet }) => (
                  <tr key={g.driverId}>
                    <td className="strong">
                      {g.driverName}
                      {disputed.length > 0 && (
                        <div className="sub" style={{ color: 'var(--bw-error)' }}>
                          {disputed.length} disputed ({signed(disputedNet)}), see Verification
                        </div>
                      )}
                    </td>
                    <td data-label="Rides" style={NUM}>{t.rides}</td>
                    <td data-label="You owe driver" style={NUM}>{pending.length ? formatUsd(t.owedToDriver) : '-'}</td>
                    <td data-label="Cash collected" style={NUM}>{pending.length ? formatUsd(t.cashCollected) : '-'}</td>
                    <td data-label="Driver owes you" style={NUM}>{pending.length ? formatUsd(t.fees) : '-'}</td>
                    <td data-label="Adjustments" style={NUM}>{pending.length ? signed(t.adjustments) : '-'}</td>
                    <td data-label="Net" style={NUM}>
                      {pending.length ? (
                        <>
                          <div className="strong">{formatUsd(Math.abs(t.net))}</div>
                          <div className="sub">{netCaption(t.net, g.driverName)}</div>
                        </>
                      ) : '-'}
                    </td>
                    <td className="dt-actions" style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                      {pending.length > 0 && <Button variant="secondary" onClick={() => onSettle(g)}>Mark settled</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <StripeGuide />
      <Card title="Make payouts easier">
        <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, lineHeight: 1.55 }}>
          <p style={{ margin: 0 }}>
            <Lead>Collect everything into your business accounts.</Lead> Card payments on your booking page already go to
            your Stripe account. For card at pickup, use a Square business account and card reader on the driver&apos;s phone,
            and take Zelle through your business bank account. Then the money lands with you, not in a driver&apos;s personal account.
          </p>
          <p style={{ margin: 0 }}>
            <Lead>Cash is the hard one.</Lead> The driver holds money that is yours, and it has to be handed in. Fewer cash
            rides means fewer hand-ins and fewer disagreements. You can turn payment types on or off in Settings.
          </p>
          <div><Link to="/tenant/settings/tenant-settings" className="btn btn-secondary">Edit accepted payment types</Link></div>
          <p style={{ margin: 0 }}>
            <Lead>Keep a record outside Maison too.</Lead> Maison works out each driver&apos;s share from your pay rule and keeps
            the ledger. The payment itself happens between you and your driver, so Maison is not responsible for mistakes,
            disputes or incorrect reports. Check the figures before you pay.
          </p>
        </div>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- statements

function StatementsView({ groups, periodLabel }: { groups: DriverGroup[]; periodLabel: string }) {
  const download = (g: DriverGroup) => {
    const url = URL.createObjectURL(new Blob([statementCsv(g, periodLabel)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `statement-${g.driverName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  if (!groups.length) return <Card><Empty>No completed rides in this period, so there is nothing to put in a statement.</Empty></Card>
  return (
    <Card title="Driver statements" meta={periodLabel}>
      <div className="dt-wrap">
        <table className="dt" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>Driver</th><th style={NUM}>Rides</th><th style={NUM}>Earned</th><th style={NUM}>Cash to hand in</th>
              <th style={NUM}>Net</th><th style={NUM}>Still unpaid</th><th style={{ textAlign: 'right' }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.driverId}>
                <td className="strong">{g.driverName}</td>
                <td data-label="Rides" style={NUM}>{g.totals.rides}</td>
                <td data-label="Earned" style={NUM}>{formatUsd(g.totals.earned)}</td>
                <td data-label="Cash to hand in" style={NUM}>{formatUsd(g.totals.fees)}</td>
                <td data-label="Net" style={NUM}>{signed(g.totals.net)}</td>
                <td data-label="Still unpaid" className="strong" style={NUM}>{signed(totals(g.rows.filter(isPending)).net)}</td>
                <td className="dt-actions" style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <Button variant="secondary" onClick={() => download(g)} aria-label={`Download statement for ${g.driverName}`}>
                    <DownloadSimple size={16} aria-hidden /> CSV
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------- verification

function markedBy(r: PayoutRow) {
  if (!r.status_by_role) return '-'
  return r.status_by_role === 'tenant' ? 'You' : r.driver_name
}

function EditPayoutModal({ row, onClose, onDone }: { row: PayoutRow; onClose: () => void; onDone: (msg: string) => void }) {
  const qc = useQueryClient()
  const [status, setStatus] = useState<PayoutStatus>(row.status)
  const [adjustment, setAdjustment] = useState(String(row.adjustment))
  const [note, setNote] = useState(row.note ?? '')
  const [error, setError] = useState<string | null>(null)
  // Money figures on a paid or verified line are history: reopen it (set Pending) to change them.
  const canAdjust = row.status === 'pending' || row.status === 'disputed'
  const adj = Number(adjustment)
  const adjBad = canAdjust && (adjustment.trim() === '' || !Number.isFinite(adj))

  const save = useMutation({
    mutationFn: () => updateTenantPayout(row.payout_id, {
      ...(status !== row.status && { status }),
      ...(canAdjust && adj !== row.adjustment && { adjustment: adj }),
      ...(note.trim() !== (row.note ?? '') && { note }),
    }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['tenant', 'payouts'] }); onDone(`Updated ride #${row.booking_id}`); onClose() },
    onError: (e) => setError(getApiErrorMessage(e, 'Could not update this payout')),
  })

  return (
    <Modal
      title={`Ride #${row.booking_id} - ${row.driver_name}`}
      onClose={onClose}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={save.isPending || adjBad} onClick={() => save.mutate()}>{save.isPending ? 'Saving...' : 'Save'}</Button>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p className="bw-field-hint" style={{ margin: 0 }}>
          {day(row.pickup_time)} - fare {formatUsd(row.fare)} - driver earned {formatUsd(row.earning)} - net {signed(rowNet(row))}
        </p>
        <Field label="Status">
          {(p) => (
            <select {...p} className="bw-input" value={status} onChange={(e) => setStatus(e.target.value as PayoutStatus)}>
              {(Object.keys(STATUS_LABEL) as PayoutStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          )}
        </Field>
        <Field
          label="Adjustment (dollars, negative to deduct)"
          hint={canAdjust ? 'Bonus, fuel refund or deduction for this ride.' : 'Set the status to Pending first to change the adjustment.'}
          error={adjBad ? 'Enter a number' : undefined}
        >
          {(p) => <input {...p} className="bw-input" inputMode="decimal" disabled={!canAdjust} value={adjustment} onChange={(e) => setAdjustment(e.target.value)} />}
        </Field>
        <Field label="Note">
          {(p) => <textarea {...p} className="bw-input" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        {error && <div role="alert" className="bw-field-error">{error}</div>}
      </div>
    </Modal>
  )
}

function VerificationView({ rows, onEdit }: { rows: PayoutRow[]; onEdit: (r: PayoutRow) => void }) {
  const [filter, setFilter] = useState<PayoutStatus | ''>('')
  const count = (s: PayoutStatus) => rows.filter((r) => r.status === s).length
  const shown = filter ? rows.filter((r) => r.status === filter) : rows
  return (
    <Card style={{ padding: 0 }}>
      <div style={{ padding: '0 18px' }}>
        <Tabs
          ariaLabel="Payout status"
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: '', label: 'All', count: rows.length },
            { id: 'pending', label: 'Pending', count: count('pending') },
            { id: 'paid', label: 'Paid', count: count('paid') },
            { id: 'disputed', label: 'Disputed', count: count('disputed') },
            { id: 'verified', label: 'Verified', count: count('verified') },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <Empty>No payouts here.</Empty>
      ) : (
        <div className="dt-wrap">
          <table className="dt" style={{ minWidth: 820 }}>
            <thead>
              <tr><th>Ride</th><th>Driver</th><th style={NUM}>Net</th><th>Status</th><th>Marked by</th><th>When</th><th style={{ textAlign: 'right' }}>Edit</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.payout_id}>
                  <td className="strong" style={{ whiteSpace: 'nowrap' }}>#{r.booking_id}<div className="sub">{day(r.pickup_time)}</div></td>
                  <td data-label="Driver">{r.driver_name}</td>
                  <td data-label="Net" style={NUM}>
                    {signed(rowNet(r))}
                    {r.adjustment !== 0 && <div className="sub">incl. {signed(r.adjustment)} adjustment</div>}
                  </td>
                  <td data-label="Status">
                    <Pill status={r.status} />
                    {r.note && <div className="sub" style={{ maxWidth: 220, whiteSpace: 'normal' }}>{r.note}</div>}
                  </td>
                  <td data-label="Marked by">{markedBy(r)}</td>
                  <td data-label="When" style={{ whiteSpace: 'nowrap' }}>{when(r.status_on)}</td>
                  <td className="dt-actions" style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                    <Button variant="ghost" onClick={() => onEdit(r)} aria-label={`Edit payout for ride ${r.booking_id}`}>
                      <PencilSimple size={16} aria-hidden /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------- page

export default function PayoutsTab() {
  const { tenantConfig } = useOutletContext<TenantShellCtx>()
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabId>('earnings')
  const [period, setPeriod] = useState<PeriodId>('this_month')
  const [custom, setCustom] = useState({ from: '', to: '' })
  const [driverId, setDriverId] = useState('')
  const [editing, setEditing] = useState<PayoutRow | null>(null)
  const [settling, setSettling] = useState<DriverGroup | null>(null)
  const [notice, notify] = useNotice()

  const query = useQuery({ queryKey: ['tenant', 'payouts'], queryFn: getTenantPayouts })
  const all = useMemo(() => query.data?.rows ?? [], [query.data])
  const configured = query.data?.configured ?? false

  const inPeriod = useMemo(() => {
    const ranged = inRange(all, periodRange(period, new Date(), custom))
    return driverId ? ranged.filter((r) => String(r.driver_id) === driverId) : ranged
  }, [all, period, custom, driverId])
  const drivers = useMemo(() => byDriver(all).map((g) => ({ id: g.driverId, name: g.driverName })), [all])
  const periodLabel = period === 'custom' ? `${custom.from || 'start'} to ${custom.to || 'today'}` : PERIODS.find((p) => p.id === period)!.label

  const settle = useMutation({
    mutationFn: (g: DriverGroup) => bulkUpdateTenantPayouts(g.rows.filter(isPending).map((r) => r.payout_id), 'paid'),
    onSuccess: (_res, g) => { void qc.invalidateQueries({ queryKey: ['tenant', 'payouts'] }); notify({ ok: true, text: `Marked ${g.driverName}'s pending rides settled` }); setSettling(null) },
    onError: (e) => { notify({ ok: false, text: getApiErrorMessage(e, 'Could not mark these rides settled') }); setSettling(null) },
  })

  const showFilters = tab !== 'balances'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p className="bw-panel-meta" style={{ margin: 0 }}>
        Maison works out each driver&apos;s share from your pay rule and keeps the record. You pay your drivers yourself, and
        Maison is not responsible for mistakes, disputes or incorrect reports between you and your drivers.
      </p>
      <Notice notice={notice} />

      {query.isLoading ? (
        <Skeleton width="100%" height={220} />
      ) : query.isError ? (
        <div role="alert" className="bw-field-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WarningCircle size={16} aria-hidden /> Could not load payouts.
          <Button variant="ghost" onClick={() => void query.refetch()}>Try again</Button>
        </div>
      ) : (
        <>
          <Tabs ariaLabel="Payouts sections" value={tab} onChange={setTab} tabs={TABS} />

          {showFilters && (
            <div className="bw-searchbar">
              <select aria-label="Period" className="bw-input" style={{ width: 'auto', maxWidth: 180 }} value={period} onChange={(e) => setPeriod(e.target.value as PeriodId)}>
                {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {period === 'custom' && (
                <>
                  <input aria-label="From date" type="date" className="bw-input" style={{ width: 'auto' }} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
                  <input aria-label="To date" type="date" className="bw-input" style={{ width: 'auto' }} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
                </>
              )}
              {tab !== 'statements' && (
                <select aria-label="Driver" className="bw-input" style={{ width: 'auto', maxWidth: 220 }} value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                  <option value="">All drivers</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
            </div>
          )}

          {tab === 'earnings' && (
            <>
              <PayRuleCard
                key={JSON.stringify(tenantConfig?.settings?.config?.driver_pay ?? null)}
                current={tenantConfig?.settings?.config?.driver_pay}
                configured={configured}
                onSaved={(text) => notify({ ok: true, text })}
              />
              <EarningsView rows={inPeriod} groups={byDriver(inPeriod)} />
            </>
          )}
          {tab === 'balances' && <BalancesView groups={byDriver(all)} onSettle={setSettling} />}
          {tab === 'statements' && <StatementsView groups={byDriver(inPeriod)} periodLabel={periodLabel} />}
          {tab === 'verification' && <VerificationView rows={inPeriod} onEdit={setEditing} />}
        </>
      )}

      {editing && <EditPayoutModal row={editing} onClose={() => setEditing(null)} onDone={(text) => notify({ ok: true, text })} />}
      {settling && (
        <Modal
          title={`Mark ${settling.driverName}'s balance settled?`}
          onClose={() => setSettling(null)}
          footer={<>
            <Button variant="secondary" onClick={() => setSettling(null)}>Cancel</Button>
            <Button disabled={settle.isPending} onClick={() => settle.mutate(settling)}>{settle.isPending ? 'Saving...' : 'Mark settled'}</Button>
          </>}
        >
          {(() => {
            const t = totals(settling.rows.filter(isPending))
            return (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                {t.rides} {t.rides === 1 ? 'ride' : 'rides'}, net {formatUsd(Math.abs(t.net))}. {netCaption(t.net, settling.driverName)}.
                This records that the money has changed hands. Do it after you have actually paid, or received the cash.
                The driver can then confirm in their app.
              </p>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
