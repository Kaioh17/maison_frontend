import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '@pages/Landing'
import Login from '@pages/Login'
import Signup from '@pages/Signup'
import TenantDashboard from '@pages/TenantDashboard'
import DriverDashboard from '@pages/DriverDashboard'
import RiderDashboard from '@pages/RiderDashboard'
import RiderRegistration from '@pages/RiderRegistration'
import RiderProfile from '@pages/RiderProfile'
import RiderLogin from '@pages/RiderLogin'
import VehicleRates from '@pages/VehicleRates'
import TenantSettings from '@pages/TenantSettings'
import AddVehicle from '@pages/AddVehicle'
import NotFound from '@pages/NotFound'
import SubscriptionSelection from '@pages/SubscriptionSelection'
import Success from '@pages/Success'
import ProtectedRoute from '@components/ProtectedRoute'
import SlugVerification from '@components/SlugVerification'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/tenant/login"
        element={<Login />}
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <SubscriptionSelection />
          </ProtectedRoute>
        }
      />
      <Route path="/success" element={<Success />} />
      {/* Redirect /tenant to /tenant/overview */}
      <Route
        path="/tenant"
        element={<Navigate to="/tenant/overview" replace />}
      />
      <Route
        path="/tenant/overview"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/drivers"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/bookings"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/rates"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <VehicleRates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/settings"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <TenantSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant_settings"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <TenantSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/add"
        element={
          <ProtectedRoute allowRoles={["tenant"]}>
            <AddVehicle />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver"
        element={
          <ProtectedRoute allowRoles={["driver"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      {/* White-label rider routes with slug */}
      <Route
        path="/:slug/rider/dashboard"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/:slug/rider/book"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/:slug/rider/see-bookings"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/:slug/rider/drivers"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/:slug/rider/vehicles"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      <Route
        path="/:slug/riders/login"
        element={
          <SlugVerification>
            <RiderLogin />
          </SlugVerification>
        }
      />

      <Route
        path="/:slug/riders/register"
        element={
          <SlugVerification>
            <RiderRegistration />
          </SlugVerification>
        }
      />

      <Route
        path="/:slug/riders/profile"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderProfile />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      {/* 404 - Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
} 