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

export default function VehiclesTab() {
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
        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="bw-content">
            <div className="bw-content-header" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'flex-end',
              alignItems: isMobile ? 'flex-start' : 'center',
              marginBottom: 'clamp(16px, 3vw, 24px)',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 'clamp(8px, 1.5vw, 12px)',
                width: isMobile ? '100%' : 'auto'
              }}>
                <div 
                  style={{
                    position: 'relative',
                    marginLeft: isMobile ? 0 : 16,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <button
                    type="button"
                    className={`btn btn-primary${isMobile ? ' btn-block' : ''}`}
                    onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
                  >
                    <Plus size={18} />
                    Add Vehicle
                  </button>
                  
                  {showAddVehicleForm && (
                    <>
                      {isMobile && (
                        <div
                          style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 999
                          }}
                          onClick={() => {
                            if (!addingVehicle && !addVehicleSuccess) {
                              setShowAddVehicleForm(false)
                            }
                          }}
                        />
                      )}
                      <div 
                        style={{
                          position: isMobile ? 'fixed' : 'absolute',
                          top: isMobile ? '50%' : '100%',
                          left: isMobile ? '50%' : 'auto',
                          right: isMobile ? 'auto' : 0,
                          transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                          marginTop: isMobile ? 0 : '8px',
                          width: isMobile ? '90vw' : '500px',
                          maxWidth: '90vw',
                          backgroundColor: 'var(--bw-bg)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '8px',
                          padding: '24px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          zIndex: 1000,
                          maxHeight: '80vh',
                          overflowY: 'auto'
                        }}
                      >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                      }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '20px',
                          fontWeight: 600,
                          fontFamily: '"Work Sans", sans-serif',
                          color: 'var(--bw-text)'
                        }}>Add New Vehicle</h4>
                        <button
                          onClick={() => {
                            setShowAddVehicleForm(false)
                            setAddVehicleError(null)
                            setAddVehicleSuccess(false)
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
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--bw-text)'
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {addVehicleSuccess && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: '#d1fae5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '4px',
                          color: '#065f46',
                          fontSize: '14px',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Vehicle added successfully!
                        </div>
                      )}

                      {addVehicleError && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          color: '#dc2626',
                          fontSize: '14px',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          {addVehicleError}
                        </div>
                      )}

                      <form onSubmit={handleAddVehicle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Make *
                              </label>
                              <select
                                value={newVehicle.make}
                                onChange={(e) => handleNewVehicleChange('make', e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              >
                                <option value="">Select Make</option>
                                {vehicleMakes.map((make: string) => (
                                  <option key={make} value={make}>{make}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                className="small-muted"
                                style={{
                                  display: 'block',
                                  marginBottom: '8px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '13px',
                                  color: 'var(--bw-muted)',
                                }}
                              >
                                Model *
                              </label>
                              <select
                                value={newVehicle.model}
                                onChange={(e) => handleNewVehicleChange('model', e.target.value)}
                                required
                                disabled={!newVehicle.make}
                                style={{
                                  width: '100%',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)',
                                  opacity: !newVehicle.make ? 0.5 : 1
                                }}
                              >
                                <option value="">
                                  {newVehicle.make ? 'Select Model' : 'Select Make First'}
                                </option>
                                {newVehicle.make && getVehicleModels(newVehicle.make).map((model: string) => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Year
                              </label>
                              <input
                                type="number"
                                value={newVehicle.year}
                                onChange={(e) => handleNewVehicleChange('year', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                maxLength={4}
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                License Plate
                              </label>
                              <input
                                type="text"
                                value={newVehicle.license_plate}
                                onChange={(e) => handleNewVehicleChange('license_plate', e.target.value)}
                                maxLength={8}
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Color
                              </label>
                              <input
                                type="text"
                                value={newVehicle.color}
                                onChange={(e) => handleNewVehicleChange('color', e.target.value)}
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                            <div>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Seating Capacity
                              </label>
                              <input
                                type="number"
                                className="bw-input"
                                value={newVehicle.seating_capacity}
                                onChange={(e) => handleNewVehicleChange('seating_capacity', e.target.value)}
                                min="1"
                                max="50"
                                placeholder="e.g. 4"
                                style={{
                                  width: 'calc(10ch + 36px)',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="small-muted" style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontFamily: '"Work Sans", sans-serif',
                              fontSize: '13px',
                              color: 'var(--bw-muted)'
                            }}>
                              Vehicle Category *
                            </label>
                            <select
                              value={newVehicle.vehicle_category}
                              onChange={(e) => handleNewVehicleChange('vehicle_category', e.target.value)}
                              required
                              style={{
                                width: '100%',
                                padding: '16px 18px 16px 18px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '14px',
                                border: '1px solid var(--bw-border)',
                                borderRadius: 'var(--radius-field)',
                                backgroundColor: 'var(--bw-bg)',
                                color: 'var(--bw-text)'
                              }}
                            >
                              <option value="">Select Category</option>
                              {vehicleCategories.map((category) => (
                                <option key={category.id} value={category.vehicle_category}>
                                  {category.vehicle_category}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            alignItems: 'end'
                          }}>
                            <div style={{ minWidth: 0 }}>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Flat Rate ($) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={newVehicle.vehicle_flat_rate}
                                onChange={(e) => handleNewVehicleChange('vehicle_flat_rate', e.target.value)}
                                required
                                min="0"
                                style={{
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <label className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Status
                              </label>
                              <select
                                value={newVehicle.status}
                                onChange={(e) => handleNewVehicleChange('status', e.target.value)}
                                style={{
                                  width: '100%',
                                  maxWidth: '100%',
                                  boxSizing: 'border-box',
                                  padding: '16px 18px 16px 18px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  fontSize: '14px',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'var(--radius-field)',
                                  backgroundColor: 'var(--bw-bg)',
                                  color: 'var(--bw-text)'
                                }}
                              >
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                                <option value="maintenance">Maintenance</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button
                              type="submit"
                              disabled={addingVehicle}
                              className="btn btn-primary"
                              style={{ flex: 1 }}
                            >
                              {addingVehicle ? 'Adding...' : 'Add Vehicle'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddVehicleForm(false)
                                setAddVehicleError(null)
                                setAddVehicleSuccess(false)
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
                              }}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <div className="bw-card" style={{
                padding: 'clamp(16px, 3vw, 24px)',
                border: '1px solid var(--bw-border)',
                borderRadius: '12px'
              }}>
                <div className="bw-empty-state" style={{
                  padding: 'clamp(24px, 4vw, 48px)',
                  textAlign: 'center'
                }}>
                  <div className="bw-empty-icon" style={{
                    marginBottom: 'clamp(12px, 2vw, 16px)',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Car size={32} style={{
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
                  }}>No vehicles yet</div>
                  <div className="bw-empty-subtext" style={{
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    color: 'var(--bw-muted)',
                    fontFamily: '"Work Sans", sans-serif',
                    marginBottom: 'clamp(16px, 2.5vw, 24px)'
                  }}>Add vehicles to your fleet to start accepting bookings</div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowAddVehicleForm(true)}
                  >
                    <Plus size={18} />
                    Add Vehicle
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="bw-vehicle-grid"
                style={{
                  display: 'grid',
                  gap: 'clamp(16px, 3vw, 24px)'
                }}
              >
                {vehicles.map((vehicle) => {
                  // Get the first available image from vehicle_images
                  const firstImage = vehicle.vehicle_images 
                    ? Object.values(vehicle.vehicle_images)[0] 
                    : null
                  
                  // Get category name from vehicle response
                  const category = vehicle.vehicle_category?.vehicle_category || 'N/A'
                  
                  const isHovered = hoveredVehicleCardId === vehicle.id
                  
                  return (
                    <div 
                      key={vehicle.id} 
                      className="bw-card"
                      style={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        padding: 0,
                        aspectRatio: '1',
                        width: '100%',
                        border: '1px solid var(--bw-border)',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        transition: 'none'
                      }}
                      onMouseEnter={() => setHoveredVehicleCardId(vehicle.id)}
                      onMouseLeave={() => setHoveredVehicleCardId(null)}
                      onClick={() => {
                        setEditingVehicleId(vehicle.id)
                        setShowVehicleEditModal(true)
                      }}
                    >
                      {/* Vehicle Image - Always visible */}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {firstImage ? (
                          <img 
                            src={firstImage} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Car size={48} style={{ 
                            width: 'clamp(32px, 5vw, 48px)',
                            height: 'clamp(32px, 5vw, 48px)',
                            color: 'var(--bw-disabled)', 
                            opacity: 0.5 
                          }} />
                        )}
                      </div>
                      
                      {/* Description Overlay - Slides up on hover to cover entire card */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        top: isHovered ? 0 : undefined,
                        height: isHovered ? '100%' : 'auto',
                        maxHeight: isHovered ? '100%' : undefined,
                        boxSizing: 'border-box',
                        backgroundColor: 'var(--bw-bg-secondary)',
                        borderTop: '1px solid var(--bw-border)',
                        padding: isHovered ? 'clamp(12px, 3vw, 20px) clamp(12px, 2.5vw, 20px)' : 'clamp(16px, 3vw, 24px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(12px, 2vw, 16px)',
                        justifyContent: isHovered ? 'center' : 'flex-start',
                        alignItems: isHovered ? 'center' : 'stretch',
                        textAlign: isHovered ? 'center' : 'left',
                        overflowY: isHovered ? 'auto' : 'hidden',
                        WebkitOverflowScrolling: 'touch',
                        zIndex: 2
                      }}>
                        {/* Default View — removed from layout on hover so the detail panel stays centered */}
                        <div style={{
                          display: isHovered ? 'none' : 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(8px, 1.5vw, 12px)',
                          width: '100%',
                          transition: 'opacity 0.2s ease',
                          pointerEvents: isHovered ? 'none' : 'auto'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(8px, 1.5vw, 12px)',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{
                              fontSize: isMobile ? 'clamp(18px, 3vw, 22px)' : '16px',
                              fontWeight: 600,
                              color: 'var(--bw-text)',
                              lineHeight: 1.3,
                              fontFamily: '"Work Sans", sans-serif',
                              flex: 1
                            }}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            {/* Driver Status Indicator */}
                            <div
                              style={{
                                width: isMobile ? 'clamp(12px, 2vw, 14px)' : '12px',
                                height: isMobile ? 'clamp(12px, 2vw, 14px)' : '12px',
                                borderRadius: '50%',
                                backgroundColor: vehicle.driver ? 'var(--bw-accent)' : '#10b981',
                                flexShrink: 0,
                                border: '2px solid var(--bw-bg)',
                                boxShadow: '0 0 0 1px var(--bw-border)',
                                cursor: 'help',
                                position: 'relative'
                              }}
                              onMouseEnter={() => setTooltipVehicleId(vehicle.id)}
                              onMouseLeave={() => setTooltipVehicleId(null)}
                            >
                              {tooltipVehicleId === vehicle.id && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '100%',
                                  right: 0,
                                  marginBottom: '8px',
                                  padding: 'clamp(6px, 1vw, 8px) clamp(10px, 1.5vw, 12px)',
                                  backgroundColor: 'var(--bw-bg-secondary)',
                                  border: '1px solid var(--bw-border)',
                                  borderRadius: 'clamp(4px, 1vw, 6px)',
                                  fontSize: isMobile ? 'clamp(12px, 1.5vw, 13px)' : '13px',
                                  fontFamily: '"Work Sans", sans-serif',
                                  color: 'var(--bw-text)',
                                  whiteSpace: 'nowrap',
                                  zIndex: 1000,
                                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                  pointerEvents: 'none'
                                }}>
                                  {vehicle.driver ? (vehicle.driver.full_name || 'Has Driver Assigned') : 'Not Assigned'}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Category and Driver Type */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(8px, 1.5vw, 12px)',
                            flexWrap: 'wrap'
                          }}>
                            <span className="bw-badge bw-badge-secondary" style={{
                              fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px',
                              padding: isMobile ? 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)' : '4px 8px',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {category}
                            </span>
                            
                            {/* Driver Type */}
                            {(vehicle.driver?.driver_type || vehicle.driver_type) && (
                              <span className={`bw-badge ${(vehicle.driver?.driver_type || vehicle.driver_type) === 'in_house' ? 'bw-badge-primary' : 'bw-badge-secondary'}`} style={{
                                fontSize: isMobile ? 'clamp(12px, 1.5vw, 14px)' : '13px',
                                padding: isMobile ? 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)' : '4px 8px',
                                fontFamily: '"Work Sans", sans-serif'
                              }}>
                                {(vehicle.driver?.driver_type || vehicle.driver_type) === 'in_house' ? 'In-House' : 'Outsourced'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover View - Full Details and Buttons */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'clamp(12px, 2vw, 18px)',
                          width: '100%',
                          maxWidth: '100%',
                          flexShrink: 0,
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity 0.2s ease 0.1s',
                          pointerEvents: isHovered ? 'auto' : 'none',
                          position: isHovered ? 'relative' : 'absolute',
                          top: isHovered ? 'auto' : 0,
                          left: isHovered ? 'auto' : 0,
                          right: isHovered ? 'auto' : 0,
                          alignItems: 'center',
                          textAlign: 'center'
                        }}>
                          {/* Vehicle Name */}
                          <div style={{
                            fontSize: isMobile ? 'clamp(20px, 3.5vw, 24px)' : '20px',
                            fontWeight: 600,
                            color: 'var(--bw-text)',
                            lineHeight: 1.3,
                            fontFamily: '"Work Sans", sans-serif',
                            textAlign: 'center'
                          }}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          
                          {/* Category */}
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span className="bw-badge bw-badge-secondary" style={{
                              fontSize: isMobile ? 'clamp(13px, 2vw, 15px)' : '14px',
                              padding: isMobile ? 'clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 18px)' : '6px 12px',
                              fontFamily: '"Work Sans", sans-serif'
                            }}>
                              {category}
                            </span>
                          </div>
                          
                          {/* License Plate */}
                          {vehicle.license_plate && (
                            <div style={{
                              fontSize: isMobile ? 'clamp(14px, 2.5vw, 16px)' : '15px',
                              color: 'var(--bw-muted)',
                              fontFamily: '"Work Sans", sans-serif',
                              textAlign: 'center'
                            }}>
                              <span style={{ fontWeight: 500 }}>License Plate:</span> {vehicle.license_plate}
                            </div>
                          )}
                          
                          {/* Driver Name */}
                          <div style={{
                            fontSize: isMobile ? 'clamp(14px, 2.5vw, 16px)' : '15px',
                            color: 'var(--bw-muted)',
                            fontFamily: '"Work Sans", sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(8px, 1.5vw, 12px)',
                            justifyContent: 'center',
                            textAlign: 'center'
                          }}>
                            <div
                              style={{
                                width: isMobile ? 'clamp(12px, 2vw, 14px)' : '12px',
                                height: isMobile ? 'clamp(12px, 2vw, 14px)' : '12px',
                                borderRadius: '50%',
                                backgroundColor: vehicle.driver ? 'var(--bw-accent)' : '#10b981',
                                flexShrink: 0,
                                border: '2px solid var(--bw-bg)',
                                boxShadow: '0 0 0 1px var(--bw-border)'
                              }}
                            />
                            <span style={{ fontWeight: 500 }}>Driver:</span> {vehicle.driver ? (vehicle.driver.full_name || 'Assigned') : 'Not Assigned'}
                          </div>
                          
                          {/* Assign/Unassign Driver Button */}
                          {vehicle.driver ? (
                            <div style={{ width: '100%' }}>
                              <button
                                type="button"
                                className="btn btn-destructive btn-block"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setUnassigningVehicleId(vehicle.id)
                                  setShowUnassignConfirm(true)
                                  setUnassignError(null)
                                }}
                              >
                                Unassign
                              </button>
                            </div>
                          ) : (
                            <div style={{ width: '100%' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-block"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setAssigningVehicleId(vehicle.id)
                                  setShowAssignConfirm(true)
                                  setSelectedDriverId('')
                                  setAssignError(null)
                                }}
                              >
                                Assign Driver
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Driver Status Info */}
            <div style={{
              marginTop: 'clamp(24px, 4vw, 32px)',
              padding: 'clamp(12px, 2vw, 16px)',
              backgroundColor: 'var(--bw-bg-secondary)',
              border: '1px solid var(--bw-border)',
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(12px, 2vw, 16px)'
            }}>
              <Info 
                size={isMobile ? 20 : 18} 
                style={{ 
                  color: 'var(--bw-muted)',
                  flexShrink: 0,
                  marginTop: '2px'
                }} 
              />
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(8px, 1.5vw, 12px)'
              }}>
                <div style={{
                  fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
                  fontWeight: 500,
                  color: 'var(--bw-text)',
                  fontFamily: '"Work Sans", sans-serif'
                }}>
                  Driver Status Indicators
                </div>
                <div style={{
                  fontSize: isMobile ? 'clamp(12px, 1.8vw, 14px)' : '13px',
                  color: 'var(--bw-muted)',
                  fontFamily: '"Work Sans", sans-serif',
                  lineHeight: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(6px, 1vw, 8px)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bw-accent)',
                      flexShrink: 0,
                      border: '2px solid var(--bw-bg)',
                      boxShadow: '0 0 0 1px var(--bw-border)'
                    }} />
                    <span>Indigo indicator means the vehicle has a driver assigned</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 12px)' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      flexShrink: 0,
                      border: '2px solid var(--bw-bg)',
                      boxShadow: '0 0 0 1px var(--bw-border)'
                    }} />
                    <span>Green indicator means the vehicle is available — no driver assigned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Vehicle Edit Modal */}
      {showVehicleEditModal && editingVehicleId && (
        <VehicleEditModal
          vehicleId={editingVehicleId}
          isOpen={showVehicleEditModal}
          onClose={() => {
            setShowVehicleEditModal(false)
            setEditingVehicleId(null)
          }}
          onVehicleUpdated={() => {
            // Refresh vehicles list after update
            load()
          }}
          onDelete={handleDeleteVehicle}
          onMobileAssignDriver={(id) => {
            setShowVehicleEditModal(false)
            setEditingVehicleId(null)
            setAssigningVehicleId(id)
            setShowAssignConfirm(true)
            setSelectedDriverId('')
            setAssignError(null)
          }}
          />
        )}


      {/* Delete Vehicle Confirmation Modal */}
      {showDeleteConfirm && deletingVehicleId && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!isDeleting) {
            setShowDeleteConfirm(false)
            setDeletingVehicleId(null)
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
                color: 'var(--bw-error, #C5483D)'
              }}>
                Delete Vehicle
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteConfirm(false)
                    setDeletingVehicleId(null)
                  }
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
                disabled={isDeleting}
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
                  <WarningCircle size={20} style={{ color: 'var(--bw-error, #C5483D)', flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', color: 'var(--bw-text)' }}>
                    Are you sure you want to delete this vehicle? This action cannot be undone.
                  </div>
                </div>
                {vehicles.find(v => v.id === deletingVehicleId) && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--bw-border)',
                    fontSize: '13px'
                  }}>
                    <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Vehicle Details:</div>
                    <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                      {vehicles.find(v => v.id === deletingVehicleId)?.year} {vehicles.find(v => v.id === deletingVehicleId)?.make} {vehicles.find(v => v.id === deletingVehicleId)?.model}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                type="button"
                className={`btn btn-secondary${isMobile ? ' btn-block' : ''}`}
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteConfirm(false)
                    setDeletingVehicleId(null)
                  }
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-destructive${isMobile ? ' btn-block' : ''}`}
                onClick={confirmDeleteVehicle}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Unassign Driver Confirmation Modal */}
      {showUnassignConfirm && unassigningVehicleId && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!isUnassigning) {
            setShowUnassignConfirm(false)
            setUnassigningVehicleId(null)
            setUnassignError(null)
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
                color: 'var(--bw-error)'
              }}>
                Unassign Driver
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  if (!isUnassigning) {
                    setShowUnassignConfirm(false)
                    setUnassigningVehicleId(null)
                    setUnassignError(null)
                  }
                }}
                style={{
                  padding: '8px',
                  minWidth: '32px',
                  minHeight: '32px'
                }}
                disabled={isUnassigning}
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
                  <WarningCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <div style={{ fontSize: '14px', color: 'var(--bw-text)' }}>
                    Are you sure you want to unassign the driver from this vehicle?
                  </div>
                </div>
                {vehicles.find(v => v.id === unassigningVehicleId) && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--bw-border)',
                    fontSize: '13px'
                  }}>
                    <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Vehicle Details:</div>
                    <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                      {vehicles.find(v => v.id === unassigningVehicleId)?.year} {vehicles.find(v => v.id === unassigningVehicleId)?.make} {vehicles.find(v => v.id === unassigningVehicleId)?.model}
                    </div>
                    {vehicles.find(v => v.id === unassigningVehicleId)?.driver && (
                      <>
                        <div style={{ color: 'var(--bw-muted)', marginTop: '8px', marginBottom: '4px' }}>Assigned Driver:</div>
                        <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                          {vehicles.find(v => v.id === unassigningVehicleId)?.driver?.full_name || 'Unknown'}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {unassignError && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                    fontSize: '13px',
                    color: '#ef4444'
                  }}>
                    {unassignError}
                  </div>
                )}
              </div>
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                type="button"
                className={`btn btn-secondary${isMobile ? ' btn-block' : ''}`}
                onClick={() => {
                  if (!isUnassigning) {
                    setShowUnassignConfirm(false)
                    setUnassigningVehicleId(null)
                    setUnassignError(null)
                  }
                }}
                disabled={isUnassigning}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-destructive${isMobile ? ' btn-block' : ''}`}
                onClick={() => confirmUnassignDriver(true)}
                disabled={isUnassigning}
              >
                {isUnassigning ? 'Unassigning...' : 'Unassign Driver'}
              </button>
            </div>
            </div>
          </div>
        )}


      {/* Assign Driver Confirmation Modal */}
      {showAssignConfirm && assigningVehicleId && (
        <div className="bw-modal-overlay" onClick={() => {
          if (!isAssigning) {
            setShowAssignConfirm(false)
            setAssigningVehicleId(null)
            setSelectedDriverId('')
            setAssignError(null)
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
                color: 'var(--bw-accent)'
              }}>
                Assign Driver
              </h3>
              <button 
                className="bw-btn-icon" 
                onClick={() => {
                  if (!isAssigning) {
                    setShowAssignConfirm(false)
                    setAssigningVehicleId(null)
                    setSelectedDriverId('')
                    setAssignError(null)
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
                    Select a driver to assign to this vehicle.
                  </div>
                </div>
                {vehicles.find(v => v.id === assigningVehicleId) && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--bw-border)',
                    fontSize: '13px'
                  }}>
                    <div style={{ color: 'var(--bw-muted)', marginBottom: '4px' }}>Vehicle Details:</div>
                    <div style={{ color: 'var(--bw-text)', fontWeight: 500 }}>
                      {vehicles.find(v => v.id === assigningVehicleId)?.year} {vehicles.find(v => v.id === assigningVehicleId)?.make} {vehicles.find(v => v.id === assigningVehicleId)?.model}
                    </div>
                  </div>
                )}
                <div className="bw-form-group">
                  <label>Select Driver</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="bw-input"
                    disabled={isAssigning}
                    style={{ color: 'var(--bw-text)', backgroundColor: 'var(--bw-bg)' }}
                  >
                    <option value="">Choose a driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} - {driver.email}
                      </option>
                    ))}
                  </select>
                </div>
                {assignError && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bw-bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid #ef4444',
                    fontSize: '13px',
                    color: '#ef4444'
                  }}>
                    {assignError}
                  </div>
                )}
              </div>
            </div>
            <div className="bw-modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: 'clamp(16px, 2.5vw, 24px)',
              borderTop: '1px solid var(--bw-border)'
            }}>
              <button
                type="button"
                className={`btn btn-secondary${isMobile ? ' btn-block' : ''}`}
                onClick={() => {
                  if (!isAssigning) {
                    setShowAssignConfirm(false)
                    setAssigningVehicleId(null)
                    setSelectedDriverId('')
                    setAssignError(null)
                  }
                }}
                disabled={isAssigning}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-primary${isMobile ? ' btn-block' : ''}`}
                onClick={confirmAssignDriver}
                disabled={isAssigning || !selectedDriverId}
              >
                {isAssigning ? 'Assigning...' : 'Assign Driver'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Responsive Vehicle Grid Styles */}
      <style>{`
        .bw-vehicle-grid {
          display: grid;
          gap: clamp(16px, 3vw, 24px);
          padding: 0;
        }
        
        /* Very small screens: 1 column */
        @media (max-width: 480px) {
          .bw-vehicle-grid {
            grid-template-columns: 1fr;
            gap: clamp(12px, 2vw, 16px);
          }
        }
        
        /* Small screens: 2 columns */
        @media (min-width: 481px) and (max-width: 767px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: clamp(14px, 2.5vw, 18px);
          }
        }
        
        /* Medium screens: 3 columns */
        @media (min-width: 768px) and (max-width: 1023px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: clamp(18px, 2.5vw, 22px);
          }
        }
        
        /* Large screens: 4 columns */
        @media (min-width: 1024px) {
          .bw-vehicle-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }
      `}</style>
    </>
  )
}
