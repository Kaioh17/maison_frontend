import { http } from './http'

/** `legalVersion` is the clickwrap version the user ticked; the backend rejects an unaccepted operator without it. */
export async function loginTenant(email: string, password: string, legalVersion?: string) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await http.post('/v1/auth/login/tenant', form, {
    params: legalVersion ? { legal_version: legalVersion } : undefined,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data as { access_token: string }
}

export async function loginDriver(email: string, password: string) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await http.post('/v1/auth/login/driver', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data as { access_token: string }
}

export async function loginRider(email: string, password: string) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await http.post('/v1/auth/login/rider', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data as { access_token: string }
}

export async function loginAdmin(email: string, password: string) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await http.post('/v1/auth/login/admin', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data as { access_token: string }
}

export async function refreshTenantToken() {
  try {
    const { data } = await http.post('/v1/auth/refresh/manual')
    return data as { access_token: string }
  } catch (error) {
    throw error
  }
}

export async function refreshDriverToken() {
  try {
    const { data } = await http.post('/v1/auth/refresh', {}, {
      withCredentials: true
    })
    return data as { access_token: string }
  } catch (error) {
    throw error
  }
}

export async function refreshRiderToken() {
  try {
    const { data } = await http.post('/v1/auth/refresh', {}, {
      withCredentials: true
    })
    return data as { access_token: string }
  } catch (error) {
    throw error
  }
}

export async function logout() {
  try {
    const { data } = await http.post('/v1/auth/logout', {}, {
      withCredentials: true
    })
    return data as { message: string }
  } catch (error) {
    throw error
  }
}

export async function checkAuthStatus() {
  try {
    // Try to make a request to check if the current token is valid
    const { data } = await http.get('/v1/tenants/me') // You'll need to create this endpoint
    return { isValid: true, user: data }
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { isValid: false, user: null }
    }
    throw error
  }
} 
export type ResetRole = 'tenant' | 'rider' | 'driver'

/** Always resolves the same way for any email: the server never says whether the address is registered. Riders and drivers pass the operator's `slug`. */
export async function requestPasswordReset(role: ResetRole, email: string, slug?: string) {
  await http.post(`/v1/auth/forgot-password/${role}`, { email, slug })
}

export async function resetPassword(role: ResetRole, token: string, password: string) {
  await http.post(`/v1/auth/reset-password/${role}`, { token, password })
}
