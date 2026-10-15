"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Building2,
  FileSpreadsheet,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Download,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Ticket } from "@/types";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeUserId, setActiveUserId] = useState<string>("user-admin-1");

  useEffect(() => {
    const saved = localStorage.getItem("sqrp_active_user_id");
    const uid = saved || "user-admin-1";
    if (saved) setActiveUserId(uid);

    fetch(`/api/tickets?userId=${uid}`, {
      headers: { "x-user-id": uid },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tickets) {
          setTickets(data.tickets);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) =>
    ["SUBMITTED", "TRIAGED", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_STUDENT", "WAITING_FOR_APPROVAL", "REOPENED", "ESCALATED"].includes(t.status)
  ).length;
  const resolvedTickets = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
  const overdueTickets = tickets.filter((t) => {
    if (!t.sla_due_at || ["RESOLVED", "CLOSED"].includes(t.status)) return false;
    return new Date(t.sla_due_at).getTime() < Date.now();
  }).length;

  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  // Breakdown by department
  const deptCounts: Record<string, number> = {};
  for (const t of tickets) {
    const dept = t.department_code || "GENERAL";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  }

  return (
    <AppShell initialRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950 tracking-tight">
              Institutional Admin Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Global campus support operations, SLA governance, and automated AI audit logs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/admin/reports" target="_blank" download>
              <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                Export CSV Report
              </Button>
            </a>
          </div>
        </div>

        {/* Confidentiality Assurance Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Campus Student Privacy Shield Active</span>
          </div>
          <p className="text-emerald-800 dark:text-emerald-400 text-[11px]">
            Student personal identification details (names, emails, roll numbers) are automatically redacted in all faculty, worker, and admin review tables.
          </p>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Queries</p>
                <p className="text-2xl font-black text-navy-950 mt-1">{totalTickets}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Backlog</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{openTickets}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolution Rate</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{resolutionRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Rating</p>
                <p className="text-2xl font-black text-purple-600 mt-1 flex items-center gap-1">
                  <span>5.0</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Query Distribution Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                <span>Departmental Query Load</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(deptCounts).map(([dept, count]) => {
                  const percent = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-navy-950">{dept}</span>
                        <span className="text-slate-500">{count} queries ({percent}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Management Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-600" />
                <span>Administrative Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin/qr-codes"
                  className="p-4 rounded-xl border border-primary-300 bg-primary-50/50 hover:bg-primary-100/60 transition-all text-left"
                >
                  <div className="w-5 h-5 rounded bg-primary-600 text-white flex items-center justify-center text-[10px] font-black mb-2">
                    QR
                  </div>
                  <h4 className="font-bold text-xs text-navy-950">Campus QR Placards</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Generate printable room placards</p>
                </Link>

                <Link
                  href="/admin/users"
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/40 transition-all text-left"
                >
                  <Users className="w-5 h-5 text-primary-600 mb-2" />
                  <h4 className="font-bold text-xs text-navy-950">User Directory</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage roles &amp; deactivations</p>
                </Link>

                <Link
                  href="/admin/departments"
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/40 transition-all text-left"
                >
                  <Building2 className="w-5 h-5 text-indigo-600 mb-2" />
                  <h4 className="font-bold text-xs text-navy-950">Departments &amp; SLAs</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Configure approval policies</p>
                </Link>

                <Link
                  href="/admin/audit-logs"
                  className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/40 transition-all text-left"
                >
                  <History className="w-5 h-5 text-purple-600 mb-2" />
                  <h4 className="font-bold text-xs text-navy-950">Security Audit Logs</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Trace immutable operations</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
