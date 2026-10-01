import { registerSW } from 'virtual:pwa-register'
import { usePwaUpdate } from '@hooks/usePwaUpdate'

/** Registers the service worker. A new version is never applied automatically: it surfaces via `usePwaUpdate`. */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  const updateSW = registerSW({
    onNeedRefresh: () => usePwaUpdate.setState({ needRefresh: true, apply: () => void updateSW(true) }),
    onRegisteredSW: (_url, registration) => {
      // An installed PWA can stay open for days without navigating, which is when browsers check for updates.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration?.update().catch(() => {})
      })
    },
  })
}
