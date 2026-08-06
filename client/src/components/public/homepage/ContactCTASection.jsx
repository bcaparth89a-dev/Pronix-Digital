import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Mail, ShieldCheck, Layers3, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { DarkWarmAccentBackground } from "@/components/public/Backgrounds";
import { FadeIn } from "@/lib/motion";

export function ContactCTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <FadeIn className="relative overflow-hidden rounded-[20px] border border-[#4A4038]/60 bg-dark-surface text-[#F6F2EC] hover:shadow-2xl transition-all duration-500">
          <DarkWarmAccentBackground />
          <div className="relative z-10 grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-14">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFA27A]/20 bg-[#BFA27A]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFA27A]">
                <Mail className="h-3 w-3" />
                Get in Touch
              </span>
              <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-balance md:text-5xl text-white">
                Bring us your business idea. We will build the plan.
              </h2>
              <p className="mt-5 max-w-xl text-xs sm:text-sm leading-relaxed text-stone-300">
                Share your goals, timeline, and budget. You will get a practical engineering roadmap recommendation, not a sales pitch.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="h-11 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground font-semibold px-6 border-none shadow-none text-xs sm:text-sm w-full sm:w-auto" asChild>
                  <Link to={publicRoutes.contact}>Book a Free Consultation</Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-full border-[#4A4038] bg-transparent text-white hover:bg-[#4A4038] font-semibold px-6 text-xs sm:text-sm w-full sm:w-auto"
                  asChild
                >
                  <Link to={publicRoutes.services}>Explore Services</Link>
                </Button>
              </div>
            </div>
            <div className="grid border-t border-[#4A4038]/60 lg:border-l lg:border-t-0 bg-[#2E2722]/50">
              {[
                { icon: ShieldCheck, label: "Custom design built for your brand" },
                { icon: Layers3, label: "Fast, reliable codebases that scale" },
                { icon: BarChart3, label: "Transparent communication every week" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4 border-b border-[#4A4038]/60 p-6 last:border-b-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A4038] text-[#BFA27A] border border-[#5A4D43]/60">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-stone-200">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
