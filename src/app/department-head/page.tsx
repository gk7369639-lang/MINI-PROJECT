"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Ticket, ApprovalRequest } from "@/types";

export default function DepartmentHeadDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeUserId, setActiveUserId] = useState<string>("user-head-1");

  const fetchData = async (uid: string) => {
    try {
      setLoading(true);
      const [ticketsRes, approvalsRes] = await Promise.all([
        fetch(`/api/tickets?userId=${uid}`, { headers: { "x-user-id": uid } }),
        fetch(`/api/approvals?userId=${uid}`, { headers: { "x-user-id": uid } }),
      ]);

      const ticketsData = await ticketsRes.json();
      const approvalsData = await approvalsRes.json();

      if (ticketsData.success && ticketsData.tickets) {
        setTickets(ticketsData.tickets);
      }
      if (approvalsData.success && approvalsData.approvals) {
        setPendingApprovals(approvalsData.approvals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("sqrp_active_user_id");
    const uid = saved || "user-head-1";
    if (saved) setActiveUserId(saved);
    fetchData(uid);
  }, []);

  const staffWorkload = React.useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    tickets.forEach((t) => {
      if (t.assigned_staff_name && !["RESOLVED", "CLOSED"].includes(t.status)) {
        const current = map.get(t.assigned_staff_name) || { name: t.assigned_staff_name, count: 0 };
        current.count += 1;
        map.set(t.assigned_staff_name, current);
      }
    });
    return Array.from(map.values());
  }, [tickets]);

  const totalDeptTickets = tickets.length;
  const inProgressTickets = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status)).length;
  const overdueTickets = tickets.filter((t) => {
    if (!t.sla_due_at || ["RESOLVED", "CLOSED"].includes(t.status)) return false;
    return new Date(t.sla_due_at).getTime() < Date.now();
  }).length;

  return (
    <AppShell initialRole="DEPARTMENT_HEAD">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-navy-950 tracking-tight">
              Department Head Administration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Academic Affairs &amp; Registry — SLA Adherence, Administrative Approvals &amp; Workload
            </p>
          </div>
          <Link href="/department-head/approvals">
            <Button
              size="md"
              variant="navy"
              leftIcon={<ShieldAlert className="w-4 h-4 text-purple-400" />}
            >
              Review Pending Approvals ({pendingApprovals.length})
            </Button>
          </Link>
        </div>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{pendingApprovals.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Department</p>
                <p className="text-2xl font-black text-navy-950 mt-1">{totalDeptTickets}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue SLA</p>
                <p className="text-2xl font-black text-rose-600 mt-1">{overdueTickets}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolution Rate</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {totalDeptTickets > 0 ? Math.round((resolvedTickets / totalDeptTickets) * 100) : 0}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Urgent Callout */}
        {pendingApprovals.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900 to-navy-950 text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {pendingApprovals.length} Administrative Approval Requests Pending
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Action required for special attendance condonations and fee permissions.
                </p>
              </div>
            </div>
            <Link href="/department-head/approvals">
              <Button size="sm" className="bg-white text-navy-950 hover:bg-slate-100">
                Review Cases
              </Button>
            </Link>
          </div>
        )}

        {/* Staff Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              <span>Department Faculty Workload Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffWorkload.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No active queries currently assigned to department staff.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Faculty load will display here automatically as queries are routed and assigned.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {staffWorkload.map((staff) => (
                  <div key={staff.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{staff.name}</h4>
                      <p className="text-[11px] text-slate-500">Department Operational Handler</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-primary-600">
                        {staff.count} Active Case{staff.count !== 1 ? "s" : ""}
                      </span>
                      <p className="text-[10px] text-emerald-600 font-semibold">Active Workload</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
