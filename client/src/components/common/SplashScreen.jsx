import { useEffect, useState } from "react";
import { m as motion, useReducedMotion } from "framer-motion";
import { useThemeMode } from "@/hooks/useThemeMode";

/**
 * SplashScreen
 * ------------
 * Phase timeline:
 *   1. entrance — logo mark pops in
 *   2. lockup   — wordmark glides out from behind the logo mark, forming
 *                 the lockup. An opaque backing patch (matching the splash
 *                 background) sits directly behind the logo mark, so the
 *                 wordmark is fully hidden while it's still positioned
 *                 underneath — it only becomes visible once it has
 *                 physically emerged past the logo mark's edge.
 *   3. hold     — a short, deliberate beat (not a dead pause). The lockup
 *                 stays completely still here — no extra motion.
 *   4. reveal   — the splash panel is sliced into horizontal strips that
 *                 wipe away sideways (alternating collapse-to-left /
 *                 collapse-to-right, staggered), revealing the real page
 *                 underneath — a cinematic "venetian blind" wipe. Each
 *                 strip's shadow + accent glow is invisible until the
 *                 instant it starts wiping, then fades in and out with the
 *                 motion itself. The logo/wordmark simply fade out in
 *                 place, with no extra scale or movement of their own.
 */

const DURATIONS = {
  logoIn: 600, // logo mark pops in
  lockup: 500, // wordmark glides out from behind the logo, group locks into place
  hold: 900, // short confident beat on the finished lockup
  reveal: 950, // strips wipe away, revealing the page (see STRIP_* below)
};

const EASE_ENTRANCE = [0.16, 1, 0.3, 1]; // easeOutExpo-ish, confident settle
const EASE_GLIDE = [0.65, 0, 0.35, 1]; // smooth cinematic ease
const EASE_REVEAL = [0.76, 0, 0.24, 1]; // fast, decisive whip for each strip

const SPRING_ENTRANCE = { type: "spring", stiffness: 260, damping: 20, mass: 0.9 };

// --- Cinematic strip-wipe reveal config -----------------------------------
const STRIP_COUNT = 8;
const STRIP_DURATION = 0.5; // seconds, per strip
const STRIP_MAX_STAGGER = 0.4; // seconds, spread of stagger across all strips

// Each strip's height is a fraction of 100vh (100 / STRIP_COUNT), which is
// almost always a repeating decimal (e.g. 8.333...vh). Desktop browsers at
// device-pixel-ratio 1 tend to round those fractional boundaries the same
// way for every strip, so they butt up perfectly. Mobile/tablet screens at
// higher or fractional DPRs (1.5x, 2x, 3x) round each strip's `top` and
// `height` independently to the device pixel grid, so neighboring strips
// can land a hairline apart — the underlying page peeks through as a thin
// line, visible even at rest, before any animation runs. Padding every
// strip's height so it overlaps the strip beneath it removes the gap
// entirely, on any DPR: later strips are later in DOM order, so they paint
// over the overlapped sliver of the strip above them.
const STRIP_OVERLAP_PX = 2;

// Deterministic "organic" stagger (golden-ratio scatter) so strips don't
// wipe in a boring top-to-bottom sweep, but in an uneven, lively rhythm —
// same effect every render, no randomness bugs.
function stripDelay(i) {
  return ((i * 0.61803398875) % 1) * STRIP_MAX_STAGGER;
}
// ---------------------------------------------------------------------------

// Logo/wordmark lockup offsets (px). Sized up slightly from the base
// breakpoint values to keep the gap balanced now that both the logo mark
// and wordmark render larger.
function getOffsets() {
  if (typeof window === "undefined") return { logoX: -60, wordmarkX: 46 };
  const w = window.innerWidth;
  if (w >= 1024) return { logoX: -100, wordmarkX: 70 };
  if (w >= 640) return { logoX: -80, wordmarkX: 58 };
  return { logoX: -60, wordmarkX: 46 };
}

