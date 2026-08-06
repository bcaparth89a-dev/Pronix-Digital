import { Navigate, Outlet, useLocation } from "react-router-dom";
import { publicRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AdminProtectedRoute() {
  const location = useLocation();
  const { isAdmin, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={publicRoutes.adminLogin} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

