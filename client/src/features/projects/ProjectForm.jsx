import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagsInput } from "@/components/admin/TagsInput";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";

const INPUT_CLS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";
const TEXTAREA_CLS =
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-none";

const schema = z.object({
  title: z.string().trim().min(3, "Min 3 characters").max(160),
  summary: z.string().trim().min(10, "Min 10 characters").max(300),
  description: z.string().trim().min(20, "Min 20 characters"),
  problem: z.string().trim().optional(),
  solution: z.string().trim().optional(),
  results: z.string().trim().optional(),
  clientName: z.string().trim().max(120).optional(),
  industry: z.string().trim().max(120).optional(),
  technologies: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  projectUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Must be a valid URL"),
  githubUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), "Must be a valid URL"),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional(),
  coverImage: z.object({ url: z.string(), publicId: z.string() }).nullable().optional(),
  gallery: z.array(z.object({ url: z.string(), publicId: z.string() })).default([]),
});

const EMPTY_DEFAULTS = {
  title: "",
  summary: "",
  description: "",
  problem: "",
  solution: "",
  results: "",
  clientName: "",
  industry: "",
  technologies: [],
  services: [],
  projectUrl: "",
  githubUrl: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
  isFeatured: false,
  publishedAt: "",
  coverImage: null,
  gallery: [],
};

function SectionHeading({ title }) {
  return (
    <div className="border-t border-input my-2 pt-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
    </div>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-destructive">{error.message}</p>;
}

export function ProjectForm({ defaultValues, onSubmit, isPending, isEditing, onCancel }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = form;

  const summaryValue = watch("summary");

  async function onFormSubmit(values) {
    const payload = { ...values };
    const optionalStringFields = [
      "clientName",
      "industry",
      "projectUrl",
      "githubUrl",
      "problem",
      "solution",
      "results",
      "publishedAt",
      "seoTitle",
      "seoDescription",
    ];
    for (const field of optionalStringFields) {
      if (!payload[field]) delete payload[field];
    }
    try {
      await onSubmit(payload);
    } catch (err) {
      form.setError("root", { message: err?.message || "Something went wrong" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-2">
      {/* -- Section 1: Basic Information ------------------------------- */}
      <h3 className="text-sm font-semibold text-foreground mb-4">Basic Information</h3>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          {...register("title")}
          className={INPUT_CLS}
          placeholder="Project title"
        />
        <FieldError error={errors.title} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Summary <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register("summary")}
          rows={4}
          className={TEXTAREA_CLS}
          placeholder="Brief project summary (shown in cards and listings)"
        />
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {summaryValue?.length ?? 0} / 300
        </p>
        <FieldError error={errors.summary} />
      </div>

      <div className="flex items-end gap-4 mb-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
          <select {...register("status")} className={INPUT_CLS}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <FieldError error={errors.status} />
        </div>
        <div className="flex items-center gap-2 pb-2.5">
          <input
            type="checkbox"
            id="isFeatured"
            {...register("isFeatured")}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-foreground cursor-pointer">
            Featured
          </label>
        </div>
      </div>

      {/* -- Section 2: Content ----------------------------------------- */}
      <SectionHeading title="Content" />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Description <span className="text-destructive">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={6}
          className={TEXTAREA_CLS}
          placeholder="Full project description"
        />
        <FieldError error={errors.description} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Problem Statement
        </label>
        <textarea
          {...register("problem")}
          rows={4}
          className={TEXTAREA_CLS}
          placeholder="What problem does this project solve?"
        />
        <FieldError error={errors.problem} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Solution</label>
        <textarea
          {...register("solution")}
          rows={4}
          className={TEXTAREA_CLS}
          placeholder="How was the problem solved?"
        />
        <FieldError error={errors.solution} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Results</label>
        <textarea
          {...register("results")}
          rows={4}
          className={TEXTAREA_CLS}
          placeholder="What were the outcomes and impact?"
        />
        <FieldError error={errors.results} />
      </div>

      {/* -- Section 3: Project Details --------------------------------- */}
      <SectionHeading title="Project Details" />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Client Name</label>
          <input
            {...register("clientName")}
            className={INPUT_CLS}
            placeholder="Client or company name"
          />
          <FieldError error={errors.clientName} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Category / Industry
          </label>
          <input
            {...register("industry")}
            className={INPUT_CLS}
            placeholder="e.g. Healthcare, Fintech"
          />
          <FieldError error={errors.industry} />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Technologies</label>
        <Controller
          control={control}
          name="technologies"
          render={({ field }) => (
            <TagsInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Add technology, press Enter..."
            />
          )}
        />
        <FieldError error={errors.technologies} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">Services</label>
        <Controller
          control={control}
          name="services"
          render={({ field }) => (
            <TagsInput
              value={field.value}
              onChange={field.onChange}
              placeholder="Add service, press Enter..."
            />
          )}
        />
        <FieldError error={errors.services} />
      </div>

      {/* -- Section 4: Links & Dates ----------------------------------- */}
      <SectionHeading title="Links & Dates" />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Live URL</label>
          <input
            {...register("projectUrl")}
            className={INPUT_CLS}
            placeholder="https://example.com"
          />
          <FieldError error={errors.projectUrl} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">GitHub URL</label>
          <input
            {...register("githubUrl")}
            className={INPUT_CLS}
            placeholder="https://github.com/..."
          />
          <FieldError error={errors.githubUrl} />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Completion Date
        </label>
        <input type="date" {...register("publishedAt")} className={INPUT_CLS} />
        <FieldError error={errors.publishedAt} />
      </div>

      {/* -- Section 5: Media ------------------------------------------- */}
      <SectionHeading title="Media" />

      <div className="mb-4">
        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => (
            <div className="space-y-1.5">
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                label="Thumbnail / Cover Image"
                multiple={false}
              />
              <p className="text-[11px] text-muted-foreground">
                Recommended size: 1600 × 1000 px (16:10 ratio) or 1920 × 1200 px. Using this ratio prevents automatic cropping and ensures important content remains visible.
              </p>
            </div>
          )}
        />
        <FieldError error={errors.coverImage} />
      </div>

      <div className="mb-4">
        <Controller
          control={control}
          name="gallery"
          render={({ field }) => (
            <div className="space-y-1.5">
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                label="Gallery Images"
                multiple={true}
              />
              <p className="text-[11px] text-muted-foreground">
                Upload image assets of any dimensions. Landscape screenshots or photos fit best in the detail page preview gallery.
              </p>
            </div>
          )}
        />
        <FieldError error={errors.gallery} />
      </div>

      {/* -- Section 6: SEO -------------------------------------------- */}
      <SectionHeading title="SEO" />

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">SEO Title</label>
        <input
          {...register("seoTitle")}
          className={INPUT_CLS}
          placeholder="SEO-optimized title (optional)"
          maxLength={160}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Overrides the browser title and search result headline when provided.
        </p>
        <FieldError error={errors.seoTitle} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-foreground">SEO Description</label>
        <textarea
          {...register("seoDescription")}
          rows={3}
          className={TEXTAREA_CLS}
          placeholder="Meta description for search engines (optional)"
          maxLength={320}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Used in search snippets and social previews when available.
        </p>
        <FieldError error={errors.seoDescription} />
      </div>

      {/* -- Footer ----------------------------------------------------- */}
      <div className="flex flex-col gap-3 pt-4 border-t border-input mt-2">
        {errors.root && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
            {errors.root.message}
          </p>
        )}
        <div className="flex justify-end gap-3">
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
                : "Create Project"}
          </Button>
        </div>
      </div>
    </form>
  );
}
