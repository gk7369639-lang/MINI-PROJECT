"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Inbox,
  CheckCircle,
  Clock,
  ShieldCheck,
  Users,
  Building2,
  FileSpreadsheet,
  History,
  BookOpen,
  LifeBuoy,
} from "lucide-react";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarLink {
  label: string;
  href: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
}

interface SidebarProps {
  role?: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ role = "STUDENT", isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks: SidebarLink[] = [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Submit New Query", href: "/student/new-query", icon: PlusCircle, highlight: true },
    { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  ];

  const staffLinks: SidebarLink[] = [
    { label: "Ticket Workdesk", href: "/staff", icon: Inbox },
    { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  ];

  const headLinks: SidebarLink[] = [
    { label: "Department Dashboard", href: "/department-head", icon: LayoutDashboard },
    { label: "Pending Approvals", href: "/department-head/approvals", icon: ShieldCheck, badge: "Action Required" },
    { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  ];

  const adminLinks: SidebarLink[] = [
    { label: "System Analytics", href: "/admin", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Departments & SLAs", href: "/admin/departments", icon: Building2 },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    { label: "Export Reports", href: "/admin/reports", icon: FileSpreadsheet },
    { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  ];

  let links: SidebarLink[] = studentLinks;
  if (role === "STAFF") links = staffLinks;
  if (role === "DEPARTMENT_HEAD") links = headLinks;
  if (role === "ADMIN") links = adminLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-navy-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {role.replace("_", " ")} PORTAL
            </p>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 font-bold"
                        : "text-slate-600 hover:text-navy-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-navy-900",
                      link.highlight &&
                        !isActive &&
                        "bg-primary-600 text-white hover:bg-primary-700 hover:text-white shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : link.highlight
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}
                      />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:bg-amber-950 dark:text-amber-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Support card footer */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white border border-navy-800 shadow-md">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>AI Automated Triage</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            SQRP engine auto-classifies queries & routes SLA timers to certified college faculty desks.
          </p>
        </div>
      </aside>
    </>
  );
}
