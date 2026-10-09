import type { TenantBrandingData } from '@api/tenantSettings'

export type ColorPreset = { name: string } & Pick<TenantBrandingData, 'primary_color' | 'secondary_color' | 'accent_color' | 'background_color' | 'surface_color' | 'text_color' | 'text_muted_color' | 'button_text_color'>

/** Starting points a tenant can apply and then tweak per color. Accent is the darker hover shade of primary. */
export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Midnight Gold', primary_color: '#C9A227', accent_color: '#A8871D', secondary_color: '#E6D28A', background_color: '#0E0E10', surface_color: '#1A1A1E', text_color: '#F5F2EA', text_muted_color: '#A3A09A', button_text_color: '#0E0E10' },
  { name: 'Ivory Noir', primary_color: '#111111', accent_color: '#333333', secondary_color: '#8C8C8C', background_color: '#FAF8F4', surface_color: '#FFFFFF', text_color: '#111111', text_muted_color: '#6B6B6B', button_text_color: '#FFFFFF' },
  { name: 'Emerald Club', primary_color: '#0F6B4F', accent_color: '#0B5440', secondary_color: '#C9B27C', background_color: '#F6F5F0', surface_color: '#FFFFFF', text_color: '#12261F', text_muted_color: '#5E6F68', button_text_color: '#FFFFFF' },
  { name: 'Royal Navy', primary_color: '#1F3A8A', accent_color: '#172C69', secondary_color: '#9DB4F0', background_color: '#F5F7FB', surface_color: '#FFFFFF', text_color: '#0F1B3D', text_muted_color: '#5B6584', button_text_color: '#FFFFFF' },
  { name: 'Burgundy Velvet', primary_color: '#8B1E3F', accent_color: '#6E1731', secondary_color: '#D9B8A0', background_color: '#FBF6F4', surface_color: '#FFFFFF', text_color: '#2A1218', text_muted_color: '#7A5F65', button_text_color: '#FFFFFF' },
]
