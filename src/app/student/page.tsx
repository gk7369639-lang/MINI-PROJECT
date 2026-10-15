"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Inbox,
  Hourglass,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Ticket, TicketStatus } from "@/types";
import { getStatusBadge, getPriorityBadge, formatDate, formatRelativeTime } from "@/lib/utils";

export default function StudentDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [activeUserId, setActiveUserId] = useState<string>("user-student-1");

  const fetchTickets = async (uid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets?userId=${uid}`, {
        headers: { "x-user-id": uid },
      });
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("sqrp_active_user_id");
    const uid = saved || "user-student-1";
    if (saved) setActiveUserId(saved);
    fetchTickets(uid);
  }, []);

  const totalSubmitted = tickets.length;
  const inProgressCount = tickets.filter((t) =>
    [
      "UNDER_FACULTY_REVIEW",
      "READY_FOR_ASSIGNMENT",
      "ASSIGNED_TO_WORKER",
      "WORKER_ACCEPTED",
      "IN_PROGRESS",
      "WAITING_FOR_PARTS_OR_RESOURCES",
      "ASSIGNED",
    ].includes(t.status)
  ).length;
  const waitingCount = tickets.filter((t) =>
    ["WAITING_FOR_STUDENT", "WAITING_FOR_CLARIFICATION", "WAITING_FOR_APPROVAL"].includes(t.status)
  ).length;
  const resolvedCount = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchId = t.ticket_number.toLowerCase().includes(q);
      const matchDept = (t.department_name || "").toLowerCase().includes(q);
      const matchLoc = (t.location_building || "").toLowerCase().includes(q) || (t.location_room || "").toLowerCase().includes(q);
      if (!matchSubject && !matchId && !matchDept && !matchLoc) return false;
    }
    return true;
  });

  return (
    <AppShell initialRole="STUDENT">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-navy-800">
          <div>
            <h1 className="text-2xl font-black text-navy-950 dark:text-white tracking-tight">
              Student Support Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track, submit, and manage your academic queries with automated SLA guarantees
            </p>
          </div>
          <Link href="/student/new-query">
            <Button size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Submit New Query
            </Button>
          </Link>
        </div>

        {/* Real Metrics Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submitted</p>
                <p className="text-2xl font-black text-navy-950 dark:text-white mt-1">{totalSubmitted}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{inProgressCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waiting Action</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{waitingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Hourglass className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by ticket # or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:bg-navy-950 dark:border-navy-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "SUBMITTED", "UNDER_FACULTY_REVIEW", "IN_PROGRESS", "RESOLVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-navy-800 dark:text-slate-300"
                }`}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading your submitted queries...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-navy-900 dark:text-white">No queries found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "ALL"
                  ? "Try resetting your search filters to view other tickets."
                  : "You haven't submitted any queries yet. Click the button below to get support."}
              </p>
              <Link href="/student/new-query" className="inline-block mt-4">
                <Button size="sm">Create First Query</Button>
              </Link>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              const priorityBadge = getPriorityBadge(ticket.priority);

              return (
                <Link
                  key={ticket.id}
                  href={`/student/tickets/${ticket.id}`}
                  className="block group"
                >
                  <Card className="hover:border-primary-400 hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800">
                            {ticket.ticket_number}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                            {statusBadge.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityBadge.badgeClass}`}>
                            {priorityBadge.label}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-navy-950 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                          {ticket.subject}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          {(ticket.location_building || ticket.location_room) && (
                            <>
                              <span className="font-semibold text-primary-700 dark:text-primary-400">
                                📍 {ticket.location_building || "Campus"}{ticket.location_room ? ` • ${ticket.location_room}` : ""}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span>Dept: <strong className="text-slate-700 dark:text-slate-300">{ticket.department_name || "General"}</strong></span>
                          <span>•</span>
                          <span>Updated {formatRelativeTime(ticket.updated_at)}</span>
                          {ticket.assigned_worker_name && (
                            <>
                              <span>•</span>
                              <span>Technician: <strong className="text-slate-700 dark:text-slate-300">{ticket.assigned_worker_name}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-semibold text-primary-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          View details
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
