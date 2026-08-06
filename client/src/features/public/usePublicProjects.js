import { useQuery } from "@tanstack/react-query";
import { projectsService } from "@/features/projects/projectsService";

const KEY = "public-projects";

export function usePublicProjects(params = {}) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => projectsService.list({ status: "published", sort: "sortOrder", ...params }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: [KEY, "featured"],
    queryFn: () =>
      projectsService.list({ status: "published", isFeatured: true, sort: "sortOrder", limit: 6 }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicProject(slug) {
  return useQuery({
    queryKey: [KEY, "detail", slug],
    queryFn: () => projectsService.getBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}
