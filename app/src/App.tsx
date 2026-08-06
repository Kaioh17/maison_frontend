import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ProtectedRoute from '@components/ProtectedRoute'
import SlugVerification from '@components/SlugVerification'
import RiderBrandedShell from '@components/RiderBrandedShell'
import SubdomainBlock from '@components/SubdomainBlock'
import RootLanding from '@components/RootLanding'
import TenantRouteBlock from '@components/TenantRouteBlock'
import AdminOpsGate from '@components/AdminOpsGate'
import AccountVerificationNotification from '@components/AccountVerificationNotification'
import { useFavicon } from '@hooks/useFavicon'
import { useTenantSlug } from '@hooks/useTenantSlug'
import { resolveSubdomainLoadingPalette } from '@utils/subdomainLoadingPalette'

/**
 * Shared wrapper for every protected rider-space route. The rendered tree is
 * intentionally identical to inlining `<SlugVerification><RiderBrandedShell>
 * <ProtectedRoute allowRoles={["rider"]}>…</ProtectedRoute></RiderBrandedShell>
 * </SlugVerification>`, so swapping this in is purely a deduplication.
 *
 * Order matters: SlugVerification populates the tenant cache that
 * RiderBrandedShell reads, and the shell must wrap ProtectedRoute so any
 * redirect chrome it renders also picks up the tenant palette.
 */
function RiderRoute({ children }: { children: ReactNode }) {
  return (
    <SlugVerification>
      <RiderBrandedShell>
        <ProtectedRoute allowRoles={["rider"]}>{children}</ProtectedRoute>
      </RiderBrandedShell>
    </SlugVerification>
  )
}

/**
 * Driver-facing subdomain routes: same tenant CSS variable overrides as
 * {@link RiderRoute} (`RiderBrandedShell` sets `--bw-*` from slug verification).
 *
 * `/driver` and `/driver/vehicles` (no `/driver/dashboard` prefix) intentionally
 * omit `SlugVerification` so drivers can still use those paths on the apex host
 * where no tenant slug exists.
 */
function DriverRoute({ children }: { children: ReactNode }) {
  return (
    <SlugVerification>
      <RiderBrandedShell>
        <ProtectedRoute allowRoles={["driver"]}>{children}</ProtectedRoute>
      </RiderBrandedShell>
    </SlugVerification>
  )
}

// Route-level code splitting: pages load on demand
const Landing = lazy(() => import('@pages/Landing'))
const TenantLanding = lazy(() => import('@pages/TenantLanding'))
const DemoDashboard = lazy(() => import('@pages/demo/index'))
const DemoStripeRedirect = lazy(() => import('@pages/demo/StripeRedirect'))
const About = lazy(() => import('@pages/About'))
const Login = lazy(() => import('@pages/Login'))
const Signup = lazy(() => import('@pages/Signup'))
const TenantShell = lazy(() => import('@pages/tenant/TenantShell'))
const OverviewTab = lazy(() => import('@pages/tenant/OverviewTab'))
const DriversTab = lazy(() => import('@pages/tenant/DriversTab'))
const BookingsTab = lazy(() => import('@pages/tenant/BookingsTab'))
const VehiclesTab = lazy(() => import('@pages/tenant/VehiclesTab'))
const FeedbackTab = lazy(() => import('@pages/tenant/FeedbackTab'))
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
const SettingsLayout = lazy(() => import('@pages/settings/SettingsLayout'))
const GeneralView = lazy(() => import('@pages/settings/GeneralView'))
const AccountInformation = lazy(() => import('@pages/settings/AccountInformation'))
const CompanyInformation = lazy(() => import('@pages/settings/CompanyInformation'))
const VehicleConfiguration = lazy(() => import('@pages/settings/VehicleConfiguration'))
const BrandingSettings = lazy(() => import('@pages/settings/BrandingSettings'))
const PricingSettings = lazy(() => import('@pages/settings/PricingSettings'))
const Plans = lazy(() => import('@pages/settings/Plans'))
const FeedbackFormsSettings = lazy(() => import('@pages/settings/FeedbackFormsSettings'))
const Help = lazy(() => import('@pages/settings/Help'))
const HelpAdminGuide = lazy(() => import('@pages/settings/HelpAdminGuide'))
const HelpTroubleshooting = lazy(() => import('@pages/settings/HelpTroubleshooting'))
const StripeDocs = lazy(() => import('@pages/settings/StripeDocs'))
const DriverHelp = lazy(() => import('@pages/DriverHelp'))
const PremiumDriverStart = lazy(() => import('@pages/PremiumDriverStart'))
const AddVehicle = lazy(() => import('@pages/AddVehicle'))
const SubscriptionSelection = lazy(() => import('@pages/SubscriptionSelection'))
const Success = lazy(() => import('@pages/Success'))
const StripeReturn = lazy(() => import('@pages/StripeReturn'))
const StripeReauth = lazy(() => import('@pages/StripeReauth'))
const DeveloperOperations = lazy(() => import('@pages/DeveloperOperations'))
const AdminTenantDetail = lazy(() => import('@pages/AdminTenantDetail'))
const AdminLogin = lazy(() => import('@pages/AdminLogin'))
const AdminCreateAccount = lazy(() => import('@pages/AdminCreateAccount'))
const TempQrEditor = lazy(() => import('@pages/TempQrEditor'))
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'))
const Terms = lazy(() => import('@pages/Terms'))
const Privacy = lazy(() => import('@pages/Privacy'))
const Subprocessors = lazy(() => import('@pages/Subprocessors'))

