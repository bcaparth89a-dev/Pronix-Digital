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

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      {/* -- Expandable Chat Panel -- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "mb-4 flex h-[500px] w-[350px] flex-col rounded-2xl border border-border/80",
              "bg-background/95 shadow-2xl backdrop-blur-md sm:w-[380px] overflow-hidden"
            )}
          >
            {/* -- Header -- */}
            <div className="flex items-center justify-between border-b border-border/60 bg-primary px-4 py-3.5 text-primary-foreground shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold tracking-tight text-white">Pronix AI</h3>
                  <span className="text-[10px] text-white/70 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Response in seconds
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* -- Message list area -- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[82%]",
                    msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 shadow-sm text-sm border",
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none"
                        : "bg-muted/65 text-slate-800 border-border/50 rounded-tl-none"
                    )}
                  >
                    {msg.sender === "user" ? (
                      <p className="leading-relaxed">{msg.text}</p>
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
                <div className="flex flex-col items-start max-w-[82%] mr-auto">
                  <div className="flex items-center gap-1 bg-muted/65 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                  </div>
                  <span className="mt-1 text-[9px] text-muted-foreground px-1">Thinking...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* -- Suggested Questions Pills -- */}
            <div className="px-4 py-2 bg-muted/30 border-t border-border/40 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className={cn(
                    "text-[11px] font-medium px-3 py-1.5 rounded-full border border-border/60 bg-background",
                    "text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0"
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* -- Input form -- */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-border/60 p-3 bg-background flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Pronix Digital..."
                disabled={isLoading}
                className={cn(
                  "flex-1 h-9 rounded-full border border-border/80 px-4 text-xs bg-muted/30",
                  "focus:outline-none focus:border-primary/60 focus:bg-background transition-all",
                  "disabled:opacity-60"
                )}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white border-none",
                  "hover:bg-[#5A3728] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                )}
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-primary-foreground" />
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
          "shadow-lg cursor-pointer transition-all border border-primary/20",
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
  );
}
