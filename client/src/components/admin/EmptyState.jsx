import { Inbox } from "lucide-react";

export function EmptyState({ message, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground" />
      <p className="mt-4 text-sm font-medium text-foreground">{message}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
