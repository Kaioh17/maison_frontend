import React, { useState, useEffect } from 'react'
import { User, Envelope, Phone, MapPin, Calendar, Shield, SignOut, Pencil, FloppyDisk, X } from '@phosphor-icons/react'
import { getUserInfo, type UserResponse } from '@api/user'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link } from 'react-router-dom'
import { loginRider } from '@api/auth'
import { useTenantInfo } from '@hooks/useTenantInfo'
import { useFavicon } from '@hooks/useFavicon'
import CountryAutocomplete from '@components/CountryAutocomplete'
import StateAutocomplete from '@components/StateAutocomplete'
import CityAutocomplete from '@components/CityAutocomplete'

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
  const { tenantInfo, slug } = useTenantInfo()

  useEffect(() => {
    if (!isAuthenticated || role !== 'rider') {
      // Riders must use subdomain-based login
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
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load user information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedData({ ...editedData, [name]: value })
  }

  const handleSave = async () => {
    // Note: Update endpoint not provided in API spec, so this is a placeholder
    // In a real implementation, you would call an update API endpoint here
    try {
      setIsSaving(true)
      setError('')
      // TODO: Implement update API call when endpoint is available
      // await updateUserInfo(editedData)
      setUserInfo({ ...userInfo!, ...editedData } as UserResponse)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update profile')
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
    // Login URL - subdomain handles tenant context
    navigate('/riders/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bw-bg)'
      }}>
        <div style={{ 
          color: 'var(--bw-text)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: 'clamp(14px, 2vw, 16px)'
        }}>
          Loading profile...
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--bw-bg)',
        padding: 'clamp(16px, 3vw, 24px)'
      }}>
        <div style={{ 
          color: 'var(--bw-error)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: 'clamp(14px, 2vw, 16px)',
          marginBottom: 'clamp(12px, 2vw, 16px)'
        }}>
          {error || 'Failed to load profile'}
        </div>
        <button 
          className="bw-btn" 
          onClick={loadUserInfo}
          style={{ 
            borderRadius: 0, 
            padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)', 
            fontFamily: 'Work Sans, sans-serif', 
            fontWeight: 500,
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const displayData = isEditing ? editedData : userInfo

  return (
    <main className="bw" style={{ minHeight: '100vh', backgroundColor: 'var(--bw-bg)', padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Company Logo/Name */}
        {tenantInfo && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 'clamp(12px, 2vw, 16px)'
          }}>
            {tenantInfo.logo_url ? (
              <img 
                src={tenantInfo.logo_url} 
                alt={tenantInfo.company_name || 'Company Logo'}
                style={{
                  maxHeight: 'clamp(40px, 5vw, 50px)',
                  maxWidth: 'clamp(120px, 20vw, 180px)',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 600,
                color: 'var(--bw-text)',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                {tenantInfo.company_name}
              </h1>
            )}
          </div>
        )}
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'clamp(24px, 4vw, 32px)',
          flexWrap: 'wrap',
          gap: 'clamp(12px, 2vw, 16px)'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 'clamp(28px, 5vw, 40px)', 
              fontFamily: 'DM Sans, sans-serif', 
              fontWeight: 200,
              color: 'var(--bw-text)'
            }}>
              Profile
            </h1>
            <p className="small-muted" style={{ 
              marginTop: 'clamp(4px, 1vw, 6px)', 
              fontSize: 'clamp(14px, 2vw, 16px)', 
              fontFamily: 'Work Sans, sans-serif', 
              fontWeight: 300,
              color: 'var(--bw-text)',
              opacity: 0.8
            }}>
              {tenantInfo ? `${tenantInfo.company_name} - Manage your account information` : 'Manage your account information'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)', flexWrap: 'wrap' }}>
            {!isEditing ? (
              <button 
                className="bw-btn" 
                onClick={() => setIsEditing(true)}
                style={{ 
                  borderRadius: 0, 
                  padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)', 
                  fontFamily: 'Work Sans, sans-serif', 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(6px, 1vw, 8px)',
                  fontSize: 'clamp(14px, 2.5vw, 16px)'
                }}
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  className="bw-btn" 
                  onClick={handleCancel}
                  disabled={isSaving}
                  style={{ 
                    borderRadius: 0, 
                    padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)', 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 600,
                    background: 'var(--bw-bg)',
                    color: 'var(--bw-fg)',
                    border: '1px solid var(--bw-fg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1vw, 8px)',
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}
                >
                  <X size={16} style={{ width: 'clamp(14px, 2vw, 16px)', height: 'clamp(14px, 2vw, 16px)' }} />
                  Cancel
                </button>
                <button 
                  className="bw-btn" 
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ 
                    borderRadius: 0, 
                    padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)', 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(6px, 1vw, 8px)',
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}
                >
                  <FloppyDisk size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            <button 
              className="bw-btn" 
              onClick={handleLogout}
              style={{ 
                borderRadius: 0, 
                padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)', 
                fontFamily: 'Work Sans, sans-serif', 
                fontWeight: 500,
                background: 'var(--bw-bg)',
                color: 'var(--bw-fg)',
                border: '1px solid var(--bw-fg)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(6px, 1vw, 8px)',
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}
            >
              <SignOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            marginBottom: 'clamp(16px, 3vw, 24px)', 
            padding: 'clamp(10px, 2vw, 12px)', 
            backgroundColor: 'rgba(197, 72, 61, 0.1)', 
            border: '1px solid var(--bw-error)', 
            borderRadius: '4px',
            color: 'var(--bw-error)',
            fontSize: 'clamp(13px, 2vw, 14px)',
            fontFamily: 'Work Sans, sans-serif'
          }}>
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bw-card" style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
          <div className="bw-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.5vw, 12px)' }}>
              <div className="bw-card-icon">
                <User size={20} />
              </div>
              <h3 style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(16px, 2.5vw, 18px)' }}>Personal Information</h3>
            </div>
          </div>
          <div className="bw-info-grid" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>First Name:</span>
              {isEditing ? (
                <input
                  name="first_name"
                  type="text"
                  value={displayData.first_name || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.first_name}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Last Name:</span>
              {isEditing ? (
                <input
                  name="last_name"
                  type="text"
                  value={displayData.last_name || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.last_name}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Email:</span>
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={displayData.email || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.email}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Phone:</span>
              {isEditing ? (
                <input
                  name="phone_no"
                  type="tel"
                  value={displayData.phone_no || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.phone_no}</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bw-card" style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}>
          <div className="bw-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.5vw, 12px)' }}>
              <div className="bw-card-icon">
                <MapPin size={20} />
              </div>
              <h3 style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(16px, 2.5vw, 18px)' }}>Address Information</h3>
            </div>
          </div>
          <div className="bw-info-grid" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            <div className="bw-info-item" style={{ gridColumn: 'span 2' }}>
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Address:</span>
              {isEditing ? (
                <input
                  name="address"
                  type="text"
                  value={displayData.address || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.address}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>City:</span>
              {isEditing ? (
                <CityAutocomplete
                  value={displayData.city || ''}
                  onChange={(value) => setEditedData({ ...editedData, city: value })}
                  selectedState={displayData.state || ''}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0 }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.city}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>State:</span>
              {isEditing ? (
                <StateAutocomplete
                  value={displayData.state || ''}
                  onChange={(value) => setEditedData({ ...editedData, state: value, city: '' })}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0 }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.state}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Country:</span>
              {isEditing ? (
                <CountryAutocomplete
                  value={displayData.country || ''}
                  onChange={(value) => setEditedData({ ...editedData, country: value })}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0 }}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.country}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Postal Code:</span>
              {isEditing ? (
                <input
                  name="postal_code"
                  type="text"
                  value={displayData.postal_code || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: 'clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 18px) clamp(12px, 2vw, 16px) clamp(38px, 5vw, 44px)', borderRadius: 0, fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(13px, 2vw, 14px)' }}
                  maxLength={5}
                />
              ) : (
                <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.postal_code}</span>
              )}
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bw-card">
          <div className="bw-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 1.5vw, 12px)' }}>
              <div className="bw-card-icon">
                <Shield size={20} />
              </div>
              <h3 style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(16px, 2.5vw, 18px)' }}>Account Details</h3>
            </div>
          </div>
          <div className="bw-info-grid" style={{ fontFamily: 'Work Sans, sans-serif' }}>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Role:</span>
              <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300,fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.role}</span>
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Tier:</span>
              <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>{userInfo.tier || 'N/A'}</span>
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Member Since:</span>
              <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>
                {new Date(userInfo.created_on).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 400, fontSize: 'clamp(12px, 1.8vw, 13px)' }}>Last Updated:</span>
              <span className="bw-info-value" style={{ fontFamily: 'Work Sans, sans-serif', fontWeight: 300, fontSize: 'clamp(13px, 2vw, 14px)' }}>
                {new Date(userInfo.updated_on).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div style={{ marginTop: 'clamp(24px, 4vw, 32px)', display: 'flex', gap: 'clamp(8px, 1.5vw, 12px)' }}>
          <Link to="/rider/dashboard" style={{ textDecoration: 'none' }}>
            <button 
              className="bw-btn" 
              style={{ 
                borderRadius: 0, 
                padding: 'clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 24px)', 
                fontFamily: 'Work Sans, sans-serif', 
                fontWeight: 500,
                background: 'var(--bw-bg)',
                color: 'var(--bw-fg)',
                border: '1px solid var(--bw-fg)',
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}
            >
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
