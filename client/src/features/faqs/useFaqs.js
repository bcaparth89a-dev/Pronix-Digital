import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqsService } from "./faqsService";

const QUERY_KEY = "faqs";

export function useFaqs(params) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => faqsService.list(params),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => faqsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs"] });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => faqsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs"] });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => faqsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs"] });
    },
  });
}

export function useReorderFaqs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orders) => faqsService.reorder(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["public-faqs"] });
    },
  });
}
