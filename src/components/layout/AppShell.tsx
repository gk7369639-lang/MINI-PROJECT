"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Profile, UserRole } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  initialRole?: UserRole;
}

export function AppShell({ children, initialRole = "STUDENT" }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<Profile | undefined>(undefined);

  useEffect(() => {
    const savedId = localStorage.getItem("sqrp_active_user_id");

    fetch("/api/auth/me", {
      headers: savedId ? { "x-user-id": savedId } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setActiveUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const currentRole = activeUser?.role || initialRole;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-navy-950 flex flex-col font-sans">
      <Navbar user={activeUser} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex">
        <Sidebar
          role={currentRole}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
