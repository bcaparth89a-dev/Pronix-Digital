import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "./projectsService";

const QUERY_KEY = "projects";

export function useProjects(params) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => projectsService.list(params),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => projectsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => projectsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-projects"] });
    },
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => projectsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orders) => projectsService.reorder(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-projects"] });
    },
  });
}
