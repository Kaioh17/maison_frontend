# Maison dark mode design reference

This records the general dark theme as it is implemented today.
The source of truth is the code.
Where this file and the code disagree, the code wins and this file should be updated.

- Tokens: `app/src/styles.css`, block `:root, [data-theme="dark"]`.
- Buttons: `.btn*` in `app/src/styles.css`, used through `@components/Button`.
- Auth pages: `app/src/pages/landing-auth.css`.
- Marketing landing: `app/src/pages/landing-theme.css`.

## Principles

Near-black neutrals with no color cast.
One accent color for actions: landing purple.
One highlight color for focus and emphasis: champagne, used sparingly.
Depth comes from surface steps and hairline borders, not from heavy shadows.
Every color in a component comes from a `--bw-*` token, never a hex literal, so tenant white-labeling keeps working.
Dark is the default theme.
The `data-theme` attribute on `<html>` and `<body>` switches between `dark` and `light`.

## Surfaces

Listed darkest to lightest.

| Role | Token | Value |
|---|---|---|
| App background | `--bw-bg` | `#0B0B0C` |
| Cards, sidebar, tables, panels | `--bw-bg-secondary` | `#141416` |
| Hover, inputs, raised cards | `--bw-bg-hover` | `#1C1C1F` |
| Selected rows, active nav item | `--bw-bg-hover-strong` | `#26262A` |

Rider surfaces follow the same steps.
`--rider-surface-elevated` is `#141416`.
`--rider-surface-inset` is `#1C1C1F`.
`--rider-row-hover` is `#1C1C1F`.
`--rider-hairline` is `#2A2A2E`.
`--rider-field-inset-glow` is a 1px white inset at 4% opacity that gives inputs a subtle top edge.

## Borders

| Role | Token | Value |
|---|---|---|
| Default border, dividers | `--bw-border` | `#2A2A2E` |
| Stronger border, toggle tracks | `--bw-border-strong` | `#3A3A40` |

Borders are always 1px.

## Text

| Role | Token | Value | Contrast on `#0B0B0C` |
|---|---|---|---|
| Headings and main content | `--bw-text` and `--bw-fg` | `#F5F5F4` | 18.0 |
| Labels, table headers, secondary text | `--bw-muted` | `#A1A1A6` | 7.6 |
| Placeholders, disabled | `--bw-disabled` | `#6B6B72` | 3.7 |

`--bw-disabled` is below 4.5:1, so use it only for disabled states and decorative text.
Auth page placeholders use `#8A8A91` instead, which gives 5.0 on `#1C1C1F`.

## Accent and focus

| Role | Token | Value |
|---|---|---|
| Primary action fill | `--bw-accent` | `#6e5bd8` |
| Primary action hover | `--bw-accent-hover` | `#7d6be6` |
| Focus ring, highlights | `--bw-focus` | `#C8A96A` (champagne) |

White text on `#6e5bd8` has a contrast ratio of 5.1.
Champagne has a contrast ratio of 8.7 on `#0B0B0C`.
Purple is for actions and selection.
Champagne is for focus rings, input focus borders, and the "assigned" status.
Do not use champagne as a button fill.

## Status colors

| Role | Token | Value |
|---|---|---|
| Success | `--bw-success` | `#3DD68C` |
| Warning | `--bw-warning` | `#F5B84B` |
| Error and danger | `--bw-error` | `#F0605D` |
| Info | not a token yet | `#5BA4F5` |

Status pills use a tinted background and a solid text color, defined as pairs.
Use `@components/StatusPill` rather than styling pills by hand.

| Status | Background token | Text token | Text color |
|---|---|---|---|
| Active | `--bw-status-active-bg` | `--bw-status-active-text` | `#3DD68C` |
| Pending | `--bw-status-pending-bg` | `--bw-status-pending-text` | `#F5B84B` |
| Done | `--bw-status-done-bg` | `--bw-status-done-text` | `#A1A1A6` |
| Cancelled | `--bw-status-cancelled-bg` | `--bw-status-cancelled-text` | `#F0605D` |
| Assigned | `--bw-status-assigned-bg` | `--bw-status-assigned-text` | `#C8A96A` |
| Confirmed | `--bw-status-confirmed-bg` | `--bw-status-confirmed-text` | `#5BA4F5` |
| Default | `--bw-status-default-bg` | `--bw-status-default-text` | `#A1A1A6` |

Backgrounds are the text color at 12 to 14 percent opacity.

## Buttons

Use `@components/Button`.
It emits `btn btn-{variant}`.
Links that must look like buttons take the same classes.

Shared rules for every variant:

