import { useQuery } from "@tanstack/react-query";
import { faqsService } from "@/features/faqs/faqsService";

export function usePublicFaqs(params = {}) {
  return useQuery({
    queryKey: ["public-faqs", params],
    queryFn: () => faqsService.list({ sort: "sortOrder", ...params, limit: 100 }),
    staleTime: 10 * 60 * 1000,
  });
}
