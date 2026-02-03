import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from '@pages/Landing'
import Login from '@pages/Login'
import Signup from '@pages/Signup'
import TenantDashboard from '@pages/TenantDashboard'
import DriverDashboard from '@pages/DriverDashboard'
import DriverLogin from '@pages/DriverLogin'
import DriverRegistration from '@pages/DriverRegistration'
import DriverVerify from '@pages/DriverVerify'
import RiderDashboard from '@pages/RiderDashboard'
import RiderRegistration from '@pages/RiderRegistration'
import RiderProfile from '@pages/RiderProfile'
import RiderLogin from '@pages/RiderLogin'
import BookingConfirmation from '@pages/BookingConfirmation'
import BookingSuccess from '@pages/BookingSuccess'
import PaymentPage from '@pages/PaymentPage'
import BookingComplete from '@pages/BookingComplete'
import BookingFailed from '@pages/BookingFailed'
import VehicleRates from '@pages/VehicleRates'
import TenantSettings from '@pages/TenantSettings'
import GeneralView from '@pages/settings/GeneralView'
import AccountInformation from '@pages/settings/AccountInformation'
import CompanyInformation from '@pages/settings/CompanyInformation'
import VehicleConfiguration from '@pages/settings/VehicleConfiguration'
import BrandingSettings from '@pages/settings/BrandingSettings'
import PricingSettings from '@pages/settings/PricingSettings'
import Plans from '@pages/settings/Plans'
import Help from '@pages/settings/Help'
import StripeDocs from '@pages/settings/StripeDocs'
import AddVehicle from '@pages/AddVehicle'
import NotFound from '@pages/NotFound'
import SubscriptionSelection from '@pages/SubscriptionSelection'
import Success from '@pages/Success'
import StripeReturn from '@pages/StripeReturn'
import StripeReauth from '@pages/StripeReauth'
import ProtectedRoute from '@components/ProtectedRoute'
import SlugVerification from '@components/SlugVerification'
import SubdomainBlock from '@components/SubdomainBlock'
import TenantRouteBlock from '@components/TenantRouteBlock'
import AccountVerificationNotification from '@components/AccountVerificationNotification'

export default function App() {
  return (
    <>
      <AccountVerificationNotification />
      <Routes>
      <Route path="/" element={<SubdomainBlock><Landing /></SubdomainBlock>} />
      <Route path="/signup" element={<SubdomainBlock><Signup /></SubdomainBlock>} />

      <Route
        path="/tenant/login"
        element={<TenantRouteBlock><Login /></TenantRouteBlock>}
      />
      <Route
        path="/subscription"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <SubscriptionSelection />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route path="/success" element={<SubdomainBlock><Success /></SubdomainBlock>} />
      {/* Redirect /tenant to /tenant/overview */}
      <Route
        path="/tenant"
        element={
          <TenantRouteBlock>
            <Navigate to="/tenant/overview" replace />
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/overview"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantDashboard />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/drivers"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantDashboard />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/bookings"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantDashboard />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/vehicles"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantDashboard />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/rates"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <VehicleRates />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantSettings />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/general"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <GeneralView />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/account"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <AccountInformation />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/company"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <CompanyInformation />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/tenant-settings"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantSettings />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/branding"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <BrandingSettings />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/pricing"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <PricingSettings />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/vehicle-config"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <VehicleConfiguration />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/plans"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <Plans />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/help"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <Help />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/settings/help/stripe"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <StripeDocs />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/return"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <StripeReturn />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant/reauth"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <StripeReauth />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/tenant_settings"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantSettings />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      />
      <Route
        path="/vehicles/add"
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <AddVehicle />
            </ProtectedRoute>
          </TenantRouteBlock>
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

      <Route
        path="/driver/vehicles"
        element={
          <ProtectedRoute allowRoles={["driver"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      {/* White-label rider routes with subdomain */}
      <Route
        path="/rider/dashboard"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/book"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/see-bookings"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/drivers"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/vehicles"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/confirm-booking"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <BookingConfirmation />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/payment"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <PaymentPage />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/rider/booking-success"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <BookingSuccess />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/booking/complete"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <BookingComplete />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/booking/failed"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <BookingFailed />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      <Route
        path="/riders/login"
        element={
          <SlugVerification>
            <RiderLogin />
          </SlugVerification>
        }
      />

      <Route
        path="/riders/register"
        element={
          <SlugVerification>
            <RiderRegistration />
          </SlugVerification>
        }
      />

      <Route
        path="/riders/profile"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["rider"]}>
              <RiderProfile />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      {/* White-label driver routes with subdomain */}
      <Route
        path="/driver/login"
        element={
          <SlugVerification>
            <DriverLogin />
          </SlugVerification>
        }
      />

      <Route
        path="/driver/verify"
        element={
          <SlugVerification>
            <DriverVerify />
          </SlugVerification>
        }
      />

      <Route
        path="/driver/register"
        element={
          <SlugVerification>
            <DriverRegistration />
          </SlugVerification>
        }
      />

      <Route
        path="/driver/dashboard"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/bookings"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/driver/bookings/upcoming"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/driver/bookings/new-requests"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />
      <Route
        path="/driver/bookings/all"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/vehicles"
        element={
          <SlugVerification>
            <ProtectedRoute allowRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          </SlugVerification>
        }
      />

      {/* 404 - Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  )
} 