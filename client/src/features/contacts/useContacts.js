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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "analytics"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "analytics"] });
    },
  });
}

export function useUpdateContactNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }) => contactsService.updateNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useBulkDeleteContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => contactsService.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "analytics"] });
    },
  });
}

export function useBulkUpdateContactsStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }) => contactsService.bulkUpdateStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "analytics"] });
    },
  });
}

export function useContactAnalytics() {
  return useQuery({
    queryKey: [QUERY_KEY, "analytics"],
    queryFn: () => contactsService.getAnalytics(),
    refetchInterval: 30000,
  });
}
