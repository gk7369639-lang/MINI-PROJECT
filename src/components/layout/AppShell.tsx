"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { Profile, UserRole } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  initialRole?: UserRole;
}

export function AppShell({ children, initialRole = "STUDENT" }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<Profile | undefined>(undefined);

  useEffect(() => {
    const savedId = localStorage.getItem("sqrp_active_user_id") || "user-student-1";
    // Fetch profile
    fetch(`/api/tickets?userId=${savedId}`, { headers: { "x-user-id": savedId } })
      .then(() => {
        // Mock set profile locally based on ID
        if (savedId === "user-staff-1") {
          setActiveUser({
            id: "user-staff-1",
            email: "staff@nite.edu.in",
            full_name: "Dr. Ramesh Kumar",
            role: "STAFF",
            department_name: "Academic Affairs & Registry",
            department_id: "dept-acad",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (savedId === "user-head-1") {
          setActiveUser({
            id: "user-head-1",
            email: "head@nite.edu.in",
            full_name: "Prof. Meenakshi Sundaram",
            role: "DEPARTMENT_HEAD",
            department_name: "Academic Affairs & Registry",
            department_id: "dept-acad",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else if (savedId === "user-admin-1") {
          setActiveUser({
            id: "user-admin-1",
            email: "admin@nite.edu.in",
            full_name: "System Administrator",
            role: "ADMIN",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setActiveUser({
            id: "user-student-1",
            email: "student@nite.edu.in",
            full_name: "Aarav Sharma",
            role: "STUDENT",
            student_id_number: "22BCE1045",
            department_name: "Computer Science & Engineering",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      })
      .catch(() => {});
  }, []);

  const currentRole = activeUser?.role || initialRole;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-navy-950 flex flex-col font-sans">
      <RoleSwitcher />
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
