# Settings Page UI Pattern

Reference: `AccountInformation.tsx` is the canonical example of this pattern.

---

## What the pattern is

Every settings page that has editable fields follows the same visual grammar:

**Page header** — title + subtitle on the left, Edit/Save/Cancel buttons on the right (desktop only). On mobile the buttons move to a fixed bottom action bar, keeping the content area clean.

**Section cards** — each logical group of fields lives in a distinct card: background `var(--bw-bg-secondary)`, `1px solid var(--bw-border)` border, `borderRadius: 10`. Cards have a section heading row (icon + uppercase label in `var(--bw-muted)`) separated from the content by a bottom border.

**Field component** — each field toggles between read view (plain text, `padding: 10px 0`) and edit view (a `bw-input` input + optional helper text below). The label sits above in 12px muted uppercase.

**Status badges** — pill chips that show green (Verified/active) or grey (Pending/inactive) state. Built from a `StatusBadge` helper component.

**Inline save feedback** — a tinted banner below the last card that auto-dismisses after 4 seconds. No alerts.

**Hover interactions** — handled by direct DOM style mutations (`e.currentTarget.style.*`) rather than boolean `useState` variables, so there are zero re-renders on hover.

---

## Canonical implementation

### Module-level helpers (top of file, outside the component)

```tsx
const ACCENT = 'rgba(155, 97, 209, 0.81)'

function hoverOutline(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.borderColor = ACCENT
  e.currentTarget.style.color = ACCENT
  e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
}
function unhoverOutline(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.borderColor = ''
  e.currentTarget.style.color = ''
  e.currentTarget.style.backgroundColor = ''
}
function hoverPrimary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.opacity = '0.85'
}
function unhoverPrimary(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.opacity = ''
}
```

### StatusBadge component

```tsx
function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      fontSize: 12, fontWeight: 500, fontFamily: '"Work Sans", sans-serif',
      backgroundColor: ok ? 'rgba(30, 127, 74, 0.1)' : 'rgba(0,0,0,0.06)',
      color: ok ? 'var(--bw-success)' : 'var(--bw-muted)'
    }}>
      {ok ? <CheckCircle weight="fill" size={13} aria-hidden /> : <Warning weight="fill" size={13} aria-hidden />}
      {label}
    </span>
  )
}
```

### Field component

```tsx
function Field({ label, helper, editing, type = 'text', value, onChange }: {
  label: string; helper?: string; editing?: boolean
  type?: string; value: string; onChange?: (v: string) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500,
        fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
        marginBottom: 4, letterSpacing: '0.02em' }}>
        {label}
      </label>
      {editing ? (
        <>
          <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
            className="bw-input"
            style={{ width: '100%', padding: '10px 12px', fontSize: 14,
              fontFamily: '"Work Sans", sans-serif', fontWeight: 400, borderRadius: 6,
              color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)',
              border: '1px solid var(--bw-border)', boxSizing: 'border-box' }} />
          {helper && (
            <p style={{ margin: '4px 0 0', fontSize: 12, fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
              {helper}
            </p>
          )}
        </>
      ) : (
        <div style={{ fontSize: 14, fontFamily: '"Work Sans", sans-serif', fontWeight: 400,
          color: value ? 'var(--bw-text)' : 'var(--bw-muted)', padding: '10px 0' }}>
          {value || <span style={{ color: 'var(--bw-muted)' }}>—</span>}
        </div>
      )}
    </div>
  )
}
```

### State (inside the component)

```tsx
const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
// Remove any: isEditHovered, isSaveHovered, isCancelHovered, or similar boolean hover vars
```

### Shared style objects

