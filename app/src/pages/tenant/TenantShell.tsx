import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import type React from 'react'
import { getTenantInfo, getTenantDrivers, getTenantVehicles, getTenantBookings, getTenantBookingById, getTenantRiderEmails, onboardDriver, approveDriver, assignDriverToVehicle, assignDriverToBooking, unassignDriverFromVehicle, assignDriverToVehicleNew, getTenantAnalysis, becomeDriver, type TenantResponse, type DriverResponse, type DriverDetailResponse, type VehicleResponse, type BookingResponse, type OnboardDriver, type TenantAnalysisData, type TenantRiderEmailOption } from '@api/tenant'
import { getVehicleRates, getVehicleCategoriesByTenant, createVehicleCategory, setVehicleRates, deleteVehicle, addVehicle } from '@api/vehicles'
import { getTenantConfig, type TenantConfigResponse, type TenantSettingsData, type TenantPricingData, type TenantBrandingData } from '@api/tenantSettings'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTenantTheme, useTheme } from '@contexts/ThemeContext'
import ThemeToggle from '@components/ThemeToggle'
import Button from '@components/Button'
import Modal from '@components/Modal'
import StatusPill from '@components/StatusPill'
import VehicleEditModal from '@components/VehicleEditModal'
import TenantBookRideModal from '@components/TenantBookRideModal'
import TokenExpirationNotification from '@components/TokenExpirationNotification'
import { TenantDashboardSkeleton } from '@components/Skeleton'
import { useBookingSearch } from '@hooks/useBookingSearch'
import { Car, Users, Calendar, Gear, TrendUp, CurrencyDollar, Clock, MapPin, User, Phone, Envelope, Plus, Pencil, Trash, CheckCircle, XCircle, WarningCircle, Palette, FloppyDisk, SidebarSimple, CaretUp, X, Info, MagnifyingGlass, Wallet, Circle, Lock, Sparkle, Copy, ChatCircleDots, ShieldCheck, DotsThreeVertical, CaretRight, List, SignOut, type IconWeight } from '@phosphor-icons/react'
import { API_BASE } from '@config'
import { vehicleMakes, getVehicleModels } from '../../data/vehicleData'
import { extractSubdomain } from '@utils/subdomain'
import { getTenantAppUrl } from '@config/host'
import {
  zelleNumberFromApi,
  zelleEmailFromApi,
  hasZelleRecipient,
  isCompleteUsPhone
} from '@utils/zelleContact'
import { getBookingRating, type BookingRatingResponse } from '@api/bookings'
import { getApiErrorMessage } from '@utils/apiError'
import { Outlet } from 'react-router-dom'
import {
  TENANT_DASHBOARD_LAYOUT_CSS,
  TENANT_DASHBOARD_SHELL_GAP,
  starFillPercent,
  RatingStar,
  VehicleImageCard,
  overviewDriverInitials,
  overviewFormatDriverName,
  overviewBookingRefersToDriver,
  overviewVehicleLineForDriver,
  overviewDriverPresence,
  buildOverviewDriverRows,
  bookingPickupToday,
  buildOverviewBookingRows,
  overviewBookingStatusDisplay,
  tenantDriverTypeLabel,
  tenantTelHrefFromPhone,
} from './shared'
import type { TabType, OverviewLinkKey, TenantPageThemeMode, OverviewLinkQrState, OverviewDriverRow, OverviewDriverPresence } from './shared'

/** Tabs kept out of the 5-slot mobile bar; they stay reachable from the Menu drawer. */
const BOTTOM_BAR_HIDDEN: string[] = ['settings', 'assistant', 'riders', 'feedback']

const NAV_GROUPS: Array<{ label: string; group: 'main' | 'tools' | 'account' }> = [
  { label: 'Manage', group: 'main' },
  { label: 'Tools', group: 'tools' },
  { label: 'Account', group: 'account' },
]

