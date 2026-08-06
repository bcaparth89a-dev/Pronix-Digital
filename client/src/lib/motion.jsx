import { useRef, useState, useEffect } from "react";
import { m as motion, useInView, useReducedMotion } from "framer-motion";

// -- Easing curves ------------------------------------------------------------
export const ease = {
  out: [0.0, 0.0, 0.2, 1.0],
  in: [0.4, 0.0, 1.0, 1.0],
  inOut: [0.4, 0.0, 0.2, 1.0],
  spring: { type: "spring", stiffness: 300, damping: 30 },
  springGentle: { type: "spring", stiffness: 150, damping: 25 },
};

// -- Variant presets ----------------------------------------------------------
export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: ease.out },
    },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: ease.out },
    },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: ease.out },
    },
  },
  fadeRight: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: ease.out },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: ease.out },
    },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  },
  staggerContainerFast: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  },
};

// -- useScrollReveal hook -----------------------------------------------------
export function useScrollReveal({ once = true, margin = "-80px", amount = 0.15 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin, amount });
  return { ref, isInView };
}

// -- FadeIn component ---------------------------------------------------------
// Scroll-triggered fade animation for any element.
export function FadeIn({
  children,
  delay = 0,
  duration = 0.55,
  direction = "up",
  className,
  once = true,
  amount = 0.15,
}) {
  const shouldReduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px", amount });

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const yOffset = isMobile ? 8 : 24;
  const xOffset = isMobile ? 10 : 30;

  const directionMap = {
    up: { initial: { opacity: 0, y: yOffset }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -yOffset }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: xOffset }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -xOffset }, animate: { opacity: 1, x: 0 } },
    none: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  };

  const { initial, animate } = shouldReduce
    ? { initial: {}, animate: {} }
    : directionMap[direction] || directionMap.up;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? animate : initial}
      transition={{ duration: shouldReduce ? 0 : duration, delay, ease: ease.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -- FadeInStagger ------------------------------------------------------------
// Parent container for staggered child animations. Children should be FadeInItem.
export function FadeInStagger({
  children,
  className,
  once = true,
  staggerDelay = 0.08,
  delayChildren = 0.1,
  fast = false,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: fast ? 0.05 : staggerDelay,
            delayChildren: fast ? 0.05 : delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -- FadeInItem ---------------------------------------------------------------
// Child of FadeInStagger. Animates when parent is in view.
export function FadeInItem({ children, className, direction = "up" }) {
  const shouldReduce = useReducedMotion();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const yOffset = isMobile ? 6 : 20;
  const xOffset = isMobile ? 8 : 24;

  const directionMap = {
    up: { hidden: { opacity: 0, y: yOffset }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -yOffset }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: xOffset }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: -xOffset }, visible: { opacity: 1, x: 0 } },
    scale: { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } },
  };

  const v = directionMap[direction] || directionMap.up;

  return (
    <motion.div
      variants={
        shouldReduce
          ? { hidden: {}, visible: {} }
          : {
              hidden: v.hidden,
              visible: { ...v.visible, transition: { duration: 0.5, ease: ease.out } },
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -- ScaleIn ------------------------------------------------------------------
export function ScaleIn({ children, delay = 0, className, once = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px" });
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? {} : { opacity: 0, scale: 0.92 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.45, delay, ease: ease.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -- SlideIn ------------------------------------------------------------------
// Horizontal slide-in for sidebars, panels, etc.
export function SlideIn({ children, from = "left", delay = 0, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduce = useReducedMotion();
  const xFrom = from === "left" ? -40 : 40;

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? {} : { opacity: 0, x: xFrom }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: ease.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -- Hover scale wrapper ------------------------------------------------------
export function HoverScale({ children, scale = 1.02, className }) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.01 }}
      transition={{ duration: 0.2, ease: ease.out }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -- Animated counter value ---------------------------------------------------
// Pass the string value like "50+" or "99%", animates the number part.
export function AnimatedCounter({ value, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const numeric = parseInt(String(value).replace(/\D/g, ""), 10) || 0;
  const suffix = String(value).replace(/[0-9]/g, "");

  return (
    <span ref={ref} className={className}>
      <CountUp target={numeric} started={isInView} />
      {suffix}
    </span>
  );
}

function CountUp({ target, started }) {
  const [count, setCount] = useState(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (!started || shouldReduce) {
      setCount(target);
      return;
    }
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [started, target, shouldReduce]);

  return <>{count}</>;
}
