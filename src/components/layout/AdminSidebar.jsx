// src/components/layout/AdminSidebar.jsx
import SidebarShell from './SidebarShell';
import { adminNavigation, ADMIN_BRAND_SUBTITLE } from './navigation/adminNavigation';

const AdminSidebar = ({ codes, ...shellProps }) => (
  <SidebarShell
    {...shellProps}
    codes={codes}
    navGroups={adminNavigation}
    brandSubtitle={ADMIN_BRAND_SUBTITLE}
  />
);

export default AdminSidebar;
