// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../page/Dashboard';
import Placeholder from '../page/Placeholder';

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
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
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </Layout>
  );
};

export default AppRoutes;
