import { useEffect, useState, useMemo } from "react";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useFaqs, useDeleteFaq, useReorderFaqs } from "@/features/faqs/useFaqs";
import { FaqFormDialog } from "@/features/faqs/FaqFormDialog";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";

const COL_COUNT = 6;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b last:border-0">
      {Array.from({ length: COL_COUNT }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="animate-pulse rounded bg-muted/50 h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

// --- SortableRow Component ---
function SortableRow({ faq, openEdit, setDeleteTarget }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b last:border-0 hover:bg-muted/30 transition-colors bg-card",
        isDragging && "bg-muted/10 opacity-35"
      )}
    >
      <td
        className="px-4 py-3 text-muted-foreground select-none align-middle touch-none"
        {...attributes}
        {...listeners}
        data-drag-handle
      >
        <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground transition-colors" />
      </td>
      <td
        className="px-4 py-3 max-w-sm truncate font-medium align-middle"
        title={faq.question}
      >
        {faq.question.length > 60
          ? `${faq.question.slice(0, 60)}\u2026`
          : faq.question}
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">
        {faq.category || "-"}
      </td>
      <td className="px-4 py-3 align-middle">
        <StatusBadge status={faq.isActive} />
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">
        {faq.createdAt
          ? new Date(faq.createdAt).toLocaleDateString()
          : "-"}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(faq)}
            aria-label="Edit FAQ"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={() => setDeleteTarget(faq)}
            aria-label="Delete FAQ"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// --- OverlayRow Component ---
function OverlayRow({ faq }) {
  if (!faq) return null;
  return (
    <tr className="border-b bg-card shadow-lg opacity-90 scale-[1.02] transition-transform pointer-events-none">
      <td className="px-4 py-3 w-10 text-muted-foreground align-middle">
        <GripVertical className="h-4 w-4" />
      </td>
      <td className="px-4 py-3 max-w-sm truncate font-medium align-middle">
        {faq.question}
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">
        {faq.category || "-"}
      </td>
      <td className="px-4 py-3 align-middle">
        <StatusBadge status={faq.isActive} />
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">
        {faq.createdAt
          ? new Date(faq.createdAt).toLocaleDateString()
          : "-"}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </td>
    </tr>
  );
}

// --- Main Page ---
export function AdminFaqsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = { page, limit: 10, ...(search && { search }) };
  const { data, isLoading } = useFaqs(params);
  const deleteFaq = useDeleteFaq();
  const reorderFaqs = useReorderFaqs();
  const { success, error: showError } = useToast();

  const faqs = useMemo(() => data?.items ?? [], [data?.items]);
  const meta = data?.meta ?? null;

  const [faqsLocal, setFaqsLocal] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (faqs) {
      setFaqsLocal(faqs);
    }
  }, [faqs]);

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(faq) {
    setEditTarget(faq);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteFaq.mutateAsync(deleteTarget.id);
      success("FAQ deleted");
    } catch {
      showError("Failed to delete FAQ");
    } finally {
      setDeleteTarget(null);
    }
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = faqsLocal.findIndex((f) => f.id === active.id);
      const newIndex = faqsLocal.findIndex((f) => f.id === over.id);

      const reordered = arrayMove(faqsLocal, oldIndex, newIndex);
      setFaqsLocal(reordered);

      const pageOffset = (page - 1) * 10;
      const orders = reordered.map((f, index) => ({
        id: f.id,
        sortOrder: pageOffset + index + 1,
      }));

      try {
        await reorderFaqs.mutateAsync(orders);
        success("FAQs order updated");
      } catch {
        showError("Failed to update FAQs order");
      }
    }
  };

  const activeFaq = faqsLocal.find((f) => f.id === activeId);

  return (
    <section>
      <PageHeader
        title="FAQs"
        description="Manage frequently asked questions shown on the site."
        action={
          <Button size="sm" onClick={openCreate}>
            Add FAQ
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search FAQs..."
        />
      </div>

      <div className="rounded-lg border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="w-10 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Question
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : faqsLocal.length === 0 ? (
                <tr>
                  <td colSpan={COL_COUNT}>
                    <EmptyState
                      message="No FAQs found"
                      description={
                        search ? "Try a different search term." : "Create your first FAQ."
                      }
                    />
                  </td>
                </tr>
              ) : (
                <SortableContext items={faqsLocal.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {faqsLocal.map((faq, idx) => (
                    <SortableRow
                      key={faq.id}
                      faq={faq}
                      idx={idx}
                      openEdit={openEdit}
                      setDeleteTarget={setDeleteTarget}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>

          <DragOverlay>
            {activeId ? (
              <table className="w-full text-sm">
                <tbody>
                  <OverlayRow faq={activeFaq} />
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {meta?.totalPages > 1 && (
        <div className="mt-4">
          <AdminPagination meta={meta} page={page} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        description={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
        loading={deleteFaq.isPending}
      />

      <FaqFormDialog open={formOpen} onClose={closeForm} faq={editTarget} />
    </section>
  );
}
