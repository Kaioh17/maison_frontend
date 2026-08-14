import { Outlet } from 'react-router-dom'
import SettingsMenuBar from '@components/SettingsMenuBar'

export default function SettingsLayout() {
  return (
    <div className="bw settings-shell">
      <SettingsMenuBar>
        <Outlet />
      </SettingsMenuBar>
    </div>
  )
}
