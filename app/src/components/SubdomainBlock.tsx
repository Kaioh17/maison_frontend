import { isMainDomain } from '@utils/subdomain'
import NotFound404 from './NotFound404'

interface SubdomainBlockProps {
  children: React.ReactNode
}

/**
 * Component that blocks access when accessed via subdomain
 * Used to prevent subdomain access to landing pages and other main domain routes
 */
export default function SubdomainBlock({ children }: SubdomainBlockProps) {
  // If on subdomain, show 404
  if (!isMainDomain()) {
    return <NotFound404 />
  }

  // If on main domain, show children
  return <>{children}</>
}

