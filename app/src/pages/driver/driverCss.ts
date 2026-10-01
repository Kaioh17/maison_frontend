/**
 * Layout + ride-card styles for the driver app. Phone first: one column, 56px primary targets,
 * bottom tab bar. At 769px+ the same nav moves into the header. Colors are --bw-* only.
 */
export const DRIVER_CSS = `
.drv { font-family: "Work Sans", sans-serif; font-variant-numeric: tabular-nums; }
/* .bw a:hover underlines links, and on touch screens hover sticks after a tap. */
.drv a:hover { text-decoration: none; }
.drv-head {
  position: sticky; top: var(--safe-top); z-index: 20;
  display: flex; align-items: center; gap: 12px;
  min-height: 60px; padding: 8px 16px;
  background: var(--bw-bg); border-bottom: 1px solid var(--bw-border);
}
.drv-brand {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px;
  font: 600 18px "DM Sans", sans-serif; color: var(--bw-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.drv-brand-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
/* Squircle tenant icon: rounded-square fallback, true superellipse where the browser supports it. */
.drv-icon {
  flex: none; width: 40px; height: 40px; display: grid; place-items: center; overflow: hidden;
  border-radius: 30%; border: 1px solid var(--bw-border); background: var(--bw-bg-secondary);
  color: var(--bw-text); font: 600 18px "DM Sans", sans-serif;
}
@supports (corner-shape: squircle) { .drv-icon { corner-shape: squircle; border-radius: 40%; } }
.drv-icon img { width: 100%; height: 100%; object-fit: cover; }
/* Logos (not icons) are often wide wordmarks: keep them whole, inset. */
.drv-icon.is-logo img { object-fit: contain; padding: 4px; box-sizing: border-box; }
.drv-online {
  display: inline-flex; align-items: center; gap: 10px;
  min-height: 44px; padding: 0 16px 0 14px; border-radius: 999px;
  border: 1px solid var(--bw-border); background: var(--bw-bg-secondary); color: var(--bw-text);
  font: 600 15px "Work Sans", sans-serif; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.drv-online:disabled { opacity: 0.6; cursor: not-allowed; }
.drv-online:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.drv-online[aria-checked="true"] { border-color: var(--bw-success); }
.drv-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--bw-disabled); }
.drv-online[aria-checked="true"] .drv-dot {
  background: var(--bw-success);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--bw-success) 22%, transparent);
}

.drv-main {
  width: 100%; max-width: 640px; margin: 0 auto;
  padding: 16px 16px calc(88px + var(--safe-bottom));
  display: flex; flex-direction: column; gap: 16px; box-sizing: border-box;
}
.drv-notice { position: sticky; top: calc(var(--safe-top) + 68px); z-index: 15; }
.drv-notice .bw-notice { margin: 0; background-color: var(--bw-bg); font-size: 15px; }
/* Idle notice slot takes no space: cancel the flex gap it would otherwise add above the page title. */
.drv-notice:not(:has(.bw-notice)) { margin-bottom: -16px; }
.drv-title { margin: 8px 0 0; font: 200 clamp(28px, 7vw, 36px) "DM Sans", sans-serif; color: var(--bw-text); }
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
.drv-maps { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.drv-maps .btn { min-height: 48px; padding: 8px 10px; font-size: 14px; }
.drv-maps .btn svg { color: var(--bw-accent); flex: none; }
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
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 1000; display: flex;
  height: calc(64px + var(--safe-bottom));
  padding: 0 var(--safe-right) var(--safe-bottom) var(--safe-left);
  background-color: var(--bw-bg);
  background-color: color-mix(in srgb, var(--bw-bg) 88%, transparent);
  -webkit-backdrop-filter: saturate(180%) blur(14px); backdrop-filter: saturate(180%) blur(14px);
  border-top: 1px solid var(--bw-border); box-sizing: border-box;
}
.drv-nav a {
  position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: var(--bw-muted); text-decoration: none; font-size: 12px; font-weight: 500;
  -webkit-tap-highlight-color: transparent; transition: color 0.15s ease;
}
.drv-nav a:active { transform: scale(0.94); }
.drv-nav a:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: -4px; border-radius: 8px; }
.drv-nav a.is-active { color: var(--bw-accent); }
.drv-nav a.is-active::after {
  content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 28px; height: 2px; border-radius: 0 0 3px 3px; background: var(--bw-accent);
}
.drv-badge {
  position: absolute; top: 6px; left: calc(50% + 6px); min-width: 18px; height: 18px; padding: 0 5px;
  display: grid; place-items: center; border-radius: 9px;
  background: var(--bw-error); color: var(--bw-bg); font-size: 11px; font-weight: 700;
}
@media (min-width: 769px) {
  .drv-main { padding-bottom: 48px; }
  .drv-notice { top: calc(var(--safe-top) + 68px); }
  .drv-nav {
    position: static; height: auto; padding: 0; background: none; border: 0;
    -webkit-backdrop-filter: none; backdrop-filter: none; gap: 4px;
  }
  .drv-nav a { flex: none; flex-direction: row; gap: 8px; height: 40px; padding: 0 14px; border-radius: 8px; font-size: 14px; }
  .drv-nav a:hover { background: var(--bw-bg-hover); }
  .drv-nav a.is-active::after { display: none; }
  .drv-nav a.is-active { background: var(--bw-bg-hover); }
  .drv-badge { position: static; margin-left: 2px; }
  .drv-brand { flex: none; margin-right: 16px; }
  .drv-head > .drv-online { margin-left: auto; }
}
`
