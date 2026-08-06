import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2, GripVertical } from "lucide-react";
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
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects, useDeleteProject, useReorderProjects } from "@/features/projects/useProjects";
import { useToast } from "@/providers/ToastProvider";
import { privateRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b last:border-0">
      {Array.from({ length: 7 }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="animate-pulse bg-muted/50 h-4 rounded" />
        </td>
      ))}
    </tr>
  ));
}

// --- SortableRow Component ---
function SortableRow({ project, navigate, setDeleteTarget }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

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
      <td className="px-4 py-3 font-medium align-middle">
        <span className="truncate block max-w-xs">{project.title}</span>
      </td>
      <td className="px-4 py-3 align-middle">
        <StatusBadge status={project.status} />
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">{project.industry || "-"}</td>
      <td className="px-4 py-3 align-middle">
        {project.isFeatured ? (
          <Badge variant="default">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">
        {new Date(project.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(privateRoutes.adminProjectView(project.id))}
            aria-label="View project"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(privateRoutes.adminProjectEdit(project.id))}
            aria-label="Edit project"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={() => setDeleteTarget(project)}
            aria-label="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// --- DragOverlay Helper Row (renders in portal while dragging) ---
function OverlayRow({ project }) {
  if (!project) return null;
  return (
    <tr className="border-b bg-card shadow-lg opacity-90 scale-[1.02] transition-transform pointer-events-none">
      <td className="px-4 py-3 w-10 text-muted-foreground align-middle">
        <GripVertical className="h-4 w-4" />
      </td>
      <td className="px-4 py-3 font-medium align-middle">
        <span className="truncate block max-w-xs">{project.title}</span>
      </td>
      <td className="px-4 py-3 align-middle">
        <StatusBadge status={project.status} />
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">{project.industry || "-"}</td>
      <td className="px-4 py-3 align-middle">
        {project.isFeatured ? (
          <Badge variant="default">Featured</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground align-middle">
        {new Date(project.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </td>
    </tr>
  );
}

// --- Main Page ---
export function AdminProjectsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = { page, limit: 10, ...(search && { search }) };
  const { data, isLoading } = useProjects(params);
  const deleteProject = useDeleteProject();
  const reorderProjects = useReorderProjects();
  const { success, error: showError } = useToast();

  const projects = useMemo(() => data?.items ?? [], [data?.items]);
  const meta = data?.meta ?? null;

  const [projectsLocal, setProjectsLocal] = useState([]);
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
    if (projects) {
      setProjectsLocal(projects);
    }
  }, [projects]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      success("Project deleted");
    } catch {
      showError("Failed to delete project");
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
      const oldIndex = projectsLocal.findIndex((p) => p.id === active.id);
      const newIndex = projectsLocal.findIndex((p) => p.id === over.id);

      const reordered = arrayMove(projectsLocal, oldIndex, newIndex);
      setProjectsLocal(reordered);

      const pageOffset = (page - 1) * 10;
      const orders = reordered.map((p, index) => ({
        id: p.id,
        sortOrder: pageOffset + index + 1,
      }));

      try {
        await reorderProjects.mutateAsync(orders);
        success("Projects order updated");
      } catch {
        showError("Failed to update projects order");
      }
    }
  };

  const activeProject = projectsLocal.find((p) => p.id === activeId);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects"
        action={
          <Button onClick={() => navigate(privateRoutes.adminProjectCreate)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects..." />
      </div>

      <div className="rounded-lg border mb-4">
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
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Industry
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Featured
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : projectsLocal.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      message="No projects found"
                      description="Create your first project to get started."
                    />
                  </td>
                </tr>
              ) : (
                <SortableContext items={projectsLocal.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  {projectsLocal.map((project, idx) => (
                    <SortableRow
                      key={project.id}
                      project={project}
                      idx={idx}
                      navigate={navigate}
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
                  <OverlayRow project={activeProject} />
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {meta?.totalPages > 1 && (
        <AdminPagination meta={meta} page={page} onChange={setPage} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        loading={deleteProject.isPending}
      />
    </div>
  );
}
