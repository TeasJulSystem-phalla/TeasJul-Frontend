import { Navigate, Outlet } from "react-router-dom";
import { useMyRoles } from "../hooks/useMyRoles.js";
import Spinner from "../components/ui/Spinner.jsx";

const ManagerRoute = () => {
  const { isManager, loading, error } = useMyRoles();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!error && !isManager) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ManagerRoute;
