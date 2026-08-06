import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import MaisonDarkModeLogo from '@components/MaisonDarkModeLogo'
import MaisonWordmark from '@components/MaisonWordmark'

const EFFECTIVE_DATE = 'July 18, 2026'

const sections: { title: string; content: ReactNode }[] = [
  {
    title: 'Our Role: Controller and Processor',
    content: (
      <>
        <p>
          Maison is a multi-tenant platform. Each ground transportation operator ("Operator" or "tenant") runs its own branded
          instance of the Service on its own subdomain, with its own fleet, drivers, and riders. Who is responsible for your
          personal information depends on how you use Maison:
        </p>
        <ul>
          <li>
            <strong>For Operators.</strong> When an Operator signs up for Maison, we act as the <strong>controller</strong> of that
            Operator's own account data — the business contact who registered, company details, billing, and subscription status.
          </li>
          <li>
            <strong>For drivers and riders.</strong> When an Operator onboards drivers or takes bookings from riders, the{' '}
            <strong>Operator is the controller</strong> of that data and Maison acts as a <strong>processor</strong>, handling it on
            the Operator's instructions in order to provide the Service.
          </li>
        </ul>
        <p>
          In practice this means that if you are a driver or a rider, your relationship is primarily with the Operator whose branded
          site you used. Requests to access, correct, or delete your data are usually best directed to that Operator first — though
          you may always contact us and we will route your request appropriately.
        </p>
        <p>
          Data on Maison is segregated by tenant. One Operator cannot see another Operator's drivers, riders, bookings, or financial
          records.
        </p>
      </>
    ),
  },
  {
    title: 'Information We Collect',
    content: (
      <>
        <p>We collect the following categories of information, depending on your role.</p>
        <p><strong>Operator (tenant) accounts.</strong></p>
        <ul>
          <li>Name, email address, phone number, and a hashed password.</li>
          <li>Company name, business address, city, company logo, and chosen subdomain (slug).</li>
          <li>Subscription plan, subscription status, and payment identifiers held by our payment processor.</li>
          <li>Operational statistics such as driver counts and ride counts.</li>
        </ul>
        <p><strong>Driver accounts.</strong></p>
        <ul>
          <li>Name, email address, phone number, state, and postal code.</li>
          <li>A hashed password, or an invitation token where the Operator onboards you by link.</li>
          <li>Driver licence number and the status of any background check the Operator has requested.</li>
          <li>Payout account identifiers held by our payment processor, and onboarding completion status.</li>
          <li>Availability status, assigned vehicle, and completed ride counts.</li>
        </ul>
        <p><strong>Rider accounts and bookings.</strong></p>
        <ul>
          <li>Name, email address, phone number, and a hashed password.</li>
          <li>Address, city, state, country, and postal code, where provided.</li>
          <li>
            Booking details: pickup and dropoff locations, pickup and dropoff times, service type (including airport direction),
            vehicle category, estimated price, duration, and any notes you add to a booking.
          </li>
          <li>
            Payment method, payment status, and payment identifiers; where an Operator accepts Zelle, the Zelle email or number you
            supply.
          </li>
          <li>Ratings and written review comments you leave after a ride.</li>
          <li>Cancellation reasons, where a ride is cancelled.</li>
        </ul>
        <p><strong>Collected automatically.</strong></p>
        <ul>
          <li>Log and request data, including IP address, which we use for rate limiting and abuse prevention.</li>
          <li>Basic device and browser information sent by your browser when you use the Service.</li>
        </ul>
        <p>
          <strong>We do not store your full card number.</strong> Card details are collected and stored directly by Stripe. Maison
          receives only tokenised payment identifiers and the resulting payment status.
        </p>
      </>
    ),
  },
  {
    title: 'How We Use Your Information',
    content: (
      <>
        <p>We use personal information to:</p>
        <ul>
          <li>Create and authenticate accounts, and keep sessions secure.</li>
          <li>Create, price, dispatch, and fulfil bookings, and match riders with drivers and vehicles.</li>
          <li>Calculate route distance and duration in order to estimate fares.</li>
          <li>Process rider payments, Operator subscriptions, and driver and Operator payouts.</li>
          <li>Send transactional email — booking confirmations, driver invitations, password resets, receipts, and account notices.</li>
          <li>Provide Operators with analytics and reporting about their own fleet, drivers, riders, and revenue.</li>
          <li>Maintain the security and integrity of the Service, including rate limiting, fraud prevention, and abuse investigation.</li>
          <li>Comply with legal, tax, and accounting obligations, and enforce our Terms of Service.</li>
        </ul>
        <p>
          We do <strong>not</strong> sell personal information, and we do not use rider or driver data to serve third-party
          advertising.
        </p>
      </>
    ),
  },
  {
    title: 'Legal Bases for Processing',
    content: (
      <>
        <p>Where the GDPR, UK GDPR, or a similar law applies, we rely on the following legal bases:</p>
        <ul>
          <li><strong>Performance of a contract</strong> — to create your account, fulfil bookings, and take payment.</li>
          <li>
            <strong>Legitimate interests</strong> — to secure the Service, prevent fraud and abuse, and improve the platform,
            balanced against your rights.
          </li>
          <li><strong>Legal obligation</strong> — to keep financial and tax records and to respond to lawful requests.</li>
          <li>
            <strong>Consent</strong> — where we ask for it, such as for optional marketing communications. You may withdraw consent
            at any time.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: 'How We Share Information',
    content: (
      <>
        <p>We share personal information only as described below.</p>
        <ul>
          <li>
            <strong>Within a tenant.</strong> An Operator can see the drivers, riders, bookings, ratings, and payment status
            associated with its own account. A driver assigned to a booking sees the rider's name, contact details, and the pickup
            and dropoff information necessary to perform the ride. A rider sees the assigned driver's name and vehicle.
          </li>
          <li>
            <strong>Stripe</strong> — payment processing for rider payments and Stripe Connect for Operator and driver payouts.
            Stripe acts as an independent controller for the payment data it collects and is subject to its own privacy policy.
          </li>
          <li>
            <strong>Mapbox</strong> — address autocomplete and route distance and duration lookups used to price bookings. Pickup and
            dropoff addresses are sent to Mapbox for this purpose.
          </li>
          <li>
            <strong>Resend</strong> — delivery of transactional email. Recipient name and email address are shared to deliver the
            message.
          </li>
          <li><strong>Supabase</strong> — object storage for uploaded assets such as Operator logos and vehicle images.</li>
          <li>
            <strong>Cloudflare</strong> — DNS, TLS, and content delivery for the Service. Request metadata, including IP address,
            passes through Cloudflare's network before reaching our servers.
          </li>
          <li>
            <strong>Our own infrastructure</strong> — the application, its PostgreSQL database, and its Redis cache run on
            infrastructure we operate directly, not on a managed cloud provider.
          </li>
          <li>
            <strong>Legal and safety</strong> — where we are required by law, court order, or valid governmental request, or where
            disclosure is necessary to protect the rights, property, or safety of Maison, our users, or the public.
          </li>
          <li>
            <strong>Business transfers</strong> — in connection with a merger, acquisition, financing, or sale of assets, subject to
            this Policy continuing to apply to the transferred information.
          </li>
        </ul>
        <p>
          Our{' '}
          <Link to="/subprocessors" style={{ color: 'var(--bw-text)', textDecoration: 'underline' }}>Subprocessors page</Link>{' '}
          lists each third-party service we use, what it processes, and why.
        </p>
      </>
    ),
  },
  {
    title: 'Cookies and Local Storage',
    content: (
      <>
        <p>
          Maison uses browser storage that is strictly necessary to operate the Service. We store your authentication token so you
          stay signed in, along with interface preferences such as your light or dark theme selection and cached booking state.
        </p>
        <p>
          We do not use advertising cookies or third-party cross-site tracking. Third parties we embed — notably Stripe's payment
          components — may set their own cookies necessary for payment processing and fraud prevention, governed by their own
          policies.
        </p>
        <p>Clearing your browser storage will sign you out and reset your interface preferences.</p>
      </>
    ),
  },
  {
    title: 'Data Retention',
    content: (
      <>
        <p>We retain personal information for as long as an account remains active and for as long as needed to provide the Service.</p>
        <ul>
          <li>Account records are retained while the account is open, and deleted or anonymised after closure subject to the exceptions below.</li>
          <li>Booking and payment records are retained for the period required by tax, accounting, and anti-fraud obligations, typically seven years.</li>
          <li>Ratings and reviews may be retained in aggregate or anonymised form after an account is closed.</li>
          <li>Security and rate-limiting logs are retained for a short period, typically no more than 90 days.</li>
        </ul>
        <p>
          When an Operator's account is closed, the driver and rider records scoped to that Operator are deleted with it, except
          where we must retain financial records.
        </p>
      </>
    ),
  },
  {
    title: 'Your Rights',
    content: (
      <>
        <p>
          Depending on where you live, you may have the right to access the personal information we hold about you, correct
          inaccurate information, request deletion, object to or restrict certain processing, receive a portable copy of your data,
          and withdraw consent where processing is based on consent.
        </p>
        <p>
          If you are in California, you additionally have the right to know what personal information is collected and disclosed, to
          request deletion or correction, and not to be discriminated against for exercising these rights. Maison does not sell or
          share personal information for cross-context behavioural advertising.
        </p>
        <p>
          To exercise a right, contact your Operator if you are a driver or a rider, or email us at privacy@usemaison.io. We may
          need to verify your identity before acting, and we aim to respond within 30 days. If you are in the EEA or UK, you also
          have the right to lodge a complaint with your local supervisory authority.
        </p>
      </>
    ),
  },
  {
    title: 'Security',
    content: (
      <>
        <p>
          We take reasonable technical and organisational measures to protect personal information. Passwords are stored hashed,
          never in plain text. Access to the API requires a signed, role-scoped token, and every request is scoped to a single
          tenant so data cannot cross operator boundaries. Traffic is encrypted in transit, requests are rate limited, and
          administrative access to production systems is restricted.
        </p>
        <p>
          No method of transmission or storage is completely secure, and we cannot guarantee absolute security. If we become aware of
          a breach affecting your personal information, we will notify you and any applicable regulator as required by law.
        </p>
      </>
    ),
  },
  {
    title: 'International Transfers',
    content: (
      <>
        <p>
          Maison and its service providers operate in the United States and other countries. If you access the Service from outside
          those countries, your information may be transferred to, stored in, and processed in a jurisdiction whose data protection
          laws differ from your own. Where required, we rely on appropriate safeguards such as the European Commission's Standard
          Contractual Clauses.
        </p>
      </>
    ),
  },
  {
    title: "Children's Privacy",
    content: (
      <>
        <p>
          Maison is not directed to children. The Service is intended for users aged 18 and over, and we do not knowingly collect
          personal information from children under 13 (or the equivalent minimum age in your jurisdiction). If we learn we have
          collected such information, we will delete it. If you believe a child has provided us with personal information, contact us
          at privacy@usemaison.io.
        </p>
      </>
    ),
  },
  {
    title: 'Changes to This Policy',
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this
          page. If the changes are material, we will provide additional notice — such as by email or an in-product notice — before
          the changes take effect. Your continued use of the Service after an update takes effect constitutes acceptance of the
          revised Policy.
        </p>
      </>
    ),
  },
  {
    title: 'Contact',
    content: (
      <>
        <p>If you have questions about this Policy or how your information is handled, please contact us:</p>
        <ul>
          <li><strong>Privacy:</strong> privacy@usemaison.io</li>
          <li><strong>Legal:</strong> legal@usemaison.io</li>
          <li><strong>Support:</strong> support@usemaison.io</li>
          <li><strong>Mailing address:</strong> Maison Technologies, Inc., Legal Department, [Address on file]</li>
        </ul>
        <p>
          If you are a driver or a rider, you may also contact the Operator whose branded site you used, since that Operator controls
          your data.
        </p>
      </>
    ),
  },
]

