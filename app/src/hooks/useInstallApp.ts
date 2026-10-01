import { create } from 'zustand'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const KEY = 'maison-install-done'

const read = () => {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}
const write = () => {
  try { localStorage.setItem(KEY, '1') } catch { /* private mode: notice may reappear, harmless */ }
}

/** True when running as an installed app (iOS reports it via navigator.standalone). */
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true

/**
 * `installed` is sticky per browser: set on `appinstalled`, on a standalone launch, or when the user
 * dismisses the notice. Android Chrome never fires `beforeinstallprompt` once installed, so without the
 * flag a browser tab on that phone could not tell and would keep nagging.
 */
export const useInstallApp = create<{ installed: boolean; deferred: InstallPromptEvent | null }>(() => ({
  installed: read(),
  deferred: null,
}))

/** Marks the notice as handled so it never returns (install done, or user said "Not now"). */
export const markInstallHandled = () => {
  write()
  useInstallApp.setState({ installed: true })
}

/** Android/Chrome: shows the native install dialog. */
export async function promptInstall() {
  const { deferred } = useInstallApp.getState()
  if (!deferred) return
  await deferred.prompt()
  const { outcome } = await deferred.userChoice
  useInstallApp.setState({ deferred: null }) // the event is single-use
  if (outcome === 'accepted') markInstallHandled()
}

/** Call once at startup: the event can fire before any component mounts. */
export function captureInstallPrompt() {
  if (isStandalone()) markInstallHandled()
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    useInstallApp.setState({ deferred: e as InstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => {
    useInstallApp.setState({ deferred: null })
    markInstallHandled()
  })
}
