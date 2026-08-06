import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` when `started` is true.
 * @param {number} target - The final value to count to
 * @param {number} duration - Animation duration in ms (default 2000)
 * @param {boolean} started - Whether to start the animation
 * @returns {number} - Current animated value
 */
export function useCountUp(target = 0, duration = 2000, started = true) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, started]);

  return count;
}
