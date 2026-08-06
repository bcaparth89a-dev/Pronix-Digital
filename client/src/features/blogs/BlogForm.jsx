import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { TagsInput } from "@/components/admin/TagsInput";
import { ImageUpload } from "@/components/admin/ImageUpload";

const INPUT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
const TEXTAREA_CLS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none";
const SELECT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring";

const schema = z.object({
  title: z.string().trim().min(3, "Min 3 characters").max(180),
  excerpt: z.string().trim().min(10, "Min 10 characters").max(320),
  content: z.string().trim().min(50, "Min 50 characters"),
  category: z.string().trim().max(120).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  coverImage: z
    .object({ url: z.string(), publicId: z.string() })
    .nullable()
    .optional(),
});

const EMPTY_DEFAULTS = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [],
  status: "draft",
  isFeatured: false,
  seoTitle: "",
  seoDescription: "",
  coverImage: null,
};

function SectionCard({ title, children }) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function FieldGroup({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function BlogForm({
  defaultValues,
  onSubmit,
  isPending,
  isEditing,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  });

  async function handleFormSubmit(values) {
    const payload = { ...values };

    if (!payload.category) delete payload.category;
    if (!payload.seoTitle) delete payload.seoTitle;
    if (!payload.seoDescription) delete payload.seoDescription;
    if (payload.coverImage === null) payload.coverImage = null;

    try {
      await onSubmit(payload);
    } catch (err) {
      setError("root", {
        message: err?.response?.data?.message ?? err?.message ?? "Something went wrong",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Section 1 - Post Details */}
      <SectionCard title="Post Details">
        <FieldGroup label="Title *" error={errors.title?.message}>
          <input
            {...register("title")}
            className={INPUT_CLS}
            placeholder="Enter blog post title"
          />
        </FieldGroup>

        <FieldGroup label="Excerpt *" error={errors.excerpt?.message}>
          <textarea
            {...register("excerpt")}
            className={TEXTAREA_CLS}
            rows={3}
            placeholder="Short summary shown in listings and previews"
          />
        </FieldGroup>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Status" error={errors.status?.message}>
            <select {...register("status")} className={SELECT_CLS}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FieldGroup>

          <FieldGroup label="Category" error={errors.category?.message}>
            <input
              {...register("category")}
              className={INPUT_CLS}
              placeholder="e.g. Technology, Design"
            />
          </FieldGroup>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isFeatured"
            type="checkbox"
            {...register("isFeatured")}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer">
            Featured post
          </label>
          <span className="text-xs text-muted-foreground">
            Featured posts are highlighted on the blog listing page.
          </span>
        </div>
      </SectionCard>

      {/* Section 2 - Content */}
      <SectionCard title="Content">
        <FieldGroup label="Body *" error={errors.content?.message}>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                value={field.value}
                onChange={field.onChange}
                rows={16}
                placeholder="Write your blog post content in Markdown..."
                error={errors.content?.message}
              />
            )}
          />
        </FieldGroup>
      </SectionCard>

      {/* Section 3 - Tags & Media */}
      <SectionCard title="Tags & Media">
        <FieldGroup
          label="Tags"
          error={errors.tags?.message}
          hint="Press Enter or comma to add a tag."
        >
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagsInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Add tag, press Enter..."
              />
            )}
          />
        </FieldGroup>

        <FieldGroup label="Cover Image" error={errors.coverImage?.message}>
          <Controller
            name="coverImage"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  multiple={false}
                />
                <p className="text-[11px] text-muted-foreground">
                  Recommended size: 1600 × 900 px (16:9 ratio) or 1600 × 1000 px (16:10 ratio). This matches the blog listing cards and post hero previews, preventing key elements from being cropped.
                </p>
              </div>
            )}
          />
        </FieldGroup>
      </SectionCard>

      {/* Section 4 - SEO */}
      <SectionCard title="SEO">
        <FieldGroup
          label="SEO Title"
          error={errors.seoTitle?.message}
          hint="Overrides the page title in search results. Max 160 characters."
        >
          <input
            {...register("seoTitle")}
            className={INPUT_CLS}
            placeholder="SEO-optimized title (optional)"
            maxLength={160}
          />
        </FieldGroup>

        <FieldGroup
          label="SEO Description"
          error={errors.seoDescription?.message}
          hint="Meta description shown in search results. Max 320 characters."
        >
          <textarea
            {...register("seoDescription")}
            className={TEXTAREA_CLS}
            rows={3}
            placeholder="Brief description for search engines (optional)"
            maxLength={320}
          />
        </FieldGroup>
      </SectionCard>

      {/* Root error */}
      {errors.root && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
            ? "Save Changes"
            : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
