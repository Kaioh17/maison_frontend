import Button from '@components/Button'
import Modal from '@components/Modal'
import Card from '@components/Card'
import StatusPill from '@components/StatusPill'
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
    confirmUnassignDriver,
    confirmAssignDriver,
    confirmAssignVehicleToDriver,
    openAssignVehicleToDriver,
    driversTableGridColumns,
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
  } = useOutletContext<TenantShellCtx>()
  const [vehicleSearch, setVehicleSearch] = useState('')
  const vq = vehicleSearch.trim().toLowerCase()
  const shownVehicles = vq
    ? vehicles.filter((v) => `${v.year} ${v.make} ${v.model} ${v.license_plate ?? ''} ${v.driver?.full_name ?? ''}`.toLowerCase().includes(vq))
    : vehicles

  return (
    <>
        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showAddVehicleForm && (
              <Modal
                title="Add New Vehicle"
                onClose={() => {
                  if (addingVehicle) return
                  setShowAddVehicleForm(false)
                  setAddVehicleError(null)
                  setAddVehicleSuccess(false)
                  setNewVehicle({ make: '', model: '', year: '', license_plate: '', color: '', status: 'available', vehicle_category: '', vehicle_flat_rate: '', seating_capacity: '' })
                }}
              >
                      {addVehicleSuccess && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: 'var(--bw-status-active-bg)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '6px',
                          color: 'var(--bw-status-active-text)',
                          fontSize: '14px',
                          fontFamily: '"Work Sans", sans-serif'
                        }}>
                          Vehicle added.
                        </div>
                      )}

                      {addVehicleError && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: 'var(--bw-status-cancelled-bg)',
                          border: '1px solid var(--bw-border)',
                          borderRadius: '6px',
                          color: 'var(--bw-status-cancelled-text)',
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
                              <label htmlFor="vehicle-make" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Make *
                              </label>
                              <select id="vehicle-make" name="make" autoComplete="off"
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
                              <label htmlFor="vehicle-model"
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
                              <select id="vehicle-model" name="model" autoComplete="off"
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
                              <label htmlFor="vehicle-year" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Year
                              </label>
                              <input id="vehicle-year" name="year" autoComplete="off" inputMode="numeric"
                                type="number"
                                value={newVehicle.year}
                                onChange={(e) => handleNewVehicleChange('year', e.target.value)}
                                min="1900"
                                max={new Date().getFullYear() + 1}
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
                              <label htmlFor="vehicle-license_plate" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                License Plate
                              </label>
                              <input id="vehicle-license_plate" name="license_plate" autoComplete="off"
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
                              <label htmlFor="vehicle-color" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Color
                              </label>
                              <input id="vehicle-color" name="color" autoComplete="off"
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
                              <label htmlFor="vehicle-seating_capacity" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Seating Capacity
                              </label>
                              <input id="vehicle-seating_capacity" name="seating_capacity" autoComplete="off" inputMode="numeric"
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
                            <label htmlFor="vehicle-vehicle_category" className="small-muted" style={{
                              display: 'block',
                              marginBottom: '8px',
                              fontFamily: '"Work Sans", sans-serif',
                              fontSize: '13px',
                              color: 'var(--bw-muted)'
                            }}>
                              Vehicle Category *
                            </label>
                            <select id="vehicle-vehicle_category" name="vehicle_category" autoComplete="off"
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
                              <label htmlFor="vehicle-vehicle_flat_rate" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Flat Rate ($) *
                              </label>
                              <input id="vehicle-vehicle_flat_rate" name="vehicle_flat_rate" autoComplete="off" inputMode="decimal"
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
                              <label htmlFor="vehicle-status" className="small-muted" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontFamily: '"Work Sans", sans-serif',
                                fontSize: '13px',
                                color: 'var(--bw-muted)'
                              }}>
                                Status
                              </label>
                              <select id="vehicle-status" name="status" autoComplete="off"
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
                            <Button
                              type="submit"
                              disabled={addingVehicle}
                              style={{ flex: 1 }}>
                              {addingVehicle ? 'Adding…' : 'Add Vehicle'}
                            </Button>
                            <Button
                              variant="secondary"
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
                              }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </form>
              </Modal>
            )}

            {vehicles.length > 0 && (
              <div className="bw-searchbar">
                <div className="dt-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
                  <MagnifyingGlass size={16} aria-hidden style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bw-muted)', pointerEvents: 'none' }} />
                  <input
                    type="search"
                    className="bw-input"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Search by vehicle, plate or driver…"
                    aria-label="Search vehicles"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            )}

            <Card style={{ padding: 0 }}>
              {vehicles.length === 0 ? (
                <div className="bw-empty">
                  <div style={{ color: 'var(--bw-text)', fontWeight: 500, marginBottom: 6 }}>No vehicles yet</div>
                  <div style={{ marginBottom: 14 }}>Add vehicles to your fleet to start accepting bookings.</div>
                  <Button onClick={() => setShowAddVehicleForm(true)}>
                    <Plus size={16} aria-hidden />
                    Add vehicle
                  </Button>
                </div>
              ) : shownVehicles.length === 0 ? (
                <div className="bw-empty">No vehicles match your search.</div>
              ) : (
                <div className="dt-wrap">
                  <table className="dt" style={{ minWidth: 820 }}>
                    <thead>
                      <tr>
                        <th>Vehicle</th><th>Class</th><th>Plate</th><th>Driver</th><th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shownVehicles.map((vehicle) => {
                        const firstImage = vehicle.vehicle_images ? Object.values(vehicle.vehicle_images)[0] : null
                        const category = vehicle.vehicle_category?.vehicle_category || 'N/A'
                        const driverType = vehicle.driver?.driver_type || vehicle.driver_type
                        const edit = () => { setEditingVehicleId(vehicle.id); setShowVehicleEditModal(true) }
                        return (
                          <tr
                            key={vehicle.id}
                            className="is-clickable"
                            onClick={edit}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bw-bg-hover)', display: 'grid', placeItems: 'center' }}>
                                  {firstImage ? (
                                    <img src={firstImage as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <Car size={20} aria-hidden style={{ color: 'var(--bw-disabled)' }} />
                                  )}
                                </div>
                                <div className="strong"><button type="button" className="dt-rowbtn">{vehicle.year} {vehicle.make} {vehicle.model}</button></div>
                              </div>
                            </td>
                            <td data-label="Class">{category}</td>
                            <td data-label="Plate" style={{ whiteSpace: 'nowrap' }}>{vehicle.license_plate || <span className="sub">-</span>}</td>
                            <td data-label="Driver">
                              <div>
                                {vehicle.driver ? (
                                  <>
                                    <div>{vehicle.driver.full_name || 'Assigned'}</div>
                                    {driverType && <div className="sub">{driverType === 'in_house' ? 'In-House' : 'Outsourced'}</div>}
                                  </>
                                ) : (
                                  <span className="sub">Not assigned</span>
                                )}
                              </div>
                            </td>
                            <td data-label="Status">
                              <StatusPill status={vehicle.driver ? 'assigned' : 'active'} label={vehicle.driver ? 'Assigned' : 'Available'} />
                            </td>
                            <td className="dt-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                {vehicle.driver ? (
                                  <Button
                                    variant="secondary"
                                    style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }}
                                    onClick={() => {
                                      setUnassigningVehicleId(vehicle.id)
                                      setShowUnassignConfirm(true)
                                      setUnassignError(null)
                                    }}
                                  >
                                    Unassign
                                  </Button>
                                ) : (
                                  <Button
                                    style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }}
                                    onClick={() => {
                                      setAssigningVehicleId(vehicle.id)
                                      setShowAssignConfirm(true)
                                      setSelectedDriverId('')
                                      setAssignError(null)
                                    }}
                                  >
                                    Assign driver
                                  </Button>
                                )}
                                <Button variant="secondary" style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} onClick={edit}>
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
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
        <Modal
          title="Delete Vehicle"
          width={500}
          onClose={() => {
            if (!isDeleting) {
              setShowDeleteConfirm(false)
              setDeletingVehicleId(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onClick={() => {
                  if (!isDeleting) {
                    setShowDeleteConfirm(false)
                    setDeletingVehicleId(null)
                  }
                }}
                disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                fullWidth={isMobile}
                onClick={confirmDeleteVehicle}
                disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Delete Vehicle'}
              </Button>
            </>
          }
        >
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
        </Modal>
      )}


      {/* Unassign Driver Confirmation Modal */}
      {showUnassignConfirm && unassigningVehicleId && (
        <Modal
          title="Unassign Driver"
          width={500}
          onClose={() => {
            if (!isUnassigning) {
              setShowUnassignConfirm(false)
              setUnassigningVehicleId(null)
              setUnassignError(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onClick={() => {
                  if (!isUnassigning) {
                    setShowUnassignConfirm(false)
                    setUnassigningVehicleId(null)
                    setUnassignError(null)
                  }
                }}
                disabled={isUnassigning}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                fullWidth={isMobile}
                onClick={() => confirmUnassignDriver(true)}
                disabled={isUnassigning}>
                {isUnassigning ? 'Unassigning…' : 'Unassign Driver'}
              </Button>
            </>
          }
        >
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
              <WarningCircle size={20} style={{ color: 'var(--bw-warning)', flexShrink: 0 }} />
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
                border: '1px solid var(--bw-error)',
                fontSize: '13px',
                color: 'var(--bw-error)'
              }}>
                {unassignError}
              </div>
            )}
          </div>
        </Modal>
        )}


      {/* Assign Driver Confirmation Modal */}
      {showAssignConfirm && assigningVehicleId && (
        <Modal
          title="Assign Driver"
          width={500}
          onClose={() => {
            if (!isAssigning) {
              setShowAssignConfirm(false)
              setAssigningVehicleId(null)
              setSelectedDriverId('')
              setAssignError(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onClick={() => {
                  if (!isAssigning) {
                    setShowAssignConfirm(false)
                    setAssigningVehicleId(null)
                    setSelectedDriverId('')
                    setAssignError(null)
                  }
                }}
                disabled={isAssigning}>
                Cancel
              </Button>
              <Button
                fullWidth={isMobile}
                onClick={confirmAssignDriver}
                disabled={isAssigning || !selectedDriverId}>
                {isAssigning ? 'Assigning…' : 'Assign Driver'}
              </Button>
            </>
          }
        >
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
              <WarningCircle size={20} style={{ color: 'var(--bw-warning)', flexShrink: 0 }} />
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
              <label htmlFor="vehicle-assign-driver">Select Driver</label>
              <select id="vehicle-assign-driver"
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
                border: '1px solid var(--bw-error)',
                fontSize: '13px',
                color: 'var(--bw-error)'
              }}>
                {assignError}
              </div>
            )}
          </div>
        </Modal>
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
