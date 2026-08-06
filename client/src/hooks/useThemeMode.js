import { useTheme } from "next-themes";

export function useThemeMode() {
  try {
    const context = useTheme();
    return context || { theme: "light", resolvedTheme: "light", setTheme: () => {} };
  } catch {
    return { theme: "light", resolvedTheme: "light", setTheme: () => {} };
  }
}
