import Button from '@components/Button'
import Modal from '@components/Modal'
import Card from '@components/Card'
import StatusPill from '@components/StatusPill'
import Tabs from '@components/Tabs'
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
import { useHideOnScroll } from '@hooks/useHideOnScroll'
import { Car, Users, Calendar, Gear, TrendUp, CurrencyDollar, Clock, MapPin, User, Phone, Envelope, Plus, Pencil, Trash, CheckCircle, XCircle, WarningCircle, Palette, FloppyDisk, SidebarSimple, CaretDown, CaretUp, Info, MagnifyingGlass, Wallet, Circle, Lock, Sparkle, Copy, ArrowSquareOut, ChatCircleDots, ShieldCheck, DotsThreeVertical, CaretRight, List, type IconWeight } from '@phosphor-icons/react'
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
  formatTenantPhone,
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

  const searchBarHidden = useHideOnScroll(isMobile)

  return (
    <>
        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {drivers.length > 0 && (
              <div className="bw-searchbar">
                <div className="dt-search" style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
                  <MagnifyingGlass size={16} aria-hidden style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bw-muted)', pointerEvents: 'none' }} />
                  <input
                    type="search"
                    className="bw-input"
                    value={driverListSearch}
                    onChange={(e) => setDriverListSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    aria-label="Search drivers"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
                <select
                  className="bw-input"
                  value={driverFilterType}
                  onChange={(e) => setDriverFilterType(e.target.value as 'all' | 'in_house' | 'outsourced')}
                  aria-label="Filter by driver type"
                  style={{ width: 'auto', maxWidth: 160 }}
                >
                  <option value="all">All types</option>
                  <option value="in_house">In-House</option>
                  <option value="outsourced">Outsourced</option>
                </select>
              </div>
            )}

            <Card style={{ padding: 0 }}>
              <div style={{ padding: '0 18px' }}>
                <Tabs
                  ariaLabel="Driver status"
                  value={driverFilterStatus}
                  onChange={setDriverFilterStatus}
                  tabs={[
                    { id: 'all', label: 'All', count: drivers.length },
                    { id: 'active', label: 'Active', count: drivers.filter((d) => d.is_active).length },
                    { id: 'inactive', label: 'Inactive', count: drivers.filter((d) => !d.is_active).length },
                  ]}
                />
              </div>
              {filteredDriversForList.length === 0 ? (
                <div className="bw-empty">
                  <div style={{ color: 'var(--bw-text)', fontWeight: 500, marginBottom: 6 }}>
                    {drivers.length === 0 ? 'No drivers yet' : 'No matching drivers'}
                  </div>
                  <div style={{ marginBottom: drivers.length === 0 ? 14 : 0 }}>
                    {drivers.length === 0 ? 'Add your first driver to start assigning rides.' : 'Try adjusting search or filters.'}
                  </div>
                  {drivers.length === 0 && (
                    <Button onClick={() => setShowAddDriver(true)}>
                      <Plus size={16} aria-hidden />
                      Add driver
                    </Button>
                  )}
                </div>
              ) : (
                <div className="dt-wrap">
                  <table className="dt" style={{ minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th>Driver</th><th>Phone</th><th>Type</th><th>Status</th><th>Registration</th>
                        <th style={{ textAlign: 'right' }}>Rides</th><th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDriversForList.map((driver) => {
                        const telHref = tenantTelHrefFromPhone(driver.phone_no)
                        const verified = driver.is_registered === 'registered'
                        return (
                          <tr
                            key={driver.id}
                            className="is-clickable"
                            onClick={() => handleDriverClick(driver.id)}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span
                                  aria-hidden
                                  style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', background: 'var(--bw-bg-hover-strong)', fontSize: 12, fontWeight: 500 }}
                                >
                                  {overviewDriverInitials(driver)}
                                </span>
                                <div style={{ minWidth: 0 }}>
                                  <div className="strong"><button type="button" className="dt-rowbtn">{driver.first_name} {driver.last_name}</button></div>
                                  <div className="sub">{driver.email}</div>
                                </div>
                              </div>
                            </td>
                            <td data-label="Phone" style={{ whiteSpace: 'nowrap' }}>
                              {telHref ? (
                                <a href={telHref} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>{formatTenantPhone(driver.phone_no)}</a>
                              ) : formatTenantPhone(driver.phone_no)}
                            </td>
                            <td data-label="Type">{tenantDriverTypeLabel(driver.driver_type)}</td>
                            <td data-label="Status">
                              <StatusPill status={driver.is_active ? 'active' : 'pending'} label={driver.is_active ? 'Active' : 'Inactive'} />
                            </td>
                            <td data-label="Registration">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: verified ? 'var(--bw-status-active-text)' : 'var(--bw-status-pending-text)' }}>
                                {verified ? <ShieldCheck size={16} weight="fill" aria-hidden /> : <WarningCircle size={16} weight="fill" aria-hidden />}
                                {verified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td data-label="Rides" className="strong" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{driver.completed_rides}</td>
                            <td className="dt-actions" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                {!driver.is_active && !verified && (
                                  <Button style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} disabled={approvingDriverId === driver.id} onClick={() => approveDriverAction(driver.id)}>
                                    <CheckCircle size={14} aria-hidden />
                                    {approvingDriverId === driver.id ? 'Approving…' : 'Approve'}
                                  </Button>
                                )}
                                {driver.driver_type === 'in_house' && (
                                  <Button variant="secondary" style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} onClick={() => openAssignVehicleToDriver(driver.id)}>
                                    <Car size={14} aria-hidden />
                                    Assign vehicle
                                  </Button>
                                )}
                                <Button variant="secondary" style={{ minHeight: 32, padding: '6px 10px', fontSize: 12 }} onClick={() => openDriverRideHistory(driver)}>
                                  Ride history
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

        {/* Add Driver Modal */}
      {showAddDriver && (
        <Modal
          title="Add New Driver"
          width={500}
          onClose={() => {
            setShowAddDriver(false)
            setAddDriverError(null)
            setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
          }}
          footer={
            <>
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onClick={() => {
                  setShowAddDriver(false)
                  setAddDriverError(null)
                  setNewDriver({ first_name: '', last_name: '', email: '', driver_type: 'outsourced' })
                }}>
                Cancel
              </Button>
              <Button
                fullWidth={isMobile}
                onClick={createDriver}
                disabled={isCreatingDriver}>
                {isCreatingDriver ? 'Adding…' : 'Create Driver'}
              </Button>
            </>
          }
        >
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
              <label htmlFor="driver-first_name" className="small-muted">
                First Name
              </label>
              <input id="driver-first_name" name="first_name" autoComplete="off" 
                className="bw-input" 
                value={newDriver.first_name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewDriver({ ...newDriver, first_name: e.target.value })
                  setAddDriverError(null)
                }}
              />
            </div>
            <div className="bw-form-group">
              <label htmlFor="driver-last_name" className="small-muted">
                Last Name
              </label>
              <input id="driver-last_name" name="last_name" autoComplete="off" 
                className="bw-input" 
                value={newDriver.last_name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewDriver({ ...newDriver, last_name: e.target.value })
                  setAddDriverError(null)
                }}
              />
            </div>
            <div className="bw-form-group">
              <label htmlFor="driver-email" className="small-muted">
                Email
              </label>
              <input id="driver-email" name="email" autoComplete="off" spellCheck={false} 
                className="bw-input" 
                type="email"
                value={newDriver.email} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewDriver({ ...newDriver, email: e.target.value })
                  setAddDriverError(null)
                }}
              />
            </div>
            <div className="bw-form-group">
              <label htmlFor="driver-driver_type" className="small-muted">
                Driver Type
              </label>
              <select id="driver-driver_type" name="driver_type" autoComplete="off" 
                className="bw-input" 
                value={newDriver.driver_type} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setNewDriver({ ...newDriver, driver_type: e.target.value as OnboardDriver['driver_type'] })
                  setAddDriverError(null)
                }}
              >
                <option value="outsourced">Outsourced</option>
                <option value="in_house">In-House</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign vehicle to in-house driver (from Drivers tab) */}
      {showAssignVehicleToDriver && assignVehicleToDriverId != null && (
        <Modal
          title="Assign vehicle"
          width={500}
          onClose={() => {
            if (!isAssigning) {
              setShowAssignVehicleToDriver(false)
              setAssignVehicleToDriverId(null)
              setSelectedVehicleIdForDriverAssign('')
              setAssignVehicleToDriverError(null)
            }
          }}
          footer={
            <>
              <Button
                variant="secondary"
                fullWidth={isMobile}
                onClick={() => {
                  if (!isAssigning) {
                    setShowAssignVehicleToDriver(false)
                    setAssignVehicleToDriverId(null)
                    setSelectedVehicleIdForDriverAssign('')
                    setAssignVehicleToDriverError(null)
                  }
                }}
                disabled={isAssigning}>
                Cancel
              </Button>
              <Button
                fullWidth={isMobile}
                onClick={confirmAssignVehicleToDriver}
                disabled={isAssigning || !selectedVehicleIdForDriverAssign}>
                {isAssigning ? 'Assigning…' : 'Assign vehicle'}
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
              <label htmlFor="driver-assign-vehicle">Select vehicle</label>
              <select id="driver-assign-vehicle"
                value={selectedVehicleIdForDriverAssign}
                onChange={(e) => setSelectedVehicleIdForDriverAssign(e.target.value)}
                className="bw-input"
                disabled={isAssigning}
                                  >
                <option value="">Choose a vehicle</option>
                {vehicles
                  .filter((v) => !v.driver)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
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
                border: '1px solid var(--bw-error)',
                fontSize: '13px',
                color: 'var(--bw-error)'
              }}>
                {assignVehicleToDriverError}
              </div>
            )}
          </div>
        </Modal>
      )}


      {/* Driver Details Modal */}
      {showDriverDetails && (
        <Modal
          title="Driver Details"
          width={600}
          onClose={() => {
            setShowDriverDetails(false)
            setSelectedDriver(null)
          }}
        >
          {loadingDriverDetails ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ color: 'var(--bw-muted)' }}>Loading driver details…</div>
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
                  <Button
                    fullWidth
                    disabled={approvingDriverId === selectedDriver.id}
                    onClick={() => approveDriverAction(selectedDriver.id)}>
                    <CheckCircle size={18} aria-hidden />
                    {approvingDriverId === selectedDriver.id ? 'Approving…' : 'Approve driver'}
                  </Button>
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
                  Created: {selectedDriver.created_on ? new Date(selectedDriver.created_on).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                </div>
                {selectedDriver.updated_on && (
                  <div>
                    Updated: {new Date(selectedDriver.updated_on).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ color: 'var(--bw-muted)' }}>No driver details available</div>
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