export default function Privacy() {
  return (
    <main className="bw" style={{ minHeight: '100vh', backgroundColor: 'var(--bw-bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: 48 }}>
          <MaisonDarkModeLogo height={44} />
          <MaisonWordmark color={null} style={{ fontSize: '1.3rem', display: 'inline-block', verticalAlign: 'middle' }} />
        </div>

        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 200, fontSize: 40, margin: '0 0 8px 0' }}>Privacy Policy</h1>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 13, color: 'var(--bw-muted)', marginBottom: 8 }}>
          Last updated: {EFFECTIVE_DATE}
        </p>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', marginBottom: 40, lineHeight: 1.6 }}>
          This Privacy Policy explains how Maison Technologies, Inc. ("Maison," "we," "our," or "us") collects, uses, shares, and
          protects personal information when you use Maison as an operator, a driver, or a rider. It should be read alongside our{' '}
          <Link to="/terms" style={{ color: 'var(--bw-text)', textDecoration: 'underline' }}>Terms of Service</Link>.
        </p>

        <div style={{ borderTop: '1px solid var(--bw-border)', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 32, fontFamily: 'Work Sans, sans-serif', color: 'var(--bw-text)' }}>
          {sections.map((section, i) => (
            <div key={section.title}>
              <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 20, margin: '0 0 12px 0' }}>
                <span style={{ color: 'var(--bw-muted)', fontWeight: 300, fontSize: 15, marginRight: 10 }}>{i + 1}.</span>
                {section.title}
              </h2>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--bw-text)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--bw-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/tenant/login" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', textDecoration: 'underline' }}>
            ← Back to sign in
          </Link>
          <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 12, color: 'var(--bw-muted)' }}>
            © {new Date().getFullYear()} Maison Technologies, Inc. All rights reserved.
          </span>
        </div>
      </div>
    </main>
  )
}
