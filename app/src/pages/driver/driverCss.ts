/**
 * Layout + ride-card styles for the driver app. Phone first: one column, 56px primary targets,
 * bottom tab bar. At 769px+ the same nav moves into the header. Colors are --bw-* only.
 */
export const DRIVER_CSS = `
.drv { font-family: var(--bw-font-body, "Work Sans", sans-serif); font-variant-numeric: tabular-nums; }
/* .bw a:hover underlines links, and on touch screens hover sticks after a tap. */
.drv a:hover { text-decoration: none; }
.drv-head {
  position: sticky; top: var(--safe-top); z-index: 20;
  display: flex; align-items: center; gap: 12px;
  min-height: 60px; padding: 8px 16px;
  background: var(--bw-bg); border-bottom: 1px solid var(--bw-border);
}
.drv-head { transition: top 0.25s ease; }
.drv-notice { transition: top 0.25s ease; }
.drv.is-head-hidden .drv-head { top: calc(var(--safe-top) - 80px); }
.drv.is-head-hidden .drv-notice { top: var(--safe-top); }
@media (min-width: 769px) {
  .drv.is-head-hidden .drv-head { top: var(--safe-top); }
  .drv.is-head-hidden .drv-notice { top: calc(var(--safe-top) + 68px); }
}
@media (prefers-reduced-motion: reduce) { .drv-head, .drv-notice { transition: none; } }
.drv-brand {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
  font: 600 18px var(--bw-font-heading, "DM Sans", sans-serif); color: var(--bw-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.drv-brand-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.drv-brand-role { flex: none; font: 600 11px var(--bw-font-body, "Work Sans", sans-serif); letter-spacing: 0.22em; text-transform: uppercase; color: var(--bw-muted); }
@media (max-width: 380px) { .drv-brand-role { display: none; } }
/* Squircle tenant icon: rounded-square fallback, true superellipse where the browser supports it. */
.drv-icon {
  flex: none; width: 40px; height: 40px; display: grid; place-items: center; overflow: hidden;
  border-radius: 30%; border: 1px solid var(--bw-border); background: var(--bw-bg-secondary);
  color: var(--bw-text); font: 600 18px var(--bw-font-heading, "DM Sans", sans-serif);
}
@supports (corner-shape: squircle) { .drv-icon { corner-shape: squircle; border-radius: 40%; } }
.drv-icon img { width: 100%; height: 100%; object-fit: cover; }
/* Logos (not icons) are often wide wordmarks: keep them whole, inset. */
.drv-icon.is-logo img { object-fit: contain; padding: 4px; box-sizing: border-box; }
.drv-online {
  display: inline-flex; align-items: center; gap: 10px;
  min-height: 44px; padding: 0 16px 0 14px; border-radius: 999px;
  border: 1px solid var(--bw-border); background: var(--bw-bg-secondary); color: var(--bw-text);
  font: 600 15px var(--bw-font-body, "Work Sans", sans-serif); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.drv-online:disabled { opacity: 0.6; cursor: not-allowed; }
.drv-online:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.drv-online[aria-checked="true"] { border-color: var(--bw-success); }
.drv-online[aria-checked="false"] { border-color: var(--bw-error); }
.drv-dot {
  width: 10px; height: 10px; border-radius: 50%; background: var(--bw-error);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--bw-error) 22%, transparent);
}
.drv-online[aria-checked="true"] .drv-dot {
  background: var(--bw-success);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--bw-success) 22%, transparent);
}

.drv-main {
  width: 100%; max-width: 640px; margin: 0 auto;
  padding: 16px 16px calc(104px + var(--safe-bottom));
  display: flex; flex-direction: column; gap: 16px; box-sizing: border-box;
}
.drv-notice { position: sticky; top: calc(var(--safe-top) + 68px); z-index: 15; }
.drv-notice .bw-notice { margin: 0; background-color: var(--bw-bg); font-size: 15px; }
/* Idle notice slot takes no space: cancel the flex gap it would otherwise add above the page title. */
.drv-notice:not(:has(.bw-notice)) { margin-bottom: -16px; }
.drv-title { margin: 8px 0 0; font: 400 clamp(34px, 9vw, 40px) var(--bw-font-accent, "Instrument Serif", serif); color: var(--bw-text); }
.drv-sub { margin: 4px 0 0; font-size: 15px; color: var(--bw-muted); line-height: 1.45; }
.drv-section { margin: 8px 0 -4px; display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.055em; text-transform: uppercase; color: var(--bw-muted); }
.drv-count { padding: 1px 8px; border-radius: 999px; background: var(--bw-accent); color: var(--bw-bg); font-size: 12px; }
.drv-stack { display: flex; flex-direction: column; gap: 16px; }
.drv-empty { text-align: center; padding: 32px 16px; color: var(--bw-muted); font-size: 15px; line-height: 1.5; }
.drv-empty svg { margin: 0 auto; }
.drv-empty strong { display: block; margin-top: 8px; font-size: 18px; color: var(--bw-text); }
.drv-offline { display: flex; flex-direction: column; gap: 12px; font-size: 15px; line-height: 1.45; }
.drv-offline .btn { min-height: 56px; font-size: 16px; }

.drv-ride {
  display: flex; flex-direction: column; gap: 14px; padding: 16px;
  background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); border-radius: 16px;
}
.drv-ride.is-hero { border-color: var(--bw-accent); }
.drv-ride-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.drv-when { font-size: 20px; font-weight: 600; color: var(--bw-text); }
.is-hero .drv-when { font-size: 26px; }
.drv-meta { margin-top: 2px; font-size: 14px; color: var(--bw-muted); }
.drv-ride-side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.drv-fare { font-size: 20px; font-weight: 600; color: var(--bw-text); }
.drv-until { font-size: 13px; font-weight: 600; color: var(--bw-accent); }
.drv-customer { font-size: 17px; font-weight: 500; color: var(--bw-text); }
.drv-route { display: flex; flex-direction: column; border: 1px solid var(--bw-border); border-radius: 12px; overflow: hidden; }
.drv-route > .drv-meta { padding: 12px 14px; margin: 0; }
.drv-stop { display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; background: var(--bw-bg); color: var(--bw-text); }
.drv-stop + .drv-stop { border-top: 1px solid var(--bw-border); }
.drv-stop-text { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.drv-stop-label { font-size: 12px; font-weight: 600; letter-spacing: 0.055em; text-transform: uppercase; color: var(--bw-muted); }
.drv-stop-addr { font-size: 16px; line-height: 1.3; overflow-wrap: anywhere; }
a.drv-maps { min-height: 48px; padding: 8px 10px; font-size: 14px; }
.drv-maps svg { color: var(--bw-accent); flex: none; }
.drv-collect { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--bw-muted); }
.drv-collect.is-collect {
  padding: 12px 14px; border-radius: 12px; font-size: 16px; font-weight: 600; color: var(--bw-text);
  border: 1px solid var(--bw-warning); background: color-mix(in srgb, var(--bw-warning) 16%, transparent);
}
.drv-notes { display: flex; gap: 8px; font-size: 14px; line-height: 1.4; color: var(--bw-muted); }
.drv-notes svg { flex: none; margin-top: 1px; }
.drv-actions { display: grid; gap: 10px; }
.drv-actions.two { grid-template-columns: 1fr 1fr; }
.drv-actions .btn { min-height: 56px; font-size: 16px; }
.drv-actions .btn-ghost { min-height: 44px; font-size: 14px; color: var(--bw-muted); }
.drv-actions .btn-destructive.btn-ghost, .drv-actions .btn-ghost.btn-destructive { color: var(--bw-bg); }
.btn.is-armed { outline: 3px solid color-mix(in srgb, var(--bw-accent) 55%, transparent); outline-offset: 2px; }

.drv-rows { margin: 0; }
.drv-row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-top: 1px solid var(--bw-border); font-size: 15px; }
.drv-row:first-child { border-top: 0; padding-top: 0; }
.drv-row dt { color: var(--bw-muted); flex: none; }
.drv-row dd { margin: 0; text-align: right; color: var(--bw-text); overflow-wrap: anywhere; }
.drv-vehicle-img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px; background: var(--bw-bg); margin-bottom: 14px; }
.drv-pay { display: flex; flex-direction: column; gap: 10px; padding: 14px 0; border-top: 1px solid var(--bw-border); }
.drv-pay:first-child { border-top: 0; padding-top: 0; }
.drv-pay-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.drv-pay-amt { font-size: 20px; font-weight: 600; color: var(--bw-text); }
.drv-pay .drv-actions .btn { min-height: 48px; font-size: 15px; }
.drv-pay .drv-actions .btn-ghost { justify-self: start; min-height: 44px; padding: 0 4px; font-size: 14px; }
.drv-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.drv-tiles .kpi-value { font-size: 28px; }

.drv-nav {
  position: fixed; left: 18px; right: 18px; bottom: calc(14px + var(--safe-bottom)); z-index: 1000; display: flex; gap: 4px;
  height: 68px; padding: 6px; box-sizing: border-box; border-radius: 999px;
  background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); box-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
}
.drv-nav a {
  position: relative; flex: 1; display: flex; border-radius: 999px; font-size: 11px; font-weight: 600; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: var(--bw-muted); text-decoration: none; font-size: 12px; font-weight: 500;
  -webkit-tap-highlight-color: transparent; transition: color 0.15s ease;
}
.drv-nav a:active { transform: scale(0.94); }
.drv-nav a:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: -4px; border-radius: 8px; }
.drv-nav a.is-active { background: var(--bw-accent); color: var(--bw-bg); }
.drv-badge {
  position: absolute; top: 4px; left: calc(50% + 6px); min-width: 18px; height: 18px; padding: 0 5px;
  display: grid; place-items: center; border-radius: 9px;
  background: var(--bw-error); color: var(--bw-bg); font-size: 11px; font-weight: 700;
}
@media (min-width: 769px) {
  .drv-main { padding-bottom: 48px; }
  .drv-dock { bottom: 0; }
  .drv-notice { top: calc(var(--safe-top) + 68px); }
  .drv-nav { position: static; height: auto; padding: 0; background: none; border: 0; box-shadow: none; border-radius: 0; }
  .drv-nav a { flex: none; flex-direction: row; gap: 8px; height: 40px; padding: 0 14px; border-radius: 8px; font-size: 14px; font-weight: 500; }
  .drv-nav a:hover { background: var(--bw-bg-hover); }
  .drv-nav a.is-active { background: var(--bw-bg-hover); color: var(--bw-accent); }
  .drv-badge { position: static; margin-left: 2px; }
  .drv-brand { flex: none; margin-right: 16px; }
  .drv-head > .drv-online { margin-left: auto; }
}

/* ---- Active ride (Home) ---- */
.drv-active { display: flex; flex-direction: column; gap: 18px; }
.drv-active-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.drv-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--bw-muted); }
.drv-chip {
  padding: 7px 12px; border-radius: 999px; border: 1px solid var(--bw-border-strong);
  font-size: 13px; font-weight: 600; color: var(--bw-text);
}
.drv-chip.is-urgent { background: var(--bw-accent); border-color: var(--bw-accent); color: var(--bw-bg); }
.drv-clock { margin-bottom: -12px; font: 400 clamp(44px, 12vw, 52px) / 1.05 var(--bw-font-accent, "Instrument Serif", serif); letter-spacing: -0.01em; color: var(--bw-text); }
.drv-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-block: 1px solid var(--bw-border); }
.drv-stats > div { padding: 14px 0 14px 14px; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid var(--bw-border); }
.drv-stats > div:first-child { padding-left: 0; border-left: 0; }
.drv-stats span { font-size: 12px; color: var(--bw-muted); }
.drv-stats strong { font-size: 20px; font-weight: 600; color: var(--bw-text); }
.drv-timeline { display: flex; flex-direction: column; }
.drv-tl-row { display: flex; gap: 14px; align-items: flex-start; }
.drv-tl-row:first-child { padding-bottom: 16px; }
.drv-tl-mark { display: flex; flex-direction: column; align-items: center; align-self: stretch; padding-top: 5px; width: 10px; }
.drv-tl-mark i { display: block; }
.drv-tl-mark .is-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--bw-text); }
.drv-tl-mark .is-line { flex: 1; width: 1px; margin-top: 4px; background: var(--bw-border-strong); }
.drv-tl-mark .is-square { width: 10px; height: 10px; box-sizing: border-box; border: 1.5px solid var(--bw-text); }
.drv-tl-text { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.drv-tl-text small { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--bw-muted); }
.drv-tl-text strong { font-size: 18px; font-weight: 600; color: var(--bw-text); overflow-wrap: anywhere; }
.drv-rider { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 18px; background: var(--bw-bg-secondary); }
.drv-avatar {
  flex: none; width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center;
  background: var(--bw-text); color: var(--bw-bg); font: 400 22px var(--bw-font-accent, "Instrument Serif", serif);
}
.drv-rider-text { min-width: 0; display: flex; flex-direction: column; gap: 3px; font-size: 13px; color: var(--bw-muted); }
.drv-rider-text strong { font-size: 17px; font-weight: 600; color: var(--bw-text); }
.drv-facts { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: var(--bw-muted); }
.drv-facts li { display: flex; align-items: center; gap: 10px; }
.drv-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.drv-steps span { display: flex; flex-direction: column; gap: 8px; font-size: 12px; font-weight: 600; color: var(--bw-disabled); }
.drv-steps i { height: 3px; border-radius: 2px; background: var(--bw-border); }
.drv-steps .is-done { color: var(--bw-text); }
.drv-steps .is-done i { background: var(--bw-text); }

/* Action dock: sticks above the pill nav so Start / Arrived / Complete is always one thumb away. */
.drv-dock {
  position: sticky; bottom: calc(96px + var(--safe-bottom)); z-index: 12;
  margin: 0 -16px; padding: 12px 16px; display: flex; flex-direction: column; gap: 12px;
  background: var(--bw-bg); border-top: 1px solid var(--bw-border);
}
.drv-dock-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.drv-dock-grid > * {
  height: 64px; border: 0; border-radius: 16px; background: var(--bw-bg-secondary); color: var(--bw-text);
  font: 500 12px var(--bw-font-body, "Work Sans", sans-serif); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer; text-decoration: none; -webkit-tap-highlight-color: transparent;
}
.drv-dock-grid > *:disabled { opacity: 0.4; cursor: not-allowed; }
.drv-dock-grid > *:focus-visible, .drv-primary:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.drv-primary {
  min-height: 72px; padding: 10px 10px 10px 26px; border: 0; border-radius: 999px; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left;
  background: var(--bw-accent); color: var(--bw-bg); font-family: var(--bw-font-body, "Work Sans", sans-serif); -webkit-tap-highlight-color: transparent;
}
.drv-primary > span:first-child { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.drv-primary strong { font-size: 19px; font-weight: 700; }
.drv-primary small { font-size: 13px; font-weight: 500; opacity: 0.75; }
.drv-primary-icon { flex: none; width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; background: var(--bw-bg); color: var(--bw-accent); }
.drv-primary:disabled { cursor: not-allowed; background: var(--bw-bg-hover-strong); color: var(--bw-muted); }
.drv-primary:disabled .drv-primary-icon { background: var(--bw-border); color: var(--bw-muted); }

.drv-sheet-back { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: flex-end; justify-content: center; background: rgb(0 0 0 / 0.7); }
.drv-sheet {
  width: 100%; max-width: 640px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px;
  padding: 12px 18px calc(22px + var(--safe-bottom)); border-radius: 26px 26px 0 0; background: var(--bw-bg-secondary);
}
.drv-sheet .btn { min-height: 58px; font-size: 17px; border-radius: 999px; }
.drv-sheet-grip { align-self: center; width: 40px; height: 4px; border-radius: 2px; background: var(--bw-border-strong); }
.drv-sheet-title { margin: 6px 2px 0; font: 400 32px / 1.1 var(--bw-font-accent, "Instrument Serif", serif); color: var(--bw-text); }
.drv-sheet-body { margin: 0 2px; font-size: 15px; line-height: 1.5; color: var(--bw-muted); }

/* ---- Rides list, nav picker, earnings headline ---- */
.drv-list { display: flex; flex-direction: column; }
.drv-ride-row {
  display: flex; align-items: center; gap: 14px; min-height: 72px; padding: 18px 0;
  border-top: 1px solid var(--bw-border); color: var(--bw-text); text-decoration: none;
}
.drv-ride-row svg { flex: none; color: var(--bw-muted); }
.drv-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; align-items: flex-start; }
.drv-row-line { align-self: stretch; display: flex; justify-content: space-between; gap: 12px; font-size: 17px; }
.drv-tag { padding: 3px 10px; border-radius: 999px; border: 1px solid var(--bw-border-strong); font-size: 12px; font-weight: 600; color: var(--bw-text); }
.drv-picks { display: flex; flex-direction: column; gap: 10px; }
.drv-pick {
  min-height: 58px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between;
  border-radius: 16px; border: 1px solid var(--bw-border); background: var(--bw-bg-secondary); color: var(--bw-text);
  font: 600 16px var(--bw-font-body, "Work Sans", sans-serif); cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.drv-pick[aria-checked="true"] { border-color: var(--bw-accent); }
.drv-radio { width: 20px; height: 20px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid var(--bw-disabled); }
.drv-pick[aria-checked="true"] .drv-radio { border: 6px solid var(--bw-accent); }
.drv-today { display: flex; flex-direction: column; gap: 4px; }
.drv-today span { font-size: 13px; color: var(--bw-muted); }
.drv-today strong { font: 400 clamp(48px, 14vw, 56px) / 1 var(--bw-font-accent, "Instrument Serif", serif); color: var(--bw-text); }
`
