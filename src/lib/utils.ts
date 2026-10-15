import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TicketPriority, TicketStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  // Safe random 6-character alphanumeric sequence
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SQRP-${year}-${randomPart}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export function getStatusBadge(status: TicketStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
} {
  switch (status) {
    case "SUBMITTED":
      return {
        label: "Submitted",
        bg: "bg-blue-50 dark:bg-blue-950/40",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
        dotColor: "bg-blue-500",
      };
    case "TRIAGED":
      return {
        label: "Triaged",
        bg: "bg-cyan-50 dark:bg-cyan-950/40",
        text: "text-cyan-700 dark:text-cyan-300",
        border: "border-cyan-200 dark:border-cyan-800",
        dotColor: "bg-cyan-500",
      };
    case "ASSIGNED":
      return {
        label: "Assigned",
        bg: "bg-indigo-50 dark:bg-indigo-950/40",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-200 dark:border-indigo-800",
        dotColor: "bg-indigo-500",
      };
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800",
        dotColor: "bg-amber-500",
      };
    case "WAITING_FOR_STUDENT":
      return {
        label: "Waiting on Student",
        bg: "bg-purple-50 dark:bg-purple-950/40",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
        dotColor: "bg-purple-500",
      };
    case "WAITING_FOR_APPROVAL":
      return {
        label: "Pending Approval",
        bg: "bg-orange-50 dark:bg-orange-950/40",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-200 dark:border-orange-800",
        dotColor: "bg-orange-500",
      };
    case "RESOLVED":
      return {
        label: "Resolved",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800",
        dotColor: "bg-emerald-500",
      };
    case "CLOSED":
      return {
        label: "Closed",
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-300 dark:border-slate-700",
        dotColor: "bg-slate-500",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-800",
        dotColor: "bg-rose-500",
      };
    case "REOPENED":
      return {
        label: "Reopened",
        bg: "bg-yellow-50 dark:bg-yellow-950/40",
        text: "text-yellow-800 dark:text-yellow-300",
        border: "border-yellow-200 dark:border-yellow-800",
        dotColor: "bg-yellow-500",
      };
    case "ESCALATED":
      return {
        label: "Escalated",
        bg: "bg-red-50 dark:bg-red-950/40",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-200 dark:border-red-800",
        dotColor: "bg-red-600",
      };
    default:
      return {
        label: status,
        bg: "bg-slate-50 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-700",
        dotColor: "bg-slate-400",
      };
  }
}

export function getPriorityBadge(priority: TicketPriority): {
  label: string;
  badgeClass: string;
} {
  switch (priority) {
    case "URGENT":
      return {
        label: "Urgent",
        badgeClass: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
      };
    case "HIGH":
      return {
        label: "High",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
      };
    case "MEDIUM":
      return {
        label: "Medium",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
      };
    case "LOW":
      return {
        label: "Low",
        badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      };
  }
}
