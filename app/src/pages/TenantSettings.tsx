import { useState, useEffect } from 'react'
import { getTenantInfo } from '@api/tenant'
import { 
  getTenantConfig, 
  updateTenantSettings, 
  updateTenantPricing, 
  updateTenantBranding, 
  updateTenantLogo, 
  testLogoEndpoint,
  type TenantConfigResponse,
  type TenantSettingsData,
  type TenantPricingData,
  type TenantBrandingData,
  type UpdateTenantSettingsPayload,
  type UpdateTenantPricingPayload,
  type UpdateTenantBrandingPayload
} from '@api/tenantSettings'
import { upgradeSubscription } from '@api/subscription'
import { useAuthStore } from '@store/auth'
import { useNavigate } from 'react-router-dom'
import { Gear, User, Building, MapPin, Phone, Envelope, Shield, CreditCard, CurrencyDollar, Clock, Car, Palette, FloppyDisk, Pencil, CaretDown, CaretUp, XCircle, ArrowUp } from '@phosphor-icons/react'
import UpgradePlanButton from '@components/UpgradePlanButton'
import SettingsMenuBar, { useSettingsMenu } from '@components/SettingsMenuBar'

export default function TenantSettings() {
  const [info, setInfo] = useState<any>(null)
  const [tenantConfig, setTenantConfig] = useState<TenantConfigResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingSettings, setEditingSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  // Separate edited state for each section
  const [editedSettings, setEditedSettings] = useState<TenantSettingsData | null>(null)
  const [editedPricing, setEditedPricing] = useState<TenantPricingData | null>(null)
  const [editedBranding, setEditedBranding] = useState<TenantBrandingData | null>(null)
  // Per-section editing state for laptop screens
  const [editingSections, setEditingSections] = useState<{ [key: string]: boolean }>({})
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    accountInfo: true,
    companyInfo: true,
    subscription: true,
    statistics: true,
    tenantSettings: true,
    branding: true,
    fare: true,
    rider: true
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { isOpen: menuIsOpen } = useSettingsMenu()
  const navigate = useNavigate()
  
  // Button hover states
  const [isEditAccountInfoHovered, setIsEditAccountInfoHovered] = useState(false)
  const [isEditCompanyInfoHovered, setIsEditCompanyInfoHovered] = useState(false)
  const [isEditSubscriptionHovered, setIsEditSubscriptionHovered] = useState(false)
  const [isEditStatisticsHovered, setIsEditStatisticsHovered] = useState(false)
  const [isCancelEditHovered, setIsCancelEditHovered] = useState(false)
  const [isSaveChangesHovered, setIsSaveChangesHovered] = useState(false)
  const [isEditSettingsHovered, setIsEditSettingsHovered] = useState(false)
  const [isEditBrandingHovered, setIsEditBrandingHovered] = useState(false)
  const [isCancelLogoHovered, setIsCancelLogoHovered] = useState(false)
  const [isSaveLogoHovered, setIsSaveLogoHovered] = useState(false)
  const [isEditFareHovered, setIsEditFareHovered] = useState(false)
  const [isEditRiderHovered, setIsEditRiderHovered] = useState(false)
  const [isEditBookingConfigHovered, setIsEditBookingConfigHovered] = useState(false)
  const [isEditRiderTiersHovered, setIsEditRiderTiersHovered] = useState(false)
  const [isSaveBookingConfigHovered, setIsSaveBookingConfigHovered] = useState(false)
  const [isSaveRiderTiersHovered, setIsSaveRiderTiersHovered] = useState(false)
  const [isCancelBookingConfigHovered, setIsCancelBookingConfigHovered] = useState(false)
  const [isCancelRiderTiersHovered, setIsCancelRiderTiersHovered] = useState(false)
  
  // Separate editing states for booking config and rider tiers
  const [editingBookingConfig, setEditingBookingConfig] = useState(false)
  const [editingRiderTiers, setEditingRiderTiers] = useState(false)
  const [savingBookingConfig, setSavingBookingConfig] = useState(false)
  const [savingRiderTiers, setSavingRiderTiers] = useState(false)
  
  // State for adding new service
  const [newServiceName, setNewServiceName] = useState('')
  const [showAddServiceInput, setShowAddServiceInput] = useState(false)
  
  // Upgrade subscription state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Helper function to format service type names (e.g., "event_dropoff" -> "Event Dropoff")
  const formatServiceTypeName = (typeName: string): string => {
    return typeName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Helper function to convert service name to key format (e.g., "Event Dropoff" -> "event_dropoff")
  const convertToServiceKey = (serviceName: string): string => {
    return serviceName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
  }

  // Handler to add new service
  const handleAddNewService = () => {
    if (!newServiceName.trim()) {
      alert('Please enter a service name')
      return
    }

    const serviceKey = convertToServiceKey(newServiceName.trim())
    
    // Check if service already exists
    if (editedSettings?.config?.booking?.types?.[serviceKey]) {
      alert('This service already exists')
      setNewServiceName('')
      return
    }

    if (editedSettings && editedSettings.config && editedSettings.config.booking) {
      const updatedTypes = {
        ...editedSettings.config.booking.types,
        [serviceKey]: {
          is_deposit_required: true
        }
      }

      setEditedSettings({
        ...editedSettings,
        config: {
          ...editedSettings.config,
          booking: {
            ...editedSettings.config.booking,
            types: updatedTypes
          }
        }
      })

      setNewServiceName('')
      setShowAddServiceInput(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantInfo, config] = await Promise.all([
          getTenantInfo(),
          getTenantConfig('all')
        ])
        setInfo(tenantInfo.data)
        setTenantConfig(config)
        // Initialize edited state from config with defaults if missing
        if (config.settings) {
          // Preserve all existing service types dynamically
          const existingTypes = config.settings.config?.booking?.types || {}
          const typesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
          
          // Preserve all types from the config
          Object.keys(existingTypes).forEach(typeKey => {
            typesWithDefaults[typeKey] = {
              is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
            }
          })
          
          const settingsWithDefaults = {
            ...config.settings,
            config: {
              booking: {
                allow_guest_bookings: config.settings.config?.booking?.allow_guest_bookings ?? true,
                show_vehicle_images: config.settings.config?.booking?.show_vehicle_images ?? true,
                types: typesWithDefaults
              },
              branding: {
                button_radius: config.settings.config?.branding?.button_radius ?? 0,
                font_family: config.settings.config?.branding?.font_family ?? 'string'
              },
              features: {
                vip_profiles: config.settings.config?.features?.vip_profiles ?? true,
                show_loyalty_banner: config.settings.config?.features?.show_loyalty_banner ?? true
              }
            }
          }
          setEditedSettings(settingsWithDefaults)
        }
        if (config.pricing) setEditedPricing(config.pricing)
        if (config.branding) setEditedBranding(config.branding)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSettingChange = (field: keyof TenantSettingsData, value: any) => {
    if (editedSettings) {
      setEditedSettings({
        ...editedSettings,
        [field]: value
      })
    }
  }

  const handleConfigChange = (path: string[], value: any) => {
    if (editedSettings && editedSettings.config) {
      // Deep clone the config to avoid mutation
      const deepClone = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj
        if (Array.isArray(obj)) return obj.map(deepClone)
        const cloned: any = {}
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key])
          }
        }
        return cloned
      }
      
      const newConfig = deepClone(editedSettings.config)
      
      // Navigate to the nested property and update
      let current: any = newConfig
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        } else {
          current[path[i]] = { ...current[path[i]] }
        }
        current = current[path[i]]
      }
      
      // Set the final value
      current[path[path.length - 1]] = value
      
      setEditedSettings({
        ...editedSettings,
        config: newConfig
      })
    }
  }

  const handlePricingChange = (field: keyof TenantPricingData, value: any) => {
    if (editedPricing) {
      setEditedPricing({
        ...editedPricing,
        [field]: value
      })
    }
  }

  const handleBrandingChange = (field: keyof TenantBrandingData, value: any) => {
    if (editedBranding) {
      setEditedBranding({
        ...editedBranding,
        [field]: value
      })
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveLogo = async () => {
    if (!logoFile) {
      alert('Please select a logo file to upload')
      return
    }

    try {
      setSavingLogo(true)
      await updateTenantLogo(logoFile)
      // After successful logo update, refresh the config to get the new logo URL
      const refreshedConfig = await getTenantConfig('all')
      setTenantConfig(refreshedConfig)
      if (refreshedConfig.branding) {
        setEditedBranding(refreshedConfig.branding)
      }
      setLogoFile(null)
      setLogoPreview(null)
      alert('Logo updated successfully!')
    } catch (error) {
      console.error('Failed to update logo:', error)
      alert('Failed to update logo. Please try again.')
    } finally {
      setSavingLogo(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      const updatePromises: Promise<any>[] = []
      
      // Check if settings changed
      if (editedSettings && tenantConfig?.settings) {
        const settingsChanged = 
          editedSettings.rider_tiers_enabled !== tenantConfig.settings.rider_tiers_enabled ||
          JSON.stringify(editedSettings.config) !== JSON.stringify(tenantConfig.settings.config)
        
        if (settingsChanged) {
          // Preserve all existing service types dynamically
          const existingTypes = editedSettings.config?.booking?.types || {}
          const typesToSave: Record<string, { is_deposit_required: boolean }> = {}
          
          Object.keys(existingTypes).forEach(typeKey => {
            typesToSave[typeKey] = {
              is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
            }
          })
          
          // Send complete config object with all fields (JSONB requirement)
          const completeConfig = {
            rider_tiers_enabled: editedSettings.rider_tiers_enabled,
            config: {
              booking: {
                allow_guest_bookings: editedSettings.config?.booking?.allow_guest_bookings ?? true,
                show_vehicle_images: editedSettings.config?.booking?.show_vehicle_images ?? true,
                types: typesToSave
              },
              branding: {
                button_radius: editedSettings.config?.branding?.button_radius ?? 0,
                font_family: editedSettings.config?.branding?.font_family ?? 'string'
              },
              features: {
                vip_profiles: editedSettings.config?.features?.vip_profiles ?? true,
                show_loyalty_banner: editedSettings.config?.features?.show_loyalty_banner ?? true
              }
            }
          }
          
          updatePromises.push(
            updateTenantSettings(completeConfig).then(result => ({ type: 'settings', data: result }))
          )
        }
      }
      
      // Check if pricing changed
      if (editedPricing && tenantConfig?.pricing) {
        const pricingChanged = 
          editedPricing.base_fare !== tenantConfig.pricing.base_fare ||
          editedPricing.per_mile_rate !== tenantConfig.pricing.per_mile_rate ||
          editedPricing.per_minute_rate !== tenantConfig.pricing.per_minute_rate ||
          editedPricing.per_hour_rate !== tenantConfig.pricing.per_hour_rate ||
          editedPricing.cancellation_fee !== tenantConfig.pricing.cancellation_fee ||
          editedPricing.discounts !== tenantConfig.pricing.discounts
        
        if (pricingChanged) {
          updatePromises.push(
            updateTenantPricing({
              base_fare: editedPricing.base_fare,
              per_mile_rate: editedPricing.per_mile_rate,
              per_minute_rate: editedPricing.per_minute_rate,
              per_hour_rate: editedPricing.per_hour_rate,
              cancellation_fee: editedPricing.cancellation_fee,
              discounts: editedPricing.discounts
            }).then(result => ({ type: 'pricing', data: result }))
          )
        }
      }
      
      // Check if branding changed (excluding logo_url which is handled separately)
      if (editedBranding && tenantConfig?.branding) {
        const brandingChanged = 
          editedBranding.theme !== tenantConfig.branding.theme ||
          editedBranding.primary_color !== tenantConfig.branding.primary_color ||
          editedBranding.secondary_color !== tenantConfig.branding.secondary_color ||
          editedBranding.accent_color !== tenantConfig.branding.accent_color ||
          editedBranding.favicon_url !== tenantConfig.branding.favicon_url ||
          editedBranding.slug !== tenantConfig.branding.slug ||
          editedBranding.email_from_name !== tenantConfig.branding.email_from_name ||
          editedBranding.email_from_address !== tenantConfig.branding.email_from_address ||
          editedBranding.enable_branding !== tenantConfig.branding.enable_branding
        
        if (brandingChanged) {
          updatePromises.push(
            updateTenantBranding({
              theme: editedBranding.theme,
              primary_color: editedBranding.primary_color,
              secondary_color: editedBranding.secondary_color,
              accent_color: editedBranding.accent_color,
              favicon_url: editedBranding.favicon_url,
              slug: editedBranding.slug,
              email_from_name: editedBranding.email_from_name,
              email_from_address: editedBranding.email_from_address,
              enable_branding: editedBranding.enable_branding
            }).then(result => ({ type: 'branding', data: result }))
          )
        }
      }
      
      if (updatePromises.length === 0) {
        alert('No changes to save')
        setSaving(false)
        return
      }
      
      // Execute all updates
      const results = await Promise.all(updatePromises)
      
      // Refresh config to get latest data
      const refreshedConfig = await getTenantConfig('all')
      setTenantConfig(refreshedConfig)
      if (refreshedConfig.settings) {
        // Preserve all types dynamically
        const refreshedTypes = refreshedConfig.settings.config?.booking?.types || {}
        const refreshedTypesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
        
        Object.keys(refreshedTypes).forEach(typeKey => {
          refreshedTypesWithDefaults[typeKey] = {
            is_deposit_required: refreshedTypes[typeKey]?.is_deposit_required ?? true
          }
        })
        
        const settingsWithDefaults = {
          ...refreshedConfig.settings,
          config: {
            booking: {
              allow_guest_bookings: refreshedConfig.settings.config?.booking?.allow_guest_bookings ?? true,
              show_vehicle_images: refreshedConfig.settings.config?.booking?.show_vehicle_images ?? true,
              types: refreshedTypesWithDefaults
            },
            branding: {
              button_radius: refreshedConfig.settings.config?.branding?.button_radius ?? 0,
              font_family: refreshedConfig.settings.config?.branding?.font_family ?? 'string'
            },
            features: {
              vip_profiles: refreshedConfig.settings.config?.features?.vip_profiles ?? true,
              show_loyalty_banner: refreshedConfig.settings.config?.features?.show_loyalty_banner ?? true
            }
          }
        }
        setEditedSettings(settingsWithDefaults)
      }
      if (refreshedConfig.pricing) setEditedPricing(refreshedConfig.pricing)
      if (refreshedConfig.branding) setEditedBranding(refreshedConfig.branding)
      
      setEditingSettings(false)
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('Failed to update settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }


  const handleCancelEdit = () => {
    if (tenantConfig) {
      if (tenantConfig.settings) {
        // Preserve all types dynamically
        const existingTypes = tenantConfig.settings.config?.booking?.types || {}
        const typesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
        
        Object.keys(existingTypes).forEach(typeKey => {
          typesWithDefaults[typeKey] = {
            is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
          }
        })
        
        const settingsWithDefaults = {
          ...tenantConfig.settings,
          config: {
            booking: {
              allow_guest_bookings: tenantConfig.settings.config?.booking?.allow_guest_bookings ?? true,
              show_vehicle_images: tenantConfig.settings.config?.booking?.show_vehicle_images ?? true,
              types: typesWithDefaults
            },
            branding: {
              button_radius: tenantConfig.settings.config?.branding?.button_radius ?? 0,
              font_family: tenantConfig.settings.config?.branding?.font_family ?? 'string'
            },
            features: {
              vip_profiles: tenantConfig.settings.config?.features?.vip_profiles ?? true,
              show_loyalty_banner: tenantConfig.settings.config?.features?.show_loyalty_banner ?? true
            }
          }
        }
        setEditedSettings(settingsWithDefaults)
      }
      if (tenantConfig.pricing) setEditedPricing(tenantConfig.pricing)
      if (tenantConfig.branding) setEditedBranding(tenantConfig.branding)
    }
    setEditingSettings(false)
  }

  const handleCancelLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleSaveBookingConfig = async () => {
    if (!editedSettings || !tenantConfig?.settings) return
    
    try {
      setSavingBookingConfig(true)
      
      // Preserve all existing service types dynamically
      const existingTypes = editedSettings.config?.booking?.types || {}
      const typesToSave: Record<string, { is_deposit_required: boolean }> = {}
      
      // Preserve all types from edited settings
      Object.keys(existingTypes).forEach(typeKey => {
        typesToSave[typeKey] = {
          is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
        }
      })
      
      const completeConfig = {
        rider_tiers_enabled: tenantConfig.settings.rider_tiers_enabled,
        config: {
          booking: {
            allow_guest_bookings: editedSettings.config?.booking?.allow_guest_bookings ?? true,
            show_vehicle_images: editedSettings.config?.booking?.show_vehicle_images ?? true,
            types: typesToSave
          },
          branding: {
            button_radius: editedSettings.config?.branding?.button_radius ?? tenantConfig.settings.config?.branding?.button_radius ?? 0,
            font_family: editedSettings.config?.branding?.font_family ?? tenantConfig.settings.config?.branding?.font_family ?? 'string'
          },
          features: {
            vip_profiles: editedSettings.config?.features?.vip_profiles ?? tenantConfig.settings.config?.features?.vip_profiles ?? true,
            show_loyalty_banner: editedSettings.config?.features?.show_loyalty_banner ?? tenantConfig.settings.config?.features?.show_loyalty_banner ?? true
          }
        }
      }
      
      await updateTenantSettings(completeConfig)
      
      // Refresh config
      const refreshedConfig = await getTenantConfig('all')
      setTenantConfig(refreshedConfig)
      if (refreshedConfig.settings) {
        // Preserve all types dynamically after refresh
        const refreshedTypes = refreshedConfig.settings.config?.booking?.types || {}
        const refreshedTypesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
        
        Object.keys(refreshedTypes).forEach(typeKey => {
          refreshedTypesWithDefaults[typeKey] = {
            is_deposit_required: refreshedTypes[typeKey]?.is_deposit_required ?? true
          }
        })
        
        const settingsWithDefaults = {
          ...refreshedConfig.settings,
          config: {
            booking: {
              allow_guest_bookings: refreshedConfig.settings.config?.booking?.allow_guest_bookings ?? true,
              show_vehicle_images: refreshedConfig.settings.config?.booking?.show_vehicle_images ?? true,
              types: refreshedTypesWithDefaults
            },
            branding: {
              button_radius: refreshedConfig.settings.config?.branding?.button_radius ?? 0,
              font_family: refreshedConfig.settings.config?.branding?.font_family ?? 'string'
            },
            features: {
              vip_profiles: refreshedConfig.settings.config?.features?.vip_profiles ?? true,
              show_loyalty_banner: refreshedConfig.settings.config?.features?.show_loyalty_banner ?? true
            }
          }
        }
        setEditedSettings(settingsWithDefaults)
      }
      
      setEditingBookingConfig(false)
      alert('Booking configuration updated successfully!')
    } catch (error) {
      console.error('Failed to update booking configuration:', error)
      alert('Failed to update booking configuration. Please try again.')
    } finally {
      setSavingBookingConfig(false)
    }
  }

  const handleSaveRiderTiers = async () => {
    if (!editedSettings || !tenantConfig?.settings) return
    
    try {
      setSavingRiderTiers(true)
      
      // Preserve all existing service types dynamically
      const existingTypes = tenantConfig.settings.config?.booking?.types || {}
      const typesToPreserve: Record<string, { is_deposit_required: boolean }> = {}
      
      Object.keys(existingTypes).forEach(typeKey => {
        typesToPreserve[typeKey] = {
          is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
        }
      })
      
      const completeConfig = {
        rider_tiers_enabled: editedSettings.rider_tiers_enabled,
        config: tenantConfig.settings.config ? {
          ...tenantConfig.settings.config,
          booking: {
            ...tenantConfig.settings.config.booking,
            types: typesToPreserve
          }
        } : {
          booking: {
            allow_guest_bookings: true,
            show_vehicle_images: true,
            types: typesToPreserve
          },
          branding: {
            button_radius: 0,
            font_family: 'string'
          },
          features: {
            vip_profiles: true,
            show_loyalty_banner: true
          }
        }
      }
      
      await updateTenantSettings(completeConfig)
      
      // Refresh config
      const refreshedConfig = await getTenantConfig('all')
      setTenantConfig(refreshedConfig)
      if (refreshedConfig.settings) {
        // Preserve all types dynamically
        const refreshedTypes = refreshedConfig.settings.config?.booking?.types || {}
        const refreshedTypesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
        
        Object.keys(refreshedTypes).forEach(typeKey => {
          refreshedTypesWithDefaults[typeKey] = {
            is_deposit_required: refreshedTypes[typeKey]?.is_deposit_required ?? true
          }
        })
        
        const settingsWithDefaults = {
          ...refreshedConfig.settings,
          config: {
            booking: {
              allow_guest_bookings: refreshedConfig.settings.config?.booking?.allow_guest_bookings ?? true,
              show_vehicle_images: refreshedConfig.settings.config?.booking?.show_vehicle_images ?? true,
              types: refreshedTypesWithDefaults
            },
            branding: {
              button_radius: refreshedConfig.settings.config?.branding?.button_radius ?? 0,
              font_family: refreshedConfig.settings.config?.branding?.font_family ?? 'string'
            },
            features: {
              vip_profiles: refreshedConfig.settings.config?.features?.vip_profiles ?? true,
              show_loyalty_banner: refreshedConfig.settings.config?.features?.show_loyalty_banner ?? true
            }
          }
        }
        setEditedSettings(settingsWithDefaults)
      }
      
      setEditingRiderTiers(false)
      alert('Rider tiers updated successfully!')
    } catch (error) {
      console.error('Failed to update rider tiers:', error)
      alert('Failed to update rider tiers. Please try again.')
    } finally {
      setSavingRiderTiers(false)
    }
  }

  const handleCancelBookingConfig = () => {
    if (tenantConfig?.settings) {
      // Preserve all existing service types dynamically
      const existingTypes = tenantConfig.settings.config?.booking?.types || {}
      const typesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
      
      Object.keys(existingTypes).forEach(typeKey => {
        typesWithDefaults[typeKey] = {
          is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
        }
      })
      
      const settingsWithDefaults = {
        ...tenantConfig.settings,
        config: {
          booking: {
            allow_guest_bookings: tenantConfig.settings.config?.booking?.allow_guest_bookings ?? true,
            show_vehicle_images: tenantConfig.settings.config?.booking?.show_vehicle_images ?? true,
            types: typesWithDefaults
          },
          branding: {
            button_radius: tenantConfig.settings.config?.branding?.button_radius ?? 0,
            font_family: tenantConfig.settings.config?.branding?.font_family ?? 'string'
          },
          features: {
            vip_profiles: tenantConfig.settings.config?.features?.vip_profiles ?? true,
            show_loyalty_banner: tenantConfig.settings.config?.features?.show_loyalty_banner ?? true
          }
        }
      }
      setEditedSettings(settingsWithDefaults)
    }
    setEditingBookingConfig(false)
  }

  const handleCancelRiderTiers = () => {
    if (tenantConfig?.settings) {
      // Preserve all types dynamically
      const existingTypes = tenantConfig.settings.config?.booking?.types || {}
      const typesWithDefaults: Record<string, { is_deposit_required: boolean }> = {}
      
      Object.keys(existingTypes).forEach(typeKey => {
        typesWithDefaults[typeKey] = {
          is_deposit_required: existingTypes[typeKey]?.is_deposit_required ?? true
        }
      })
      
      const settingsWithDefaults = {
        ...tenantConfig.settings,
        config: {
          booking: {
            allow_guest_bookings: tenantConfig.settings.config?.booking?.allow_guest_bookings ?? true,
            show_vehicle_images: tenantConfig.settings.config?.booking?.show_vehicle_images ?? true,
            types: typesWithDefaults
          },
          branding: {
            button_radius: tenantConfig.settings.config?.branding?.button_radius ?? 0,
            font_family: tenantConfig.settings.config?.branding?.font_family ?? 'string'
          },
          features: {
            vip_profiles: tenantConfig.settings.config?.features?.vip_profiles ?? true,
            show_loyalty_banner: tenantConfig.settings.config?.features?.show_loyalty_banner ?? true
          }
        }
      }
      setEditedSettings(settingsWithDefaults)
    }
    setEditingRiderTiers(false)
  }

  const handleTestLogoEndpoint = async () => {
    try {
      const result = await testLogoEndpoint()
      alert('Logo endpoint test successful! Check console for details.')
    } catch (error) {
      console.error('Logo endpoint test failed:', error)
      alert('Logo endpoint test failed! Check console for details.')
    }
  }

  const handleUpgradePlan = async (plan: { product_type: string; price_id: string }) => {
    setUpgradingPlan(plan.product_type)
    setUpgradeError(null)

    try {
      const response = await upgradeSubscription({
        price_id: plan.price_id,
        product_type: plan.product_type
      })

      if (response.success) {
        // Close modal and show success - checkout will handle itself
        setShowUpgradeModal(false)
        alert('Subscription upgrade initiated successfully!')
        // Reload data to reflect the new subscription
        const [tenantInfo, config] = await Promise.all([
          getTenantInfo(),
          getTenantConfig('all')
        ])
        setInfo(tenantInfo.data)
        setTenantConfig(config)
        if (config.settings) setEditedSettings(config.settings)
        if (config.pricing) setEditedPricing(config.pricing)
        if (config.branding) setEditedBranding(config.branding)
      } else {
        setUpgradeError(response.error || 'Failed to upgrade subscription')
        setUpgradingPlan(null)
      }
    } catch (err: any) {
      setUpgradeError(err?.response?.data?.error || err?.message || 'Failed to upgrade subscription')
      setUpgradingPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="bw bw-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        padding: 'clamp(16px, 3vw, 24px) 0'
      }}>
        <div className="bw-loading" style={{
          fontSize: 'clamp(14px, 2vw, 16px)',
          fontFamily: '"Work Sans", sans-serif',
          color: 'var(--bw-muted)'
        }}>
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar />
      
      {/* Main Content */}
      <div style={{ 
        marginLeft: isMobile ? '0' : (menuIsOpen ? '20%' : '64px'),
        transition: 'margin-left 0.3s ease',
        width: isMobile ? '100%' : (menuIsOpen ? 'calc(100% - 20%)' : 'calc(100% - 64px)'),
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Header - Left aligned */}
        <div style={{ 
          width: '100%',
          maxWidth: '100%',
          padding: `clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)`,
          marginBottom: 'clamp(24px, 4vw, 32px)',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 4vw, 32px)', 
            margin: 0,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 200,
            color: 'var(--bw-text)'
          }}>
            Tenant Settings
          </h1>
        </div>

      {/* Content Container */}
      <div className="bw-container" style={{ 
        padding: '0 clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px) clamp(16px, 2vw, 24px)',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>

      {/* Tenant Settings Section */}
      {tenantConfig && (
        <div className="bw-card" style={{ 
          marginTop: 'clamp(16px, 3vw, 24px)',
          backgroundColor: 'var(--bw-bg-secondary)',
          border: '1px solid var(--bw-border)',
          borderRadius: 'clamp(8px, 1.5vw, 12px)',
          padding: 'clamp(16px, 2.5vw, 24px)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div 
            className="bw-card-header" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: isMobile ? 'pointer' : 'default',
              userSelect: 'none',
              marginBottom: openSections.tenantSettings ? 'clamp(12px, 2vw, 16px)' : 0,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: 'clamp(8px, 1.5vw, 12px)'
            }}
            onClick={() => isMobile && toggleSection('tenantSettings')}
          >
            <h3 style={{ 
              margin: 0,
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 400,
              color: 'var(--bw-text)'
            }}>
              Tenant Settings
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(8px, 1.5vw, 12px)',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              width: isMobile ? '100%' : 'auto'
            }}>
              {editingSettings ? (
                <>
                  <button 
                    className={`bw-btn-outline ${isCancelEditHovered ? 'custom-hover-border' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    onMouseEnter={() => !saving && setIsCancelEditHovered(true)}
                    onMouseLeave={() => setIsCancelEditHovered(false)}
                    disabled={saving}
                    style={{
                      flex: isMobile ? '1 1 100%' : '0 1 auto',
                      minWidth: isMobile ? '100%' : 'auto',
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      justifyContent: 'center',
                      color: isCancelEditHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                      border: isCancelEditHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                      borderColor: isCancelEditHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      backgroundColor: isCancelEditHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isCancelEditHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      Cancel
                    </span>
                  </button>
                  <button 
                    className={`bw-btn bw-btn-action ${isSaveChangesHovered ? 'custom-hover-border' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSaveSettings(); }}
                    onMouseEnter={() => !saving && setIsSaveChangesHovered(true)}
                    onMouseLeave={() => setIsSaveChangesHovered(false)}
                    disabled={saving}
                    style={{
                      flex: isMobile ? '1 1 100%' : '0 1 auto',
                      minWidth: isMobile ? '100%' : 'auto',
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      justifyContent: 'center',
                      backgroundColor: isSaveChangesHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                      color: isSaveChangesHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                      border: isSaveChangesHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                      borderColor: isSaveChangesHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    {saving ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <FloppyDisk size={16} style={{ 
                          width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                          height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                        }} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button 
                  className={`bw-btn-outline ${isEditSettingsHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setEditingSettings(true); }}
                  onMouseEnter={() => setIsEditSettingsHovered(true)}
                  onMouseLeave={() => setIsEditSettingsHovered(false)}
                  style={{
                    flex: isMobile ? '1 1 100%' : '0 1 auto',
                    minWidth: isMobile ? '100%' : 'auto',
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    justifyContent: 'center',
                    color: isEditSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    border: isEditSettingsHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                    borderColor: isEditSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    backgroundColor: isEditSettingsHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditSettingsHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    Edit Settings
                  </span>
                </button>
              )}
              {isMobile && (
                openSections.tenantSettings ? (
                  <CaretUp size={20} style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <CaretDown size={20} style={{ color: 'var(--bw-text)' }} />
                )
              )}
            </div>
          </div>
          {openSections.tenantSettings && (
          <>
          {/* Branding & Theme Settings */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)', borderTop: '1px solid var(--bw-border)', paddingTop: 'clamp(24px, 4vw, 32px)' }}>
            <div 
              style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              onClick={() => isMobile && toggleSection('branding')}
            >
              <h4 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)'
              }}>
                <Palette size={16} style={{ color: 'var(--bw-text)' }} />
                Branding & Theme
              </h4>
              {isMobile && (
                openSections.branding ? (
                  <CaretUp size={16} style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <CaretDown size={16} style={{ color: 'var(--bw-text)' }} />
                )
              )}
              {!isMobile && (
                <button
                  className={`bw-btn-outline ${isEditBrandingHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSections(prev => ({ ...prev, branding: !prev.branding }));
                  }}
                  onMouseEnter={() => setIsEditBrandingHovered(true)}
                  onMouseLeave={() => setIsEditBrandingHovered(false)}
                  style={{
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isEditBrandingHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                    borderColor: isEditBrandingHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    color: isEditBrandingHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    backgroundColor: isEditBrandingHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditBrandingHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    {editingSections.branding ? 'Cancel' : 'Edit'}
                  </span>
                </button>
              )}
            </div>
            {openSections.branding && (
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Theme
                </label>
                {editingSettings ? (
                  <select 
                    className="bw-input" 
                    value={editedBranding?.theme || ''} 
                    onChange={(e) => handleBrandingChange('theme', e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.branding?.theme || 'Not set'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ 
                gridColumn: isMobile ? 'span 1' : 'span 2',
                width: '100%',
                minWidth: 0
              }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Logo
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)', width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'clamp(8px, 1.5vw, 10px)', 
                    flexWrap: 'wrap',
                    width: '100%'
                  }}>
                    <input 
                      className="bw-input" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      style={{ 
                        flex: 1,
                        minWidth: isMobile ? '0' : '200px',
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                    {logoPreview && (
                      <img src={logoPreview} alt="Logo Preview" style={{ 
                        width: 'clamp(40px, 5vw, 50px)', 
                        height: 'clamp(40px, 5vw, 50px)', 
                        borderRadius: '4px', 
                        objectFit: 'contain',
                        border: '1px solid var(--bw-border)'
                      }} />
                    )}
                    {!logoPreview && tenantConfig.branding?.logo_url && (
                      <img 
                        src={tenantConfig.branding.logo_url} 
                        alt="Current logo" 
                        style={{ 
                          width: 'clamp(40px, 5vw, 50px)', 
                          height: 'clamp(40px, 5vw, 50px)', 
                          borderRadius: '4px',
                          objectFit: 'contain',
                          border: '1px solid var(--bw-border)'
                        }} 
                      />
                    )}
                  </div>
                  {logoFile && (
                    <div style={{ 
                      display: 'flex', 
                      gap: 'clamp(8px, 1.5vw, 12px)', 
                      flexWrap: 'wrap',
                      width: '100%'
                    }}>
                      <button 
                        className={`bw-btn-outline ${isCancelLogoHovered ? 'custom-hover-border' : ''}`}
                        onClick={handleCancelLogo}
                        onMouseEnter={() => !savingLogo && setIsCancelLogoHovered(true)}
                        onMouseLeave={() => setIsCancelLogoHovered(false)}
                        disabled={savingLogo}
                        style={{ 
                          flex: isMobile ? '1 1 100%' : '0 1 auto',
                          minWidth: isMobile ? '100%' : 'auto',
                          padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px', 
                          fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                          justifyContent: 'center',
                          color: isCancelLogoHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                          border: isCancelLogoHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                          borderColor: isCancelLogoHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                          backgroundColor: isCancelLogoHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        } as React.CSSProperties}
                      >
                        <span style={{ color: isCancelLogoHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                          Cancel
                        </span>
                      </button>
                      <button 
                        className={`bw-btn bw-btn-action ${isSaveLogoHovered ? 'custom-hover-border' : ''}`}
                        onClick={handleSaveLogo}
                        onMouseEnter={() => !savingLogo && setIsSaveLogoHovered(true)}
                        onMouseLeave={() => setIsSaveLogoHovered(false)}
                        disabled={savingLogo}
                        style={{ 
                          flex: isMobile ? '1 1 100%' : '0 1 auto',
                          minWidth: isMobile ? '100%' : 'auto',
                          padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px', 
                          fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                          justifyContent: 'center',
                          backgroundColor: isSaveLogoHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                          color: isSaveLogoHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                          border: isSaveLogoHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                          borderColor: isSaveLogoHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease'
                        } as React.CSSProperties}
                      >
                        {savingLogo ? (
                          <span>Saving...</span>
                        ) : (
                          <>
                            <FloppyDisk size={16} style={{ 
                              width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                              height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                            }} />
                            <span>Save Logo</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {!logoFile && tenantConfig.branding?.logo_url && (
                    <span className="bw-info-value small-muted" style={{ 
                      fontSize: 'clamp(11px, 1.3vw, 12px)', 
                      color: 'var(--bw-muted)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300
                    }}>
                      Current logo: {tenantConfig.branding.logo_url}
                    </span>
                  )}
                </div>
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Slug
                </label>
                {editingSettings ? (
                  <input 
                    className="bw-input" 
                    type="text" 
                    value={editedBranding?.slug || ''} 
                    onChange={(e) => handleBrandingChange('slug', e.target.value)}
                    placeholder="company-name"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.branding?.slug || 'Not set'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Enable Branding
                </label>
                {editingSettings ? (
                  <select 
                    className="bw-input" 
                    value={editedBranding?.enable_branding ? 'true' : 'false'} 
                    onChange={(e) => handleBrandingChange('enable_branding', e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.branding?.enable_branding ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Fare Settings */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)', borderTop: '1px solid var(--bw-border)', paddingTop: 'clamp(24px, 4vw, 32px)' }}>
            <div 
              style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              onClick={() => isMobile && toggleSection('fare')}
            >
              <h4 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)'
              }}>
                <CurrencyDollar size={16} style={{ color: 'var(--bw-text)' }} />
                Fare Configuration
              </h4>
              {isMobile && (
                openSections.fare ? (
                  <CaretUp size={16} style={{ color: 'var(--bw-text)' }} />
                ) : (
                  <CaretDown size={16} style={{ color: 'var(--bw-text)' }} />
                )
              )}
              {!isMobile && (
                <button
                  className={`bw-btn-outline ${isEditFareHovered ? 'custom-hover-border' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSections(prev => ({ ...prev, fare: !prev.fare }));
                  }}
                  onMouseEnter={() => setIsEditFareHovered(true)}
                  onMouseLeave={() => setIsEditFareHovered(false)}
                  style={{
                    padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isEditFareHovered ? '2px solid rgba(155, 97, 209, 0.81)' : undefined,
                    borderColor: isEditFareHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                    color: isEditFareHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                    backgroundColor: isEditFareHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isEditFareHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                    {editingSections.fare ? 'Cancel' : 'Edit'}
                  </span>
                </button>
              )}
            </div>
            {openSections.fare && (
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {[
                { label: 'Base Fare ($)', key: 'base_fare', placeholder: '5.00' },
                { label: 'Per Minute Rate ($)', key: 'per_minute_rate', placeholder: '0.50' },
                { label: 'Per Mile Rate ($)', key: 'per_mile_rate', placeholder: '2.50' },
                { label: 'Per Hour Rate ($)', key: 'per_hour_rate', placeholder: '25.00' }
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                  <label className="bw-form-label small-muted" style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    marginBottom: 'clamp(4px, 0.8vw, 6px)'
                  }}>
                    {label}
                  </label>
                  {editingSettings ? (
                    <input 
                      className="bw-input" 
                      type="number" 
                      step="0.01" 
                      min="0"
                      value={editedPricing?.[key as keyof TenantPricingData] as number || 0} 
                      onChange={(e) => handlePricingChange(key as keyof TenantPricingData, parseFloat(e.target.value) || 0)}
                      placeholder={placeholder}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    />
                  ) : (
                    <span className="bw-info-value" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-text)'
                    }}>
                      ${(tenantConfig.pricing?.[key as keyof TenantPricingData] as number) || 0}
                    </span>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Rider Tiers */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)', borderTop: '1px solid var(--bw-border)', paddingTop: 'clamp(24px, 4vw, 32px)' }}>
            <div 
              style={{ 
                margin: '0 0 clamp(12px, 2vw, 16px) 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                userSelect: 'none',
                gap: 'clamp(8px, 1.5vw, 12px)'
              }}
              onClick={() => isMobile && toggleSection('rider')}
            >
              <h4 style={{ 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 300,
                color: 'var(--bw-text)'
              }}>
                <User size={16} style={{ color: 'var(--bw-text)' }} />
                Rider Tiers
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                {editingRiderTiers ? (
                  <>
                    <button 
                      className={`bw-btn-outline ${isCancelRiderTiersHovered ? 'custom-hover-border' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleCancelRiderTiers(); }}
                      onMouseEnter={() => !savingRiderTiers && setIsCancelRiderTiersHovered(true)}
                      onMouseLeave={() => setIsCancelRiderTiersHovered(false)}
                      disabled={savingRiderTiers}
                      style={{
                        padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                        fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 300,
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                        justifyContent: 'center',
                        borderRadius: 7,
                        color: isCancelRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                        border: isCancelRiderTiersHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                        borderColor: isCancelRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                        backgroundColor: isCancelRiderTiersHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      } as React.CSSProperties}
                    >
                      <span style={{ color: isCancelRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                        Cancel
                      </span>
                    </button>
                    <button 
                      className={`bw-btn bw-btn-action ${isSaveRiderTiersHovered ? 'custom-hover-border' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleSaveRiderTiers(); }}
                      onMouseEnter={() => !savingRiderTiers && setIsSaveRiderTiersHovered(true)}
                      onMouseLeave={() => setIsSaveRiderTiersHovered(false)}
                      disabled={savingRiderTiers}
                      style={{
                        padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                        fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                        justifyContent: 'center',
                        borderRadius: 7,
                        backgroundColor: isSaveRiderTiersHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                        color: isSaveRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                        border: isSaveRiderTiersHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                        borderColor: isSaveRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      } as React.CSSProperties}
                    >
                      {savingRiderTiers ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <FloppyDisk size={16} style={{ 
                            width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                            height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                          }} />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button 
                    className={`bw-btn-outline ${isEditRiderTiersHovered ? 'custom-hover-border' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setEditingRiderTiers(true); }}
                    onMouseEnter={() => setIsEditRiderTiersHovered(true)}
                    onMouseLeave={() => setIsEditRiderTiersHovered(false)}
                    style={{
                      padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      justifyContent: 'center',
                      borderRadius: 7,
                      color: isEditRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                      border: isEditRiderTiersHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                      borderColor: isEditRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      backgroundColor: isEditRiderTiersHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isEditRiderTiersHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      Edit
                    </span>
                  </button>
                )}
                {isMobile && (
                  openSections.rider ? (
                    <CaretUp size={16} style={{ color: 'var(--bw-text)' }} />
                  ) : (
                    <CaretDown size={16} style={{ color: 'var(--bw-text)' }} />
                  )
                )}
              </div>
            </div>
            {openSections.rider && (
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Rider Tiers Enabled
                </label>
                {editingRiderTiers ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.rider_tiers_enabled ? 'true' : 'false'} 
                    onChange={(e) => handleSettingChange('rider_tiers_enabled', e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.rider_tiers_enabled ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Booking Configuration */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)', borderTop: '1px solid var(--bw-border)', paddingTop: 'clamp(24px, 4vw, 32px)' }}>
            <div style={{ 
              margin: '0 0 clamp(12px, 2vw, 16px) 0', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: 'clamp(8px, 1.5vw, 12px)'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-text)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Booking Configuration
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  lineHeight: 1.4
                }}>
                  You can manipulate the price in{' '}
                  <a
                    href="/tenant/settings/pricing"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/tenant/settings/pricing')
                    }}
                    style={{
                      color: 'rgba(155, 97, 209, 0.81)',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    Pricing Settings
                  </a>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                {editingBookingConfig ? (
                  <>
                    <button 
                      className={`bw-btn-outline ${isCancelBookingConfigHovered ? 'custom-hover-border' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleCancelBookingConfig(); }}
                      onMouseEnter={() => !savingBookingConfig && setIsCancelBookingConfigHovered(true)}
                      onMouseLeave={() => setIsCancelBookingConfigHovered(false)}
                      disabled={savingBookingConfig}
                      style={{
                        padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                        fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 300,
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                        justifyContent: 'center',
                        borderRadius: 7,
                        color: isCancelBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                        border: isCancelBookingConfigHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                        borderColor: isCancelBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                        backgroundColor: isCancelBookingConfigHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      } as React.CSSProperties}
                    >
                      <span style={{ color: isCancelBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                        Cancel
                      </span>
                    </button>
                    <button 
                      className={`bw-btn bw-btn-action ${isSaveBookingConfigHovered ? 'custom-hover-border' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleSaveBookingConfig(); }}
                      onMouseEnter={() => !savingBookingConfig && setIsSaveBookingConfigHovered(true)}
                      onMouseLeave={() => setIsSaveBookingConfigHovered(false)}
                      disabled={savingBookingConfig}
                      style={{
                        padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                        fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                        justifyContent: 'center',
                        borderRadius: 7,
                        backgroundColor: isSaveBookingConfigHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
                        color: isSaveBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
                        border: isSaveBookingConfigHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
                        borderColor: isSaveBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      } as React.CSSProperties}
                    >
                      {savingBookingConfig ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <FloppyDisk size={16} style={{ 
                            width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                            height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
                          }} />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button 
                    className={`bw-btn-outline ${isEditBookingConfigHovered ? 'custom-hover-border' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setEditingBookingConfig(true); }}
                    onMouseEnter={() => setIsEditBookingConfigHovered(true)}
                    onMouseLeave={() => setIsEditBookingConfigHovered(false)}
                    style={{
                      padding: isMobile ? 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)' : '8px 16px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      justifyContent: 'center',
                      borderRadius: 7,
                      color: isEditBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : '#000000',
                      border: isEditBookingConfigHovered ? '2px solid rgba(155, 97, 209, 0.81)' : '1px solid var(--bw-border)',
                      borderColor: isEditBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
                      backgroundColor: isEditBookingConfigHovered ? 'var(--bw-bg-secondary)' : '#ffffff',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isEditBookingConfigHovered ? 'rgba(155, 97, 209, 0.81)' : 'inherit' }}>
                      Edit
                    </span>
                  </button>
                )}
              </div>
            </div>
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Allow Guest Bookings
                </label>
                {editingBookingConfig ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.config?.booking?.allow_guest_bookings ? 'true' : 'false'} 
                    onChange={(e) => handleConfigChange(['booking', 'allow_guest_bookings'], e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.config?.booking?.allow_guest_bookings ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Show Vehicle Images
                </label>
                {editingBookingConfig ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.config?.booking?.show_vehicle_images ? 'true' : 'false'} 
                    onChange={(e) => handleConfigChange(['booking', 'show_vehicle_images'], e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.config?.booking?.show_vehicle_images ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
              {/* Dynamically render all service types */}
              {Object.keys(editedSettings?.config?.booking?.types || tenantConfig.settings?.config?.booking?.types || {}).map((typeKey) => (
                <div key={typeKey} className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                  <label className="bw-form-label small-muted" style={{
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-muted)',
                    marginBottom: 'clamp(4px, 0.8vw, 6px)'
                  }}>
                    {formatServiceTypeName(typeKey)} - Deposit Required
                  </label>
                  {editingBookingConfig ? (
                    <select 
                      className="bw-input" 
                      value={editedSettings?.config?.booking?.types?.[typeKey]?.is_deposit_required ? 'true' : 'false'} 
                      onChange={(e) => handleConfigChange(['booking', 'types', typeKey, 'is_deposit_required'], e.target.value === 'true')}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontFamily: '"Work Sans", sans-serif',
                        borderRadius: 0,
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg)',
                        border: '1px solid var(--bw-border)'
                      }}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <span className="bw-info-value" style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 300,
                      color: 'var(--bw-text)'
                    }}>
                      {tenantConfig.settings?.config?.booking?.types?.[typeKey]?.is_deposit_required ? 'Yes' : 'No'}
                    </span>
                  )}
                </div>
              ))}
              
              {/* Add Service Button - Only show when editing */}
              {editingBookingConfig && (
                <div className="bw-form-group" style={{ 
                  width: '100%', 
                  minWidth: 0,
                  gridColumn: isMobile ? 'span 1' : 'span 2'
                }}>
                  {!showAddServiceInput ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                      <button
                        type="button"
                        onClick={() => setShowAddServiceInput(true)}
                        style={{
                          padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                          fontSize: 'clamp(12px, 1.5vw, 14px)',
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 400,
                          borderRadius: 7,
                          border: '1px dashed var(--bw-border)',
                          backgroundColor: 'var(--bw-bg)',
                          color: 'var(--bw-text)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'clamp(6px, 1vw, 8px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(155, 97, 209, 0.81)'
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--bw-border)'
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg)'
                        }}
                      >
                        <span style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}>+</span>
                        <span>Add Service</span>
                      </button>
                      <span style={{
                        fontSize: 'clamp(10px, 1.2vw, 12px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 300,
                        color: 'var(--bw-muted)',
                        fontStyle: 'italic'
                      }}>
                        Add a new service type to your booking configuration
                      </span>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 'clamp(8px, 1.5vw, 12px)',
                      padding: 'clamp(12px, 2vw, 16px)',
                      border: '1px solid var(--bw-border)',
                      borderRadius: 7,
                      backgroundColor: 'var(--bw-bg-secondary)'
                    }}>
                      <label className="bw-form-label small-muted" style={{
                        fontSize: 'clamp(11px, 1.3vw, 13px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 300,
                        color: 'var(--bw-muted)',
                        marginBottom: 'clamp(4px, 0.8vw, 6px)'
                      }}>
                        Service Name
                      </label>
                      <input
                        type="text"
                        className="bw-input"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        placeholder="e.g., Event Dropoff, Point to Point"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewService()
                          } else if (e.key === 'Escape') {
                            setShowAddServiceInput(false)
                            setNewServiceName('')
                          }
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                          fontSize: 'clamp(12px, 1.5vw, 14px)',
                          fontFamily: '"Work Sans", sans-serif',
                          borderRadius: 0,
                          color: 'var(--bw-text)',
                          backgroundColor: 'var(--bw-bg)',
                          border: '1px solid var(--bw-border)'
                        }}
                      />
                      <div style={{ 
                        display: 'flex', 
                        gap: 'clamp(8px, 1.5vw, 12px)',
                        alignItems: 'center'
                      }}>
                        <button
                          type="button"
                          onClick={handleAddNewService}
                          disabled={!newServiceName.trim()}
                          style={{
                            padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 600,
                            borderRadius: 7,
                            border: 'none',
                            backgroundColor: !newServiceName.trim() ? 'var(--bw-muted)' : 'var(--bw-accent)',
                            color: '#ffffff',
                            cursor: !newServiceName.trim() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: !newServiceName.trim() ? 0.6 : 1
                          }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddServiceInput(false)
                            setNewServiceName('')
                          }}
                          style={{
                            padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 300,
                            borderRadius: 7,
                            border: '1px solid var(--bw-border)',
                            backgroundColor: 'var(--bw-bg)',
                            color: 'var(--bw-text)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Branding Configuration */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
            <h4 style={{ 
              margin: '0 0 clamp(12px, 2vw, 16px) 0', 
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300,
              color: 'var(--bw-text)'
            }}>
              Branding Configuration
            </h4>
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Button Radius
                </label>
                {editingBookingConfig ? (
                  <input 
                    className="bw-input" 
                    type="number" 
                    step="1" 
                    min="0"
                    value={editedSettings?.config?.branding?.button_radius || 0} 
                    onChange={(e) => handleConfigChange(['branding', 'button_radius'], parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.config?.branding?.button_radius ?? 0}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Font Family
                </label>
                {editingBookingConfig ? (
                  <input 
                    className="bw-input" 
                    type="text" 
                    value={editedSettings?.config?.branding?.font_family || ''} 
                    onChange={(e) => handleConfigChange(['branding', 'font_family'], e.target.value)}
                    placeholder="Arial, sans-serif"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  />
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.config?.branding?.font_family || 'Not set'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Features Configuration */}
          <div style={{ marginBottom: 'clamp(24px, 4vw, 32px)' }}>
            <h4 style={{ 
              margin: '0 0 clamp(12px, 2vw, 16px) 0', 
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300,
              color: 'var(--bw-text)'
            }}>
              Features Configuration
            </h4>
            <div className="bw-form-grid" style={{ 
              display: 'grid', 
              gap: 'clamp(12px, 2vw, 16px)', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  VIP Profiles
                </label>
                {editingBookingConfig ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.config?.features?.vip_profiles ? 'true' : 'false'} 
                    onChange={(e) => handleConfigChange(['features', 'vip_profiles'], e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.config?.features?.vip_profiles ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
              <div className="bw-form-group" style={{ width: '100%', minWidth: 0 }}>
                <label className="bw-form-label small-muted" style={{
                  fontSize: 'clamp(11px, 1.3vw, 13px)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  color: 'var(--bw-muted)',
                  marginBottom: 'clamp(4px, 0.8vw, 6px)'
                }}>
                  Show Loyalty Banner
                </label>
                {editingBookingConfig ? (
                  <select 
                    className="bw-input" 
                    value={editedSettings?.config?.features?.show_loyalty_banner ? 'true' : 'false'} 
                    onChange={(e) => handleConfigChange(['features', 'show_loyalty_banner'], e.target.value === 'true')}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px)',
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      fontFamily: '"Work Sans", sans-serif',
                      borderRadius: 0,
                      color: 'var(--bw-text)',
                      backgroundColor: 'var(--bw-bg)',
                      border: '1px solid var(--bw-border)'
                    }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span className="bw-info-value" style={{
                    fontSize: 'clamp(12px, 1.5vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 300,
                    color: 'var(--bw-text)'
                  }}>
                    {tenantConfig.settings?.config?.features?.show_loyalty_banner ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Last Updated Info */}
          <div style={{ 
            padding: 'clamp(12px, 2vw, 16px)', 
            backgroundColor: 'var(--bw-bg-secondary)', 
            borderRadius: '4px', 
            marginTop: 'clamp(12px, 2vw, 16px)',
            border: '1px solid var(--bw-border)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(6px, 1vw, 8px)', 
              color: 'var(--bw-muted)', 
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              <Clock size={16} style={{ color: 'var(--bw-muted)' }} />
              Last updated: Never
            </div>
          </div>
          </>
          )}
        </div>
      )}
      </div>
      </div>
    </div>
  )
} 