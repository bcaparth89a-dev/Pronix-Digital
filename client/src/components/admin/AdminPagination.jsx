import { Button } from "@/components/ui/button";

export function AdminPagination({ meta, page, onChange }) {
  if (!meta) return null;

  const { totalPages, hasPrevPage, hasNextPage, total } = meta;

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm text-muted-foreground">
        {total != null ? (
          <>
            <span className="font-medium text-foreground">{total}</span> total records
          </>
        ) : (
          <>
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
