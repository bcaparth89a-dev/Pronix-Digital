import { Dialog } from "./Dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-sm">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Dialog>
  );
}
