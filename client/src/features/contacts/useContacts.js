import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactsService } from "./contactsService";

const QUERY_KEY = "contacts";

export function useContacts(params) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => contactsService.list(params),
  });
}

export function useContact(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => contactsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => contactsService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
