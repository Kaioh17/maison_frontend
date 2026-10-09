import { useEffect, type ReactNode } from 'react'
import Button from '@components/Button'

interface SheetProps {
  title: string
  children: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Bottom confirmation sheet for ride-state changes: big targets, one obvious way back. */
export default function Sheet({ title, children, confirmLabel, busy, onConfirm, onClose }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="drv-sheet-back" onClick={onClose}>
      <div className="drv-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <span className="drv-sheet-grip" aria-hidden />
        <h2 className="drv-sheet-title">{title}</h2>
        <p className="drv-sheet-body">{children}</p>
        <Button disabled={busy} onClick={onConfirm}>{confirmLabel}</Button>
        <Button variant="secondary" onClick={onClose}>Go back</Button>
      </div>
    </div>
  )
}