// Keeps the logo/wordmark lockup offsets in sync with viewport breakpoints
// without relying on CSS custom properties.
function useLogoOffsets() {
  const [offsets, setOffsets] = useState(getOffsets);
  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setOffsets(getOffsets()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return offsets;
}

export function SplashScreen({ onComplete, tagline }) {
  const [phase, setPhase] = useState("initial");
  const { resolvedTheme } = useThemeMode();
  const isDark = typeof window !== "undefined" && window.location.pathname.startsWith("/admin") && resolvedTheme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const offsets = useLogoOffsets();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    if (prefersReducedMotion) {
      // Minimal, respectful fallback: show the lockup briefly, then a plain fade.
      setPhase("hold");
      const tReveal = setTimeout(() => setPhase("reveal"), 500);
      const tDone = setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 500 + 320);
      return () => {
        document.body.style.overflow = "";
        clearTimeout(tReveal);
        clearTimeout(tDone);
      };
    }

    setPhase("entrance");

    const t1 = setTimeout(() => setPhase("lockup"), DURATIONS.logoIn);
    const t2 = setTimeout(() => setPhase("hold"), DURATIONS.logoIn + DURATIONS.lockup);
    const t3 = setTimeout(
      () => setPhase("reveal"),
      DURATIONS.logoIn + DURATIONS.lockup + DURATIONS.hold
    );
    const t4 = setTimeout(() => {
      setPhase("done");
      onComplete?.();
    }, DURATIONS.logoIn + DURATIONS.lockup + DURATIONS.hold + DURATIONS.reveal);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, prefersReducedMotion]);

  if (phase === "done") return null;

  // Logo mark (+ its opaque backing patch) travel together as one group.
  const logoVariants = {
    initial: { opacity: 0, scale: 0.82, y: 14, x: 0 },
    entrance: { opacity: 1, scale: 1, y: 0, x: 0, transition: SPRING_ENTRANCE },
    lockup: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: offsets.logoX,
      transition: { duration: DURATIONS.lockup / 1000, ease: EASE_GLIDE },
    },
    hold: { opacity: 1, scale: 1, y: 0, x: offsets.logoX },
    // Clean fade in place — no scale dip, no travel, no extra motion.
    // It just disappears as the strips take over.
    reveal: {
      opacity: 0,
      scale: 1,
      y: 0,
      x: offsets.logoX,
      transition: { duration: 0.28, ease: "easeIn" },
    },
  };

  const wordmarkVariants = {
    // Starts at x: 0, tucked directly behind the logo mark (fully hidden by
    // its backing patch), then glides out to the right as it fades in.
    initial: { opacity: 0, x: 0 },
    entrance: { opacity: 0, x: 0 },
    lockup: {
      opacity: 1,
      x: offsets.wordmarkX,
      transition: {
        opacity: { duration: 0.24, delay: 0.08, ease: "easeOut" },
        x: { duration: DURATIONS.lockup / 1000, ease: EASE_GLIDE },
      },
    },
    hold: { opacity: 1, x: offsets.wordmarkX },
    reveal: {
      opacity: 0,
      x: offsets.wordmarkX,
      transition: { duration: 0.24, ease: "easeIn" },
    },
  };

  const taglineVariants = {
    initial: { opacity: 0, y: 6 },
    entrance: { opacity: 0, y: 6 },
    lockup: { opacity: 0, y: 6 },
    hold: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.15, ease: "easeOut" } },
    reveal: { opacity: 0, y: -4, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const logoMarkUrl = "/branding/logo-mark.svg";
  const wordmarkUrl = isDark ? "/branding/wordmark-light.svg" : "/branding/wordmark.svg";
  const bgColor = isDark ? "#1E1815" : "#F4EFE6";
  const accentColor = isDark ? "224,150,110" : "30,24,21"; // rgb triplets for accent glow

  const stripVariants = {
    initial: { scaleX: 1 },
    entrance: { scaleX: 1 },
    lockup: { scaleX: 1 },
    hold: { scaleX: 1 },
    reveal: (i) => ({
      scaleX: 0,
      transition: {
        duration: STRIP_DURATION,
        ease: EASE_REVEAL,
        delay: stripDelay(i),
      },
    }),
  };

  // The decorative background (grid + glow blobs + arcs) — identical to the
  // original design, just reused inside every strip so the pattern reads as
  // one continuous scene even though it's sliced into horizontal bands.
  const Decoration = () => (
    <>
      <div
        className={`splash-grid absolute inset-0 ${isDark ? "text-white" : "text-black"}`}
        style={{ opacity: isDark ? 0.035 : 0.028 }}
      />

      

      <svg
        className="absolute"
        width="900"
        height="900"
        viewBox="0 0 900 900"
        style={{
          bottom: "-320px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: isDark ? 0.05 : 0.045,
        }}
      >
        <circle cx="450" cy="450" r="420" fill="none" stroke={isDark ? "#F4EFE6" : "#1E1815"} strokeWidth="1" />
        <circle cx="450" cy="450" r="360" fill="none" stroke={isDark ? "#F4EFE6" : "#1E1815"} strokeWidth="1" />
      </svg>
    </>
  );

  return (
    <>
      <style>{`
        .splash-grid {
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
          background-size: 64px 64px;
        }
      `}</style>

      <div
        className="fixed inset-0 z-[9999] overflow-hidden noise-overlay select-none"
        style={{ pointerEvents: phase === "reveal" || phase === "done" ? "none" : "auto" }}
      >
        {prefersReducedMotion ? (
          // Reduced motion: one flat backdrop, simple fade, no strips.
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: bgColor }}
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "reveal" ? 0 : 1 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
          >
            <Decoration />
          </motion.div>
        ) : (
          // Full-strength: the backdrop is sliced into horizontal bands that
          // wipe away sideways in a cinematic, staggered "venetian blind"
          // reveal. Uses absolute `vh` calculations to ensure zero subpixel
          // gaps or grid misalignment on mobile/tablet devices.
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: STRIP_COUNT }).map((_, i) => {
              // Even strips collapse away to the left (origin left → the
              // right edge is the one that moves); odd strips collapse to
              // the right (origin right → the left edge moves). Alternating
              // gives the lively, non-uniform sweep seen in the reference.
              const collapsesToLeft = i % 2 === 0;
              const movingEdge = collapsesToLeft ? "right" : "left";
              
              const H = 100 / STRIP_COUNT;
              const top = i * H;

              // The shadow + accent glow on each strip's moving edge should be invisible
              // the whole time the splash is just sitting there, and only appear as
              // a brief, elegant flash exactly while that strip is wiping.
              const localEdgeVariants = {
                initial: { opacity: 0, boxShadow: 'none' },
                entrance: { opacity: 0, boxShadow: 'none' },
                lockup: { opacity: 0, boxShadow: 'none' },
                hold: { opacity: 0, boxShadow: 'none' },
                reveal: {
                  opacity: [0, 1, 0],
                  boxShadow: movingEdge === "right"
                    ? "28px 0 56px -18px rgba(0,0,0,0.55)"
                    : "-28px 0 56px -18px rgba(0,0,0,0.55)",
                  transition: {
                    duration: STRIP_DURATION,
                    delay: stripDelay(i),
                    times: [0, 0.3, 1],
                    ease: EASE_REVEAL,
                  },
                },
              };

              return (
                <motion.div
                  key={i}
                  className="absolute w-full overflow-hidden"
                  style={{
                    // Overlap into the strip below by STRIP_OVERLAP_PX so
                    // sub-pixel/DPR rounding on mobile & tablet can never
                    // leave a visible gap between strips (see comment on
                    // STRIP_OVERLAP_PX above). `top` is left untouched —
                    // only the trailing edge grows, and the next strip
                    // (later in DOM order) paints over the overlap.
                    height: `calc(${H}vh + ${STRIP_OVERLAP_PX}px)`,
                    top: `${top}vh`,
                    backgroundColor: bgColor,
                    transformOrigin: collapsesToLeft ? "left" : "right",
                    willChange: "transform",
                  }}
                  variants={stripVariants}
                  custom={i}
                  initial="initial"
                  animate={phase}
                >
                  {/* Full-viewport decoration, shifted up perfectly so each band
                      shows the correct slice — keeps the pattern continuous
                      across the whole screen with zero subpixel gaps. */}
                  <div
                    className="absolute left-0 w-screen"
                    style={{
                      height: "100vh",
                      top: `-${top}vh`,
                    }}
                  >
                    <Decoration />
                  </div>

                  {/* Shadow + accent glow on the moving edge */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    variants={localEdgeVariants}
                    initial="initial"
                    animate={phase}
                  >
                    <div
                      className="absolute top-0 h-full"
                      style={{
                        [movingEdge]: 0,
                        width: "3px",
                        background: `linear-gradient(180deg, transparent, rgba(${accentColor},0.85) 45%, transparent)`,
                        boxShadow: `0 0 20px 3px rgba(${accentColor},0.45)`,
                      }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Logo layer: sits above the strips, fades out cleanly in place as
            the reveal kicks off. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="relative flex items-center justify-center w-full max-w-lg h-52 px-4">
            {/* Wordmark — positioned first (lower in stacking order) so the
                logo mark's opaque backing can sit on top of it while it's
                still tucked behind. */}
            <motion.img
              variants={wordmarkVariants}
              initial="initial"
              animate={phase}
              src={wordmarkUrl}
              alt="Wordmark"
              width="180"
              height="48"
              className="absolute h-8 w-[120px] sm:h-10 sm:w-[150px] md:h-12 md:w-[180px] object-contain pointer-events-none"
              style={{ zIndex: 0 }}
            />

            {/* Logo mark group: the mark itself plus an opaque backing patch
                that exactly matches the splash background. The backing sits
                between the wordmark and the logo mark in stacking order, so
                the wordmark is completely hidden — not just faded — while
                it's still positioned underneath. It only becomes visible
                once it has physically glided out past the logo mark's edge. */}
            <motion.div
              variants={logoVariants}
              initial="initial"
              animate={phase}
              className="absolute w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
              style={{ zIndex: 10 }}
            >
              <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
              <img
                src={logoMarkUrl}
                alt="Logo Mark"
                width="112"
                height="112"
                className="relative w-full h-full object-contain pointer-events-none"
              />
            </motion.div>
          </div>

          {tagline && (
            <motion.p
              variants={taglineVariants}
              initial="initial"
              animate={phase}
              className={`mt-6 text-sm tracking-wide ${isDark ? "text-[#F4EFE6]/70" : "text-[#1E1815]/60"}`}
            >
              {tagline}
            </motion.p>
          )}
        </div>
      </div>
    </>
  );
}