import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  /** Small muted text or action on the right of the header */
  meta?: ReactNode
  children?: ReactNode
}

/** Flat dashboard panel (`.bw-panel` in styles.css). Colors are --bw-* only. */
export default function Card({ title, meta, className, children, ...rest }: CardProps) {
  return (
    <section className={['bw-panel', className].filter(Boolean).join(' ')} {...rest}>
      {(title || meta) && (
        <div className="bw-panel-head">
          {title && <h3 className="bw-panel-title">{title}</h3>}
          {meta && <div className="bw-panel-meta">{meta}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
