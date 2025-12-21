import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Shield, LogOut, Edit2, Save, X } from 'lucide-react'
import { getUserInfo, type UserResponse } from '@api/user'
import { useAuthStore } from '@store/auth'
import { useNavigate, Link } from 'react-router-dom'
import { loginRider } from '@api/auth'
import { useTenantInfo } from '@hooks/useTenantInfo'

export default function RiderProfile() {
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
      navigate('/login', { replace: true })
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
    navigate('/login', { replace: true })
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
          fontSize: '16px'
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
        padding: '24px'
      }}>
        <div style={{ 
          color: 'var(--bw-error)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '16px',
          marginBottom: '16px'
        }}>
          {error || 'Failed to load profile'}
        </div>
        <button 
          className="bw-btn" 
          onClick={loadUserInfo}
          style={{ 
            borderRadius: 0, 
            padding: '14px 24px', 
            fontFamily: 'Work Sans, sans-serif', 
            fontWeight: 500 
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const displayData = isEditing ? editedData : userInfo

  return (
    <main className="bw" style={{ minHeight: '100vh', backgroundColor: 'var(--bw-bg)', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: 40, 
              fontFamily: 'DM Sans, sans-serif', 
              fontWeight: 200,
              color: 'var(--bw-text)'
            }}>
              Profile
            </h1>
            <p className="small-muted" style={{ 
              marginTop: 6, 
              fontSize: 16, 
              fontFamily: 'Work Sans, sans-serif', 
              fontWeight: 300 
            }}>
              {tenantInfo ? `${tenantInfo.company_name} - Manage your account information` : 'Manage your account information'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEditing ? (
              <button 
                className="bw-btn" 
                onClick={() => setIsEditing(true)}
                style={{ 
                  borderRadius: 0, 
                  padding: '14px 24px', 
                  fontFamily: 'Work Sans, sans-serif', 
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit2 size={16} />
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
                    padding: '14px 24px', 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 500,
                    background: 'var(--bw-bg)',
                    color: 'var(--bw-fg)',
                    border: '1px solid var(--bw-fg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button 
                  className="bw-btn" 
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ 
                    borderRadius: 0, 
                    padding: '14px 24px', 
                    fontFamily: 'Work Sans, sans-serif', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            <button 
              className="bw-btn" 
              onClick={handleLogout}
              style={{ 
                borderRadius: 0, 
                padding: '14px 24px', 
                fontFamily: 'Work Sans, sans-serif', 
                fontWeight: 500,
                background: 'var(--bw-bg)',
                color: 'var(--bw-fg)',
                border: '1px solid var(--bw-fg)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            marginBottom: 24, 
            padding: '12px', 
            backgroundColor: 'rgba(197, 72, 61, 0.1)', 
            border: '1px solid var(--bw-error)', 
            borderRadius: '4px',
            color: 'var(--bw-error)',
            fontSize: '14px',
            fontFamily: 'Work Sans, sans-serif'
          }}>
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bw-card" style={{ marginBottom: '24px' }}>
          <div className="bw-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="bw-card-icon">
                <User className="w-5 h-5" />
              </div>
              <h3 style={{ margin: 0 }}>Personal Information</h3>
            </div>
          </div>
          <div className="bw-info-grid">
            <div className="bw-info-item">
              <span className="bw-info-label">First Name:</span>
              {isEditing ? (
                <input
                  name="first_name"
                  type="text"
                  value={displayData.first_name || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.first_name}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Last Name:</span>
              {isEditing ? (
                <input
                  name="last_name"
                  type="text"
                  value={displayData.last_name || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.last_name}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Email:</span>
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={displayData.email || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.email}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Phone:</span>
              {isEditing ? (
                <input
                  name="phone_no"
                  type="tel"
                  value={displayData.phone_no || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.phone_no}</span>
              )}
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bw-card" style={{ marginBottom: '24px' }}>
          <div className="bw-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="bw-card-icon">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 style={{ margin: 0 }}>Address Information</h3>
            </div>
          </div>
          <div className="bw-info-grid">
            <div className="bw-info-item" style={{ gridColumn: 'span 2' }}>
              <span className="bw-info-label">Address:</span>
              {isEditing ? (
                <input
                  name="address"
                  type="text"
                  value={displayData.address || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.address}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">City:</span>
              {isEditing ? (
                <input
                  name="city"
                  type="text"
                  value={displayData.city || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.city}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">State:</span>
              {isEditing ? (
                <input
                  name="state"
                  type="text"
                  value={displayData.state || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.state}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Country:</span>
              {isEditing ? (
                <input
                  name="country"
                  type="text"
                  value={displayData.country || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.country}</span>
              )}
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Postal Code:</span>
              {isEditing ? (
                <input
                  name="postal_code"
                  type="text"
                  value={displayData.postal_code || ''}
                  onChange={handleInputChange}
                  className="bw-input"
                  style={{ padding: '12px 16px', borderRadius: 0, fontFamily: 'Work Sans, sans-serif' }}
                />
              ) : (
                <span className="bw-info-value">{userInfo.postal_code}</span>
              )}
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bw-card">
          <div className="bw-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="bw-card-icon">
                <Shield className="w-5 h-5" />
              </div>
              <h3 style={{ margin: 0 }}>Account Details</h3>
            </div>
          </div>
          <div className="bw-info-grid">
            <div className="bw-info-item">
              <span className="bw-info-label">Role:</span>
              <span className="bw-info-value">{userInfo.role}</span>
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Tier:</span>
              <span className="bw-info-value">{userInfo.tier || 'N/A'}</span>
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Member Since:</span>
              <span className="bw-info-value">
                {new Date(userInfo.created_on).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="bw-info-item">
              <span className="bw-info-label">Last Updated:</span>
              <span className="bw-info-value">
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
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <Link to={slug ? `/${slug}/riders` : '/rider'} style={{ textDecoration: 'none' }}>
            <button 
              className="bw-btn" 
              style={{ 
                borderRadius: 0, 
                padding: '14px 24px', 
                fontFamily: 'Work Sans, sans-serif', 
                fontWeight: 500,
                background: 'var(--bw-bg)',
                color: 'var(--bw-fg)',
                border: '1px solid var(--bw-fg)'
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
