import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { m as motion, AnimatePresence } from "framer-motion";
import { FolderKanban, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { usePublicProjects } from "@/features/public/usePublicProjects";
import { publicRoutes } from "@/config/navigation";
import { cn, optimizeImageUrl } from "@/lib/utils";
import { FadeIn, FadeInStagger, FadeInItem } from "@/lib/motion";
import { SelectedWorkDots } from "@/components/public/DotGridBackground";
import { useSeoMetadata } from "@/lib/seo";
import { ImageLightbox } from "@/components/common/ImageLightbox";

// --- Project Card -------------------------------------------------------------

function ProjectCard({ project, layout = "vertical", onImageClick }) {
  const isHorizontal = layout === "horizontal";

  return (
    <Link
      to={publicRoutes.portfolioDetail(project.slug)}
      className={cn(
        "group flex rounded-[20px] border border-border overflow-hidden bg-card hover:border-primary/45 hover:shadow-xl-soft transition-all duration-355",
        isHorizontal ? "flex-col md:flex-row h-full min-h-[220px]" : "flex-col h-full"
      )}
    >
      {/* Image / placeholder */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted shrink-0",
          isHorizontal
            ? "w-full md:w-[40%] aspect-[16/10] md:aspect-auto border-b md:border-b-0 md:border-r border-border/40"
            : "aspect-[16/10] border-b border-border/40"
        )}
      >
        {project.coverImage?.url ? (
          <img
            src={optimizeImageUrl(project.coverImage.url, 600)}
            alt={project.title}
            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-555 cursor-zoom-in"
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
          <div className="h-full w-full bg-[#EEE7DD]/30 flex items-center justify-center min-h-[140px]">
            <FolderKanban className="h-10 w-10 text-primary/15" />
          </div>
        )}

        {/* Featured badge */}
        {project.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full border border-primary/20 bg-primary px-2.5 py-0.5 text-[8px] font-bold text-primary-foreground uppercase tracking-wider">
              Featured
            </span>
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider">
            View Project <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className={cn("flex flex-col flex-1 p-5", isHorizontal ? "justify-center" : "justify-between")}>
        <div className="space-y-2 text-left">
          {project.industry && (
            <div className="mb-1">
              <span className="w-fit inline-flex items-center whitespace-nowrap rounded-full bg-[#FAF8F5] text-[#3E332B] border border-[#E8E2D9] px-2.5 py-0.5 text-[9px] font-semibold">
                {project.industry === "Web Development" ? "Business Websites" : project.industry === "Custom Software" ? "Operations Software" : project.industry}
              </span>
            </div>
          )}
          <h3 className="font-display text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        </div>
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4 pt-3.5 border-t border-border/40">
            {project.technologies.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[9px] text-muted-foreground font-semibold"
              >
                {t}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[9px] text-muted-foreground">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// --- Page ---------------------------------------------------------------------

export function PortfolioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeIndustry = searchParams.get("industry") || "";
  const pageParam = Number(searchParams.get("page") || 1);
  const [page, setPage] = useState(pageParam > 0 ? pageParam : 1);
  const [cols, setCols] = useState(3);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) {
        setCols(3);
      } else if (window.innerWidth >= 640) {
        setCols(2);
      } else {
        setCols(1);
      }
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const { data, isLoading } = usePublicProjects({
    industry: activeIndustry || undefined,
    limit: 12,
    page,
  });
  
  const { data: allProjectsData } = usePublicProjects({ limit: 1000 });

  const projects = data?.items ?? [];
  const meta = data?.meta;

  useEffect(() => {
    const nextPage = pageParam > 0 ? pageParam : 1;
    if (nextPage !== page) {
      setPage(nextPage);
    }
  }, [page, pageParam]);

  const dynamicFilters = useMemo(() => {
    const items = allProjectsData?.items ?? [];
    const industries = items.map((p) => p.industry).filter(Boolean);
    const seen = new Set();
    const unique = [];
    for (const ind of industries) {
      const normalized = ind.trim();
      const lower = normalized.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(normalized);
      }
    }
    unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    return [
      { label: "All Works", value: "" },
      ...unique.map((ind) => {
        let label = ind;
        if (ind === "Web Development") label = "Business Websites";
        else if (ind === "Custom Software") label = "Operations Software";
        return { label, value: ind };
      })
    ];
  }, [allProjectsData]);

  useEffect(() => {
    setPage(1);
  }, [activeIndustry]);

  function handleFilter(value) {
    if (value) {
      setSearchParams({ industry: value });
    } else {
      setSearchParams({});
    }
  }

  function updatePage(nextPage) {
    const params = {};
    if (activeIndustry) params.industry = activeIndustry;
    if (nextPage > 1) params.page = String(nextPage);
    setSearchParams(params);
    setPage(nextPage);
  }

  useSeoMetadata({
    page,
    totalPages: meta?.totalPages,
  });

  // Calculate layout variables for the grid elements
  const remainder = projects.length % cols;
  const lastRowStartIndex = projects.length - remainder;

  return (
    <div>
      {/* -- Hero -- */}
      <section
        className="relative border-b border-border bg-background overflow-hidden bg-mesh"
        style={{ paddingTop: "clamp(6.5rem, 10vw, 9rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}
      >
        {/* Soft patterns */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.02] pointer-events-none" aria-hidden="true" />
        
        <SelectedWorkDots />
        <div className="container relative z-10">
          <FadeIn>
            <span className="section-tag mb-4 block w-fit">Selected Works</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-balance">
              Selected <span className="italic text-primary font-normal">Works</span>
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed mb-8">
              Explore custom systems, responsive web platforms, and mobile apps shipped with senior craftsmanship.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* -- Sticky filter tabs -- */}
      <div className="bg-background border-b border-border">
        <div className="container">
          <div className="flex gap-1.5 overflow-x-auto py-3.5 scrollbar-none">
            {dynamicFilters.map((f) => (
              <motion.button
                key={f.value}
                onClick={() => handleFilter(f.value)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border cursor-pointer",
                  activeIndustry === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-[#EEE7DD] hover:text-foreground",
                )}
                whileTap={{ scale: 0.97 }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* -- Projects grid -- */}
      <section className="bg-background relative overflow-hidden bg-mesh" style={{ paddingBlock: "var(--space-section)" }}>
        {/* Subtle mesh grid background overlay */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-[0.015] pointer-events-none" />
        
        <SelectedWorkDots />
        <div className="container relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndustry + String(page)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 md:gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="col-span-full sm:col-span-3 lg:col-span-2 rounded-[20px] border border-border overflow-hidden bg-card">
                      <div className="aspect-video shimmer" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 w-20 shimmer rounded-full" />
                        <div className="h-5 w-3/4 shimmer rounded-lg" />
                        <div className="h-3 w-full shimmer rounded" />
                        <div className="h-3 w-2/3 shimmer rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="flex flex-col items-center py-24 text-center">
                  <FolderKanban className="h-12 w-12 text-primary/10 mb-4" />
                  <h3 className="font-display text-base font-bold mb-2">No projects found</h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    Try another search category.
                  </p>
                  <Button variant="outline" className="rounded-full text-xs h-9 px-5" onClick={() => handleFilter("")}>
                    View all projects
                  </Button>
                </div>
              ) : (
                <FadeInStagger className="grid grid-cols-1 sm:grid-cols-6 gap-6 md:gap-8">
                  {projects.map((project, i) => {
                    const isLastRow = i >= lastRowStartIndex;
                    let colSpanClass = "col-span-full";
                    let cardLayout = "vertical";

                    if (!isLastRow || remainder === 0) {
                      colSpanClass = "col-span-full sm:col-span-3 lg:col-span-2";
                    } else if (remainder === 1) {
                      colSpanClass = "col-span-full";
                      cardLayout = "horizontal";
                    } else if (remainder === 2) {
                      colSpanClass = "col-span-full lg:col-span-3";
                      cardLayout = "horizontal";
                    }

                    return (
                      <FadeInItem key={project.id} className={colSpanClass} direction="scale">
                        <ProjectCard
                          project={project}
                          layout={cardLayout}
                          onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                        />
                      </FadeInItem>
                    );
                  })}
                </FadeInStagger>
              )}
            </motion.div>
          </AnimatePresence>

          {meta?.totalPages > 1 && (
            <div className="mt-12 pt-8 border-t border-border">
            <AdminPagination meta={meta} page={page} onChange={updatePage} />
            </div>
          )}
        </div>
      </section>

      <ImageLightbox
        src={selectedImage?.url}
        alt={selectedImage?.alt}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
