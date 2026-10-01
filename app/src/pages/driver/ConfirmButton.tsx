import { useEffect, useRef, useState } from 'react'
import Button, { type ButtonProps } from '@components/Button'

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick'> {
  confirmLabel: string
  onConfirm: () => void
}

/**
 * Two-tap guard for irreversible ride actions. Replaces `window.confirm`, which is a blocking
 * dialog with tiny targets - the wrong thing to hit while driving. The first tap arms the button
 * for 4s (label changes, variant escalates); the second tap fires.
 */
export default function ConfirmButton({ confirmLabel, onConfirm, variant = 'primary', children, ...rest }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const click = () => {
    window.clearTimeout(timer.current)
    if (armed) {
      setArmed(false)
      onConfirm()
      return
    }
    setArmed(true)
    timer.current = window.setTimeout(() => setArmed(false), 4000)
  }

  return (
    <Button
      {...rest}
      className={[rest.className, armed && 'is-armed'].filter(Boolean).join(' ')}
      variant={armed && variant !== 'primary' ? 'destructive' : variant}
      onClick={click}
      aria-live="polite"
    >
      {armed ? confirmLabel : children}
    </Button>
  )
}
