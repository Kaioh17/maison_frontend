import { useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { ArrowRight, CalendarCheck, CalendarPlus, CarProfile, ClockCounterClockwise, DotsThree, House, UserCircle, Wallet, Car } from '@phosphor-icons/react'
import Tabs from '@components/Tabs'
import StatusPill from '@components/StatusPill'
import { RIDER_CSS } from '@pages/rider/riderCss'
import { DRIVER_CSS } from '@pages/driver/driverCss'
import '@pages/tenant-landing.css'
import { fontsApply, type FontSurface } from '@utils/brandFonts'
import { COLOR_ROLES, type ColorRole } from '@utils/brandingRoles'
import { brandingCssVars, type BrandingColorInput } from '@utils/colorTokens'

export interface BrandingPhonePreviewProps {
  /** Live (possibly unsaved) branding values from the settings form. */
  branding: BrandingColorInput & { theme?: string | null; phone?: string | null; enable_branding?: boolean }
  /** Logo to show - the not-yet-uploaded file preview wins over the saved URL. */
  logoUrl?: string | null
  companyName: string
  /** The color role being edited; its parts are outlined in the preview. */
  selected?: ColorRole | null
  /** A colored part of the phone was clicked. */
  onSelect?: (role: ColorRole) => void
}

const SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'book', label: 'Book' },
  { id: 'trips', label: 'Trips' },
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Sign up' },
] as const
type ScreenId = (typeof SCREENS)[number]['id']

const SURFACES = [
  { id: 'rider', label: 'Rider app' },
  { id: 'driver', label: 'Driver app' },
  { id: 'landing', label: 'Landing' },
] as const satisfies ReadonlyArray<{ id: FontSurface; label: string }>

const DRIVER_SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'earnings', label: 'Earnings' },
] as const
type DriverScreenId = (typeof DRIVER_SCREENS)[number]['id']

const SCALE = 0.697 // the real rider layout is 390px wide; the phone screen is 272px

