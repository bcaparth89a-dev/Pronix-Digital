import React from "react";
import { cn } from "@/lib/utils";

// Shared Paper Texture Filter
const PaperTextureFilter = () => (
  <filter id="shared-paper-noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="matrix" values="1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 0.02 0" />
  </filter>
);

// Base Dot Grid Component
export function DotGridBackground({
  opacityDesktop = 0.14,
  opacityMobile = 0.10,
  spacingDesktop = 32,
  spacingMobile = 24,
  dotSizeDesktop = 2.0,
  dotSizeMobile = 1.5,
  color = "rgb(122, 78, 58)", // Solid color, opacity is controlled by group opacity prop!
  className,
  children,
}) {
  const idSuffix = React.useId().replace(/:/g, "");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0", className)}>
      <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <PaperTextureFilter />
          
          {/* Desktop Pattern */}
          <pattern
            id={`dot-grid-desktop-${idSuffix}`}
            width={spacingDesktop}
            height={spacingDesktop}
            patternUnits="userSpaceOnUse"
          >
            {/* Setting radius to dotSizeDesktop ensures crisp visibility without subpixel blending issues */}
            <circle cx={spacingDesktop / 2} cy={spacingDesktop / 2} r={dotSizeDesktop} fill={color} />
          </pattern>
          
          {/* Mobile Pattern */}
          <pattern
            id={`dot-grid-mobile-${idSuffix}`}
            width={spacingMobile}
            height={spacingMobile}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={spacingMobile / 2} cy={spacingMobile / 2} r={dotSizeMobile} fill={color} />
          </pattern>

          {/* Soft Edge Fade Mask (85% solid in center, fading to transparent at 100% boundary) */}
          <radialGradient id={`radial-fade-${idSuffix}`} cx="50%" cy="50%" r="70%">
            <stop offset="85%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </radialGradient>

          <mask id={`mask-soft-${idSuffix}`}>
            <rect width="100%" height="100%" fill={`url(#radial-fade-${idSuffix})`} />
          </mask>
        </defs>

        {/* Soft paper texture */}
        <rect width="100%" height="100%" filter="url(#shared-paper-noise)" fill="transparent" />

        {/* Desktop grid - 14% opacity */}
        <g opacity={opacityDesktop} className="hidden md:block" mask={`url(#mask-soft-${idSuffix})`}>
          {children ? (
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  fillPattern: `url(#dot-grid-desktop-${idSuffix})`
                });
              }
              return child;
            })
          ) : (
            <rect width="100%" height="100%" fill={`url(#dot-grid-desktop-${idSuffix})`} />
          )}
        </g>

        {/* Mobile grid - 10% opacity */}
        <g opacity={opacityMobile} className="md:hidden" mask={`url(#mask-soft-${idSuffix})`}>
          {children ? (
            React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  fillPattern: `url(#dot-grid-mobile-${idSuffix})`
                });
              }
              return child;
            })
          ) : (
            <rect width="100%" height="100%" fill={`url(#dot-grid-mobile-${idSuffix})`} />
          )}
        </g>
      </svg>
    </div>
  );
}

// Helper to render customized layout fills (uses CSS style height for calc() support)
function LocalizedGrid({ fillPattern, x = "0", y = "0", width = "100%", height = "100%" }) {
  const hasCalcHeight = typeof height === "string" && height.includes("calc");
  const hasCalcWidth = typeof width === "string" && width.includes("calc");

  return (
    <rect
      x={x}
      y={y}
      width={hasCalcWidth ? undefined : width}
      height={hasCalcHeight ? undefined : height}
      style={{
        width: hasCalcWidth ? width : undefined,
        height: hasCalcHeight ? height : undefined,
      }}
      fill={fillPattern}
    />
  );
}

// 1. HOME SELECTED WORK / PORTFOLIO DOTS
// Concentrated around card areas, faded away near header.
export function SelectedWorkDots() {
  return (
    <DotGridBackground color="rgb(122, 78, 58)">
      {/* desktop starts below header, mobile wraps entire content */}
      <LocalizedGrid x="0" y="250" width="100%" height="calc(100% - 250px)" />
    </DotGridBackground>
  );
}

// 2. JOURNAL DOTS / BLOG LISTING DOTS
// Editorial feel, medium density.
export function JournalDots() {
  return (
    <DotGridBackground color="rgb(191, 162, 122)">
      <LocalizedGrid />
    </DotGridBackground>
  );
}

// 3. FAQ DOTS
// Very low density, restricted to a narrow side column (mostly empty).
export function FaqDots() {
  return (
    <DotGridBackground color="rgb(122, 78, 58)">
      <LocalizedGrid x="0" y="0" width="20%" height="100%" />
    </DotGridBackground>
  );
}

// 4. ABOUT HERO DOTS
// Very low density, restricted to bottom-right layout area.
export function AboutHeroDots() {
  return (
    <DotGridBackground color="rgb(122, 78, 58)">
      <LocalizedGrid x="60%" y="50%" width="40%" height="50%" />
    </DotGridBackground>
  );
}

// 5. MISSION DOTS (Story Split column)
// Grid active only behind the left story text column.
export function MissionDots() {
  return (
    <DotGridBackground color="rgb(122, 78, 58)">
      <LocalizedGrid x="0" y="0" width="45%" height="100%" />
    </DotGridBackground>
  );
}

// 6. VALUES DOTS
// Higher density behind cards group only.
export function ValuesDots() {
  return (
    <DotGridBackground color="rgb(191, 162, 122)">
      <LocalizedGrid x="0" y="200" width="100%" height="calc(100% - 200px)" />
    </DotGridBackground>
  );
}

// 7. SERVICES HERO DOTS
// Low density, fading out at top.
export function ServicesHeroDots() {
  return (
    <DotGridBackground color="rgb(122, 78, 58)">
      <LocalizedGrid />
    </DotGridBackground>
  );
}

// 8. SERVICES BLOCK DOTS
// Alternates column layout grid only around services content areas.
export function ServicesBlockDots({ isEven = true }) {
  const xOffset = isEven ? "0%" : "55%";
  return (
    <DotGridBackground color={isEven ? "rgb(122, 78, 58)" : "rgb(191, 162, 122)"}>
      <LocalizedGrid x={xOffset} y="0" width="45%" height="100%" />
    </DotGridBackground>
  );
}

// 9. BLOG DOTS (Blog detail reading support columns)
// Grid restricted to margins flanking the central reading content.
export function BlogDots() {
  return (
    <DotGridBackground color="rgb(191, 162, 122)">
      <LocalizedGrid x="0" y="0" width="15%" height="100%" />
      <LocalizedGrid x="85%" y="0" width="15%" height="100%" />
    </DotGridBackground>
  );
}

// 10. CONTACT DOTS
// Low density, leaving large center breathing space for contact form.
export function ContactDots() {
  return (
    <DotGridBackground color="rgb(122, 78, 58)">
      <LocalizedGrid x="0" y="0" width="40%" height="100%" />
    </DotGridBackground>
  );
}
