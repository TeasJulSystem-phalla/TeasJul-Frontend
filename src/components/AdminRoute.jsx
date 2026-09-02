import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "./ui/index.js";
import { useMyRoles } from "../hooks/useMyRoles.js";

const AdminRoute = () => {
  const { isTenant, hasAdminAccess, loading, error } = useMyRoles();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error && isTenant && !hasAdminAccess) {
    return <Navigate to="/tenant" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;