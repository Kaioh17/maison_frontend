import { useState } from 'react'
import { DeviceMobile, Export, PlusSquare } from '@phosphor-icons/react'
import Button from '@components/Button'
import { useInstallApp, promptInstall, markInstallHandled } from '@hooks/useInstallApp'

const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

export const RIDER_BULLETS = [
  'Book a ride in one tap, with no link to search for.',
  'Opens full screen like any other app on your phone.',
  'Takes you straight to your rides and bookings.',
]
export const DRIVER_BULLETS = [
  'Open your next ride in one tap, with no link to search for.',
  'Opens full screen like any other app on your phone.',
  'Takes you straight to your assigned rides.',
]

/**
 * Rider-facing "add to home screen" card: why, a one-tap install where the browser allows it,
 * and step-by-step instructions where it does not (iOS Safari, or Chrome before it offers the prompt).
 * Hidden once installed, running as an installed app, or dismissed (see `useInstallApp`).
 */
export default function RiderInstallCard({ appName, className = 'rdr-card', bullets = RIDER_BULLETS }: { appName: string; className?: string; bullets?: string[] }) {
  const installed = useInstallApp((s) => s.installed)
  const canPrompt = useInstallApp((s) => !!s.deferred)
  const [showSteps, setShowSteps] = useState(false)

  if (installed) return null

  const step = { margin: '0 0 4px 0', color: 'var(--bw-muted)', fontSize: 14, lineHeight: 1.6 } as const

  return (
    <section className={className} aria-label="Install the app">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DeviceMobile size={22} style={{ color: 'var(--bw-text)', flexShrink: 0 }} aria-hidden />
        <h2 style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 18px)', fontWeight: 500, color: 'var(--bw-text)' }}>
          Add {appName} to your home screen
        </h2>
      </div>
      <ul style={{ margin: '12px 0 0 0', paddingLeft: 20, listStyle: 'disc', color: 'var(--bw-muted)', fontSize: 14, lineHeight: 1.6 }}>
        {bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {canPrompt ? (
          <Button onClick={() => void promptInstall()}>Install app</Button>
        ) : (
          <Button aria-expanded={showSteps} onClick={() => setShowSteps((v) => !v)}>
            {showSteps ? 'Hide steps' : 'How to install'}
          </Button>
        )}
        <Button variant="secondary" onClick={markInstallHandled}>Not now</Button>
      </div>
      {showSteps && !canPrompt && (
        <ol style={{ margin: '14px 0 0 0', paddingLeft: 22, listStyle: 'decimal' }}>
          {IS_IOS ? (
            <>
              <li style={step}>Open this page in <strong>Safari</strong>. It will not work from inside another app.</li>
              <li style={step}>Tap the Share button <Export size={16} style={{ display: 'inline', verticalAlign: '-3px' }} aria-label="Share" /> at the bottom of the screen.</li>
              <li style={step}>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={16} style={{ display: 'inline', verticalAlign: '-3px' }} aria-hidden />.</li>
              <li style={step}>Tap <strong>Add</strong>, then open {appName} from your home screen.</li>
            </>
          ) : (
            <>
              <li style={step}>Open this page in <strong>Chrome</strong>.</li>
              <li style={step}>Tap the three-dot menu in the top right.</li>
              <li style={step}>Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</li>
              <li style={step}>Tap <strong>Install</strong> to confirm.</li>
            </>
          )}
        </ol>
      )}
    </section>
  )
}
