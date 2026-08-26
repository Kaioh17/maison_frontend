import { Link } from 'react-router-dom'
import { useAuthStore } from '@store/auth'
import MaisonWordmark from '@components/MaisonWordmark'
import { getTenantAppUrl } from '@config/host'

export default function Header() {
  const { accessToken, logout } = useAuthStore()
  return (
    <div className="header card">
      <div className="brand">
        <MaisonWordmark />
      </div>
      <nav className="hstack">
        {!accessToken ? (
          <>
            <a href={getTenantAppUrl('app', '/tenant/login')} className="btn secondary">Login</a>
            <Link to="/signup" className="btn">Create Account</Link>
          </>
        ) : (
          <button className="btn danger" onClick={logout}>Logout</button>
        )}
      </nav>
    </div>
  )
} 