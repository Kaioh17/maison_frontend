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
import UpdateBanner from '@components/UpdateBanner'
import AssistantLauncher from '@components/AssistantLauncher'
import SubscriptionGate from '@components/SubscriptionGate'
import PilotGate from '@components/PilotGate'
import { useFavicon } from '@hooks/useFavicon'
import { useRoleManifest } from '@hooks/useRoleManifest'
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

/** Layout route: one guarded rider shell (header, tab bar, data) around every rider tab. */
function RiderLayout() {
  return (
    <RiderRoute>
      <RiderShell />
    </RiderRoute>
  )
}

/**
 * Driver-facing routes: same tenant CSS variable overrides as {@link RiderRoute}
 * (`RiderBrandedShell` sets `--bw-*` from slug verification).
 *
 * On the apex host there is no tenant slug, so `SlugVerification` (which 404s without one) is
 * skipped; drivers who sign in at the apex still get the app, with Maison's default palette.
 */
function DriverRoute({ children }: { children: ReactNode }) {
  const slug = useTenantSlug()
  const app = (
    <RiderBrandedShell>
      <ProtectedRoute allowRoles={["driver"]}>{children}</ProtectedRoute>
    </RiderBrandedShell>
  )
  return slug ? <SlugVerification>{app}</SlugVerification> : app
}

/** Layout route: one guarded driver shell (header, tab bar, data) around every driver tab. */
function DriverLayout() {
  return (
    <DriverRoute>
      <DriverShell />
    </DriverRoute>
  )
}

