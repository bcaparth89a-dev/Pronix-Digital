import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/admin/Dialog";
import { Button } from "@/components/ui/button";
import { useCreateBlog, useUpdateBlog } from "@/features/blogs/useBlogs";

const schema = z.object({
  title: z.string().trim().min(3, "Min 3 characters").max(180),
  excerpt: z.string().trim().min(10, "Min 10 characters").max(320),
  content: z.string().trim().min(50, "Min 50 characters"),
  category: z.string().trim().max(120).optional(),
  status: z.enum(["draft", "published", "archived"]),
  isFeatured: z.boolean(),
  readingTimeMinutes: z.coerce.number().int().min(1).max(120).optional(),
});

const INPUT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
const TEXTAREA_CLS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none";

const DEFAULT_VALUES = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  status: "draft",
  isFeatured: false,
  readingTimeMinutes: "",
};

export function BlogFormDialog({ open, onClose, blog }) {
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const isEditing = Boolean(blog);
  const isPending = createBlog.isPending || updateBlog.isPending;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const errors = form.formState.errors;

  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title ?? "",
        excerpt: blog.excerpt ?? "",
        content: blog.content ?? "",
        category: blog.category ?? "",
        status: blog.status ?? "draft",
        isFeatured: blog.isFeatured ?? false,
        readingTimeMinutes: blog.readingTimeMinutes ?? "",
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
  }, [blog, form]);

  async function onSubmit(values) {
    const payload = { ...values };
    if (!payload.category) delete payload.category;
    if (!payload.readingTimeMinutes) delete payload.readingTimeMinutes;

    try {
      if (isEditing) {
        await updateBlog.mutateAsync({ id: blog.id, payload });
      } else {
        await createBlog.mutateAsync(payload);
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
      title={isEditing ? "Edit Blog Post" : "New Blog Post"}
      description={
        isEditing
          ? "Update the blog post details below."
          : "Fill in the details to create a new blog post."
      }
      className="max-w-2xl"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input
            className={INPUT_CLS}
            placeholder="Blog post title"
            {...form.register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Excerpt</label>
          <textarea
            rows={3}
            className={TEXTAREA_CLS}
            placeholder="Short excerpt displayed in listings"
            {...form.register("excerpt")}
          />
          {errors.excerpt && (
            <p className="text-xs text-destructive">{errors.excerpt.message}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Content</label>
          <textarea
            rows={8}
            className={TEXTAREA_CLS}
            placeholder="Full blog post content"
            {...form.register("content")}
          />
          {errors.content && (
            <p className="text-xs text-destructive">{errors.content.message}</p>
          )}
        </div>

        {/* Category + Reading Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Technology"
              {...form.register("category")}
            />
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Reading Time (minutes)</label>
            <input
              type="number"
              min={1}
              max={120}
              className={INPUT_CLS}
              placeholder="e.g. 5"
              {...form.register("readingTimeMinutes")}
            />
            {errors.readingTimeMinutes && (
              <p className="text-xs text-destructive">
                {errors.readingTimeMinutes.message}
              </p>
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
              id="blog-isFeatured"
              className="h-4 w-4 rounded border-input"
              {...form.register("isFeatured")}
            />
            <label
              htmlFor="blog-isFeatured"
              className="cursor-pointer text-sm font-medium"
            >
              Featured
            </label>
          </div>
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
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Post"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
