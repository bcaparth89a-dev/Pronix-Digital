import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";

export function ReactQueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
