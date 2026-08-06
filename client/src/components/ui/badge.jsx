import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-input text-foreground",
  success: "bg-green-500/10 text-green-700 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
};

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
