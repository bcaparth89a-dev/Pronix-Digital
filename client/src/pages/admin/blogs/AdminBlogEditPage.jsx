import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogForm } from "@/features/blogs/BlogForm";
import { useBlog, useUpdateBlog } from "@/features/blogs/useBlogs";
import { useToast } from "@/providers/ToastProvider";
import { privateRoutes } from "@/config/navigation";

function EditSkeleton() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="animate-pulse bg-muted rounded h-8 w-32" />
        <div className="animate-pulse bg-muted rounded h-7 w-56" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
          <div className="animate-pulse bg-muted rounded h-5 w-28" />
          <div className="animate-pulse bg-muted rounded h-10 w-full" />
          <div className="animate-pulse bg-muted rounded h-20 w-full" />
        </div>
      ))}
    </div>
  );
}

export function AdminBlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const { data: blog, isLoading, isError } = useBlog(id);
  const updateBlog = useUpdateBlog();

  async function handleSubmit(payload) {
    await updateBlog.mutateAsync({ id, payload });
    success("Blog post updated successfully");
    navigate(privateRoutes.adminBlogView(id));
  }

  if (isLoading) return <EditSkeleton />;

  if (isError || !blog) {
    return (
      <div className="max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(privateRoutes.adminBlogs)}
          className="mb-4 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Blog Posts
        </Button>
        <p className="text-sm text-destructive">
          Failed to load blog post. It may have been deleted or does not exist.
        </p>
      </div>
    );
  }

  const defaultValues = {
    title: blog.title ?? "",
    excerpt: blog.excerpt ?? "",
    content: blog.content ?? "",
    category: blog.category ?? "",
    tags: blog.tags ?? [],
    status: blog.status ?? "draft",
    isFeatured: blog.isFeatured ?? false,
    seoTitle: blog.seoTitle ?? "",
    seoDescription: blog.seoDescription ?? "",
    coverImage: blog.coverImage ?? null,
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(privateRoutes.adminBlogView(id))}
          className="mb-2 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Preview
        </Button>
        <PageHeader title="Edit Blog Post" description={`Editing: ${blog.title}`} />
      </div>
      <BlogForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isPending={updateBlog.isPending}
        isEditing
        onCancel={() => navigate(privateRoutes.adminBlogView(id))}
      />
    </div>
  );
}
