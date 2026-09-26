// src/components/tenant/TenantLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../layout/Navbar";
import TenantSidebar from "./TenantSidebar";
import { useSidebar } from "../../hooks/useSidebar";
import RecoveryEmailGuard from "../ui/RecoveryEmailGuard";
import FloatingAssistant from "../assistant/FloatingAssistant";

const TenantLayout = () => {
  const { isOpen, toggle, close, isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 transition-colors print:bg-white dark:bg-gray-950">
      <Navbar toggleSidebar={toggle} isCollapsed={isCollapsed} />

      <div className="flex pt-16 print:pt-0">
        <TenantSidebar isOpen={isOpen} onClose={close} isCollapsed={isCollapsed} />

        <main
          className={[
            "flex-1 transition-all duration-300",
            isCollapsed ? "lg:pl-20" : "lg:pl-64",
            "print:pl-0",
          ].join(" ")}
        >
          <div className="p-4 md:p-6 lg:p-8 print:p-0">
            <Outlet />
          </div>
        </main>
      </div>

      <RecoveryEmailGuard securityPagePath="/tenant/security" />

      <FloatingAssistant />
    </div>
  );
};

export default TenantLayout;