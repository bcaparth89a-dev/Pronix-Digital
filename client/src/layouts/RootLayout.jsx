import { Outlet } from "react-router-dom";
import { m } from "framer-motion";
import { SeoBridge } from "@/lib/seo";

const MotionMain = m.main;

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoBridge />
      <MotionMain
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Outlet />
      </MotionMain>
    </div>
  );
}
