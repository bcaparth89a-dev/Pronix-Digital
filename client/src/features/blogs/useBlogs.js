import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogsService } from "./blogsService";

const QUERY_KEY = "blogs";

export function useBlogs(params) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => blogsService.list(params),
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => blogsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-blogs"] });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => blogsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-blogs"] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => blogsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-blogs"] });
    },
  });
}

export function useBlog(id) {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => blogsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useReorderBlogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orders) => blogsService.reorder(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-blogs"] });
    },
  });
}
