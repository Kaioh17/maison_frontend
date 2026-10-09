/**
 * Layout + component styles for the rider app. Phone first: one centered column, floating tab bar,
 * bottom sheets. The same column is used on desktop. Colors are --bw-* only (white-label safe);
 * `--rider-on-primary` is the tenant's button text color, the right ink on an accent fill.
 */
export const RIDER_CSS = `
.rdr-canvas { background: color-mix(in srgb, var(--bw-text) 5%, var(--bw-bg)); }
.rdr {
  position: relative; width: 100%; max-width: 560px; min-height: var(--app-h); margin: 0 auto;
  display: flex; flex-direction: column; box-sizing: border-box;
  background: var(--bw-bg); color: var(--bw-text); box-shadow: 0 0 0 1px var(--bw-border);
  font-family: var(--bw-font-body, "Work Sans", sans-serif); font-variant-numeric: tabular-nums;
}
/* .bw a:hover underlines links, and on touch screens hover sticks after a tap. */
.rdr a, .rdr a:hover { text-decoration: none; }

.rdr-link:focus-visible, .rdr-nav-item:focus-visible,
.rdr-service:focus-visible, .rdr-hero:focus-visible, .rdr-pick:focus-visible, .rdr-option:focus-visible {
  outline: 2px solid var(--bw-accent); outline-offset: 2px;
}
/* Squircle tenant icon: rounded-square fallback, true superellipse where the browser supports it. */
.rdr-icon {
  flex: none; width: 34px; height: 34px; display: grid; place-items: center; overflow: hidden;
  border-radius: 30%;
  font: 600 16px var(--bw-font-heading, "DM Sans", sans-serif); letter-spacing: 0;
}
@supports (corner-shape: squircle) { .rdr-icon { corner-shape: squircle; border-radius: 40%; } }
.rdr-icon img { width: 100%; height: 100%; object-fit: cover; }
/* Logos (not icons) are often wide wordmarks: keep them whole, inset. */
.rdr-icon.is-logo img { object-fit: contain; padding: 3px; box-sizing: border-box; }
.rdr-icon.is-lg { width: 44px; height: 44px; }
.rdr-icon.is-xl { width: 76px; height: 76px; font-size: 28px; }

/* ---- Page ---- */
.rdr-main { flex: 1; display: flex; flex-direction: column; gap: 24px; padding: 24px 20px 32px; min-width: 0; }
.rdr-notice { position: sticky; top: calc(var(--safe-top) + 72px); z-index: 4; }
.rdr-notice .bw-notice { margin: 0; background-color: var(--bw-bg); font-size: 14px; }
.rdr-notice:not(:has(.bw-notice)) { margin-bottom: -24px; }
.rdr-head-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.rdr-title { margin: 0; font: 200 clamp(28px, 7vw, 36px) var(--bw-font-heading, "DM Sans", sans-serif); letter-spacing: -0.01em; color: var(--bw-text); }
.rdr-sub { margin: 4px 0 0; font-size: 14px; color: var(--bw-muted); }
.rdr-label {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.055em; text-transform: uppercase; color: var(--bw-muted);
}
.rdr-section { display: flex; flex-direction: column; gap: 12px; }
.rdr-stack { display: flex; flex-direction: column; gap: 16px; }
.rdr-link {
  padding: 0; border: 0; background: none; color: var(--bw-text); font: 500 14px var(--bw-font-body, "Work Sans", sans-serif);
  letter-spacing: 0; text-transform: none; text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
}
.rdr .rdr-link:hover { text-decoration: underline; }
.rdr-card { padding: 16px; background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); border-radius: 16px; }
.rdr-empty {
  display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 24px 22px;
  border: 1px dashed var(--bw-border); border-radius: 16px; text-align: center;
  font-size: 14px; line-height: 1.5; color: var(--bw-muted);
}
.rdr-empty svg { color: var(--bw-muted); }
.rdr-skel { display: flex; flex-direction: column; gap: 12px; }

/* ---- Form controls ---- */
.rdr-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.rdr-field > span, .rdr-field-label { font-size: 13px; font-weight: 500; color: var(--bw-muted); }
.rdr-input {
  width: 100%; box-sizing: border-box; height: 50px; padding: 0 14px; border-radius: 12px;
  border: 1px solid var(--bw-border); background: var(--bw-bg-secondary); color: var(--bw-text);
  font: 400 15px var(--bw-font-body, "Work Sans", sans-serif); outline: none; transition: border-color 0.15s ease;
}
.rdr-input:focus { border-color: var(--bw-text); }
textarea.rdr-input { height: auto; padding: 12px 14px; line-height: 1.45; resize: vertical; }
.rdr-input::placeholder { color: var(--bw-muted); opacity: 0.7; }
.rdr-input:disabled { opacity: 0.5; }
.rdr-grid-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.rdr-seg {
  display: flex; gap: 4px; padding: 4px; border-radius: 14px;
  background: color-mix(in srgb, var(--bw-text) 8%, transparent);
}
.rdr-seg button {
  flex: 1; min-height: 42px; padding: 0 8px; border: 0; border-radius: 10px; background: transparent;
  color: var(--bw-muted); font: 600 14px var(--bw-font-body, "Work Sans", sans-serif); cursor: pointer;
  -webkit-tap-highlight-color: transparent; transition: background-color 0.15s ease, color 0.15s ease;
}
.rdr-seg button[aria-checked="true"] { background: var(--bw-bg-secondary); color: var(--bw-text); box-shadow: 0 1px 2px rgb(0 0 0 / 0.18); }
.rdr-seg button:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.rdr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.rdr-chip {
  flex: none; min-height: 40px; padding: 0 16px; border-radius: 999px; white-space: nowrap;
  border: 1px solid var(--bw-border); background: transparent; color: var(--bw-text);
  font: 500 14px var(--bw-font-body, "Work Sans", sans-serif); cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.rdr-chip[aria-checked="true"] { border-color: var(--bw-text); background: var(--bw-text); color: var(--bw-bg); }
.rdr-chip:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.rdr-hint { margin-top: -10px; text-align: center; font-size: 13px; color: var(--bw-muted); }

/* ---- Home ---- */
.rdr-greeting { display: flex; flex-direction: column; gap: 4px; }
.rdr-greeting span { font-size: 14px; color: var(--bw-muted); }
.rdr-hero {
  display: flex; flex-direction: column; gap: 18px; padding: 22px; border-radius: 20px;
  width: 100%; box-sizing: border-box; border: 0; text-align: left; font: inherit; cursor: pointer;
  background: var(--bw-accent); color: var(--rider-on-primary); -webkit-tap-highlight-color: transparent;
}
.rdr-hero strong { display: block; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.rdr-hero-copy { display: block; margin-top: 6px; font-size: 14px; line-height: 1.45; opacity: 0.85; }
.rdr-hero-field {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; padding: 0 16px;
  border-radius: 12px; background: var(--rider-on-primary); color: var(--bw-accent); font-size: 15px; font-weight: 500;
}
.rdr-hero-field span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rdr-services { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(88px, auto); gap: 10px; }
.rdr-service {
  display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px; box-sizing: border-box;
  text-align: left; border: 1px solid var(--bw-border); border-radius: 20px; background: var(--bw-bg-secondary);
  color: var(--bw-text); font: inherit; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: border-color 0.15s ease, transform 0.12s ease;
}
.rdr-service:hover { border-color: var(--bw-text); }
.rdr-service:active { transform: scale(0.98); }
.rdr-service-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rdr-service strong { font-size: 16px; font-weight: 600; }
.rdr-service-body > span { font-size: 13px; line-height: 1.35; color: var(--bw-muted); }
.rdr-service svg { flex: none; color: var(--bw-accent); }
.rdr-service.is-feature {
  grid-row: span 2; flex-direction: column; align-items: flex-start; justify-content: space-between; padding: 18px;
  background: var(--bw-accent); border-color: transparent; color: var(--rider-on-primary);
}
.rdr-service.is-feature svg { color: inherit; }
.rdr-service.is-feature strong { font: 400 clamp(28px, 8vw, 34px) / 1.05 var(--bw-font-accent, "Instrument Serif", serif); }
.rdr-service.is-feature .rdr-service-body > span { color: inherit; opacity: 0.85; }
.rdr-service.is-feature .rdr-service-body > .rdr-service-cta {
  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; margin-top: 12px; padding: 10px 16px; border-radius: 999px;
  background: var(--rider-on-primary); color: var(--bw-accent); opacity: 1; font-size: 14px; font-weight: 600;
}
.rdr-service.is-feature .rdr-service-cta svg { color: inherit; }
.rdr-sum-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; font-size: 14px; color: var(--bw-muted); }
.rdr-sum-head strong { font-size: clamp(32px, 9vw, 40px); font-weight: 600; color: var(--bw-text); }
.rdr-sum-head .rdr-link { display: inline-flex; align-items: center; gap: 4px; }
.rdr-sum-bar { display: flex; gap: 4px; height: 10px; }
.rdr-sum-bar span { min-width: 0; border-radius: 999px; }
.rdr-sum-bar .is-done, .rdr-sum-legend .is-done { background: var(--bw-accent); }
.rdr-sum-bar .is-pending, .rdr-sum-legend .is-pending { background: color-mix(in srgb, var(--bw-accent) 28%, transparent); }
.rdr-sum-bar .is-rest { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--bw-accent) 14%, transparent) 0 4px, transparent 4px 8px); }
.rdr-sum-legend { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 14px; font-size: 14px; color: var(--bw-muted); }
.rdr-sum-legend span { display: inline-flex; align-items: center; gap: 8px; }
.rdr-sum-legend strong { color: var(--bw-text); }
.rdr-sum-legend i { width: 10px; height: 10px; border-radius: 50%; }

/* ---- Trip card ---- */
.rdr-trip { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); border-radius: 16px; }
.rdr-trip.is-next { border-color: var(--bw-accent); }
.rdr-trip-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.rdr-when { font-size: 15px; font-weight: 600; }
.rdr-route-text { display: flex; flex-direction: column; gap: 2px; font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
.rdr-route-text span:last-child { color: var(--bw-muted); }
.rdr-trip-foot {
  display: flex; justify-content: space-between; gap: 12px; padding-top: 10px;
  border-top: 1px solid var(--bw-border); font-size: 13px; color: var(--bw-muted);
}
.rdr-trip-foot span:last-child { text-align: right; }
.rdr-more {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; padding: 0;
  border: 0; border-top: 1px solid var(--bw-border); background: none; color: var(--bw-text);
  font: 500 14px var(--bw-font-body, "Work Sans", sans-serif); cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.rdr-more svg { transition: transform 0.2s ease; }
@media (prefers-reduced-motion: reduce) { .rdr-more svg { transition: none; } }
.rdr-more[aria-expanded="true"] svg { transform: rotate(180deg); }
.rdr-more:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.rdr-rows { display: flex; flex-direction: column; margin: 0; font-size: 14px; }
.rdr-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 10px 0; border-top: 1px solid var(--bw-border); }
.rdr-row:first-child { border-top: 0; }
.rdr-row dt { flex: none; color: var(--bw-muted); }
.rdr-row dd { margin: 0; text-align: right; overflow-wrap: anywhere; }
.rdr-row a { color: var(--bw-text); text-decoration: underline; text-underline-offset: 3px; }
.rdr-note { padding: 12px; border-radius: 12px; background: color-mix(in srgb, var(--bw-text) 5%, transparent); font-size: 14px; line-height: 1.45; }
.rdr-note strong { display: block; margin-bottom: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.055em; text-transform: uppercase; color: var(--bw-muted); }
.rdr-more-actions { display: flex; flex-direction: column; gap: 12px; }

/* ---- Rating ---- */
.rdr-stars { display: flex; align-items: center; gap: 4px; }
.rdr-star { position: relative; width: 44px; height: 44px; display: grid; place-items: center; }
.rdr-star button { position: absolute; top: 0; width: 50%; height: 100%; min-width: 0 !important; min-height: 0 !important; padding: 0; border: 0; background: transparent; cursor: pointer; }
.rdr-star button:first-of-type { left: 0; }
.rdr-star button:last-of-type { right: 0; }
.rdr-stars:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; border-radius: 8px; }
.rdr-star-static { display: flex; gap: 2px; }

/* ---- Book ---- */
.rdr-route { border: 1px solid var(--bw-border); border-radius: 16px; background: var(--bw-bg-secondary); }
.rdr-route-body { padding: 6px 16px; }
/* The rail: a dot at the first stop, a square at the last, a hairline between (centered on each input). */
.rdr-stops { position: relative; display: flex; flex-direction: column; padding-left: 20px; min-width: 0; }
.rdr-stops::before { content: ""; position: absolute; left: 3px; top: 42px; bottom: 42px; width: 1px; background: var(--bw-border); }
.rdr-stop { position: relative; display: flex; flex-direction: column; gap: 2px; padding: 10px 0; }
.rdr-stop + .rdr-stop { border-top: 1px solid var(--bw-border); }
.rdr-stop::before { content: ""; position: absolute; left: -20px; top: 38px; width: 8px; height: 8px; background: var(--bw-text); }
.rdr-stop:first-child::before { border-radius: 50%; }
.rdr-stop-label { font-size: 12px; font-weight: 500; color: var(--bw-muted); }
.rdr-map {
  position: relative; height: 112px; display: grid; place-items: center; border-top: 1px solid var(--bw-border);
  border-radius: 0 0 15px 15px; overflow: hidden;
  background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--bw-text) 7%, transparent) 0 8px, transparent 8px 16px);
}
.rdr-map.is-tappable { width: 100%; padding: 0; border-left: 0; border-right: 0; border-bottom: 0; cursor: zoom-in; -webkit-tap-highlight-color: transparent; }
.rdr-map.is-tappable:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: -2px; }
.rdr-map-hint { position: absolute; right: 8px; bottom: 8px; padding: 6px; box-sizing: content-box; border-radius: 8px; background: var(--bw-bg-secondary); color: var(--bw-text); border: 1px solid var(--bw-border); }
.rdr-map-gl { width: 100%; height: min(60vh, 520px); min-height: 320px; border-radius: 12px; overflow: hidden; background: var(--bw-bg-secondary); }
.rdr-map-summary { margin: 0 0 10px; font: 500 14px var(--bw-font-body, "Work Sans", sans-serif); color: var(--bw-text); }
.rdr-pin { display: flex; flex-direction: column; align-items: center; gap: 4px; font-family: var(--bw-font-body, "Work Sans", sans-serif); }
.rdr-pin-callout { display: flex; flex-direction: column; max-width: 190px; padding: 6px 10px; border-radius: 10px; background: #fff; color: #1a1a1a; box-shadow: 0 2px 8px rgb(0 0 0 / 0.25); }
.rdr-pin-callout strong { font-size: 12px; font-weight: 600; }
.rdr-pin-callout span { font-size: 11px; line-height: 1.3; color: #555; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.rdr-pin-dot { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: #1a1a1a; color: #fff; border: 2px solid #fff; box-shadow: 0 2px 6px rgb(0 0 0 / 0.35); font-size: 13px; font-weight: 600; }
.rdr-map img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.rdr-map span {
  padding: 4px 8px; border: 1px solid var(--bw-border); border-radius: 6px; background: var(--bw-bg-secondary);
  font: 500 12px var(--bw-font-body, "Work Sans", sans-serif); color: var(--bw-muted);
}
.rdr-pick {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 60px; padding: 10px 14px;
  border: 1px solid var(--bw-border); border-radius: 12px; background: var(--bw-bg-secondary); color: var(--bw-text);
  text-align: left; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.rdr-pick-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rdr-pick-main strong { font-size: 15px; font-weight: 600; }
.rdr-pick-main span { font-size: 13px; color: var(--bw-muted); }
.rdr-pick > span:last-child { flex: none; font-size: 13px; color: var(--bw-muted); }

/* ---- Fleet ---- */
.rdr-vehicle { overflow: hidden; background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); border-radius: 18px; }
.rdr-photo { position: relative; aspect-ratio: 16 / 9; background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--bw-text) 7%, transparent) 0 8px, transparent 8px 16px); }
.rdr-photo-track { display: flex; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.rdr-photo-track::-webkit-scrollbar { display: none; }
.rdr-photo-track img { flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; scroll-snap-align: start; }
.rdr-photo-empty { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 6px; color: var(--bw-muted); font-size: 13px; }
.rdr-photo-count {
  position: absolute; top: 10px; right: 10px; padding: 3px 9px; border-radius: 999px; pointer-events: none;
  background: color-mix(in srgb, var(--bw-bg) 78%, transparent); backdrop-filter: blur(6px); font-size: 12px; font-weight: 600;
}
.rdr-vehicle-body { display: flex; flex-direction: column; gap: 14px; padding: 16px; }
.rdr-vehicle-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.rdr-vehicle-top strong { display: block; font-size: 17px; font-weight: 600; }
.rdr-vehicle-top span { font-size: 13px; color: var(--bw-muted); }
.rdr-vehicle-actions { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; }

/* ---- Bottom nav ---- */
.rdr-nav {
  position: sticky; bottom: calc(12px + var(--safe-bottom)); z-index: 5; margin: 0 12px calc(12px + var(--safe-bottom));
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); padding: 0 6px;
  background: var(--bw-bg-secondary); border: 1px solid var(--bw-border); border-radius: 22px; box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
}
.rdr-nav-item {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  min-height: 60px; padding: 0; border: 0; background: transparent; color: var(--bw-muted);
  font: 500 12px var(--bw-font-body, "Work Sans", sans-serif); text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.rdr-nav-item.is-active { color: var(--bw-text); font-weight: 600; }
.rdr-nav-item.is-active::before { content: ""; position: absolute; top: 0; width: 20px; height: 3px; border-radius: 2px; background: var(--bw-accent); }

/* ---- Sheet contents (the sheet itself is Modal variant="sheet") ---- */
.rdr-sheet-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
.rdr-sheet-brand > span:last-child { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rdr-sheet-brand b { font-size: 16px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; overflow: hidden; text-overflow: ellipsis; }
.rdr-sheet-brand small { font-size: 13px; font-weight: 400; color: var(--bw-muted); letter-spacing: 0; }
.rdr-list { display: flex; flex-direction: column; border: 1px solid var(--bw-border); border-radius: 16px; background: var(--bw-bg-secondary); }
.rdr-list > * + * { border-top: 1px solid var(--bw-border); }
.rdr-list-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; padding: 0 16px;
  background: none; border: 0; color: var(--bw-text); font: 400 15px var(--bw-font-body, "Work Sans", sans-serif); text-align: left; cursor: pointer;
}
.rdr-list-row > span:first-child { display: flex; align-items: center; gap: 12px; }
.rdr-list-row > span:last-child:not(:first-child) { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: var(--bw-muted); font-size: 14px; }
.rdr-list a.rdr-list-row { text-decoration: none; }
.rdr-list-row:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: -2px; border-radius: 16px; }
.rdr-options { display: flex; flex-direction: column; gap: 10px; }
.rdr-option {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; width: 100%;
  border: 1.5px solid var(--bw-border); border-radius: 14px; background: var(--bw-bg-secondary); color: var(--bw-text);
  text-align: left; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.rdr-option[aria-checked="true"] { border-color: var(--bw-accent); }
.rdr-option-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rdr-option-main strong { font-size: 15px; font-weight: 600; line-height: 1.3; }
.rdr-option-main span { font-size: 13px; color: var(--bw-muted); line-height: 1.3; }
.rdr-radio { flex: none; width: 18px; height: 18px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid var(--bw-border-strong); }
.rdr-option[aria-checked="true"] .rdr-radio { border: 6px solid var(--bw-accent); }
.rdr-dialog-actions { display: flex; flex-direction: column; gap: 12px; }

/* ---- Confirm booking ---- */
.rdr-iconbtn { flex: none; width: 44px; height: 44px; margin-right: -10px; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--bw-muted); cursor: pointer; -webkit-tap-highlight-color: transparent; }
.rdr-iconbtn:hover:not(:disabled) { background: var(--bw-bg-hover); color: var(--bw-text); }
.rdr-iconbtn:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.rdr-amount { font: 400 clamp(44px, 13vw, 56px) / 1 var(--bw-font-accent, "Instrument Serif", serif); letter-spacing: -0.01em; }
/* Pinned action bar: the main button stays reachable while the details scroll. */
.rdr-bar { position: sticky; bottom: 0; z-index: 5; padding: 12px 20px calc(12px + var(--safe-bottom)); background: var(--bw-bg); }

/* ---- Sign in / sign up ---- */
.rdr-auth { padding: 56px 24px 32px; gap: 36px; }
.rdr-auth-brand { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; font: 600 13px var(--bw-font-body, "Work Sans", sans-serif); letter-spacing: 0.14em; text-transform: uppercase; color: var(--bw-muted); overflow-wrap: anywhere; }
.rdr-auth-form { display: flex; flex-direction: column; gap: 24px; }
.rdr-auth-fields { display: flex; flex-direction: column; gap: 16px; }
.rdr-auth-switch { text-align: center; font-size: 14px; color: var(--bw-muted); }
.rdr-auth-switch a { color: var(--bw-text); font-weight: 600; }
.rdr-field-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.rdr-field-head label { font-size: 13px; font-weight: 500; color: var(--bw-muted); }
.rdr-field-toggle { padding: 0; border: 0; background: none; color: var(--bw-text); font: 500 13px var(--bw-font-body, "Work Sans", sans-serif); cursor: pointer; }
.rdr-field-toggle:focus-visible { outline: 2px solid var(--bw-accent); outline-offset: 2px; }
.rdr-field-note { font-size: 12px; line-height: 1.4; color: var(--bw-muted); }
.rdr-field-note.is-error { color: var(--bw-error); }
.rdr-check { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 14px; cursor: pointer; }
.rdr-check input { width: 18px; height: 18px; margin: 0; accent-color: var(--bw-accent); }

/* ---- Profile ---- */
.rdr-info-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 50px; padding: 0 16px; font-size: 14px; }
.rdr-info-row > span:first-child { flex: none; color: var(--bw-muted); }
.rdr-info-row > span:last-child { padding: 12px 0; font-size: 15px; text-align: right; overflow-wrap: anywhere; }

/* ---- Card grids (single column on phones, a grid on laptops) ---- */
.rdr-cards { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }
.rdr-col { display: flex; flex-direction: column; gap: 24px; min-width: 0; }
.rdr-split { display: flex; flex-direction: column; gap: 24px; }

/* ---- Laptop and up: left navigation rail, wide two-column pages ---- */
@media (min-width: 1024px) {
  .rdr-app { max-width: 1280px; display: grid; grid-template-columns: 232px minmax(0, 1fr); grid-template-rows: 1fr; grid-template-areas: "nav main"; }
  .rdr-app .rdr-icon { width: 38px; height: 38px; }
  .rdr-app .rdr-nav {
    grid-area: nav; position: sticky; top: calc(var(--safe-top) + 24px); align-self: start;
    grid-template-columns: 1fr; gap: 4px; margin: 24px 0 24px 20px; padding: 8px; border-radius: 16px; box-shadow: none; background: transparent; border-color: transparent;
  }
  .rdr-app .rdr-nav-item { flex-direction: row; justify-content: flex-start; gap: 12px; min-height: 48px; padding: 0 14px; border-radius: 10px; font-size: 15px; }
  .rdr-app .rdr-nav-item:hover { background: var(--bw-bg-hover); }
  .rdr-app .rdr-nav-item.is-active { background: var(--bw-bg-hover); }
  .rdr-app .rdr-nav-item.is-active::before { top: 14px; left: 0; width: 3px; height: 20px; }
  .rdr-app .rdr-main {
    grid-area: main; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 32px; align-content: start;
    padding: 32px 40px 48px 24px;
  }
  .rdr-app .rdr-main > * { grid-column: 1 / -1; }
  .rdr-app .rdr-main > .rdr-half { grid-column: auto; }
  .rdr-app .rdr-notice { top: calc(var(--safe-top) + 80px); }
  .rdr-app .rdr-notice:not(:has(.bw-notice)) { margin-bottom: -28px; }
  .rdr-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); align-items: start; gap: 20px; }
  .rdr-split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 40px; align-items: start; }
  .rdr-filters { max-width: 520px; }
  .rdr-narrow { width: 100%; max-width: 320px; margin-inline: auto; }
  .rdr-canvas:has(.rdr-auth-page) { padding: 48px 16px; box-sizing: border-box; }
  .rdr-auth-page { max-width: 480px; min-height: 0; margin: 0 auto; padding: 48px 40px; border-radius: 24px; background: var(--bw-bg); }
  .rdr-app .rdr-title, .rdr-auth-page .rdr-title { font-size: 40px; }
}
`
