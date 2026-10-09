import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import Button from '@components/Button'
import { normalizeHex } from '@utils/colorTokens'

export interface ColorEditorProps {
  label: string
  description: string
  /** Saved value: a hex, or '' when the tenant has not set this color. */
  value: string
  /** What the app shows today for an unset color; seeds the picker. */
  fallback: string
  onChange: (hex: string) => void
  onClose: () => void
}

/**
 * Edit one brand color: native color picker plus a hex field. Typing is held in a draft and only
 * committed once it is a complete hex, so a half-typed value never reaches the live preview.
 */
export default function ColorEditor({ label, description, value, fallback, onChange, onClose }: ColorEditorProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? (value || fallback)
  const invalid = draft !== null && draft.trim() !== '' && normalizeHex(draft) === null

  const type = (text: string) => {
    setDraft(text)
    const hex = normalizeHex(text)
    if (hex) onChange(hex)
  }

  return (
    <section className="cedit" aria-label={`Edit ${label} color`}>
      <style>{CSS}</style>
      <div className="cedit-head">
        <span className="cedit-chip" style={{ background: normalizeHex(shown) ?? fallback }} aria-hidden />
        <h3 className="cedit-title">{label}</h3>
        <button type="button" className="cedit-close" onClick={onClose} aria-label="Close color editor"><X size={16} aria-hidden /></button>
      </div>
      <p className="cedit-desc">{description}</p>
      <div className="cedit-row">
        <input
          type="color"
          className="cedit-picker"
          aria-label={`${label} color picker`}
          value={normalizeHex(value || fallback) ?? '#000000'}
          onChange={e => { setDraft(null); onChange(e.target.value) }}
        />
        <label className="cedit-hex">
          <span className="cedit-hash" aria-hidden>#</span>
          <input
            className="bw-input"
            aria-label={`${label} hex value`}
            aria-invalid={invalid}
            spellCheck={false}
            autoCapitalize="off"
            maxLength={7}
            placeholder="6c63e8"
            value={shown.replace(/^#/, '')}
            onChange={e => type(e.target.value)}
            onBlur={() => setDraft(null)}
          />
        </label>
      </div>
      {invalid && <p className="cedit-err" role="alert">Enter a hex color like 6c63e8 or #fff.</p>}
      {!value && !draft && <p className="cedit-note">Not set: riders see the default.</p>}
      {value && <Button variant="ghost" onClick={() => { setDraft(null); onChange('') }}>Reset to default</Button>}
    </section>
  )
}

const CSS = `
.cedit { display: flex; flex-direction: column; gap: 10px; padding: 14px; box-sizing: border-box; background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); border-radius: 12px; font-family: "Work Sans", sans-serif; }
.cedit-head { display: flex; align-items: center; gap: 10px; }
.cedit-chip { width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--bw-border-strong); flex: none; }
.cedit-title { margin: 0; flex: 1; font-size: 14px; font-weight: 600; color: var(--bw-text); }
.cedit-close { display: grid; place-items: center; width: 32px; height: 32px; border: 0; border-radius: 6px; background: transparent; color: var(--bw-muted); cursor: pointer; }
.cedit-close:hover { background: var(--bw-bg-hover); }
.cedit-desc, .cedit-note { margin: 0; font-size: 12px; line-height: 1.4; color: var(--bw-muted); }
.cedit-err { margin: 0; font-size: 12px; color: var(--bw-error); }
.cedit-row { display: flex; gap: 10px; align-items: stretch; }
.cedit-picker { flex: none; width: 56px; height: 44px; padding: 2px; border: 1px solid var(--bw-border-strong); border-radius: 8px; background: transparent; cursor: pointer; }
.cedit-hex { position: relative; flex: 1; min-width: 0; display: flex; }
.cedit-hash { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--bw-muted); font-size: 14px; pointer-events: none; }
.cedit-hex .bw-input { padding-left: 26px; min-height: 44px; font: 400 14px "Work Sans", sans-serif; font-variant-numeric: tabular-nums; text-transform: lowercase; }
.cedit-hex .bw-input[aria-invalid="true"] { border-color: var(--bw-error); }
.cedit .btn { align-self: flex-start; min-height: 36px; padding: 8px 12px; }
`
