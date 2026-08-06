import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublicBlog, useRelatedBlogs } from "@/features/public/usePublicBlogs";
import { publicRoutes } from "@/config/navigation";
import { FadeIn, FadeInItem, FadeInStagger, ScaleIn } from "@/lib/motion";
import { BlogDots } from "@/components/public/DotGridBackground";
import { resolveSeoMetadata, useSeoMetadata } from "@/lib/seo";
import { optimizeImageUrl } from "@/lib/utils";

// -- Markdown renderer ---------------------------------------------------------
function renderMarkdown(md) {
  if (!md) return "";
  let html = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(
    /```[\w]*\n?([\s\S]*?)```/g,
    (_, code) =>
      `<pre class="prose-content bg-card border border-border rounded-xl p-4 overflow-x-auto text-[11px] font-mono leading-relaxed my-5 text-muted-foreground"><code>${code.trim()}</code></pre>`,
  );
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="font-display text-base font-semibold mt-6 mb-2 text-foreground">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="font-display text-lg font-bold mt-8 mb-3 text-foreground border-b border-border pb-2">$1</h2>',
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="font-display text-xl font-bold mt-10 mb-4 text-foreground">$1</h1>',
  );
  html = html.replace(
    /\*\*(.+?)\*\*/g,
    "<strong class='font-bold text-foreground'>$1</strong>",
  );
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(
    /`(.+?)`/g,
    '<code class="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">$1</code>',
  );
  html = html.replace(/(^- .+$(\n^- .+$)*)/gm, (block) => {
    const items = block
      .split("\n")
      .map((l) => `<li class="ml-4 list-disc leading-relaxed text-xs text-muted-foreground">${l.slice(2)}</li>`)
      .join("");
    return `<ul class="my-4 space-y-1.5">${items}</ul>`;
  });
  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("<h") || block.startsWith("<ul") || block.startsWith("<pre"))
        return block;
      return `<p class="mb-4 leading-relaxed text-xs md:text-sm text-muted-foreground">${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return html;
}

// -- Main page -----------------------------------------------------------------
export function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: blog, isLoading, isError } = usePublicBlog(slug);
  const { data: relatedBlogs } = useRelatedBlogs(blog?.category, slug);

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://pronixdigital.tech";

  const seoMetadata = useMemo(() => {
    if (isLoading) {
      return resolveSeoMetadata({
        pathname: `/blog/${slug || ""}`,
        title: "Journal Entry",
        description: "Loading article details from Pronix Digital.",
        type: "article",
      });
    }

    if (isError || !blog) {
      return resolveSeoMetadata({
        pathname: `/blog/${slug || ""}`,
        title: "Article Not Found",
        description: "The article you are looking for does not exist or has been removed.",
        robots: "noindex,nofollow",
        noindex: true,
        type: "article",
        breadcrumbs: [
          { name: "Pronix Digital", url: `${siteOrigin}/` },
          { name: "Journal", url: `${siteOrigin}/blog` },
          { name: "Article Not Found", url: `${siteOrigin}/blog/${slug || ""}` },
        ],
      });
    }

    return resolveSeoMetadata({
      pathname: `/blog/${slug || ""}`,
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt || blog.content,
      image: blog.coverImage?.url,
      entity: blog,
      type: "article",
      breadcrumbs: [
        { name: "Pronix Digital", url: `${siteOrigin}/` },
        { name: "Journal", url: `${siteOrigin}/blog` },
        { name: blog.title || "Article", url: `${siteOrigin}/blog/${slug || ""}` },
      ],
    });
  }, [blog, isError, isLoading, siteOrigin, slug]);

  useSeoMetadata(seoMetadata);

  // -- Loading ---------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // -- Error / not found -----------------------------------------------------
  if (isError || !blog) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center px-4 bg-background">
        <div className="text-3xl">📄</div>
        <p className="font-display text-xl font-bold">Article Not Found</p>
        <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
          The article you are looking for does not exist or has been removed.
        </p>
        <Button size="sm" className="rounded-full text-xs h-9 px-5" onClick={() => navigate(publicRoutes.blog)}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Journal
        </Button>
      </div>
    );
  }

  // -- Article ---------------------------------------------------------------
  return (
    <div className="bg-background bg-mesh relative overflow-hidden">
      <BlogDots />
      {/* Ambient glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-card/30 to-transparent pointer-events-none" />
      
      <article className="relative z-10 pt-32 md:pt-40">
        <div className="container max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <FadeIn className="mb-8 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Link to={publicRoutes.blog} className="hover:text-primary transition-colors">
              Journal
            </Link>
            <ChevronRight className="h-3 w-3" />
            {blog.category && <span className="text-foreground">{blog.category}</span>}
          </FadeIn>

          {/* Badges + Title */}
          <FadeIn>
            <div className="flex flex-wrap gap-2.5 mb-5">
              {blog.category && (
                <Badge variant="secondary" className="rounded-full text-[10px] font-semibold px-2.5 py-0.5">
                  {blog.category}
                </Badge>
              )}
              {blog.isFeatured && (
                <Badge className="bg-[#BFA27A]/15 text-[#BFA27A] border border-[#BFA27A]/25 rounded-full text-[10px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-tight mb-6">
              {blog.title}
            </h1>
          </FadeIn>

          {/* Meta */}
          <FadeIn
            delay={0.08}
            className="flex flex-wrap items-center gap-5 pb-6 border-b border-border mb-8"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {blog.readingTimeMinutes && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                {blog.readingTimeMinutes} min read
              </div>
            )}
          </FadeIn>

          {/* Cover image */}
          {blog.coverImage?.url && (
            <ScaleIn className="mb-10 overflow-hidden rounded-[20px] border border-border">
              <img
                src={optimizeImageUrl(blog.coverImage.url, 1200)}
                alt={blog.title}
                className="w-full aspect-[16/9] object-cover"
                width="1200"
                height="675"
                fetchPriority="high"
                decoding="async"
              />
            </ScaleIn>
          )}

          {/* Excerpt - styled as pullquote */}
          {blog.excerpt && (
            <FadeIn className="mb-10 max-w-2xl mx-auto">
              <div className="rounded-[20px] border-l-4 border-primary bg-[#EEE7DD]/40 p-6">
                <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed italic">
                  {blog.excerpt}
                </p>
              </div>
            </FadeIn>
          )}

          {/* Content */}
          <FadeIn delay={0.12}>
            <div
              className="prose-content max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
            />
          </FadeIn>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <FadeIn className="mt-12 pt-8 border-t border-border max-w-2xl mx-auto">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2">
                  Tags:
                </span>
                {blog.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`${publicRoutes.blog}?search=${tag}`)}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </article>

      {/* -- Related Articles ----------------------------------------------- */}
      {relatedBlogs?.items?.length > 0 && (
        <section className="mt-20 py-16 bg-card border-t border-border">
          <div className="container max-w-5xl mx-auto px-6">
            <FadeIn className="mb-10 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Related Entries</h2>
              <Link
                to={publicRoutes.blog}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                View Journal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </FadeIn>
            <FadeInStagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.items.map((rb) => (
                <FadeInItem key={rb.id} direction="scale">
                  <Link
                    to={publicRoutes.blogDetail(rb.slug)}
                    className="group block rounded-[20px] border border-border overflow-hidden bg-background hover:border-primary/45 transition-all duration-300"
                  >
                    {rb.coverImage?.url ? (
                      <div className="aspect-[16/9] overflow-hidden bg-muted">
                        <img
                          src={optimizeImageUrl(rb.coverImage.url, 600)}
                          alt={rb.title}
                          className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-355"
                          loading="lazy"
                          width="600"
                          height="338"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-[#EEE7DD]/40" />
                    )}
                    <div className="p-4">
                      {rb.category && (
                        <Badge variant="secondary" className="mb-2 text-[10px] font-semibold rounded-full px-2.5 py-0.5">
                          {rb.category}
                        </Badge>
                      )}
                      <h3 className="font-display text-xs font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {rb.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {new Date(rb.publishedAt || rb.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </div>
        </section>
      )}

      {/* -- Bottom CTA ----------------------------------------------------- */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container max-w-5xl mx-auto px-6">
          <FadeIn className="overflow-hidden rounded-[20px] border border-[#4A4038] bg-dark-surface text-[#F6F2EC] text-center p-10 md:p-16">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFA27A]/20 bg-[#BFA27A]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFA27A] mx-auto w-fit">
              Get Started
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
              Enjoyed our journal entry?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto mb-10 leading-relaxed">
              We look at your problems holistically. Let's run a discovery session to align your business goals and configure the ideal software roadmap.
            </p>
            <div className="flex flex-wrap justify-center">
              <Button
                size="lg"
                className="h-11 rounded-full bg-primary hover:bg-[#5A3728] text-[#F6F2EC] font-medium px-8 border-none shadow-none text-sm w-full sm:w-auto"
                asChild
              >
                <Link to={publicRoutes.contact}>Start a Project Engagement</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