// Route-level code splitting: pages load on demand
const Landing = lazy(() => import('@pages/Landing'))
const TenantLanding = lazy(() => import('@pages/TenantLanding'))
const About = lazy(() => import('@pages/About'))
const Pricing = lazy(() => import('@pages/Pricing'))
const Login = lazy(() => import('@pages/Login'))
const Signup = lazy(() => import('@pages/Signup'))
const TenantShell = lazy(() => import('@pages/tenant/TenantShell'))
const OverviewTab = lazy(() => import('@pages/tenant/OverviewTab'))
const DriversTab = lazy(() => import('@pages/tenant/DriversTab'))
const RidersTab = lazy(() => import('@pages/tenant/RidersTab'))
const BookingsTab = lazy(() => import('@pages/tenant/BookingsTab'))
const VehiclesTab = lazy(() => import('@pages/tenant/VehiclesTab'))
const PayoutsTab = lazy(() => import('@pages/tenant/PayoutsTab'))
const FeedbackTab = lazy(() => import('@pages/tenant/FeedbackTab'))
const AssistantTab = lazy(() => import('@pages/tenant/AssistantTab'))
const DriverShell = lazy(() => import('@pages/driver/DriverShell'))
const DriverHomeTab = lazy(() => import('@pages/driver/HomeTab'))
const DriverRidesTab = lazy(() => import('@pages/driver/RidesTab'))
const DriverEarningsTab = lazy(() => import('@pages/driver/EarningsTab'))
const DriverAccountTab = lazy(() => import('@pages/driver/AccountTab'))
const DriverLogin = lazy(() => import('@pages/DriverLogin'))
const DriverRegistration = lazy(() => import('@pages/DriverRegistration'))
const DriverVerify = lazy(() => import('@pages/DriverVerify'))
const DriverApply = lazy(() => import('@pages/DriverApply'))
const RiderRegistration = lazy(() => import('@pages/rider/RegisterPage'))
const RiderShell = lazy(() => import('@pages/rider/RiderShell'))
const RiderHomeTab = lazy(() => import('@pages/rider/HomeTab'))
const RiderBookTab = lazy(() => import('@pages/rider/BookTab'))
const RiderTripsTab = lazy(() => import('@pages/rider/TripsTab'))
const RiderFleetTab = lazy(() => import('@pages/rider/FleetTab'))
const RiderProfileTab = lazy(() => import('@pages/rider/ProfileTab'))
const RiderLogin = lazy(() => import('@pages/rider/LoginPage'))
const RiderForgotPassword = lazy(() => import('@pages/rider/PasswordReset').then(m => ({ default: () => <m.ForgotPasswordPage role="rider" /> })))
const RiderResetPassword = lazy(() => import('@pages/rider/PasswordReset').then(m => ({ default: () => <m.ResetPasswordPage role="rider" /> })))
const DriverForgotPassword = lazy(() => import('@pages/rider/PasswordReset').then(m => ({ default: () => <m.ForgotPasswordPage role="driver" /> })))
const DriverResetPassword = lazy(() => import('@pages/rider/PasswordReset').then(m => ({ default: () => <m.ResetPasswordPage role="driver" /> })))
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
const Billing = lazy(() => import('@pages/settings/Billing'))
const FeedbackFormsSettings = lazy(() => import('@pages/settings/FeedbackFormsSettings'))
const Help = lazy(() => import('@pages/settings/Help'))
const LegalPilot = lazy(() => import('@pages/settings/LegalPilot'))
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
const ResetPassword = lazy(() => import('@pages/ResetPassword'))
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
        minHeight: 'var(--app-h)',
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
  useRoleManifest()

  return (
    <div className="app-root">
      <UpdateBanner />
      <AccountVerificationNotification />
      <AssistantLauncher />
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
      <Route path="/pricing" element={<SubdomainBlock><Pricing /></SubdomainBlock>} />
      <Route path="/about" element={<SubdomainBlock><About /></SubdomainBlock>} />
      <Route path="/signup" element={<SubdomainBlock><Signup /></SubdomainBlock>} />
      <Route path="/forgot-password" element={<SubdomainBlock><ForgotPassword /></SubdomainBlock>} />
      <Route path="/reset-password" element={<SubdomainBlock><ResetPassword /></SubdomainBlock>} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      {/* Not wrapped in SubdomainBlock, matching /terms and /privacy: the legal
          pages must stay reachable from an Operator's branded subdomain too. */}
      <Route path="/subprocessors" element={<Subprocessors />} />
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
      <Route path="/success" element={<TenantRouteBlock><Success /></TenantRouteBlock>} />
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
              <PilotGate>
                <SubscriptionGate>
                  <TenantShell />
                </SubscriptionGate>
              </PilotGate>
            </ProtectedRoute>
          </TenantRouteBlock>
        }
      >
        <Route path="/tenant/overview" element={<OverviewTab />} />
        <Route path="/tenant/drivers" element={<DriversTab />} />
        <Route path="/tenant/riders" element={<RidersTab />} />
        <Route path="/tenant/bookings" element={<BookingsTab />} />
        <Route path="/tenant/vehicles" element={<VehiclesTab />} />
        <Route path="/tenant/payouts" element={<PayoutsTab />} />
        <Route path="/tenant/assistant" element={<AssistantTab />} />
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
              <PilotGate>
                <SubscriptionGate>
                  <SettingsLayout />
                </SubscriptionGate>
              </PilotGate>
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
        <Route path="/tenant/settings/billing" element={<Billing />} />
        <Route path="/tenant/settings/legal" element={<LegalPilot />} />
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
      <Route path="/tenant_settings" element={<Navigate to="/tenant/settings/tenant-settings" replace />} />
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

      {/* Pre-redesign driver URLs (bookmarks, emailed links) */}
      <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
      <Route path="/driver/vehicles" element={<Navigate to="/driver/account" replace />} />
      <Route path="/driver/bookings/new-requests" element={<Navigate to="/driver/rides?tab=requests" replace />} />
      <Route path="/driver/bookings/all" element={<Navigate to="/driver/rides?tab=history" replace />} />
      <Route path="/driver/bookings/*" element={<Navigate to="/driver/rides" replace />} />

      {/* White-label rider routes with subdomain.
          Every protected rider route is wrapped in RiderRoute which adds
          RiderBrandedShell — driving CSS custom property overrides from the
          tenant's branding row across the entire subtree.
          /riders/login + /riders/register are public, so they skip ProtectedRoute
          but still get the tenant palette from RiderBrandedShell. */}
      <Route element={<RiderLayout />}>
        <Route path="/rider/dashboard" element={<RiderHomeTab />} />
        <Route path="/rider/book" element={<RiderBookTab />} />
        <Route path="/rider/see-bookings" element={<RiderTripsTab />} />
        <Route path="/rider/vehicles" element={<RiderFleetTab />} />
        <Route path="/riders/profile" element={<RiderProfileTab />} />
      </Route>
      <Route path="/rider/drivers" element={<Navigate to="/rider/dashboard" replace />} />

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
            <RiderBrandedShell>
              <RiderLogin />
            </RiderBrandedShell>
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
            <RiderBrandedShell>
              <RiderRegistration />
            </RiderBrandedShell>
          </SlugVerification>
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
        path="/riders/forgot-password"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <RiderForgotPassword />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/riders/reset-password"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <RiderResetPassword />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/forgot-password"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <DriverForgotPassword />
            </RiderBrandedShell>
          </SlugVerification>
        }
      />

      <Route
        path="/driver/reset-password"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <DriverResetPassword />
            </RiderBrandedShell>
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
        path="/driver/apply"
        element={
          <SlugVerification>
            <RiderBrandedShell>
              <DriverApply />
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

      <Route element={<DriverLayout />}>
        <Route path="/driver/dashboard" element={<DriverHomeTab />} />
        <Route path="/driver/rides" element={<DriverRidesTab />} />
        <Route path="/driver/earnings" element={<DriverEarningsTab />} />
        <Route path="/driver/account" element={<DriverAccountTab />} />
      </Route>

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