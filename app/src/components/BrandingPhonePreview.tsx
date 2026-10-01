import { useState, type CSSProperties } from 'react'
import { ArrowRight, Car, Phone, UserCircle } from '@phosphor-icons/react'
import Tabs from '@components/Tabs'
import StatusPill from '@components/StatusPill'
import RiderMapPlaceholder from '@components/RiderMapPlaceholder'
import { brandingCssVars, type BrandingColorInput } from '@utils/colorTokens'

export interface BrandingPhonePreviewProps {
  /** Live (possibly unsaved) branding values from the settings form. */
  branding: BrandingColorInput & { theme?: string | null; phone?: string | null; enable_branding?: boolean }
  /** Logo to show - the not-yet-uploaded file preview wins over the saved URL. */
  logoUrl?: string | null
  companyName: string
}

const SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'login', label: 'Sign in' },
  { id: 'book', label: 'Book' },
  { id: 'trips', label: 'Trips' },
] as const
type ScreenId = (typeof SCREENS)[number]['id']

// Everything reads --bw-* / --rider-* so the preview re-skins exactly like RiderBrandedShell does.
export const PHONE_PREVIEW_CSS = `
.bpp { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.bpp-frame {
  width: 290px; height: min(590px, calc(var(--app-h) - 150px)); min-height: 440px; box-sizing: border-box; padding: 9px;
  border-radius: 40px; border: 1px solid var(--bw-border-strong);
  background: black; box-shadow: var(--bw-shadow, 0 18px 40px -18px rgba(0,0,0,.5));
}
.bpp-screen {
  position: relative; height: 100%; overflow: hidden; border-radius: 32px;
  background: var(--bw-bg); color: var(--bw-text);
  font-family: "Work Sans", sans-serif; font-size: 12px; line-height: 1.45;
  display: flex; flex-direction: column;
}
.bpp-status { display: flex; justify-content: space-between; padding: 10px 22px 4px; font-size: 10px; font-weight: 600; flex-shrink: 0; }
.bpp-notch { position: absolute; top: 7px; left: 50%; width: 76px; height: 20px; margin-left: -38px; border-radius: 12px; background: black; }
.bpp-body { flex: 1; min-height: 0; overflow: hidden; padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 12px; }
.bpp-brand { display: flex; align-items: center; gap: 8px; font-family: "DM Sans", sans-serif; font-size: 14px; font-weight: 500; }
.bpp-logo { width: 26px; height: 26px; border-radius: 7px; object-fit: contain; }
.bpp-logo--ph { display: grid; place-items: center; background: var(--bw-accent); color: var(--rider-on-primary); font-size: 12px; font-weight: 600; }
.bpp-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--bw-muted); }
.bpp-eyebrow::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--bw-accent); }
.bpp-title { margin: 0; font-family: "DM Sans", sans-serif; font-size: 22px; font-weight: 300; line-height: 1.15; }
.bpp-muted { color: var(--bw-muted); }
.bpp-card { border: 1px solid var(--bw-border); border-radius: 14px; background: var(--bw-bg-secondary); padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.bpp-card-title { font-family: "DM Sans", sans-serif; font-size: 13px; font-weight: 500; }
.bpp-btn { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 34px; border-radius: 10px; border: 1px solid transparent; font-size: 12px; font-weight: 600; background: var(--bw-accent); color: var(--rider-on-primary); }
.bpp-btn--ghost { background: transparent; border-color: var(--bw-border-strong); color: var(--bw-text); font-weight: 500; }
.bpp-field { display: flex; flex-direction: column; gap: 4px; }
.bpp-label { font-size: 10px; font-weight: 500; color: var(--bw-muted); }
.bpp-input { min-height: 32px; padding: 0 10px; display: flex; align-items: center; border-radius: 9px; border: 1px solid var(--bw-border-strong); background: var(--rider-surface-inset, var(--bw-bg)); color: var(--bw-muted); font-size: 11px; }
.bpp-tabbar { display: flex; justify-content: space-around; padding: 8px 10px 14px; border-top: 1px solid var(--bw-border); background: var(--bw-bg-secondary); flex-shrink: 0; font-size: 10px; color: var(--bw-muted); }
.bpp-tabbar .is-active { color: var(--bw-accent); font-weight: 600; }
.bpp-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.bpp .rider-map { height: 170px; border-radius: 14px; }
.bpp .rider-map__route-card { left: 8px; right: 8px; bottom: 8px; padding: 6px 8px; gap: 2px; border-radius: 10px; }
.bpp .rider-map__route-card dt { font-size: 9px; }
.bpp .rider-map__route-card dd { font-size: 11px; }
.bpp .rider-map__top { top: 8px; left: 8px; right: 8px; }
.bpp .rider-map__title { padding: 3px 9px; font-size: 10px; white-space: nowrap; }
.bpp .rider-map__top .bw-soon-tag, .bpp .rider-map__controls { display: none; }
`

function Brand({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="bpp-brand">
      {logoUrl
        ? <img className="bpp-logo" src={logoUrl} alt="" />
        : <span className="bpp-logo bpp-logo--ph" aria-hidden>{name.charAt(0).toUpperCase()}</span>}
      <span>{name}</span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bpp-field">
      <span className="bpp-label">{label}</span>
      <div className="bpp-input">{value}</div>
    </div>
  )
}

