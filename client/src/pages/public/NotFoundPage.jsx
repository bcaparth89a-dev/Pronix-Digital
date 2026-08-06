import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { resolveSeoMetadata, useSeoMetadata } from "@/lib/seo";

export function NotFoundPage() {
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://pronixdigital.tech";

  useSeoMetadata(
    resolveSeoMetadata({
      pathname: "/404",
      title: "Page Not Found",
      description: "The page you are looking for does not exist or has been moved.",
      robots: "noindex,nofollow",
      noindex: true,
      breadcrumbs: [
        { name: "Pronix Digital", url: `${siteOrigin}/` },
        { name: "Page Not Found", url: `${siteOrigin}/404` },
      ],
    }),
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-8xl font-black text-primary/20 select-none">404</div>
      <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8 text-base">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link to={publicRoutes.home}>
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
