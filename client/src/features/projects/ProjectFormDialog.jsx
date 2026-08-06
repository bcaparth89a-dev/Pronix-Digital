import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/admin/Dialog";
import { Button } from "@/components/ui/button";
import { useCreateProject, useUpdateProject } from "@/features/projects/useProjects";

const schema = z.object({
  title: z.string().trim().min(3, "Min 3 characters").max(160),
  summary: z.string().trim().min(10, "Min 10 characters").max(300),
  description: z.string().trim().min(20, "Min 20 characters"),
  clientName: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(120).optional(),
  projectUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Must be a valid URL"),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
});

const INPUT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
const TEXTAREA_CLS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none";

const DEFAULT_VALUES = {
  title: "",
  summary: "",
  description: "",
  clientName: "",
  industry: "",
  projectUrl: "",
  status: "draft",
  isFeatured: false,
};

export function ProjectFormDialog({ open, onClose, project }) {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEditing = Boolean(project);
  const isPending = createProject.isPending || updateProject.isPending;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const errors = form.formState.errors;

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title ?? "",
        summary: project.summary ?? "",
        description: project.description ?? "",
        clientName: project.clientName ?? "",
        industry: project.industry ?? "",
        projectUrl: project.projectUrl ?? "",
        status: project.status ?? "draft",
        isFeatured: project.isFeatured ?? false,
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [form, project]);

  async function onSubmit(values) {
    const payload = { ...values };
    if (!payload.clientName) delete payload.clientName;
    if (!payload.industry) delete payload.industry;
    if (!payload.projectUrl) delete payload.projectUrl;

    try {
      if (isEditing) {
        await updateProject.mutateAsync({ id: project.id, payload });
      } else {
        await createProject.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      form.setError("root", { message: error.message });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "New Project"}
      description={
        isEditing
          ? "Update the project details below."
          : "Fill in the details to create a new project."
      }
      className="max-w-2xl"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input
            className={INPUT_CLS}
            placeholder="Project title"
            {...form.register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Summary</label>
          <textarea
            rows={4}
            className={TEXTAREA_CLS}
            placeholder="Short summary of the project"
            {...form.register("summary")}
          />
          {errors.summary && (
            <p className="text-xs text-destructive">{errors.summary.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={6}
            className={TEXTAREA_CLS}
            placeholder="Full project description"
            {...form.register("description")}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Client Name + Industry */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Client Name</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Acme Corp"
              {...form.register("clientName")}
            />
            {errors.clientName && (
              <p className="text-xs text-destructive">{errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Industry</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Technology"
              {...form.register("industry")}
            />
            {errors.industry && (
              <p className="text-xs text-destructive">{errors.industry.message}</p>
            )}
          </div>
        </div>

        {/* Status + isFeatured */}
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              className={`${INPUT_CLS} appearance-none`}
              {...form.register("status")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && (
              <p className="text-xs text-destructive">{errors.status.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              id="proj-isFeatured"
              className="h-4 w-4 rounded border-input"
              {...form.register("isFeatured")}
            />
            <label
              htmlFor="proj-isFeatured"
              className="cursor-pointer text-sm font-medium"
            >
              Featured
            </label>
          </div>
        </div>

        {/* Project URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Project URL</label>
          <input
            className={INPUT_CLS}
            placeholder="https://example.com"
            {...form.register("projectUrl")}
          />
          {errors.projectUrl && (
            <p className="text-xs text-destructive">{errors.projectUrl.message}</p>
          )}
        </div>

        {/* Root error */}
        {errors.root && (
          <p className="text-xs text-destructive">{errors.root.message}</p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
