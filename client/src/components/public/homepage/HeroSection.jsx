import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { CapabilitySection } from "./CapabilitySection";

export function HeroSection() {
  return (
    <section className="relative h-auto min-h-[100dvh] lg:h-[100dvh] flex items-center justify-center overflow-hidden bg-background pt-24 sm:pt-28 lg:pt-16 pb-8 lg:pb-0 border-b border-border bg-mesh hero-section">
      {/* Subtle mesh background noise & structural lines */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" aria-hidden="true" />

      {/* Layered Architectural SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Soft, natural paper texture filter for tactile background depth */}
          <filter id="hero-paper-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 0.025 0" />
          </filter>

          {/* Subtle Blueprint Grid Pattern */}
          <pattern id="hero-blueprint-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Minor grid lines (30px sub-divisions) */}
            <path
              d="M 30 0 L 30 120 M 60 0 L 60 120 M 90 0 L 90 120 M 0 30 L 120 30 M 0 60 L 120 60 M 0 90 L 120 90"
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="0.4"
              strokeOpacity="0.04"
            />
            {/* Major grid lines (120px divisions) */}
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.6"
              strokeOpacity="0.07"
            />
            {/* Tiny dot at pattern intersection */}
            <circle cx="60" cy="60" r="0.6" fill="hsl(var(--foreground))" opacity="0.05" />
          </pattern>
        </defs>

        {/* Textured paper sheet background */}
        <rect width="100%" height="100%" filter="url(#hero-paper-noise)" />

        {/* Masked technical grid layer (disappears behind headline text) */}
        <rect width="100%" height="100%" fill="url(#hero-blueprint-grid)" mask="url(#hero-grid-mask)" />

        {/* ================= DRAFTING BOUNDARY LINES & TICKS ================= */}
        {/* Main frame lines near boundaries */}
        <g opacity="0.05">
          {/* Guide lines */}
          <line x1="60" y1="80" x2="1380" y2="80" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          <line x1="60" y1="720" x2="1380" y2="720" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          <line x1="120" y1="60" x2="120" y2="740" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          <line x1="1320" y1="60" x2="1320" y2="740" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
        </g>

        {/* ================= CORNER ALIGNMENT MARKERS (All breakpoints) ================= */}
        <g opacity="0.06">
          {/* Corner brackets */}
          <path d="M 60 120 L 60 60 L 120 60" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          <path d="M 1380 120 L 1380 60 L 1320 60" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          <path d="M 60 680 L 60 740 L 120 740" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          <path d="M 1380 680 L 1380 740 L 1320 740" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />

          {/* Corner crosshairs */}
          <g stroke="hsl(var(--primary))" strokeWidth="0.5">
            <line x1="90" y1="100" x2="110" y2="100" />
            <line x1="100" y1="90" x2="100" y2="110" />
            <circle cx="100" cy="100" r="3" fill="none" />

            <line x1="1330" y1="100" x2="1350" y2="100" />
            <line x1="1340" y1="90" x2="1340" y2="110" />
            <circle cx="1340" cy="100" r="3" fill="none" />

            <line x1="90" y1="700" x2="110" y2="700" />
            <line x1="100" y1="690" x2="100" y2="710" />
            <circle cx="100" cy="700" r="3" fill="none" />

            <line x1="1330" y1="700" x2="1350" y2="700" />
            <line x1="1340" y1="690" x2="1340" y2="710" />
            <circle cx="1340" cy="700" r="3" fill="none" />
          </g>
        </g>

        {/* ================= TABLET & DESKTOP DETAILS (Medium Complexity) ================= */}
        <g className="hidden md:block">
          <g opacity="0.06" stroke="hsl(var(--foreground))" strokeWidth="0.5" fill="none">
            <line x1="1240" y1="40" x2="1380" y2="180" />
            <rect x="1270" y="90" width="14" height="14" />
            <line x1="1270" y1="90" x2="1284" y2="104" />
            <rect x="160" y="714" width="24" height="4" />
            <line x1="168" y1="714" x2="168" y2="718" />
            <line x1="176" y1="714" x2="176" y2="718" />
          </g>

          <g opacity="0.05" stroke="hsl(var(--foreground))" strokeWidth="0.5">
            <line x1="160" y1="720" x2="160" y2="724" />
            <line x1="170" y1="720" x2="170" y2="722" />
            <line x1="180" y1="720" x2="180" y2="722" />
            <line x1="190" y1="720" x2="190" y2="722" />
            <line x1="200" y1="720" x2="200" y2="722" />
            <line x1="210" y1="720" x2="210" y2="722" />
            <line x1="220" y1="720" x2="220" y2="724" />
          </g>

          <g fontFamily="monospace" fontSize="6.5" fill="hsl(var(--foreground))">
            <text x="135" y="195" opacity="0.04">LOC_X: 120.00 // CAL_REF_01</text>
            <text x="1305" y="595" textAnchor="end" opacity="0.04">LOC_Y: 600.00 // CAL_REF_02</text>
          </g>
        </g>

        {/* ================= DESKTOP-ONLY DETAILS ================= */}
        <g className="hidden lg:block">
          <g fontFamily="monospace" fontSize="7" fill="hsl(var(--foreground))" letterSpacing="0.05em">
            <text x="80" y="52" opacity="0.05">PRNX_REF_DRAFT // SHEET_01A</text>
            <text x="1360" y="52" textAnchor="end" opacity="0.05">SYS_COORD_REF [1440.00 x 800.00]</text>
            <text x="80" y="756" fill="hsl(var(--primary))" opacity="0.06">SCALE: 1:20 [A3_FORMAT]</text>
            <text x="1360" y="756" textAnchor="end" fill="hsl(var(--primary))" opacity="0.06">MUJI_STYLE_2.0 // EST_2024</text>
          </g>
        </g>
      </svg>

      <div className="container relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-16 items-center justify-between max-w-[1300px] mx-auto w-full hero-grid-container">
          {/* Left side: content */}
          <div className="md:col-span-7 lg:col-span-6 space-y-4 lg:space-y-5 hero-left-column">
            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="font-display font-bold leading-[1.15] tracking-tight text-foreground text-balance hero-heading"
              style={{ fontSize: "clamp(2.5rem, 5.2vw, 4.5rem)" }}
            >
              Software that helps your business <span className="italic text-primary font-normal">grow faster</span>.
            </m.h1>

            <m.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-xl hero-paragraph"
            >
              We design and build premium business websites, custom mobile apps, and software tools that streamline your operations and scale as your business grows.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="flex flex-col sm:flex-row gap-3 pt-1 hero-buttons-container"
            >
              <Button size="lg" className="h-10 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground font-semibold px-8 shadow-none border-none text-xs sm:text-sm gap-2" asChild>
                <Link to={publicRoutes.contact}>
                  Book a Consultation <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-10 rounded-full border-border bg-transparent text-foreground hover:bg-[#EEE7DD] font-semibold px-8 text-xs sm:text-sm"
                asChild
              >
                <Link to={publicRoutes.portfolio}>View Completed Work</Link>
              </Button>
            </m.div>

            {/* Metrics beneath CTAs */}
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 hero-stats-container"
            >
              {[
                { value: "5+", label: "Years Experience" },
                { value: "50+", label: "Projects Delivered" },
                { value: "25+", label: "Technologies Used" },
                { value: "100%", label: "Custom Solutions" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-2xl border border-border/85 bg-[#FCFBF9] hover:border-primary/20 hover:shadow-xl-soft transition-all duration-300">
                  <div className="font-display text-base lg:text-lg font-bold text-primary">{item.value}</div>
                  <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5 leading-tight">{item.label}</div>
                </div>
              ))}
            </m.div>
          </div>

          {/* Right side: animated capabilities marquee */}
          <div className="md:col-span-5 lg:col-span-6 w-full mt-4 md:mt-0 flex justify-center md:justify-end capability-panel-container hero-right-column">
            <m.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.15 }}
            >
              <CapabilitySection />
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
