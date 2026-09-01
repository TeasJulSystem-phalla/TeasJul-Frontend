import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../page/Dashboard';
import Placeholder from '../page/Placeholder';
import Properties from '../page/Room/Properties';
import HouseDetailPage from '../page/House/HouseDetailPage';
import HouseAccessPage from '../page/House/HouseAccessPage';
import Users from '../page/user/Users';
import Profile from '../page/user/Profile';
import LoginPage from '../page/auth/LoginPage';
import TenantInvitePage from '../page/auth/TenantInvitePage';
import UiShowcase from '../components/ui/UiShowcase';
import RoomTypesPage from '../page/Room/RoomTypePage';
import RolesPage from '../page/user/Roles';
import RoomsPage from '../page/Room/Rooms';
import AmenitiesPage from '../page/Room/Amenities';
import TenantsPage from '../page/user/Tenants';
import TenantFormPage from '../page/user/TenantFormPage';
import TenantInvitationsPage from '../page/user/TenantInvitations';
import ContractsPage from '../page/ContractDetail/Contracts';
import ContractEditorPage from '../page/ContractDetail/ContractEditorPage';
import ContractDetailPage from '../page/ContractDetail/ContractDetailPage';
import UtilityTypesPage from '../page/Utility/UtilityTypes';
import UtilityMetersPage from '../page/Utility/UtilityMeters';
import UtilityReadingsPage from '../page/Utility/UtilityReadings';
import UtilityRatesPage from '../page/Utility/UtilityRates';
import MaintenanceRequestsPage from '../page/Maintenance/MaintenanceRequests';
import MaintenanceCategoriesPage from '../page/Maintenance/MaintenanceCategories';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tenant/invite" element={<TenantInvitePage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<HouseDetailPage />} />
            <Route path="/access" element={<HouseAccessPage />} />
            <Route path="/users" element={<Users />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/roomtype" element={<RoomTypesPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/amenities" element={<AmenitiesPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/tenants/new" element={<TenantFormPage />} />
            <Route path="/tenants/:id/edit" element={<TenantFormPage />} />
            <Route path="/tenant-invitations" element={<TenantInvitationsPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/new" element={<ContractEditorPage />} />
            <Route path="/contracts/:id/edit" element={<ContractEditorPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
            <Route path="/finance" element={<Placeholder title="ហិរញ្ញវត្ថុ" />} />
            <Route path="/utilities" element={<UtilityTypesPage />} />
            <Route path="/utilities/meters" element={<UtilityMetersPage />} />
            <Route path="/utilities/readings" element={<UtilityReadingsPage />} />
            <Route path="/utilities/rates" element={<UtilityRatesPage />} />
            <Route path="/maintenance" element={<MaintenanceRequestsPage />} />
            <Route path="/maintenance/categories" element={<MaintenanceCategoriesPage />} />
            <Route path="/assistant" element={<Placeholder title="ជំនួយការ AI" />} />
            <Route path="/settings" element={<Placeholder title="ការកំណត់" />} />
            <Route path="/help" element={<Placeholder title="ជំនួយ និងការគាំទ្រ" />} />
            <Route path="/ui-showcase" element={<UiShowcase />} />
            <Route path="*" element={<Placeholder title="រកមិនឃើញទំព័រ" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
