import { useId } from 'react'
import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  hint?: ReactNode
  error?: ReactNode
  /** Render-prop so the control receives the generated id and aria wiring */
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
}

/** Label + control + hint/error (`.bw-field`). Style the control with `className="bw-input"`. */
export default function Field({ label, hint, error, children }: FieldProps) {
  const id = useId()
  const noteId = hint || error ? `${id}-note` : undefined
  return (
    <div className="bw-field">
      <label className="bw-field-label" htmlFor={id}>{label}</label>
      {children({ id, 'aria-describedby': noteId, 'aria-invalid': error ? true : undefined })}
      {error ? <div id={noteId} className="bw-field-error">{error}</div>
        : hint ? <div id={noteId} className="bw-field-hint">{hint}</div> : null}
    </div>
  )
}
