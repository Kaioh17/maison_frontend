// Shared pill-shaped Edit/Save/Cancel button CSS for settings page headers
// and inline card actions. Pure CSS (:hover) rather than onMouseEnter/
// onMouseLeave DOM mutation. Originated in PricingSettings; render
// `<style>{SETTINGS_BTN_CSS}</style>` once near the top of any settings
// page that uses `.pss-btn*` classes.
export const SETTINGS_BTN_CSS = `
.pss-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  border-radius: 100px; font-family: "Work Sans", sans-serif; font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, filter 0.15s ease;
}
.pss-btn-block { width: 100%; }
.pss-btn-outline {
  padding: 10px 20px; font-size: 14px;
  border: 1px solid var(--bw-border); background-color: transparent; color: var(--bw-text);
}
.pss-btn-outline:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--bw-accent) 14%, transparent);
  border-color: color-mix(in srgb, var(--bw-accent) 55%, transparent);
  color: var(--bw-accent);
}
.pss-btn-primary {
  padding: 10px 20px; font-size: 14px;
  border: none; background-color: var(--bw-accent); color: #ffffff;
}
.pss-btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.pss-btn-sm { padding: 7px 12px; font-size: 12px; }
.pss-btn:disabled { cursor: not-allowed; opacity: 0.6; }
`
