import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ArrowRight, Calendar, Clock, Newspaper, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { usePublicBlogs } from "@/features/public/usePublicBlogs";
import { publicRoutes } from "@/config/navigation";
import { cn, optimizeImageUrl } from "@/lib/utils";
import { FadeIn, FadeInItem, FadeInStagger } from "@/lib/motion";
import { JournalDots } from "@/components/public/DotGridBackground";
import { useSeoMetadata } from "@/lib/seo";
import { ImageLightbox } from "@/components/common/ImageLightbox";

// -- Skeleton card -------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="rounded-[20px] border border-border bg-card overflow-hidden">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-muted animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

// -- Filter pill ---------------------------------------------------------------
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 border cursor-pointer",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:bg-[#EEE7DD] hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// -- Blog card -----------------------------------------------------------------
function BlogCard({ blog, layout = "vertical", onImageClick }) {
  const isHorizontal = layout === "horizontal";

  return (
    <Link
      to={publicRoutes.blogDetail(blog.slug)}
      className={cn(
        "group flex rounded-[20px] border border-border overflow-hidden bg-card hover:border-primary/45 hover:shadow-xl-soft transition-all duration-300",
        isHorizontal ? "flex-col md:flex-row h-full min-h-[220px]" : "flex-col h-full"
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted shrink-0",
          isHorizontal
            ? "w-full md:w-[40%] aspect-[16/10] md:aspect-auto border-b md:border-b-0 md:border-r border-border/40"
            : "aspect-[16/10] border-b border-border/40"
        )}
      >
        {blog.coverImage?.url ? (
          <img
            src={optimizeImageUrl(blog.coverImage.url, 600)}
            alt={blog.title}
            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-550 cursor-zoom-in"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onImageClick(blog.coverImage.url, blog.title);
            }}
            loading="lazy"
            width="600"
            height="375"
            decoding="async"
          />
        ) : (
          <div className="h-full w-full bg-[#EEE7DD]/40 flex items-center justify-center min-h-[140px]">
            <Newspaper className="h-10 w-10 text-primary/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="space-y-3 mb-4 text-left">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wider text-[#3E332B]">
            {blog.category && (
              <span className="rounded-full bg-[#FAF8F5] border border-[#E8E2D9] px-2.5 py-0.5 text-[9px] uppercase font-bold">
                {blog.category}
              </span>
            )}
            {blog.readingTimeMinutes && (
              <span className="text-muted-foreground uppercase text-[9px]">
                • {blog.readingTimeMinutes} min read
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-base sm:text-lg md:text-xl text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-3 leading-relaxed">
            {blog.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3.5 border-t border-border mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary group-hover:text-[#5A3728] transition-colors">
            Read Article <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 duration-300" />
          </span>
        </div>
      </div>
    </Link>
  );
}


// -- Main page -----------------------------------------------------------------
export function BlogListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const pageParam = Number(searchParams.get("page") || 1);
  const [page, setPage] = useState(pageParam > 0 ? pageParam : 1);
  const [inputValue, setInputValue] = useState(search);
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

  const { data, isLoading } = usePublicBlogs({ search, category, page, limit: 9 });
  const { data: allBlogsData } = usePublicBlogs({ limit: 1000 });

  const blogs = useMemo(() => data?.items ?? [], [data]);
  const meta = data?.meta ?? null;

  useEffect(() => {
    const nextPage = pageParam > 0 ? pageParam : 1;
    if (nextPage !== page) {
      setPage(nextPage);
    }
  }, [page, pageParam]);

  const categories = useMemo(() => {
    const items = allBlogsData?.items ?? [];
    const cats = items.map((b) => b.category).filter(Boolean);
    const seen = new Set();
    const unique = [];
    for (const cat of cats) {
      const normalized = cat.trim();
      const lower = normalized.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(normalized);
      }
    }
    return unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [allBlogsData]);

  const featuredBlog = useMemo(() => blogs.find((b) => b.isFeatured) ?? null, [blogs]);

  const showFeatured = !search && !category && page === 1 && featuredBlog != null;

  const gridBlogs = useMemo(
    () => (showFeatured ? blogs.filter((b) => b.id !== featuredBlog?.id) : blogs),
    [blogs, showFeatured, featuredBlog],
  );

  function handleSearch(e) {
    e.preventDefault();
    const params = {};
    if (inputValue) params.search = inputValue;
    if (category) params.category = category;
    setSearchParams(params);
    setPage(1);
  }

  function clearCategory() {
    const params = {};
    if (search) params.search = search;
    setSearchParams(params);
    setPage(1);
  }

  function selectCategory(cat) {
    const params = {};
    if (search) params.search = search;
    params.category = cat;
    setSearchParams(params);
    setPage(1);
  }

  function updatePage(nextPage) {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (nextPage > 1) params.page = String(nextPage);
    setSearchParams(params);
    setPage(nextPage);
  }

  useSeoMetadata({
    page,
    totalPages: meta?.totalPages,
  });

  return (
    <div>
      {/* -- Hero ----------------------------------------------------------- */}
      <section
        className="relative border-b border-border bg-background overflow-hidden bg-mesh"
        style={{ paddingTop: "clamp(6.5rem, 10vw, 9rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}
      >
        <JournalDots />
        <div className="container relative z-10">
          <FadeIn>
            <span className="section-tag mb-4 block w-fit">Insights</span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-balance">
              Ideas &amp; <span className="italic text-primary font-normal">Insights</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-lg leading-relaxed mb-8">
              Bespoke thinking, architectural software updates, design patterns, and launch details from our partners.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search journal entries..."
                  className="flex h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-xs outline-none transition-all placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" className="h-10 rounded-full px-5 text-xs font-semibold uppercase tracking-wider bg-primary hover:bg-[#5A3728] text-primary-foreground border-none shadow-none">
                Search
              </Button>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* -- Category filter pills ------------------------------------------- */}
      {categories.length > 0 && (
        <div className="bg-background border-b border-border">
          <div className="container py-3.5 flex gap-1.5 overflow-x-auto scrollbar-none">
            <FilterPill active={!category} onClick={clearCategory}>
              All Categories
            </FilterPill>
            {categories.map((cat) => (
              <FilterPill key={cat} active={category === cat} onClick={() => selectCategory(cat)}>
                {cat}
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {/* -- Blog content ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-background" style={{ paddingBlock: "var(--space-section)" }}>
        <JournalDots />
        <div className="container relative z-10">
          {isLoading ? (
            /* Loading skeleton */
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-span-full sm:col-span-3 lg:col-span-2">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEE7DD] mb-6 border border-border">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-base font-bold mb-2">No articles found</p>
              <p className="text-xs text-muted-foreground mb-8 max-w-xs leading-relaxed">
                {search || category
                  ? "Adjust search keywords or check other categories."
                  : "We are drafting our initial journal entries. Check back soon."}
              </p>
              {(search || category) && (
                <Button
                  variant="outline"
                  className="rounded-full text-xs h-9 px-5"
                  onClick={() => {
                    setInputValue("");
                    setSearchParams({});
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Featured blog post */}
              {showFeatured && featuredBlog && (
                <FadeIn className="mb-12">
                  <Link
                    to={publicRoutes.blogDetail(featuredBlog.slug)}
                    className="group block rounded-[20px] border border-border overflow-hidden bg-card hover:border-primary/45 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-muted min-h-[220px]">
                        {featuredBlog.coverImage?.url ? (
                          <img
                            src={optimizeImageUrl(featuredBlog.coverImage.url, 1000)}
                            alt={featuredBlog.title}
                            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-555 cursor-zoom-in"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedImage({ url: featuredBlog.coverImage.url, alt: featuredBlog.title });
                            }}
                            loading="lazy"
                            width="1000"
                            height="563"
                            decoding="async"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#EEE7DD]/40 flex items-center justify-center">
                            <Newspaper className="h-10 w-10 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-[#BFA27A]/15 text-[#BFA27A] border border-[#BFA27A]/25 rounded-full text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                            Featured
                          </Badge>
                          {featuredBlog.category && (
                            <Badge variant="secondary" className="text-[10px] font-semibold rounded-full px-2.5 py-0.5">
                              {featuredBlog.category}
                            </Badge>
                          )}
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors text-balance">
                          {featuredBlog.title}
                        </h2>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-5">
                          {featuredBlog.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(
                              featuredBlog.publishedAt || featuredBlog.createdAt,
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          {featuredBlog.readingTimeMinutes && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {featuredBlog.readingTimeMinutes} min read
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              )}

              {/* Regular blog grid */}
              {gridBlogs.length > 0 && (() => {
                const remainder = gridBlogs.length % cols;
                const lastRowStartIndex = gridBlogs.length - remainder;

                return (
                  <FadeInStagger className="grid grid-cols-1 sm:grid-cols-6 gap-6 md:gap-8">
                    {gridBlogs.map((blog, i) => {
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
                        <FadeInItem key={blog.id} className={colSpanClass} direction="scale">
                          <BlogCard
                            blog={blog}
                            layout={cardLayout}
                            onImageClick={(url, alt) => setSelectedImage({ url, alt })}
                          />
                        </FadeInItem>
                      );
                    })}
                  </FadeInStagger>
                );
              })()}
            </>
          )}

          {/* Pagination */}
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
