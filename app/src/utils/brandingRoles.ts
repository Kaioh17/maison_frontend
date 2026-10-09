import type { TenantBrandingData } from '@api/tenantSettings'

export type ColorRole = 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'muted' | 'buttonText'

export type ColorRoleInfo = {
  role: ColorRole
  /** Branding field this role is stored in. */
  field: keyof Pick<TenantBrandingData, 'primary_color' | 'secondary_color' | 'accent_color' | 'background_color' | 'surface_color' | 'text_color' | 'text_muted_color' | 'button_text_color'>
  label: string
  description: string
  /** Token that holds the app's current value; seeds the picker while the tenant has not set this color. */
  cssVar: string
}

/** The brand colors a tenant can set, in the order they are listed. `role` is the `data-role` used in the phone preview. */
export const COLOR_ROLES: ColorRoleInfo[] = [
  { role: 'primary', field: 'primary_color', label: 'Primary', cssVar: '--bw-accent', description: 'Main brand color: primary buttons, links, focus rings and active states.' },
  { role: 'buttonText', field: 'button_text_color', label: 'Button text', cssVar: '--rider-on-primary', description: 'Text and icons inside primary brand-filled buttons.' },
  { role: 'background', field: 'background_color', label: 'Background', cssVar: '--bw-bg', description: 'The page background behind everything else.' },
  { role: 'surface', field: 'surface_color', label: 'Surface', cssVar: '--bw-bg-secondary', description: 'Cards, sheets, the tab bar and form fields.' },
  { role: 'text', field: 'text_color', label: 'Text', cssVar: '--bw-text', description: 'Headings, body copy and labels. Borders are derived from it.' },
  { role: 'muted', field: 'text_muted_color', label: 'Muted text', cssVar: '--bw-muted', description: 'Captions, helper text and placeholders.' },
  { role: 'accent', field: 'accent_color', label: 'Accent', cssVar: '--bw-accent-hover', description: 'Darker variant of Primary used for hover and pressed states.' },
  { role: 'secondary', field: 'secondary_color', label: 'Secondary', cssVar: '--bw-accent', description: 'Complementary brand color for subtle highlights.' },
]
