import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  FileText,
  Github,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublicProject } from "@/features/public/usePublicProjects";
import { publicRoutes } from "@/config/navigation";
import { FadeIn } from "@/lib/motion";
import { SelectedWorkDots } from "@/components/public/DotGridBackground";
import { resolveSeoMetadata, useSeoMetadata } from "@/lib/seo";
import { optimizeImageUrl } from "@/lib/utils";

// --- Content Section ----------------------------------------------------------

function ContentSection({ title, icon, children }) {
  const Icon = icon;
  return (
    <div className="pb-8 mb-8 border-b border-border last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEE7DD] text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// --- Page ---------------------------------------------------------------------

export function PortfolioDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading, isError } = usePublicProject(slug);

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://pronixdigital.tech";

  const seoMetadata = useMemo(() => {
    if (isLoading) {
      return resolveSeoMetadata({
        pathname: `/portfolio/${slug || ""}`,
        title: "Selected Work",
        description: "Loading project details from Pronix Digital.",
        type: "article",
      });
    }

    if (isError || !project) {
      return resolveSeoMetadata({
        pathname: `/portfolio/${slug || ""}`,
        title: "Project Not Found",
        description: "The project you are looking for does not exist or has been removed.",
        robots: "noindex,nofollow",
        noindex: true,
        type: "article",
        breadcrumbs: [
          { name: "Pronix Digital", url: `${siteOrigin}/` },
          { name: "Selected Works", url: `${siteOrigin}/portfolio` },
          { name: "Project Not Found", url: `${siteOrigin}/portfolio/${slug || ""}` },
        ],
      });
    }

    return resolveSeoMetadata({
      pathname: `/portfolio/${slug || ""}`,
      title: project.seoTitle || project.title,
      description: project.seoDescription || project.summary || project.description,
      image: project.coverImage?.url,
      entity: project,
      type: "article",
      breadcrumbs: [
        { name: "Pronix Digital", url: `${siteOrigin}/` },
        { name: "Selected Works", url: `${siteOrigin}/portfolio` },
        { name: project.title || "Project", url: `${siteOrigin}/portfolio/${slug || ""}` },
      ],
    });
  }, [isLoading, isError, project, siteOrigin, slug]);

  useSeoMetadata(seoMetadata);

  // -- Loading --
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-background">
        <div className="relative h-10 w-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
        <p className="text-xs text-muted-foreground animate-pulse">Loading project details...</p>
      </div>
    );
  }

  // -- Error / not found --
  if (isError || !project) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4 bg-background">
        <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
        <p className="font-display text-xl font-bold">Project Not Found</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The project you are looking for does not exist or has been removed.
        </p>
        <Button size="sm" className="rounded-full text-xs h-9 px-5" onClick={() => navigate(publicRoutes.portfolio)}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Portfolio
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* -- Hero -- */}
      <section className="relative min-h-[60vh] flex items-end bg-dark-surface overflow-hidden pt-24 text-[#F6F2EC]">
        {/* Background: cover image or grid fallback */}
        {project.coverImage?.url ? (
          <div className="absolute inset-0 z-0">
            <img
              src={optimizeImageUrl(project.coverImage.url, 1200)}
              alt={project.title}
              className="h-full w-full object-cover opacity-20"
              width="1200"
              height="630"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/70 to-[#3A312B]/45" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.03] z-0" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-dark-surface to-transparent z-0" aria-hidden="true" />
          </>
        )}
        <SelectedWorkDots opacity={0.12} />

        <div className="container relative z-10 pb-16 pt-20">
          {/* Back link */}
          <Link
            to={publicRoutes.portfolio}
            className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to selected works
          </Link>

          <FadeIn direction="up">
            {project.industry && (
              <Badge className="mb-4 bg-[#BFA27A]/15 text-[#BFA27A] border border-[#BFA27A]/25 rounded-full text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                {project.industry === "Web Development" ? "Business Websites" : project.industry === "Custom Software" ? "Operations Software" : project.industry}
              </Badge>
            )}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight text-balance leading-tight mb-5 max-w-3xl">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed mb-8">
              {project.summary}
            </p>

            {/* Tech pills */}
            {project.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-8">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-stone-850 bg-[#4A4038]/60 px-3 py-1 text-[10px] font-semibold text-stone-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {project.projectUrl && (
                <Button
                  size="sm"
                  className="h-9 rounded-full bg-primary hover:bg-[#5A3728] text-[#F6F2EC] text-xs font-medium px-5 gap-1.5 border-none shadow-none"
                  asChild
                >
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Live Demo
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-full border-[#4A4038] bg-transparent text-white hover:bg-[#4A4038] text-xs font-medium px-5 gap-1.5"
                  asChild
                >
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3.5 w-3.5" /> View Code
                  </a>
                </Button>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* -- Main content + sidebar -- */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-background">
        <SelectedWorkDots />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {project.description && (
                <ContentSection title="Overview" icon={FileText}>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </ContentSection>
              )}

              {project.problem && (
                <ContentSection title="The Challenge" icon={AlertCircle}>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{project.problem}</p>
                </ContentSection>
              )}

              {project.solution && (
                <ContentSection title="Our Solution" icon={CheckCircle2}>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{project.solution}</p>
                </ContentSection>
              )}

              {project.results && (
                <ContentSection title="Results & Impact" icon={BarChart3}>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{project.results}</p>
                </ContentSection>
              )}
            </div>

            {/* Sidebar: Project details card */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-24 rounded-[20px] border border-border bg-card p-6 space-y-5">
                <h3 className="font-display text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Engagement Metadata
                </h3>

                {(project.clientName || project.client) && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Client</p>
                    <p className="text-xs font-semibold text-foreground">{project.clientName || project.client}</p>
                  </div>
                )}

                {(project.publishedAt || project.completionDate) && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Completed</p>
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(project.publishedAt || project.completionDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long" },
                      )}
                    </p>
                  </div>
                )}

                {project.services?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {project.services.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[9px] font-semibold rounded-full px-2.5 py-0.5">
                          {s === "Web Development" ? "Business Websites" : s === "Custom Software" ? "Operations Software" : s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.industry && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Industry</p>
                    <p className="text-xs font-semibold text-foreground">
                      {project.industry === "Web Development" ? "Business Websites" : project.industry === "Custom Software" ? "Operations Software" : project.industry}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Gallery -- */}
      {project.gallery?.length > 0 && (
        <section className="py-16 bg-card border-t border-border">
          <div className="container">
            <h2 className="font-display text-xl font-bold mb-8">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.gallery.map((img, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-[20px] overflow-hidden border border-border bg-muted group"
                >
                  <img
                    src={optimizeImageUrl(img.url, 600)}
                    alt={img.alt || `Gallery image ${i + 1}`}
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-355"
                    loading="lazy"
                    width="600"
                    height="338"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -- CTA -- */}
      <section className="py-20 md:py-28 bg-background border-t border-border">
        <div className="container">
          <FadeIn className="overflow-hidden rounded-[20px] border border-[#4A4038] bg-dark-surface text-[#F6F2EC] text-center p-10 md:p-16">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFA27A]/20 bg-[#BFA27A]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFA27A] mx-auto w-fit">
              Get Started
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
              Interested in a similar build?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto mb-10 leading-relaxed">
              We look at your problems holistically. Let's start an engagement to align your business goals and configure the ideal software roadmap.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-11 rounded-full bg-primary hover:bg-[#5A3728] text-primary-foreground font-medium px-8 border-none shadow-none text-sm w-full sm:w-auto" asChild>
                <Link to={publicRoutes.contact}>Book a Consultation</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-full border-[#4A4038] bg-transparent text-white hover:bg-[#4A4038] font-medium px-8 text-sm w-full sm:w-auto"
                asChild
              >
                <Link to={publicRoutes.portfolio}>
                  More Projects <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
