import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      cssCodeSplit: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              // React core — must be first to avoid circular chunk warnings
              if (id.includes("react") || id.includes("scheduler")) {
                return "vendor-react";
              }
              // Framer Motion — large, animation only
              if (id.includes("framer-motion")) {
                return "vendor-motion";
              }
              // Lucide icons — large icon library
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              // TanStack Query — data fetching
              if (id.includes("@tanstack")) {
                return "vendor-query";
              }
              // Admin-only dependencies — dnd-kit, react-hook-form, zod
              // These are never needed on public pages
              if (
                id.includes("@dnd-kit") ||
                id.includes("react-hook-form") ||
                id.includes("@hookform") ||
                id.includes("zod")
              ) {
                return "vendor-admin";
              }
              // Radix UI primitives
              if (id.includes("@radix-ui")) {
                return "vendor-ui";
              }
            }
          },
        },
      },
    },
    server: {
      host: true,
      port: Number(env.VITE_PORT) || 5173,
      strictPort: false,
    },
    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 4173,
    },
  };
});
