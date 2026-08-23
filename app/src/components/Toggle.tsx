import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * Shared yes/no switch (maison-ui skill §8): replaces the true/false
 * `<select><option>Yes/No</option></select>` pattern in settings pages.
 * Native checkbox styled as a track + thumb (`.bw-toggle` in styles.css) —
 * colors are --bw-* vars so tenant branding flows through.
 */
const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { checked, onChange, className, ...rest },
  ref
) {
  const classes = ['bw-toggle']
  if (className) classes.push(className)
  return (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      aria-checked={checked}
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className={classes.join(' ')}
      {...rest}
    />
  )
})

export default Toggle
