import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X, Loader2, Zap } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/services/apiClient";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "What services do you offer?",
  "Show me recent projects.",
  "What technologies do you use?",
  "How can Pronix Digital help my business?",
  "What is your development process?",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "bot",
  text: "Hello! I'm the Pronix Digital assistant. How can I help you today? Feel free to ask about our services, projects, or process.",
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(false);
      setShouldHide(true);
    };
    const handleClose = () => setShouldHide(false);

    window.addEventListener("mobile-menu-open", handleOpen);
    window.addEventListener("mobile-menu-close", handleClose);

    return () => {
      window.removeEventListener("mobile-menu-open", handleOpen);
      window.removeEventListener("mobile-menu-close", handleClose);
    };
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    // Clear input
    if (!textToSend) setInput("");

    // Add user message
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: messageText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/chat", { message: messageText });
      const botResponseText = response.data?.data?.response || "Sorry, I couldn't get a response.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: botResponseText,
        },
      ]);
    } catch (error) {
      console.error("Chatbot request failed:", error);
      const errorMsg = error.response?.data?.message || "I encountered an error connecting to the server. Please verify your connection or try again later.";
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: errorMsg,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line.trim();
      const isBullet = content.startsWith("- ") || content.startsWith("* ");
      if (isBullet) {
        content = content.substring(2);
      }

      // Formatting bold (**text**)
      const parts = [];
      let remaining = content;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIdx = 0;

      while ((match = boldRegex.exec(remaining)) !== null) {
        if (match.index > lastIdx) {
          parts.push(remaining.substring(lastIdx, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-semibold text-foreground">
            {match[1]}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }
      if (lastIdx < remaining.length) {
        parts.push(remaining.substring(lastIdx));
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm leading-relaxed mb-1 text-slate-700">
            {parts}
          </li>
        );
      }

      return (
        <p key={idx} className={cn("text-sm leading-relaxed text-slate-700", idx > 0 && "mt-2")}>
          {parts}
        </p>
      );
    });
  };

  // Control mobile scroll lock when chatbot is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      if (window.innerWidth < 768) {
        document.body.style.overflow = "hidden";
      }
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Auto-scroll suggested questions to start when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = 0;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Desktop horizontal scroll support for suggested questions
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  if (shouldHide) return null;

  return (
    <>
      {/* -- Backdrop Blur Overlay (Blurs entire website including Navbar) -- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[90] bg-[#1C1612]/15 backdrop-blur-[10px] pointer-events-auto"
            style={{ willChange: "opacity, backdrop-filter" }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] font-sans">
        {/* -- Expandable Chat Panel -- */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                width: "min(380px, calc(100vw - 32px))",
                height: "min(600px, calc(100dvh - 110px))",
              }}
              className={cn(
                "absolute bottom-[72px] right-0 flex flex-col rounded-[20px] border border-border/85",
                "bg-background shadow-2xl overflow-hidden"
              )}
            >
              {/* -- Header -- */}
              <div className="flex items-center justify-between border-b border-border/60 bg-primary px-5 py-4 text-primary-foreground shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Zap className="h-5 w-5 text-white fill-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold tracking-tight text-white">Pronix AI</h3>
                    <span className="text-[10px] text-white/85 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online • Response in seconds
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Chat"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* -- Message list area -- */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[75%]",
                      msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-[18px] px-4 py-2.5 shadow-sm text-[13px] border leading-relaxed",
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none"
                          : "bg-muted/65 text-slate-800 border-border/50 rounded-tl-none"
                      )}
                    >
                      {msg.sender === "user" ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="space-y-1">{renderMarkdown(msg.text)}</div>
                      )}
                    </div>
                    <span className="mt-1 text-[9px] text-muted-foreground px-1">
                      {msg.sender === "user" ? "You" : "Pronix AI"}
                    </span>
                  </div>
                ))}

                {/* -- Typing indicator -- */}
                {isLoading && (
                  <div className="flex flex-col items-start max-w-[75%] mr-auto">
                    <div className="flex items-center gap-1 bg-muted/65 border border-border/50 rounded-[18px] rounded-tl-none px-4 py-3 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                    </div>
                    <span className="mt-1 text-[9px] text-muted-foreground px-1">Thinking...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* -- Suggested Questions Pills (Premium Horizontal Carousel with Fade Gradients) -- */}
              <div className="relative border-t border-border/40 bg-muted/15 py-3">
                <style dangerouslySetInnerHTML={{__html: `
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}} />
                {/* Left and Right Fade Indicators */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                {/* Horizontal Scroll Container */}
                <div
                  ref={scrollRef}
                  className="overflow-x-auto overflow-y-hidden whitespace-nowrap flex gap-2 px-6 no-scrollbar scroll-smooth overscroll-contain"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <motion.button
                      key={prompt}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading}
                      className={cn(
                        "inline-flex items-center text-[11px] font-semibold px-4 py-2 rounded-full border border-border/50 bg-background h-8",
                        "text-stone-600 hover:text-stone-950 hover:border-primary/45 hover:bg-primary/5 active:scale-95 transition-all duration-300 ease-in-out shadow-sm cursor-pointer whitespace-nowrap select-none shrink-0"
                      )}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* -- Input form -- */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="border-t border-border/60 p-3.5 bg-background flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Pronix Digital..."
                  disabled={isLoading}
                  className={cn(
                    "flex-1 h-11 rounded-full border border-border/80 px-4 text-xs sm:text-sm bg-muted/30",
                    "focus:outline-none focus:border-primary/60 focus:bg-background transition-all",
                    "disabled:opacity-60"
                  )}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white border-none shrink-0",
                    "hover:bg-[#5A3728] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md"
                  )}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 text-primary-foreground" />
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -- Floating Chat Toggle Button -- */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground",
            "shadow-xl cursor-pointer transition-all border border-primary/20",
            isOpen && "rotate-90 bg-stone-900 border-stone-800"
          )}
          aria-label={isOpen ? "Close Help Desk" : "Open Help Desk"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageSquare className="h-6 w-6 text-white fill-white/10" />
          )}
        </motion.button>
      </div>
    </>
  );
}
