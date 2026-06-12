import { Outlet } from 'react-router-dom'
import SettingsMenuBar from '@components/SettingsMenuBar'

export default function SettingsLayout() {
  return (
    <div className="bw" style={{ display: 'flex', minHeight: '100vh' }}>
      <SettingsMenuBar>
        <Outlet />
      </SettingsMenuBar>
    </div>
  )
}
