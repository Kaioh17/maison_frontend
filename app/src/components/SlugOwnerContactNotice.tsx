/**
 * Shown when slug verification indicates the tenant exists but the guest site
 * is not open (HTTP 403, API error codes, or flags such as guest_site_enabled).
 * Copy avoids implying account or verification status; directs users to the limo owner.
 */
export default function SlugOwnerContactNotice() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Work Sans, sans-serif',
        backgroundColor: 'var(--bw-bg)',
        padding: 'clamp(20px, 4vw, 40px)',
        color: 'var(--bw-text)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '560px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(26px, 4vw, 34px)',
            fontWeight: '600',
            margin: '0 0 clamp(12px, 2vw, 16px) 0',
            color: 'var(--bw-text)',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: '1.25',
          }}
        >
          This page isn’t available yet
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            color: 'var(--bw-muted, var(--bw-text))',
            margin: '0 0 clamp(20px, 3vw, 28px) 0',
            lineHeight: '1.65',
            opacity: 0.92,
          }}
        >
          This link isn’t ready for guests yet. Please reach out to the limo service owner—they can
          help you with the right link or complete your booking another way.
        </p>
        <div
          style={{
            padding: 'clamp(18px, 3vw, 22px)',
            backgroundColor: 'var(--bw-card-bg, var(--bw-bg))',
            borderRadius: '8px',
            border: '1px solid var(--bw-border)',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--bw-text)',
              margin: '0',
              lineHeight: '1.7',
              opacity: 0.95,
            }}
          >
            If you were sent here by email or text, forward that message to the limo service owner
            and ask them to confirm the address they want you to use.
          </p>
        </div>
      </div>
    </div>
  )
}
