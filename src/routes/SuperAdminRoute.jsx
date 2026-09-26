import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../components/ui/index.js";
import { useMyRoles } from "../hooks/useMyRoles.js";
const SuperAdminRoute = () => {
  const { isSuperAdmin, isOwner, isManager, isTenant, loading, error } = useMyRoles();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error && !isSuperAdmin) {
    if (isOwner) return <Navigate to="/owner/dashboard" replace />;
    if (isManager) return <Navigate to="/manager" replace />;
    if (isTenant) return <Navigate to="/tenant/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;