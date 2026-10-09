import { useState } from 'react'
import type React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addVehicle } from '@api/vehicles'
import { getApiErrorMessage, getRequestErrorMessage } from '@utils/apiError'
import { useVehicleCategories, EMPTY_LIST } from './useTenantData'
import { useTenantMutations } from './useTenantMutations'

const EMPTY_VEHICLE = {
  make: '',
  model: '',
  year: '',
  license_plate: '',
  color: '',
  status: 'available',
  vehicle_category: '',
  vehicle_flat_rate: '',
  seating_capacity: '',
}

type ShellActions = {
  setError: (message: string | null) => void
  setShowAddVehicleForm: (open: boolean) => void
}

/** State and handlers for the Vehicles tab: add form, edit modal, delete / assign / unassign confirmations. */
export function useVehiclesTabState({ setError, setShowAddVehicleForm }: ShellActions) {
  const queryClient = useQueryClient()
  const { deleteVehicleMut, assignDriverToVehicleMut, unassignDriverMut } = useTenantMutations()
  const vehicleCategories = useVehicleCategories().data ?? EMPTY_LIST

  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)
  const [showVehicleEditModal, setShowVehicleEditModal] = useState(false)

  const [deletingVehicleId, setDeletingVehicleId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [unassigningVehicleId, setUnassigningVehicleId] = useState<number | null>(null)
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [unassignError, setUnassignError] = useState<string | null>(null)

  const [assigningVehicleId, setAssigningVehicleId] = useState<number | null>(null)
  const [showAssignConfirm, setShowAssignConfirm] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  const [newVehicle, setNewVehicle] = useState(EMPTY_VEHICLE)
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [addVehicleError, setAddVehicleError] = useState<string | null>(null)
  const [addVehicleSuccess, setAddVehicleSuccess] = useState(false)

  const confirmUnassignDriver = async (override: boolean) => {
    if (!unassigningVehicleId) return

    setIsUnassigning(true)
    setUnassignError(null)

    try {
      await unassignDriverMut.mutateAsync({ vehicleId: unassigningVehicleId, override })
      setShowUnassignConfirm(false)
      setUnassigningVehicleId(null)
    } catch (error) {
      console.error('Failed to unassign driver:', error)
      setUnassignError(getRequestErrorMessage(error, 'Failed to unassign driver. Please try again.'))
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
    } catch (error) {
      console.error('Failed to assign driver:', error)
      setAssignError(getRequestErrorMessage(error, 'Failed to assign driver. Please try again.'))
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteVehicle = (vehicleId: number) => {
    setDeletingVehicleId(vehicleId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteVehicle = async () => {
    if (!deletingVehicleId) return

    setIsDeleting(true)
    try {
      await deleteVehicleMut.mutateAsync(deletingVehicleId)
      setShowDeleteConfirm(false)
      setDeletingVehicleId(null)
    } catch (error) {
      console.error('Failed to delete vehicle:', error)
      setError('Failed to delete vehicle. Please try again.')
    } finally {
      setIsDeleting(false)
    }
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
      const response = await addVehicle({
        make: newVehicle.make,
        model: newVehicle.model,
        year: newVehicle.year ? parseInt(newVehicle.year) : undefined,
        license_plate: newVehicle.license_plate || undefined,
        color: newVehicle.color || undefined,
        status: newVehicle.status,
        vehicle_category: newVehicle.vehicle_category,
        vehicle_flat_rate: parseFloat(newVehicle.vehicle_flat_rate) || 0,
        ...(seatingCapacityPayload !== undefined ? { seating_capacity: seatingCapacityPayload } : {}),
      })
      if (response.success && response.data) {
        setAddVehicleSuccess(true)
        setNewVehicle(EMPTY_VEHICLE)
        void queryClient.invalidateQueries({ queryKey: ['tenant', 'vehicles'] })
        // Hide form after success
        setTimeout(() => {
          setShowAddVehicleForm(false)
          setAddVehicleSuccess(false)
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to create vehicle')
      }
    } catch (err) {
      console.error('Failed to create vehicle:', err)
      setAddVehicleError(getApiErrorMessage(err, 'Failed to create vehicle. Please try again.'))
    } finally {
      setAddingVehicle(false)
    }
  }

  const handleNewVehicleChange = (field: string, value: string) => {
    setNewVehicle(prev => {
      const updated = { ...prev, [field]: value }

      // Auto-fill flat rate when vehicle category is selected
      if (field === 'vehicle_category' && value) {
        const selectedCategory = vehicleCategories.find(cat => cat.vehicle_category === value)
        if (selectedCategory && selectedCategory.vehicle_flat_rate) {
          updated.vehicle_flat_rate = selectedCategory.vehicle_flat_rate.toString()
        }
      }

      return updated
    })
  }

  return {
    vehicleCategories,
    editingVehicleId, setEditingVehicleId,
    showVehicleEditModal, setShowVehicleEditModal,
    deletingVehicleId, setDeletingVehicleId,
    showDeleteConfirm, setShowDeleteConfirm,
    isDeleting,
    unassigningVehicleId, setUnassigningVehicleId,
    showUnassignConfirm, setShowUnassignConfirm,
    isUnassigning,
    unassignError, setUnassignError,
    assigningVehicleId, setAssigningVehicleId,
    showAssignConfirm, setShowAssignConfirm,
    selectedDriverId, setSelectedDriverId,
    isAssigning,
    assignError, setAssignError,
    newVehicle, setNewVehicle,
    addingVehicle,
    addVehicleError, setAddVehicleError,
    addVehicleSuccess, setAddVehicleSuccess,
    confirmUnassignDriver,
    confirmAssignDriver,
    handleDeleteVehicle,
    confirmDeleteVehicle,
    handleAddVehicle,
    handleNewVehicleChange,
  }
}

export type VehiclesTabState = ReturnType<typeof useVehiclesTabState>
