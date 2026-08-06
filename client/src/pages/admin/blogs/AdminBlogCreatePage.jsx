import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogForm } from "@/features/blogs/BlogForm";
import { useCreateBlog } from "@/features/blogs/useBlogs";
import { useToast } from "@/providers/ToastProvider";
import { privateRoutes } from "@/config/navigation";

export function AdminBlogCreatePage() {
  const navigate = useNavigate();
  const { success } = useToast();
  const createBlog = useCreateBlog();

  async function handleSubmit(payload) {
    await createBlog.mutateAsync(payload);
    success("Blog post created successfully");
    navigate(privateRoutes.adminBlogs);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(privateRoutes.adminBlogs)}
          className="mb-2 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Blog Posts
        </Button>
        <PageHeader title="Create Blog Post" description="Write a new article" />
      </div>
      <BlogForm
        onSubmit={handleSubmit}
        isPending={createBlog.isPending}
        isEditing={false}
        onCancel={() => navigate(privateRoutes.adminBlogs)}
      />
    </div>
  );
}