function useShellState() {
  const { accessToken, role, tenantId: storeTenantId } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  // Booking filters (drive the booking query key)
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')
  const [vehicleIdFilter, setVehicleIdFilter] = useState<number | null>(null)

  // --- TanStack Query: server data ---
  const tenantIdNum = Number(storeTenantId)

  const infoQuery = useQuery({
    queryKey: ['tenant', 'info'],
    queryFn: () => getTenantInfo().then(r => r.data ?? null),
  })
  const driversQuery = useQuery({
    queryKey: ['tenant', 'drivers'],
    queryFn: () => getTenantDrivers().then(r => r.data ?? []),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  const vehiclesQuery = useQuery({
    queryKey: ['tenant', 'vehicles'],
    queryFn: () => getTenantVehicles().then(r => r.data ?? []),
  })
  const ridersQuery = useQuery({
    queryKey: ['tenant', 'riders'],
    queryFn: () => getTenantRiderEmails().then(r => r.data ?? []),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  const bookingsQuery = useQuery({
    queryKey: ['tenant', 'bookings', { bookingStatusFilter, serviceTypeFilter, vehicleIdFilter }],
    queryFn: () => {
      const params: { booking_status?: string; service_type?: string; vehicle_id?: number } = {}
      if (bookingStatusFilter) params.booking_status = bookingStatusFilter
      if (serviceTypeFilter) params.service_type = serviceTypeFilter
      if (vehicleIdFilter) params.vehicle_id = vehicleIdFilter
      return getTenantBookings(Object.keys(params).length > 0 ? params : undefined).then(r => r.data ?? [])
    },
  })
  const configQuery = useQuery({
    queryKey: ['tenant', 'config'],
    queryFn: () => getTenantConfig('all'),
  })
  const analysisQuery = useQuery({
    queryKey: ['tenant', 'analysis'],
    queryFn: () => getTenantAnalysis().then(r => r.success && r.data ? r.data : null),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  const vehicleCategoriesQuery = useQuery({
    queryKey: ['tenant', 'vehicleCategories', tenantIdNum],
    queryFn: () => getVehicleCategoriesByTenant(tenantIdNum).then(r => r.data ?? []),
    enabled: Number.isFinite(tenantIdNum) && tenantIdNum > 0,
  })

  // Derived data values (with fallbacks so the rest of the hook types stay the same)
  const info: any = infoQuery.data ?? null
  const drivers: DriverResponse[] = driversQuery.data ?? []
  const vehicles: VehicleResponse[] = vehiclesQuery.data ?? []
  const riders: TenantRiderEmailOption[] = ridersQuery.data ?? []
  const bookings: BookingResponse[] = bookingsQuery.data ?? []
  const vehicleCategories: any[] = vehicleCategoriesQuery.data ?? []
  const analysis: TenantAnalysisData | null = analysisQuery.data ?? null
  const tenantConfig: TenantConfigResponse | null = configQuery.data ?? null

  // Combined first-load gate
  const loading = infoQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading || bookingsQuery.isLoading || ridersQuery.isLoading

  // No-op setters kept for context shape compatibility (data is managed by query cache)
  const setInfo = useCallback((_v: any) => {}, [])
  const setDrivers = useCallback((_v: DriverResponse[]) => {}, [])
  const setRiders = useCallback((_v: TenantRiderEmailOption[]) => {}, [])
  const setVehicles = useCallback((_v: VehicleResponse[]) => {}, [])
  const setAnalysis = useCallback((_v: TenantAnalysisData | null) => {}, [])
  const setLoading = useCallback((_v: boolean) => {}, [])
  const setTenantConfig = useCallback((_v: TenantConfigResponse | null) => {}, [])

  // setBookings updates the active booking query cache (called by BookingsTab filter handlers)
  const bookingFiltersRef = useRef({ bookingStatusFilter, serviceTypeFilter, vehicleIdFilter })
  bookingFiltersRef.current = { bookingStatusFilter, serviceTypeFilter, vehicleIdFilter }
  const setBookings = useCallback((newBookings: BookingResponse[]) => {
    queryClient.setQueryData(
      ['tenant', 'bookings', bookingFiltersRef.current],
      newBookings
    )
  }, [queryClient])

  // setVehicleCategories updates the category cache (used in saveVehicleRate optimistic update)
  const setVehicleCategories = useCallback((updater: any[] | ((prev: any[]) => any[])) => {
    queryClient.setQueryData(
      ['tenant', 'vehicleCategories', tenantIdNum],
      (prev: any[] | undefined) => {
        const prevData = prev ?? []
        return typeof updater === 'function' ? updater(prevData) : updater
      }
    )
  }, [queryClient, tenantIdNum])
  
  // Booking search hook
  const {
    searchQuery,
    handleSearchChange,
    filteredBookings,
    searchError,
    clearSearch,
    hasActiveSearch,
  } = useBookingSearch(bookings)

  const [driverListSearch, setDriverListSearch] = useState('')
  const [driverFilterStatus, setDriverFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [driverFilterType, setDriverFilterType] = useState<'all' | 'in_house' | 'outsourced'>('all')
  const [expandedDriverCardIds, setExpandedDriverCardIds] = useState<Set<number>>(new Set())
  const [driverCardMenuOpenId, setDriverCardMenuOpenId] = useState<number | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newDriver, setNewDriver] = useState<OnboardDriver>({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
  const [showAddDriver, setShowAddDriver] = useState(false)
  const [showBookRideModal, setShowBookRideModal] = useState(false)
  const [addDriverError, setAddDriverError] = useState<string | null>(null)
  const [isCreatingDriver, setIsCreatingDriver] = useState(false)
  const [approvingDriverId, setApprovingDriverId] = useState<number | null>(null)
  const [approveDriverError, setApproveDriverError] = useState<string | null>(null)
  const [editingSettings, setEditingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  // Separate edited state for each section
  const [editedSettings, setEditedSettings] = useState<TenantSettingsData | null>(null)
  const [editedPricing, setEditedPricing] = useState<TenantPricingData | null>(null)
  const [editedBranding, setEditedBranding] = useState<TenantBrandingData | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Vehicle edit modal state
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)
  const [showVehicleEditModal, setShowVehicleEditModal] = useState(false)
  const [tooltipVehicleId, setTooltipVehicleId] = useState<number | null>(null)

  // Sidebar state (mobile gets the bottom tab bar instead, so the drawer starts closed there)
  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth > 768)
  const [logoFailed, setLogoFailed] = useState(false)
  
  // Mobile breakpoint state (behavioral: KPI carousel, stacked controls, etc. — still ≤768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false)
  const [selectedBookingRating, setSelectedBookingRating] = useState<BookingRatingResponse | null>(null)
  const [loadingBookingRating, setLoadingBookingRating] = useState(false)

  // Driver details modal state
  const [selectedDriver, setSelectedDriver] = useState<DriverDetailResponse | null>(null)
  const [showDriverDetails, setShowDriverDetails] = useState(false)
  const [loadingDriverDetails, setLoadingDriverDetails] = useState(false)

  // Assign driver to booking state
  const [showAssignDriverToBooking, setShowAssignDriverToBooking] = useState(false)
  const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<string>('')
  const [assigningDriver, setAssigningDriver] = useState(false)
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)

  // Delete vehicle state
  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Unassign driver state
  const [unassigningVehicleId, setUnassigningVehicleId] = useState<number | null>(null)
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [unassignError, setUnassignError] = useState<string | null>(null)

  // Assign driver state (for specific vehicle)
  const [assigningVehicleId, setAssigningVehicleId] = useState<number | null>(null)
  const [showAssignConfirm, setShowAssignConfirm] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  // Assign vehicle to driver (in-house, from Drivers tab)
  const [showAssignVehicleToDriver, setShowAssignVehicleToDriver] = useState(false)
  const [assignVehicleToDriverId, setAssignVehicleToDriverId] = useState<number | null>(null)
  const [selectedVehicleIdForDriverAssign, setSelectedVehicleIdForDriverAssign] = useState('')
  const [assignVehicleToDriverError, setAssignVehicleToDriverError] = useState<string | null>(null)

  // Vehicle Settings dropdown state
  const [vehicleSettingsOpen, setVehicleSettingsOpen] = useState(false)

  // Overview KPI carousel (mobile swipe)
  const [kpiScrollIndex, setKpiScrollIndex] = useState(0)
  const kpiCarouselScrollRef = useRef<HTMLDivElement>(null)
  
  // Add vehicle hover form state
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false)
  
  // Switch to driver mode state
  const [showDriverModeConfirm, setShowDriverModeConfirm] = useState(false)
  const [isSwitchingToDriver, setIsSwitchingToDriver] = useState(false)
  const [switchToDriverError, setSwitchToDriverError] = useState<string | null>(null)
  const [showInstallAppNotice, setShowInstallAppNotice] = useState(false)
  
  // Button hover states
  const [overviewCopiedLink, setOverviewCopiedLink] = useState<OverviewLinkKey | null>(null)
  const [overviewLinkQrState, setOverviewLinkQrState] = useState<Record<OverviewLinkKey, OverviewLinkQrState>>({
    rider: { loading: false, imageDataUrl: null, error: null },
    driver: { loading: false, imageDataUrl: null, error: null },
    landing: { loading: false, imageDataUrl: null, error: null },
  })
  const [overviewLinksOpen, setOverviewLinksOpen] = useState(false)
  
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    license_plate: '',
    color: '',
    status: 'available',
    vehicle_category: '',
    vehicle_flat_rate: '',
    seating_capacity: ''
  })
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [addVehicleError, setAddVehicleError] = useState<string | null>(null)
  const [addVehicleSuccess, setAddVehicleSuccess] = useState(false)

  // Sync theme with tenant settings
  useTenantTheme(tenantConfig?.branding?.theme)
  const { theme, setTheme, isLight: lightMode } = useTheme()
  const [tenantPageThemeMode, setTenantPageThemeMode] = useState<TenantPageThemeMode>('dark')
  const isCustomThemeActive = false

  useEffect(() => {
    setTenantPageThemeMode(theme === 'light' ? 'light' : 'dark')
  }, [theme])

  const handleTenantThemeModeChange = useCallback((mode: TenantPageThemeMode) => {
    setTheme(mode)
    setTenantPageThemeMode(mode)
  }, [setTheme])

  // Invalidate all tenant queries (used as retry / refresh; returns Promise so await load() works)
  const load = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['tenant'] })
  }, [queryClient])

  // Initialize editable config state when config first loads
  useEffect(() => {
    if (!tenantConfig) return
    if (tenantConfig.settings && !editedSettings) {
      setEditedSettings({
        ...tenantConfig.settings,
        zelle_number: zelleNumberFromApi(tenantConfig.settings.zelle_number),
        zelle_email: zelleEmailFromApi(tenantConfig.settings.zelle_email),
      })
    }
    if (tenantConfig.pricing && !editedPricing) setEditedPricing(tenantConfig.pricing)
    if (tenantConfig.branding && !editedBranding) setEditedBranding(tenantConfig.branding)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantConfig])

  // Mobile breakpoint handler (KPI carousel, stacked controls — not the nav drawer)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Crossing into the mobile breakpoint: close the drawer so the bottom tab bar takes over
  useEffect(() => {
    if (isMobile) setIsMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shouldShowInstallNotice = sessionStorage.getItem('tenant-install-app-tip') === '1'
    if (shouldShowInstallNotice) {
      setShowInstallAppNotice(true)
      sessionStorage.removeItem('tenant-install-app-tip')
    }
  }, [])

  // § 4.3 Optimistic mutations ─────────────────────────────────────────────

  // Add driver: optimistically append a placeholder row, rollback on error
  const createDriverMut = useMutation({
    mutationFn: (driver: OnboardDriver) => onboardDriver(driver),
    onMutate: async (newD) => {
      await queryClient.cancelQueries({ queryKey: ['tenant', 'drivers'] })
      const prev = queryClient.getQueryData<DriverResponse[]>(['tenant', 'drivers'])
      const tempId = -Date.now()
      queryClient.setQueryData(['tenant', 'drivers'], (old: DriverResponse[] = []) => [
        ...old,
        { id: tempId, first_name: newD.first_name, last_name: newD.last_name, email: newD.email ?? '', is_active: true, driver_type: newD.driver_type, phone: null, vehicle: null } as unknown as DriverResponse,
      ])
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(['tenant', 'drivers'], ctx.prev) },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tenant', 'drivers'] }),
  })

  // Approve a pending driver (self-serve application or unfinished invite): sends them their registration email
  const approveDriverMut = useMutation({
    mutationFn: (driverId: number) => approveDriver(driverId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tenant', 'drivers'] }),
  })

  // Delete vehicle: optimistically remove the row, rollback on error
  const deleteVehicleMut = useMutation({
    mutationFn: (vehicleId: number) => deleteVehicle(vehicleId),
    onMutate: async (vehicleId) => {
      await queryClient.cancelQueries({ queryKey: ['tenant', 'vehicles'] })
      const prev = queryClient.getQueryData<VehicleResponse[]>(['tenant', 'vehicles'])
      queryClient.setQueryData(['tenant', 'vehicles'], (old: VehicleResponse[] = []) => old.filter(v => v.id !== vehicleId))
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(['tenant', 'vehicles'], ctx.prev) },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tenant', 'vehicles'] }),
  })

  // Assign driver to booking: optimistically update driver_name on the booking row
  const assignDriverToBookingMut = useMutation({
    mutationFn: ({ bookingId, driverId, override }: { bookingId: number; driverId: number; override: boolean }) =>
      assignDriverToBooking(bookingId, { driver_id: driverId, override }),
    onMutate: async ({ bookingId, driverId }) => {
      await queryClient.cancelQueries({ queryKey: ['tenant', 'bookings'] })
      const snapshots: Array<[unknown, BookingResponse[] | undefined]> = []
      const driverInfo = queryClient.getQueryData<DriverResponse[]>(['tenant', 'drivers'])?.find(d => d.id === driverId)
      const driverName = driverInfo ? `${driverInfo.first_name} ${driverInfo.last_name}` : undefined
      // Update all booking query cache entries (different filter combinations)
      queryClient.getQueriesData<BookingResponse[]>({ queryKey: ['tenant', 'bookings'] }).forEach(([key, data]) => {
        snapshots.push([key, data])
        if (data) {
          queryClient.setQueryData(key, data.map(b => b.id === bookingId ? { ...b, driver_name: driverName ?? b.driver_name, driver_id: driverId } : b))
        }
      })
      return { snapshots }
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => { if (data) queryClient.setQueryData(key as readonly unknown[], data) })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tenant', 'bookings'] }),
  })

  // Assign driver to vehicle: optimistic update on vehicles list
  const assignDriverToVehicleMut = useMutation({
    mutationFn: ({ vehicleId, driverId }: { vehicleId: number; driverId: number }) =>
      assignDriverToVehicleNew(vehicleId, driverId),
    onMutate: async ({ vehicleId, driverId }) => {
      await queryClient.cancelQueries({ queryKey: ['tenant', 'vehicles'] })
      const prev = queryClient.getQueryData<VehicleResponse[]>(['tenant', 'vehicles'])
      const driverInfo = queryClient.getQueryData<DriverResponse[]>(['tenant', 'drivers'])?.find(d => d.id === driverId)
      queryClient.setQueryData(['tenant', 'vehicles'], (old: VehicleResponse[] = []) =>
        old.map(v => v.id === vehicleId ? { ...v, driver_id: driverId, driver: driverInfo ?? v.driver } : v)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(['tenant', 'vehicles'], ctx.prev) },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tenant', 'vehicles'] }),
  })

  // Unassign driver from vehicle: optimistic clear
  const unassignDriverMut = useMutation({
    mutationFn: ({ vehicleId, override }: { vehicleId: number; override: boolean }) =>
      unassignDriverFromVehicle(vehicleId, override),
    onMutate: async ({ vehicleId }) => {
      await queryClient.cancelQueries({ queryKey: ['tenant', 'vehicles'] })
      const prev = queryClient.getQueryData<VehicleResponse[]>(['tenant', 'vehicles'])
      queryClient.setQueryData(['tenant', 'vehicles'], (old: VehicleResponse[] = []) =>
        old.map(v => v.id === vehicleId ? { ...v, driver_id: null, driver: null } : v)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) queryClient.setQueryData(['tenant', 'vehicles'], ctx.prev) },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tenant', 'vehicles'] }),
  })

  // ─────────────────────────────────────────────────────────────────────────

  const createDriver = async () => {
    if (!newDriver.email || !newDriver.first_name || !newDriver.last_name) {
      setAddDriverError('Please fill in all required fields')
      return
    }

    setAddDriverError(null)
    setIsCreatingDriver(true)

    try {
      await createDriverMut.mutateAsync({ ...newDriver, driver_type: newDriver.driver_type as OnboardDriver['driver_type'] })
      setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
      setAddDriverError(null)
      setShowAddDriver(false)
    } catch (error: any) {
      console.error('Failed to create driver:', error)
      
      // Handle different error status codes
      if (error.response) {
        const status = error.response.status
        const errorData = error.response.data
        
        switch (status) {
          case 409:
            setAddDriverError('This email is already registered. Please use a different email address.')
            break
          case 400:
            setAddDriverError(errorData?.detail || errorData?.message || 'Invalid input. Please check your information and try again.')
            break
          case 401:
            setAddDriverError('Authentication failed. Please log in again.')
            break
          case 403:
            setAddDriverError('You do not have permission to add drivers.')
            break
          case 422:
            setAddDriverError(errorData?.detail || errorData?.message || 'Validation error. Please check all fields are correct.')
            break
          case 500:
            setAddDriverError('Server error. Please try again later.')
            break
          default:
            setAddDriverError(errorData?.detail || errorData?.message || `Failed to add driver. Error code: ${status}`)
        }
      } else if (error.request) {
        setAddDriverError('No response from server. Please check your connection and try again.')
      } else {
        setAddDriverError(error.message || 'Failed to add driver. Please try again.')
      }
    } finally {
      setIsCreatingDriver(false)
    }
  }

  const approveDriverAction = async (driverId: number) => {
    setApproveDriverError(null)
    setApprovingDriverId(driverId)
    try {
      await approveDriverMut.mutateAsync(driverId)
    } catch (error: any) {
      setApproveDriverError(getApiErrorMessage(error, 'Failed to approve driver. Please try again.'))
    } finally {
      setApprovingDriverId(null)
    }
  }

  const confirmUnassignDriver = async (override: boolean) => {
    if (!unassigningVehicleId) return

    setIsUnassigning(true)
    setUnassignError(null)

    try {
      await unassignDriverMut.mutateAsync({ vehicleId: unassigningVehicleId, override })
      setShowUnassignConfirm(false)
      setUnassigningVehicleId(null)
    } catch (error: any) {
      console.error('Failed to unassign driver:', error)

      if (error?.response) {
        const status = error.response.status
        const errorData = error.response.data
        const errorMessage = errorData?.message || errorData?.detail || errorData?.error?.message || errorData?.error || `HTTP Error ${status}: ${error.response.statusText || 'Unknown error'}`
        setUnassignError(errorMessage)
      } else if (error?.request) {
        setUnassignError('No response from server. Please check your connection and try again.')
      } else {
        setUnassignError(error?.message || 'Failed to unassign driver. Please try again.')
      }
    } finally {
      setIsUnassigning(false)
    }
  }

  const confirmAssignDriver = async () => {
    if (!assigningVehicleId || !selectedDriverId) return

    setIsAssigning(true)
    setAssignError(null)

    try {
      await assignDriverToVehicleMut.mutateAsync({ vehicleId: assigningVehicleId, driverId: Number(selectedDriverId) })
      setShowAssignConfirm(false)
      setAssigningVehicleId(null)
      setSelectedDriverId('')
    } catch (error: any) {
      console.error('Failed to assign driver:', error)

      if (error?.response) {
        const status = error.response.status
        const errorData = error.response.data
        const errorMessage = errorData?.message || errorData?.detail || errorData?.error?.message || errorData?.error || `HTTP Error ${status}: ${error.response.statusText || 'Unknown error'}`
        setAssignError(errorMessage)
      } else if (error?.request) {
        setAssignError('No response from server. Please check your connection and try again.')
      } else {
        setAssignError(error?.message || 'Failed to assign driver. Please try again.')
      }
    } finally {
      setIsAssigning(false)
    }
  }

  const confirmAssignVehicleToDriver = async () => {
    if (!assignVehicleToDriverId || !selectedVehicleIdForDriverAssign) return

    setIsAssigning(true)
    setAssignVehicleToDriverError(null)

    try {
      await assignDriverToVehicleMut.mutateAsync({ vehicleId: Number(selectedVehicleIdForDriverAssign), driverId: assignVehicleToDriverId })
      setShowAssignVehicleToDriver(false)
      setAssignVehicleToDriverId(null)
      setSelectedVehicleIdForDriverAssign('')
    } catch (error: any) {
      console.error('Failed to assign vehicle to driver:', error)

      if (error?.response) {
        const status = error.response.status
        const errorData = error.response.data
        const errorMessage = errorData?.message || errorData?.detail || errorData?.error?.message || errorData?.error || `HTTP Error ${status}: ${error.response.statusText || 'Unknown error'}`
        setAssignVehicleToDriverError(errorMessage)
      } else if (error?.request) {
        setAssignVehicleToDriverError('No response from server. Please check your connection and try again.')
      } else {
        setAssignVehicleToDriverError(error?.message || 'Failed to assign vehicle. Please try again.')
      }
    } finally {
      setIsAssigning(false)
    }
  }

  const openAssignVehicleToDriver = (driverId: number) => {
    setAssignVehicleToDriverId(driverId)
    setSelectedVehicleIdForDriverAssign('')
    setAssignVehicleToDriverError(null)
    setShowAssignVehicleToDriver(true)
  }

  const driversTableGridColumns = 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr) minmax(180px, 1.4fr)'
  const ridersTableGridColumns = 'minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 0.7fr)'

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-500'
      case 'active': return 'text-green-500'
      case 'pending': return 'text-yellow-500'
      case 'cancelled': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusColorHex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'var(--bw-success)'
      case 'pending':
        return 'var(--bw-warning)'
      case 'cancelled':
        return 'var(--bw-error)'
      default:
        return 'var(--bw-muted)'
    }
  }

  const getStatusIcon = (status: string) => {
    const color = getStatusColorHex(status)
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle size={16} style={{ color }} />
      case 'active': return <CheckCircle size={16} style={{ color }} />
      case 'pending': return <WarningCircle size={16} style={{ color }} />
      case 'cancelled': return <XCircle size={16} style={{ color }} />
      default: return <WarningCircle size={16} style={{ color }} />
    }
  }

  // Helper function to get initials from name
  const getInitials = (name: string | null | undefined): string => {
    if (!name || name === 'None' || name === 'Anonymous Customer') return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  const getVehicleRate = (category: string) => {
    // Check if category is defined and not null
    if (!category || typeof category !== 'string') {
      return 0
    }
    
    // Check if vehicleCategories is an array and has items
    if (!Array.isArray(vehicleCategories) || vehicleCategories.length === 0) {
      // Return hardcoded default rates if no categories available
      const defaultRates: { [key: string]: number } = {
        'sedan': 25,
        'suv': 35,
        'luxury': 50,
        'van': 40,
        'truck': 45,
        'motorcycle': 20
      }
      return defaultRates[category.toLowerCase()] || 0
    }
    
    // Find the category and return its rate
    const foundCategory = vehicleCategories.find(cat => 
      cat.vehicle_category.toLowerCase() === category.toLowerCase()
    )
    
    if (foundCategory && foundCategory.vehicle_flat_rate > 0) {
      return foundCategory.vehicle_flat_rate
    }
    
    // Return hardcoded default rates if no rate set
    const defaultRates: { [key: string]: number } = {
      'sedan': 25,
      'suv': 35,
      'luxury': 50,
      'van': 40,
      'truck': 45,
      'motorcycle': 20
    }
    return defaultRates[category.toLowerCase()] || 0
  }

  const handleSettingChange = (field: keyof TenantSettingsData, value: any) => {
    if (editedSettings) {
      setEditedSettings({
        ...editedSettings,
        [field]: value
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
      
      // Update the edited branding with the file
      if (editedBranding) {
        setEditedBranding({
          ...editedBranding,
          logo_url: file
        } as any)
      }
    }
  }

  const hasOtherChanges = () => {
    if (!tenantConfig) return false
    
    const settingsChanged = editedSettings && tenantConfig.settings && (
      editedSettings.rider_tiers_enabled !== tenantConfig.settings.rider_tiers_enabled ||
      zelleNumberFromApi(editedSettings.zelle_number) !== zelleNumberFromApi(tenantConfig.settings.zelle_number) ||
      zelleEmailFromApi(editedSettings.zelle_email) !== zelleEmailFromApi(tenantConfig.settings.zelle_email) ||
      JSON.stringify(editedSettings.config) !== JSON.stringify(tenantConfig.settings.config)
    )
    
    const pricingChanged = editedPricing && tenantConfig.pricing && (
      editedPricing.base_fare !== tenantConfig.pricing.base_fare ||
      editedPricing.per_mile_rate !== tenantConfig.pricing.per_mile_rate ||
      editedPricing.per_minute_rate !== tenantConfig.pricing.per_minute_rate ||
      editedPricing.per_hour_rate !== tenantConfig.pricing.per_hour_rate ||
      editedPricing.cancellation_fee !== tenantConfig.pricing.cancellation_fee ||
      editedPricing.discounts !== tenantConfig.pricing.discounts
    )
    
    const brandingChanged = editedBranding && tenantConfig.branding && (
      editedBranding.theme !== tenantConfig.branding.theme ||
      editedBranding.slug !== tenantConfig.branding.slug ||
      editedBranding.enable_branding !== tenantConfig.branding.enable_branding ||
      editedBranding.primary_color !== tenantConfig.branding.primary_color ||
      editedBranding.secondary_color !== tenantConfig.branding.secondary_color ||
      editedBranding.accent_color !== tenantConfig.branding.accent_color
    )
    
    return !!(settingsChanged || pricingChanged || brandingChanged)
  }

  const handleCancelEdit = () => {
    if (tenantConfig) {
      if (tenantConfig.settings) {
        setEditedSettings({
          ...tenantConfig.settings,
          zelle_number: zelleNumberFromApi(tenantConfig.settings.zelle_number),
          zelle_email: zelleEmailFromApi(tenantConfig.settings.zelle_email),
        })
      }
      if (tenantConfig.pricing) setEditedPricing(tenantConfig.pricing)
      if (tenantConfig.branding) setEditedBranding(tenantConfig.branding)
    }
    setEditingSettings(false)
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleBookingClick = async (bookingId: number) => {
    setLoadingBookingDetails(true)
    setLoadingBookingRating(true)
    setSelectedBookingRating(null)
    setShowBookingDetails(true)
    try {
      const [response, bookingRatingResponse] = await Promise.all([
        getTenantBookingById(bookingId),
        getBookingRating(bookingId).catch(() => null),
      ])

      if (response.data && response.data.length > 0) {
        setSelectedBooking(response.data[0])
        setSelectedBookingRating(bookingRatingResponse?.data || null)
      } else {
        setError('Booking not found')
        setShowBookingDetails(false)
      }
    } catch (error: any) {
      console.error('Failed to load booking details:', error)
      setError('Failed to load booking details')
      setShowBookingDetails(false)
    } finally {
      setLoadingBookingDetails(false)
      setLoadingBookingRating(false)
    }
  }

  const handleDriverClick = async (driverId: number) => {
    setLoadingDriverDetails(true)
    setShowDriverDetails(true)
    try {
      const response = await getTenantDrivers(driverId)
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSelectedDriver(response.data[0] as DriverDetailResponse)
      } else {
        setError('Driver not found')
        setShowDriverDetails(false)
      }
    } catch (error: any) {
      console.error('Failed to load driver details:', error)
      setError('Failed to load driver details')
      setShowDriverDetails(false)
    } finally {
      setLoadingDriverDetails(false)
    }
  }

  useEffect(() => {
    if (location.pathname !== '/tenant/bookings') return
    const st = location.state as { driverRideSearch?: string } | null | undefined
    const q = typeof st?.driverRideSearch === 'string' ? st.driverRideSearch.trim() : ''
    if (!q) return
    handleSearchChange(q)
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
  }, [location.pathname, location.search, location.state, handleSearchChange, navigate])

  useEffect(() => {
    if (driverCardMenuOpenId === null) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = e.target as HTMLElement
      if (el.closest?.('.tenant-driver-card-menu')) return
      setDriverCardMenuOpenId(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
    }
  }, [driverCardMenuOpenId])

  const handleAssignDriverToBooking = async () => {
    if (!selectedBooking || !selectedDriverForBooking) return

    const driverId = Number(selectedDriverForBooking)
    if (!driverId) return

    const hasDriver = !!(selectedBooking.driver_name && selectedBooking.driver_name !== 'None')
    
    // If driver exists and user hasn't confirmed override, show confirmation
    if (hasDriver && !showOverrideConfirm) {
      setShowOverrideConfirm(true)
      return
    }

    if (!selectedBooking.id) return
    
    setAssigningDriver(true)
    try {
      await assignDriverToBookingMut.mutateAsync({ bookingId: selectedBooking.id, driverId, override: hasDriver })

      // Refresh booking details modal
      const response = await getTenantBookingById(selectedBooking.id)
      if (response.data && response.data.length > 0) {
        setSelectedBooking(response.data[0])
      }

      setShowAssignDriverToBooking(false)
      setSelectedDriverForBooking('')
      setShowOverrideConfirm(false)
    } catch (error: any) {
      console.error('Failed to assign driver to booking:', error)
      setError('Failed to assign driver. Please try again.')
    } finally {
      setAssigningDriver(false)
    }
  }

  const handleDeleteVehicle = (vehicleId: number) => {
    setDeletingVehicleId(vehicleId)
    setShowDeleteConfirm(true)
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newVehicle.make || !newVehicle.model) {
      setAddVehicleError('Make and Model are required fields')
      return
    }

    const seatingTrim = String(newVehicle.seating_capacity).trim()
    let seatingCapacityPayload: number | undefined
    if (seatingTrim !== '') {
      const n = parseInt(seatingTrim, 10)
      if (Number.isNaN(n) || n < 1 || n > 50) {
        setAddVehicleError('Enter a seating capacity between 1 and 50, or leave it blank.')
        return
      }
      seatingCapacityPayload = n
    }

    setAddingVehicle(true)
    setAddVehicleError(null)

    try {
      const vehiclePayload = {
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year ? parseInt(newVehicle.year) : undefined,
        license_plate: newVehicle.license_plate || undefined,
        color: newVehicle.color || undefined,
        status: newVehicle.status,
        vehicle_category: newVehicle.vehicle_category,
        vehicle_flat_rate: parseFloat(newVehicle.vehicle_flat_rate) || 0,
        ...(seatingCapacityPayload !== undefined ? { seating_capacity: seatingCapacityPayload } : {})
      }

      const response = await addVehicle(vehiclePayload)
      if (response.success && response.data) {
        setAddVehicleSuccess(true)
        // Reset form
        setNewVehicle({
          make: '',
          model: '',
          year: '',
          license_plate: '',
          color: '',
          status: 'available',
          vehicle_category: '',
          vehicle_flat_rate: '',
          seating_capacity: ''
        })
        // Refresh vehicles list
        void queryClient.invalidateQueries({ queryKey: ['tenant', 'vehicles'] })
        // Hide form after success
        setTimeout(() => {
          setShowAddVehicleForm(false)
          setAddVehicleSuccess(false)
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to create vehicle')
      }
    } catch (err: any) {
      console.error('Failed to create vehicle:', err)
      setAddVehicleError(err.response?.data?.detail || 'Failed to create vehicle. Please try again.')
    } finally {
      setAddingVehicle(false)
    }
  }

  const handleNewVehicleChange = (field: string, value: any) => {
    setNewVehicle(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      
      // Auto-fill flat rate when vehicle category is selected
      if (field === 'vehicle_category' && value) {
        const selectedCategory = vehicleCategories.find(
          cat => cat.vehicle_category === value
        )
        if (selectedCategory && selectedCategory.vehicle_flat_rate) {
          updated.vehicle_flat_rate = selectedCategory.vehicle_flat_rate.toString()
        }
      }
      
      return updated
    })
  }

  const confirmDeleteVehicle = async () => {
    if (!deletingVehicleId) return

    setIsDeleting(true)
    try {
      await deleteVehicleMut.mutateAsync(deletingVehicleId)
      setShowDeleteConfirm(false)
      setDeletingVehicleId(null)
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error)
      setError('Failed to delete vehicle. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  type NavTab = { id: TabType; label: string; group: 'main' | 'tools' | 'account'; icon: React.ComponentType<{ size?: number | string; weight?: IconWeight; style?: React.CSSProperties }> }
  const tabs: NavTab[] = [
    { id: 'overview', label: 'Overview', group: 'main', icon: TrendUp },
    { id: 'bookings', label: 'Bookings', group: 'main', icon: Calendar },
    { id: 'drivers', label: 'Drivers', group: 'main', icon: Users },
    { id: 'riders', label: 'Riders', group: 'main', icon: User },
    { id: 'vehicles', label: 'Vehicles', group: 'main', icon: Car },
    { id: 'assistant', label: 'Assistant', group: 'tools', icon: Sparkle },
    { id: 'settings', label: 'Settings', group: 'account', icon: Gear },
    { id: 'feedback', label: 'Feedback', group: 'account', icon: ChatCircleDots },
  ]

  // Determine active tab from URL or internal state
  const getActiveTab = (): TabType => {
    // Determine from URL
    const path = location.pathname
    if (path === '/tenant/drivers') return 'drivers'
    if (path === '/tenant/riders') return 'riders'
    if (path === '/tenant/bookings') return 'bookings'
    if (path === '/tenant/vehicles') return 'vehicles'
    if (path === '/tenant/overview' || path === '/tenant') return 'overview'
    if (path.startsWith('/tenant/settings')) return 'settings'
    if (path === '/tenant/feedback') return 'feedback'
    if (path === '/tenant/assistant') return 'assistant'
    // Default to overview if path doesn't match
    return 'overview'
  }

  const activeTab = getActiveTab()

  const activeDriverCount = useMemo(
    () => drivers.filter((d) => d.is_active).length,
    [drivers]
  )

  const filteredDriversForList = useMemo(() => {
    let list = [...drivers]
    const q = driverListSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (d) =>
          `${d.first_name} ${d.last_name}`.toLowerCase().includes(q) ||
          (d.email || '').toLowerCase().includes(q)
      )
    }
    if (driverFilterStatus === 'active') list = list.filter((d) => d.is_active)
    if (driverFilterStatus === 'inactive') list = list.filter((d) => !d.is_active)
    if (driverFilterType === 'in_house') list = list.filter((d) => d.driver_type === 'in_house')
    if (driverFilterType === 'outsourced') list = list.filter((d) => d.driver_type !== 'in_house')
    return list
  }, [drivers, driverListSearch, driverFilterStatus, driverFilterType])

  /** Long tenant driver lists collapse on mobile until expanded */
  const useCompressedDriverCards = drivers.length >= 20

  const openDriverRideHistory = useCallback(
    (d: DriverResponse) => {
      const full = `${d.first_name} ${d.last_name}`.trim()
      navigate('/tenant/bookings', { state: { driverRideSearch: full } })
      setDriverCardMenuOpenId(null)
      if (isMobile) setIsMenuOpen(false)
    },
    [navigate, isMobile]
  )

  const toggleDriverCardExpanded = useCallback((driverId: number) => {
    setExpandedDriverCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(driverId)) next.delete(driverId)
      else next.add(driverId)
      return next
    })
  }, [])

  // Get dynamic page title based on active tab
  const getPageTitle = (): string => {
    const activeTabData = tabs.find(tab => tab.id === activeTab)
    return activeTabData?.label || 'Overview'
  }

  // Handle tab navigation
  const handleTabClick = (tabId: TabType) => {
    navigate(`/tenant/${tabId}`)
    if (isMobile) setIsMenuOpen(false)
  }

  const copyTenantOverviewLink = async (kind: OverviewLinkKey, url: string) => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setOverviewCopiedLink(kind)
      window.setTimeout(() => setOverviewCopiedLink(null), 2000)
    } catch {
      console.error('Clipboard copy failed')
    }
  }

  const generateTenantOverviewLinkQr = async (kind: OverviewLinkKey, url: string) => {
    if (!url) return
    setOverviewLinkQrState(prev => ({
      ...prev,
      [kind]: { ...prev[kind], loading: true, error: null }
    }))

    try {
      // qrcode is only needed when a QR is actually generated — keep it out of the dashboard chunk
      const { default: QRCode } = await import('qrcode')
      const imageDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 })
      setOverviewLinkQrState(prev => ({
        ...prev,
        [kind]: { loading: false, imageDataUrl, error: null }
      }))
    } catch {
      setOverviewLinkQrState(prev => ({
        ...prev,
        [kind]: {
          ...prev[kind],
          loading: false,
          error: 'Could not generate QR code right now. Please try again.',
        }
      }))
    }
  }

  const downloadTenantOverviewLinkQr = (kind: OverviewLinkKey, imageDataUrl: string) => {
    const link = document.createElement('a')
    link.href = imageDataUrl
    link.download =
      kind === 'landing'
        ? 'maison-landing-page-qr.png'
        : kind === 'rider'
          ? 'maison-rider-login-qr.png'
          : 'maison-driver-login-qr.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    info,
    setInfo,
    analysisLoading: analysisQuery.isLoading,
    analysisError: analysisQuery.isError,
    drivers,
    setDrivers,
    riders,
    setRiders,
    vehicles,
    setVehicles,
    bookings,
    setBookings,
    vehicleCategories,
    setVehicleCategories,
    analysis,
    setAnalysis,
    loading,
    setLoading,
    bookingStatusFilter,
    setBookingStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    vehicleIdFilter,
    setVehicleIdFilter,
    driverListSearch,
    setDriverListSearch,
    driverFilterStatus,
    setDriverFilterStatus,
    driverFilterType,
    setDriverFilterType,
    expandedDriverCardIds,
    setExpandedDriverCardIds,
    driverCardMenuOpenId,
    setDriverCardMenuOpenId,
    error,
    setError,
    addingCategory,
    setAddingCategory,
    newDriver,
    setNewDriver,
    showAddDriver,
    setShowAddDriver,
    showBookRideModal,
    setShowBookRideModal,
    addDriverError,
    setAddDriverError,
    isCreatingDriver,
    setIsCreatingDriver,
    approvingDriverId,
    approveDriverError,
    tenantConfig,
    setTenantConfig,
    editingSettings,
    setEditingSettings,
    savingSettings,
    setSavingSettings,
    editedSettings,
    setEditedSettings,
    editedPricing,
    setEditedPricing,
    editedBranding,
    setEditedBranding,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    editingVehicleId,
    setEditingVehicleId,
    showVehicleEditModal,
    setShowVehicleEditModal,
    tooltipVehicleId,
    setTooltipVehicleId,
    isMenuOpen,
    setIsMenuOpen,
    logoFailed,
    setLogoFailed,
    isMobile,
    setIsMobile,
    selectedBooking,
    setSelectedBooking,
    showBookingDetails,
    setShowBookingDetails,
    loadingBookingDetails,
    setLoadingBookingDetails,
    selectedBookingRating,
    setSelectedBookingRating,
    loadingBookingRating,
    setLoadingBookingRating,
    selectedDriver,
    setSelectedDriver,
    showDriverDetails,
    setShowDriverDetails,
    loadingDriverDetails,
    setLoadingDriverDetails,
    showAssignDriverToBooking,
    setShowAssignDriverToBooking,
    selectedDriverForBooking,
    setSelectedDriverForBooking,
    assigningDriver,
    setAssigningDriver,
    showOverrideConfirm,
    setShowOverrideConfirm,
    deletingVehicleId,
    setDeletingVehicleId,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    setIsDeleting,
    unassigningVehicleId,
    setUnassigningVehicleId,
    showUnassignConfirm,
    setShowUnassignConfirm,
    isUnassigning,
    setIsUnassigning,
    unassignError,
    setUnassignError,
    assigningVehicleId,
    setAssigningVehicleId,
    showAssignConfirm,
    setShowAssignConfirm,
    selectedDriverId,
    setSelectedDriverId,
    isAssigning,
    setIsAssigning,
    assignError,
    setAssignError,
    showAssignVehicleToDriver,
    setShowAssignVehicleToDriver,
    assignVehicleToDriverId,
    setAssignVehicleToDriverId,
    selectedVehicleIdForDriverAssign,
    setSelectedVehicleIdForDriverAssign,
    assignVehicleToDriverError,
    setAssignVehicleToDriverError,
    vehicleSettingsOpen,
    setVehicleSettingsOpen,
    kpiScrollIndex,
    setKpiScrollIndex,
    showAddVehicleForm,
    setShowAddVehicleForm,
    showDriverModeConfirm,
    setShowDriverModeConfirm,
    isSwitchingToDriver,
    setIsSwitchingToDriver,
    switchToDriverError,
    setSwitchToDriverError,
    showInstallAppNotice,
    setShowInstallAppNotice,
    overviewCopiedLink,
    setOverviewCopiedLink,
    overviewLinkQrState,
    setOverviewLinkQrState,
    overviewLinksOpen,
    setOverviewLinksOpen,
    newVehicle,
    setNewVehicle,
    addingVehicle,
    setAddingVehicle,
    addVehicleError,
    setAddVehicleError,
    addVehicleSuccess,
    setAddVehicleSuccess,
    tenantPageThemeMode,
    setTenantPageThemeMode,
    navigate,
    location,
    kpiCarouselScrollRef,
    isCustomThemeActive,
    handleTenantThemeModeChange,
    load,
    createDriver,
    approveDriverAction,
    confirmUnassignDriver,
    confirmAssignDriver,
    confirmAssignVehicleToDriver,
    openAssignVehicleToDriver,
    driversTableGridColumns,
    ridersTableGridColumns,
    getStatusColor,
    getStatusColorHex,
    getStatusIcon,
    getInitials,
    getVehicleRate,
    handleSettingChange,
    handlePricingChange,
    handleBrandingChange,
    handleLogoChange,
    hasOtherChanges,
    handleCancelEdit,
    handleBookingClick,
    handleDriverClick,
    handleAssignDriverToBooking,
    handleDeleteVehicle,
    handleAddVehicle,
    handleNewVehicleChange,
    confirmDeleteVehicle,
    tabs,
    getActiveTab,
    activeTab,
    activeDriverCount,
    filteredDriversForList,
    useCompressedDriverCards,
    openDriverRideHistory,
    toggleDriverCardExpanded,
    getPageTitle,
    handleTabClick,
    copyTenantOverviewLink,
    generateTenantOverviewLinkQr,
    downloadTenantOverviewLinkQr,
    accessToken,
    role,
    theme,
    setTheme,
    lightMode,
    searchQuery,
    handleSearchChange,
    filteredBookings,
    searchError,
    clearSearch,
    hasActiveSearch,
  }
}

