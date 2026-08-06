import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { metricsService } from "./metricsService";

export function useMetrics(params = {}) {
  return useQuery({
    queryKey: ["metrics", params],
    queryFn: () => metricsService.list(params),
  });
}

export function useMetric(id) {
  return useQuery({
    queryKey: ["metrics", id],
    queryFn: () => metricsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => metricsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => metricsService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["metrics", variables.id] });
    },
  });
}

export function useDeleteMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => metricsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}
