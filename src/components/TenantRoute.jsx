import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "./ui/index.js";
import { useMyRoles } from "../hooks/useMyRoles.js";

const TenantRoute = () => {
  const { isTenant, hasAdminAccess, loading, error } = useMyRoles();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error && hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  if (!error && !isTenant) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default TenantRoute;