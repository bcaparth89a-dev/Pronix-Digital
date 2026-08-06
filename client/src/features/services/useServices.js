import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "./servicesService";

export function useServices(params = {}) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => servicesService.list(params),
  });
}

export function useService(id) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => servicesService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => servicesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => servicesService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", variables.id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => servicesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
