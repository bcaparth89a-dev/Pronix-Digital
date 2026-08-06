import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Shared Paper Texture Filter to be declared in defs
const PaperTextureFilter = () => (
  <filter id="shared-paper-noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="matrix" values="1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 0.02 0" />
  </filter>
);

// Hook to defer rendering to client mount
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

// Centered Content Layout boundary wrapper class for public pages
const containerClass = "absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1300px] px-6 md:px-8 pointer-events-none select-none z-0";

// 1. SECTION GRID BACKGROUND (Services sections, Services Page)
export function SectionGridBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>
        
        {/* Soft paper texture */}
        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* 2 Clean offset vertical margins + 50% center division axis (8% opacity) */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="hidden md:block">
          <line x1="0%" y1="0" x2="0%" y2="100%" strokeWidth="0.5" />
          <line x1="50.0%" y1="0" x2="50.0%" y2="100%" strokeWidth="0.5" />
          <line x1="100%" y1="0" x2="100%" y2="100%" strokeWidth="0.5" />
          
          {/* Small top horizontal boundary segment */}
          <line x1="0%" y1="40" x2="10%" y2="40" strokeWidth="0.5" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="md:hidden">
          <line x1="0%" y1="0" x2="0%" y2="100%" strokeWidth="0.4" />
          <line x1="50.0%" y1="0" x2="50.0%" y2="100%" strokeWidth="0.4" />
          <line x1="100%" y1="0" x2="100%" y2="100%" strokeWidth="0.4" />
        </g>
      </svg>
    </div>
  );
}

// 2. HORIZONTAL FLOW BACKGROUND (Operating Model, Step sections)
export function HorizontalFlowBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>
        
        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Vertical divider at column split (x="45%") + top border - 8% opacity */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="hidden md:block">
          <line x1="45%" y1="0" x2="45%" y2="100%" strokeWidth="0.5" />
          <line x1="0%" y1="150" x2="45%" y2="150" strokeWidth="0.5" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="md:hidden">
          <line x1="45%" y1="0" x2="45%" y2="100%" strokeWidth="0.4" />
        </g>
      </svg>
    </div>
  );
}

// 3. GALLERY BACKGROUND (Featured Projects, Portfolio lists)
export function GalleryBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>

        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Card alignment guides matching columns 33.3% and 66.6% - 9% opacity */}
        <g opacity="0.09" stroke="currentColor" fill="none" className="hidden md:block">
          <line x1="33.3%" y1="0" x2="33.3%" y2="100%" strokeWidth="0.5" />
          <line x1="66.6%" y1="0" x2="66.6%" y2="100%" strokeWidth="0.5" />

          {/* Symmetrical border frames at bottom margin */}
          <line x1="0" y1="40" x2="150" y2="40" strokeWidth="0.5" />

          {/* Delicate Corner brackets around the container boundary */}
          <path d="M 0 50 L 30 50 M 30 20 L 30 50" strokeWidth="0.7" />
          <path d="M 100% 50 L calc(100% - 30px) 50 M calc(100% - 30px) 20 L calc(100% - 30px) 50" strokeWidth="0.7" />
          <path d="M 0 calc(100% - 50px) L 30 calc(100% - 50px) M 30 calc(100% - 20px) L 30 calc(100% - 50px)" strokeWidth="0.7" />
          <path d="M 100% calc(100% - 50px) L calc(100% - 30px) calc(100% - 50px) M calc(100% - 30px) calc(100% - 20px) L calc(100% - 30px) calc(100% - 50px)" strokeWidth="0.7" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width, basic column dividers */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="md:hidden">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.4" />
          <path d="M 0 40 L 20 40 M 20 20 L 20 40" strokeWidth="0.6" />
          <path d="M 100% 40 L calc(100% - 20px) 40 M calc(100% - 20px) 20 L calc(100% - 20px) 40" strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  );
}

// 4. EDITORIAL BACKGROUND (Blog list, Blog details)
export function EditorialBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>

        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Vertical magazine column gutters aligned with thirds (33.3% and 66.6%) - 8% opacity */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="hidden md:block">
          <line x1="33.3%" y1="0" x2="33.3%" y2="100%" strokeWidth="0.5" />
          <line x1="66.6%" y1="0" x2="66.6%" y2="100%" strokeWidth="0.5" />
          
          {/* Horizontal top and bottom layout guides */}
          <line x1="0" y1="120" x2="100%" y2="120" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="0" y1="calc(100% - 120px)" x2="100%" y2="calc(100% - 120px)" strokeWidth="0.5" strokeDasharray="4 4" />
          
          {/* Tiny print registration target near corner margins */}
          <circle cx="95%" cy="60" r="4" strokeWidth="0.5" />
          <line x1="95%" y1="52" x2="95%" y2="68" strokeWidth="0.5" />
          <line x1="calc(95% - 8px)" y1="60" x2="calc(95% + 8px)" y2="60" strokeWidth="0.5" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width columns */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="md:hidden">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.4" />
          <line x1="0" y1="100" x2="100%" y2="100%" strokeWidth="0.4" strokeDasharray="3 3" />
        </g>
      </svg>
    </div>
  );
}

