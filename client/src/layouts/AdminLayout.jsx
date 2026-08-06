import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";

export function AdminLayout() {
  const navigate = useNavigate();
  const { logoutAdmin, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logoutAdmin();
    navigate(publicRoutes.adminLogin, { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-sm font-semibold">Admin</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AdminNotificationBell />
              <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