```tsx
const sectionCard: React.CSSProperties = {
  backgroundColor: 'var(--bw-bg-secondary)',
  border: '1px solid var(--bw-border)',
  borderRadius: 10,
  padding: isMobile ? '16px' : '20px 24px',
  marginBottom: 12
}

const sectionHeading: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  marginBottom: 16, paddingBottom: 12,
  borderBottom: '1px solid var(--bw-border)'
}

const sectionTitle: React.CSSProperties = {
  margin: 0, fontSize: 13, fontWeight: 500,
  fontFamily: '"Work Sans", sans-serif', color: 'var(--bw-muted)',
  letterSpacing: '0.03em', textTransform: 'uppercase'
}

const outlineBtnStyle: React.CSSProperties = {
  padding: '10px 20px', fontSize: 14, fontWeight: 500,
  fontFamily: '"Work Sans", sans-serif', borderRadius: 7,
  border: '1px solid var(--bw-border)', backgroundColor: '#ffffff',
  color: 'var(--bw-text)', display: 'flex', alignItems: 'center', gap: 7,
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease'
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '10px 20px', fontSize: 14, fontWeight: 500,
  fontFamily: '"Work Sans", sans-serif', borderRadius: 7,
  border: 'none', backgroundColor: 'var(--bw-accent)', color: '#ffffff',
  display: 'flex', alignItems: 'center', gap: 7,
  cursor: 'pointer', transition: 'opacity 0.15s ease'
}

const mobileBarBtnBase: React.CSSProperties = {
  flex: '1 1 0', minWidth: 0, minHeight: 44,
  fontSize: 14, fontWeight: 500, fontFamily: '"Work Sans", sans-serif',
  borderRadius: 7, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: 8,
  border: 'none', transition: 'opacity 0.15s ease'
}
```

### Page header JSX

```tsx
{/* Page header */}
<div style={{ display: 'flex', alignItems: 'flex-start',
  justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
  <div>
    <h1 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 500,
      fontFamily: '"DM Sans", sans-serif', color: 'var(--bw-text)' }}>
      Page Title
    </h1>
    <p style={{ margin: 0, fontSize: 13, fontFamily: '"Work Sans", sans-serif',
      fontWeight: 300, color: 'var(--bw-muted)', lineHeight: 1.4 }}>
      One-line description.
    </p>
  </div>

  {!isMobile && (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      {isEditing ? (
        <>
          <button style={outlineBtnStyle} onClick={handleCancel} disabled={saving}
            onMouseEnter={hoverOutline} onMouseLeave={unhoverOutline}>
            <X size={16} aria-hidden /> Cancel
          </button>
          <button style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 'pointer' }}
            onClick={handleSave} disabled={saving}
            onMouseEnter={hoverPrimary} onMouseLeave={unhoverPrimary}>
            <FloppyDisk size={16} aria-hidden />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      ) : (
        <button style={outlineBtnStyle} onClick={() => setIsEditing(true)}
          onMouseEnter={hoverOutline} onMouseLeave={unhoverOutline}>
          <PencilSimple size={16} aria-hidden /> Edit
        </button>
      )}
    </div>
  )}
</div>
```

### Section card JSX

```tsx
<div style={sectionCard}>
  <div style={sectionHeading}>
    <SomeIcon size={15} style={{ color: 'var(--bw-muted)' }} aria-hidden />
    <h2 style={sectionTitle}>SECTION LABEL</h2>
  </div>

  {/* Field grid for editable data */}
  <div style={{ display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? 16 : '16px 24px' }}>
    <Field label="Field Name" value={editedData.field}
      helper="Optional helper text."
      editing={isEditing}
      onChange={v => setEditedData(p => ({ ...p, field: v }))} />
  </div>
</div>
```

### Save feedback banner (after last card)

