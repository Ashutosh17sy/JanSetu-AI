import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/api';
import type { Notification } from '@/services/types';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const data = await fetchNotifications(profile.id);
    setNotifications(data);
    setUnread(data.filter((n) => !n.read).length);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    load();
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setNotifications((prev) => [n, ...prev].slice(0, 50));
          setUnread((u) => u + 1);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, load]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!profile?.id) return;
    await markAllNotificationsRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, [profile?.id]);

  return { notifications, unread, loading, markRead, markAllRead, reload: load };
}
