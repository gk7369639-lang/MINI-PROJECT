"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Ticket, TicketStatus } from "@/types";
import { getStatusBadge, getPriorityBadge, formatDate, formatRelativeTime } from "@/lib/utils";

export default function StaffPortalPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assigned" | "department" | "overdue" | "all">("assigned");
  const [searchQuery, setSearchQuery] = useState("");

  const activeUserId = "user-staff-1"; // Dr. Ramesh Kumar (Academic Affairs)

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets?userId=${activeUserId}`, {
        headers: { "x-user-id": activeUserId },
      });
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const myAssignedTickets = tickets.filter((t) => t.assigned_to === activeUserId);
  const unassignedDeptTickets = tickets.filter((t) => !t.assigned_to && t.status === "SUBMITTED");
  const overdueTickets = tickets.filter((t) => {
    if (!t.sla_due_at || ["RESOLVED", "CLOSED"].includes(t.status)) return false;
    return new Date(t.sla_due_at).getTime() < Date.now();
  });

  const getDisplayedTickets = () => {
    let list = tickets;
    if (activeTab === "assigned") list = myAssignedTickets;
    else if (activeTab === "department") list = unassignedDeptTickets;
    else if (activeTab === "overdue") list = overdueTickets;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticket_number.toLowerCase().includes(q) ||
          t.student_name.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const displayedList = getDisplayedTickets();

  return (
    <AppShell initialRole="STAFF">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950 dark:text-white tracking-tight">
              Faculty Workdesk
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Process assigned student queries, manage departmental queues, and trigger Head approvals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg border border-indigo-200">
              Department: Academic Affairs & Registry
            </span>
          </div>
        </div>

        {/* Staff Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Active Load</p>
                <p className="text-2xl font-black text-navy-950 mt-1">
                  {myAssignedTickets.filter((t) => !["RESOLVED", "CLOSED"].includes(t.status)).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Intake Backlog</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{unassignedDeptTickets.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Inbox className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA Overdue</p>
                <p className="text-2xl font-black text-rose-600 mt-1">{overdueTickets.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Head</p>
                <p className="text-2xl font-black text-purple-600 mt-1">
                  {tickets.filter((t) => t.status === "WAITING_FOR_APPROVAL").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Selection & Search */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("assigned")}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === "assigned"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Assigned to Me ({myAssignedTickets.length})
            </button>
            <button
              onClick={() => setActiveTab("department")}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === "department"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Intake Queue ({unassignedDeptTickets.length})
            </button>
            <button
              onClick={() => setActiveTab("overdue")}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === "overdue"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Overdue ({overdueTickets.length})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Dept ({tickets.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, ticket #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Ticket Feed */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading workdesk tickets...
            </div>
          ) : displayedList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-navy-900">Queue is clear</h3>
              <p className="text-xs text-slate-500 mt-1">
                No tickets matching the current tab criteria.
              </p>
            </div>
          ) : (
            displayedList.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              const priorityBadge = getPriorityBadge(ticket.priority);

              return (
                <Link
                  key={ticket.id}
                  href={`/staff/tickets/${ticket.id}`}
                  className="block group"
                >
                  <Card className="hover:border-primary-400 hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
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

                        <h3 className="font-bold text-sm sm:text-base text-navy-950 group-hover:text-primary-600 transition-colors truncate">
                          {ticket.subject}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>Student: <strong className="text-slate-800">{ticket.student_name}</strong> ({ticket.student_reg_no || "N/A"})</span>
                          <span>•</span>
                          <span>Category: <strong className="text-slate-700">{ticket.category_name || "General"}</strong></span>
                          <span>•</span>
                          <span>SLA Due: <strong className="text-slate-700">{formatDate(ticket.sla_due_at)}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-semibold text-primary-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Process Ticket
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
