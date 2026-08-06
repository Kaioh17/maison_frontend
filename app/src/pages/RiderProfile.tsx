import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, MapPin, Shield, SignOut, Pencil, FloppyDisk, X } from '@phosphor-icons/react'
import { getUserInfo, type UserResponse } from '@api/user'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import CountryAutocomplete from '@components/CountryAutocomplete'
import StateAutocomplete from '@components/StateAutocomplete'
import CityAutocomplete from '@components/CityAutocomplete'

const FONT_BODY = 'Work Sans, sans-serif'
const FONT_HEADING = 'DM Sans, sans-serif'

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--rider-surface-elevated)',
  borderRadius: 12,
  padding: 'clamp(16px, 3vw, 20px)',
  boxShadow: 'var(--rider-shell-shadow)',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: 'clamp(14px, 2.3vw, 16px)',
  fontWeight: 500,
  color: 'var(--bw-text)',
  fontFamily: FONT_BODY,
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

// Reusable field row used in both view and edit modes.
function FieldRow({
  label,
  value,
  isEditing,
  editNode,
  first = false,
}: {
  label: string
  value: string
  isEditing: boolean
  editNode?: React.ReactNode
  first?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isEditing ? 'center' : 'baseline',
        gap: 12,
        padding: '13px 0',
        borderTop: first ? 'none' : '1px solid var(--rider-hairline)',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--bw-text)',
          opacity: 0.55,
          fontFamily: FONT_BODY,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {isEditing && editNode ? (
        editNode
      ) : (
        <span
          style={{
            fontSize: 'clamp(13px, 2.2vw, 14px)',
            color: 'var(--bw-text)',
            fontFamily: FONT_BODY,
            fontWeight: 300,
            textAlign: 'right',
            wordBreak: 'break-word',
          }}
        >
          {value || '—'}
        </span>
      )}
    </div>
  )
}

function InlineInput({
  name,
  type = 'text',
  value,
  onChange,
  autoComplete,
  maxLength,
}: {
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  maxLength?: number
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      maxLength={maxLength}
      style={{
        flex: 1,
        minWidth: 0,
        maxWidth: 280,
        background: 'var(--rider-surface-inset)',
        border: '1px solid var(--bw-border)',
        borderRadius: 8,
        padding: '8px 12px',
        color: 'var(--bw-text)',
        fontSize: 'clamp(13px, 2vw, 14px)',
        fontFamily: FONT_BODY,
        outline: 'none',
        boxShadow: 'var(--rider-field-inset-glow)',
        transition: 'border-color 0.15s ease',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--bw-focus)' }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--bw-border)' }}
    />
  )
}

