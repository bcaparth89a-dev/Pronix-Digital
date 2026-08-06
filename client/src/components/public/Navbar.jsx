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

      {/* -- Mobile menu (Full-screen overlay, thumb-friendly & bottom-oriented) -- */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 h-[100dvh] w-screen z-[100] bg-[#1C1612] text-stone-200 md:hidden flex flex-col p-4 pt-4 pb-4 overflow-y-auto overscroll-contain"
          >
            {/* Background mesh glow and lines for aesthetic technicality */}
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" />
            <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <line x1="15%" y1="0" x2="15%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
              <line x1="85%" y1="0" x2="85%" y2="100%" stroke="currentColor" strokeWidth="0.5" />
            </svg>

            {/* Top Bar with Close button inside drawer */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#4A4038]/60 pb-2">
              <img src="/branding/logo-horizontal.svg" alt="Pronix Digital" className="h-6 w-auto object-contain sm:h-7" />
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4A4038] bg-[#221A15] hover:bg-[#3A312B] transition-colors focus:outline-none cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-5.5 w-5.5 text-[#BFA27A]" />
              </button>
            </div>

            {/* Navigation links with large targets */}
            <div className="relative z-10 flex flex-col gap-0.5 py-1 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-0.5 px-3">Navigation</span>
              <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
                {NAV_LINKS.map((link, i) => (
                  <Motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                  >
                    <NavLink
                      to={link.href}
                      end={link.end}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between landscape-compact py-2.5 px-3 rounded-lg transition-all",
                          isActive
                            ? "bg-[#3A312B]/45 text-[#BFA27A]"
                            : "text-stone-200 hover:bg-[#2E2722]/40 hover:text-[#BFA27A]",
                        )
                      }
                    >
                      <span className="font-display text-base font-bold tracking-tight">{link.label}</span>
                      <ArrowRight className="h-4 w-4 opacity-35" />
                    </NavLink>
                  </Motion.div>
                ))}
              </nav>
            </div>

            {/* Flex spacer to prevent overlap */}
            <div className="min-h-[8px]" />

            {/* Bottom contact info */}
            <div className="relative z-10 space-y-3 pt-3 border-t border-[#4A4038]/60 mt-3 landscape-hide">
              <div className="flex flex-col sm:flex-row justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Write to us</span>
                  <a href="mailto:pronixdigital.tech@gmail.com" className="block text-xs font-bold text-white hover:text-[#BFA27A] transition-colors break-all">
                    pronixdigital.tech@gmail.com
                  </a>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Call directly</span>
                  <a href="tel:+917990101983" className="block text-xs font-bold text-white hover:text-[#BFA27A] transition-colors">
                    +91 7990101983
                  </a>
                </div>
              </div>

              <Motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button size="lg" className="w-full gap-2 rounded-full bg-[#BFA27A] hover:bg-[#A88B63] text-[#1C1612] shadow-none border-none text-xs h-10 font-semibold" asChild>
                  <Link to={publicRoutes.contact}>
                    Book Free Consultation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Motion.div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