function PageFallback() {
  const location = useLocation()
  const slug = useTenantSlug()
  const loadingPalette = resolveSubdomainLoadingPalette(slug)
  const isRiderRoute = /^\/riders?\//.test(location.pathname)
  const isGuestDriverRoute = /^\/driver(\/|$)/.test(location.pathname)
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: loadingPalette.bg,
        color: isRiderRoute || isGuestDriverRoute ? loadingPalette.muted : loadingPalette.text,
        fontFamily: 'Work Sans, sans-serif',
        fontSize: 14,
      }}
    >
      <div style={{ opacity: 0.85 }}>Loading…</div>
    </div>
  )
}

export default function App() {
  // Keep tab/app icon + title tenant-branded on subdomains across all routes.
  useFavicon()

  return (
    <div style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}>
      <AccountVerificationNotification />
      <Suspense fallback={<PageFallback />}>
        <Routes>
      <Route
        path="/"
        element={<RootLanding MainLanding={Landing} TenantLanding={TenantLanding} />}
      />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/path/to/glory" element={<AdminCreateAccount />} />
      <Route
        path="/operations"
        element={
          <AdminOpsGate>
            <DeveloperOperations />
          </AdminOpsGate>
        }
      />
      <Route
        path="/tenants/:tenantId"
        element={
          <AdminOpsGate>
            <AdminTenantDetail />
          </AdminOpsGate>
        }
      />
      <Route path="/about" element={<SubdomainBlock><About /></SubdomainBlock>} />
      <Route path="/signup" element={<SubdomainBlock><Signup /></SubdomainBlock>} />
      <Route path="/forgot-password" element={<SubdomainBlock><ForgotPassword /></SubdomainBlock>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      {/* Not wrapped in SubdomainBlock, matching /terms and /privacy: the legal
          pages must stay reachable from an Operator's branded subdomain too. */}
      <Route path="/subprocessors" element={<Subprocessors />} />
      <Route path="/demo" element={<SubdomainBlock><DemoDashboard /></SubdomainBlock>} />
      <Route path="/demo/stripe-redirect" element={<SubdomainBlock><DemoStripeRedirect /></SubdomainBlock>} />
      <Route path="/tools/qr-studio" element={<TempQrEditor />} />
      <Route path="/tools/temp-qr" element={<Navigate to="/tools/qr-studio" replace />} />

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
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <TenantShell />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      >
        <Route path="/tenant/overview" element={<OverviewTab />} />
        <Route path="/tenant/drivers" element={<DriversTab />} />
        <Route path="/tenant/bookings" element={<BookingsTab />} />
        <Route path="/tenant/vehicles" element={<VehiclesTab />} />
        <Route path="/tenant/feedback" element={<FeedbackTab />} />
      </Route>
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
        element={<Navigate to="/tenant/settings/general" replace />}
      />
      {/* Settings layout — SettingsMenuBar mounts once; only Outlet content swaps on navigation */}
      <Route
        element={
          <TenantRouteBlock>
            <ProtectedRoute allowRoles={["tenant"]}>
              <SettingsLayout />
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      >
        <Route path="/tenant/settings/general" element={<GeneralView />} />
        <Route path="/tenant/settings/account" element={<AccountInformation />} />
        <Route path="/tenant/settings/company" element={<CompanyInformation />} />
        <Route path="/tenant/settings/tenant-settings" element={<TenantSettings />} />
        <Route path="/tenant/settings/branding" element={<BrandingSettings />} />
        <Route path="/tenant/settings/feedback-forms" element={<FeedbackFormsSettings />} />
        <Route path="/tenant/settings/pricing" element={<PricingSettings />} />
        <Route path="/tenant/settings/vehicle-config" element={<VehicleConfiguration />} />
        <Route path="/tenant/settings/plans" element={<Plans />} />
        <Route path="/tenant/settings/help" element={<Help />} />
        <Route path="/tenant/settings/help/stripe" element={<StripeDocs />} />
        <Route path="/tenant/settings/help/admin" element={<HelpAdminGuide />} />
        <Route path="/tenant/settings/help/troubleshooting" element={<HelpTroubleshooting />} />
      </Route>
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
            <RiderBrandedShell>
              <DriverDashboard />
            </RiderBrandedShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/vehicles"
        element={
          <ProtectedRoute allowRoles={["driver"]}>
            <RiderBrandedShell>
              <DriverDashboard />
            </RiderBrandedShell>
          </ProtectedRoute>
        }
      />

      {/* White-label rider routes with subdomain.
          Every protected rider route is wrapped in RiderRoute which adds
          RiderBrandedShell — driving CSS custom property overrides from the
          tenant's branding row across the entire subtree.
          /riders/login + /riders/register intentionally opt out: they resolve
          their own palette inline via resolveRiderAuthPalette. */}
      <Route
        path="/rider/dashboard"
        element={
          <RiderRoute>
            <RiderDashboard />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/book"
        element={
          <RiderRoute>
            <RiderDashboard />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/see-bookings"
        element={
          <RiderRoute>
            <RiderDashboard />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/drivers"
        element={
          <RiderRoute>
            <RiderDashboard />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/vehicles"
        element={
          <RiderRoute>
            <RiderDashboard />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/confirm-booking"
        element={
          <RiderRoute>
            <BookingConfirmation />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/payment"
        element={
          <RiderRoute>
            <PaymentPage />
          </RiderRoute>
        }
      />
      <Route
        path="/rider/booking-success"
        element={
          <RiderRoute>
            <BookingSuccess />
          </RiderRoute>
        }
      />
      <Route
        path="/booking/complete"
        element={
          <RiderRoute>
            <BookingComplete />
          </RiderRoute>
        }
      />
      <Route
        path="/booking/failed"
        element={
          <RiderRoute>
            <BookingFailed />
          </RiderRoute>
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
        path="/riders/confirm-booking"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <BookingConfirmation />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/riders/payment"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <PaymentPage />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/riders/booking-success"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <BookingSuccess guestMode />
            </RiderBrandedShell>
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
          <RiderRoute>
            <RiderProfile />
          </RiderRoute>
        }
      />

      {/* White-label driver routes with subdomain — tenant palette via RiderBrandedShell */}
      <Route
        path="/driver/start"
        element={
          <SlugVerification>
            <PremiumDriverStart />
          </SlugVerification>
        }
      />

      <Route
        path="/driver/login"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <DriverLogin />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/verify"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <DriverVerify />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/register"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <DriverRegistration />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/dashboard"
        element={
          <DriverRoute>
            <DriverDashboard />
          </DriverRoute>
        }
      />

      <Route
        path="/driver/bookings"
        element={
          <DriverRoute>
            <DriverDashboard />
          </DriverRoute>
        }
      />
      <Route
        path="/driver/bookings/upcoming"
        element={
          <DriverRoute>
            <DriverDashboard />
          </DriverRoute>
        }
      />
      <Route
        path="/driver/bookings/new-requests"
        element={
          <DriverRoute>
            <DriverDashboard />
          </DriverRoute>
        }
      />
      <Route
        path="/driver/bookings/all"
        element={
          <DriverRoute>
            <DriverDashboard />
          </DriverRoute>
        }
      />

      <Route
        path="/driver/help"
        element={
          <DriverRoute>
            <DriverHelp />
          </DriverRoute>
        }
      />

      {/* Catch all unmatched routes and send users to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
} 