import { lazy, Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, m as Motion } from "framer-motion";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

// Lazy-load Chatbot to avoid blocking initial paint — it lives in the corner
// and doesn't affect LCP or layout stability
const Chatbot = lazy(() =>
  import("@/components/public/Chatbot").then((m) => ({ default: m.Chatbot }))
);

export function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <Motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1"
        >
          <Outlet />
        </Motion.main>
      </AnimatePresence>
      <Footer />
      {/* Chatbot is deferred — renders after initial paint, no layout impact */}
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </div>
  );
}
