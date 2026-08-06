import { Navigate, Outlet, useLocation } from "react-router-dom";
import { publicRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={publicRoutes.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
