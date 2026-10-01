import { useState } from 'react'
import { Calculator } from '@phosphor-icons/react'
import { getPricingScenarios, type PricingScenario, type TenantPricingData } from '@api/tenantSettings'

const SERVICES: { type: PricingScenario['service_type']; title: string }[] = [
  { type: 'dropoff', title: 'Dropoff' },
  { type: 'airport', title: 'Airport' },
  { type: 'hourly', title: 'Hourly' },
]

const money = (n: number) => `$${n.toFixed(2)}`
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontVariantNumeric: 'tabular-nums' }
const cell: React.CSSProperties = { padding: '8px 10px', textAlign: 'right', whiteSpace: 'nowrap', borderBottom: '1px solid var(--bw-border)' }

/** Previews what riders will pay for sample trips. Uses the pricing form's current (even unsaved) rates. */
export default function PricingScenarios({ rates, isMobile }: { rates: TenantPricingData; isMobile: boolean }) {
  const [sampleBase, setSampleBase] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ speed: number; base: number; rows: PricingScenario[] } | null>(null)

  const run = async () => {
    const parsed = parseFloat(sampleBase)
    const base = sampleBase !== '' && parsed >= 0 ? parsed : rates.base_fare
    setRunning(true)
    setError(null)
    try {
      const data = await getPricingScenarios({
        base_fare: base,
        per_mile_rate: rates.per_mile_rate,
        per_minute_rate: rates.per_minute_rate,
        per_hour_rate: rates.per_hour_rate,
      })
      setResult({ speed: data.avg_speed_mph, base, rows: data.scenarios })
    } catch {
      setError('Could not calculate scenarios. Please try again.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={{
      width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bw-bg-secondary)',
      border: '1px solid var(--bw-border)', borderRadius: 18, padding: isMobile ? 16 : '20px 24px', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--bw-border)' }}>
        <Calculator size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          Scenario Calculator
        </h2>
      </div>

      <p style={{ margin: '0 0 14px', fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.5 }}>
        See what riders would pay for sample trips in every service type and vehicle class.
        It uses the rates above, including any changes you have not saved yet.
      </p>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-end', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0, maxWidth: isMobile ? 'none' : 260 }}>
          <label htmlFor="sample-base-fare" style={{ display: 'block', fontSize: 12, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', marginBottom: 2 }}>
            Sample base fare ($)
          </label>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 300, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', lineHeight: 1.3 }}>
            Try a different starting fee. Leave empty to use your base fare.
          </p>
          <input
            id="sample-base-fare" type="number" step="0.01" min="0" inputMode="decimal"
            value={sampleBase} placeholder={rates.base_fare.toFixed(2)}
            onChange={e => setSampleBase(e.target.value)}
            className="bw-input"
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: '"Work Sans", sans-serif', borderRadius: 6, color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)', border: '1px solid var(--bw-border)', boxSizing: 'border-box' }}
          />
        </div>
        <button className="pss-btn pss-btn-primary" onClick={run} disabled={running} style={isMobile ? { width: '100%', minHeight: 44 } : undefined}>
          <Calculator size={16} aria-hidden /> {running ? 'Calculating…' : 'Calculate scenarios'}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--bw-error)', color: 'var(--bw-error)', fontSize: 13, fontFamily: '"Work Sans", sans-serif' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)', lineHeight: 1.4 }}>
            Base fare {money(result.base)}. Trip times assume an average speed of {result.speed} mph. Totals include the vehicle class rate and, for airport trips, STC, gratuity and fees.
            Deposits are shown under the total when a deposit is required.
          </p>
          {SERVICES.map(({ type, title }) => {
            const rows = result.rows.filter(r => r.service_type === type)
            if (!rows.length) return null
            const classes = [...new Set(rows.map(r => r.vehicle_category))]
            const trips = [...new Set(rows.map(r => r.label))]
            const find = (trip: string, cls: string) => rows.find(r => r.label === trip && r.vehicle_category === cls)
            return (
              <div key={type} style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 500, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>{title}</h3>
                <div style={{ overflowX: 'auto', border: '1px solid var(--bw-border)', borderRadius: 10, backgroundColor: 'var(--bw-bg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-text)' }}>
                    <thead>
                      <tr>
                        <th scope="col" style={{ ...cell, textAlign: 'left', fontWeight: 500, color: 'var(--bw-muted)', fontSize: 12 }}>Trip</th>
                        {classes.map(c => (
                          <th key={c} scope="col" style={{ ...cell, fontWeight: 500, color: 'var(--bw-muted)', fontSize: 12 }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map(trip => (
                        <tr key={trip}>
                          <th scope="row" style={{ ...cell, textAlign: 'left', fontWeight: 400 }}>{trip}</th>
                          {classes.map(c => {
                            const r = find(trip, c)
                            return (
                              <td key={c} style={{ ...cell, ...mono }}>
                                {r ? money(r.total) : '-'}
                                {r && r.deposit > 0 && (
                                  <div style={{ fontSize: 11, color: 'var(--bw-muted)' }}>{money(r.deposit)} deposit</div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
