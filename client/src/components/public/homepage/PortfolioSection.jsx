import { useState } from "react";
import { Link } from "react-router-dom";
// Motion components used for landing page cards animations
import { m as Motion } from "framer-motion";
import { ImageLightbox } from "@/components/common/ImageLightbox";

import {
  ArrowRight,
  FolderKanban,
  Newspaper,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publicRoutes } from "@/config/navigation";
import { usePublicBlogs } from "@/features/public/usePublicBlogs";
import { useFeaturedProjects } from "@/features/public/usePublicProjects";
import { FadeIn, FadeInItem, FadeInStagger } from "@/lib/motion";
import { optimizeImageUrl } from "@/lib/utils";
import {
  SelectedWorkDots,
  JournalDots,
} from "@/components/public/DotGridBackground";

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <FadeIn className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between text-left">
      <div className="max-w-2xl">
        <span className="section-tag mb-4">{eyebrow}</span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-5xl">
          {title}
        </h2>
        {description && <p className="mt-4 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </FadeIn>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="aspect-[16/10] shimmer" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-20 rounded-full shimmer" />
        <div className="h-5 w-3/4 rounded-md shimmer" />
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-2/3 rounded shimmer" />
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  const EmptyIcon = icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-card/60 px-6 py-16 text-center w-full">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground border">
        <EmptyIcon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function ProjectCard({ project, onImageClick }) {
  return (
    <Motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link
        to={publicRoutes.portfolioDetail(project.slug)}
        className="group flex flex-col h-full overflow-hidden rounded-[20px] border border-border bg-card transition-all duration-300 hover:border-primary/45 hover:shadow-xl-soft"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted border-b border-border/40">
          {project.coverImage?.url ? (
            <img
              src={optimizeImageUrl(project.coverImage.url, 600)}
              alt={project.coverImage.alt || project.title}
              className="h-full w-full object-cover transition-transform duration-550 group-hover:scale-103 cursor-zoom-in"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageClick(project.coverImage.url, project.title);
              }}
              loading="lazy"
              width="600"
              height="375"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-grid-pattern bg-grid-sm opacity-50">
              <FolderKanban className="h-8 w-8 text-muted-foreground/35" />
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {project.industry && (
              <Badge variant="secondary" className="mb-3 rounded-full text-[9px] font-semibold px-2.5 py-0.5">
                {project.industry}
              </Badge>
            )}
            <h3 className="font-display text-base font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {project.summary}
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              View Project
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </Motion.div>
  );
}

function BlogCard({ blog }) {
  return (
    <Motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Link
        to={publicRoutes.blogDetail(blog.slug)}
        className="group flex h-full flex-col rounded-[20px] border border-border bg-card p-5 transition-all duration-300 hover:border-primary/45 hover:shadow-xl-soft"
      >
        <div className="mb-5 flex items-center justify-between">
          {blog.category ? (
            <Badge variant="secondary" className="rounded-full text-[9px] font-semibold px-2.5 py-0.5">
              {blog.category}
            </Badge>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-muted-foreground">{blog.readingTimeMinutes || 3} min read</span>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {blog.excerpt}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-primary border-t border-border/40 pt-4">
            <span>Read article</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </Motion.div>
  );
}

export function PortfolioSection() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedProjects();
  const { data: blogData, isLoading: blogsLoading } = usePublicBlogs({ limit: 3 });
  const [selectedImage, setSelectedImage] = useState(null);

  const featuredProjects = featuredData?.items ?? [];
  const blogs = blogData?.items ?? [];

  return (
    <>
      {/* Featured Projects Section: Asymmetrical layout */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <SelectedWorkDots />
        <div className="container relative z-10">
          <SectionHeader
            eyebrow="Our Work"
            title="Selected business applications & websites."
            description="Every website and application is custom-built around real business outcomes, not templates."
            action={
              <Button variant="outline" className="rounded-full h-9 text-xs px-4" asChild>
                <Link to={publicRoutes.portfolio}>
                  View all projects <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            }
          />

          {featuredLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : featuredProjects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="Portfolio items are coming soon"
              description="Featured projects will appear here as soon as they are published from the admin panel."
              action={
                <Button variant="outline" className="rounded-full text-xs h-9" asChild>
                  <Link to={publicRoutes.contact}>Discuss your project</Link>
                </Button>
              }
            />
          ) : (
            <FadeInStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.slice(0, 3).map((project) => (
                <FadeInItem key={project.id} direction="scale">
                  <ProjectCard
                    project={project}
                    onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                  />
                </FadeInItem>
              ))}
            </FadeInStagger>
          )}
        </div>
      </section>

      {/* Blog/Insights Section */}
      <section className="relative overflow-hidden border-t bg-card/65 py-20 md:py-28 bg-mesh">
        <JournalDots />
        <div className="container relative z-10">
          <SectionHeader
            eyebrow="Journal"
            title="Practical notes on engineering digital products."
            description="Ideas and findings on code, UI design, search rankings, and business growth."
            action={
              <Button variant="outline" className="rounded-full h-9 text-xs px-4" asChild>
                <Link to={publicRoutes.blog}>
                  Read all entries <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            }
          />

          {blogsLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="No journal entries published yet"
              description="Our latest case notes and digital findings will appear here as soon as they are posted."
            />
          ) : (
            <FadeInStagger className="grid gap-6 md:grid-cols-3">
              {blogs.slice(0, 3).map((blog) => (
                <FadeInItem key={blog.id}>
                  <BlogCard blog={blog} />
                </FadeInItem>
              ))}
            </FadeInStagger>
          )}
        </div>
      </section>

      <ImageLightbox
        src={selectedImage?.url}
        alt={selectedImage?.alt}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
}
