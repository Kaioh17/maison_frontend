import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Stretch to the container width (common in modals / mobile layouts) */
  fullWidth?: boolean
  children?: ReactNode
}

/**
 * Shared dashboard button (maison-ui skill §2): one look per variant
 * at every stage. All colors come from `--bw-*` vars so tenant branding flows
 * through; hover/active/focus/disabled are pure CSS (`.btn` in styles.css) —
 * no hover useState flags.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', fullWidth = false, className, type, children, ...rest },
  ref
) {
  const classes = ['btn', `btn-${variant}`]
  if (fullWidth) classes.push('btn-block')
  if (className) classes.push(className)
  return (
    <button ref={ref} type={type ?? 'button'} className={classes.join(' ')} {...rest}>
      {children}
    </button>
  )
})

export default Button
