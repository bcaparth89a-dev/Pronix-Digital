import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function ImageLightbox({ src, alt, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && src && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-zoom-out"
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-[10000] flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black touch-manipulation"
            style={{
              marginTop: "env(safe-area-inset-top, 0px)",
              marginRight: "env(safe-area-inset-right, 0px)",
            }}
            aria-label="Close image"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Content Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90dvh] max-w-[95vw] overflow-hidden select-none z-[9999]"
          >
            <img
              src={src}
              alt={alt || "Image preview"}
              className="max-h-[90dvh] max-w-[95vw] w-auto h-auto object-contain rounded-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
