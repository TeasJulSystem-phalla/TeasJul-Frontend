import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../components/ui/index.js";
import { useMyRoles } from "../hooks/useMyRoles.js";

const AdminRoute = () => {
  const { isOwner, isTenant, isManager, loading, error } = useMyRoles();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error && isTenant && !isOwner) {
    return <Navigate to="/tenant" replace />;
  }

  if (!error && isManager && !isOwner) {
    return <Navigate to="/manager" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
