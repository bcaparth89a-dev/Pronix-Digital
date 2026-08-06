import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GlobalErrorBoundary() {
  const error = useRouteError();
  const isDev = import.meta.env.DEV;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center relative overflow-hidden bg-mesh">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10 max-w-md w-full flex flex-col items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group mb-10 focus-visible:outline-none">
          <img
            src="/branding/logo-mark.svg"
            alt="Pronix Digital"
            width="36"
            height="36"
            className="h-9 w-9 object-contain"
          />
        </Link>

        {/* Branded Warning Box */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive border border-destructive/20 animate-pulse">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-stone-600">
          An unexpected error occurred while loading this page. Please try refreshing or return to the home page.
        </p>

        {/* Stack trace display in development */}
        {isDev && error && (
          <div className="mt-6 w-full rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left overflow-x-auto max-h-60 scrollbar-none">
            <p className="text-xs font-bold text-destructive font-mono mb-1">
              [DEV MODE] {error.statusText || error.message || String(error)}
            </p>
            {error.stack && (
              <pre className="text-[10px] font-mono text-stone-500 leading-normal whitespace-pre">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            onClick={handleReload}
            className="h-10 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground font-semibold px-6 gap-2 text-xs uppercase tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reload Page
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-full border-border bg-transparent text-foreground hover:bg-muted font-semibold px-6 gap-2 text-xs uppercase tracking-wider"
            asChild
          >
            <Link to="/">
              <Home className="h-3.5 w-3.5" /> Go to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
