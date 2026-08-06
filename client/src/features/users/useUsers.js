import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "./usersService";

const QUERY_KEY = "users";

export function useUsers(params) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => usersService.list(params),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => usersService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
