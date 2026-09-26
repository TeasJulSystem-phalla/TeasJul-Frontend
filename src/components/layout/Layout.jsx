import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import OwnerSidebar from "./OwnerSidebar";
import { resolveSidebarNav, ADMIN_NAV } from "./navigation/resolveSidebarNav";
import { useSidebar } from "../../hooks/useSidebar";
import { useMyRoles } from "../../hooks/useMyRoles";
import RecoveryEmailGuard from "../ui/RecoveryEmailGuard";
import FloatingAssistant from "../assistant/FloatingAssistant";

const Layout = () => {
  const { isOpen, toggle, close, isCollapsed } = useSidebar();
  const { pathname } = useLocation();
  const { codes } = useMyRoles();

  // The only place that decides between the Admin and the Owner sidebar.
  const { nav } = resolveSidebarNav(pathname, codes);
  const RoleSidebar = nav === ADMIN_NAV ? AdminSidebar : OwnerSidebar;

  return (
    <div className="min-h-screen bg-slate-50 transition-colors print:bg-white dark:bg-gray-950">
      <Navbar toggleSidebar={toggle} isCollapsed={isCollapsed} />

      <div className="flex pt-16 print:pt-0">
        <RoleSidebar isOpen={isOpen} onClose={close} isCollapsed={isCollapsed} codes={codes} />

        <main
          className={[
            "min-w-0 flex-1 transition-all duration-300",
            isCollapsed ? "lg:pl-20" : "lg:pl-64",
            "print:pl-0",
          ].join(" ")}
        >
          <div className="min-w-0 p-4 md:p-6 lg:p-8 print:p-0">
            <Outlet />
          </div>
        </main>
      </div>

      <RecoveryEmailGuard securityPagePath="/owner/settings/security" />

      <FloatingAssistant />
    </div>
  );
};

export default Layout;