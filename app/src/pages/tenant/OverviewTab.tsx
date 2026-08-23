import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { getTenantInfo, getTenantDrivers, getTenantVehicles, getTenantBookings, getTenantBookingById, onboardDriver, assignDriverToVehicle, assignDriverToBooking, unassignDriverFromVehicle, assignDriverToVehicleNew, getTenantAnalysis, becomeDriver, type TenantResponse, type DriverResponse, type DriverDetailResponse, type VehicleResponse, type BookingResponse, type OnboardDriver, type TenantAnalysisData } from '@api/tenant'
import { getVehicleRates, getVehicleCategoriesByTenant, createVehicleCategory, setVehicleRates, deleteVehicle, addVehicle } from '@api/vehicles'
import { getTenantConfig, updateTenantSettings, updateTenantPricing, updateTenantBranding, updateTenantLogo, type TenantConfigResponse, type TenantSettingsData, type TenantPricingData, type TenantBrandingData, feedbackFormUrlForPayload } from '@api/tenantSettings'
import { useAuthStore } from '@store/auth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTenantTheme, useTheme } from '@contexts/ThemeContext'
import ThemeToggle from '@components/ThemeToggle'
import VehicleEditModal from '@components/VehicleEditModal'
import TenantBookRideModal from '@components/TenantBookRideModal'
import TokenExpirationNotification from '@components/TokenExpirationNotification'
import { TenantDashboardSkeleton } from '@components/Skeleton'
import { useBookingSearch } from '@hooks/useBookingSearch'
import { Car, Users, Calendar, Gear, TrendUp, CurrencyDollar, Clock, MapPin, User, Phone, Envelope, Plus, Pencil, Trash, CheckCircle, XCircle, WarningCircle, Palette, FloppyDisk, SidebarSimple, CaretDown, CaretUp, X, Info, MagnifyingGlass, Wallet, Circle, Lock, Sparkle, Copy, ArrowSquareOut, ChatCircleDots, ShieldCheck, DotsThreeVertical, CaretRight, List, type IconWeight } from '@phosphor-icons/react'
import { API_BASE } from '@config'
import { vehicleMakes, getVehicleModels } from '../../data/vehicleData'
import { extractSubdomain } from '@utils/subdomain'
import { getTenantAppUrl } from '@config/host'
import {
  zelleNumberFromApi,
  zelleEmailFromApi,
  tenantZellePayload,
  hasZelleRecipient,
  zelleEmailDisplay,
  isCompleteUsPhone,
  zellePhoneValidationError
} from '@utils/zelleContact'
import { getBookingRating, type BookingRatingResponse } from '@api/bookings'
import { useOutletContext } from 'react-router-dom'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { TenantShellCtx } from './TenantShell'
import {
  TENANT_DASHBOARD_LAYOUT_CSS,
  TENANT_FEEDBACK_FORM_URL,
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

export default function OverviewTab() {
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
    analysisLoading,
    analysisError,
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
    editingRates,
    setEditingRates,
    savingRates,
    setSavingRates,
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
    isCancelAssignVehicleToDriverHovered,
    setIsCancelAssignVehicleToDriverHovered,
    isConfirmAssignVehicleToDriverHovered,
    setIsConfirmAssignVehicleToDriverHovered,
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
    isAddVehicleHovered,
    setIsAddVehicleHovered,
    isRetryHovered,
    setIsRetryHovered,
    isTryAgainHovered,
    setIsTryAgainHovered,
    overviewCopiedLink,
    setOverviewCopiedLink,
    overviewLinkQrState,
    setOverviewLinkQrState,
    overviewLinksOpen,
    setOverviewLinksOpen,
    isAddDriverHovered,
    setIsAddDriverHovered,
    isBookRideHovered,
    setIsBookRideHovered,
    isDownloadLogsHovered,
    setIsDownloadLogsHovered,
    isSaveRateHovered,
    setIsSaveRateHovered,
    isAddCategoryHovered,
    setIsAddCategoryHovered,
    isMoreSettingsHovered,
    setIsMoreSettingsHovered,
    isCreateDriverHovered,
    setIsCreateDriverHovered,
    isAssignDriverToBookingHovered,
    setIsAssignDriverToBookingHovered,
    isOverrideConfirmHovered,
    setIsOverrideConfirmHovered,
    isDeleteVehicleHovered,
    setIsDeleteVehicleHovered,
    isAddVehicleFormHovered,
    setIsAddVehicleFormHovered,
    isCancelAddVehicleHovered,
    setIsCancelAddVehicleHovered,
    isCancelAddDriverHovered,
    setIsCancelAddDriverHovered,
    isCancelAssignBookingHovered,
    setIsCancelAssignBookingHovered,
    isBackOverrideHovered,
    setIsBackOverrideHovered,
    isCancelDeleteHovered,
    setIsCancelDeleteHovered,
    unassignHoveredVehicleId,
    setUnassignHoveredVehicleId,
    isConfirmUnassignHovered,
    setIsConfirmUnassignHovered,
    isCancelUnassignHovered,
    setIsCancelUnassignHovered,
    assignHoveredVehicleId,
    setAssignHoveredVehicleId,
    hoveredVehicleCardId,
    setHoveredVehicleCardId,
    isConfirmAssignHovered,
    setIsConfirmAssignHovered,
    isCancelAssignHovered,
    setIsCancelAssignHovered,
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
    confirmUnassignDriver,
    confirmAssignDriver,
    confirmAssignVehicleToDriver,
    openAssignVehicleToDriver,
    driversTableGridColumns,
    saveVehicleRate,
    getStatusColor,
    getStatusColorHex,
    getStatusIcon,
    getInitials,
    getVehicleRate,
    handleSettingChange,
    handlePricingChange,
    handleBrandingChange,
    handleLogoChange,
    handleSaveSettings,
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
    driverPalette,
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
  } = useOutletContext<TenantShellCtx>()

  return (
    <>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(16px, 3vw, 24px)',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            {(() => {
              const overviewCardBg = isCustomThemeActive ? 'var(--bw-bg-secondary)' : (lightMode ? '#ffffff' : '#1c1a2e')
              const overviewCardBorder = isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid #e5e7eb' : '1px solid #2a2640')
              const overviewCardShadow = isCustomThemeActive ? 'none' : (lightMode ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none')
              const overviewPrimaryText = isCustomThemeActive ? 'var(--bw-text)' : (lightMode ? '#1a1a1a' : '#ffffff')
              const overviewMutedText = isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? '#64748b' : '#7c7a92')
              const overviewMutedAltText = isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? '#64748b' : '#6b6885')
              const overviewBodyText = isCustomThemeActive ? 'var(--bw-text)' : (lightMode ? '#334155' : '#cbd5e1')
              const overviewInsetBg = isCustomThemeActive ? 'var(--bw-bg)' : (lightMode ? '#f1f5f9' : 'rgba(0,0,0,0.35)')
              const overviewInsetBorder = isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)')
              const overviewDivider = isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid rgba(15, 13, 26, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)')
              const overviewRowDivider = isCustomThemeActive ? '1px solid var(--bw-border)' : (lightMode ? '1px solid rgba(15, 13, 26, 0.07)' : '1px solid rgba(255, 255, 255, 0.07)')
              const overviewPillBg = isCustomThemeActive ? 'var(--bw-bg-hover)' : (lightMode ? 'rgba(108, 99, 232, 0.12)' : 'rgba(108, 99, 232, 0.22)')
              const overviewPillBorder = isCustomThemeActive ? '1px solid var(--bw-border-strong)' : (lightMode ? '1px solid rgba(108, 99, 232, 0.28)' : '1px solid rgba(108, 99, 232, 0.4)')
              const overviewAvatarBg = isCustomThemeActive ? 'var(--bw-bg-hover)' : (lightMode ? 'rgba(108, 99, 232, 0.12)' : '#261e3a')
              const overviewAvatarText = isCustomThemeActive ? 'var(--bw-accent)' : (lightMode ? 'var(--bw-accent)' : '#9b8fb8')
              const overviewChartInsetBg = isCustomThemeActive ? 'var(--bw-bg)' : (lightMode ? 'rgba(241, 245, 249, 0.45)' : 'rgba(15, 13, 26, 0.4)')
              const overviewChartInsetBorder = isCustomThemeActive ? '1px solid var(--bw-border-strong)' : (lightMode ? '1px solid #cbd5e1' : '1px solid #3d3858')
              const overviewChartBar = isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? 'rgba(15, 13, 26, 0.16)' : 'rgba(255, 255, 255, 0.16)')
              const overviewChartStroke = isCustomThemeActive ? 'var(--bw-text)' : (lightMode ? '#0f0d1a' : '#ffffff')

              return (
                <>
            {/* Overview — Today Screen: hero revenue + 2×2 stat grid + quick actions */}
            {(() => {
              const tStart = new Date()
              tStart.setHours(0, 0, 0, 0)
              const tEnd = new Date(tStart)
              tEnd.setHours(23, 59, 59, 999)
              const yStart = new Date()
              yStart.setDate(yStart.getDate() - 1)
              yStart.setHours(0, 0, 0, 0)
              const yEnd = new Date(yStart)
              yEnd.setHours(23, 59, 59, 999)

              const todaysRevenue = analysis?.todays_revenue ?? 0
              const totalRevenueAllTime = analysis?.total_revenue ?? 0
              const availableDrivers = analysis?.available_drivers ?? drivers.filter(d => d.is_active).length
              const totalBookingsCount = analysis?.total_bookings ?? bookings.length
              const completedCount = analysis?.completed_rides ?? bookings.filter(b => {
                const x = b.booking_status?.toLowerCase() ?? ''
                return x === 'completed' || x === 'done' || x === 'complete'
              }).length

              const todayBookings = bookings.filter(b => {
                const t = new Date(b.pickup_time)
                return t >= tStart && t <= tEnd
              })
              const yesterdayRevenue = bookings
                .filter(b => { const t = new Date(b.pickup_time); return t >= yStart && t <= yEnd })
                .reduce((sum, b) => sum + Number(b.estimated_price ?? 0), 0)

              const activeRidesToday = todayBookings.filter(b => b.booking_status?.toLowerCase() === 'active').length
              const completionRate = totalBookingsCount > 0 ? Math.round((completedCount / totalBookingsCount) * 100) : 0
              const delta = todaysRevenue - yesterdayRevenue
              const deltaPositive = delta >= 0
              const deltaAmt = '$' + Math.abs(Math.round(delta)).toLocaleString('en-US')

              // 7-day sparkline — same API series the revenue bar chart below uses,
              // so the two revenue visuals on this screen can never disagree.
              const sparkData: number[] = (analysis?.revenue_last_7_days ?? []).map(d => Number(d.revenue ?? 0))
              const hasSpark = sparkData.length > 1
              const sparkMax = Math.max(...sparkData, 1)
              const sparkX = (i: number) => ((i / (sparkData.length - 1)) * 96).toFixed(1)
              const sparkY = (v: number) => (28 - (v / sparkMax) * 24).toFixed(1)
              const sparkPts = hasSpark ? sparkData.map((v, i) => `${sparkX(i)},${sparkY(v)}`).join(' ') : ''
              const areaD = hasSpark
                ? 'M' + sparkData.map((v, i) => `${sparkX(i)},${sparkY(v)}`).join(' L') + ' L96,28 L0,28 Z'
                : ''

              const sparkColor = isCustomThemeActive ? 'var(--bw-accent)' : (lightMode ? '#6c63e8' : '#a78bfa')
              const positiveColor = isCustomThemeActive ? 'var(--bw-accent)' : (lightMode ? '#16a34a' : '#4ade80')
              const negativeColor = isCustomThemeActive ? 'var(--bw-muted)' : (lightMode ? '#dc2626' : '#f87171')
              const onlineColor = isCustomThemeActive ? 'var(--bw-accent)' : (lightMode ? '#16a34a' : '#4ade80')

              const statLabel: React.CSSProperties = {
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.055em',
                textTransform: 'uppercase' as const,
                color: overviewMutedText,
                fontFamily: '"Work Sans", sans-serif',
                marginBottom: 8,
              }
              const statValue: React.CSSProperties = {
                fontSize: 'clamp(24px, 4vw, 30px)',
                fontWeight: 600,
                color: overviewPrimaryText,
                fontFamily: '"Work Sans", sans-serif',
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
              }
              const statCard: React.CSSProperties = {
                padding: isMobile ? '14px 16px' : '16px 20px',
                border: overviewCardBorder,
                backgroundColor: overviewCardBg,
                borderRadius: '12px',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }

              return (
                <>
                  {/* Hero revenue card */}
                  <div
                    className="bw-card"
                    style={{
                      padding: isMobile ? '16px' : '20px 24px',
                      border: overviewCardBorder,
                      backgroundColor: overviewCardBg,
                      borderRadius: '12px',
                      boxShadow: overviewCardShadow,
                      marginBottom: 'clamp(10px, 2vw, 14px)',
                      display: 'flex',
                      flexDirection: 'row' as const,
                      alignItems: 'center',
                      gap: 16,
                      justifyContent: 'space-between',
                      minWidth: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.055em', textTransform: 'uppercase' as const, color: overviewMutedText, fontFamily: '"Work Sans", sans-serif', marginBottom: 6 }}>
                        Today's Revenue
                      </div>
                      <div style={{ fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 600, color: overviewPrimaryText, fontFamily: '"Work Sans", sans-serif', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', marginBottom: 8 }}>
                        {'$' + Math.round(todaysRevenue).toLocaleString('en-US')}
                      </div>
                      {yesterdayRevenue > 0 ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: deltaPositive ? positiveColor : negativeColor, fontFamily: '"Work Sans", sans-serif' }}>
                          <span>{deltaPositive ? '▲' : '▼'}</span>
                          <span>{deltaAmt} vs yesterday</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: overviewMutedText, fontFamily: '"Work Sans", sans-serif' }}>
                          {'$' + Math.round(totalRevenueAllTime).toLocaleString('en-US')} all time
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, width: isMobile ? 80 : 120, height: isMobile ? 36 : 44 }}>
                      {hasSpark && (
                      <svg viewBox="0 0 96 28" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }} aria-hidden>
                        <defs>
                          <linearGradient id="bw-spark-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={sparkColor} stopOpacity={0.18} />
                            <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <path d={areaD} fill="url(#bw-spark-fill)" />
                        <polyline fill="none" stroke={sparkColor} strokeWidth="2" points={sparkPts} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      </svg>
                      )}
                    </div>
                  </div>

                  {/* 2×2 stat tile grid (1×4 on desktop) */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))', gap: 'clamp(8px, 1.5vw, 12px)', marginBottom: 'clamp(10px, 2vw, 14px)' }}>
                    <div
                      className="bw-card tenant-overview-nav-card"
                      role="button" tabIndex={0} aria-label="View active bookings"
                      onClick={() => handleTabClick('bookings')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabClick('bookings') } }}
                      style={statCard}
                    >
                      <div style={statLabel}>Active trips</div>
                      <div style={statValue}>{activeRidesToday}</div>
                    </div>
                    <div
                      className="bw-card tenant-overview-nav-card"
                      role="button" tabIndex={0} aria-label="View drivers"
                      onClick={() => handleTabClick('drivers')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabClick('drivers') } }}
                      style={statCard}
                    >
                      <div style={{ ...statLabel, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="bw-pulse-dot" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', backgroundColor: onlineColor, flexShrink: 0 }} />
                        Drivers online
                      </div>
                      <div style={statValue}>{availableDrivers}</div>
                    </div>
                    <div
                      className="bw-card tenant-overview-nav-card"
                      role="button" tabIndex={0} aria-label="View bookings"
                      onClick={() => handleTabClick('bookings')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabClick('bookings') } }}
                      style={statCard}
                    >
                      <div style={statLabel}>Bookings today</div>
                      <div style={statValue}>{todayBookings.length}</div>
                    </div>
                    <div
                      className="bw-card tenant-overview-nav-card"
                      role="button" tabIndex={0} aria-label="View completed bookings"
                      onClick={() => handleTabClick('bookings')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabClick('bookings') } }}
                      style={statCard}
                    >
                      <div style={statLabel}>Completion rate</div>
                      <div style={statValue}>{completionRate}%</div>
                    </div>
                    <div
                      className="bw-card tenant-overview-nav-card"
                      role="button" tabIndex={0} aria-label="View riders"
                      onClick={() => handleTabClick('riders')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabClick('riders') } }}
                      style={statCard}
                    >
                      <div style={statLabel}>Riders</div>
                      <div style={statValue}>{riders.length}</div>
                    </div>
                  </div>

                  {/* Quick-action pill row */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 'clamp(16px, 3vw, 24px)', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-primary" onClick={() => setShowBookRideModal(true)} style={{ padding: '10px 20px', minHeight: 40, borderRadius: 10, fontSize: 13 }}>
                      <Plus size={15} weight="bold" aria-hidden />
                      Book ride
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddDriver(true)} style={{ padding: '10px 20px', minHeight: 40, borderRadius: 10, fontSize: 13 }}>
                      <Users size={15} weight="regular" aria-hidden />
                      Add driver
                    </button>
                  </div>
                </>
              )
            })()}

            {/* Your links — tenant subdomain login URLs */}
            {(() => {
              const tenantSlug =
                tenantConfig?.branding?.slug?.trim() ||
                info?.profile?.slug?.trim() ||
                extractSubdomain(window.location.hostname) ||
                ''
              const landingPageUrl = tenantSlug ? getTenantAppUrl(tenantSlug, '/') : ''
              const riderLoginUrl = tenantSlug ? getTenantAppUrl(tenantSlug, '/riders/login') : ''
              const driverLoginUrl = tenantSlug ? getTenantAppUrl(tenantSlug, '/driver/login') : ''
              const linkRowBorder: React.CSSProperties = {
                borderBottom: overviewDivider,
              }
              const muted: React.CSSProperties = {
                fontSize: 12,
                color: overviewMutedText,
                fontFamily: '"Work Sans", sans-serif',
              }
              const labelStyle: React.CSSProperties = {
                fontSize: 13,
                fontWeight: 600,
                color: overviewPrimaryText,
                fontFamily: '"Work Sans", sans-serif',
                minWidth: isMobile ? undefined : 108,
              }
              const urlStyle: React.CSSProperties = {
                flex: 1,
                minWidth: 0,
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                color: overviewBodyText,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '8px 10px',
                borderRadius: 8,
                backgroundColor: overviewInsetBg,
                border: overviewInsetBorder,
              }
              const btnOutline: React.CSSProperties = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: '"Work Sans", sans-serif',
                borderRadius: 8,
                border: overviewInsetBorder,
                background: isCustomThemeActive ? 'var(--bw-bg-secondary)' : (lightMode ? '#ffffff' : 'transparent'),
                color: overviewBodyText,
                cursor: 'pointer',
                textDecoration: 'none',
                flexShrink: 0,
              }
              const headingStyle: React.CSSProperties = {
                margin: 0,
                fontSize: 'clamp(16px, 2.2vw, 18px)',
                fontWeight: 600,
                fontFamily: '"Work Sans", sans-serif',
                color: overviewPrimaryText,
              }
              return (
                <div
                  className="bw-card"
                  style={{
                    padding: 'clamp(16px, 2.5vw, 22px)',
                    border: overviewCardBorder,
                    backgroundColor: overviewCardBg,
                    borderRadius: '12px',
                    boxShadow: overviewCardShadow,
                    marginBottom: 'clamp(16px, 3vw, 24px)',
                  }}
                >
                  {tenantSlug ? (
                    <button
                      type="button"
                      onClick={() => setOverviewLinksOpen((o) => !o)}
                      aria-expanded={overviewLinksOpen}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'inherit',
                      }}
                    >
                      <h3 style={headingStyle}>Your links</h3>
                      <CaretDown
                        size={22}
                        style={{
                          flexShrink: 0,
                          color: overviewMutedText,
                          transform: overviewLinksOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                        aria-hidden
                      />
                    </button>
                  ) : (
                    <h3 style={headingStyle}>Your links</h3>
                  )}
                  {(!tenantSlug || overviewLinksOpen) && (
                    <>
                      <p style={{ ...muted, margin: tenantSlug ? '12px 0 0 0' : '8px 0 0 0', lineHeight: 1.45 }}>
                        White-label URLs for your tenant slug{' '}
                        <strong style={{ color: overviewPrimaryText }}>{tenantSlug || '—'}</strong>.
                        Open your public landing page and share rider and driver login URLs with your team and customers.
                      </p>
                      {!tenantSlug ? (
                        <p style={{ ...muted, margin: '12px 0 0 0' }}>
                          No tenant slug found. Set your slug in{' '}
                          <button
                            type="button"
                            onClick={() => handleTabClick('settings')}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              color: 'var(--bw-accent)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontSize: 12,
                              textDecoration: 'underline',
                            }}
                          >
                            Settings
                          </button>
                          .
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                          {(
                            [
                              { key: 'landing' as const, label: 'Landing page', url: landingPageUrl },
                              { key: 'rider' as const, label: 'Rider login', url: riderLoginUrl },
                              { key: 'driver' as const, label: 'Driver login', url: driverLoginUrl },
                            ] as const
                          ).map((row, idx, rows) => {
                            const qrState = overviewLinkQrState[row.key]
                            const qrImageDataUrl = qrState.imageDataUrl
                            return (
                              <div
                              key={row.key}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                padding: '14px 0',
                                ...(idx < rows.length - 1 ? linkRowBorder : {}),
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: isMobile ? 'column' : 'row',
                                  alignItems: isMobile ? 'stretch' : 'center',
                                  gap: 12,
                                }}
                              >
                                <div style={labelStyle}>{row.label}</div>
                                <div style={urlStyle} title={row.url}>
                                  {row.url}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                    flexShrink: 0,
                                  }}
                                >
                                  <a
                                    href={row.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={btnOutline}
                                  >
                                    <ArrowSquareOut size={16} aria-hidden />
                                    {row.key === 'landing' ? 'View landing page' : 'Open'}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => copyTenantOverviewLink(row.key, row.url)}
                                    style={{
                                      ...btnOutline,
                                      border: overviewPillBorder,
                                      color: 'var(--bw-accent)',
                                    }}
                                  >
                                    <Copy size={16} aria-hidden />
                                    {overviewCopiedLink === row.key ? 'Copied!' : 'Copy'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => generateTenantOverviewLinkQr(row.key, row.url)}
                                    disabled={qrState.loading}
                                    style={{
                                      ...btnOutline,
                                      background: qrState.loading
                                        ? (isCustomThemeActive ? 'var(--bw-bg)' : (lightMode ? '#f8fafc' : 'rgba(124, 122, 146, 0.2)'))
                                        : btnOutline.background,
                                      cursor: qrState.loading ? 'not-allowed' : 'pointer',
                                      opacity: qrState.loading ? 0.8 : 1,
                                    }}
                                  >
                                    {qrState.loading ? 'Generating...' : 'Generate QR'}
                                  </button>
                                </div>
                              </div>
                              {qrState.error ? (
                                <div style={{ fontSize: 12, color: '#fda4af' }}>{qrState.error}</div>
                              ) : null}
                              {qrImageDataUrl ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                    borderTop: overviewDivider,
                                    paddingTop: 10,
                                  }}
                                >
                                  <img
                                    src={qrImageDataUrl}
                                    alt={`${row.label} QR code`}
                                    style={{
                                      width: '100%',
                                      maxWidth: 168,
                                      height: 'auto',
                                      borderRadius: 8,
                                      border: overviewInsetBorder,
                                      backgroundColor: '#ffffff',
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => downloadTenantOverviewLinkQr(row.key, qrImageDataUrl)}
                                    style={btnOutline}
                                  >
                                    Download QR
                                  </button>
                                </div>
                              ) : null}
                            </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })()}

            {/* Overview: drivers, bookings, Maison AI */}
            {(() => {
              const overviewDriverRows = buildOverviewDriverRows(drivers, vehicles, bookings)
              const overviewBookingRows = buildOverviewBookingRows(bookings)
              const cardBase: React.CSSProperties = {
                padding: isMobile ? '12px clamp(10px, 3vw, 14px)' : 'clamp(14px, 2.2vw, 20px)',
                border: overviewCardBorder,
                backgroundColor: overviewCardBg,
                borderRadius: '12px',
                boxShadow: overviewCardShadow,
                display: 'flex',
                flexDirection: 'column',
                minHeight: isMobile ? 'auto' : 'clamp(260px, 32vw, 340px)',
                minWidth: 0,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }
              const headerPill: React.CSSProperties = {
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                padding: '4px 9px',
                borderRadius: 6,
                fontFamily: '"Work Sans", sans-serif',
                backgroundColor: overviewPillBg,
                color: 'var(--bw-accent)',
                border: overviewPillBorder
              }
              const rowDivider: React.CSSProperties = {
                borderBottom: overviewRowDivider
              }
              return (
                <div
                  className="tenant-overview-triple-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))',
                    gap: isMobile ? 'clamp(10px, 2.5vw, 14px)' : 'clamp(12px, 2vw, 20px)',
                    marginBottom: 'clamp(16px, 3vw, 24px)'
                  }}
                >
                  {/* Column 1 — Drivers */}
                  <div
                    className="bw-card tenant-overview-nav-card"
                    style={cardBase}
                    role="button"
                    tabIndex={0}
                    aria-label="Open Drivers"
                    onClick={() => handleTabClick('drivers')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleTabClick('drivers')
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 12,
                      flexShrink: 0,
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                      rowGap: 8
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? 'clamp(14px, 4vw, 16px)' : 'clamp(15px, 2vw, 17px)',
                        fontWeight: 600,
                        fontFamily: '"Work Sans", sans-serif',
                        color: overviewPrimaryText,
                        minWidth: 0,
                        flex: isMobile ? '1 1 auto' : undefined
                      }}>
                        Drivers
                      </h3>
                      <span style={headerPill}>Now</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {overviewDriverRows.length === 0 ? (
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px 8px',
                          fontSize: 12,
                          fontWeight: 400,
                          color: overviewMutedText,
                          fontFamily: '"Work Sans", sans-serif',
                          textAlign: 'center'
                        }}>
                          No drivers onboarded yet.
                        </div>
                      ) : (
                        overviewDriverRows.map((row, idx) => {
                          const dotColor = row.presence === 'available'
                            ? '#22c55e'
                            : row.presence === 'on_ride'
                              ? '#f59e0b'
                              : '#4b5563'
                          return (
                            <div
                              key={row.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 0',
                                ...(idx < overviewDriverRows.length - 1 ? rowDivider : {})
                              }}
                            >
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: overviewAvatarBg,
                                color: overviewAvatarText,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 600,
                                fontFamily: '"Work Sans", sans-serif',
                                flexShrink: 0
                              }}>
                                {row.initials}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: overviewPrimaryText,
                                  fontFamily: '"Work Sans", sans-serif',
                                  lineHeight: 1.25
                                }}>
                                  {row.name}
                                </div>
                                <div style={{
                                  fontSize: isMobile ? 11 : 10,
                                  fontWeight: 400,
                                  color: overviewMutedText,
                                  fontFamily: '"Work Sans", sans-serif',
                                  marginTop: 2,
                                  overflow: isMobile ? 'visible' : 'hidden',
                                  textOverflow: isMobile ? undefined : 'ellipsis',
                                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                                  wordBreak: isMobile ? 'break-word' : undefined,
                                  lineHeight: 1.35
                                }} title={row.vehicleLine}>
                                  {row.vehicleLine}
                                </div>
                              </div>
                              <div
                                title={row.presence === 'available' ? 'Available' : row.presence === 'on_ride' ? 'On a ride' : 'Offline'}
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: dotColor,
                                  flexShrink: 0,
                                  boxShadow: row.presence === 'offline' ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : undefined
                                }}
                              />
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Column 2 — Recent bookings */}
                  <div
                    className="bw-card tenant-overview-nav-card"
                    style={cardBase}
                    role="button"
                    tabIndex={0}
                    aria-label="Open Bookings"
                    onClick={() => handleTabClick('bookings')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleTabClick('bookings')
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 12,
                      flexShrink: 0,
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                      rowGap: 8
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: isMobile ? 'clamp(14px, 4vw, 16px)' : 'clamp(15px, 2vw, 17px)',
                        fontWeight: 600,
                        fontFamily: '"Work Sans", sans-serif',
                        color: overviewPrimaryText,
                        minWidth: 0,
                        flex: isMobile ? '1 1 auto' : undefined
                      }}>
                        Recent bookings
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowBookRideModal(true)
                          }}
                          style={{
                            padding: '6px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            fontFamily: '"Work Sans", sans-serif',
                            borderRadius: 6,
                            border: '1px solid var(--bw-accent)',
                            backgroundColor: 'transparent',
                            color: 'var(--bw-accent)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Schedule ride
                        </button>
                        <span style={headerPill}>Today</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {overviewBookingRows.length === 0 ? (
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px 8px',
                          fontSize: 12,
                          fontWeight: 400,
                          color: overviewMutedText,
                          fontFamily: '"Work Sans", sans-serif',
                          textAlign: 'center'
                        }}>
                          No bookings yet.
                        </div>
                      ) : (
                        overviewBookingRows.map((booking, idx) => {
                          const tag = overviewBookingStatusDisplay(booking.booking_status)
                          const routeText = `${booking.pickup_location} → ${booking.dropoff_location}`
                          return (
                            <div
                              key={booking.id ?? `overview-bk-${idx}-${booking.pickup_time}`}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: isMobile ? 8 : 10,
                                padding: isMobile ? '8px 0' : '10px 0',
                                ...(idx < overviewBookingRows.length - 1 ? rowDivider : {})
                              }}
                            >
                              <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: overviewAvatarBg,
                                color: overviewAvatarText,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                fontFamily: '"Work Sans", sans-serif',
                                flexShrink: 0,
                              }}>
                                {(booking.customer_name || 'C').split(' ').map((w: string) => w[0] || '').filter(Boolean).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: isMobile ? 13 : 12,
                                  fontWeight: 500,
                                  color: overviewPrimaryText,
                                  fontFamily: '"Work Sans", sans-serif',
                                  lineHeight: 1.25,
                                  wordBreak: isMobile ? 'break-word' : undefined,
                                  overflowWrap: isMobile ? 'anywhere' : undefined
                                }}>
                                  {booking.customer_name || 'Customer'}
                                </div>
                                <div style={{
                                  fontSize: isMobile ? 11 : 10,
                                  fontWeight: 400,
                                  color: overviewMutedText,
                                  fontFamily: '"Work Sans", sans-serif',
                                  marginTop: 2,
                                  overflow: isMobile ? 'visible' : 'hidden',
                                  textOverflow: isMobile ? undefined : 'ellipsis',
                                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                                  wordBreak: isMobile ? 'break-word' : undefined,
                                  overflowWrap: isMobile ? 'anywhere' : undefined,
                                  lineHeight: 1.35
                                }} title={routeText}>
                                  {routeText}
                                </div>
                              </div>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 6,
                                flexShrink: 0,
                                minWidth: 0,
                                alignSelf: 'flex-start'
                              }}>
                                <span style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: 'var(--bw-accent)',
                                  fontFamily: '"Work Sans", sans-serif',
                                  whiteSpace: 'nowrap'
                                }}>
                                  ${Number(booking.estimated_price ?? 0).toFixed(0)}
                                </span>
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: 4,
                                  backgroundColor: tag.bg,
                                  color: tag.color,
                                  fontFamily: '"Work Sans", sans-serif',
                                  flexShrink: 0,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {tag.label}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Column 3 — Maison AI */}
                  <div className="bw-card" style={cardBase}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 12,
                      flexShrink: 0,
                      flexWrap: isMobile ? 'wrap' : 'nowrap',
                      rowGap: 8
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? 8 : 10,
                        minWidth: 0,
                        flex: isMobile ? '1 1 auto' : undefined
                      }}>
                        <div style={{
                          width: isMobile ? 26 : 28,
                          height: isMobile ? 26 : 28,
                          borderRadius: 6,
                          backgroundColor: '#6d28d9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Sparkle size={isMobile ? 14 : 16} weight="fill" color="#ffffff" aria-hidden />
                        </div>
                        <h3 style={{
                          margin: 0,
                          fontSize: isMobile ? 'clamp(14px, 4vw, 16px)' : 'clamp(15px, 2vw, 17px)',
                          fontWeight: 600,
                          fontFamily: '"Work Sans", sans-serif',
                          color: overviewPrimaryText,
                          minWidth: 0,
                          lineHeight: 1.2
                        }}>
                          Maison AI
                        </h3>
                      </div>
                      <span style={{
                        fontSize: isMobile ? 10 : 11,
                        fontWeight: 500,
                        color: overviewMutedAltText,
                        fontFamily: '"Work Sans", sans-serif',
                        letterSpacing: '0.02em',
                        flexShrink: 0
                      }}>
                        Coming soon
                      </span>
                    </div>
                    <div style={{
                      opacity: 0.37,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0
                    }}>
                      <p style={{
                        margin: '0 0 10px 0',
                        padding: isMobile ? '8px 10px' : '10px 12px',
                        borderRadius: 8,
                        backgroundColor: overviewInsetBg,
                        borderLeft: '3px solid #7c3aed',
                        fontSize: isMobile ? 11 : 12,
                        lineHeight: 1.5,
                        fontWeight: 400,
                        color: overviewBodyText,
                        fontFamily: '"Work Sans", sans-serif',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}>
                        Tuesday mornings are your peak demand window. You have unassigned bookings with limited driver availability.
                      </p>
                      <p style={{
                        margin: '0 0 14px 0',
                        padding: isMobile ? '8px 10px' : '10px 12px',
                        borderRadius: 8,
                        backgroundColor: overviewInsetBg,
                        borderLeft: '3px solid #7c3aed',
                        fontSize: isMobile ? 11 : 12,
                        lineHeight: 1.5,
                        fontWeight: 400,
                        color: overviewBodyText,
                        fontFamily: '"Work Sans", sans-serif',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}>
                        Revenue is tracking above your daily average. At this pace you may hit your weekly goal ahead of schedule.
                      </p>
                      <span style={{
                        marginTop: 'auto',
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 400,
                        color: overviewMutedAltText,
                        fontFamily: '"Work Sans", sans-serif',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                        cursor: 'not-allowed',
                        userSelect: 'none',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        lineHeight: 1.35
                      }}>
                        Ask Maison AI for a full breakdown
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Charts row — revenue + ride volume, last 7 days */}
            {(() => {
              const chartCardStyle: React.CSSProperties = {
                padding: 'clamp(16px, 2.5vw, 24px)',
                border: overviewCardBorder,
                backgroundColor: overviewCardBg,
                borderRadius: '12px',
                boxShadow: overviewCardShadow,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'clamp(220px, 28vw, 300px)'
              }
              const chartHeadingStyle: React.CSSProperties = {
                margin: 0,
                fontSize: 'clamp(15px, 2vw, 18px)',
                fontWeight: 500,
                fontFamily: '"Work Sans", sans-serif',
                color: overviewPrimaryText
              }
              const chartInsetStyle: React.CSSProperties = {
                flex: 1,
                minHeight: 'clamp(160px, 20vw, 220px)',
                borderRadius: 8,
                border: overviewChartInsetBorder,
                backgroundColor: overviewChartInsetBg,
                overflow: 'hidden'
              }
              const chartCenter: React.CSSProperties = {
                height: '100%',
                minHeight: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
              const chartMessageStyle: React.CSSProperties = {
                fontSize: 'clamp(13px, 2vw, 15px)',
                fontWeight: 400,
                color: overviewMutedAltText,
                fontFamily: '"Work Sans", sans-serif'
              }
              const axisTick = { fontSize: 11, fill: overviewMutedText, fontFamily: '"Work Sans", sans-serif' }
              const tooltipStyle: React.CSSProperties = {
                fontSize: 12,
                fontFamily: '"Work Sans", sans-serif',
                borderRadius: 6,
                border: overviewChartInsetBorder,
                backgroundColor: overviewCardBg,
                color: overviewPrimaryText
              }

              // Loading, error, locked and no-data all render inside the inset so
              // the card never changes height as the 30s refetch cycles.
              const renderChart = (series: unknown[] | null | undefined, chart: React.ReactNode) => {
                if (analysisLoading) {
                  return (
                    <div style={chartCenter}>
                      <div style={{ width: '80%', height: 8, borderRadius: 4, backgroundColor: overviewChartBar }} />
                    </div>
                  )
                }
                if (analysisError) {
                  return <div style={chartCenter}><span style={chartMessageStyle}>Couldn't load analytics</span></div>
                }
                if (analysis?.analytics_locked) {
                  return (
                    <div style={chartCenter}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16, textAlign: 'center' }}>
                        <Lock size={22} weight="duotone" style={{ color: overviewMutedAltText }} aria-hidden />
                        <span style={chartMessageStyle}>Advanced analytics is available on Growth and Fleet</span>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => navigate('/tenant/settings/plans')}
                          style={{ padding: '8px 16px', minHeight: 36, borderRadius: 10, fontSize: 13 }}
                        >
                          Upgrade plan
                        </button>
                      </div>
                    </div>
                  )
                }
                if (!series || series.length === 0) {
                  return <div style={chartCenter}><span style={chartMessageStyle}>No rides yet</span></div>
                }
                return <ResponsiveContainer width="100%" height="100%" minHeight={160}>{chart as any}</ResponsiveContainer>
              }

              return (
                <div
                  className="tenant-dashboard-charts-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 13fr) minmax(0, 7fr)',
                    gap: 'clamp(12px, 2vw, 20px)',
                    marginBottom: 'clamp(16px, 3vw, 24px)'
                  }}
                >
                  {/* Revenue — last 7 days */}
                  <div className="bw-card" style={chartCardStyle}>
                    <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                      <h3 style={chartHeadingStyle}>Revenue — last 7 days</h3>
                    </div>
                    <div style={chartInsetStyle}>
                      {renderChart(
                        analysis?.revenue_last_7_days,
                        <BarChart data={analysis?.revenue_last_7_days ?? undefined} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
                          <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
                          <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${v}`} width={48} />
                          <Tooltip
                            cursor={{ fill: overviewChartBar, fillOpacity: 0.3 }}
                            contentStyle={tooltipStyle}
                            formatter={(v) => [`$${Math.round(Number(v)).toLocaleString('en-US')}`, 'Revenue']}
                          />
                          <Bar dataKey="revenue" fill="var(--bw-accent)" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      )}
                    </div>
                  </div>

                  {/* Ride volume */}
                  <div className="bw-card" style={chartCardStyle}>
                    <div style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
                      <h3 style={chartHeadingStyle}>Ride volume</h3>
                    </div>
                    <div style={chartInsetStyle}>
                      {renderChart(
                        analysis?.ride_volume_last_7_days,
                        <LineChart data={analysis?.ride_volume_last_7_days ?? undefined} margin={{ top: 16, right: 16, left: 0, bottom: 4 }}>
                          <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} />
                          <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v), 'Rides']} />
                          <Line type="monotone" dataKey="count" stroke="var(--bw-accent)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        </LineChart>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
                </>
              )
            })()}

          </div>
        )}
    </>
  )
}