```tsx
{saveMsg && (
  <div style={{
    padding: '10px 14px', borderRadius: 8,
    backgroundColor: saveMsg.ok ? 'rgba(30, 127, 74, 0.08)' : 'rgba(197, 72, 61, 0.08)',
    border: `1px solid ${saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)'}`,
    color: saveMsg.ok ? 'var(--bw-success)' : 'var(--bw-error)',
    fontSize: 13, fontFamily: '"Work Sans", sans-serif', fontWeight: 400, marginBottom: 12
  }}>
    {saveMsg.text}
  </div>
)}
```

### Mobile fixed bottom bar (after the scrollable body, still inside the layout div)

```tsx
{isMobile && (
  <div role="toolbar" aria-label="[Page] actions"
    style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 997,
      padding: '10px 16px',
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
      borderTop: '0.5px solid var(--bw-border)', backgroundColor: 'var(--bw-bg)',
      display: 'flex', gap: 10, boxSizing: 'border-box' }}>
    {!isEditing ? (
      <button type="button" onClick={() => setIsEditing(true)}
        style={{ ...mobileBarBtnBase, backgroundColor: 'transparent',
          border: '0.5px solid var(--bw-border)', color: 'var(--bw-text)' }}>
        <PencilSimple size={16} aria-hidden /> Edit
      </button>
    ) : (
      <>
        <button type="button" onClick={handleCancel} disabled={saving}
          style={{ ...mobileBarBtnBase, backgroundColor: 'transparent',
            border: '0.5px solid var(--bw-border)', color: 'var(--bw-text)',
            opacity: saving ? 0.6 : 1 }}>
          <X size={16} aria-hidden /> Cancel
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          style={{ ...mobileBarBtnBase, backgroundColor: 'var(--bw-accent)',
            color: '#ffffff', opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 'pointer' }}>
          <FloppyDisk size={16} aria-hidden />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </>
    )}
  </div>
)}
```

---

## What to change in each remaining page

Pages that need this upgrade: **CompanyInformation**, **BrandingSettings**, **PricingSettings**, **VehicleConfiguration**, **GeneralView**.

Pages that are read-only or mostly informational and do not need the full treatment: Help, HelpAdminGuide, HelpTroubleshooting, StripeDocs, Plans.

### CompanyInformation.tsx

**Already has:** `saveMsg`, `mobileBarBtnBase`, mobile bottom bar, page title visible on mobile.
**Still needs:**
- Delete the three `isEditHovered / isSaveHovered / isCancelHovered` state vars.
- Replace all `onMouseEnter={() => setIsXHovered(true)}` calls with `onMouseEnter={hoverOutline}` / `onMouseLeave={unhoverOutline}` (or `hoverPrimary` / `unhoverPrimary` on the primary Save button). Delete the three `setIsXHovered` calls in the JSX.
- Add `sectionCard / sectionHeading / sectionTitle` style objects and wrap the Company Details card with them (replacing the current `bw-card` div + inline heading).
- Swap the `renderField` pattern for the `Field` component so fields get the standard read/edit toggle.
- Move `ACCENT` and the four hover functions to module level (outside the component).

### BrandingSettings.tsx

**Already has:** `saveMsg`, desktop Edit/Save buttons.
**Still needs:**
- Delete `isEditHovered / isSaveHovered` state vars; replace with `hoverOutline` / `unhoverPrimary`.
- Add `sectionCard / sectionHeading / sectionTitle` and split the single big card into logical sections (e.g. Logo / Colors / Preview).
- Add a mobile bottom action bar (Edit/Save/Cancel). Currently mobile users have no way to trigger edit mode.
- Move hover helpers to module level.

### PricingSettings.tsx

**Already has:** `saveMsg`, `bookingSaveMsg` per booking card, desktop Edit/Save buttons.
**Still needs:**
- Delete `isEditHovered / isSaveHovered` state vars; replace with `hoverOutline` / `hoverPrimary`.
- Wrap each pricing card and each booking-type card with `sectionCard` + `sectionHeading` + `sectionTitle` so they match the visual grammar (currently using raw `bw-card` with inconsistent heading styles).
- Add a mobile bottom action bar for the pricing section. Per-booking-card saves can keep their inline save buttons.
- Move hover helpers to module level.

### VehicleConfiguration.tsx

This page manages a list with an inline add/edit form — it doesn't have a single "edit the page" mode, so the full page-level Edit/Save/Cancel header doesn't apply. What to do:
- Add `sectionCard / sectionHeading / sectionTitle` to the vehicle list card and the add/edit form card.
- Replace any boolean hover state vars with `hoverOutline` / `hoverPrimary` module-level helpers.
- `saveMsg` is already in place.
- No mobile bottom bar needed (actions are per-row).

### GeneralView.tsx

This is a read-mostly overview page (plan info, Stripe IDs, billing). It has no edit mode today.
- Add `sectionCard / sectionHeading / sectionTitle` to group the four existing `bw-card` blocks into clearly labelled sections (e.g. Plan / Billing / Connected Accounts).
- No edit/save machinery needed.
- `StatusBadge` would be useful to show subscription plan status and Stripe connection state in context.

---

## Checklist for each page

- [ ] Remove boolean hover state vars (`isEditHovered`, `isSaveHovered`, `isCancelHovered`)
- [ ] Add `ACCENT` const and four hover functions at module level
- [ ] Add `sectionCard`, `sectionHeading`, `sectionTitle`, `outlineBtnStyle`, `primaryBtnStyle` style objects
- [ ] Add `mobileBarBtnBase` style object (pages with edit mode only)
- [ ] Replace raw card divs with `sectionCard` + `sectionHeading` pattern
- [ ] Ensure page title + subtitle visible on both mobile and desktop
- [ ] Edit/Save/Cancel buttons desktop-only (`{!isMobile && ...}`)
- [ ] Mobile fixed bottom bar with Edit (idle) / Cancel + Save (editing)
- [ ] `saveMsg` state with 4s auto-dismiss (already present on most pages)
- [ ] No `alert()` calls for save outcomes
