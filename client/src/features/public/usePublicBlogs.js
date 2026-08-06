import { useQuery } from "@tanstack/react-query";
import { blogsService } from "@/features/blogs/blogsService";

const KEY = "public-blogs";

export function usePublicBlogs(params = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => blogsService.list({ status: "published", sort: "sortOrder", ...params }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicBlog(slug) {
  return useQuery({
    queryKey: [KEY, "detail", slug],
    queryFn: () => blogsService.getBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRelatedBlogs(category, excludeSlug) {
  return useQuery({
    queryKey: [KEY, "related", category, excludeSlug],
    queryFn: () =>
      blogsService
        .list({ status: "published", category, limit: 3 })
        .then((data) => ({
          ...data,
          items: data.items.filter((b) => b.slug !== excludeSlug).slice(0, 3),
        })),
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  });
}