- Pill shape, `border-radius: 999px`.
- Minimum height 44px, padding `12px 20px`.
- Font Work Sans, 14px, weight 600.
- `:active` scales to 0.98.
- `:disabled` drops to 50% opacity and shows a not-allowed cursor.
- `:focus-visible` shows a 2px outline with 2px offset, champagne in dark mode.
- Hover, active, focus, and disabled are pure CSS, never React state.
- Use `btn-block` for full width.
- Primary actions on phones use `min-height: 52px`.

| Variant | Fill | Text | Border | Hover |
|---|---|---|---|---|
| `btn-primary` | `--bw-accent` | white | none | `--bw-accent-hover` |
| `btn-secondary` | transparent | `--bw-text` | `--bw-border` | `--bw-bg-hover` fill |
| `btn-destructive` | `--bw-error` | white | none | brightness 1.08 |
| `btn-ghost` | transparent | `--bw-text` | none | `--bw-bg-hover` fill |

The primary button also carries a soft glow:
`inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 34px -14px color-mix(in srgb, var(--bw-accent) 38%, transparent)`.
The glow follows `--bw-accent`, so tenant branding recolors it automatically.

Use one primary button per view.
Pair it with a secondary button for the alternative action.

## Typography

| Use | Font |
|---|---|
| Headings | DM Sans |
| App body, labels, buttons | Work Sans |
| Landing and auth pages | Geist, falling back to DM Sans |
| Landing mono accents | Geist Mono |

Type scale tokens:

| Token | Size |
|---|---|
| `--fs-h1` | 56px |
| `--fs-h2` | 28px |
| `--fs-h3` | 18px |
| `--fs-body` | 16px |
| `--fs-small` | 13px |

Headlines use weight 500 with negative tracking between -0.02em and -0.035em.
Small uppercase labels are 11 to 12px, weight 600, tracking 0.06em to 0.14em.
Inputs are 16px on phones so iOS does not zoom on focus.

## Spacing and shape

Spacing scale: `--space-1` to `--space-8` are 4, 8, 12, 16, 24, 32, 48, 64px.

| Element | Radius |
|---|---|
| Buttons, pills, segmented controls | 999px |
| Landing and auth cards and panels | 24px to 28px |
| Rider map and large cards | 20px |
| Dashboard panels (`.bw-panel`) | 12px |
| Form fields | `--radius-field`, 10px (14px on auth pages) |

Touch targets are at least 44px tall.

## Elevation

| Token | Value |
|---|---|
| `--bw-shadow` | `0 6px 24px rgba(0,0,0,0.5)` |
| `--rider-shell-shadow` | `0 8px 24px rgba(0,0,0,0.4)` |
| `--rider-image-shadow` | `0 2px 8px rgba(0,0,0,0.5)` |

Prefer a surface step plus a 1px border over a larger shadow.
Card hover may lift by 2px and move the border to `--bw-border-strong`.

## Scrollbars

Track `#0B0B0C` with a 1px `#2A2A2E` left border.
Thumb `#2A2A2E` with a 2px `#0B0B0C` outline.
Thumb hover `#3A3A40`.

## Page patterns

### Auth pages (login, create account)

`main.landing-auth` re-points the `--landing-*` and `--bw-*` tokens to the dark palette.
Page `#0B0B0C`, panel and photo card `#141416`, inputs `#1C1C1F`.
Hairlines `#2A2A2E` and `#3A3A40`.
Input focus uses a champagne border with a `rgba(200,169,106,0.2)` ring.
A faint purple ambient glow sits in the page corners.

### Tenant storefront (default template)

Centered hero with a pill eyebrow, a large headline, and two cards for riders and drivers.
Cards use `--bw-bg-secondary`, a 24px radius, and a 1px `--bw-border`.
The rider card uses the accent for its icon tile and the driver card uses `--bw-success`.
The footer stays at the bottom of the screen.

### Rider app

Mobile uses a fixed bottom navigation with Home, Book, Trips, Fleet, and More.
Book is a raised 44px round button in `--bw-accent`.
More opens a bottom sheet with contact, profile, and logout.
Segmented controls (`.rider-seg`) replace short dropdowns.
The primary action stays pinned above the bottom bar while a form scrolls (`.rider-sticky-cta`).
`RiderMapPlaceholder` is a non-working map stand-in with a dashed purple route, two pins, disabled controls, and a "Map coming soon" tag.

## Light theme

Light keeps the same structure with its own values.
Background `#f8fafc`, cards `#ffffff`, text `#0f172a`, muted `#64748b`, border `#e2e8f0`.
The accent is the same landing purple, `#6e5bd8` with hover `#7d6be6`.
Buttons share the dark theme's shape and glow.

## Rules

- Never write a hex literal in a component, use `var(--bw-*)`.
- Never branch on a light or dark flag to pick a color.
- Use `@components/Button` and `@components/StatusPill` instead of hand-rolled versions.
- Use Phosphor icons only.
- Keep one primary button per view.
- Keep text at 4.5:1 contrast or better, except disabled and decorative text.
