import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <Outlet />
      </div>
    </main>
  );
}
