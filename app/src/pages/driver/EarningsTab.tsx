import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Button from '@components/Button'
import Card from '@components/Card'
import ComingSoon from '@components/ComingSoon'
import Field from '@components/Field'
import Modal from '@components/Modal'
import StatTile from '@components/StatTile'
import StatusPill from '@components/StatusPill'
import { getDriverPayouts, updateDriverPayout, type PayoutRow } from '@api/payouts'
import { getApiErrorMessage } from '@utils/apiError'
import { STATUS_LABEL, STATUS_PILL, inRange, isPending, periodRange, rowNet, totals } from '@pages/tenant/payoutsMath'
import { formatMoney } from './rideHelpers'
import type { DriverShellCtx } from './useDriverData'

const SHOWN = 25
const METHOD: Record<string, string> = { card: 'Card', cash: 'Cash', zelle: 'Zelle', card_pickup: 'Card at pickup' }

/**
 * Pay comes from `bookings.driver_earning`, frozen when the ride was completed, so a later change to the
 * company's pay rule never rewrites what the driver sees here. Until the company sets a rule the money
 * block stays on the shared "Not connected" stub rather than showing a made-up zero.
 */
export default function EarningsTab() {
  const { completedCount, active, userId, notify, refreshRides } = useOutletContext<DriverShellCtx>()
  const [disputing, setDisputing] = useState<PayoutRow | null>(null)
  const [note, setNote] = useState('')

  const query = useQuery({ queryKey: ['driver', userId, 'payouts'], queryFn: getDriverPayouts })
  const rows = useMemo(() => query.data?.rows ?? [], [query.data])
  const configured = query.data?.configured ?? false

  const act = useMutation({
    mutationFn: (v: { id: number; status: 'verified' | 'disputed'; note?: string }) => updateDriverPayout(v.id, { status: v.status, note: v.note }),
    onSuccess: (_r, v) => {
      notify({ ok: true, text: v.status === 'verified' ? 'Thanks, payment confirmed' : 'Reported to your company' })
      setDisputing(null)
      setNote('')
      void refreshRides()
    },
    onError: (e) => notify({ ok: false, text: getApiErrorMessage(e, 'Could not update this payment') }),
  })

  const now = new Date()
  const today = totals(inRange(rows, { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) }))
  const week = totals(inRange(rows, periodRange('this_week', now)))
  const month = totals(inRange(rows, periodRange('this_month', now)))
  const balance = totals(rows.filter(isPending)).net

  return (
    <div className="drv-stack">
      <h1 className="drv-title">Earnings</h1>
      <div className="drv-tiles">
        <StatTile label="Completed rides" value={completedCount} />
        <StatTile label="Booked ahead" value={active.length} />
      </div>

      {!configured ? (
        <Card>
          <ComingSoon label="Your pay">
            <div className="drv-tiles">
              <StatTile label="Today" value={formatMoney(0)} />
              <StatTile label="This week" value={formatMoney(0)} />
              <StatTile label="This month" value={formatMoney(0)} />
              <StatTile label="Balance" value={formatMoney(0)} />
            </div>
          </ComingSoon>
          <p className="drv-sub" style={{ marginTop: 16 }}>
            Your company has not set your pay yet. Once it does, this page shows what you earn on each ride, the cash you
            need to hand in, and what the company owes you.
          </p>
        </Card>
      ) : (
        <>
          <div className="drv-tiles">
            <StatTile label="Today" value={formatMoney(today.earned)} />
            <StatTile label="This week" value={formatMoney(week.earned)} />
            <StatTile label="This month" value={formatMoney(month.earned)} />
            <StatTile
              label={balance < 0 ? 'Cash to hand in' : 'Owed to you'}
              value={formatMoney(Math.abs(balance))}
              sub={balance < 0 ? 'After your share of the cash' : 'Unpaid rides'}
            />
          </div>

          <Card title="Your rides" meta={rows.length > SHOWN ? `Latest ${SHOWN}` : undefined}>
            {rows.length === 0 ? (
              <div className="drv-empty">No paid rides yet. Each completed ride shows up here with your share.</div>
            ) : (
              <div>
                {rows.slice(0, SHOWN).map((r) => (
                  <div key={r.payout_id} className="drv-pay">
                    <div className="drv-pay-top">
                      <div>
                        <div className="drv-when" style={{ fontSize: 17 }}>
                          {new Date(r.pickup_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="drv-meta">
                          Ride #{r.booking_id} - fare {formatMoney(r.fare)} - {r.payment_method ? METHOD[r.payment_method] ?? r.payment_method : 'Unknown'}
                        </div>
                      </div>
                      <div className="drv-ride-side">
                        <div className="drv-pay-amt">{formatMoney(r.earning)}</div>
                        <StatusPill status={STATUS_PILL[r.status]} label={STATUS_LABEL[r.status]} />
                      </div>
                    </div>
                    {r.payment_method === 'cash' && (
                      <div className="drv-meta">You collected the cash and hand in {formatMoney(r.fare - r.earning)}.</div>
                    )}
                    {r.adjustment !== 0 && <div className="drv-meta">Adjustment {formatMoney(r.adjustment)} (net {formatMoney(rowNet(r))})</div>}
                    {r.note && <div className="drv-meta">Note: {r.note}</div>}
                    {r.status !== 'disputed' && (
                      <div className="drv-actions">
                        {r.status === 'paid' && (
                          <Button disabled={act.isPending} onClick={() => act.mutate({ id: r.payout_id, status: 'verified' })}>Confirm received</Button>
                        )}
                        {r.status !== 'verified' && (
                          <Button variant="ghost" onClick={() => { setDisputing(r); setNote('') }}>Report a problem</Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <p className="drv-sub">
            Maison records what your company&apos;s pay rule gives you on each ride. Your company pays you, and Maison is not
            responsible for payment mistakes or disputes between you and your company.
          </p>
        </>
      )}

      {disputing && (
        <Modal
          title={`Report a problem with ride #${disputing.booking_id}`}
          onClose={() => setDisputing(null)}
          footer={<>
            <Button variant="secondary" onClick={() => setDisputing(null)}>Cancel</Button>
            <Button disabled={act.isPending || !note.trim()} onClick={() => act.mutate({ id: disputing.payout_id, status: 'disputed', note })}>Send</Button>
          </>}
        >
          <Field label="What is wrong?" hint="For example: the amount is too low, or I was not paid.">
            {(p) => <textarea {...p} className="bw-input" rows={4} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />}
          </Field>
        </Modal>
      )}
    </div>
  )
}
