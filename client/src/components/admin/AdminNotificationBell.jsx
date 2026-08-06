import { useEffect, useRef, useState } from "react";
import { Bell, CheckSquare, Inbox } from "lucide-react";
import { m as motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/features/notifications/useNotifications";
import { cn } from "@/lib/utils";

export function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllAsRead() {
    try {
      await markAllRead.mutateAsync();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotificationClick(item) {
    try {
      if (!item.read) {
        await markRead.mutateAsync(item.id);
      }
      setIsOpen(false);
      if (item.link) {
        navigate(item.link);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-accent text-foreground transition-all duration-200 outline-none",
          isOpen && "bg-accent border-accent-foreground/20"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-[#E8E2D9] bg-white p-2 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E8E2D9] px-3 py-2 pb-2">
              <span className="text-xs font-bold text-[#1C1612] uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllRead.isPending}
                  className="flex items-center gap-1 text-[10.5px] font-bold text-primary hover:text-[#5A3728] transition-colors disabled:opacity-50"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto py-1 scrollbar-none">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-4 w-3/4 rounded bg-muted/65 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted/50 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted/65 animate-pulse mt-2" />
                  <div className="h-3 w-1/3 rounded bg-muted/50 animate-pulse" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Inbox className="h-8 w-8 opacity-40 mb-2" />
                  <p className="text-xs font-medium">All caught up!</p>
                  <p className="text-[10px] opacity-75 mt-0.5">No recent notifications.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#FAF8F5]">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={cn(
                        "group relative flex flex-col gap-1 px-3 py-2.5 hover:bg-[#FCFBF9] rounded-lg transition-all duration-200 cursor-pointer text-left border-l-2 border-transparent mt-0.5",
                        !item.read && "bg-[#FAF8F5]/60 border-l-primary"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-xs leading-snug text-foreground", !item.read ? "font-bold" : "font-medium")}>
                          {item.title}
                        </p>
                        {!item.read && (
                          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                      <p className="text-[10.5px] leading-normal text-muted-foreground line-clamp-2">
                        {item.message}
                      </p>
                      <span className="text-[9px] font-medium text-muted-foreground mt-0.5">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
