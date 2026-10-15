"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  Menu,
  X,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import { NotificationItem, Profile } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface NavbarProps {
  user?: Profile;
  onToggleSidebar?: () => void;
}

export function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeUserId = user?.id || "user-student-1";

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${activeUserId}`, {
        headers: { "x-user-id": activeUserId },
      });
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: NotificationItem) => !n.is_read).length);
      }
    } catch {
      // Ignore in offline mode
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [activeUserId]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({ markAll: true, userId: activeUserId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Handled
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("sqrp_active_user_id");
    localStorage.removeItem("sqrp_active_role");
    document.cookie = "sqrp_user_id=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-navy-950/95 backdrop-blur border-b border-slate-200 dark:border-navy-800">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-900 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-navy-900 to-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-navy-950 dark:text-white tracking-tight text-base sm:text-lg">
                  SQRP
                </span>
                <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-1.5 py-0.2 rounded dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  AI v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block leading-none">
                National Institute of Technology
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/track"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-900 transition-colors"
          >
            <Search className="w-4 h-4 text-primary-600" />
            <span>Track Query</span>
          </Link>

          <Link
            href="/knowledge-base"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-900 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary-600" />
            <span>Knowledge Base</span>
          </Link>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 py-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy-950 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/50 ${
                          !n.is_read ? "bg-primary-50/40 dark:bg-primary-950/20" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={() => setShowNotifs(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 mt-1 hover:underline"
                          >
                            <span>View ticket</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-navy-800">
            <div className="w-8 h-8 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.full_name || "Aarav Sharma"}
              </p>
              <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider">
                {user?.role?.replace("_", " ") || "STUDENT"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
