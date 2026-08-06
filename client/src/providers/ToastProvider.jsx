import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    cls: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
    iconCls: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: AlertCircle,
    cls: "border-destructive/30 bg-destructive/10 text-destructive",
    iconCls: "text-destructive",
  },
  info: {
    icon: Info,
    cls: "border-primary/30 bg-primary/10 text-primary",
    iconCls: "text-primary",
  },
};

function ToastItem({ toast, onRemove }) {
  const variant = VARIANTS[toast.type] ?? VARIANTS.info;
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        "animate-in slide-in-from-right-full duration-300",
        variant.cls,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", variant.iconCls)} />
      <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = `t-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      timers.current[id] = setTimeout(() => remove(id), duration);
      return id;
    },
    [remove],
  );

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const add = useContext(ToastContext);
  if (!add) throw new Error("useToast must be used within ToastProvider");

  return {
    toast: (message, type = "info") => add(message, type),
    success: (message) => add(message, "success"),
    error: (message) => add(message, "error"),
    info: (message) => add(message, "info"),
  };
}
