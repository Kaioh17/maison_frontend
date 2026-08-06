import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import MaisonDarkModeLogo from '@components/MaisonDarkModeLogo'
import MaisonWordmark from '@components/MaisonWordmark'

const EFFECTIVE_DATE = 'June 14, 2026'

const sections: { title: string; content: ReactNode }[] = [
  {
    title: 'Acceptance of Terms',
    content: (
      <>
        <p>
          By accessing or using the Maison platform — whether as an operator (tenant), driver, or rider — you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you are accepting these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms, and references to "you" mean that entity.
        </p>
        <p>
          If you do not agree to these Terms, do not access or use the Service. Your continued use of Maison after any modification to these Terms constitutes your acceptance of the updated Terms.
        </p>
      </>
    ),
  },
  {
    title: 'Description of the Service',
    content: (
      <>
        <p>
          Maison is a multi-tenant software-as-a-service (SaaS) platform that enables ground transportation operators ("Operators" or "tenants") to manage fleets, drivers, and passenger bookings under their own branded subdomain. The platform serves three distinct user roles:
        </p>
        <ul>
          <li><strong>Operators (tenants)</strong> — businesses or individuals who subscribe to Maison to run a branded ride-hailing or ground transportation operation.</li>
          <li><strong>Drivers</strong> — individuals who are onboarded by an Operator to fulfill transportation bookings.</li>
          <li><strong>Riders</strong> — end customers who book rides through an Operator's branded interface.</li>
        </ul>
        <p>
          Maison provides the software infrastructure, including booking management, driver coordination, payment processing via Stripe, and white-label branding tools. Maison is not a transportation provider, carrier, or employer of drivers. All transportation services are provided by Operators and their drivers, not by Maison.
        </p>
      </>
    ),
  },
  {
    title: 'Account Responsibilities',
    content: (
      <>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information when creating your account and keep it up to date.</li>
          <li>Immediately notify Maison of any unauthorized use of your account or any other breach of security.</li>
          <li>Not share your login credentials with any other person or entity.</li>
          <li>Not create multiple accounts for the same individual or entity without Maison's express written permission.</li>
        </ul>
        <p>
          <strong>Operators</strong> are additionally responsible for the conduct of all drivers and riders they onboard onto the platform, for ensuring that drivers hold any required licenses and insurance, and for compliance with applicable transportation regulations in their jurisdiction.
        </p>
        <p>
          Maison reserves the right to suspend or terminate accounts that we reasonably believe have been compromised, are being used in violation of these Terms, or for which required information is inaccurate or fraudulent.
        </p>
      </>
    ),
  },
  {
    title: 'Use of the Service',
    content: (
      <>
        <p>
          You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that:
        </p>
        <ul>
          <li>Violates any applicable federal, state, local, or international law or regulation.</li>
          <li>Is fraudulent, deceptive, or misleading.</li>
          <li>Infringes, misappropriates, or violates the intellectual property rights of any third party.</li>
          <li>Transmits unsolicited or unauthorized advertising or promotional material.</li>
          <li>Impersonates any person or entity or misrepresents your affiliation with a person or entity.</li>
          <li>Interferes with, disrupts, or creates an undue burden on the Service or its infrastructure.</li>
          <li>Attempts to gain unauthorized access to any portion of the Service or any related systems or networks.</li>
        </ul>
        <p>
          Operators must hold all required business licenses, transportation permits, and insurance policies required by the jurisdictions in which they operate. Maison does not verify driver credentials on behalf of Operators and assumes no liability for Operator non-compliance.
        </p>
      </>
    ),
  },
  {
    title: 'Payments and Billing',
    content: (
      <>
        <p>
          <strong>Operator subscriptions.</strong> Operators are billed on a recurring subscription basis. By subscribing, you authorize Maison to charge your payment method on a recurring basis at the rate and frequency displayed at the time of purchase. All fees are non-refundable except as required by applicable law or as expressly stated in these Terms.
        </p>
        <p>
          <strong>Rider payments.</strong> Payments from riders to Operators are processed through Stripe, Inc. ("Stripe") on behalf of the applicable Operator. By making a payment through the platform, you agree to Stripe's Terms of Service (<a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer">stripe.com/legal</a>). Maison does not store full card numbers or payment credentials.
        </p>
        <p>
          <strong>Stripe Connect.</strong> Operators who collect payments through the platform must connect a Stripe account. Payouts to Operators are governed by the Stripe Connected Account Agreement. Maison acts as a platform and is not liable for failed payouts due to Stripe account status, bank issues, or regulatory holds.
        </p>
        <p>
          <strong>Taxes.</strong> You are responsible for all applicable taxes arising from your use of the Service. Maison may be required by law to collect and remit certain taxes; where applicable, such amounts will be disclosed at the time of transaction.
        </p>
        <p>
          <strong>Price changes.</strong> Maison reserves the right to change subscription pricing with at least 30 days' advance written notice. Continued use of the Service after the effective date of a price change constitutes acceptance of the new pricing.
        </p>
      </>
    ),
  },
  {
    title: 'Intellectual Property',
    content: (
      <>
        <p>
          The Service and all content, features, and functionality thereof — including but not limited to software, text, graphics, logos, and user interfaces — are owned by Maison or its licensors and are protected by copyright, trademark, and other intellectual property laws.
        </p>
        <p>
          <strong>License to use.</strong> Subject to your compliance with these Terms and payment of applicable fees, Maison grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your internal business purposes.
        </p>
        <p>
          <strong>Your content.</strong> You retain ownership of any content you upload to the Service (such as company logos, driver information, or booking data). By uploading content, you grant Maison a non-exclusive, worldwide, royalty-free license to host, store, and display that content solely as necessary to provide the Service.
        </p>
        <p>
          You may not copy, modify, distribute, sell, or lease any part of the Service, nor may you reverse-engineer or attempt to extract the source code of the Service, unless applicable law prohibits this restriction.
        </p>
      </>
    ),
  },
  {
    title: 'Privacy',
    content: (
      <>
        <p>
          Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference. The Privacy Policy describes how we collect, use, and share information about you when you use the Service.
        </p>
        <p>
          <strong>Data processing.</strong> Where Maison processes personal data on behalf of an Operator, Maison acts as a data processor and the Operator acts as the data controller. Operators are responsible for ensuring they have a lawful basis to collect and process rider and driver personal data and for providing required privacy notices to their users.
        </p>
        <p>
          <strong>Data security.</strong> Maison implements industry-standard technical and organizational measures to protect data from unauthorized access, loss, or disclosure. However, no method of transmission over the internet or electronic storage is completely secure, and Maison cannot guarantee absolute security.
        </p>
        <p>
          <strong>Data retention.</strong> We retain your data for as long as your account is active or as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account data by contacting us; certain data may be retained for legal compliance purposes.
        </p>
      </>
    ),
  },
  {
    title: 'Prohibited Conduct',
    content: (
      <>
        <p>In addition to the general use restrictions above, you expressly agree not to:</p>
        <ul>
          <li>Use the platform to facilitate transportation that violates applicable laws, including operating without required permits or insurance.</li>
          <li>Manipulate, falsify, or misrepresent booking records, ride distances, fares, or driver assignments.</li>
          <li>Use automated systems or bots to access, scrape, or interact with the Service without Maison's express written consent.</li>
          <li>Introduce viruses, malware, or any other harmful code into the Service.</li>
          <li>Attempt to probe, scan, or test the vulnerability of any Maison system or network.</li>
          <li>Use another user's account or impersonate another user.</li>
          <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which could harm Maison or users of the Service.</li>
          <li>Resell or sublicense access to the Service without Maison's express written authorization.</li>
          <li>Use the Service to discriminate against drivers or riders on the basis of race, color, national origin, religion, sex, disability, or any other characteristic protected by law.</li>
        </ul>
        <p>
          Violation of these prohibitions may result in immediate termination of your account and may expose you to civil or criminal liability.
        </p>
      </>
    ),
  },
  {
    title: 'Termination',
    content: (
      <>
        <p>
          <strong>By you.</strong> You may cancel your account at any time through the account settings page. Cancellation takes effect at the end of the current billing period; no partial refunds are issued for unused subscription time.
        </p>
        <p>
          <strong>By Maison.</strong> Maison may suspend or terminate your access to the Service at any time, with or without cause, with or without notice, for conduct that Maison believes violates these Terms, is harmful to other users, Maison, or third parties, or for any other reason in Maison's sole discretion. If Maison terminates your account without cause, Maison will provide a pro-rated refund for the unused portion of your current billing period.
        </p>
        <p>
          <strong>Effect of termination.</strong> Upon termination: (a) your license to use the Service ends immediately; (b) Maison may delete your account data after a reasonable retention period; (c) any accrued payment obligations survive termination. Sections of these Terms that by their nature should survive termination will survive, including Intellectual Property, Limitation of Liability, Indemnification, and Governing Law.
        </p>
      </>
    ),
  },
  {
    title: 'Disclaimers',
    content: (
      <>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          MAISON DOES NOT WARRANT THAT (A) THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE; (B) ANY DEFECTS WILL BE CORRECTED; OR (C) THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
        </p>
        <p>
          MAISON IS A SOFTWARE PLATFORM ONLY. MAISON DOES NOT EMPLOY DRIVERS, OPERATE VEHICLES, OR PROVIDE TRANSPORTATION SERVICES. ALL TRANSPORTATION SERVICES ARE PROVIDED SOLELY BY OPERATORS AND THEIR DRIVERS. MAISON MAKES NO REPRESENTATIONS OR WARRANTIES REGARDING THE QUALITY, SAFETY, OR LEGALITY OF ANY TRANSPORTATION SERVICE FACILITATED THROUGH THE PLATFORM.
        </p>
      </>
    ),
  },
  {
    title: 'Limitation of Liability',
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL MAISON, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES — INCLUDING LOST PROFITS, LOSS OF DATA, LOSS OF GOODWILL, PERSONAL INJURY, OR PROPERTY DAMAGE — ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE.
        </p>
        <p>
          MAISON'S TOTAL CUMULATIVE LIABILITY TO YOU ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE SERVICE, WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, WILL NOT EXCEED THE GREATER OF (A) THE TOTAL FEES YOU PAID TO MAISON IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
        </p>
        <p>
          SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CERTAIN DAMAGES. IN SUCH JURISDICTIONS, MAISON'S LIABILITY WILL BE LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.
        </p>
      </>
    ),
  },
  {
    title: 'Indemnification',
    content: (
      <>
        <p>
          You agree to indemnify, defend, and hold harmless Maison and its affiliates, directors, officers, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with:
        </p>
        <ul>
          <li>Your use of the Service or any transaction facilitated through the Service.</li>
          <li>Your violation of these Terms.</li>
          <li>Your violation of any applicable law or the rights of any third party.</li>
          <li>Any transportation service provided by you or your drivers to riders.</li>
          <li>Any content you upload to or transmit through the Service.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Governing Law and Dispute Resolution',
    content: (
      <>
        <p>
          These Terms are governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.
        </p>
        <p>
          <strong>Informal resolution.</strong> Before filing a formal claim, you agree to contact Maison at the address below and attempt to resolve any dispute informally for at least 30 days.
        </p>
        <p>
          <strong>Arbitration.</strong> Except for claims for injunctive or equitable relief, any dispute, claim, or controversy arising out of or relating to these Terms or the Service will be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitration will be conducted in English. The arbitrator's decision will be final and binding and may be entered as a judgment in any court of competent jurisdiction.
        </p>
        <p>
          <strong>Class action waiver.</strong> YOU AND MAISON EACH WAIVE ANY RIGHT TO BRING OR PARTICIPATE IN A CLASS ACTION, CLASS-WIDE ARBITRATION, OR REPRESENTATIVE ACTION.
        </p>
        <p>
          <strong>Small claims.</strong> Notwithstanding the foregoing, either party may bring an individual action in small claims court for disputes within that court's jurisdiction.
        </p>
      </>
    ),
  },
  {
    title: 'Changes to Terms',
    content: (
      <>
        <p>
          Maison reserves the right to modify these Terms at any time. When we make material changes, we will provide notice by updating the "Last Updated" date at the top of this page and, where appropriate, by sending an email to the address associated with your account or by displaying a prominent notice within the Service.
        </p>
        <p>
          Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes. If you do not agree to the updated Terms, you must stop using the Service.
        </p>
        <p>
          We encourage you to review these Terms periodically to stay informed about your rights and obligations.
        </p>
      </>
    ),
  },
  {
    title: 'Contact',
    content: (
      <>
        <p>
          If you have questions or concerns about these Terms or the Service, please contact us:
        </p>
        <ul>
          <li><strong>Email:</strong> legal@usemaison.io</li>
          <li><strong>Support:</strong> support@usemaison.io</li>
          <li><strong>Mailing address:</strong> Maison Technologies, Inc., Legal Department, [Address on file]</li>
        </ul>
        <p>
          For billing inquiries, log in to your account and visit the Plans &amp; Billing section, or email support@usemaison.io with your account information.
        </p>
      </>
    ),
  },
]

export default function Terms() {
  return (
    <main className="bw" style={{ minHeight: '100vh', backgroundColor: 'var(--bw-bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: 48 }}>
          <MaisonDarkModeLogo height={44} />
          <MaisonWordmark color={null} style={{ fontSize: '1.3rem', display: 'inline-block', verticalAlign: 'middle' }} />
        </div>

        <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 200, fontSize: 40, margin: '0 0 8px 0' }}>Terms of Service</h1>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 13, color: 'var(--bw-muted)', marginBottom: 8 }}>
          Last updated: {EFFECTIVE_DATE}
        </p>
        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', marginBottom: 40, lineHeight: 1.6 }}>
          These Terms of Service govern your access to and use of Maison, a software platform for ground transportation operators.
          Please read them carefully before using the Service. These Terms constitute a legally binding agreement between you and
          Maison Technologies, Inc. ("Maison," "we," "our," or "us").
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