// The preview renders the rider app's own classes (`.rdr-*`) at full size and scales the result down,
// so what a tenant edits is what riders get. Editor chrome (outlines) uses fixed colors on purpose:
// it must stay visible on any palette.
export const PHONE_PREVIEW_CSS = `
.bpp { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.bpp-frame {
  position: relative; width: 290px; height: min(600px, calc(var(--app-h) - 190px)); min-height: 440px; box-sizing: border-box; padding: 9px;
  border-radius: 40px; border: 1px solid var(--bw-border-strong); background: black; box-shadow: var(--bw-shadow, 0 18px 40px -18px rgba(0,0,0,.5));
}
.bpp-screen { position: relative; height: 100%; overflow: hidden; border-radius: 32px; background: var(--bw-bg); }
.bpp-notch { position: absolute; z-index: 3; top: 7px; left: 50%; width: 76px; height: 20px; margin-left: -38px; border-radius: 12px; background: black; pointer-events: none; }
.bpp-scale { position: absolute; top: 0; left: 0; width: 390px; height: calc(100% / ${SCALE}); transform: scale(${SCALE}); transform-origin: 0 0; display: flex; flex-direction: column; }
.bpp-status { display: flex; justify-content: space-between; padding: 14px 32px 6px; font: 600 14px "Work Sans", sans-serif; color: var(--bw-text); background: var(--bw-bg); flex: none; }
.bpp .rdr { flex: 1; min-height: 0; max-width: none; box-shadow: none; overflow: hidden; }
.bpp .rdr-nav { position: static; }
.bpp .rdr-main { overflow: hidden; }
.bpp .rdr-auth { padding-top: 24px; }
.bpp .rdr-nav { margin-bottom: 12px; }
.bpp .rdr-seg button, .bpp .rdr-nav-item { pointer-events: auto; }
.bpp-screen, .bpp-screen * { cursor: pointer; user-select: none; }
.bpp-screen [data-hover] { outline: 3px dashed #3b82f6; outline-offset: 2px; }
${COLOR_ROLES.map(r => `.bpp-screen[data-selected="${r.role}"] [data-role="${r.role}"] { outline: 3px solid #3b82f6; outline-offset: 2px; }`).join('\n')}
.bpp .drv, .bpp .tl-default-main { flex: 1; min-height: 0; overflow: hidden; }
/* The preview is always phone-sized: undo the viewport-width rules (desktop nav, vw type) the real pages use. */
.bpp .drv-head { position: static; }
.bpp .drv-brand { flex: 1; margin-right: 0; }
.bpp .drv-head > .drv-online { margin-left: 0; }
.bpp .drv-main { padding-bottom: 104px; }
.bpp .drv-title { font-size: 35px; }
.bpp .drv-today strong { font-size: 54px; }
.bpp .drv-nav { position: absolute; left: 18px; right: 18px; bottom: 18px; height: 68px; padding: 6px; border-radius: 999px; background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); box-shadow: 0 10px 30px rgb(0 0 0 / 0.35); }
.bpp .drv-nav a { flex: 1; flex-direction: column; gap: 3px; height: auto; padding: 0; border-radius: 999px; font-size: 12px; }
.bpp .drv-nav a:hover { background: none; }
.bpp .drv-nav a.is-active { background: var(--bw-accent); color: var(--bw-bg); }
.bpp .tl-default-shell { padding: 0 16px 40px; }
.bpp .tl-default-brand { margin-inline: 8px; padding-top: 24px; }
.bpp .tl-default-hero { padding: 40px 0 36px; }
.bpp .tl-default-title { font-size: 34px; }
.bpp .tl-default-lede { font-size: 15px; }
.bpp .tl-default-card { padding: 22px; }
.bpp .tl-default-card-title { font-size: 18px; }
.bpp .tl-default-card:hover { transform: none; }
.bpp-hint { margin: 0; font: 400 12px "Work Sans", sans-serif; color: var(--bw-muted); text-align: center; }
.bpp .rdr-field-label, .bpp .rdr-field > span { pointer-events: none; }
`

const role = (r: ColorRole) => ({ 'data-role': r })

function Mark({ name, logoUrl, size }: { name: string; logoUrl?: string | null; size?: 'xl' }) {
  return (
    <span className={`rdr-icon${logoUrl ? ' is-logo' : ''}${size ? ` is-${size}` : ''}`} {...role('surface')}>
      {logoUrl ? <img src={logoUrl} alt="" /> : name.charAt(0).toUpperCase()}
    </span>
  )
}

function Chrome({ tab, children }: { tab: 'home' | 'book' | 'trips'; children: ReactNode }) {
  const tabs = [
    { id: 'home', label: 'Home', Icon: House },
    { id: 'book', label: 'Book', Icon: CalendarPlus },
    { id: 'trips', label: 'Trips', Icon: ClockCounterClockwise },
    { id: 'fleet', label: 'Fleet', Icon: CarProfile },
    { id: 'more', label: 'More', Icon: DotsThree },
  ]
  return (
    <>
      <main className="rdr-main">{children}</main>
      <nav className="rdr-nav" {...role('surface')}>
        {tabs.map(({ id, label, Icon }) => {
          const active = id === tab
          return (
            <span key={id} className={`rdr-nav-item${active ? ' is-active' : ''}`} {...role(active ? 'text' : 'muted')}>
              <Icon size={22} weight={active ? 'fill' : 'regular'} aria-hidden />
              {label}
            </span>
          )
        })}
      </nav>
    </>
  )
}

const PrimaryButton = ({ children }: { children: string }) => (
  <span className="btn btn-primary btn-block" style={{ minHeight: 52, fontSize: 15 }} {...role('primary')}>
    <span {...role('buttonText')}>{children}</span>
  </span>
)

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rdr-field">
      <span {...role('muted')}>{label}</span>
      <div className="rdr-input" style={{ display: 'flex', alignItems: 'center' }} {...role('surface')}>
        <span style={{ color: 'var(--bw-muted)' }} {...role('muted')}>{value}</span>
      </div>
    </div>
  )
}

function HomeScreen() {
  return (
    <Chrome tab="home">
      <div className="rdr-greeting">
        <span {...role('muted')}>Good evening</span>
        <h1 className="rdr-title" {...role('text')}>Where to, Hann?</h1>
      </div>
      <div className="rdr-hero" {...role('primary')}>
        <span>
          <strong {...role('buttonText')}>Book a ride</strong>
          <span className="rdr-hero-copy" {...role('buttonText')}>Chauffeured transfers, airport runs and hourly service.</span>
        </span>
        <span className="rdr-hero-field" {...role('buttonText')}><span {...role('primary')}>Enter pickup address</span></span>
      </div>
      <div className="rdr-section">
        <div className="rdr-label" {...role('muted')}>Services</div>
        <div className="rdr-services">
          {[['Dropoff', 'Point to point'], ['Airport', 'Flight tracked'], ['Hourly', 'As directed']].map(([t, s]) => (
            <span key={t} className="rdr-service" {...role('surface')}><strong {...role('text')}>{t}</strong><span {...role('muted')}>{s}</span></span>
          ))}
        </div>
      </div>
      <div className="rdr-section">
        <div className="rdr-label" {...role('muted')}>Upcoming</div>
        <TripCard when="Tue, Oct 6 · 9:30 AM" from="120 W Division St" to="O'Hare Airport, Terminal 3" service="Airport" vehicle="Mercedes S580" status="confirmed" next />
      </div>
    </Chrome>
  )
}

function TripCard({ when, from, to, service, vehicle, status, next }: { when: string; from: string; to: string; service: string; vehicle: string; status: string; next?: boolean }) {
  return (
    <article className={`rdr-trip${next ? ' is-next' : ''}`} {...role('surface')}>
      <div className="rdr-trip-top">
        <span className="rdr-when" {...role('text')}>{when}</span>
        <StatusPill status={status} size="md" style={{ borderRadius: 999 }} />
      </div>
      <div className="rdr-route-text"><span {...role('text')}>{from}</span><span {...role('muted')}>→ {to}</span></div>
      <div className="rdr-trip-foot" {...role('muted')}><span>{service}</span><span>{vehicle}</span></div>
    </article>
  )
}

function BookScreen() {
  return (
    <Chrome tab="book">
      <h1 className="rdr-title" {...role('text')}>Book a ride</h1>
      <div className="rdr-seg">
        <span style={{ flex: 1, minHeight: 42, display: 'grid', placeItems: 'center', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 1px 2px rgb(0 0 0 / 0.18)' }} {...role('surface')}><span {...role('text')}>Dropoff</span></span>
        <span style={{ flex: 1, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14, color: 'var(--bw-muted)' }} {...role('muted')}>Airport</span>
        <span style={{ flex: 1, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14, color: 'var(--bw-muted)' }} {...role('muted')}>Hourly</span>
      </div>
      <div className="rdr-route" {...role('surface')}>
        <div className="rdr-route-body">
          <div className="rdr-stops">
            <div className="rdr-stop"><span className="rdr-stop-label" {...role('muted')}>Pickup</span><span style={{ fontSize: 16, padding: '4px 0' }} {...role('text')}>120 W Division St</span></div>
            <div className="rdr-stop"><span className="rdr-stop-label" {...role('muted')}>Dropoff</span><span style={{ fontSize: 16, padding: '4px 0', color: 'var(--bw-muted)' }} {...role('muted')}>Enter dropoff address</span></div>
          </div>
        </div>
        <div className="rdr-map"><span {...role('muted')}>Route map - coming soon</span></div>
      </div>
      <div className="rdr-grid-2">
        <Field label="Date" value="mm/dd/yyyy" />
        <Field label="Time" value="--:-- --" />
      </div>
      <div className="rdr-field">
        <span {...role('muted')}>Vehicle</span>
        <span className="rdr-pick" {...role('surface')}>
          <span className="rdr-pick-main"><strong {...role('text')}>Mercedes-Benz S580</strong><span {...role('muted')}>Luxury Sedan · 3 seats</span></span>
          <span {...role('muted')}>Change ⌄</span>
        </span>
      </div>
      <PrimaryButton>Book ride</PrimaryButton>
    </Chrome>
  )
}

function TripsScreen() {
  return (
    <Chrome tab="trips">
      <h1 className="rdr-title" {...role('text')}>Your trips</h1>
      <TripCard when="Tue, Oct 6 · 9:30 AM" from="120 W Division St" to="O'Hare Airport" service="Airport" vehicle="Mercedes S580" status="confirmed" />
      <TripCard when="Mon, Sep 28 · 9:30 AM" from="875 N Michigan Ave" to="Soldier Field" service="Dropoff" vehicle="BMW 7 Series" status="completed" />
      <TripCard when="Mon, Sep 21 · 4:15 PM" from="1 N State St" to="Midway Airport" service="Dropoff" vehicle="Lincoln Navigator" status="cancelled" />
    </Chrome>
  )
}

function AuthScreen({ name, logoUrl, signup }: { name: string; logoUrl?: string | null; signup?: boolean }) {
  return (
    <main className="rdr rdr-auth" {...role('background')}>
      <div className="rdr-auth-brand">
        <Mark name={name} logoUrl={logoUrl} size="xl" />
        <span {...role('muted')}>{name}</span>
      </div>
      <div className="rdr-auth-form">
        <div>
          <h1 className="rdr-title" {...role('text')}>{signup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="rdr-sub" {...role('muted')}>{signup ? `Ride with ${name} in under a minute.` : 'Sign in to book and manage your rides.'}</p>
        </div>
        <div className="rdr-auth-fields">
          {signup && <div className="rdr-grid-2"><Field label="First name" value="Hann" /><Field label="Last name" value="Jordan" /></div>}
          <Field label="Email" value="you@email.com" />
          {signup && <Field label="Phone" value="(555) 555-5555" />}
          <Field label="Password" value="••••••••" />
        </div>
        <PrimaryButton>{signup ? 'Create account' : 'Sign in'}</PrimaryButton>
        <div className="rdr-auth-switch" {...role('muted')}>{signup ? 'Already have an account? ' : `New to ${name}? `}<span {...role('text')} style={{ fontWeight: 600, color: 'var(--bw-text)' }}>{signup ? 'Sign in' : 'Create an account'}</span></div>
      </div>
    </main>
  )
}

function DriverChrome({ name, logoUrl, tab, children }: { name: string; logoUrl?: string | null; tab: DriverScreenId; children: ReactNode }) {
  const tabs = [
    { id: 'home', label: 'Home', Icon: House },
    { id: 'rides', label: 'Rides', Icon: CalendarCheck },
    { id: 'earnings', label: 'Earnings', Icon: Wallet },
    { id: 'account', label: 'Account', Icon: UserCircle },
  ]
  return (
    <div className="bw drv" {...role('background')}>
      <header className="drv-head">
        <div className="drv-brand">
          <span className={`drv-icon${logoUrl ? ' is-logo' : ''}`} {...role('surface')}>
            {logoUrl ? <img src={logoUrl} alt="" /> : name.charAt(0).toUpperCase()}
          </span>
          <span className="drv-brand-name" {...role('text')}>{name}</span>
        </div>
        <span className="drv-online" aria-checked="true" {...role('surface')}><span className="drv-dot" aria-hidden />Online</span>
      </header>
      <main className="drv-main">{children}</main>
      <nav className="drv-nav" {...role('surface')}>
        {tabs.map(({ id, label, Icon }) => (
          <a key={id} className={id === tab ? 'is-active' : ''} {...role(id === tab ? 'primary' : 'muted')}>
            <Icon size={26} weight={id === tab ? 'fill' : 'regular'} aria-hidden /><span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

function DriverHomeScreen({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <DriverChrome name={name} logoUrl={logoUrl} tab="home">
      <div className="drv-stack">
        <h2 className="drv-section" {...role('muted')}>New request <span className="drv-count" {...role('primary')}>1</span></h2>
        <article className="drv-ride is-hero" {...role('surface')}>
          <div className="drv-ride-top">
            <div>
              <div className="drv-when" {...role('text')}>Tue - 9:30 AM</div>
              <div className="drv-meta" {...role('muted')}>Airport - Mercedes S580</div>
            </div>
            <div className="drv-ride-side"><span className="drv-fare" {...role('text')}>$142.00</span></div>
          </div>
          <div className="drv-customer" {...role('text')}>Hann Jordan</div>
          <div className="drv-route">
            <div className="drv-stop"><span className="drv-stop-text"><span className="drv-stop-label">Pickup</span><span className="drv-stop-addr">120 W Division St</span></span></div>
            <div className="drv-stop"><span className="drv-stop-text"><span className="drv-stop-label">Drop-off</span><span className="drv-stop-addr">O'Hare Airport, T3</span></span></div>
          </div>
          <div className="drv-actions two">
            <span className="btn btn-secondary btn-block">Decline</span>
            <span className="btn btn-primary btn-block" {...role('primary')}><span {...role('buttonText')}>Accept</span></span>
          </div>
        </article>
      </div>
    </DriverChrome>
  )
}

function DriverEarningsScreen({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <DriverChrome name={name} logoUrl={logoUrl} tab="earnings">
      <div className="drv-stack">
        <h1 className="drv-title" {...role('text')}>Earnings</h1>
        <div className="drv-today"><span {...role('muted')}>Today</span><strong {...role('text')}>$286.00</strong></div>
        <div className="drv-tiles">
          {[['Completed rides', '24'], ['Booked ahead', '3']].map(([l, v]) => (
            <div key={l} className="kpi" {...role('surface')}><span className="kpi-label" {...role('muted')}>{l}</span><span className="kpi-value" {...role('text')}>{v}</span></div>
          ))}
        </div>
      </div>
    </DriverChrome>
  )
}

function LandingScreen({ name }: { name: string }) {
  return (
    <main className="tl-default-main" {...role('background')}>
      <header className="tl-default-brand" {...role('text')}>{name}</header>
      <div className="tl-default-shell">
        <section className="tl-default-hero">
          <p className="tl-default-eyebrow" {...role('surface')}><span className="tl-default-eyebrow-dot" {...role('primary')} aria-hidden /><span {...role('muted')}>Welcome</span></p>
          <h1 className="tl-default-title" {...role('text')}>Chauffeured rides, on your schedule</h1>
          <p className="tl-default-lede" {...role('muted')}>Book airport transfers, point to point and hourly service.</p>
        </section>
        <div className="tl-default-grid" style={{ gridTemplateColumns: '1fr' }}>
          <article className="tl-default-card tl-default-card--rider" {...role('surface')}>
            <div className="tl-default-icon"><UserCircle size={26} weight="duotone" aria-hidden /></div>
            <h2 className="tl-default-card-title" {...role('text')}>Riders</h2>
            <p className="tl-default-card-text" {...role('muted')}>Book and manage your rides.</p>
            <div className="tl-default-actions">
              <span className="btn btn-primary" {...role('primary')}><span {...role('buttonText')}>Book a ride</span><ArrowRight size={18} aria-hidden /></span>
            </div>
          </article>
          <article className="tl-default-card tl-default-card--driver" {...role('surface')}>
            <div className="tl-default-icon"><Car size={26} weight="duotone" aria-hidden /></div>
            <h2 className="tl-default-card-title" {...role('text')}>Drivers</h2>
          </article>
        </div>
      </div>
    </main>
  )
}

/**
 * Phone that renders the rider app with the branding currently in the form, so tenants see colors,
 * logo and theme change as they edit. Every colored part carries a `data-role`; clicking one reports
 * its color role so the settings page can open the editor for it. Purely visual: no routes or data.
 */
export default function BrandingPhonePreview({ branding, logoUrl, companyName, selected, onSelect }: BrandingPhonePreviewProps) {
  const [surface, setSurface] = useState<FontSurface>('rider')
  const [screen, setScreen] = useState<ScreenId>('home')
  const [driverScreen, setDriverScreen] = useState<DriverScreenId>('home')
  const hovered = useRef<HTMLElement | null>(null)
  const vars = brandingCssVars(branding, surface) as CSSProperties
  const fontsOff = !fontsApply(branding.font_scope, surface)
  const name = companyName || 'Your brand'

  const target = (e: MouseEvent) => (e.target as HTMLElement).closest<HTMLElement>('[data-role]')
  const hover = (e: MouseEvent) => {
    if (!onSelect) return
    const next = target(e)
    if (next === hovered.current) return
    hovered.current?.removeAttribute('data-hover')
    next?.setAttribute('data-hover', '')
    hovered.current = next
  }
  const leave = () => { hovered.current?.removeAttribute('data-hover'); hovered.current = null }
  const click = (e: MouseEvent) => {
    const r = target(e)?.dataset.role as ColorRole | undefined
    if (r && onSelect) onSelect(r)
  }

  return (
    <div className="bpp">
      <style>{RIDER_CSS}</style>
      <style>{DRIVER_CSS}</style>
      <style>{PHONE_PREVIEW_CSS}</style>
      <div className="bpp-frame">
        <div
          className="bpp-screen"
          data-preview-screen=""
          data-theme={branding.theme || 'dark'}
          data-selected={selected ?? undefined}
          style={vars}
          onClick={click}
          onMouseMove={hover}
          onMouseLeave={leave}
          aria-label={`${SURFACES.find(x => x.id === surface)?.label} preview. Click a part of the phone to edit its color.`}
        >
          <div className="bpp-notch" aria-hidden />
          <div className="bpp-scale">
            <div className="bpp-status" aria-hidden><span>9:41</span><span>5G</span></div>
            {surface === 'rider' && screen === 'home' && <div className="rdr" {...role('background')}><HomeScreen /></div>}
            {surface === 'rider' && screen === 'book' && <div className="rdr" {...role('background')}><BookScreen /></div>}
            {surface === 'rider' && screen === 'trips' && <div className="rdr" {...role('background')}><TripsScreen /></div>}
            {surface === 'rider' && screen === 'signin' && <AuthScreen name={name} logoUrl={logoUrl} />}
            {surface === 'rider' && screen === 'signup' && <AuthScreen name={name} logoUrl={logoUrl} signup />}
            {surface === 'driver' && driverScreen === 'home' && <DriverHomeScreen name={name} logoUrl={logoUrl} />}
            {surface === 'driver' && driverScreen === 'earnings' && <DriverEarningsScreen name={name} logoUrl={logoUrl} />}
            {surface === 'landing' && <LandingScreen name={name} />}
          </div>
        </div>
      </div>
      <Tabs tabs={SURFACES} value={surface} onChange={setSurface} ariaLabel="Preview app" />
      {surface === 'rider' && <Tabs tabs={SCREENS} value={screen} onChange={setScreen} ariaLabel="Preview screen" />}
      {surface === 'driver' && <Tabs tabs={DRIVER_SCREENS} value={driverScreen} onChange={setDriverScreen} ariaLabel="Preview screen" />}
      {fontsOff && <p className="bw-soon-tag" style={{ margin: 0 }}>Fonts are not applied here - change "Where fonts apply"</p>}
      {onSelect && <p className="bpp-hint">Click any part of the phone to change its color.</p>}
      {!branding.enable_branding && (
        <p className="bw-soon-tag" style={{ margin: 0 }}>Branding is off - riders see the default theme</p>
      )}
    </div>
  )
}
