import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@components/ProtectedRoute'
import SlugVerification from '@components/SlugVerification'
import SubdomainBlock from '@components/SubdomainBlock'
import TenantRouteBlock from '@components/TenantRouteBlock'
import AccountVerificationNotification from '@components/AccountVerificationNotification'

// Route-level code splitting: pages load on demand
const Landing = lazy(() => import('@pages/Landing'))
const Login = lazy(() => import('@pages/Login'))
const Signup = lazy(() => import('@pages/Signup'))
const TenantDashboard = lazy(() => import('@pages/TenantDashboard'))
const DriverDashboard = lazy(() => import('@pages/DriverDashboard'))
const DriverLogin = lazy(() => import('@pages/DriverLogin'))
const DriverRegistration = lazy(() => import('@pages/DriverRegistration'))
const DriverVerify = lazy(() => import('@pages/DriverVerify'))
const RiderDashboard = lazy(() => import('@pages/RiderDashboard'))
const RiderRegistration = lazy(() => import('@pages/RiderRegistration'))
const RiderProfile = lazy(() => import('@pages/RiderProfile'))
const RiderLogin = lazy(() => import('@pages/RiderLogin'))
const BookingConfirmation = lazy(() => import('@pages/BookingConfirmation'))
const BookingSuccess = lazy(() => import('@pages/BookingSuccess'))
const PaymentPage = lazy(() => import('@pages/PaymentPage'))
const BookingComplete = lazy(() => import('@pages/BookingComplete'))
const BookingFailed = lazy(() => import('@pages/BookingFailed'))
const VehicleRates = lazy(() => import('@pages/VehicleRates'))
const TenantSettings = lazy(() => import('@pages/TenantSettings'))
const GeneralView = lazy(() => import('@pages/settings/GeneralView'))
const AccountInformation = lazy(() => import('@pages/settings/AccountInformation'))
const CompanyInformation = lazy(() => import('@pages/settings/CompanyInformation'))
const VehicleConfiguration = lazy(() => import('@pages/settings/VehicleConfiguration'))
const BrandingSettings = lazy(() => import('@pages/settings/BrandingSettings'))
const PricingSettings = lazy(() => import('@pages/settings/PricingSettings'))
const Plans = lazy(() => import('@pages/settings/Plans'))
const Help = lazy(() => import('@pages/settings/Help'))
const StripeDocs = lazy(() => import('@pages/settings/StripeDocs'))
const AddVehicle = lazy(() => import('@pages/AddVehicle'))
const NotFound = lazy(() => import('@pages/NotFound'))
const SubscriptionSelection = lazy(() => import('@pages/SubscriptionSelection'))
const Success = lazy(() => import('@pages/Success'))
const StripeReturn = lazy(() => import('@pages/StripeReturn'))
const StripeReauth = lazy(() => import('@pages/StripeReauth'))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading…</div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <AccountVerificationNotification />
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
    </>
  )
} 