# Dark Mode Theme Configuration

## Core Color Palette

### Backgrounds
- **Main Background**: `#121212` - Charcoal almost-black, easier on eyes than pure black
- **Elevated Surfaces/Cards**: `#181818` - Slightly lighter for cards to stand out
- **Secondary Background**: `#181818` - Used for cards, modals, tables, stat cards

### Borders & Dividers
- **Border Color**: `#242424` - Subtle separation without harsh lines
- **Border Strong**: `#242424` - Stronger borders (same as regular border)

### Text Colors
- **Primary Text**: `#E0E0E0` - Soft light gray, not pure white to avoid glowing text
- **Secondary Text**: `#A0A3AA` - Mid-gray for labels and less important info
- **Disabled Text**: `#5A5D66` - Darker gray but still legible for disabled states

### Accent Colors
- **Primary Accent**: `#2F3CFF` - Deep navy for buttons and key highlights
- **Accent Hover**: `#1E2AE6` - Hover state for accent color

### Status Colors
- **Success**: `#1E7F4A` - Muted success color (darker, muted version)
- **Warning**: `#B8871B` - Muted warning color
- **Error**: `#C5483D` - Muted error color

## CSS Variables

```css
:root {
  --bw-bg: #121212;                    /* Main background */
  --bw-fg: #E0E0E0;                    /* Primary text */
  --bw-text: #E0E0E0;                  /* Primary text */
  --bw-muted: #A0A3AA;                 /* Secondary text */
  --bw-disabled: #5A5D66;              /* Disabled text */
  --bw-border: #242424;                /* Borders/dividers */
  --bw-border-strong: #242424;         /* Stronger borders */
  --bw-focus: #E0E0E0;                 /* Focus ring color */
  --bw-shadow: 0 6px 24px rgba(0,0,0,0.4);
  --bw-bg-hover: rgba(255,255,255,0.05);
  --bw-bg-hover-strong: rgba(255,255,255,0.1);
  --bw-bg-secondary: #181818;           /* Elevated surfaces/cards */
  --bw-accent: #2F3CFF;                 /* Primary accent */
  --bw-accent-hover: #1E2AE6;          /* Accent hover */
  --bw-success: #1E7F4A;               /* Success color */
  --bw-warning: #B8871B;                /* Warning color */
  --bw-error: #C5483D;                  /* Error color */
}
```

## Design Principles

1. **Avoid Pure Black/White**: Never use `#000000` or `#FFFFFF` - use the shades above for better contrast and comfort
2. **WCAG AA Compliance**: Maintain at least WCAG AA contrast ratios between text and backgrounds
3. **Minimal Palette**: 
   - 1-2 grays for surfaces
   - 2-3 grays for text
   - Single strong accent color for calm, high-end feel
4. **Muted Status Colors**: Success, warning, and error colors are darker and muted to avoid vibration on dark backgrounds

## Component Usage

- **Cards/Modals/Tables**: Use `var(--bw-bg-secondary)` for elevated surfaces
- **Borders**: Use `var(--bw-border)` for all borders and dividers
- **Primary Text**: Use `var(--bw-text)` or `var(--bw-fg)`
- **Secondary Text**: Use `var(--bw-muted)`
- **Disabled States**: Use `var(--bw-disabled)`
- **Status Badges**: Use `var(--bw-success)`, `var(--bw-warning)`, `var(--bw-error)`

## Auto Theme Support

The same color palette is applied in `@media (prefers-color-scheme: dark)` for auto theme mode.
