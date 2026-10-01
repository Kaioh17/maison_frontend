import { useEffect, useState } from 'react'
import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Receipt, ArrowSquareOut } from '@phosphor-icons/react'
import { getBillingOverview, getPlanLimits, type BillingInvoice, type BillingStripe, type QuotaUsage } from '@api/subscription'
import Button from '@components/Button'
import StatTile from '@components/StatTile'
import StatusPill from '@components/StatusPill'

const CYCLES: Record<string, string> = { month: 'Monthly', year: 'Yearly', week: 'Weekly', day: 'Daily' }
// Stripe invoice status -> StatusPill variant.
const INVOICE_VARIANT: Record<string, string> = { paid: 'active', open: 'pending', void: 'cancelled', uncollectible: 'cancelled' }

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const money = (cents: number, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
const day = (unix: number | null | undefined) =>
  unix ? new Date(unix * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
const usage = (u?: QuotaUsage) => (u ? `${u.used} of ${u.allowed ?? 'unlimited'}` : '-')

const rowStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--bw-border)',
}
const rowLabel: React.CSSProperties = { fontSize: 13, color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif', flexShrink: 0 }
const rowValue: React.CSSProperties = {
  fontSize: 13, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)', textAlign: 'right', overflowWrap: 'anywhere', minWidth: 0,
}
const Row = ({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) => (
  <div style={last ? { ...rowStyle, borderBottom: 'none' } : rowStyle}>
    <span style={rowLabel}>{label}</span>
    <span style={rowValue}>{children}</span>
  </div>
)

function InvoiceLinks({ inv }: { inv: BillingInvoice }) {
  const link: React.CSSProperties = { color: 'var(--bw-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }
  return (
    <span style={{ display: 'inline-flex', gap: 12 }}>
      {inv.hosted_invoice_url && (
        <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" style={link}>
          View <ArrowSquareOut size={12} aria-hidden />
        </a>
      )}
      {inv.invoice_pdf && (
        <a href={inv.invoice_pdf} target="_blank" rel="noreferrer" style={link}>PDF</a>
      )}
    </span>
  )
}

function cycleLabel(s: BillingStripe) {
  const base = s.interval ? CYCLES[s.interval] ?? `Per ${s.interval}` : '-'
  return s.interval && s.interval_count > 1 ? `Every ${s.interval_count} ${s.interval}s` : base
}

function discountLabel(d: NonNullable<BillingStripe['discount']>, currency: string) {
  const amount = d.percent_off != null ? `${d.percent_off}% off` : d.amount_off != null ? `${money(d.amount_off, currency)} off` : 'Discount'
  const span = d.duration === 'forever' ? 'forever' : d.duration === 'once' ? 'first invoice only' : d.duration_in_months ? `for ${d.duration_in_months} months` : ''
  return [d.name, amount, span].filter(Boolean).join(' - ')
}

export default function Billing() {
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Same key as SubscriptionGate, so the two share one cached limits response.
  const limitsQuery = useQuery({ queryKey: ['subscription', 'limits'], queryFn: () => getPlanLimits().then((r) => r.data ?? null) })
  const billingQuery = useQuery({ queryKey: ['subscription', 'billing'], queryFn: () => getBillingOverview().then((r) => r.data ?? null) })

  if (limitsQuery.isLoading || billingQuery.isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '60vh' }}>
        <span style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)' }}>Loading...</span>
      </div>
    )
  }

  const limits = limitsQuery.data
  const billing = billingQuery.data
  const stripe = billing?.stripe ?? null
  const currency = stripe?.currency ?? 'usd'
  const loadFailed = limitsQuery.isError || billingQuery.isError
  const status = stripe?.status ?? limits?.status ?? 'unsubscribed'
  const statusLabel = titleCase(status.replace(/_/g, ' '))

  const sectionCard: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bw-bg-secondary)',
    border: '1px solid var(--bw-border)', borderRadius: 10, padding: isMobile ? '16px' : '18px 20px',
  }
  const sectionHeading: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, minHeight: 44, borderBottom: '1px solid var(--bw-border)',
  }
  const sectionTitle: React.CSSProperties = {
    margin: 0, fontSize: 13, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
    letterSpacing: '0.03em', textTransform: 'uppercase',
  }
  const cell: React.CSSProperties = { padding: '10px 12px', fontSize: 13, textAlign: 'left', borderBottom: '1px solid var(--bw-border)', whiteSpace: 'nowrap' }

  const card = stripe?.payment_method
  const nextAmount = stripe?.next_invoice_amount
  const nextSub = !stripe
    ? undefined
    : stripe.cancel_at_period_end
      ? `Cancels ${day(stripe.current_period_end)}`
      : nextAmount == null
        ? 'No upcoming charge'
        : `on ${day(stripe.current_period_end)}`

  return (
    <div style={{ maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div
        className="bw-container"
        style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: isMobile ? '16px 16px 96px' : '24px 28px 96px', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        {!isMobile && (
          <h1 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 500, fontFamily: '"DM Sans", sans-serif', color: 'var(--bw-text)' }}>Billing</h1>
        )}
        <p style={{ margin: '0 0 24px', fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
          What Stripe charges for your Maison subscription, your billing cycle, and your invoices.
        </p>

        {(loadFailed || billing?.stripe_error) && (
          <div role="alert" style={{ ...sectionCard, marginBottom: 16, color: 'var(--bw-error)', fontSize: 13 }}>
            {billing?.stripe_error ?? 'Could not load billing details.'} Amounts below may be missing. Try again shortly.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          <StatTile
            label="Recurring charge"
            value={stripe ? money(stripe.recurring_amount, currency) : '-'}
            sub={stripe ? `per ${stripe.interval_count > 1 ? `${stripe.interval_count} ` : ''}${stripe.interval ?? 'period'}${stripe.interval_count > 1 ? 's' : ''}${stripe.discount ? ', before discount' : ''}` : undefined}
          />
          <StatTile label="Next invoice" value={nextAmount != null ? money(nextAmount, currency) : '-'} sub={nextSub} />
          <StatTile
            label="Billing cycle"
            value={stripe ? cycleLabel(stripe) : '-'}
            sub={stripe ? `${day(stripe.current_period_start)} to ${day(stripe.current_period_end)}` : undefined}
          />
          <StatTile label="Plan" value={limits?.plan ? titleCase(limits.plan) : 'None'} sub={statusLabel} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 16, marginBottom: 16 }}>
          <div style={sectionCard}>
            <div style={sectionHeading}>
              <CreditCard size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
              <h2 style={sectionTitle}>Subscription</h2>
              <Button variant="ghost" style={{ marginLeft: 'auto', minHeight: 28, padding: '4px 8px', fontSize: 12 }} onClick={() => navigate('/tenant/settings/plans')}>
                Change plan
              </Button>
            </div>
            <Row label="Plan">{limits?.plan ? titleCase(limits.plan) : 'None'}</Row>
            <Row label="Status"><StatusPill status={status} label={statusLabel} /></Row>
            <Row label="Platform fee">{limits ? `${+(limits.maison_fee * 100).toFixed(2)}% per card payment` : '-'}</Row>
            <Row label="Vehicles">{usage(limits?.vehicles)}</Row>
            <Row label="Drivers">{usage(limits?.drivers)}</Row>
            <Row label="Subscription ID">{billing?.subscription_id ?? '-'}</Row>
            <Row label="Customer ID" last>{billing?.customer_id ?? '-'}</Row>
          </div>

          <div style={sectionCard}>
            <div style={sectionHeading}>
              <CreditCard size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
              <h2 style={sectionTitle}>Payment</h2>
            </div>
            <Row label="Payment method">{card?.last4 ? `${titleCase(card.brand ?? 'card')} ending ${card.last4}` : '-'}</Row>
            <Row label="Card expires">{card?.exp_month && card.exp_year ? `${String(card.exp_month).padStart(2, '0')}/${card.exp_year}` : '-'}</Row>
            <Row label="Renewal">{!stripe ? '-' : stripe.cancel_at_period_end ? `Ends ${day(stripe.current_period_end)}` : `Renews ${day(stripe.current_period_end)}`}</Row>
            <Row label="Subscribed since">{day(stripe?.started_on)}</Row>
            <Row label="Discount" last>{stripe?.discount ? discountLabel(stripe.discount, currency) : 'None'}</Row>
          </div>
        </div>

        <div style={sectionCard}>
          <div style={sectionHeading}>
            <Receipt size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
            <h2 style={sectionTitle}>Invoices</h2>
          </div>
          {stripe?.invoices.length ? (
            isMobile ? (
              stripe.invoices.map((inv, i) => (
                <div key={inv.id} style={{ padding: '10px 0', borderBottom: i === stripe.invoices.length - 1 ? 'none' : '1px solid var(--bw-border)', fontFamily: '"Work Sans", sans-serif', fontSize: 13, color: 'var(--bw-text)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>{day(inv.created)}</span>
                    <span>{money(inv.status === 'paid' ? inv.amount_paid : inv.amount_due, inv.currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 6 }}>
                    <span style={{ color: 'var(--bw-muted)', overflowWrap: 'anywhere' }}>{inv.number ?? inv.id}</span>
                    <StatusPill status={INVOICE_VARIANT[inv.status ?? ''] ?? 'default'} label={titleCase(inv.status ?? 'unknown')} />
                  </div>
                  <InvoiceLinks inv={inv} />
                </div>
              ))
            ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                <thead>
                  <tr style={{ color: 'var(--bw-muted)' }}>
                    {['Date', 'Invoice', 'Amount', 'Status', ''].map((h) => (
                      <th key={h} scope="col" style={{ ...cell, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stripe.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={cell}>{day(inv.created)}</td>
                      <td style={cell}>{inv.number ?? inv.id}</td>
                      <td style={cell}>{money(inv.status === 'paid' ? inv.amount_paid : inv.amount_due, inv.currency)}</td>
                      <td style={cell}>
                        <StatusPill status={INVOICE_VARIANT[inv.status ?? ''] ?? 'default'} label={titleCase(inv.status ?? 'unknown')} />
                      </td>
                      <td style={{ ...cell, textAlign: 'right' }}><InvoiceLinks inv={inv} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--bw-muted)', fontFamily: '"Work Sans", sans-serif' }}>No invoices yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
