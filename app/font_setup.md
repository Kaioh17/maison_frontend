# Font Setup Documentation

## Font Imports
- **DM Sans**: Google Fonts (`app/index.html`)
- **Work Sans**: Google Fonts (`app/index.html`)
- **Default**: `Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif` (`app/src/styles.css`)

## Standard Header Typography
**This is the standard setup for all main page headers.**

- **Font Family**: `DM Sans, sans-serif`
- **Font Size**: `40px`
- **Font Weight**: `200` (ExtraLight)
- **Examples**: "Welcome back" (Login), "Create account" (Signup)

## Typography Reference

### Headings
- **Main Header**: DM Sans, 40px, weight 200
- **Subheading**: Work Sans, 16px, weight 300
  - Examples: "Sign in to continue", "Set up your company profile in minutes."

### Form Elements (Login & Signup)
**All non-header text uses Work Sans:**
- **Labels**: Work Sans, 13px (`small-muted` class)
- **Inputs**: Work Sans, default size, padding `16px 18px 16px 44px`, `borderRadius: 0`
- **Buttons**: Work Sans, weight 600, padding `14px 24px`, `borderRadius: 0`
  - Dark mode button text: `#000000`
  - Light mode button text: `#ffffffff`

### Other Text (Login & Signup)
- **Divider text**: Work Sans, 12px (`small-muted`)
- **Secondary messages**: Work Sans, 14px (`small-muted`)
- **Error messages**: Work Sans, 14px, color `#dc2626`
- **Links**: Work Sans (Upload Logo, Change Logo, Cancel, sign in)
- **Image overlay**: Inter, 20px, weight 300, line-height 1.6

## CSS Variables
- `--fs-small`: `13px` (used by `.small-muted`)
