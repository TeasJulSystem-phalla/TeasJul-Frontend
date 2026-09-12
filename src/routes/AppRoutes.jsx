import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
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
import RoomImportPage from "../page/Room/RoomImportPage";
import AmenitiesPage from "../page/Room/Amenities";
import TenantsPage from "../page/user/Tenants";
import TenantFormPage from "../page/user/TenantFormPage";
import TenantInvitationsPage from "../page/user/TenantInvitations";
import ContractsPage from "../page/ContractDetail/Contracts";
import ContractEditorPage from "../page/ContractDetail/ContractEditorPage";
import ContractDetailPage from "../page/ContractDetail/ContractDetailPage";
import UtilityTypesPage from "../page/Utility/UtilityTypes";
import UtilityMetersPage from "../page/Utility/UtilityMeters";
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
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ManagerRoute from "./ManagerRoute";
import TenantRoute from "./TenantRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/2fa" element={<TwoFactorVerifyPage />} />
        <Route path="/tenant/invite" element={<TenantInvitePage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/owner-report" element={<OwnerReportPage />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<HouseDetailPage />} />
              <Route path="/properties/:id/onboarding" element={<HouseOnboardingPage />} />
              <Route path="/properties/:id/onboarding/import" element={<HouseOnboardingPage />} />
              <Route path="/properties/:id/onboarding/manual" element={<HouseManualSetupPage />} />
              <Route path="/access" element={<HouseAccessPage />} />
              <Route path="/users" element={<Users />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings/security" element={<SecuritySettingsPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/roomtype" element={<RoomTypesPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/import" element={<RoomImportPage />} />
              <Route path="/amenities" element={<AmenitiesPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/tenants/new" element={<TenantFormPage />} />
              <Route path="/tenants/:id/edit" element={<TenantFormPage />} />
              <Route
                path="/tenant-invitations"
                element={<TenantInvitationsPage />}
              />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/contracts/new" element={<ContractEditorPage />} />
              <Route
                path="/contracts/:id/edit"
                element={<ContractEditorPage />}
              />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route
                path="/finance"
                element={<Navigate to="/finance/payments" replace />}
              />
              <Route path="/finance/payments" element={<PaymentsPage />} />
              <Route
                path="/finance/payment-methods"
                element={<PaymentMethodsPage />}
              />
              <Route path="/utilities" element={<UtilityTypesPage />} />
              <Route path="/utilities/meters" element={<UtilityMetersPage />} />
              <Route
                path="/utilities/readings"
                element={<UtilityReadingsPage />}
              />
              <Route path="/utilities/rates" element={<UtilityRatesPage />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/generate" element={<GenerateInvoice />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route
                path="/maintenance"
                element={<MaintenanceRequestsPage />}
              />
              <Route
                path="/maintenance/categories"
                element={<MaintenanceCategoriesPage />}
              />
              <Route
                path="/assistant"
                element={<AssistantPage />}
              />
              <Route
                path="/settings"
                element={<SettingsPage />}
              />
              <Route
                path="/help"
                element={<HelpSupportPage />}
              />
              <Route path="/ui-showcase" element={<UiShowcase />} />
              <Route path="*" element={<Placeholder title="រកមិនឃើញទំព័រ" />} />
            </Route>
          </Route>

          <Route element={<ManagerRoute />}>
            <Route element={<ManagerLayout />}>
              <Route path="/manager" element={<ManagerDashboardPage />} />
              <Route path="/manager/reports" element={<ManagerReportPage />} />
              <Route path="/manager/properties" element={<Properties />} />
              <Route
                path="/manager/properties/:id"
                element={<HouseDetailPage />}
              />
              <Route
                path="/manager/properties/:id/onboarding"
                element={<HouseOnboardingPage />}
              />
              <Route
                path="/manager/properties/:id/onboarding/import"
                element={<HouseOnboardingPage />}
              />
              <Route
                path="/manager/properties/:id/onboarding/manual"
                element={<HouseManualSetupPage />}
              />
              <Route path="/manager/access" element={<HouseAccessPage />} />
              <Route path="/manager/profile" element={<Profile />} />
              <Route path="/manager/security" element={<SecuritySettingsPage />} />
              <Route
                path="/manager/notifications"
                element={<Notifications />}
              />
              <Route path="/manager/rooms" element={<RoomsPage />} />
              <Route path="/manager/rooms/import" element={<RoomImportPage />} />
              <Route path="/manager/tenants" element={<TenantsPage />} />
              <Route path="/manager/tenants/new" element={<TenantFormPage />} />
              <Route
                path="/manager/tenants/:id/edit"
                element={<TenantFormPage />}
              />
              <Route
                path="/manager/tenant-invitations"
                element={<TenantInvitationsPage />}
              />
              <Route path="/manager/contracts" element={<ContractsPage />} />
              <Route
                path="/manager/contracts/new"
                element={<ContractEditorPage />}
              />
              <Route
                path="/manager/contracts/:id/edit"
                element={<ContractEditorPage />}
              />
              <Route
                path="/manager/contracts/:id"
                element={<ContractDetailPage />}
              />
              <Route path="/manager/utilities" element={<UtilityTypesPage />} />
              <Route
                path="/manager/utilities/meters"
                element={<UtilityMetersPage />}
              />
              <Route
                path="/manager/utilities/readings"
                element={<UtilityReadingsPage />}
              />
              <Route
                path="/manager/utilities/rates"
                element={<UtilityRatesPage />}
              />
              <Route path="/manager/invoices" element={<Invoices />} />
              <Route
                path="/manager/invoices/generate"
                element={<GenerateInvoice />}
              />
              <Route path="/manager/invoices/:id" element={<InvoiceDetail />} />
              <Route
                path="/manager/finance/payments"
                element={<PaymentsPage />}
              />
              <Route
                path="/manager/finance/payment-methods"
                element={<PaymentMethodsPage />}
              />
              <Route
                path="/manager/maintenance"
                element={<MaintenanceRequestsPage />}
              />
              <Route
                path="/manager/maintenance/categories"
                element={<MaintenanceCategoriesPage />}
              />
              <Route
                path="/manager/assistant"
                element={<AssistantPage />}
              />
              <Route
                path="/manager/help"
                element={<HelpSupportPage />}
              />
              <Route
                path="/manager/*"
                element={<Placeholder title="រកមិនឃើញទំព័រ" />}
              />
            </Route>
          </Route>

          <Route element={<TenantRoute />}>
            <Route element={<TenantLayout />}>
              <Route path="/tenant" element={<TenantHomePage />} />
              <Route
                path="/tenant/dashboard"
                element={<TenantDashboardPage />}
              />
              <Route path="/tenant/profile" element={<TenantProfilePage />} />
              <Route path="/tenant/security" element={<SecuritySettingsPage />} />
              <Route path="/tenant/notifications" element={<Notifications />} />
              <Route
                path="/tenant/maintenance"
                element={<TenantMaintenancePage />}
              />
              <Route path="/tenant/payments" element={<TenantPaymentsPage />} />
              <Route
                path="/payments"
                element={<Navigate to="/tenant/payments" replace />}
              />
              <Route
                path="/tenant/utilities"
                element={<TenantUtilitiesPage />}
              />
              <Route
                path="/tenant/invoices/:invoiceId"
                element={<TenantInvoiceDetailPage />}
              />
              <Route
                path="/tenant/assistant"
                element={<AssistantPage />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
