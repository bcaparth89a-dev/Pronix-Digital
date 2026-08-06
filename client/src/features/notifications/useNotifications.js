import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "./notificationsService";

const QUERY_KEY = "notifications";

export function useNotifications() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => notificationsService.getRecent(),
    refetchInterval: 20000, // Poll every 20 seconds for real-time notifications
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
