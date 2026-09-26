import { Routes, Route, BrowserRouter, Navigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import TenantLayout from "../components/tenant/TenantLayout";
import ManagerLayout from "../components/manager/ManagerLayout";
import Dashboard from "../page/Dashboard";
import Placeholder from "../page/Placeholder";
import Properties from "../page/Room/Properties";
import HouseOnboardingPage from "../page/Room/HouseOnboardingPage";
import HouseManualSetupPage from "../page/Room/HouseManualSetupPage";
import HouseDetailPage from "../page/House/HouseDetailPage";
import HouseAccessPage from "../page/House/HouseAccessPage";
import Users from "../page/user/Users";
import Profile from "../page/user/Profile";
import SecuritySettingsPage from "../page/SecuritySettingsPage";
import SettingsPage from "../page/SettingsPage";
import LoginPage from "../page/auth/LoginPage";
import ForgotPasswordPage from "../page/auth/ForgotPasswordPage";
import TwoFactorVerifyPage from "../page/auth/TwoFactorVerifyPage";
import TenantInvitePage from "../page/auth/TenantInvitePage";
import UiShowcase from "../components/ui/UiShowcase";
import RoomTypesPage from "../page/Room/RoomTypePage";
import RolesPage from "../page/user/Roles";
import RoomsPage from "../page/Room/Rooms";
import RoomListingPage from "../page/Room/RoomListingPage";
import RoomListingPreviewPage from "../page/Room/RoomListingPreviewPage";
import RoomImportPage from "../page/Room/RoomImportPage";
import RoomMeterImportPage from "../page/Room/RoomMeterImportPage";
import AmenitiesPage from "../page/Room/Amenities";
import TenantsPage from "../page/user/Tenants";
import TenantFormPage from "../page/user/TenantFormPage";
import TenantInvitationsPage from "../page/user/TenantInvitations";
import ContractsPage from "../page/ContractDetail/Contracts";
import ContractEditorPage from "../page/ContractDetail/ContractEditorPage";
import ContractDetailPage from "../page/ContractDetail/ContractDetailPage";
import UtilityTypesPage from "../page/Utility/UtilityTypes";
import UtilityMetersPage from "../page/Utility/UtilityMeters";
import UtilityMeterImportPage from "../page/Utility/UtilityMeterImportPage";
import UtilityReadingsPage from "../page/Utility/UtilityReadings";
import UtilityRatesPage from "../page/Utility/UtilityRates";
import MaintenanceRequestsPage from "../page/Maintenance/MaintenanceRequests";
import MaintenanceCategoriesPage from "../page/Maintenance/MaintenanceCategories";
import TenantHomePage from "../page/tenant/TenantHomePage";
import TenantProfilePage from "../page/tenant/TenantProfilePage";
import TenantMaintenancePage from "../page/tenant/TenantMaintenancePage";
import TenantPaymentsPage from "../page/tenant/TenantPaymentsPage";
import TenantUtilitiesPage from "../page/tenant/TenantUtilitiesPage";
import TenantDashboardPage from "../page/tenant/TenantDashboardPage";
import ManagerDashboardPage from "../page/manager/ManagerDashboardPage";
import ManagerReportPage from "../page/manager/ManagerReportPage";
import OwnerReportPage from "../page/owner/OwnerReportPage";
import TenantInvoiceDetailPage from "../page/tenant/TenantInvoiceDetailPage";
import Invoices from "../page/Invoice/Invoices";
import GenerateInvoice from "../page/Invoice/GenerateInvoice";
import InvoiceDetail from "../page/Invoice/InvoiceDetail";
import PaymentsPage from "../page/Finance/PaymentsPage";
import PaymentMethodsPage from "../page/Finance/PaymentMethodsPage";
import Notifications from "../page/Notifications";
import AssistantPage from "../page/AssistantPage";
import HelpSupportPage from "../page/HelpSupportPage";
import RateTeasJulPage from "../page/RateTeasJulPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ManagerRoute from "./ManagerRoute";
import TenantRoute from "./TenantRoute";
import SuperAdminRoute from "./SuperAdminRoute";
import RoleDashboard from "./RoleDashboard";
import PublicNotFound from "./PublicNotFound";
import OwnerRoomSubmissionsPage from "../page/owner/OwnerRoomSubmissionsPage";
import AdminOverviewPage from "../page/admin/AdminOverviewPage";
import AdminOwnersPage from "../page/admin/AdminOwnersPage";
import AdminSystemDefaultsPage from "../page/admin/AdminSystemDefaultsPage";
import AdminRoomSubmissionsPage from "../page/admin/AdminRoomSubmissionsPage";
import AdminRoomFormPage from "../page/admin/AdminRoomFormPage";
import AdminFeedbackPage from "../page/admin/AdminFeedbackPage";
import AdminPropertiesPage from "../page/admin/AdminPropertiesPage";
import AdminDraftsPage from "../page/admin/AdminDraftsPage";
import AdminPropertyPostingPage from "../page/admin/AdminPropertyPostingPage";
import AdminLoginHistoryPage from "../page/admin/AdminLoginHistoryPage";
import AdminLoginRateLimitSettingsPage from "../page/admin/AdminLoginRateLimitSettingsPage";
import AdminNotificationSettingsPage from "../page/admin/AdminNotificationSettingsPage";
import AdminThemeSettingsPage from "../page/admin/AdminThemeSettingsPage";
import AdminSettingsPage from "../page/admin/AdminSettingsPage";
import AdminTelegramSettingsPage from "../page/admin/AdminTelegramSettingsPage";
import PublicHomePage from "../page/public/HomePage";
import PublicRoomListPage from "../page/public/RoomList";
import PublicRoomDetailPage from "../page/public/RoomDetailPage";
import PublicAboutPage from "../page/public/About";
import PublicRegisterBusinessPage from "../page/public/RegisterBusinessPage";
import PublicMarketingPage from "../page/public/MarketingPage";
import PublicContactPage from "../page/public/ContactPage";

const NOT_FOUND_TITLE = "រកមិនឃើញទំព័រ";

// Redirect helper that keeps :params from the matched URL intact.
const DynamicRedirect = ({ to }) => {
  const params = useParams();
  let target = to;
  Object.entries(params).forEach(([key, value]) => {
    target = target.replace(`:${key}`, value);
  });
  return <Navigate to={target} replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC WEBSITE ================= */}
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/rooms" element={<PublicRoomListPage />} />
        <Route path="/rooms/:id" element={<PublicRoomDetailPage />} />
        <Route path="/about" element={<PublicAboutPage />} />
        <Route path="/register-business" element={<PublicRegisterBusinessPage />} />
        <Route path="/contact" element={<PublicContactPage />} />
        <Route path="/marketing" element={<PublicMarketingPage />} />

        {/* Legacy /public/* URLs -> canonical public URLs */}
        <Route path="/public" element={<Navigate to="/" replace />} />
        <Route path="/public/rooms" element={<Navigate to="/rooms" replace />} />
        <Route path="/public/rooms/:id" element={<DynamicRedirect to="/rooms/:id" />} />
        <Route path="/public/about" element={<Navigate to="/about" replace />} />
        <Route path="/public/register-business" element={<Navigate to="/register-business" replace />} />
        <Route path="/public/marketing" element={<Navigate to="/marketing" replace />} />

        {/* ================= AUTHENTICATION ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/2fa" element={<TwoFactorVerifyPage />} />
        <Route path="/tenant/invite" element={<TenantInvitePage />} />

        {/* Smart role-based dashboard entry point */}
        <Route path="/dashboard" element={<RoleDashboard />} />

        {/* ================= AUTHENTICATED AREAS ================= */}
        <Route element={<ProtectedRoute />}>
          {/* ---------- OWNER (and internal admin shared layout) ---------- */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              {/* Owner dashboard & reports */}
              <Route path="/owner/dashboard" element={<Dashboard />} />
              <Route path="/owner/owner-report" element={<OwnerReportPage />} />

              {/* Owner houses / properties */}
              <Route path="/owner/properties" element={<Properties />} />
              <Route path="/owner/properties/:id" element={<HouseDetailPage />} />
              <Route path="/owner/properties/:id/onboarding" element={<HouseOnboardingPage />} />
              <Route path="/owner/properties/:id/onboarding/import" element={<HouseOnboardingPage />} />
              <Route path="/owner/properties/:id/onboarding/manual" element={<HouseManualSetupPage />} />
              <Route path="/owner/access" element={<HouseAccessPage />} />
              <Route path="/owner/rooms" element={<RoomsPage />} />
              <Route path="/owner/rooms/import" element={<RoomImportPage />} />
              <Route path="/owner/rooms/meters-import" element={<RoomMeterImportPage />} />
              <Route path="/owner/rooms/:roomId/listing" element={<RoomListingPage />} />
              <Route path="/owner/submissions" element={<OwnerRoomSubmissionsPage />} />
              <Route path="/owner/roomtype" element={<RoomTypesPage />} />
              <Route path="/owner/amenities" element={<AmenitiesPage />} />

              {/* Owner tenants, invitations & contracts */}
              <Route path="/owner/tenants" element={<TenantsPage />} />
              <Route path="/owner/tenants/new" element={<TenantFormPage />} />
              <Route path="/owner/tenants/:id/edit" element={<TenantFormPage />} />
              <Route path="/owner/tenant-invitations" element={<TenantInvitationsPage />} />
              <Route path="/owner/contracts" element={<ContractsPage />} />
              <Route path="/owner/contracts/new" element={<ContractEditorPage />} />
              <Route path="/owner/contracts/:id/edit" element={<ContractEditorPage />} />
              <Route path="/owner/contracts/:id" element={<ContractDetailPage />} />

              {/* Owner finance */}
              <Route path="/owner/finance" element={<Navigate to="/owner/finance/payments" replace />} />
              <Route path="/owner/finance/payments" element={<PaymentsPage />} />
              <Route path="/owner/finance/payment-methods" element={<PaymentMethodsPage />} />
              <Route path="/owner/invoices" element={<Invoices />} />
              <Route path="/owner/invoices/generate" element={<GenerateInvoice />} />
              <Route path="/owner/invoices/:id" element={<InvoiceDetail />} />

              {/* Owner utilities & maintenance */}
              <Route path="/owner/utilities" element={<UtilityTypesPage />} />
              <Route path="/owner/utilities/meters" element={<UtilityMetersPage />} />
              <Route path="/owner/utilities/meters/import" element={<UtilityMeterImportPage />} />
              <Route path="/owner/utilities/readings" element={<UtilityReadingsPage />} />
              <Route path="/owner/utilities/rates" element={<UtilityRatesPage />} />
              <Route path="/owner/maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="/owner/maintenance/categories" element={<MaintenanceCategoriesPage />} />

              {/* Owner account / system management */}
              <Route path="/owner/users" element={<Users />} />
              <Route path="/owner/roles" element={<RolesPage />} />
              <Route path="/owner/profile" element={<Profile />} />
              <Route path="/owner/settings" element={<SettingsPage />} />
              <Route path="/owner/settings/security" element={<SecuritySettingsPage />} />
              <Route path="/owner/notifications" element={<Notifications />} />
              <Route path="/owner/assistant" element={<AssistantPage />} />
              <Route path="/owner/feedback" element={<RateTeasJulPage />} />
              <Route path="/owner/help" element={<HelpSupportPage />} />
              <Route path="/owner/ui-showcase" element={<UiShowcase />} />

              {/* Owner fallback */}
              <Route path="/owner/*" element={<Placeholder title={NOT_FOUND_TITLE} />} />
            </Route>

            {/* Owner listing preview (no chrome) */}
            <Route path="/owner/rooms/:roomId/listing/preview" element={<RoomListingPreviewPage />} />

            {/* Legacy Owner URL compatibility redirects */}
            <Route path="/properties" element={<Navigate to="/owner/properties" replace />} />
            <Route path="/properties/:id" element={<DynamicRedirect to="/owner/properties/:id" />} />
            <Route path="/properties/:id/onboarding" element={<DynamicRedirect to="/owner/properties/:id/onboarding" />} />
            <Route path="/properties/:id/onboarding/import" element={<DynamicRedirect to="/owner/properties/:id/onboarding/import" />} />
            <Route path="/properties/:id/onboarding/manual" element={<DynamicRedirect to="/owner/properties/:id/onboarding/manual" />} />
            <Route path="/access" element={<Navigate to="/owner/access" replace />} />
            <Route path="/roomtype" element={<Navigate to="/owner/roomtype" replace />} />
            <Route path="/rooms/import" element={<Navigate to="/owner/rooms/import" replace />} />
            <Route path="/rooms/:roomId/listing" element={<DynamicRedirect to="/owner/rooms/:roomId/listing" />} />
            <Route path="/rooms/:roomId/listing/preview" element={<DynamicRedirect to="/owner/rooms/:roomId/listing/preview" />} />
            <Route path="/submissions" element={<Navigate to="/owner/submissions" replace />} />
            <Route path="/amenities" element={<Navigate to="/owner/amenities" replace />} />
            <Route path="/tenants" element={<Navigate to="/owner/tenants" replace />} />
            <Route path="/tenants/new" element={<Navigate to="/owner/tenants/new" replace />} />
            <Route path="/tenants/:id/edit" element={<DynamicRedirect to="/owner/tenants/:id/edit" />} />
            <Route path="/tenant-invitations" element={<Navigate to="/owner/tenant-invitations" replace />} />
            <Route path="/contracts" element={<Navigate to="/owner/contracts" replace />} />
            <Route path="/contracts/new" element={<Navigate to="/owner/contracts/new" replace />} />
            <Route path="/contracts/:id/edit" element={<DynamicRedirect to="/owner/contracts/:id/edit" />} />
            <Route path="/contracts/:id" element={<DynamicRedirect to="/owner/contracts/:id" />} />
            <Route path="/finance" element={<Navigate to="/owner/finance/payments" replace />} />
            <Route path="/finance/payments" element={<Navigate to="/owner/finance/payments" replace />} />
            <Route path="/finance/payment-methods" element={<Navigate to="/owner/finance/payment-methods" replace />} />
            <Route path="/invoices" element={<Navigate to="/owner/invoices" replace />} />
            <Route path="/invoices/generate" element={<Navigate to="/owner/invoices/generate" replace />} />
            <Route path="/invoices/:id" element={<DynamicRedirect to="/owner/invoices/:id" />} />
            <Route path="/utilities" element={<Navigate to="/owner/utilities" replace />} />
            <Route path="/utilities/meters" element={<Navigate to="/owner/utilities/meters" replace />} />
            <Route path="/utilities/meters/import" element={<Navigate to="/owner/utilities/meters/import" replace />} />
            <Route path="/utilities/readings" element={<Navigate to="/owner/utilities/readings" replace />} />
            <Route path="/utilities/rates" element={<Navigate to="/owner/utilities/rates" replace />} />
            <Route path="/maintenance" element={<Navigate to="/owner/maintenance" replace />} />
            <Route path="/maintenance/categories" element={<Navigate to="/owner/maintenance/categories" replace />} />
            <Route path="/owner-report" element={<Navigate to="/owner/owner-report" replace />} />
            <Route path="/assistant" element={<Navigate to="/owner/assistant" replace />} />
            <Route path="/settings" element={<Navigate to="/owner/settings" replace />} />
            <Route path="/settings/security" element={<Navigate to="/owner/settings/security" replace />} />
            <Route path="/help" element={<Navigate to="/owner/help" replace />} />
            <Route path="/users" element={<Navigate to="/owner/users" replace />} />
            <Route path="/roles" element={<Navigate to="/owner/roles" replace />} />
            <Route path="/profile" element={<Navigate to="/owner/profile" replace />} />
            <Route path="/notifications" element={<Navigate to="/owner/notifications" replace />} />
            <Route path="/ui-showcase" element={<Navigate to="/owner/ui-showcase" replace />} />
          </Route>

          {/* ---------- MANAGER ---------- */}
          <Route element={<ManagerRoute />}>
            <Route element={<ManagerLayout />}>
              <Route path="/manager" element={<ManagerDashboardPage />} />
              <Route path="/manager/reports" element={<ManagerReportPage />} />
              <Route path="/manager/properties" element={<Properties />} />
              <Route path="/manager/properties/:id" element={<HouseDetailPage />} />
              <Route path="/manager/properties/:id/onboarding" element={<HouseOnboardingPage />} />
              <Route path="/manager/properties/:id/onboarding/import" element={<HouseOnboardingPage />} />
              <Route path="/manager/properties/:id/onboarding/manual" element={<HouseManualSetupPage />} />
              <Route path="/manager/access" element={<HouseAccessPage />} />
              <Route path="/manager/profile" element={<Profile />} />
              <Route path="/manager/security" element={<SecuritySettingsPage />} />
              <Route path="/manager/notifications" element={<Notifications />} />
              <Route path="/manager/rooms" element={<RoomsPage />} />
              <Route path="/manager/rooms/import" element={<RoomImportPage />} />
              <Route path="/manager/rooms/meters-import" element={<RoomMeterImportPage />} />
              <Route path="/manager/rooms/:roomId/listing" element={<RoomListingPage />} />
              <Route path="/manager/tenants" element={<TenantsPage />} />
              <Route path="/manager/tenants/new" element={<TenantFormPage />} />
              <Route path="/manager/tenants/:id/edit" element={<TenantFormPage />} />
              <Route path="/manager/tenant-invitations" element={<TenantInvitationsPage />} />
              <Route path="/manager/contracts" element={<ContractsPage />} />
              <Route path="/manager/contracts/new" element={<ContractEditorPage />} />
              <Route path="/manager/contracts/:id/edit" element={<ContractEditorPage />} />
              <Route path="/manager/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/manager/utilities" element={<UtilityTypesPage />} />
              <Route path="/manager/utilities/meters" element={<UtilityMetersPage />} />
              <Route path="/manager/utilities/readings" element={<UtilityReadingsPage />} />
              <Route path="/manager/utilities/rates" element={<UtilityRatesPage />} />
              <Route path="/manager/invoices" element={<Invoices />} />
              <Route path="/manager/invoices/generate" element={<GenerateInvoice />} />
              <Route path="/manager/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/manager/finance/payments" element={<PaymentsPage />} />
              <Route path="/manager/finance/payment-methods" element={<PaymentMethodsPage />} />
              <Route path="/manager/maintenance" element={<MaintenanceRequestsPage />} />
              <Route path="/manager/maintenance/categories" element={<MaintenanceCategoriesPage />} />
              <Route path="/manager/assistant" element={<AssistantPage />} />
              <Route path="/manager/help" element={<HelpSupportPage />} />
              <Route path="/manager/*" element={<Placeholder title={NOT_FOUND_TITLE} />} />
            </Route>

            <Route path="/manager/rooms/:roomId/listing/preview" element={<RoomListingPreviewPage />} />
          </Route>

          {/* ---------- TENANT ---------- */}
          <Route element={<TenantRoute />}>
            <Route element={<TenantLayout />}>
              <Route path="/tenant" element={<TenantHomePage />} />
              <Route path="/tenant/dashboard" element={<TenantDashboardPage />} />
              <Route path="/tenant/profile" element={<TenantProfilePage />} />
              <Route path="/tenant/security" element={<SecuritySettingsPage />} />
              <Route path="/tenant/notifications" element={<Notifications />} />
              <Route path="/tenant/maintenance" element={<TenantMaintenancePage />} />
              <Route path="/tenant/payments" element={<TenantPaymentsPage />} />
              <Route path="/payments" element={<Navigate to="/tenant/payments" replace />} />
              <Route path="/tenant/utilities" element={<TenantUtilitiesPage />} />
              <Route path="/tenant/invoices/:invoiceId" element={<TenantInvoiceDetailPage />} />
              <Route path="/tenant/assistant" element={<AssistantPage />} />
              <Route path="/tenant/*" element={<Placeholder title={NOT_FOUND_TITLE} />} />
            </Route>
          </Route>

          {/* ---------- SUPER ADMIN ---------- */}
          <Route element={<SuperAdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminOverviewPage />} />
              <Route path="/admin/owners" element={<AdminOwnersPage />} />
              <Route path="/admin/system-defaults" element={<AdminSystemDefaultsPage />} />
              <Route path="/admin/rooms/new" element={<AdminRoomFormPage />} />
              <Route path="/admin/properties" element={<AdminPropertiesPage />} />
              <Route path="/admin/properties/drafts" element={<AdminDraftsPage />} />
              <Route path="/admin/properties/new" element={<AdminPropertyPostingPage />} />
              <Route path="/admin/properties/:id/edit" element={<AdminPropertyPostingPage />} />
              <Route path="/admin/submissions" element={<AdminRoomSubmissionsPage />} />
              <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
              <Route path="/admin/settings/security/login-history" element={<AdminLoginHistoryPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />}>
                <Route index element={<Navigate to="security/login-rate-limit" replace />} />
                <Route
                  path="security/login-rate-limit"
                  element={<AdminLoginRateLimitSettingsPage />}
                />
                <Route path="notifications" element={<AdminNotificationSettingsPage />} />
                <Route path="appearance" element={<AdminThemeSettingsPage />} />
                <Route path="telegram" element={<AdminTelegramSettingsPage />} />
              </Route>
              <Route path="/admin/*" element={<Placeholder title={NOT_FOUND_TITLE} />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<PublicNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;