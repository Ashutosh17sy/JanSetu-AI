import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { timeAgo, classNames } from '@/services/utils';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const { profile } = useAuth();
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 sm:block">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search complaints, tickets…"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 12).map((n) => (
                      <Link
                        key={n.id}
                        to={n.complaint_id ? `/app/complaints/${n.complaint_id}` : '/app'}
                        onClick={() => {
                          if (!n.read) markRead(n.id);
                          setNotifOpen(false);
                        }}
                        className={classNames(
                          'flex gap-3 border-b border-slate-50 dark:border-slate-800/50 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                          !n.read && 'bg-blue-50/50 dark:bg-blue-950/20',
                        )}
                      >
                        <span className={classNames('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-blue-500')} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(n.created_at)}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/app/profile" className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-sm font-semibold text-white">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
            {profile?.full_name?.split(' ')[0] || 'User'}
          </span>
        </Link>
      </div>
    </header>
  );
}
