import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2rem" },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1720px",
      },
    },
    screens: {
      fold: "280px",
      xs:   "360px",
      sm:   "640px",
      md:   "768px",
      lg:   "1024px",
      xl:   "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Inter", "-apple-system", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        "dark-surface": "#3A312B",
        "dark-elevated": "#4A4038",
        moss: {
          DEFAULT: "#6A7362",
          foreground: "#F6F2EC",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "fade-in": "fade-in 0.5s ease forwards",
        "slide-up": "slide-up 0.5s ease forwards",
        "count-up": "count-up 0.3s ease forwards",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { "background-position": "-200% center" },
          "100%": { "background-position": "200% center" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dot-pattern": "radial-gradient(circle, hsl(var(--foreground)/0.15) 1px, transparent 1px)",
        "grid-pattern":
          "linear-gradient(hsl(var(--foreground)/0.05) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)/0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-sm": "20px 20px",
        "dot-md": "28px 28px",
        "grid-sm": "40px 40px",
      },
      boxShadow: {
        "glow-primary": "0 0 20px hsl(var(--primary)/0.3)",
        "glow-primary-lg": "0 0 40px hsl(var(--primary)/0.25)",
        "card-hover": "0 8px 30px -4px rgba(0,0,0,0.12), 0 4px 10px -2px rgba(0,0,0,0.08)",
        "card-hover-dark": "0 8px 30px -4px rgba(0,0,0,0.4), 0 4px 10px -2px rgba(0,0,0,0.3)",
        "xl-soft": "0 20px 60px -10px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [animate],
};
