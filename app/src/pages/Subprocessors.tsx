import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import MaisonDarkModeLogo from '@components/MaisonDarkModeLogo'
import MaisonWordmark from '@components/MaisonWordmark'

const EFFECTIVE_DATE = 'July 18, 2026'

type Subprocessor = {
  name: string
  purpose: string
  /** Grounded in what the code actually transmits — see the audit note per entry. */
  dataCategories: string[]
  location: string
  site?: string
  siteLabel?: string
}

const subprocessors: Subprocessor[] = [
  {
    name: 'Stripe, Inc.',
    purpose:
      'Rider card payments and Stripe Connect payouts to Operators and drivers. Charges are created directly on the Operator’s connected account; Maison collects a platform fee on top.',
    dataCategories: [
      'Rider name, email address, and card details — card data is collected by Stripe directly and never reaches Maison’s servers',
      'Payment amount, currency, payment status, and receipt email address',
      'Booking reference identifiers (booking, rider, and tenant IDs) attached as payment metadata',
      'Operator and driver payout identity and bank details collected during Stripe Connect onboarding',
    ],
    location: 'United States, with global processing',
    site: 'https://stripe.com/privacy',
    siteLabel: 'stripe.com/privacy',
  },
  {
    name: 'Mapbox, Inc.',
    purpose:
      'Address autocomplete and route distance and duration lookups, used to estimate fares at the time a booking is priced.',
    dataCategories: [
      'Pickup and dropoff addresses, including partial address text as it is typed into the search field',
      'Derived route distance and duration',
    ],
    location: 'United States',
    site: 'https://www.mapbox.com/legal/privacy',
    siteLabel: 'mapbox.com/legal/privacy',
  },
  {
    name: 'Resend (Plus Five Five, Inc.)',
    purpose:
      'Delivery of transactional email — booking confirmations, driver invitations, password resets, receipts, and account notices. Maison sends no marketing email through this channel.',
    dataCategories: [
      'Recipient name and email address',
      'Message content, which may include booking details such as pickup time, locations, assigned driver, and price',
    ],
    location: 'United States',
    site: 'https://resend.com/legal/privacy-policy',
    siteLabel: 'resend.com/legal/privacy-policy',
  },
  {
    name: 'Supabase, Inc.',
    purpose:
      'Object storage for assets uploaded by Operators. Stored assets are served from public buckets so that branded sites can display them without authentication.',
    dataCategories: [
      'Operator logos and favicons',
      'Vehicle images uploaded by an Operator',
    ],
    location: 'United States',
    site: 'https://supabase.com/privacy',
    siteLabel: 'supabase.com/privacy',
  },
  {
    name: 'Cloudflare, Inc.',
    purpose:
      'DNS, TLS termination, and content delivery for usemaison.io and Operator subdomains. Traffic to the Service passes through Cloudflare’s network before reaching our application servers.',
    dataCategories: [
      'IP address, request metadata, and browser user-agent',
      'Encrypted request and response content in transit',
    ],
    location: 'Global edge network',
    site: 'https://www.cloudflare.com/privacypolicy/',
    siteLabel: 'cloudflare.com/privacypolicy',
  },
  {
    name: 'Self-hosted application infrastructure',
    purpose:
      'The Maison application, its PostgreSQL database, and its Redis cache run on infrastructure operated directly by Maison rather than by a managed cloud provider. No third party processes this data on our behalf.',
    dataCategories: [
      'All account, booking, driver, rider, vehicle, and financial records described in the Privacy Policy',
      'Application and security logs, including IP addresses used for rate limiting',
    ],
    location: 'United States',
  },
]

const intro: ReactNode = (
  <>
    <p>
      Maison uses a small number of third-party services ("subprocessors") to operate the platform. Each one processes
      personal information on our behalf, for the limited purpose described below and under contract.
    </p>
    <p>
      Where Maison acts as a <strong>processor</strong> for an Operator — which is the case for all driver and rider data — the
      services listed here act as that Operator’s subprocessors in turn. This page is the notice of who they are. It should be
      read alongside our{' '}
      <Link to="/privacy" style={{ color: 'var(--bw-text)', textDecoration: 'underline' }}>Privacy Policy</Link> and{' '}
      <Link to="/terms" style={{ color: 'var(--bw-text)', textDecoration: 'underline' }}>Terms of Service</Link>.
    </p>
    <p>
      We will update this page before adding a new subprocessor that processes personal information, and Operators with an
      active subscription will be notified by email at the address on their account.
    </p>
  </>
)

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--bw-muted)',
        }}
      >
        {label}
      </span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--bw-text)' }}>{children}</div>
    </div>
  )
}

export default function Subprocessors() {
  return (
    <main className="bw" style={{ minHeight: '100vh', backgroundColor: 'var(--bw-bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: 48 }}>
          <MaisonDarkModeLogo height={44} />
          <MaisonWordmark color={null} style={{ fontSize: '1.3rem', display: 'inline-block', verticalAlign: 'middle' }} />
        </div>

        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 200, fontSize: 40, margin: '0 0 8px 0' }}>Subprocessors</h1>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 13, color: 'var(--bw-muted)', marginBottom: 8 }}>
          Last updated: {EFFECTIVE_DATE}
        </p>
        <div
          style={{
            fontFamily: 'Work Sans, sans-serif',
            fontSize: 14,
            color: 'var(--bw-muted)',
            marginBottom: 40,
            lineHeight: 1.6,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {intro}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--bw-border)',
            paddingTop: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            fontFamily: 'Work Sans, sans-serif',
            color: 'var(--bw-text)',
          }}
        >
          {subprocessors.map((sp, i) => (
            <div key={sp.name}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 20, margin: '0 0 12px 0' }}>
                <span style={{ color: 'var(--bw-muted)', fontWeight: 300, fontSize: 15, marginRight: 10 }}>{i + 1}.</span>
                {sp.name}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="Purpose of processing">{sp.purpose}</Field>
                <Field label="Data categories">
                  <ul style={{ margin: 0, paddingLeft: '1.25em' }}>
                    {sp.dataCategories.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </Field>
                <Field label="Processing location">{sp.location}</Field>
                {sp.site ? (
                  <Field label="Privacy notice">
                    <a
                      href={sp.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--bw-text)', textDecoration: 'underline', wordBreak: 'break-word' }}
                    >
                      {sp.siteLabel ?? sp.site}
                    </a>
                  </Field>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--bw-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/privacy" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', textDecoration: 'underline' }}>
            ← Back to Privacy Policy
          </Link>
          <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 12, color: 'var(--bw-muted)' }}>
            © {new Date().getFullYear()} Maison Technologies, Inc. All rights reserved.
          </span>
        </div>
      </div>
    </main>
  )
}