export type TenantShellCtx = ReturnType<typeof useShellState>

export default function TenantShell() {
  const ctx = useShellState()

  // §4.4 — Prefetch sibling tab chunks on idle so tab switches feel native
  useEffect(() => {
    const rIC = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200))
    const id = rIC(() => {
      // These dynamic imports just kick off chunk preloading — no await needed
      void import('@pages/tenant/OverviewTab')
      void import('@pages/tenant/DriversTab')
      void import('@pages/tenant/BookingsTab')
      void import('@pages/tenant/VehiclesTab')
    })
    return () => {
      const cIC = (window as any).cancelIdleCallback
      if (cIC) cIC(id)
    }
  }, [])
  const {
    info,
    setInfo,
    drivers,
    setDrivers,
    riders,
    setRiders,
    vehicles,
    setVehicles,
    bookings,
    setBookings,
    vehicleCategories,
    setVehicleCategories,
    analysis,
    setAnalysis,
    loading,
    setLoading,
    bookingStatusFilter,
    setBookingStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    vehicleIdFilter,
    setVehicleIdFilter,
    driverListSearch,
    setDriverListSearch,
    driverFilterStatus,
    setDriverFilterStatus,
    driverFilterType,
    setDriverFilterType,
    expandedDriverCardIds,
    setExpandedDriverCardIds,
    driverCardMenuOpenId,
    setDriverCardMenuOpenId,
    error,
    setError,
    addingCategory,
    setAddingCategory,
    newDriver,
    setNewDriver,
    showAddDriver,
    setShowAddDriver,
    showBookRideModal,
    setShowBookRideModal,
    addDriverError,
    setAddDriverError,
    isCreatingDriver,
    setIsCreatingDriver,
    approvingDriverId,
    approveDriverError,
    tenantConfig,
    setTenantConfig,
    editingSettings,
    setEditingSettings,
    savingSettings,
    setSavingSettings,
    editedSettings,
    setEditedSettings,
    editedPricing,
    setEditedPricing,
    editedBranding,
    setEditedBranding,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    editingVehicleId,
    setEditingVehicleId,
    showVehicleEditModal,
    setShowVehicleEditModal,
    tooltipVehicleId,
    setTooltipVehicleId,
    isMenuOpen,
    setIsMenuOpen,
    logoFailed,
    setLogoFailed,
    isMobile,
    setIsMobile,
    selectedBooking,
    setSelectedBooking,
    showBookingDetails,
    setShowBookingDetails,
    loadingBookingDetails,
    setLoadingBookingDetails,
    selectedBookingRating,
    setSelectedBookingRating,
    loadingBookingRating,
    setLoadingBookingRating,
    selectedDriver,
    setSelectedDriver,
    showDriverDetails,
    setShowDriverDetails,
    loadingDriverDetails,
    setLoadingDriverDetails,
    showAssignDriverToBooking,
    setShowAssignDriverToBooking,
    selectedDriverForBooking,
    setSelectedDriverForBooking,
    assigningDriver,
    setAssigningDriver,
    showOverrideConfirm,
    setShowOverrideConfirm,
    deletingVehicleId,
    setDeletingVehicleId,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    setIsDeleting,
    unassigningVehicleId,
    setUnassigningVehicleId,
    showUnassignConfirm,
    setShowUnassignConfirm,
    isUnassigning,
    setIsUnassigning,
    unassignError,
    setUnassignError,
    assigningVehicleId,
    setAssigningVehicleId,
    showAssignConfirm,
    setShowAssignConfirm,
    selectedDriverId,
    setSelectedDriverId,
    isAssigning,
    setIsAssigning,
    assignError,
    setAssignError,
    showAssignVehicleToDriver,
    setShowAssignVehicleToDriver,
    assignVehicleToDriverId,
    setAssignVehicleToDriverId,
    selectedVehicleIdForDriverAssign,
    setSelectedVehicleIdForDriverAssign,
    assignVehicleToDriverError,
    setAssignVehicleToDriverError,
    vehicleSettingsOpen,
    setVehicleSettingsOpen,
    kpiScrollIndex,
    setKpiScrollIndex,
    showAddVehicleForm,
    setShowAddVehicleForm,
    showDriverModeConfirm,
    setShowDriverModeConfirm,
    isSwitchingToDriver,
    setIsSwitchingToDriver,
    switchToDriverError,
    setSwitchToDriverError,
    showInstallAppNotice,
    setShowInstallAppNotice,
    overviewCopiedLink,
    setOverviewCopiedLink,
    overviewLinkQrState,
    setOverviewLinkQrState,
    overviewLinksOpen,
    setOverviewLinksOpen,
    newVehicle,
    setNewVehicle,
    addingVehicle,
    setAddingVehicle,
    addVehicleError,
    setAddVehicleError,
    addVehicleSuccess,
    setAddVehicleSuccess,
    tenantPageThemeMode,
    setTenantPageThemeMode,
    navigate,
    location,
    kpiCarouselScrollRef,
    isCustomThemeActive,
    handleTenantThemeModeChange,
    load,
    createDriver,
    approveDriverAction,
    confirmUnassignDriver,
    confirmAssignDriver,
    confirmAssignVehicleToDriver,
    openAssignVehicleToDriver,
    driversTableGridColumns,
    ridersTableGridColumns,
    getStatusColor,
    getStatusColorHex,
    getStatusIcon,
    getInitials,
    getVehicleRate,
    handleSettingChange,
    handlePricingChange,
    handleBrandingChange,
    handleLogoChange,
    hasOtherChanges,
    handleCancelEdit,
    handleBookingClick,
    handleDriverClick,
    handleAssignDriverToBooking,
    handleDeleteVehicle,
    handleAddVehicle,
    handleNewVehicleChange,
    confirmDeleteVehicle,
    tabs,
    getActiveTab,
    activeTab,
    activeDriverCount,
    filteredDriversForList,
    useCompressedDriverCards,
    openDriverRideHistory,
    toggleDriverCardExpanded,
    getPageTitle,
    handleTabClick,
    copyTenantOverviewLink,
    generateTenantOverviewLinkQr,
    downloadTenantOverviewLinkQr,
    accessToken,
    role,
    theme,
    setTheme,
    lightMode,
    searchQuery,
    handleSearchChange,
    filteredBookings,
    searchError,
    clearSearch,
    hasActiveSearch,
  } = ctx

  if (loading) {
    return (
      <div className="bw" style={{ minHeight: 'var(--app-h)', backgroundColor: 'var(--bw-bg)' }}>
        <TenantDashboardSkeleton />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
            <div className="bw-header-actions">
              <Button variant="secondary" onClick={() => useAuthStore.getState().logout()} style={{ marginLeft: 16 }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: 'var(--bw-muted)', marginBottom: '16px' }}>
            <WarningCircle size={48} className="mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-muted)' }}>No Tenant Information</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--bw-muted)' }}>Unable to load tenant information. Please try again.</p>
          <Button onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  // Error boundary for the component
  if (error) {
    return (
      <div className="bw bw-container" style={{ padding: '24px 0' }}>
        <div className="bw-header" style={{ marginBottom: 32 }}>
          <div className="bw-header-content">
            <h1 style={{ fontSize: 32, margin: 0 }}>Dashboard</h1>
            <div className="bw-header-actions">
              <Button variant="secondary" onClick={() => useAuthStore.getState().logout()} style={{ marginLeft: 16 }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bw-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ color: 'var(--bw-error)', marginBottom: '16px' }}>
            <WarningCircle size={48} className="mx-auto" />
          </div>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--bw-error)' }}>Error Loading Dashboard</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--bw-muted)' }}>{error}</p>
          <Button onClick={() => {
              setError(null)
              load()
            }}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bw tenant-dashboard-layout" style={{
      minHeight: 'var(--app-h)',
      display: 'flex'
    }}>
      <style>{TENANT_DASHBOARD_LAYOUT_CSS}</style>
      {/* Token Expiration Notification */}
      <TokenExpirationNotification />
      
      {/* Mobile overlay when drawer is open */}
      {isMobile && isMenuOpen && (
        <div
          className="tenant-dashboard-nav-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Sidebar Menu - Left Aligned */}
      <div
        id="tenant-dashboard-nav"
        className={`tenant-dashboard-sidebar${isMenuOpen ? ' is-open' : ''}`}
      >
        {/* Company header */}
        <div style={{
          height: 60,
          padding: '0 14px',
          borderBottom: '1px solid var(--bw-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label={info?.profile?.company_name || 'Dashboard'}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', flexShrink: 0, cursor: 'pointer',
              background: info?.profile?.logo_url && !logoFailed ? 'transparent' : 'var(--bw-accent)',
              color: 'var(--bw-bg)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14, padding: 0, overflow: 'hidden',
            }}
          >
            {info?.profile?.logo_url && !logoFailed ? (
              <img
                src={info.profile.logo_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              (info?.profile?.company_name?.[0] || 'M').toUpperCase()
            )}
          </button>
          {isMenuOpen && (
            <>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--bw-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {info?.profile?.company_name || 'Dashboard'}
                </div>
                {info?.profile?.city && (
                  <div style={{ fontSize: 12, color: 'var(--bw-muted)', whiteSpace: 'nowrap' }}>{info.profile.city}</div>
                )}
              </div>
              <button
                type="button"
                className="tnav-icon-btn"
                onClick={() => setIsMenuOpen(false)}
                aria-label={isMobile ? 'Close menu' : 'Collapse sidebar'}
              >
                {isMobile ? <X size={18} aria-hidden /> : <SidebarSimple size={18} aria-hidden />}
              </button>
            </>
          )}
        </div>

        {/* Navigation Tabs in Sidebar */}
        <nav className="tnav" aria-label="Dashboard">
          {NAV_GROUPS.map(({ label, group }) => (
            <div key={group} style={{ display: 'contents' }}>
              <div className="tnav-label" aria-hidden={!isMenuOpen}>{label}</div>
              {tabs.filter((tab) => tab.group === group).map((tab) => {
                const IconComponent = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`tnav-item${isActive ? ' is-active' : ''}`}
                    onClick={() => handleTabClick(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={tab.label}
                    title={!isMenuOpen ? tab.label : undefined}
                  >
                    <IconComponent size={18} weight={isActive ? 'fill' : 'regular'} style={{ flexShrink: 0 }} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer Section in Sidebar - Expanded */}
        {isMenuOpen && (
          <div style={{
            padding: 'clamp(12px, 1.5vw, 20px)',
            borderTop: '1px solid var(--bw-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            flexShrink: 0
          }}>
            {/* User identity row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 0 8px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bw-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '0.02em',
                fontFamily: '"Work Sans", sans-serif'
              }}>
                {info?.first_name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 'clamp(12px, 1.3vw, 14px)',
                  fontWeight: 500,
                  color: 'var(--bw-text)',
                  fontFamily: '"Work Sans", sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3
                }}>
                  {info?.first_name || 'Admin'}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 300,
                  letterSpacing: '0.03em'
                }}>
                  Operator
                </div>
              </div>
              <ThemeToggle
                mode="segmented"
                value={tenantPageThemeMode}
                onChange={handleTenantThemeModeChange}
              />
            </div>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                if (isMobile) setIsMenuOpen(false)
                setShowDriverModeConfirm(true)
              }}
            >
              Switch to Driver Mode
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                if (isMobile) setIsMenuOpen(false)
                useAuthStore.getState().logout()
              }}
            >
              <SignOut size={16} aria-hidden />
              Log out
            </Button>
          </div>
        )}

        {/* Footer Section in Sidebar - Collapsed (desktop icon-only rail) */}
        {!isMenuOpen && (
          <div style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--bw-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bw-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: '"Work Sans", sans-serif',
                cursor: 'default',
                userSelect: 'none'
              }}
              title={`${info?.first_name || 'Admin'} · Operator`}
            >
              {info?.first_name?.[0]?.toUpperCase() || 'T'}
            </div>
            <button
              type="button"
              className="tnav-item"
              onClick={() => useAuthStore.getState().logout()}
              title="Log out"
              aria-label="Log out"
            >
              <SignOut size={16} aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* Mobile bottom tab bar (replaces the hamburger; "Menu" opens the drawer for settings/account actions) */}
      <nav className="tenant-dashboard-bottombar" aria-label="Primary">
        {tabs.filter((tab) => !BOTTOM_BAR_HIDDEN.includes(tab.id)).map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id && !isMenuOpen
          return (
            <button
              key={tab.id}
              type="button"
              className={isActive ? 'is-active' : undefined}
              onClick={() => handleTabClick(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent size={22} weight={isActive ? 'fill' : 'regular'} aria-hidden />
              <span>{tab.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          className={isMenuOpen || BOTTOM_BAR_HIDDEN.includes(activeTab) ? 'is-active' : undefined}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="tenant-dashboard-nav"
        >
          <List size={22} weight={isMenuOpen ? 'bold' : 'regular'} aria-hidden />
          <span>Menu</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="tenant-dashboard-main">
          {/* Top bar: page title, live-count subtitle, status */}
          {activeTab !== 'assistant' && (
          <header className="tenant-dashboard-topbar">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1>
                {activeTab === 'overview'
                  ? (() => {
                      const h = new Date().getHours()
                      const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
                      return `${g}, ${info?.first_name || 'there'}`
                    })()
                  : getPageTitle()}
              </h1>
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--bw-muted)', fontWeight: 400 }}>
                {activeTab === 'overview' && (
                  <>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    {info?.profile?.city ? ` · ${info.profile.city}` : ''}
                  </>
                )}
                {activeTab === 'drivers' && `${activeDriverCount} active of ${drivers.length} ${drivers.length === 1 ? 'driver' : 'drivers'}`}
                {activeTab === 'bookings' && `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'}`}
                {activeTab === 'riders' && `${riders.length} ${riders.length === 1 ? 'rider' : 'riders'}`}
                {activeTab === 'vehicles' && `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {activeTab === 'overview' && !isMobile && <StatusPill status="active" label="Dispatch live" size="md" />}
              {(activeTab === 'overview' || activeTab === 'bookings') && (
                <Button onClick={() => setShowBookRideModal(true)}>
                  <Plus size={15} weight="bold" aria-hidden />
                  {isMobile ? 'Book' : 'New booking'}
                </Button>
              )}
              {activeTab === 'drivers' && (
                <Button onClick={() => setShowAddDriver(true)}>
                  <Plus size={15} weight="bold" aria-hidden />
                  {isMobile ? 'Add' : 'Add driver'}
                </Button>
              )}
              {activeTab === 'vehicles' && (
                <Button onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}>
                  <Plus size={15} weight="bold" aria-hidden />
                  {isMobile ? 'Add' : 'Add vehicle'}
                </Button>
              )}
            </div>
          </header>
          )}

          {/* Tab Content */}
          <div className={`tenant-dashboard-content${activeTab === 'assistant' ? ' is-chat' : ''}`}>
          <div className="bw-tab-content" style={{
            fontFamily: '"Work Sans", sans-serif',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
        {showInstallAppNotice && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'fixed',
              top: `calc(${isMobile ? '12px' : '16px'} + env(safe-area-inset-top, 0px))`,
              right: `calc(${isMobile ? '12px' : '16px'} + env(safe-area-inset-right, 0px))`,
              left: isMobile ? 'calc(12px + env(safe-area-inset-left, 0px))' : 'auto',
              zIndex: 1100,
              width: isMobile ? 'auto' : 'min(420px, calc(100% - 32px))',
              border: '1px solid var(--bw-border-strong)',
              background: 'var(--bw-bg-secondary)',
              borderRadius: 10,
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: 1, color: 'var(--bw-accent)' }} aria-hidden />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--bw-text)' }}>
                  Install Maison as an app
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--bw-muted)', lineHeight: 1.45 }}>
                  Add Maison to your iPhone or Android home screen for faster access.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={() => {
                      setShowInstallAppNotice(false)
                      navigate('/tenant/settings/help#install-web-app')
                    }} style={{ minHeight: 36, padding: '8px 12px', fontSize: 13 }}>View instructions</Button>
                  <Button variant="secondary" onClick={() => setShowInstallAppNotice(false)} style={{ minHeight: 36, padding: '8px 12px', fontSize: 13 }}>Not now</Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallAppNotice(false)}
                aria-label="Dismiss install app notice"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--bw-muted)',
                  cursor: 'pointer',
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <X size={14} aria-hidden />
              </button>
            </div>
          </div>
        )}

        <Outlet context={ctx} />
          </div>
          </div>

      {showDriverModeConfirm && (
        <Modal
          title="Switch to Driver Mode"
          width={500}
          onClose={() => setShowDriverModeConfirm(false)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowDriverModeConfirm(false)
                }}
              >
                Cancel
              </Button>
              <Button
                                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  try {
                    setIsSwitchingToDriver(true)
                    setSwitchToDriverError(null)

                    const response = await becomeDriver()

                    const accessToken = response.data?.access_token || (response as any).access_token

                    if (accessToken) {
                      const tenantSlug =
                        tenantConfig?.branding?.slug?.trim() ||
                        info?.profile?.slug?.trim() ||
                        extractSubdomain(window.location.hostname) ||
                        ''
                      if (!tenantSlug) {
                        setSwitchToDriverError('Unable to determine your tenant slug. Set your slug in Settings or open the dashboard from your tenant subdomain, then try again.')
                        return
                      }
                      const driverLoginUrl = getTenantAppUrl(tenantSlug, `/driver/login?token=${encodeURIComponent(accessToken)}`)
                      window.open(driverLoginUrl, '_blank', 'noopener,noreferrer')

                      setShowDriverModeConfirm(false)
                    } else {
                      setSwitchToDriverError(response.error || 'Failed to get driver access token')
                    }
                  } catch (err: any) {
                    console.error('Failed to switch to driver mode:', err)
                    setSwitchToDriverError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to switch to driver mode. Please try again.')
                  } finally {
                    setIsSwitchingToDriver(false)
                  }
                }}
                disabled={isSwitchingToDriver}
              >
                {isSwitchingToDriver ? 'Switching…' : 'Continue'}
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--bw-text)',
              lineHeight: 1.6
            }}>
              You are about to switch to Driver Mode. This will change your view to the driver interface where you can manage your driver profile, view assigned bookings, and access driver-specific features.
            </p>
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: 'var(--bw-text)',
              lineHeight: 1.6
            }}>
              Do you want to continue?
            </p>
            {switchToDriverError && (
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bw-bg-secondary)',
                border: '1px solid var(--bw-border)',
                borderRadius: '7px',
                color: 'var(--bw-error)',
                fontSize: 'clamp(13px, 1.8vw, 15px)'
              }}>
                {switchToDriverError}
              </div>
            )}
          </div>
        </Modal>
      )}

      <TenantBookRideModal
        open={showBookRideModal}
        onClose={() => setShowBookRideModal(false)}
        vehicles={vehicles}
        isMobile={isMobile}
        onSuccess={() => {
          void load()
        }}
      />
      </div>
    </div>
  )
}
