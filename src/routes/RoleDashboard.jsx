import { Navigate } from "react-router-dom";
import { Spinner } from "../components/ui/index.js";
import { useAuthStore } from "../store/auth.store";
import { useMyRoles } from "../hooks/useMyRoles.js";

// Smart /dashboard entry point. Routes a signed-in user to the dashboard that
// matches their role. Unauthenticated users are sent to the login page.
const RoleDashboard = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { isOwner, isManager, isTenant, isSuperAdmin, loading, error } =
    useMyRoles();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error) {
    if (isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (isManager) return <Navigate to="/manager" replace />;
    if (isTenant) return <Navigate to="/tenant/dashboard" replace />;
    if (isOwner) return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/" replace />;
};

export default RoleDashboard;