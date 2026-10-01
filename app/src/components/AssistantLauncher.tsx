import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkle, ArrowCounterClockwise, ArrowsOut, X } from '@phosphor-icons/react'
import AssistantChat from '@components/AssistantChat'
import { useAuthStore } from '@store/auth'
import { useAssistantStore } from '@store/assistant'

// The full-page assistant and the pre-auth / Stripe-return pages don't get the floating button.
const HIDDEN_PREFIXES = ['/tenant/login', '/tenant/assistant', '/tenant/return', '/tenant/reauth']

// Non-modal on purpose: no backdrop, no scroll lock, and the page underneath keeps its layout,
// so a tenant can ask a question mid-task and carry on. z-index sits above the verification banner (10000).
const ASSISTANT_CSS = `
.asst-fab {
  position: fixed; right: 20px; bottom: 20px; z-index: 998;
  width: 48px; height: 48px; display: grid; place-items: center;
  border-radius: 50%; border: 1px solid var(--bw-border-strong);
  background: var(--bw-accent); color: var(--rider-on-primary);
  box-shadow: var(--bw-shadow); cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}
.asst-fab:hover { background: var(--bw-accent-hover); transform: translateY(-1px); }
.asst-fab:active { transform: scale(0.96); }
.asst-fab:focus-visible, .asst-icon-btn:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.asst-panel {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 10001;
  width: min(400px, 100%); box-sizing: border-box;
  display: flex; flex-direction: column;
  background: var(--bw-bg); border-left: 1px solid var(--bw-border);
  box-shadow: var(--bw-shadow);
  animation: asst-in 0.2s ease;
}
.asst-head { display: flex; align-items: center; gap: 4px; padding: 14px 12px 12px 16px; border-bottom: 1px solid var(--bw-border); flex-shrink: 0; }
.asst-title { flex: 1; margin: 0; display: flex; align-items: center; gap: 8px; font-family: "DM Sans", sans-serif; font-size: 16px; font-weight: 500; color: var(--bw-text); }
.asst-icon-btn { display: grid; place-items: center; width: 36px; height: 36px; border: none; border-radius: 8px; background: transparent; color: var(--bw-muted); cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; }
.asst-icon-btn:hover { background: var(--bw-bg-hover); color: var(--bw-text); }
.asst-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0 12px; }
@keyframes asst-in { from { transform: translateX(24px); opacity: 0; } }
@media (max-width: 768px) {
  .asst-fab { right: 16px; bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
  .asst-panel { width: 100%; border-left: none; padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px); }
}
@media (prefers-reduced-motion: reduce) { .asst-panel { animation: none; } .asst-fab { transition: none; } }
`

/** Floating assistant available on every tenant page. Mounted once in App so it survives route changes. */
export default function AssistantLauncher() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const hasMessages = useAssistantStore((s) => s.messages.length > 0)
  const reset = useAssistantStore((s) => s.reset)
  const [open, setOpen] = useState(false)
  const fabRef = useRef<HTMLButtonElement>(null)

  const visible = role === 'tenant' && pathname.startsWith('/tenant/') && !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))

  const close = () => { setOpen(false); requestAnimationFrame(() => fabRef.current?.focus()) }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!visible) return null

  return (
    <>
      <style>{ASSISTANT_CSS}</style>
      {!open && (
        <button ref={fabRef} type="button" className="asst-fab" onClick={() => setOpen(true)} aria-label="Open assistant">
          <Sparkle size={22} weight="fill" aria-hidden />
        </button>
      )}
      {open && (
        <aside className="asst-panel" role="dialog" aria-label="Maison Assistant">
          <div className="asst-head">
            <h2 className="asst-title"><Sparkle size={18} weight="fill" style={{ color: 'var(--bw-accent)' }} aria-hidden />Assistant</h2>
            {hasMessages && (
              <button type="button" className="asst-icon-btn" onClick={reset} aria-label="Start a new chat" title="New chat">
                <ArrowCounterClockwise size={18} aria-hidden />
              </button>
            )}
            <button type="button" className="asst-icon-btn" onClick={() => { setOpen(false); navigate('/tenant/assistant') }} aria-label="Open full page" title="Open full page">
              <ArrowsOut size={18} aria-hidden />
            </button>
            <button type="button" className="asst-icon-btn" onClick={close} aria-label="Close assistant" title="Close">
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="asst-body">
            <AssistantChat autoFocus onNavigate={() => { if (window.innerWidth <= 768) close() }} />
          </div>
        </aside>
      )}
    </>
  )
}