function HomeScreen({ name, logoUrl, phone }: { name: string; logoUrl?: string | null; phone?: string | null }) {
  return (
    <>
      <Brand name={name} logoUrl={logoUrl} />
      <div>
        <p className="bpp-eyebrow" style={{ margin: '4px 0 8px' }}>Welcome</p>
        <h3 className="bpp-title">Arrive in style, every time.</h3>
        <p className="bpp-muted" style={{ margin: '8px 0 0' }}>Reserve a chauffeured ride in a few taps.</p>
      </div>
      <div className="bpp-card">
        <UserCircle size={22} weight="duotone" style={{ color: 'var(--bw-accent)' }} aria-hidden />
        <span className="bpp-card-title">Riders</span>
        <span className="bpp-btn">Book a ride <ArrowRight size={13} aria-hidden /></span>
        <span className="bpp-btn bpp-btn--ghost">Create account</span>
      </div>
      <div className="bpp-card">
        <Car size={22} weight="duotone" style={{ color: 'var(--bw-success)' }} aria-hidden />
        <span className="bpp-card-title">Drivers</span>
        <span className="bpp-btn bpp-btn--ghost">Driver sign in</span>
      </div>
      {phone && (
        <p className="bpp-muted" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Phone size={12} aria-hidden /> {phone}
        </p>
      )}
    </>
  )
}

function LoginScreen({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <>
      <Brand name={name} logoUrl={logoUrl} />
      <div style={{ margin: '18px 0 4px' }}>
        <h3 className="bpp-title">Welcome back</h3>
        <p className="bpp-muted" style={{ margin: '6px 0 0' }}>Sign in to book and manage your rides.</p>
      </div>
      <Field label="Email" value="you@example.com" />
      <Field label="Password" value="••••••••" />
      <span className="bpp-btn">Sign in</span>
      <p className="bpp-muted" style={{ margin: 0, textAlign: 'center' }}>
        New here? <span style={{ color: 'var(--bw-accent)', fontWeight: 600 }}>Create an account</span>
      </p>
    </>
  )
}

function BookScreen() {
  return (
    <>
      <RiderMapPlaceholder pickup="JFK Terminal 4" dropoff="The Plaza Hotel" />
      <Field label="Service type" value="Point to point" />
      <Field label="Pickup date & time" value="Fri, 12 Sep - 6:30 PM" />
      <Field label="Notes" value="Meet at arrivals, flight DL 401" />
      <div className="bpp-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="bpp-muted">Estimated fare</span>
        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>$148.00</span>
      </div>
      <span className="bpp-btn" style={{ minHeight: 40 }}>Book Ride</span>
    </>
  )
}

function TripsScreen() {
  const trips = [
    { to: 'The Plaza Hotel', when: 'Fri, 12 Sep', status: 'confirmed' },
    { to: 'LaGuardia T2', when: 'Mon, 1 Sep', status: 'completed' },
    { to: 'Wall Street', when: 'Sat, 23 Aug', status: 'cancelled' },
  ]
  return (
    <>
      <h3 className="bpp-title" style={{ fontSize: 18 }}>Your trips</h3>
      {trips.map(t => (
        <div key={t.to} className="bpp-card">
          <div className="bpp-row">
            <span className="bpp-card-title">{t.to}</span>
            <StatusPill status={t.status} />
          </div>
          <span className="bpp-muted">{t.when}</span>
        </div>
      ))}
      <span className="bpp-btn bpp-btn--ghost">Book another ride</span>
    </>
  )
}

/**
 * Fake phone that mocks the rider-facing pages with the branding currently in the form,
 * so tenants see colors/logo/theme change as they edit. Purely visual - no real routes or data.
 */
export default function BrandingPhonePreview({ branding, logoUrl, companyName }: BrandingPhonePreviewProps) {
  const [screen, setScreen] = useState<ScreenId>('home')
  const vars = brandingCssVars(branding) as CSSProperties
  const name = companyName || 'Your brand'

  return (
    <div className="bpp">
      <style>{PHONE_PREVIEW_CSS}</style>
      <div className="bpp-frame">
        <div className="bpp-screen" data-theme={branding.theme || 'dark'} style={vars} aria-label="Rider app preview">
          <div className="bpp-notch" aria-hidden />
          <div className="bpp-status" aria-hidden><span>9:41</span><span>5G</span></div>
          <div className="bpp-body">
            {screen === 'home' && <HomeScreen name={name} logoUrl={logoUrl} phone={branding.phone} />}
            {screen === 'login' && <LoginScreen name={name} logoUrl={logoUrl} />}
            {screen === 'book' && <BookScreen />}
            {screen === 'trips' && <TripsScreen />}
          </div>
          {(screen === 'book' || screen === 'trips') && (
            <div className="bpp-tabbar" aria-hidden>
              <span className={screen === 'book' ? 'is-active' : undefined}>Book</span>
              <span className={screen === 'trips' ? 'is-active' : undefined}>Trips</span>
              <span>Profile</span>
            </div>
          )}
        </div>
      </div>
      <Tabs tabs={SCREENS} value={screen} onChange={setScreen} ariaLabel="Preview screen" />
      {!branding.enable_branding && (
        <p className="bw-soon-tag" style={{ margin: 0 }}>Branding is off - riders see the default theme</p>
      )}
    </div>
  )
}
