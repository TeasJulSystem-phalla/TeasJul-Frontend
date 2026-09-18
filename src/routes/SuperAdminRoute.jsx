import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../components/ui/index.js";
import { useMyRoles } from "../hooks/useMyRoles.js";

// Gate for SUPER_ADMIN-only admin areas. The backend enforces the same
// authorization on every /api/admin endpoint.
const SuperAdminRoute = () => {
  const { isSuperAdmin, loading, error } = useMyRoles();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;