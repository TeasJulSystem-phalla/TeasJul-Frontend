// src/components/layout/OwnerSidebar.jsx
import { useMemo } from 'react';
import SidebarShell from './SidebarShell';
import { ownerNavigation, OWNER_BRAND_SUBTITLE, withTenantPayments } from './navigation/ownerNavigation';

const ROLE_TENANT = 'TENANT';

const OwnerSidebar = ({ codes, ...shellProps }) => {
  const isTenant = codes.includes(ROLE_TENANT);

  const navGroups = useMemo(
    () => (isTenant ? withTenantPayments(ownerNavigation) : ownerNavigation),
    [isTenant]
  );

  return (
    <SidebarShell
      {...shellProps}
      codes={codes}
      navGroups={navGroups}
      brandSubtitle={OWNER_BRAND_SUBTITLE}
    />
  );
};

export default OwnerSidebar;
