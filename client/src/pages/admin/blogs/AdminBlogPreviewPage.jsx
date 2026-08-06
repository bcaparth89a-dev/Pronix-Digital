import { ChevronLeft, Pencil, Clock, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useBlog } from "@/features/blogs/useBlogs";
import { privateRoutes } from "@/config/navigation";

function renderMarkdown(md) {
  if (!md) return "";

  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-muted rounded-md p-3 my-3 overflow-x-auto text-xs font-mono"><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  html = html.replace(/`(.+?)`/g, '<code class="bg-muted rounded px-1 py-0.5 text-xs font-mono">$1</code>');

  html = html.replace(/(^- .+$(\n^- .+$)*)/gm, (block) => {
    const items = block
      .split("\n")
      .map((line) => `<li class="ml-5 list-disc">${line.slice(2)}</li>`)
      .join("");
    return `<ul class="my-2 space-y-0.5">${items}</ul>`;
  });

  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (
        block.startsWith("<h") ||
        block.startsWith("<ul") ||
        block.startsWith("<pre")
      )
        return block;
      return `<p class="mb-3 leading-relaxed">${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
}

function PreviewSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="animate-pulse bg-muted rounded h-8 w-32" />
        <div className="animate-pulse bg-muted rounded h-10 w-3/4" />
        <div className="animate-pulse bg-muted rounded h-4 w-48" />
      </div>
      <div className="animate-pulse bg-muted rounded-lg h-56 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function AdminBlogPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading, isError } = useBlog(id);

  if (isLoading) return <PreviewSkeleton />;

  if (isError || !blog) {
    return (
      <div className="max-w-3xl">
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
          Blog post not found or failed to load.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header actions */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(privateRoutes.adminBlogs)}
          className="-ml-2 text-muted-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Blog Posts
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(privateRoutes.adminBlogEdit(id))}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit Post
        </Button>
      </div>

      {/* Cover image */}
      {blog.coverImage?.url && (
        <div className="mb-6 overflow-hidden rounded-xl border">
          <img
            src={blog.coverImage.url}
            alt={blog.coverImage.alt || blog.title}
            className="h-64 w-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
        {blog.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-muted-foreground">
        {blog.category && (
          <Badge variant="secondary" className="text-xs">
            {blog.category}
          </Badge>
        )}
        <StatusBadge status={blog.status} />
        {blog.isFeatured && (
          <Badge variant="default" className="text-xs">
            Featured
          </Badge>
        )}
        {blog.readingTimeMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {blog.readingTimeMinutes} min read
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {blog.publishedAt
            ? new Date(blog.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : new Date(blog.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
        </span>
      </div>

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Excerpt */}
      {blog.excerpt && (
        <p className="mb-6 text-base text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4">
          {blog.excerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="prose-sm text-sm text-foreground leading-relaxed mb-8"
        dangerouslySetInnerHTML={{
          __html:
            renderMarkdown(blog.content) ||
            '<p class="text-muted-foreground italic">No content written yet.</p>',
        }}
      />

      {/* SEO section */}
      {(blog.seoTitle || blog.seoDescription) && (
        <div className="rounded-lg border bg-muted/30 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            SEO
          </h3>
          {blog.seoTitle && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Title</p>
              <p className="text-sm font-medium text-foreground">{blog.seoTitle}</p>
            </div>
          )}
          {blog.seoDescription && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Description</p>
              <p className="text-sm text-foreground leading-relaxed">
                {blog.seoDescription}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
