import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { usePublicFaqs } from "@/features/public/usePublicFaqs";
import { useSeoMetadata } from "@/lib/seo";
import { FaqDots } from "@/components/public/DotGridBackground";

function FaqAccordionItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-border/50 py-4.5 last:border-none last:pb-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left font-display text-sm md:text-base font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span>{faq.question}</span>
        <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors">
          {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 pt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-3xl">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const { data: faqData, isLoading } = usePublicFaqs();
  const faqs = faqData?.items ?? [];
  const [openIndex, setOpenIndex] = useState(null);

  useSeoMetadata({ faqItems: faqs });

  if (isLoading) return null;
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20 md:py-28 border-t border-border bg-background">
      <FaqDots />
      <div className="container relative z-10">
        <div className="text-center mb-14">
          <span className="section-tag mb-4 block w-fit mx-auto">FAQ</span>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Find answers to common questions about our agency, deliverables, and development process.
          </p>
        </div>

        <div className="rounded-[20px] border border-border bg-card p-6 md:p-8 max-w-[1100px] mx-auto hover:shadow-xl-soft transition-all duration-300">
          {faqs.map((faq, index) => (
            <FaqAccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
