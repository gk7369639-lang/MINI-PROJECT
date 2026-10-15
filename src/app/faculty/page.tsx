"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Ticket, Profile, Department, Category } from "@/types";
import { formatDateTime, formatRelativeTime, isTicketOverdue } from "@/lib/utils";
import {
  Inbox,
  UserCheck,
  Clock,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Send,
  MessageSquare,
  HelpCircle,
  FileCheck,
  UserCog,
} from "lucide-react";

export default function FacultyPortalPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "SUBMITTED" | "UNDER_REVIEW" | "ASSIGNED" | "UNRESOLVED" | "RESOLVED">("ALL");
  const [activeUser, setActiveUser] = useState<Profile | null>(null);

  // Review Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [modalMode, setModalMode] = useState<"ASSIGN" | "CLARIFY" | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [facultyNote, setFacultyNote] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const savedId = localStorage.getItem("sqrp_active_user_id") || "user-faculty-1";
      const userRes = await fetch("/api/auth/me", {
        headers: { "x-user-id": savedId },
      });
      const userData = await userRes.json();
      if (userData.success && userData.user) {
        setActiveUser(userData.user);
      }

      const res = await fetch("/api/faculty/review", {
        headers: { "x-user-id": savedId },
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        setWorkers(data.workers || []);
        setCategories(data.categories || []);
        setDepartments(data.departments || []);
      }
    } catch {
      // offline / fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStartReview = async (ticketId: string) => {
    const savedId = activeUser?.id || localStorage.getItem("sqrp_active_user_id") || "user-faculty-1";
    try {
      const res = await fetch("/api/faculty/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": savedId,
        },
        body: JSON.stringify({
          ticketId,
          action: "START_REVIEW",
          userId: savedId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch {
      // handled
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !modalMode) return;
    setModalError(null);
    setSubmitting(true);

    const savedId = activeUser?.id || localStorage.getItem("sqrp_active_user_id") || "user-faculty-1";

    try {
      let body: any = { ticketId: selectedTicket.id, userId: savedId };

      if (modalMode === "ASSIGN") {
        if (!selectedWorkerId) {
          setModalError("Please select an active maintenance technician to assign.");
          setSubmitting(false);
          return;
        }
        body.action = "ASSIGN_WORKER";
        body.worker_id = selectedWorkerId;
        body.department_id = selectedDeptId || selectedTicket.department_id || undefined;
        body.category_id = selectedCatId || selectedTicket.category_id || undefined;
        body.priority = selectedPriority;
        body.deadline_hours = Number(deadlineHours) || 24;
        body.faculty_note = facultyNote || undefined;
        body.student_message = studentMessage || undefined;
      } else if (modalMode === "CLARIFY") {
        if (!studentMessage || studentMessage.trim().length < 5) {
          setModalError("Please enter a question or clarification request for the student.");
          setSubmitting(false);
          return;
        }
        body.action = "REQUEST_CLARIFICATION";
        body.student_message = studentMessage;
      }

      const res = await fetch("/api/faculty/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": savedId,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalError(data.error || "Operation failed.");
        return;
      }

      setSelectedTicket(null);
      setModalMode(null);
      setSelectedWorkerId("");
      setFacultyNote("");
      setStudentMessage("");
      await fetchData();
    } catch (err: any) {
      setModalError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const openAssignModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalMode("ASSIGN");
    setSelectedDeptId(ticket.department_id || "");
    setSelectedCatId(ticket.category_id || "");
    setSelectedPriority(ticket.priority || "MEDIUM");
    setFacultyNote(ticket.faculty_notes || "");
    setStudentMessage("");
    setModalError(null);
  };

  const openClarifyModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalMode("CLARIFY");
    setStudentMessage("");
    setModalError(null);
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "SUBMITTED") return t.status === "SUBMITTED";
    if (activeTab === "UNDER_REVIEW") return t.status === "UNDER_FACULTY_REVIEW";
    if (activeTab === "ASSIGNED") {
      return (
        t.status === "ASSIGNED_TO_WORKER" ||
        t.status === "WORKER_ACCEPTED" ||
        t.status === "IN_PROGRESS" ||
        t.status === "WAITING_FOR_PARTS_OR_RESOURCES"
      );
    }
    if (activeTab === "UNRESOLVED") {
      return t.status === "NOT_RESOLVED" || t.status === "REQUIRES_REASSIGNMENT";
    }
    if (activeTab === "RESOLVED") return t.status === "RESOLVED" || t.status === "CLOSED";
    return true;
  });

  const kpis = {
    total: tickets.length,
    newQueries: tickets.filter((t) => t.status === "SUBMITTED").length,
    underReview: tickets.filter((t) => t.status === "UNDER_FACULTY_REVIEW").length,
    withWorkers: tickets.filter(
      (t) =>
        t.status === "ASSIGNED_TO_WORKER" ||
        t.status === "WORKER_ACCEPTED" ||
        t.status === "IN_PROGRESS" ||
        t.status === "WAITING_FOR_PARTS_OR_RESOURCES"
    ).length,
    needsReassignment: tickets.filter(
      (t) => t.status === "NOT_RESOLVED" || t.status === "REQUIRES_REASSIGNMENT"
    ).length,
  };

  return (
    <AppShell initialRole="FACULTY">
      <div className="space-y-6">
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400">
                <Inbox className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white">
                Faculty Triage & Worker Assignment Desk
              </h1>
              <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary-200 dark:bg-primary-950 dark:text-primary-300">
                Review Board
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluator: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeUser?.full_name || "Faculty In-Charge"}</span> — Inspect student submissions, set task priorities, and allocate field workers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Student Personal Identity Redacted (Confidential)</span>
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-4 border-l-4 border-l-primary-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">All Queries</p>
            <p className="text-2xl font-black text-navy-950 dark:text-white mt-1">{kpis.total}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{kpis.newQueries}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-sky-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</p>
            <p className="text-2xl font-black text-sky-600 mt-1">{kpis.underReview}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-indigo-500">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active with Workers</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{kpis.withWorkers}</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-rose-500 col-span-2 lg:col-span-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Needs Reassignment</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{kpis.needsReassignment}</p>
          </Card>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-navy-800">
          {[
            { id: "ALL", label: `All Queries (${kpis.total})` },
            { id: "SUBMITTED", label: `New Submissions (${kpis.newQueries})` },
            { id: "UNDER_REVIEW", label: `In Review (${kpis.underReview})` },
            { id: "ASSIGNED", label: `Assigned (${kpis.withWorkers})` },
            { id: "UNRESOLVED", label: `Needs Reassignment (${kpis.needsReassignment})` },
            { id: "RESOLVED", label: "Completed" },
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

        {/* Tickets Feed */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-semibold animate-pulse">
            Loading student query queue...
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-navy-700 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-navy-900 dark:text-white">No queries in this queue</h3>
            <p className="text-xs text-slate-500 mt-1">
              All queries in this category have been processed.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => {
              const overdue = isTicketOverdue(ticket.sla_due_at, ticket.status);

              return (
                <Card
                  key={ticket.id}
                  className={`overflow-hidden transition-all border ${
                    ticket.status === "NOT_RESOLVED"
                      ? "border-rose-400 dark:border-rose-900 bg-rose-50/20"
                      : ticket.status === "SUBMITTED"
                      ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/20"
                      : "border-slate-200 dark:border-navy-800 hover:shadow-md"
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Meta and Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-primary-700 dark:text-primary-400">
                          {ticket.ticket_number}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Confidential Student Query
                        </span>
                        {ticket.category_name && (
                          <span className="text-[11px] font-semibold text-slate-500">
                            • {ticket.category_name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {overdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full dark:bg-rose-950 dark:text-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                        <Badge variant={ticket.priority as any}>{ticket.priority}</Badge>
                        <Badge variant={ticket.status as any}>{ticket.status.replace(/_/g, " ")}</Badge>
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-navy-950 dark:text-white leading-snug">
                        {ticket.subject}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 whitespace-pre-line leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Location Badge */}
                    {(ticket.location_building || ticket.location_room) && (
                      <div className="p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-950/60 rounded-lg text-primary-700 dark:text-primary-300 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Campus Facility Location
                          </p>
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                            Building: <span className="font-bold">{ticket.location_building || "Main Campus"}</span>
                            {ticket.location_room && (
                              <span className="ml-3">
                                Room / Facility: <span className="font-bold text-primary-600">{ticket.location_room}</span>
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Attachment Preview */}
                    {ticket.image_url && (
                      <div className="p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Attached Problem Photo
                        </p>
                        <a
                          href={ticket.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold text-primary-600 hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full-Resolution Image Attachment</span>
                        </a>
                      </div>
                    )}

                    {/* Assigned Worker Info if assigned */}
                    {ticket.assigned_worker_name && (
                      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-indigo-900 dark:text-indigo-300">Assigned Technician: </span>
                          <span className="text-slate-700 dark:text-slate-200 font-semibold">{ticket.assigned_worker_name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Assigned: {formatRelativeTime(ticket.assigned_at || ticket.updated_at)}
                        </span>
                      </div>
                    )}

                    {/* Worker Not Resolved Reason Callout */}
                    {ticket.not_resolved_reason && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs">
                        <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Worker Reported Unresolved (Action Required):</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{ticket.not_resolved_reason}</p>
                      </div>
                    )}

                    {/* Timeline Strip */}
                    <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-slate-500">
                      <span>Submitted: <strong className="text-slate-700 dark:text-slate-300">{formatRelativeTime(ticket.submitted_at || ticket.created_at)}</strong></span>
                      {ticket.faculty_review_started_at && (
                        <span>Review Opened: <strong className="text-slate-700 dark:text-slate-300">{formatRelativeTime(ticket.faculty_review_started_at)}</strong></span>
                      )}
                      {ticket.sla_due_at && (
                        <span>SLA Deadline: <strong className={overdue ? "text-rose-600 font-bold" : "text-slate-700 dark:text-slate-300"}>{formatDateTime(ticket.sla_due_at)}</strong></span>
                      )}
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      {ticket.status === "SUBMITTED" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartReview(ticket.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Inbox className="w-4 h-4 mr-1.5" />
                          Open for Review
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openClarifyModal(ticket)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1.5 text-slate-500" />
                        Request Student Clarification
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => openAssignModal(ticket)}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                      >
                        <UserCog className="w-4 h-4 mr-1.5" />
                        {ticket.status === "NOT_RESOLVED" || ticket.status === "REQUIRES_REASSIGNMENT"
                          ? "Reassign Worker"
                          : ticket.assigned_worker_id
                          ? "Reallocate Worker"
                          : "Assign Maintenance Worker"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal for Worker Assignment or Clarification */}
        {selectedTicket && modalMode && (
          <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-slate-100 dark:border-navy-800">
                <CardTitle className="text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  {modalMode === "ASSIGN" ? (
                    <>
                      <UserCog className="w-5 h-5 text-primary-600" />
                      <span>Assign Maintenance Worker & Set Deadline</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5 text-sky-600" />
                      <span>Request Student Clarification</span>
                    </>
                  )}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Query #{selectedTicket.ticket_number} — {selectedTicket.subject}
                </p>
              </CardHeader>

              <form onSubmit={handleModalSubmit}>
                <CardContent className="p-6 space-y-4">
                  {modalError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                      {modalError}
                    </div>
                  )}

                  {modalMode === "ASSIGN" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Select Maintenance Worker / Field Technician *
                        </label>
                        <select
                          required
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">-- Choose active technician --</option>
                          {workers.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.full_name} ({w.department_name || "Campus Maintenance"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Operational Priority
                          </label>
                          <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value as any)}
                            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent (Immediate On-Site)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            SLA Deadline (Hours)
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={720}
                            value={deadlineHours}
                            onChange={(e) => setDeadlineHours(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Faculty Internal Notes (Confidential to Staff/Worker)
                        </label>
                        <textarea
                          rows={3}
                          value={facultyNote}
                          onChange={(e) => setFacultyNote(e.target.value)}
                          placeholder="Instructions for technician, safety protocols, required tools or access keys..."
                          className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Student Status Update Message (Visible on Student Timeline)
                        </label>
                        <Input
                          placeholder="e.g. Your query has been assigned to an electrician. Technician dispatch scheduled within 2 hours."
                          value={studentMessage}
                          onChange={(e) => setStudentMessage(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {modalMode === "CLARIFY" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Question or Missing Information for Student *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={studentMessage}
                        onChange={(e) => setStudentMessage(e.target.value)}
                        placeholder="Please clarify the exact bench number, lab machine ID, or provide additional symptoms..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        This update will be sent directly to the student&apos;s timeline and email notifications.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(null);
                        setModalMode(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={submitting}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      {modalMode === "ASSIGN" ? "Confirm Worker Assignment" : "Send Request to Student"}
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
