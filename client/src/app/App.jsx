import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppProviders } from "@/providers/AppProviders";
import { router } from "@/routes/router";
import { SplashScreen } from "@/components/common/SplashScreen";

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AppProviders>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