export default function RiderProfile() {
  useFavicon()
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [editedData, setEditedData] = useState<Partial<UserResponse>>({})
  const navigate = useNavigate()
  const { isAuthenticated, role, logout } = useAuthStore()
  const { tenantInfo } = useTenantInfo()

  useEffect(() => {
    if (!isAuthenticated || role !== 'rider') {
      navigate('/riders/login', { replace: true })
      return
    }
    loadUserInfo()
  }, [isAuthenticated, role, navigate])

  const loadUserInfo = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await getUserInfo()
      if (response.success && response.data) {
        setUserInfo(response.data)
        setEditedData(response.data)
      } else {
        setError('Failed to load user information')
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(e.response?.data?.detail || e.message || 'Failed to load user information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedData({ ...editedData, [name]: value })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      // TODO: call update API endpoint when available
      setUserInfo({ ...userInfo!, ...editedData } as UserResponse)
      setIsEditing(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(e.response?.data?.detail || e.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData(userInfo || {})
    setIsEditing(false)
    setError('')
  }

  const handleLogout = () => {
    logout()
    navigate('/riders/login', { replace: true })
  }

  const autocompleteStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    maxWidth: 280,
    background: 'var(--rider-surface-inset)',
    border: '1px solid var(--bw-border)',
    borderRadius: 8,
    padding: '8px 12px',
    color: 'var(--bw-text)',
    fontSize: 'clamp(13px, 2vw, 14px)',
    fontFamily: FONT_BODY,
    boxShadow: 'var(--rider-field-inset-glow)',
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bw-bg)',
          color: 'var(--bw-text)',
          fontFamily: FONT_BODY,
          fontSize: 14,
          opacity: 0.65,
        }}
      >
        Loading profile…
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bw-bg)',
          padding: 24,
          fontFamily: FONT_BODY,
          gap: 16,
        }}
      >
        <p style={{ color: 'var(--bw-error, #ef4444)', fontSize: 14, margin: 0, textAlign: 'center' }}>
          {error || 'Failed to load profile'}
        </p>
        <button
          onClick={loadUserInfo}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--rider-primary)',
            color: 'var(--rider-on-primary)',
            border: 'none',
            borderRadius: 8,
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const d = isEditing ? editedData : userInfo

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bw-bg)',
        padding: 'clamp(16px, 3vw, 24px)',
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Page header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'clamp(20px, 3.5vw, 28px)',
            paddingBottom: 'clamp(14px, 2.5vw, 18px)',
            borderBottom: '1px solid var(--bw-border)',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Left: back link + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <Link
              to="/rider/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: 'var(--bw-text)',
                border: '1px solid var(--bw-border)',
                borderRadius: 6,
                fontSize: 'clamp(13px, 2vw, 14px)',
                fontFamily: FONT_BODY,
                fontWeight: 300,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={15} />
              Dashboard
            </Link>
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 4vw, 30px)',
                  fontWeight: 200,
                  fontFamily: FONT_HEADING,
                  color: 'var(--bw-text)',
                  lineHeight: 1.1,
                }}
              >
                Profile
              </h1>
              {tenantInfo?.company_name && (
                <p
                  style={{
                    margin: '3px 0 0',
                    fontSize: 'clamp(12px, 1.9vw, 13px)',
                    color: 'var(--bw-text)',
                    opacity: 0.55,
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                  }}
                >
                  {tenantInfo.company_name}
                </p>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: 'clamp(9px, 1.8vw, 11px) clamp(14px, 2.5vw, 18px)',
                    backgroundColor: 'var(--rider-primary)',
                    color: 'var(--rider-on-primary)',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    cursor: 'pointer',
                  }}
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: 'clamp(9px, 1.8vw, 11px) clamp(14px, 2.5vw, 18px)',
                    backgroundColor: 'transparent',
                    color: 'var(--bw-text)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: 8,
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    cursor: 'pointer',
                  }}
                >
                  <SignOut size={15} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: 'clamp(9px, 1.8vw, 11px) clamp(14px, 2.5vw, 18px)',
                    backgroundColor: 'transparent',
                    color: 'var(--bw-text)',
                    border: '1px solid var(--bw-border)',
                    borderRadius: 8,
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.6 : 1,
                  }}
                >
                  <X size={15} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: 'clamp(9px, 1.8vw, 11px) clamp(14px, 2.5vw, 18px)',
                    backgroundColor: 'var(--rider-primary)',
                    color: 'var(--rider-on-primary)',
                    border: 'none',
                    borderRadius: 8,
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2vw, 14px)',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  <FloppyDisk size={15} />
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 'clamp(14px, 2.5vw, 20px)',
              padding: '10px 14px',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid #ef4444',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 13,
              fontFamily: FONT_BODY,
            }}
          >
            {error}
          </div>
        )}

        {/* Personal Information */}
        <div style={{ ...cardStyle, marginBottom: 'clamp(12px, 2vw, 16px)' }}>
          <h3 style={sectionTitleStyle}>
            <User size={16} style={{ opacity: 0.7 }} />
            Personal Information
          </h3>
          <div style={{ marginTop: 4 }}>
            <FieldRow
              label="First name"
              value={userInfo.first_name}
              isEditing={isEditing}
              first
              editNode={
                <InlineInput
                  name="first_name"
                  value={d.first_name || ''}
                  onChange={handleInputChange}
                  autoComplete="given-name"
                />
              }
            />
            <FieldRow
              label="Last name"
              value={userInfo.last_name}
              isEditing={isEditing}
              editNode={
                <InlineInput
                  name="last_name"
                  value={d.last_name || ''}
                  onChange={handleInputChange}
                  autoComplete="family-name"
                />
              }
            />
            <FieldRow
              label="Email"
              value={userInfo.email}
              isEditing={isEditing}
              editNode={
                <InlineInput
                  name="email"
                  type="email"
                  value={d.email || ''}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              }
            />
            <FieldRow
              label="Phone"
              value={userInfo.phone_no}
              isEditing={isEditing}
              editNode={
                <InlineInput
                  name="phone_no"
                  type="tel"
                  value={d.phone_no || ''}
                  onChange={handleInputChange}
                  autoComplete="tel"
                  maxLength={14}
                />
              }
            />
          </div>
        </div>

        {/* Address */}
        <div style={{ ...cardStyle, marginBottom: 'clamp(12px, 2vw, 16px)' }}>
          <h3 style={sectionTitleStyle}>
            <MapPin size={16} style={{ opacity: 0.7 }} />
            Address
          </h3>
          <div style={{ marginTop: 4 }}>
            <FieldRow
              label="Street"
              value={userInfo.address || ''}
              isEditing={isEditing}
              first
              editNode={
                <InlineInput
                  name="address"
                  value={d.address || ''}
                  onChange={handleInputChange}
                  autoComplete="street-address"
                />
              }
            />
            <FieldRow
              label="City"
              value={userInfo.city || ''}
              isEditing={isEditing}
              editNode={
                isEditing ? (
                  <CityAutocomplete
                    value={d.city || ''}
                    onChange={(value) => setEditedData({ ...editedData, city: value })}
                    selectedState={d.state || ''}
                    placeholder="City"
                    className=""
                    style={autocompleteStyle}
                  />
                ) : undefined
              }
            />
            <FieldRow
              label="State"
              value={userInfo.state || ''}
              isEditing={isEditing}
              editNode={
                isEditing ? (
                  <StateAutocomplete
                    value={d.state || ''}
                    onChange={(value) => setEditedData({ ...editedData, state: value, city: '' })}
                    placeholder="State"
                    className=""
                    style={autocompleteStyle}
                  />
                ) : undefined
              }
            />
            <FieldRow
              label="Country"
              value={userInfo.country || ''}
              isEditing={isEditing}
              editNode={
                isEditing ? (
                  <CountryAutocomplete
                    value={d.country || ''}
                    onChange={(value) => setEditedData({ ...editedData, country: value })}
                    placeholder="Country"
                    className=""
                    style={autocompleteStyle}
                  />
                ) : undefined
              }
            />
            <FieldRow
              label="Postal code"
              value={userInfo.postal_code || ''}
              isEditing={isEditing}
              editNode={
                <InlineInput
                  name="postal_code"
                  value={d.postal_code || ''}
                  onChange={handleInputChange}
                  maxLength={10}
                />
              }
            />
          </div>
        </div>

        {/* Account Details — read-only */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>
            <Shield size={16} style={{ opacity: 0.7 }} />
            Account
          </h3>
          <div style={{ marginTop: 4 }}>
            <FieldRow label="Role" value={userInfo.role} isEditing={false} first />
            <FieldRow label="Tier" value={userInfo.tier || 'Standard'} isEditing={false} />
            <FieldRow
              label="Member since"
              value={new Date(userInfo.created_on).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              isEditing={false}
            />
          </div>
        </div>

      </div>
    </main>
  )
}
