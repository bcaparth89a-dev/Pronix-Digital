import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubmitContact } from "@/features/public/useSubmitContact";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";
import { FadeIn, SlideIn } from "@/lib/motion";
import { ContactDots } from "@/components/public/DotGridBackground";
import { businessProfile } from "@/config/business";

// -- Form schema ---------------------------------------------------------------
const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(140).optional(),
  serviceInterest: z.string().min(1, "Please select a service"),
  budgetRange: z.string().min(1, "Please select a budget range"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

// -- Static data ---------------------------------------------------------------
// -- Static data ---------------------------------------------------------------
const SERVICES = [
  "Business Websites",
  "Mobile Apps",
  "SEO & Digital Marketing",
  "Operations Software",
  "UI/UX Design",
  "Consultation / Discovery",
  "Other",
];

const BUDGETS = [
  "Under ₹10,000",
  "₹10,000 - ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000+",
  "Let's discuss",
];

// -- Styling constants ---------------------------------------------------------
const INPUT_CLS =
  "flex h-11 w-full rounded-full border border-border/80 bg-card px-5 py-2 text-xs md:text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm";

const TEXTAREA_CLS =
  "flex w-full rounded-[20px] border border-border/80 bg-card px-5 py-3 text-xs md:text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm resize-none";

// -- Field wrapper -------------------------------------------------------------
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground px-1">{label}</label>
      {children}
      {error && <p className="text-[10px] text-destructive px-1">{error.message}</p>}
    </div>
  );
}

// -- Main page -----------------------------------------------------------------
export function ContactPage() {
  const submitContact = useSubmitContact();
  const { success } = useToast();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      serviceInterest: "",
      budgetRange: "",
      message: "",
    },
  });

  const {
    formState: { errors },
  } = form;

  async function onSubmit(values) {
    const payload = { ...values };
    if (!payload.phone) delete payload.phone;
    if (!payload.company) delete payload.company;

    try {
      await submitContact.mutateAsync(payload);
      success("Message sent! We'll be in touch within 1-2 business days.");
      form.reset();
    } catch (err) {
      form.setError("root", {
        message: err?.message || "Failed to send message. Please try again.",
      });
    }
  }

  return (
    <div className="bg-background min-h-[100dvh] flex flex-col justify-center relative overflow-hidden bg-mesh" style={{ paddingTop: "clamp(6.5rem, 10vw, 9rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
      {/* Background blueprint and communication network elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" aria-hidden="true" />
      <ContactDots />

      <div className="container relative z-10 w-full flex flex-col justify-center gap-6">
        {/* Header Block */}
        <FadeIn className="max-w-2xl shrink-0">
          <span className="section-tag mb-2 inline-block">Get In Touch</span>
          <h1 className="font-display font-bold tracking-tight mb-2 text-balance text-foreground" style={{ fontSize: "var(--text-h2)" }}>
            Let's build something <span className="italic text-primary font-normal">exceptional together</span>
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
            Share your project goals, timeline, and budget. We'll outline a direct recommendation blueprint in 1-2 business days.
          </p>
        </FadeIn>

        {/* Content Columns: Form + Info side-by-side with matched heights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full flex-1">
          {/* Form (7 cols) */}
          <SlideIn from="left" className="lg:col-span-7 flex">
            <div className="rounded-[20px] border border-border bg-card p-5 sm:p-6 hover:shadow-xl-soft transition-all duration-300 w-full flex flex-col justify-between">
              <h2 className="font-display text-xs font-bold mb-4 text-foreground uppercase tracking-wider">Send us a message</h2>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 flex-1 flex flex-col justify-between">
                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Full Name *" error={errors.name}>
                    <input className={INPUT_CLS} placeholder="Alex Johnson" {...form.register("name")} />
                  </Field>
                  <Field label="Email Address *" error={errors.email}>
                    <input type="email" className={INPUT_CLS} placeholder="alex@company.com" {...form.register("email")} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Phone Number" error={errors.phone}>
                    <input type="tel" className={INPUT_CLS} placeholder="+91 7990101983" {...form.register("phone")} />
                  </Field>
                  <Field label="Company / Organisation" error={errors.company}>
                    <input className={INPUT_CLS} placeholder="Acme Corp" {...form.register("company")} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Service Required *" error={errors.serviceInterest}>
                    <select className={cn(INPUT_CLS, "appearance-none cursor-pointer")} {...form.register("serviceInterest")}>
                      <option value="">Select a service...</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Budget Range (INR) *" error={errors.budgetRange}>
                    <select className={cn(INPUT_CLS, "appearance-none cursor-pointer")} {...form.register("budgetRange")}>
                      <option value="">Select budget...</option>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Project Details *" error={errors.message}>
                  <textarea rows={3} className={TEXTAREA_CLS} placeholder="Tell us about your project, goals, and timeline..." {...form.register("message")} />
                </Field>

                {errors.root && (
                  <div className="text-destructive text-xs font-semibold bg-destructive/5 p-3 rounded-xl border border-destructive/15">
                    {errors.root.message}
                  </div>
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="w-full gap-2 h-10 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground text-xs font-semibold uppercase tracking-wider shadow-none border-none transition-all duration-200 mt-2 shrink-0"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Sending request..." : "Send Request"}
                </Button>
              </form>
            </div>
          </SlideIn>

          {/* Info details (5 cols) */}
          <SlideIn from="right" className="lg:col-span-5 flex flex-col gap-4">
            {/* Contact details list */}
            {[
              {
                icon: Mail,
                title: "Email Us",
                value: businessProfile.email,
                href: `mailto:${businessProfile.email}`,
                desc: "Typically reply within 4 hours",
              },
              {
                icon: Phone,
                title: "Call Us",
                value: businessProfile.phone,
                href: `tel:${businessProfile.phone.replace(/\s+/g, "")}`,
                desc: "Mon-Sat, 9am-6pm IST",
              },
              {
                icon: Clock,
                title: "Business Hours",
                value: "Mon - Sat, 9am - 6pm",
                desc: "Indian Standard Time",
              },
              {
                icon: MapPin,
                title: "Location",
                value: `${businessProfile.address.addressLocality}, ${businessProfile.address.addressRegion}`,
                desc: businessProfile.serviceAreas.slice(2).join(" · "),
              },
            ].map((info) => {
              const InfoIcon = info.icon;
              return (
                <div key={info.title} className="flex-grow flex items-center gap-4 p-4 rounded-[20px] border border-border bg-card hover:border-primary/20 transition-all duration-300">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEE7DD] text-primary border border-border">
                    <InfoIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{info.title}</p>
                    {info.href ? (
                      <a href={info.href} className="text-xs text-foreground hover:text-primary transition-colors font-bold block mt-0.5 break-all">
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-xs text-foreground font-bold mt-0.5">{info.value}</p>
                    )}
                    {info.desc && (
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5">{info.desc}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </SlideIn>
        </div>
      </div>
    </div>
  );
}
