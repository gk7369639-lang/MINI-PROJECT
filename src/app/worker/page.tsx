"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Ticket, TicketStatus, WorkerTaskUpdate, Profile } from "@/types";
import { formatDateTime, formatRelativeTime, isTicketOverdue } from "@/lib/utils";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  PackageCheck,
  RotateCcw,
  Sparkles,
  FileText,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function WorkerPortalPage() {
  const [tasks, setTasks] = useState<Ticket[]>([]);
  const [updates, setUpdates] = useState<WorkerTaskUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "UNRESOLVED">("ALL");
  const [activeUser, setActiveUser] = useState<Profile | null>(null);

  // Modal Action State
  const [selectedTask, setSelectedTask] = useState<Ticket | null>(null);
  const [actionType, setActionType] = useState<"PROGRESS" | "RESOLVE" | "NOT_RESOLVED" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [partsRequired, setPartsRequired] = useState("");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [notResolvedReason, setNotResolvedReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const savedId = localStorage.getItem("sqrp_active_user_id") || "user-worker-1";
      const userRes = await fetch("/api/auth/me", {
        headers: { "x-user-id": savedId },
      });
      const userData = await userRes.json();
      if (userData.success && userData.user) {
        setActiveUser(userData.user);
      }

      const res = await fetch(`/api/worker/tasks?status=ALL`, {
        headers: { "x-user-id": savedId },
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
        setUpdates(data.updates || []);
      }
    } catch {
      // offline / fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !actionType) return;
    setActionError(null);
    setActionLoading(true);

    const savedId = activeUser?.id || localStorage.getItem("sqrp_active_user_id") || "user-worker-1";

    try {
      let body: any = { ticketId: selectedTask.id, userId: savedId };

      if (actionType === "PROGRESS") {
        body.action = "UPDATE_PROGRESS";
        body.note = actionNote;
        body.parts_required = partsRequired || undefined;
      } else if (actionType === "RESOLVE") {
        body.action = "RESOLVE";
        body.resolution_summary = resolutionSummary;
      } else if (actionType === "NOT_RESOLVED") {
        body.action = "NOT_RESOLVED";
        body.reason = notResolvedReason;
      }

      const res = await fetch("/api/worker/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": savedId,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.error || "Operation failed.");
        return;
      }

      // Close modal and refresh
      setSelectedTask(null);
      setActionType(null);
      setActionNote("");
      setPartsRequired("");
      setResolutionSummary("");
      setNotResolvedReason("");
      await fetchTasks();
    } catch (err: any) {
      setActionError(err.message || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectAction = async (ticketId: string, action: "ACCEPT" | "START") => {
    const savedId = activeUser?.id || localStorage.getItem("sqrp_active_user_id") || "user-worker-1";
    try {
      const res = await fetch("/api/worker/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": savedId,
        },
        body: JSON.stringify({
          ticketId,
          action,
          userId: savedId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      }
    } catch {
      // handled
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "ASSIGNED") return t.status === "ASSIGNED_TO_WORKER";
    if (activeTab === "IN_PROGRESS") {
      return (
        t.status === "WORKER_ACCEPTED" ||
        t.status === "IN_PROGRESS" ||
        t.status === "WAITING_FOR_PARTS_OR_RESOURCES"
      );
    }
    if (activeTab === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED";
    if (activeTab === "UNRESOLVED") return t.status === "NOT_RESOLVED" || t.status === "REQUIRES_REASSIGNMENT";
    return true;
  });

  const kpis = {
    total: tasks.length,
    assigned: tasks.filter((t) => t.status === "ASSIGNED_TO_WORKER").length,
    inProgress: tasks.filter(
      (t) =>
        t.status === "WORKER_ACCEPTED" ||
        t.status === "IN_PROGRESS" ||
        t.status === "WAITING_FOR_PARTS_OR_RESOURCES"
    ).length,
    resolved: tasks.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
    overdue: tasks.filter((t) => isTicketOverdue(t.sla_due_at, t.status)).length,
  };

  return (
    <AppShell initialRole="WORKER">
      <div className="space-y-6">
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Wrench className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white">
                Maintenance Worker Portal
              </h1>
              <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary-200 dark:bg-primary-950 dark:text-primary-300">
                Live Field Deck
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assigned technician: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser?.full_name || "Field Engineer"}</span> — Review and execute on-site campus maintenance tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Student Identity Redacted (Confidential)</span>
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-4 border-l-4 border-l-primary-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-black text-navy-950 dark:text-white mt-1">{kpis.total}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Acceptance</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{kpis.assigned}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-sky-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-black text-sky-600 mt-1">{kpis.inProgress}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{kpis.resolved}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-rose-500 col-span-2 lg:col-span-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue SLA</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{kpis.overdue}</p>
          </Card>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-navy-800">
          {[
            { id: "ALL", label: `All Tasks (${kpis.total})` },
            { id: "ASSIGNED", label: `Awaiting Accept (${kpis.assigned})` },
            { id: "IN_PROGRESS", label: `Active (${kpis.inProgress})` },
            { id: "RESOLVED", label: `Resolved (${kpis.resolved})` },
            { id: "UNRESOLVED", label: `Needs Review (${tasks.filter(t => t.status === "NOT_RESOLVED" || t.status === "REQUIRES_REASSIGNMENT").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-navy-900 text-white shadow dark:bg-white dark:text-navy-950"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task Cards List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Loading assigned maintenance tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-navy-700 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-navy-900 dark:text-white">No maintenance tasks in this queue</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are currently caught up with your assigned workload.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => {
              const overdue = isTicketOverdue(task.sla_due_at, task.status);
              const taskUpdates = updates.filter((u) => u.ticket_id === task.id);

              return (
                <Card
                  key={task.id}
                  className={`overflow-hidden transition-all border ${
                    overdue
                      ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20"
                      : "border-slate-200 dark:border-navy-800 hover:shadow-md"
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top row: Badges and Ticket Number */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary-700 dark:text-primary-400">
                          {task.ticket_number}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Confidential Student Query
                        </span>
                        {task.category_name && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            • {task.category_name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {overdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full dark:bg-rose-950 dark:text-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue SLA
                          </span>
                        )}
                        <Badge variant={task.priority as any}>{task.priority}</Badge>
                        <Badge variant={task.status as any}>{task.status.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>

                    {/* Middle: Subject and Location */}
                    <div>
                      <h3 className="text-base font-bold text-navy-950 dark:text-white leading-snug">
                        {task.subject}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-line leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    {/* Facility & Location Callout */}
                    {(task.location_building || task.location_room) && (
                      <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            On-Site Repair Location
                          </p>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                            Building: <span className="font-bold">{task.location_building || "Main Campus"}</span>
                            {task.location_room && (
                              <span className="ml-3">
                                Room / Facility: <span className="font-bold text-primary-700 dark:text-primary-400">{task.location_room}</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Attachment Preview */}
                    {task.image_url && (
                      <div className="p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Attached Problem Photo
                        </p>
                        <a
                          href={task.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full-Resolution Image Attachment</span>
                        </a>
                      </div>
                    )}

                    {/* Faculty Notes if present */}
                    {task.faculty_notes && (
                      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 text-xs">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300">Faculty Review Note: </span>
                        <span className="text-slate-700 dark:text-slate-300">{task.faculty_notes}</span>
                      </div>
                    )}

                    {/* Resolution Summary / Not Resolved reason */}
                    {task.resolution_summary && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Completed Resolution Summary:</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{task.resolution_summary}</p>
                      </div>
                    )}

                    {task.not_resolved_reason && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs">
                        <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span>Issue Marked Unresolved:</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{task.not_resolved_reason}</p>
                      </div>
                    )}

                    {/* Maintenance Timeline Strip */}
                    <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
                      <span>Assigned: <strong className="text-slate-700 dark:text-slate-300">{formatRelativeTime(task.assigned_at || task.created_at)}</strong></span>
                      {task.worker_accepted_at && (
                        <span>Accepted: <strong className="text-slate-700 dark:text-slate-300">{formatRelativeTime(task.worker_accepted_at)}</strong></span>
                      )}
                      {task.work_started_at && (
                        <span>Work Started: <strong className="text-slate-700 dark:text-slate-300">{formatRelativeTime(task.work_started_at)}</strong></span>
                      )}
                      {task.sla_due_at && (
                        <span>Due: <strong className={overdue ? "text-rose-600 font-bold" : "text-slate-700 dark:text-slate-300"}>{formatDateTime(task.sla_due_at)}</strong></span>
                      )}
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      {task.status === "ASSIGNED_TO_WORKER" && (
                        <Button
                          size="sm"
                          onClick={() => handleDirectAction(task.id, "ACCEPT")}
                          className="bg-primary-600 hover:bg-primary-700 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Accept Task
                        </Button>
                      )}

                      {task.status === "WORKER_ACCEPTED" && (
                        <Button
                          size="sm"
                          onClick={() => handleDirectAction(task.id, "START")}
                          className="bg-sky-600 hover:bg-sky-700 text-white"
                        >
                          <Wrench className="w-4 h-4 mr-1.5" />
                          Start Work On-Site
                        </Button>
                      )}

                      {(task.status === "IN_PROGRESS" || task.status === "WAITING_FOR_PARTS_OR_RESOURCES") && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedTask(task);
                              setActionType("PROGRESS");
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                            Log Progress / Request Parts
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedTask(task);
                              setActionType("NOT_RESOLVED");
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1.5" />
                            Cannot Resolve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setActionType("RESOLVE");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Mark as Resolved
                          </Button>
                        </>
                      )}

                      {task.status === "NOT_RESOLVED" && (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          Faculty Review Board alerted for reassignment.
                        </span>
                      )}

                      {task.status === "RESOLVED" && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Work completed & student notified.
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Action Modal */}
        {selectedTask && actionType && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-2xl animate-fade-in">
              <CardHeader className="border-b border-slate-100 dark:border-navy-800">
                <CardTitle className="text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  {actionType === "PROGRESS" && <FileText className="w-5 h-5 text-sky-600" />}
                  {actionType === "RESOLVE" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {actionType === "NOT_RESOLVED" && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                  <span>
                    {actionType === "PROGRESS" && "Update Progress / Request Parts"}
                    {actionType === "RESOLVE" && "Submit Resolution Summary"}
                    {actionType === "NOT_RESOLVED" && "Report Unresolved Maintenance Issue"}
                  </span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Task #{selectedTask.ticket_number} — {selectedTask.subject}
                </p>
              </CardHeader>

              <form onSubmit={handleActionSubmit}>
                <CardContent className="p-6 space-y-4">
                  {actionError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                      {actionError}
                    </div>
                  )}

                  {actionType === "PROGRESS" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Current Work Progress Note *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={actionNote}
                          onChange={(e) => setActionNote(e.target.value)}
                          placeholder="e.g. Inspected circuit breaker board, isolated shorted wiring..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Parts or Equipment Required (Optional)
                        </label>
                        <Input
                          placeholder="e.g. 16A MCB Switch, 2.5mm copper cable roll"
                          value={partsRequired}
                          onChange={(e) => setPartsRequired(e.target.value)}
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                          Entering parts will update the task status to &quot;WAITING FOR PARTS OR RESOURCES&quot;.
                        </p>
                      </div>
                    </>
                  )}

                  {actionType === "RESOLVE" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Detailed Resolution Summary *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        placeholder="Detail the exact steps and parts used to resolve this issue (e.g. Replaced faulty relay in AC unit #2, tested cooling cycle for 30 minutes, normal operation verified)."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        This summary will be securely displayed on the student&apos;s tracking timeline.
                      </p>
                    </div>
                  )}

                  {actionType === "NOT_RESOLVED" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Reason Why Issue Cannot Be Resolved *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={notResolvedReason}
                        onChange={(e) => setNotResolvedReason(e.target.value)}
                        placeholder="Explain why the issue cannot be completed by current technician (e.g. Requires specialized contractor roof work, structural inspection needed, or obsolete component no longer serviceable)."
                        className="w-full text-xs p-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                      />
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                        This immediately notifies the Faculty Review Board for priority escalation and reassignment.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(null);
                        setActionType(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={actionLoading}
                      className={
                        actionType === "RESOLVE"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : actionType === "NOT_RESOLVED"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-primary-600 hover:bg-primary-700 text-white"
                      }
                    >
                      Submit Update
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
