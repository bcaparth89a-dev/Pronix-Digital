import { Link } from "react-router-dom";
import { m as Motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { businessProfile } from "@/config/business";
import { FadeIn, FadeInStagger, FadeInItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SERVICES = [
  "Business Websites",
  "Mobile Apps",
  "SEO & Digital Marketing",
  "Operations Software",
  "UI/UX Design",
];

const COMPANY_LINKS = [
  { label: "Home", href: publicRoutes.home },
  { label: "About Us", href: publicRoutes.about },
  { label: "Services", href: publicRoutes.services },
  { label: "Portfolio", href: publicRoutes.portfolio },
  { label: "Blog", href: publicRoutes.blog },
  { label: "Contact", href: publicRoutes.contact },
];

const SOCIAL_LINKS = [
  { Icon: Twitter, href: "https://x.com", label: "Follow on Twitter" },
  { Icon: Linkedin, href: "https://www.linkedin.com", label: "Connect on LinkedIn" },
  { Icon: Github, href: "https://github.com", label: "View on GitHub" },
  { Icon: Instagram, href: "https://instagram.com", label: "Follow on Instagram" },
];

const CONTACT_ITEMS = [
  { Icon: Mail, text: businessProfile.email, href: `mailto:${businessProfile.email}` },
  { Icon: Phone, text: businessProfile.phone, href: `tel:${businessProfile.phone.replace(/\s+/g, "")}` },
  { Icon: MapPin, text: `${businessProfile.address.addressLocality}, ${businessProfile.address.addressRegion}, India`, href: null },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#4A4038]/60 bg-[#1F1916] text-[#E7E2DB] overflow-hidden">
      {/* Premium ambient light and background noise overlay */}
      <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" aria-hidden="true" />

      <div className="relative container">
        {/* -- Main columns -- */}
        <FadeInStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16 lg:gap-12">
          {/* Brand */}
          <FadeInItem className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
            <Link to={publicRoutes.home} className="flex items-center gap-2 group w-fit">
              <img
                src="/branding/wordmark-light.svg"
                alt="Pronix Digital"
                width="120"
                height="32"
                className="h-8 w-[120px] object-contain"
              />
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xl lg:max-w-[220px]">
              We build premium custom software, websites, and mobile apps to help your business grow faster.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {SOCIAL_LINKS.map((item) => {
                const SocialIcon = item.Icon;
                return (
                  <Motion.a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#4A4038] bg-[#2E2722]/60 text-stone-400 transition-colors hover:border-[#BFA27A]/50 hover:bg-[#4A4038] hover:text-[#BFA27A]"
                  >
                    <SocialIcon className="h-4 w-4" />
                  </Motion.a>
                );
              })}
            </div>
          </FadeInItem>

          {/* Links column container (Row 2 on mobile) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-8">
            {/* Services (Informational only) */}
            <FadeInItem>
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider mb-5 text-[#BFA27A]">Our Work</h4>
              <ul className="space-y-3">
                {SERVICES.map((label) => (
                  <li key={label} className="text-xs text-stone-400 transition-colors hover:text-white leading-relaxed">
                    {label}
                  </li>
                ))}
              </ul>
            </FadeInItem>

            {/* Company */}
            <FadeInItem>
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider mb-5 text-[#BFA27A]">Company</h4>
              <ul className="space-y-3">
                {COMPANY_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="text-xs text-stone-400 hover:text-white transition-colors block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FadeInItem>
          </div>

          {/* Contact */}
          <FadeInItem className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
            <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#BFA27A]">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              {CONTACT_ITEMS.map((item) => {
                const ContactIcon = item.Icon;
                const isEmailOrPhone = item.href && (item.href.startsWith("mailto:") || item.href.startsWith("tel:"));
                return (
                  <li key={item.text} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      <ContactIcon className="h-3.5 w-3.5 text-[#BFA27A]" />
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={cn(
                          "text-xs text-stone-400 hover:text-white transition-colors leading-5",
                          isEmailOrPhone ? "whitespace-nowrap" : "break-words"
                        )}
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="text-xs text-stone-400 leading-5 break-words">{item.text}</span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            <div className="pt-2">
              <Button size="sm" className="h-9 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground text-xs px-5 border-none shadow-none font-medium gap-1.5 transition-all duration-300" asChild>
                <Link to={publicRoutes.contact}>
                  Discuss Project <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </FadeInItem>
        </FadeInStagger>
      </div>

      {/* -- Bottom bar -- */}
      <div className="border-t border-[#4A4038]/50 bg-[#161210]">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-[10px] text-stone-500 order-2 sm:order-1">
            &copy; {year} Pronix Digital. All rights reserved.
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <Link
              to={publicRoutes.privacy}
              className="text-[10px] text-stone-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-stone-700">-</span>
            <Link
              to={publicRoutes.terms}
              className="text-[10px] text-stone-500 hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
