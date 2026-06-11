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

export default function BookingsTab() {
  const {
    info,
    setInfo,
    drivers,
    setDrivers,
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
    settingsMenuOpen,
    setSettingsMenuOpen,
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
    handleSettingsSubmenuClick,
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
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bw-content">
            <div className="bw-content-header" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <div style={{ minWidth: 0 }}>
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? 'clamp(20px, 4vw, 24px)' : '24px',
                  fontWeight: 600,
                  fontFamily: '"Work Sans", sans-serif',
                  color: 'var(--bw-text)',
                }}>
                  Bookings
                </h2>
                <p style={{
                  margin: '6px 0 0 0',
                  fontSize: 'clamp(13px, 1.8vw, 14px)',
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                }}>
                  Schedule rides for customers—they confirm via email, no login required.
                </p>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: 'clamp(12px, 2vw, 16px)',
                width: isMobile ? '100%' : 'auto',
              }}>
              <button
                type="button"
                className={`bw-btn bw-btn-action ${isBookRideHovered ? 'custom-hover-border' : ''}`}
                onClick={() => setShowBookRideModal(true)}
                onMouseEnter={() => setIsBookRideHovered(true)}
                onMouseLeave={() => setIsBookRideHovered(false)}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  backgroundColor: 'transparent',
                  border: isMobile
                    ? `2px dashed ${isBookRideHovered ? '#7c3aed' : lightMode ? '#94a3b8' : 'rgba(255,255,255,0.22)'}`
                    : undefined,
                  borderColor: !isMobile && isBookRideHovered ? 'var(--bw-accent)' : undefined,
                  color: isBookRideHovered ? (isMobile ? '#7c3aed' : 'var(--bw-accent)') : lightMode ? '#334155' : 'var(--bw-text)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                } as React.CSSProperties}
              >
                <Plus
                  style={{
                    width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                    height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px',
                  }}
                  aria-hidden
                />
                <span>Schedule ride for customer</span>
              </button>
              <div style={{ 
                display: 'flex', 
                gap: 'clamp(8px, 1.5vw, 12px)', 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span className="bw-text-muted" style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  {hasActiveSearch ? (
                    <>
                      Showing: {filteredBookings.length} of {bookings.length} • 
                      Completed: {filteredBookings.filter(b => b.booking_status === 'completed').length} • 
                      Active: {filteredBookings.filter(b => b.booking_status === 'active').length} • 
                      Pending: {filteredBookings.filter(b => b.booking_status === 'pending').length}
                    </>
                  ) : (
                    <>
                      Total: {bookings.length} • 
                      Completed: {bookings.filter(b => b.booking_status === 'completed').length} • 
                      Active: {bookings.filter(b => b.booking_status === 'active').length} • 
                      Pending: {bookings.filter(b => b.booking_status === 'pending').length}
                    </>
                  )}
                </span>
              </div>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="booking-search-filters-wrapper" style={{
              marginBottom: 'clamp(16px, 3vw, 24px)',
              display: 'flex',
              gap: 'clamp(12px, 2vw, 16px)',
              alignItems: 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              justifyContent: 'space-between'
            }}>
              {/* Search Bar */}
              <div className="booking-search-container" style={{
                flex: 1,
                minWidth: isMobile ? '100%' : '200px',
                maxWidth: '50%'
              }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%'
                }}>
                  <div style={{
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <MagnifyingGlass 
                      size="clamp(16px, 2.5vw, 20px)"
                      style={{
                        position: 'absolute',
                        left: 'clamp(12px, 2vw, 16px)',
                        color: 'var(--bw-muted)',
                        pointerEvents: 'none',
                        zIndex: 1
                      }} 
                    />
                    <input
                      type="text"
                      placeholder="Search by customer name or driver name..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bw-input"
                      style={{
                        width: '100%',
                        paddingLeft: 'clamp(40px, 6vw, 48px)',
                        paddingRight: hasActiveSearch ? 'clamp(40px, 6vw, 48px)' : 'clamp(12px, 2vw, 16px)',
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        fontFamily: '"Work Sans", sans-serif',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bw-bg)',
                        color: 'var(--bw-text)',
                        minHeight: 'clamp(40px, 5vw, 48px)',
                        boxSizing: 'border-box'
                      }}
                    />
                    {hasActiveSearch && (
                      <button
                        onClick={clearSearch}
                        style={{
                          position: 'absolute',
                          right: 'clamp(12px, 2vw, 16px)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--bw-muted)',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--bw-text)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--bw-muted)'
                        }}
                        aria-label="Clear search"
                      >
                        <X style={{
                          width: 'clamp(16px, 2.5vw, 20px)',
                          height: 'clamp(16px, 2.5vw, 20px)'
                        }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="booking-filters-container" style={{
                marginLeft: 'auto',
                minWidth: 0
              }}>
                {/* Booking Status Filter */}
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => {
                    setBookingStatusFilter(e.target.value)
                    // Reload bookings with new filter
                    setTimeout(() => {
                      const loadBookings = async () => {
                        try {
                          const bookingParams: { booking_status?: string; service_type?: string; vehicle_id?: number } = {}
                          if (e.target.value) bookingParams.booking_status = e.target.value
                          if (serviceTypeFilter) bookingParams.service_type = serviceTypeFilter
                          if (vehicleIdFilter) bookingParams.vehicle_id = vehicleIdFilter
                          
                          const b = await getTenantBookings(Object.keys(bookingParams).length > 0 ? bookingParams : undefined)
                          if (b.data !== undefined) {
                            setBookings(b.data || [])
                          }
                        } catch (error) {
                          console.error('Failed to reload bookings:', error)
                        }
                      }
                      loadBookings()
                    }, 0)
                  }}
                  className="bw-input booking-filter-select"
                  style={{
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bw-bg)',
                    color: 'var(--bw-text)',
                    minHeight: 'clamp(40px, 5vw, 48px)',
                    cursor: 'pointer',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    minWidth: 0
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Service Type Filter */}
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => {
                    setServiceTypeFilter(e.target.value)
                    // Reload bookings with new filter
                    setTimeout(() => {
                      const loadBookings = async () => {
                        try {
                          const bookingParams: { booking_status?: string; service_type?: string; vehicle_id?: number } = {}
                          if (bookingStatusFilter) bookingParams.booking_status = bookingStatusFilter
                          if (e.target.value) bookingParams.service_type = e.target.value
                          if (vehicleIdFilter) bookingParams.vehicle_id = vehicleIdFilter
                          
                          const b = await getTenantBookings(Object.keys(bookingParams).length > 0 ? bookingParams : undefined)
                          if (b.data !== undefined) {
                            setBookings(b.data || [])
                          }
                        } catch (error) {
                          console.error('Failed to reload bookings:', error)
                        }
                      }
                      loadBookings()
                    }, 0)
                  }}
                  className="bw-input booking-filter-select"
                  style={{
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bw-bg)',
                    color: 'var(--bw-text)',
                    minHeight: 'clamp(40px, 5vw, 48px)',
                    cursor: 'pointer',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    minWidth: 0
                  }}
                >
                  <option value="">All Services</option>
                  <option value="dropoff">Dropoff</option>
                  <option value="hourly">Hourly</option>
                  <option value="airport">Airport</option>
                </select>

                {/* Vehicle Filter */}
                <select
                  value={vehicleIdFilter || ''}
                  onChange={(e) => {
                    const vehicleId = e.target.value ? parseInt(e.target.value) : null
                    setVehicleIdFilter(vehicleId)
                    // Reload bookings with new filter
                    setTimeout(() => {
                      const loadBookings = async () => {
                        try {
                          const bookingParams: { booking_status?: string; service_type?: string; vehicle_id?: number } = {}
                          if (bookingStatusFilter) bookingParams.booking_status = bookingStatusFilter
                          if (serviceTypeFilter) bookingParams.service_type = serviceTypeFilter
                          if (vehicleId) bookingParams.vehicle_id = vehicleId
                          
                          const b = await getTenantBookings(Object.keys(bookingParams).length > 0 ? bookingParams : undefined)
                          if (b.data !== undefined) {
                            setBookings(b.data || [])
                          }
                        } catch (error) {
                          console.error('Failed to reload bookings:', error)
                        }
                      }
                      loadBookings()
                    }, 0)
                  }}
                  className="bw-input booking-filter-select booking-filter-vehicle"
                  style={{
                    padding: 'clamp(8px, 1.5vw, 12px)',
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    fontFamily: '"Work Sans", sans-serif',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bw-bg)',
                    color: 'var(--bw-text)',
                    minHeight: 'clamp(40px, 5vw, 48px)',
                    cursor: 'pointer',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    minWidth: 0
                  }}
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id} title={`${vehicle.make} ${vehicle.model} ${vehicle.year ? `(${vehicle.year})` : ''} ${vehicle.license_plate ? `- ${vehicle.license_plate}` : ''}`}>
                      {vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''} {vehicle.license_plate ? `- ${vehicle.license_plate}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Search Error Messages */}
            <div style={{
              marginTop: '-clamp(16px, 3vw, 24px)',
              marginBottom: 'clamp(16px, 3vw, 24px)'
            }}>
              {searchError && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bw-warning-bg, #fef3c7)',
                  border: '1px solid var(--bw-warning-border, #f59e0b)',
                  borderRadius: '6px',
                  color: 'var(--bw-warning-text, #92400e)',
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  fontFamily: '"Work Sans", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <WarningCircle size={16} style={{
                    flexShrink: 0
                  }} />
                  <span>{searchError}</span>
                </div>
              )}
              {hasActiveSearch && filteredBookings.length === 0 && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  textAlign: 'center',
                  color: 'var(--bw-muted)',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  No bookings found matching "{searchQuery}"
                </div>
              )}
            </div>

            <div className="bw-card" style={{
              padding: 'clamp(16px, 3vw, 24px)',
              border: '1px solid var(--bw-border)',
              borderRadius: '12px'
            }}>
              {isMobile ? (
                /* Mobile Card Layout */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
                  {filteredBookings.length === 0 ? (
                    <div className="bw-empty-state" style={{
                      padding: 'clamp(24px, 4vw, 48px)',
                      textAlign: 'center'
                    }}>
                      <div className="bw-empty-icon" style={{
                        marginBottom: 'clamp(12px, 2vw, 16px)',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <Calendar size={32} style={{ 
                          width: 'clamp(32px, 5vw, 48px)', 
                          height: 'clamp(32px, 5vw, 48px)',
                          color: 'var(--bw-muted)'
                        }} />
                      </div>
                      <div className="bw-empty-text" style={{
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        color: 'var(--bw-text)',
                        marginBottom: 'clamp(8px, 1.5vw, 12px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 500
                      }}>No bookings yet</div>
                      <div className="bw-empty-subtext" style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: 'var(--bw-muted)',
                        fontFamily: '"Work Sans", sans-serif',
                        marginBottom: 'clamp(16px, 2vw, 20px)',
                      }}>Schedule a ride for a customer, or wait for riders to book through your site.</div>
                      <button
                        type="button"
                        className="bw-btn bw-btn-primary"
                        onClick={() => setShowBookRideModal(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        <Plus size={18} aria-hidden />
                        Schedule ride for customer
                      </button>
                    </div>
                  ) : (
                    filteredBookings.map((booking, idx) => (
                      <div 
                        key={booking.id || `booking-${idx}`} 
                        onClick={() => booking.id && handleBookingClick(booking.id)}
                        style={{ 
                          cursor: 'pointer',
                          border: '1px solid var(--bw-border)',
                          borderRadius: 'clamp(8px, 1.5vw, 12px)',
                          padding: 'clamp(16px, 3vw, 24px)',
                          backgroundColor: 'var(--bw-bg-secondary)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover-strong)'
                          e.currentTarget.style.borderColor = 'var(--bw-border-strong)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-secondary)'
                          e.currentTarget.style.borderColor = 'var(--bw-border)'
                        }}
                      >
                        {/* Booking ID and Status */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 'clamp(12px, 2vw, 16px)',
                          paddingBottom: 'clamp(12px, 2vw, 16px)',
                          borderBottom: '1px solid var(--bw-border)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(18px, 3vw, 22px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            #{booking.id}
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            backgroundColor: getStatusColorHex(booking.booking_status) + '20',
                            border: `1px solid ${getStatusColorHex(booking.booking_status)}`,
                            color: getStatusColorHex(booking.booking_status),
                            fontSize: 'clamp(11px, 1.8vw, 12px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500,
                            display: 'inline-block'
                          }}>
                            {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                          </div>
                        </div>

                        {/* Customer Name */}
                        <div style={{
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: 'var(--bw-muted)',
                            marginBottom: 'clamp(4px, 1vw, 6px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500
                          }}>
                            Customer
                          </div>
                          <div style={{
                            fontSize: 'clamp(16px, 2.5vw, 18px)',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            fontFamily: '"Work Sans", sans-serif'
                          }}>
                            {booking.customer_name || 'Anonymous Customer'}
                          </div>
                        </div>

                        {/* Route Information */}
                        <div style={{
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          <div style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            color: 'var(--bw-muted)',
                            marginBottom: 'clamp(8px, 1.5vw, 12px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500
                          }}>
                            Route
                          </div>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(8px, 1.5vw, 10px)'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 'clamp(8px, 1.5vw, 10px)',
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-text)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <MapPin size={16} style={{
                                width: 'clamp(16px, 2.5vw, 18px)',
                                height: 'clamp(16px, 2.5vw, 18px)',
                                color: 'var(--bw-muted)',
                                marginTop: '2px',
                                flexShrink: 0
                              }} />
                              <span><strong>From:</strong> {booking.pickup_location}</span>
                            </div>
                            {booking.dropoff_location && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'clamp(8px, 1.5vw, 10px)',
                                fontSize: 'clamp(14px, 2vw, 16px)',
                                color: 'var(--bw-text)',
                                fontFamily: '"Work Sans", sans-serif'
                              }}>
                                <MapPin size={16} style={{
                                  width: 'clamp(16px, 2.5vw, 18px)',
                                  height: 'clamp(16px, 2.5vw, 18px)',
                                  color: 'var(--bw-muted)',
                                  marginTop: '2px',
                                  flexShrink: 0
                                }} />
                                <span><strong>To:</strong> {booking.dropoff_location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 'clamp(12px, 2vw, 16px)',
                          marginBottom: 'clamp(12px, 2vw, 16px)'
                        }}>
                          {/* Service Type */}
                          <div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              marginBottom: 'clamp(6px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              Service
                            </div>
                            <span className="bw-badge bw-badge-secondary" style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {booking.service_type || 'Standard'}
                            </span>
                          </div>

                          {/* Date & Time */}
                          <div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              marginBottom: 'clamp(6px, 1vw, 8px)',
                              fontFamily: '"Work Sans", sans-serif',
                              fontWeight: 500
                            }}>
                              Date & Time
                            </div>
                            <div style={{
                              fontSize: 'clamp(14px, 2vw, 16px)',
                              color: 'var(--bw-text)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {new Date(booking.pickup_time).toLocaleDateString()}
                            </div>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif',
                              marginTop: 'clamp(2px, 0.5vw, 4px)'
                            }}>
                              {new Date(booking.pickup_time).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        {/* Driver, Vehicle, and Fare */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(8px, 1.5vw, 10px)',
                          paddingTop: 'clamp(12px, 2vw, 16px)',
                          borderTop: '1px solid var(--bw-border)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <strong>Vehicle:</strong> {booking.vehicle || 'N/A'}
                            </div>
                            <div style={{
                              fontSize: 'clamp(18px, 3vw, 22px)',
                              fontWeight: 700,
                              color: '#059669',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              ${booking.estimated_price || '0.00'}
                            </div>
                          </div>
                          {booking.driver_name && booking.driver_name !== 'None' && (
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <strong>Driver:</strong> {booking.driver_name}
                            </div>
                          )}
                          {booking.customer_phone && (
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <strong>Customer Phone:</strong> {booking.customer_phone}
                            </div>
                          )}
                          {booking.driver_phone && (
                            <div style={{
                              fontSize: 'clamp(12px, 1.5vw, 14px)',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              <strong>Driver Phone:</strong> {booking.driver_phone}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Desktop Table Layout */
                <div className="bw-table">
                  <div className="bw-table-header">
                    <div className="bw-table-cell">Booking ID</div>
                    <div className="bw-table-cell">Customer & Route</div>
                    <div className="bw-table-cell">Service Details</div>
                    <div className="bw-table-cell">Date & Time</div>
                    <div className="bw-table-cell">Driver & Vehicle</div>
                    <div className="bw-table-cell">Status</div>
                    <div className="bw-table-cell">Fare</div>
                  </div>
                  {filteredBookings.length === 0 ? (
                    <div className="bw-empty-state">
                      <div className="bw-empty-icon">
                        <Calendar size={32} />
                      </div>
                      <div className="bw-empty-text">No bookings yet</div>
                      <div className="bw-empty-subtext">Schedule a ride for a customer, or wait for riders to book through your site.</div>
                      <button
                        type="button"
                        className="bw-btn bw-btn-primary"
                        onClick={() => setShowBookRideModal(true)}
                        style={{
                          marginTop: 16,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontFamily: '"Work Sans", sans-serif',
                          fontWeight: 600,
                        }}
                      >
                        <Plus size={18} aria-hidden />
                        Schedule ride for customer
                      </button>
                    </div>
                  ) : (
                    filteredBookings.map((booking, idx) => (
                      <div 
                        key={booking.id || `booking-${idx}`} 
                        className="bw-table-row"
                        onClick={() => booking.id && handleBookingClick(booking.id)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bw-bg-hover)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div className="bw-table-cell">
                          <div style={{ fontWeight: '600', color: '#374151' }}>
                            #{booking.id}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-route-info">
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{ fontWeight: '500', color: '#111827' }}>
                                {booking.customer_name || 'Anonymous Customer'}
                              </span>
                            </div>
                            {booking.customer_phone && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500' }}>Phone:</span> {booking.customer_phone}
                              </div>
                            )}
                            <div className="bw-route-item" style={{ fontSize: '12px', color: '#6b7280' }}>
                              <MapPin size={12} />
                              <span style={{ marginLeft: '4px' }}>From: {booking.pickup_location}</span>
                            </div>
                            {booking.dropoff_location && (
                              <div className="bw-route-item" style={{ fontSize: '12px', color: '#6b7280' }}>
                                <MapPin size={12} />
                                <span style={{ marginLeft: '4px' }}>To: {booking.dropoff_location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="bw-badge bw-badge-secondary" style={{ fontSize: '11px' }}>
                              {booking.service_type || 'Standard'}
                            </span>
                            {booking.estimated_duration && (
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                Est: {booking.estimated_duration} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div className="bw-datetime-info">
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {new Date(booking.pickup_time).toLocaleDateString()}
                            </div>
                            <div className="bw-text-muted" style={{ fontSize: '12px' }}>
                              {new Date(booking.pickup_time).toLocaleTimeString()}
                            </div>
                            {booking.dropoff_time && (
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                Drop: {new Date(booking.dropoff_time).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ fontWeight: '500' }}>Driver:</span> {booking.driver_name && booking.driver_name !== 'None' ? booking.driver_name : 'No assigned driver'}
                            </div>
                            {booking.driver_phone && (
                              <div style={{ fontSize: '12px' }}>
                                <span style={{ fontWeight: '500' }}>Driver Phone:</span> {booking.driver_phone}
                              </div>
                            )}
                            <div style={{ fontSize: '12px' }}>
                              <span style={{ fontWeight: '500' }}>Vehicle:</span> {booking.vehicle || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            backgroundColor: getStatusColorHex(booking.booking_status) + '20',
                            border: `1px solid ${getStatusColorHex(booking.booking_status)}`,
                            color: getStatusColorHex(booking.booking_status),
                            fontSize: '12px',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500,
                            display: 'inline-block'
                          }}>
                            {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                          </div>
                        </div>
                        <div className="bw-table-cell">
                          <div style={{ fontWeight: '600', color: '#059669' }}>
                            ${booking.estimated_price || '0.00'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Booking Details Modal */}
      {showBookingDetails && (
        <div className="bw-modal-overlay" onClick={() => {
          setShowBookingDetails(false)
          setSelectedBooking(null)
          setSelectedBookingRating(null)
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '1120px',
            width: '94vw',
            maxHeight: '90vh',
            overflowY: isMobile ? 'auto' : 'hidden',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            position: 'relative'
          }}>
            <div style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300,
            }}>
              {loadingBookingDetails ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(280px, 1fr)',
                  gap: '24px',
                  alignItems: 'start',
                }}>
                  <div style={{
                    backgroundColor: 'var(--bw-bg-secondary)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '12px',
                    padding: 'clamp(16px, 2.5vw, 24px)',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '16px',
                    maxHeight: isMobile ? undefined : 'calc(90vh - 64px)',
                    overflowY: isMobile ? undefined : 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 400, color: 'var(--bw-text)' }}>
                        Booking Details
                      </h3>
                      <button
                        className="bw-btn-icon"
                        onClick={() => {
                          setShowBookingDetails(false)
                          setSelectedBooking(null)
                          setSelectedBookingRating(null)
                        }}
                        style={{ padding: '8px', minWidth: '32px', minHeight: '32px' }}
                        aria-label="Close booking details"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
                    <div style={{ color: 'var(--bw-muted)' }}>Loading booking details...</div>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: 'var(--bw-bg-secondary)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '12px',
                    padding: 'clamp(16px, 2vw, 20px)',
                    alignSelf: 'start',
                  }}>
                    <div style={{ color: 'var(--bw-muted)' }}>
                      Loading rating...
                    </div>
                  </div>
                </div>
              ) : selectedBooking ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(280px, 1fr)',
                  gap: '24px',
                  alignItems: 'start',
                }}>
                  {/* Booking details content */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(16px, 2.5vw, 24px)',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '12px',
                    padding: 'clamp(16px, 2.5vw, 24px)',
                    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)',
                    maxHeight: isMobile ? undefined : 'calc(90vh - 64px)',
                    overflowY: isMobile ? undefined : 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: 'clamp(18px, 2.5vw, 24px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        Booking Details
                      </h3>
                      <button
                        className="bw-btn-icon"
                        onClick={() => {
                          setShowBookingDetails(false)
                          setSelectedBooking(null)
                          setSelectedBookingRating(null)
                        }}
                        style={{ padding: '8px', minWidth: '32px', minHeight: '32px' }}
                        aria-label="Close booking details"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                    {/* Booking ID and Status */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 'clamp(12px, 2vw, 16px)',
                      borderBottom: '1px solid var(--bw-border)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(12px, 1.5vw, 14px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Booking ID
                        </div>
                        <div style={{
                          fontSize: 'clamp(18px, 2.5vw, 24px)',
                          fontWeight: 400,
                          color: 'var(--bw-text)'
                        }}>
                          #{selectedBooking.id}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '8px',
                        backgroundColor: getStatusColorHex(selectedBooking.booking_status) + '20',
                        border: `1px solid ${getStatusColorHex(selectedBooking.booking_status)}`,
                        color: getStatusColorHex(selectedBooking.booking_status),
                        fontSize: 'clamp(11px, 1.8vw, 12px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 500,
                        display: 'inline-block',
                        textTransform: 'capitalize'
                      }}>
                        {selectedBooking.booking_status}
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Customer Information
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Customer Name
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.customer_name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Customer Phone
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.customer_phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Route Information
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <MapPin className="w-3 h-3" style={{ color: 'var(--bw-muted)' }} />
                          Pickup Location
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.pickup_location}
                        </div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginTop: '4px'
                        }}>
                          {new Date(selectedBooking.pickup_time).toLocaleString()}
                        </div>
                      </div>
                      {selectedBooking.dropoff_location && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <MapPin size={12} style={{ color: 'var(--bw-muted)' }} />
                            Dropoff Location
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedBooking.dropoff_location}
                          </div>
                          {selectedBooking.dropoff_time && (
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginTop: '4px'
                            }}>
                              {new Date(selectedBooking.dropoff_time).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Service Details
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Service Type
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)',
                          textTransform: 'capitalize'
                        }}>
                          {selectedBooking.service_type || 'Standard'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Payment Method
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)',
                          textTransform: 'capitalize'
                        }}>
                          {selectedBooking.payment_method || 'N/A'}
                        </div>
                        {selectedBooking.payment_method === 'zelle' && hasZelleRecipient(selectedBooking.zelle_number, selectedBooking.zelle_email) && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bw-bg-secondary)',
                            border: '1px solid var(--bw-border)',
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            lineHeight: 1.45
                          }}>
                            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Zelle recipient</div>
                            {isCompleteUsPhone(selectedBooking.zelle_number) && (
                              <div>Phone: {zelleNumberFromApi(selectedBooking.zelle_number)}</div>
                            )}
                            {zelleEmailFromApi(selectedBooking.zelle_email) != null && (
                              <div style={{ wordBreak: 'break-all' }}>Email: {zelleEmailDisplay(selectedBooking.zelle_email)}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          City
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.country || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver & Vehicle */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Assignment
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'clamp(8px, 1.5vw, 12px)'
                    }}>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Driver
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {selectedBooking.driver_name && selectedBooking.driver_name !== 'None' ? selectedBooking.driver_name : 'No assigned driver'}
                          <button
                            onClick={() => setShowAssignDriverToBooking(true)}
                            className="bw-btn-icon"
                            style={{
                              padding: '4px',
                              minWidth: '24px',
                              minHeight: '24px'
                            }}
                            title="Assign Driver"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Driver Phone
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.driver_phone || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Vehicle
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedBooking.vehicle || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Pricing
                    </h4>
                    <div style={{
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      ${selectedBooking.estimated_price?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedBooking.notes && (
                    <div>
                      <h4 style={{
                        margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                        fontSize: 'clamp(14px, 2vw, 18px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        Notes
                      </h4>
                      <div style={{
                        fontSize: 'clamp(13px, 1.5vw, 15px)',
                        color: 'var(--bw-text)',
                        padding: 'clamp(12px, 2vw, 16px)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        borderRadius: '6px',
                        border: '1px solid var(--bw-border)'
                      }}>
                        {selectedBooking.notes}
                      </div>
                    </div>
                  )}

                  </div>

                  {/* Rating card (outside booking details content) */}
                  <div style={{
                    border: '1px solid var(--bw-border)',
                    borderRadius: '12px',
                    padding: 'clamp(16px, 2vw, 20px)',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignSelf: 'start',
                    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)'
                  }}>
                    <div style={{
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
                      color: 'var(--bw-muted)',
                    }}>
                      Ride Rating
                    </div>
                    {loadingBookingRating ? (
                      <div style={{ color: 'var(--bw-muted)', fontSize: 'clamp(12px, 1.4vw, 13px)' }}>
                        Loading rating...
                      </div>
                    ) : selectedBookingRating ? (
                      <>
                        <div style={{
                          fontSize: 'clamp(16px, 2.2vw, 20px)',
                          fontWeight: 500,
                          color: 'var(--bw-text)',
                        }}>
                          {selectedBookingRating.rating_value.toFixed(1)} / 5.0
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <RatingStar
                              key={`tenant-booking-rating-${selectedBooking.id || 'unknown'}-${i}`}
                              fillPercent={starFillPercent(selectedBookingRating.rating_value, i)}
                              gradientId={`tenant-booking-rating-grad-${selectedBooking.id || 'unknown'}-${i}`}
                              size={24}
                            />
                          ))}
                        </div>
                        <div style={{
                          fontSize: 'clamp(12px, 1.4vw, 14px)',
                          color: 'var(--bw-text)',
                          lineHeight: 1.45,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}>
                          {selectedBookingRating.review_comment || 'No written review left.'}
                        </div>
                      </>
                    ) : (
                      <div style={{
                        fontSize: 'clamp(12px, 1.4vw, 14px)',
                        color: 'var(--bw-muted)',
                      }}>
                        No rating submitted yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 2fr) minmax(280px, 1fr)',
                  gap: '24px',
                  alignItems: 'start',
                }}>
                  <div style={{
                    backgroundColor: 'var(--bw-bg-secondary)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '12px',
                    padding: 'clamp(16px, 2.5vw, 24px)',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '16px',
                    maxHeight: isMobile ? undefined : 'calc(90vh - 64px)',
                    overflowY: isMobile ? undefined : 'auto',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 400, color: 'var(--bw-text)' }}>
                        Booking Details
                      </h3>
                      <button
                        className="bw-btn-icon"
                        onClick={() => {
                          setShowBookingDetails(false)
                          setSelectedBooking(null)
                          setSelectedBookingRating(null)
                        }}
                        style={{ padding: '8px', minWidth: '32px', minHeight: '32px' }}
                        aria-label="Close booking details"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
                      <div style={{ color: 'var(--bw-muted)' }}>No booking details available</div>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: 'var(--bw-bg-secondary)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: '12px',
                    padding: 'clamp(16px, 2vw, 20px)',
                    alignSelf: 'start',
                  }}>
                    <div style={{ color: 'var(--bw-muted)' }}>No rating submitted yet.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Assign Driver to Booking Modal */}
      {showAssignDriverToBooking && selectedBooking && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!assigningDriver) {
            setShowAssignDriverToBooking(false)
            setSelectedDriverForBooking('')
            setShowOverrideConfirm(false)
          }
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '500px',
            width: '90vw'
          }}>
            <div className="bw-modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderBottom: '1px solid var(--bw-border)'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 400,
                fontFamily: '"Work Sans", sans-serif'
              }}>
                {showOverrideConfirm ? 'Override Existing Driver?' : 'Assign Driver to Booking'}
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  if (!assigningDriver) {
                    setShowAssignDriverToBooking(false)
                    setSelectedDriverForBooking('')
                    setShowOverrideConfirm(false)
                  }
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
                disabled={assigningDriver}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              {showOverrideConfirm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--bw-border)'
                  }}>
                    <div style={{ fontSize: '14px', color: 'var(--bw-text)', marginBottom: '8px' }}>
                      This booking already has a driver assigned:
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--bw-text)' }}>
                      {selectedBooking.driver_name}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--bw-muted)' }}>
                    Do you want to replace the current driver with a new one?
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--bw-text)',
                      marginBottom: '8px'
                    }}>
                      Select Driver
                    </label>
                    <select
                      value={selectedDriverForBooking}
                      onChange={(e) => setSelectedDriverForBooking(e.target.value)}
                      className="bw-input"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        color: 'var(--bw-text)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        border: '1px solid var(--bw-border)',
                        borderRadius: '6px'
                      }}
                    >
                      <option value="">Choose a driver</option>
                      {drivers
                        .filter(driver => driver.driver_type === 'in_house')
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.first_name} {driver.last_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  {selectedBooking.driver_name && selectedBooking.driver_name !== 'None' && (
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--bw-bg-secondary)',
                      borderRadius: '6px',
                      border: '1px solid var(--bw-border)',
                      fontSize: '13px',
                      color: 'var(--bw-muted)'
                    }}>
                      Current driver: <span style={{ fontWeight: 500, color: 'var(--bw-text)' }}>{selectedBooking.driver_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                className={`bw-btn-outline ${isCancelAssignBookingHovered ? 'custom-hover-border' : ''}`}
                onClick={() => {
                  if (!assigningDriver) {
                    setShowAssignDriverToBooking(false)
                    setSelectedDriverForBooking('')
                    setShowOverrideConfirm(false)
                  }
                }}
                onMouseEnter={() => !assigningDriver && setIsCancelAssignBookingHovered(true)}
                onMouseLeave={() => setIsCancelAssignBookingHovered(false)}
                disabled={assigningDriver}
                style={{
                  padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                  borderRadius: 7,
                  border: isCancelAssignBookingHovered ? '2px solid var(--bw-accent)' : undefined,
                  borderColor: isCancelAssignBookingHovered ? 'var(--bw-accent)' : undefined,
                  color: isCancelAssignBookingHovered ? 'var(--bw-accent)' : undefined,
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
              >
                <span style={{ color: isCancelAssignBookingHovered ? 'var(--bw-accent)' : 'inherit' }}>
                  {showOverrideConfirm ? 'Cancel' : 'Close'}
                </span>
              </button>
              {showOverrideConfirm ? (
                <>
                  <button
                    className={`bw-btn-outline ${isBackOverrideHovered ? 'custom-hover-border' : ''}`}
                    onClick={() => setShowOverrideConfirm(false)}
                    onMouseEnter={() => !assigningDriver && setIsBackOverrideHovered(true)}
                    onMouseLeave={() => setIsBackOverrideHovered(false)}
                    disabled={assigningDriver}
                    style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isBackOverrideHovered ? '2px solid var(--bw-accent)' : undefined,
                      borderColor: isBackOverrideHovered ? 'var(--bw-accent)' : undefined,
                      color: isBackOverrideHovered ? 'var(--bw-accent)' : undefined,
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isBackOverrideHovered ? 'var(--bw-accent)' : 'inherit' }}>
                      Back
                    </span>
                  </button>
                  <button
                    className={`bw-btn bw-btn-action ${isOverrideConfirmHovered ? 'custom-hover-border' : ''}`}
                    onClick={handleAssignDriverToBooking}
                    onMouseEnter={() => !assigningDriver && !selectedDriverForBooking && setIsOverrideConfirmHovered(true)}
                    onMouseLeave={() => setIsOverrideConfirmHovered(false)}
                    disabled={assigningDriver || !selectedDriverForBooking}
                    style={{
                      padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                      fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                      fontFamily: '"Work Sans", sans-serif',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      borderRadius: 7,
                      border: isOverrideConfirmHovered ? '2px solid var(--bw-accent)' : undefined,
                      borderColor: isOverrideConfirmHovered ? 'var(--bw-accent)' : undefined,
                      color: isOverrideConfirmHovered ? 'var(--bw-accent)' : undefined,
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                  >
                    <span style={{ color: isOverrideConfirmHovered ? 'var(--bw-accent)' : 'inherit' }}>
                      {assigningDriver ? 'Assigning...' : 'Yes, Override'}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  className={`bw-btn bw-btn-action ${isAssignDriverToBookingHovered ? 'custom-hover-border' : ''}`}
                  onClick={handleAssignDriverToBooking}
                  onMouseEnter={() => !assigningDriver && !selectedDriverForBooking && setIsAssignDriverToBookingHovered(true)}
                  onMouseLeave={() => setIsAssignDriverToBookingHovered(false)}
                  disabled={assigningDriver || !selectedDriverForBooking}
                  style={{
                    padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
                    fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                    fontFamily: '"Work Sans", sans-serif',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center',
                    borderRadius: 7,
                    border: isAssignDriverToBookingHovered ? '2px solid var(--bw-accent)' : undefined,
                    borderColor: isAssignDriverToBookingHovered ? 'var(--bw-accent)' : undefined,
                    color: isAssignDriverToBookingHovered ? 'var(--bw-accent)' : undefined,
                    transition: 'all 0.2s ease'
                  } as React.CSSProperties}
                >
                  <span style={{ color: isAssignDriverToBookingHovered ? 'var(--bw-accent)' : 'inherit' }}>
                    {assigningDriver ? 'Assigning...' : 'Assign Driver'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  )
}