// 5. ARCHITECTURAL BACKGROUND (About page, founders)
export function ArchitecturalBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>

        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Sweep arc, vertical center divider, and baseline guide - 9% opacity */}
        <g stroke="currentColor" fill="none" className="hidden md:block">
          {/* Oversized partial sweep corner arc */}
          <path d="M 0 100 A 700 700 0 0 0 700 800" strokeWidth="0.7" opacity="0.09" />
          
          {/* Symmetrical vertical center line */}
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.5" opacity="0.08" />
          <line x1="0" y1="0" x2="0" y2="100%" strokeWidth="0.5" opacity="0.08" />
          <line x1="100%" y1="0" x2="100%" y2="100%" strokeWidth="0.5" opacity="0.08" />
          
          {/* Baseline guide near bottom boundary */}
          <line x1="100" y1="calc(100% - 60px)" x2="calc(100% - 100px)" y2="calc(100% - 60px)" strokeWidth="0.5" opacity="0.07" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width, central vertical divider */}
        <g stroke="currentColor" fill="none" className="md:hidden" opacity="0.08">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.4" />
          <path d="M 0 100 A 400 400 0 0 0 400 500" strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  );
}

// 6. CONTACT BACKGROUND (Contact Page)
export function ContactBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>

        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Vertical divider at split column (x="45%") + edge curves - 8% opacity */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="hidden md:block">
          <line x1="45%" y1="0" x2="45%" y2="100%" strokeWidth="0.5" />
          
          {/* Corner curves entering from margins */}
          <path d="M 0 120 C 150 140, 250 300, 300 450" strokeWidth="0.5" />
          <path d="M 100% 300 C calc(100% - 150px) 450, calc(100% - 250px) 600, 100% 650" strokeWidth="0.5" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="md:hidden">
          <line x1="45%" y1="0" x2="45%" y2="100%" strokeWidth="0.4" />
        </g>
      </svg>
    </div>
  );
}

// 7. DIVIDER GEOMETRY BACKGROUND (FAQ accordion support)
export function DividerGeometryBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn(containerClass, className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
        </defs>

        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Centered vertical guide axis + horizontal guide - 8% opacity */}
        <g opacity="0.08" stroke="currentColor" fill="none">
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="0.5" />
          <line x1="0%" y1="60" x2="100%" y2="60" strokeWidth="0.5" strokeDasharray="3 6" />
        </g>
      </svg>
    </div>
  );
}

// 8. DARK WARM ACCENT BACKGROUND (CTA Section)
export function DarkWarmAccentBackground({ className }) {
  const mounted = useMounted();
  if (!mounted) return null;

  return (
    <div className={cn("absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0", className)}>
      <svg className="w-full h-full text-[#BFA27A]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Warm radial background glow spot - set at 8% opacity */}
          <radialGradient id="cta-warm-glow" cx="25%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#BFA27A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <PaperTextureFilter />
        </defs>
        
        {/* Paper texture overlay */}
        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" opacity="0.4" />

        {/* Warm radial background glow spot */}
        <rect width="100%" height="100%" fill="url(#cta-warm-glow)" />

        {/* Vertical division line at x="55%" (1.1fr vs 0.9fr grid split) - 8% opacity */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="hidden md:block">
          <line x1="55%" y1="0" x2="55%" y2="100%" strokeWidth="0.5" />
          
          {/* Subtle offset border frame inside CTA card */}
          <rect x="24" y="24" width="calc(100% - 48px)" height="calc(100% - 48px)" strokeWidth="0.5" />
        </g>

        {/* Mobile/Tablet layout: 0.4px stroke width, standard boundary frame */}
        <g opacity="0.08" stroke="currentColor" fill="none" className="md:hidden">
          <rect x="16" y="16" width="calc(100% - 32px)" height="calc(100% - 32px)" strokeWidth="0.4" />
        </g>
      </svg>
    </div>
  );
}
