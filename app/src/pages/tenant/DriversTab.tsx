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

export default function DriversTab() {
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
    approvingDriverId,
    approveDriverError,
    approveDriverAction,
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
        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <>
            <div
              className="bw-content-header"
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: 'clamp(12px, 2vw, 18px)',
                gap: 'clamp(12px, 2vw, 16px)',
              }}
            >
              <button
                type="button"
                className={`btn btn-primary${isMobile ? ' btn-block' : ''}`}
                onClick={() => setShowAddDriver(true)}
              >
                <Plus size={18} aria-hidden />
                Add Driver
              </button>
            </div>

            {drivers.length > 0 && (
              <div
                style={{
                  marginBottom: 'clamp(12px, 2vw, 18px)',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: 10,
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    flex: isMobile ? undefined : '1 1 220px',
                    minWidth: isMobile ? '100%' : 200,
                    position: 'relative',
                  }}
                >
                  <MagnifyingGlass
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--bw-muted)',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                    aria-hidden
                  />
                  <input
                    type="search"
                    className="bw-input"
                    value={driverListSearch}
                    onChange={(e) => setDriverListSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    aria-label="Search drivers"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 38px',
                      boxSizing: 'border-box',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: 13,
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <select
                    className="bw-input"
                    value={driverFilterStatus}
                    onChange={(e) => setDriverFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    aria-label="Filter by driver status"
                    style={{
                      minWidth: isMobile ? '100%' : 108,
                      maxWidth: isMobile ? '100%' : 130,
                      width: isMobile ? '100%' : 'auto',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: 12,
                      padding: '6px 10px',
                    }}
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    className="bw-input"
                    value={driverFilterType}
                    onChange={(e) =>
                      setDriverFilterType(e.target.value as 'all' | 'in_house' | 'outsourced')
                    }
                    aria-label="Filter by driver type"
                    style={{
                      minWidth: isMobile ? '100%' : 108,
                      maxWidth: isMobile ? '100%' : 128,
                      width: isMobile ? '100%' : 'auto',
                      fontFamily: '"Work Sans", sans-serif',
                      fontSize: 12,
                      padding: '6px 10px',
                    }}
                  >
                    <option value="all">All types</option>
                    <option value="in_house">In-House</option>
                    <option value="outsourced">Outsourced</option>
                  </select>
                </div>
              </div>
            )}

            {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}>
                  {drivers.length === 0 ? (
                    <div className="bw-empty-state" style={{
                      padding: 'clamp(24px, 4vw, 48px)',
                      textAlign: 'center'
                    }}>
                      <div className="bw-empty-icon" style={{
                        marginBottom: 'clamp(12px, 2vw, 16px)',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <User size={32} style={{
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
                      }}>No drivers yet</div>
                      <div className="bw-empty-subtext" style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: 'var(--bw-muted)',
                        fontFamily: '"Work Sans", sans-serif',
                        marginBottom: 'clamp(16px, 2vw, 20px)',
                      }}>Add your first driver to start assigning rides.</div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowAddDriver(true)}
                      >
                        <Plus size={18} aria-hidden />
                        Add Driver
                      </button>
                    </div>
                  ) : filteredDriversForList.length === 0 ? (
                    <div className="bw-empty-state" style={{
                      padding: 'clamp(24px, 4vw, 48px)',
                      textAlign: 'center'
                    }}>
                      <div className="bw-empty-text" style={{
                        fontSize: 'clamp(16px, 2.5vw, 20px)',
                        color: 'var(--bw-text)',
                        marginBottom: 'clamp(8px, 1.5vw, 12px)',
                        fontFamily: '"Work Sans", sans-serif',
                        fontWeight: 500
                      }}>No matching drivers</div>
                      <div className="bw-empty-subtext" style={{
                        fontSize: 'clamp(14px, 2vw, 16px)',
                        color: 'var(--bw-muted)',
                        fontFamily: '"Work Sans", sans-serif'
                      }}>Try adjusting search or filters</div>
                    </div>
                  ) : (
                    filteredDriversForList.map((driver) => {
                      const telHref = tenantTelHrefFromPhone(driver.phone_no)
                      const verified = driver.is_registered === 'registered'
                      const inHouse = driver.driver_type === 'in_house'
                      const unapproved = !verified && !driver.is_active
                      const collapsedAccordion =
                        useCompressedDriverCards && !expandedDriverCardIds.has(driver.id)
                      const initials = overviewDriverInitials(driver)

                      const avatar = (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: 15,
                            fontWeight: 700,
                            fontFamily: '"Work Sans", sans-serif',
                            flexShrink: 0,
                          }}
                          aria-hidden
                        >
                          {initials}
                        </div>
                      )

                      if (collapsedAccordion) {
                        return (
                          <div
                            key={driver.id}
                            role="button"
                            tabIndex={0}
                            aria-expanded={false}
                            onClick={() => toggleDriverCardExpanded(driver.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleDriverCardExpanded(driver.id)
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '12px 14px',
                              border: driverPalette.line,
                              borderRadius: 12,
                              backgroundColor: driverPalette.card,
                              cursor: 'pointer',
                              fontFamily: '"Work Sans", sans-serif',
                              outline: 'none',
                            }}
                          >
                            {avatar}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 'clamp(16px, 2.8vw, 18px)',
                                fontWeight: 600,
                                color: 'var(--bw-text)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {driver.first_name} {driver.last_name}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <span style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: driver.is_active ? '#10b981' : '#d97706',
                              }} aria-hidden />
                              <span style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: driver.is_active ? '#10b981' : '#d97706',
                              }}>
                                {driver.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <CaretRight size={20} color="var(--bw-muted)" aria-hidden />
                          </div>
                        )
                      }

                      return (
                        <div
                          key={driver.id}
                          style={{
                            border: driverPalette.line,
                            borderRadius: 'clamp(8px, 1.5vw, 12px)',
                            padding: 'clamp(16px, 3vw, 20px)',
                            backgroundColor: driverPalette.card,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 10,
                              marginBottom: 14,
                              position: 'relative',
                            }}
                          >
                            {avatar}
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                                paddingRight: 36,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'baseline',
                                  gap: '6px 8px',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 'clamp(17px, 3vw, 20px)',
                                    fontWeight: 600,
                                    color: 'var(--bw-text)',
                                    fontFamily: '"Work Sans", sans-serif',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {driver.first_name} {driver.last_name}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase' as const,
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    flexShrink: 0,
                                    fontFamily: '"Work Sans", sans-serif',
                                    ...(inHouse
                                      ? {
                                          color: '#ddd6fe',
                                          backgroundColor: 'rgba(124, 58, 237, 0.28)',
                                          border: '1px solid rgba(124, 58, 237, 0.45)',
                                        }
                                      : {
                                          color: driverPalette.statsLabel,
                                          backgroundColor: driverPalette.contactPill,
                                          border: driverPalette.line,
                                        }),
                                  }}
                                >
                                  {tenantDriverTypeLabel(driver.driver_type)}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 'clamp(13px, 2vw, 14px)',
                                  color: 'var(--bw-muted)',
                                  fontFamily: '"Work Sans", sans-serif',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={driver.email}
                              >
                                {driver.email}
                              </div>
                            </div>

                            <div className="tenant-driver-card-menu" style={{ position: 'absolute', right: 0, top: 0 }}>
                              <button
                                type="button"
                                aria-label="Driver actions"
                                aria-expanded={driverCardMenuOpenId === driver.id}
                                aria-haspopup="menu"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDriverCardMenuOpenId(driverCardMenuOpenId === driver.id ? null : driver.id)
                                }}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--bw-muted)',
                                  padding: 6,
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <DotsThreeVertical size={22} weight="bold" aria-hidden />
                              </button>
                              {driverCardMenuOpenId === driver.id ? (
                                <div
                                  role="menu"
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 'calc(100% + 6px)',
                                    minWidth: 200,
                                    zIndex: 20,
                                    borderRadius: 8,
                                    border: driverPalette.line,
                                    backgroundColor: lightMode ? '#ffffff' : '#1a1a24',
                                    boxShadow: lightMode ? '0 10px 30px rgba(15,23,42,0.12)' : '0 12px 32px rgba(0,0,0,0.45)',
                                    padding: 6,
                                    fontFamily: '"Work Sans", sans-serif',
                                  }}
                                >
                                  <button type="button" role="menuitem" className="tenant-driver-card-menu"
                                    style={{
                                      display: 'block', width: '100%', textAlign: 'left' as const, padding: '10px 10px',
                                      border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer',
                                      color: 'var(--bw-text)', fontSize: 14,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setDriverCardMenuOpenId(null)
                                      handleDriverClick(driver.id)
                                    }}
                                  >
                                    Driver details
                                  </button>
                                  <button type="button" role="menuitem" className="tenant-driver-card-menu"
                                    style={{
                                      display: 'block', width: '100%', textAlign: 'left' as const, padding: '10px 10px',
                                      border: 'none', borderRadius: 6, background: 'transparent', cursor: 'pointer',
                                      color: 'var(--bw-text)', fontSize: 14,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openDriverRideHistory(driver)
                                    }}
                                  >
                                    View ride history
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {telHref ? (
                            <a
                              href={telHref}
                              onClick={(e) => e.stopPropagation()}
                              className="tenant-driver-card-menu"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                                marginBottom: 14,
                                textDecoration: 'none',
                                color: 'var(--bw-text)',
                                fontFamily: '"Work Sans", sans-serif',
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <Phone size={18} weight="bold" style={{ flexShrink: 0, color: 'var(--bw-muted)' }} aria-hidden />
                                <span style={{ fontWeight: 600, fontSize: 'clamp(15px, 2vw, 16px)' }}>{driver.phone_no}</span>
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--bw-muted)', fontWeight: 500, flexShrink: 0 }}>
                                Tap to call
                              </span>
                            </a>
                          ) : (
                            <div
                              style={{
                                marginBottom: 14,
                                color: 'var(--bw-muted)',
                                fontSize: 14,
                                fontFamily: '"Work Sans", sans-serif',
                              }}
                            >
                              No phone number
                            </div>
                          )}

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              columnGap: 'clamp(10px, 2vw, 14px)',
                              rowGap: 8,
                              marginBottom: 12,
                              fontFamily: '"Work Sans", sans-serif',
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase' as const,
                                color: driverPalette.statsLabel,
                              }}
                            >
                              Status
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase' as const,
                                color: driverPalette.statsLabel,
                              }}
                            >
                              Rides
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <span
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: driver.is_active ? '#10b981' : '#d97706',
                                  flexShrink: 0,
                                }}
                                aria-hidden
                              />
                              <span
                                style={{
                                  fontSize: 'clamp(15px, 2vw, 17px)',
                                  fontWeight: 600,
                                  color: 'var(--bw-text)',
                                }}
                              >
                                {driver.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0 6px' }}>
                              <span
                                style={{
                                  fontSize: 'clamp(20px, 4vw, 24px)',
                                  fontWeight: 700,
                                  color: 'var(--bw-text)',
                                  lineHeight: 1,
                                }}
                              >
                                {driver.completed_rides}
                              </span>
                              <span
                                style={{
                                  fontSize: 'clamp(12px, 1.8vw, 13px)',
                                  color: driverPalette.statsLabel,
                                  fontWeight: 500,
                                }}
                              >
                                completed
                              </span>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 'clamp(12px, 1.8vw, 13px)',
                            fontFamily: '"Work Sans", sans-serif',
                            fontWeight: 500,
                            marginBottom: 14,
                            color: verified ? '#10b981' : '#d97706',
                          }}>
                            {verified ? (
                              <>
                                <ShieldCheck size={18} weight="duotone" aria-hidden />
                                Registration verified
                              </>
                            ) : (
                              <>
                                <WarningCircle size={18} weight="fill" aria-hidden />
                                Registration pending
                              </>
                            )}
                          </div>

                          {unapproved ? (
                            <button
                              type="button"
                              className="btn btn-primary btn-block"
                              disabled={approvingDriverId === driver.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                approveDriverAction(driver.id)
                              }}
                              style={{ marginBottom: inHouse ? 8 : 0 }}
                            >
                              <CheckCircle size={18} aria-hidden />
                              {approvingDriverId === driver.id ? 'Approving...' : 'Approve'}
                            </button>
                          ) : null}
                          {inHouse ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-block"
                              onClick={(e) => {
                                e.stopPropagation()
                                openAssignVehicleToDriver(driver.id)
                              }}
                            >
                              <Car size={18} aria-hidden />
                              Assign vehicle
                            </button>
                          ) : null}
                          {useCompressedDriverCards ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDriverCardExpanded(driver.id)
                              }}
                              style={{
                                marginTop: 10,
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${lightMode ? '#cbd5e1' : 'rgba(255,255,255,0.12)'}`,
                                borderRadius: 8,
                                backgroundColor: 'transparent',
                                color: 'var(--bw-muted)',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >
                              Collapse
                            </button>
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </div>
              ) : (
                <div className="bw-table">
                  <div
                    className="bw-table-header"
                    role="row"
                    style={{
                      gridTemplateColumns: driversTableGridColumns,
                      display: 'grid',
                      gap: 16,
                      padding: '16px 24px',
                      alignItems: 'center',
                    }}
                  >
                    <span role="columnheader">Driver</span>
                    <span role="columnheader">Contact</span>
                    <span role="columnheader">Type</span>
                    <span role="columnheader">Status</span>
                    <span role="columnheader">Registration</span>
                    <span role="columnheader" style={{ justifySelf: 'end' }}>
                      Rides
                    </span>
                    <span aria-hidden />
                  </div>
                  {drivers.length === 0 ? (
                    <div className="bw-empty-state">
                      <div className="bw-empty-icon">
                        <User size={32} />
                      </div>
                      <div className="bw-empty-text">No drivers yet</div>
                      <div className="bw-empty-subtext" style={{ marginBottom: 16 }}>Add your first driver to start assigning rides.</div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setShowAddDriver(true)}
                      >
                        <Plus size={18} aria-hidden />
                        Add Driver
                      </button>
                    </div>
                  ) : filteredDriversForList.length === 0 ? (
                    <div className="bw-empty-state">
                      <div className="bw-empty-text">No matching drivers</div>
                      <div className="bw-empty-subtext">Try adjusting search or filters</div>
                    </div>
                  ) : (
                    filteredDriversForList.map((driver) => (
                      <div
                        key={driver.id}
                        role="row"
                        className="bw-table-row tenant-driver-table-row"
                        onClick={() => handleDriverClick(driver.id)}
                        style={{
                          cursor: 'pointer',
                          display: 'grid',
                          gridTemplateColumns: driversTableGridColumns,
                          gap: 16,
                          padding: '16px 24px',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          role="gridcell"
                          title={`${driver.first_name} ${driver.last_name}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            minWidth: 0,
                          }}
                        >
                          <span
                            aria-hidden
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              backgroundColor: '#7c3aed',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: 14,
                              fontWeight: 700,
                              flexShrink: 0,
                              fontFamily: '"Work Sans", sans-serif',
                            }}
                          >
                            {overviewDriverInitials(driver)}
                          </span>
                          <span style={{ minWidth: 0, display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
                            <span className="bw-user-name" style={{ display: 'block' }}>
                              {driver.first_name} {driver.last_name}
                            </span>
                            <span className="bw-user-email" style={{ display: 'block' }}>
                              {driver.email}
                            </span>
                          </span>
                        </span>
                        <span
                          role="gridcell"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontFamily: '"Work Sans", sans-serif',
                            color: 'var(--bw-muted)',
                          }}
                        >
                          <Phone size={12} aria-hidden /> {driver.phone_no}
                        </span>
                        <span role="gridcell">
                          <span
                            className={`bw-badge ${driver.driver_type === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`}
                            style={{ fontSize: 11, padding: '3px 8px', fontWeight: 600, display: 'inline-block' }}
                          >
                            {tenantDriverTypeLabel(driver.driver_type)}
                          </span>
                        </span>
                        <span role="gridcell">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '5px 11px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: '"Work Sans", sans-serif',
                              backgroundColor: driver.is_active ? 'rgba(16,185,129,0.14)' : 'rgba(217,119,6,0.14)',
                              color: driver.is_active ? '#10b981' : '#d97706',
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: driver.is_active ? '#10b981' : '#d97706',
                              }}
                              aria-hidden
                            />
                            {driver.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                        <span role="gridcell">
                          {driver.is_registered === 'registered' ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 13,
                                fontFamily: '"Work Sans", sans-serif',
                                fontWeight: 500,
                                color: '#10b981',
                              }}
                            >
                              <ShieldCheck size={18} weight="duotone" aria-hidden /> Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 13,
                                fontFamily: '"Work Sans", sans-serif',
                                fontWeight: 500,
                                color: '#d97706',
                              }}
                            >
                              <WarningCircle size={18} weight="fill" aria-hidden /> Pending
                            </span>
                          )}
                        </span>
                        <span
                          role="gridcell"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            justifyContent: 'flex-end',
                            justifySelf: 'end',
                            gap: 6,
                            width: '100%',
                            fontFamily: '"Work Sans", sans-serif',
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{driver.completed_rides}</span>{' '}
                          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--bw-muted)' }}>rides</span>
                        </span>
                        <span
                          role="gridcell"
                          style={{
                            justifySelf: 'end',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end',
                            gap: 8,
                            minWidth: 0,
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {!driver.is_active && driver.is_registered !== 'registered' ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={approvingDriverId === driver.id}
                              onClick={() => approveDriverAction(driver.id)}
                            >
                              <CheckCircle size={16} aria-hidden />
                              {approvingDriverId === driver.id ? 'Approving...' : 'Approve'}
                            </button>
                          ) : null}
                          {driver.driver_type === 'in_house' ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => openAssignVehicleToDriver(driver.id)}
                            >
                              <Car size={16} aria-hidden />
                              Assign vehicle
                            </button>
                          ) : null}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
          </>
        )}

        {/* Add Driver Modal */}
      {showAddDriver && (
        <div className="bw-modal-overlay" onClick={() => {
          setShowAddDriver(false)
          setAddDriverError(null)
          setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
            <div className="bw-modal-header">
              <h3 style={{ 
                margin: 0, 
                fontFamily: 'DM Sans, sans-serif', 
                fontSize: '28px', 
                fontWeight: 200, 
                color: 'var(--bw-text)' 
              }}>
                Add New Driver
              </h3>
              <button className="bw-btn-icon" onClick={() => {
                setShowAddDriver(false)
                setAddDriverError(null)
                setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
              }}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="bw-modal-body">
              <p className="small-muted" style={{ 
                margin: '0 0 24px 0', 
                fontFamily: 'Work Sans, sans-serif', 
                fontSize: '16px', 
                fontWeight: 300, 
                color: 'var(--bw-muted)' 
              }}>
                Enter the driver's information to send them a registration invitation.
              </p>
              
              {addDriverError && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: '24px',
                  backgroundColor: 'rgba(197, 72, 61, 0.1)',
                  border: '1px solid var(--bw-error)',
                  borderRadius: '8px',
                  color: 'var(--bw-error)',
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {addDriverError}
                </div>
              )}
              
              <div className="bw-form-grid">
                <div className="bw-form-group">
                  <label className="small-muted" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: '13px', 
                    color: 'var(--bw-muted)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    First Name
                  </label>
                  <input 
                    className="bw-input" 
                    value={newDriver.first_name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewDriver({ ...newDriver, first_name: e.target.value })
                      setAddDriverError(null)
                    }}
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '16px',
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-field)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="bw-form-group">
                  <label className="small-muted" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: '13px', 
                    color: 'var(--bw-muted)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Last Name
                  </label>
                  <input 
                    className="bw-input" 
                    value={newDriver.last_name} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewDriver({ ...newDriver, last_name: e.target.value })
                      setAddDriverError(null)
                    }}
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '16px',
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-field)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="bw-form-group">
                  <label className="small-muted" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: '13px', 
                    color: 'var(--bw-muted)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input 
                    className="bw-input" 
                    type="email" 
                    value={newDriver.email} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewDriver({ ...newDriver, email: e.target.value })
                      setAddDriverError(null)
                    }}
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '16px',
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-field)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div className="bw-form-group">
                  <label className="small-muted" style={{ 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontSize: '13px', 
                    color: 'var(--bw-muted)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Driver Type
                  </label>
                  <select 
                    className="bw-input" 
                    value={newDriver.driver_type} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setNewDriver({ ...newDriver, driver_type: e.target.value as OnboardDriver['driver_type'] })
                      setAddDriverError(null)
                    }}
                    style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '16px',
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-field)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="outsourced">Outsourced</option>
                    <option value="in_house">In-House</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bw-modal-footer">
              <button
                type="button"
                className={`btn btn-secondary${isMobile ? ' btn-block' : ''}`}
                onClick={() => {
                  setShowAddDriver(false)
                  setAddDriverError(null)
                  setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-primary${isMobile ? ' btn-block' : ''}`}
                onClick={createDriver}
                disabled={isCreatingDriver}
              >
                {isCreatingDriver ? 'Adding...' : 'Create Driver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign vehicle to in-house driver (from Drivers tab) */}
      {showAssignVehicleToDriver && assignVehicleToDriverId != null && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!isAssigning) {
            setShowAssignVehicleToDriver(false)
            setAssignVehicleToDriverId(null)
            setSelectedVehicleIdForDriverAssign('')
            setAssignVehicleToDriverError(null)
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
                fontFamily: '"Work Sans", sans-serif',
                color: '#10b981'
              }}>
                Assign vehicle
              </h3>
              <button
                className="bw-btn-icon"
                onClick={() => {
                  if (!isAssigning) {
                    setShowAssignVehicleToDriver(false)
                    setAssignVehicleToDriverId(null)
                    setSelectedVehicleIdForDriverAssign('')
                    setAssignVehicleToDriverError(null)
                  }
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
                disabled={isAssigning}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--bw-bg-secondary)',
                  borderRadius: '6px',
                  border: '1px solid var(--bw-border)'
                }}>
                  <WarningCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', color: 'var(--bw-text)' }}>
                    Select an available vehicle to assign to this driver.
                  </div>
                </div>
                {drivers.find((d) => d.id === assignVehicleToDriverId) && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--bw-border)',
                    fontSize: '13px'
                  }}>
                    <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Driver</div>
                    <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                      {drivers.find((d) => d.id === assignVehicleToDriverId)?.first_name}{' '}
                      {drivers.find((d) => d.id === assignVehicleToDriverId)?.last_name}
                    </div>
                  </div>
                )}
                <div className="bw-form-group">
                  <label>Select vehicle</label>
                  <select
                    value={selectedVehicleIdForDriverAssign}
                    onChange={(e) => setSelectedVehicleIdForDriverAssign(e.target.value)}
                    className="bw-input"
                    disabled={isAssigning}
                    style={{ color: '#374151', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Choose a vehicle</option>
                    {vehicles
                      .filter((v) => !v.driver)
                      .map((v) => (
                        <option key={v.id} value={v.id} style={{ color: '#374151', backgroundColor: '#ffffff' }}>
                          {v.year} {v.make} {v.model}
                          {v.license_plate ? ` — ${v.license_plate}` : ''}
                        </option>
                      ))}
                  </select>
                </div>
                {vehicles.filter((v) => !v.driver).length === 0 && (
                  <div style={{ fontSize: '13px', color: 'var(--bw-muted)' }}>
                    No unassigned vehicles. Unassign a vehicle on the Vehicles tab or add a new vehicle first.
                  </div>
                )}
                {assignVehicleToDriverError && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                    fontSize: '13px',
                    color: '#ef4444'
                  }}>
                    {assignVehicleToDriverError}
                  </div>
                )}
              </div>
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)',
              flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}>
              <button
                type="button"
                className={`btn btn-secondary${isMobile ? ' btn-block' : ''}`}
                onClick={() => {
                  if (!isAssigning) {
                    setShowAssignVehicleToDriver(false)
                    setAssignVehicleToDriverId(null)
                    setSelectedVehicleIdForDriverAssign('')
                    setAssignVehicleToDriverError(null)
                  }
                }}
                disabled={isAssigning}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-primary${isMobile ? ' btn-block' : ''}`}
                onClick={confirmAssignVehicleToDriver}
                disabled={isAssigning || !selectedVehicleIdForDriverAssign}
              >
                {isAssigning ? 'Assigning...' : 'Assign vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Driver Details Modal */}
      {showDriverDetails && (
        <div className="bw-modal-overlay" onClick={() => {
          setShowDriverDetails(false)
          setSelectedDriver(null)
        }}>
          <div className="bw-modal" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} style={{
            maxWidth: '600px',
            width: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto'
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
                Driver Details
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  setShowDriverDetails(false)
                  setSelectedDriver(null)
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="bw-modal-body" style={{
              padding: 'clamp(16px, 2.5vw, 24px)',
              fontFamily: '"Work Sans", sans-serif',
              fontWeight: 300
            }}>
              {loadingDriverDetails ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--bw-muted)' }}>Loading driver details...</div>
                </div>
              ) : selectedDriver ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.5vw, 24px)' }}>
                  {/* Driver ID and Status */}
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
                        Driver ID
                      </div>
                      <div style={{
                        fontSize: 'clamp(18px, 2.5vw, 24px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        #{selectedDriver.id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={`bw-badge ${selectedDriver.is_active ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontWeight: 300,
                        textTransform: 'capitalize'
                      }}>
                        {selectedDriver.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`bw-badge ${selectedDriver.is_registered === 'registered' ? 'bw-badge-success' : 'bw-badge-warning'}`} style={{
                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                        fontWeight: 300,
                        textTransform: 'capitalize'
                      }}>
                        {selectedDriver.is_registered === 'registered' ? 'Registered' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {!selectedDriver.is_active && selectedDriver.is_registered !== 'registered' && (
                    <div style={{ paddingBottom: 'clamp(12px, 2vw, 16px)', borderBottom: '1px solid var(--bw-border)' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        disabled={approvingDriverId === selectedDriver.id}
                        onClick={() => approveDriverAction(selectedDriver.id)}
                      >
                        <CheckCircle size={18} aria-hidden />
                        {approvingDriverId === selectedDriver.id ? 'Approving...' : 'Approve driver'}
                      </button>
                      {approveDriverError && (
                        <div role="alert" style={{ marginTop: 8, fontSize: 13, color: 'var(--bw-error)' }}>
                          {approveDriverError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personal Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Personal Information
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
                          Full Name
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.first_name} {selectedDriver.last_name}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Email
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.email || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Phone Number
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.phone_no || 'N/A'}
                        </div>
                      </div>
                      {selectedDriver.state && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            State
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.state}
                          </div>
                        </div>
                      )}
                      {selectedDriver.postal_code && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            Postal Code
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.postal_code}
                          </div>
                        </div>
                      )}
                      {selectedDriver.license_number && (
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            License Number
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.license_number}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver Information */}
                  <div>
                    <h4 style={{
                      margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                      fontSize: 'clamp(14px, 2vw, 18px)',
                      fontWeight: 400,
                      color: 'var(--bw-text)'
                    }}>
                      Driver Information
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
                          Driver Type
                        </div>
                        <div>
                          <span className={`bw-badge ${selectedDriver.driver_type === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`} style={{
                            fontSize: 'clamp(12px, 1.5vw, 14px)',
                            fontWeight: 300,
                            textTransform: 'capitalize'
                          }}>
                            {selectedDriver.driver_type === 'in_house' ? 'In-House' : 'Outsourced'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Role
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.role || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Status
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.status || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: 'clamp(11px, 1.3vw, 13px)',
                          color: 'var(--bw-muted)',
                          marginBottom: '4px'
                        }}>
                          Completed Rides
                        </div>
                        <div style={{
                          fontSize: 'clamp(13px, 1.5vw, 15px)',
                          color: 'var(--bw-text)'
                        }}>
                          {selectedDriver.completed_rides || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  {selectedDriver.vehicle && (
                    <div>
                      <h4 style={{
                        margin: '0 0 clamp(8px, 1.5vw, 12px) 0',
                        fontSize: 'clamp(14px, 2vw, 18px)',
                        fontWeight: 400,
                        color: 'var(--bw-text)'
                      }}>
                        Assigned Vehicle
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'clamp(8px, 1.5vw, 12px)',
                        padding: 'clamp(12px, 2vw, 16px)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        borderRadius: '6px',
                        border: '1px solid var(--bw-border)'
                      }}>
                        <div>
                          <div style={{
                            fontSize: 'clamp(11px, 1.3vw, 13px)',
                            color: 'var(--bw-muted)',
                            marginBottom: '4px'
                          }}>
                            Make & Model
                          </div>
                          <div style={{
                            fontSize: 'clamp(13px, 1.5vw, 15px)',
                            color: 'var(--bw-text)'
                          }}>
                            {selectedDriver.vehicle.make} {selectedDriver.vehicle.model}
                          </div>
                        </div>
                        {selectedDriver.vehicle.year && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Year
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.year}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.license_plate && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              License Plate
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.license_plate}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.color && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Color
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.color}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.seating_capacity && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Seating Capacity
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.seating_capacity}
                            </div>
                          </div>
                        )}
                        {selectedDriver.vehicle.status && (
                          <div>
                            <div style={{
                              fontSize: 'clamp(11px, 1.3vw, 13px)',
                              color: 'var(--bw-muted)',
                              marginBottom: '4px'
                            }}>
                              Vehicle Status
                            </div>
                            <div style={{
                              fontSize: 'clamp(13px, 1.5vw, 15px)',
                              color: 'var(--bw-text)'
                            }}>
                              {selectedDriver.vehicle.status}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div style={{
                    paddingTop: 'clamp(12px, 2vw, 16px)',
                    borderTop: '1px solid var(--bw-border)',
                    fontSize: 'clamp(11px, 1.3vw, 13px)',
                    color: 'var(--bw-muted)'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      Created: {selectedDriver.created_on ? new Date(selectedDriver.created_on).toLocaleString() : 'N/A'}
                    </div>
                    {selectedDriver.updated_on && (
                      <div>
                        Updated: {new Date(selectedDriver.updated_on).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ color: 'var(--bw-muted)' }}>No driver details available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
