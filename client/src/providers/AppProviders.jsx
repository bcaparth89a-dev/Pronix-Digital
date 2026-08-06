import { LazyMotion, domMax } from "framer-motion";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

export function AppProviders({ children }) {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <LazyMotion features={domMax} strict>
          {children}
        </LazyMotion>
      </ToastProvider>
    </ReactQueryProvider>
  );
}
