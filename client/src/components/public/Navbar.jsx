import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { m as Motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: publicRoutes.home, end: true },
  { label: "About", href: publicRoutes.about },
  { label: "Services", href: publicRoutes.services },
  { label: "Portfolio", href: publicRoutes.portfolio },
  { label: "Blog", href: publicRoutes.blog },
  { label: "Contact", href: publicRoutes.contact },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) {
      window.dispatchEvent(new CustomEvent("mobile-menu-open"));
    } else {
      window.dispatchEvent(new CustomEvent("mobile-menu-close"));
    }
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("mobile-menu-close"));
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(92%,1280px)] transition-all duration-300",
          scrolled ? "top-2" : "top-4"
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center justify-between px-6 rounded-[24px] border border-border bg-card/90 backdrop-blur-md transition-all duration-300",
            scrolled ? "h-12 px-4 shadow-[0_8px_30px_rgba(33,29,25,0.03)]" : "shadow-[0_4px_20px_rgba(33,29,25,0.01)]"
          )}
        >
          {/* -- Logo -- */}
          <Link
            to={publicRoutes.home}
            className="flex items-center focus-visible:outline-none"
          >
            <img
              src="/branding/logo-horizontal.svg"
              alt="Pronix Digital"
              width="96"
              height="32"
              className="h-7 w-[84px] sm:h-8 sm:w-[96px] object-contain"
            />
          </Link>

          {/* -- Desktop Navigation -- */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-250",
                    "hover:text-primary",
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{link.label}</span>
                    {isActive && (
                      <Motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* -- Desktop CTAs -- */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              size="sm"
              className="h-8 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground text-xs px-4 gap-1.5 font-medium transition-all duration-200 border-none shadow-none"
              asChild
            >
              <Link to={publicRoutes.contact}>
                Book Consultation
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          {/* -- Mobile toggle -- */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-muted md:hidden border border-border/40 focus:ring-1 focus:ring-primary/20"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <Motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-4 w-4 text-primary" />
                </Motion.span>
              ) : (
                <Motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-4 w-4 text-foreground" />
                </Motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* -- Mobile menu Drawer -- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <Motion.div
              key="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Drawer Panel */}
            <Motion.div
              key="mobile-menu-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 h-[100dvh] w-full max-w-[300px] min-[375px]:max-w-[320px] min-[412px]:max-w-[340px] z-[100] bg-[#1C1612] text-stone-200 md:hidden flex flex-col shadow-2xl border-l border-white/[0.05] overflow-y-auto overscroll-contain"
            >
              {/* Background mesh glow and lines for aesthetic technicality */}
              <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
              <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" />

              {/* Dedicated Header Area with Glassmorphism and Divider */}
              <div
                style={{
                  paddingTop: "calc(16px + env(safe-area-inset-top))",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  paddingBottom: "18px",
                }}
                className="relative z-10 flex items-center justify-between min-h-[88px] border-b border-white/[0.08] bg-gradient-to-b from-[#221A15]/40 to-transparent backdrop-blur-[2px] shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
              >
                {/* Brand Area */}
                <div className="flex items-center">
                  <img
                    src="/branding/wordmark-light.svg"
                    alt="Pronix Digital"
                    width="120"
                    height="32"
                    className="h-8 w-[120px] object-contain shrink-0"
                  />
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#221A15]/70 hover:bg-[#3A312B]/85 active:scale-95 hover:scale-105 transition-all duration-200 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus:outline-none cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5.5 w-5.5 text-[#BFA27A]" />
                </button>
              </div>

              {/* Navigation links with large targets */}
              <div className="relative z-10 flex flex-col gap-0.5 px-5 py-5 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 px-1">Navigation</span>
                <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                  {NAV_LINKS.map((link, i) => (
                    <Motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                    >
                      <NavLink
                        to={link.href}
                        end={link.end}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98]",
                            isActive
                              ? "bg-[#3A312B]/60 text-[#BFA27A] font-semibold font-display"
                              : "text-stone-200 hover:bg-[#2E2722]/30 hover:text-[#BFA27A]",
                          )
                        }
                      >
                        <span className="text-sm font-semibold tracking-tight">{link.label}</span>
                        <ArrowRight className="h-4 w-4 opacity-40" />
                      </NavLink>
                    </Motion.div>
                  ))}
                </nav>
              </div>

              {/* Flex spacer to prevent overlap */}
              <div className="min-h-[12px]" />

              {/* Bottom contact info */}
              <div className="relative z-10 space-y-4 px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-white/[0.08] mt-auto">
                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Write to us</span>
                    <a
                      href="mailto:pronixdigital.tech@gmail.com"
                      className="block text-xs font-bold text-white hover:text-[#BFA27A] transition-colors break-all py-1"
                    >
                      pronixdigital.tech@gmail.com
                    </a>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Call directly</span>
                    <a
                      href="tel:+917990101983"
                      className="block text-xs font-bold text-white hover:text-[#BFA27A] transition-colors py-1"
                    >
                      +91 7990101983
                    </a>
                  </div>
                </div>

                <Motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="pt-1"
                >
                  <Button
                    size="lg"
                    className="w-full gap-2 rounded-xl bg-[#BFA27A] hover:bg-[#A88B63] active:scale-[0.98] text-[#1C1612] shadow-none border-none text-xs h-11 font-semibold transition-all duration-200"
                    asChild
                  >
                    <Link to={publicRoutes.contact}>
                      Book Free Consultation
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Motion.div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
