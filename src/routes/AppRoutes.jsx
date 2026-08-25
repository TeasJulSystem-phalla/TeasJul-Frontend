import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../page/Dashboard';
import Placeholder from '../page/Placeholder';
import LoginPage from '../page/auth/LoginPage';
import UiShowcase from '../components/ui/UiShowcase';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Placeholder title="Properties" />} />
            <Route path="/tenants" element={<Placeholder title="Tenants" />} />
            <Route path="/contracts" element={<Placeholder title="Contracts" />} />
            <Route path="/finance" element={<Placeholder title="Finance" />} />
            <Route path="/utilities" element={<Placeholder title="Utilities" />} />
            <Route path="/maintenance" element={<Placeholder title="Maintenance" />} />
            <Route path="/assistant" element={<Placeholder title="AI Assistant" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
            <Route path="/help" element={<Placeholder title="Help & Support" />} />
            <Route path="/ui-showcase" element={<UiShowcase />} />
            <Route path="*" element={<Placeholder title="Page not found" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
