import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdminAppSubdomain } from '@utils/subdomain'

export default function AdminSubdomainGuard({ children }: { children: ReactNode }) {
  if (!isAdminAppSubdomain()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
