import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

export interface ModalProps {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  /** Footer actions (usually Buttons) */
  footer?: ReactNode
  width?: number
}

/** Dialog shell (`.bw-dialog`): Esc and scrim click close, focus moves in, stays trapped, and returns on close. */
export default function Modal({ title, onClose, children, footer, width }: ModalProps) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    if (ref.current && !ref.current.contains(document.activeElement)) ref.current.focus()
    return () => prev?.focus?.()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !ref.current) return
      const items = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const at = document.activeElement
      if (e.shiftKey && (at === first || at === ref.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="bw-dialog-scrim" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        className="bw-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={width ? { width: `min(${width}px, 100%)` } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bw-dialog-head">
          <h2 id={titleId} className="bw-dialog-title">{title}</h2>
          <button type="button" className="tnav-icon-btn" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: 'var(--bw-muted)', cursor: 'pointer', borderRadius: 6 }}>
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="bw-dialog-body">{children}</div>
        {footer && <div className="bw-dialog-foot">{footer}</div>}
      </div>
    </div>
  )
}
