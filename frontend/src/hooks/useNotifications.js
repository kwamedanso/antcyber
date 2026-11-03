// hooks/useNotifications.js
import { usePrivateQuery } from './usePrivateQuery';
import { usePrivateMutation } from './usePrivateMutation';

export const useNotifications = () => {
  const queryKey = ['notifications'];

  const { data: response, isLoading } = usePrivateQuery(
    queryKey,
    '/api/notifications',
    {},
    { staleTime: 30_000, refetchInterval: 60_000 } // Poll every minute for new alerts
  );

  const { mutate: markAsRead } = usePrivateMutation({
    targetQueryKey: queryKey,
  });

  const { mutate: markAllAsRead } = usePrivateMutation({
    targetQueryKey: queryKey,
  });

  const handleMarkAsRead = (id) => {
    markAsRead({
      url: `/api/notifications/${id}/read`,
      method: 'PATCH',
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead({
      url: '/api/notifications/read-all',
      method: 'PATCH',
    });
  };

  return {
    notifications: response?.data?.notifications || [],
    unreadCount: response?.data?.unreadCount || 0,
    isLoading,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
};