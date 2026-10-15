"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  MessageSquare,
  Lock,
  Sparkles,
  ShieldAlert,
  UserCheck,
  Check,
  RotateCcw,
  FileText,
  Lightbulb,
  Loader2,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Ticket, TicketStatus } from "@/types";
import { getStatusBadge, getPriorityBadge, formatDate, formatRelativeTime } from "@/lib/utils";

export default function StaffTicketProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  // Public Reply State
  const [publicReply, setPublicReply] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Internal Note State
  const [internalNote, setInternalNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<TicketStatus>("IN_PROGRESS");
  const [statusReason, setStatusReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Approval Request Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [actionType, setActionType] = useState("ATTENDANCE_CONDONATION");
  const [approvalReason, setApprovalReason] = useState("");
  const [isRequestingApproval, setIsRequestingApproval] = useState(false);

  // AI Copilot State
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [copilotData, setCopilotData] = useState<{
    summary: string;
    suggestedReply: string;
    suggestedInternalNote: string;
    recommendedResolutionSteps: string[];
  } | null>(null);

  const activeUserId = "user-staff-1"; // Dr. Ramesh Kumar

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}`, {
        headers: { "x-user-id": activeUserId },
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicket(data.ticket);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSendPublicReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicReply.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          content: publicReply,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublicReply("");
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          content: internalNote,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInternalNote("");
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleOpenStatusModal = (status: TicketStatus) => {
    setTargetStatus(status);
    setStatusReason("");
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          status: targetStatus,
          reason: statusReason || `Status updated to ${targetStatus}`,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsStatusModalOpen(false);
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalReason.trim()) return;

    setIsRequestingApproval(true);
    try {
      const res = await fetch("/api/approvals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          ticketId,
          departmentId: ticket?.department_id,
          actionType,
          reason: approvalReason,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsApprovalModalOpen(false);
        setApprovalReason("");
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRequestingApproval(false);
    }
  };

  const handleTriggerCopilot = async () => {
    setIsCopilotLoading(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          action: "staff-copilot",
          ticketId,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success && data.copilotDraft) {
        setCopilotData(data.copilotDraft);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell initialRole="STAFF">
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading ticket workspace...
        </div>
      </AppShell>
    );
  }

  if (!ticket) {
    return (
      <AppShell initialRole="STAFF">
        <div className="max-w-md mx-auto py-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-navy-950">Ticket Not Found</h2>
          <Link href="/staff">
            <Button size="sm">Return to Workdesk</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const statusBadge = getStatusBadge(ticket.status);
  const priorityBadge = getPriorityBadge(ticket.priority);

  return (
    <AppShell initialRole="STAFF">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workdesk</span>
          </Link>

          {/* Header Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                  {ticket.ticket_number}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                  {statusBadge.label}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${priorityBadge.badgeClass}`}>
                  {priorityBadge.label}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
                {ticket.subject}
              </h1>
            </div>

            {/* Workflow Transition Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTriggerCopilot}
                isLoading={isCopilotLoading}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-primary-600" />}
              >
                AI Staff Copilot
              </Button>

              {ticket.status !== "IN_PROGRESS" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenStatusModal("IN_PROGRESS")}
                >
                  Mark In Progress
                </Button>
              )}

              {ticket.status !== "WAITING_FOR_STUDENT" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenStatusModal("WAITING_FOR_STUDENT")}
                >
                  Request Info from Student
                </Button>
              )}

              {ticket.status !== "WAITING_FOR_APPROVAL" && ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-purple-600" />}
                  onClick={() => setIsApprovalModalOpen(true)}
                >
                  Request Head Approval
                </Button>
              )}

              {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenStatusModal("RESOLVED")}
                >
                  Resolve Ticket
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* AI Copilot Panel (when generated) */}
        {copilotData && (
          <Card className="border-primary-200 bg-primary-50/30 animate-fade-in shadow-sm">
            <CardHeader className="pb-3 border-b border-primary-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-primary-800 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span>Faculty Copilot Insights</span>
              </div>
              <span className="text-[10px] text-primary-600 font-semibold bg-primary-100 px-2 py-0.5 rounded">
                Server-Side LLM Draft
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Executive Thread Summary:
                </p>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-primary-200/60">
                  {copilotData.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Suggested Public Reply:
                    </span>
                    <button
                      onClick={() => setPublicReply(copilotData.suggestedReply)}
                      className="text-[11px] font-bold text-primary-600 hover:underline"
                    >
                      Apply to Public Box
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-primary-200/60 leading-relaxed whitespace-pre-line">
                    {copilotData.suggestedReply}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Suggested Internal Verification Note:
                    </span>
                    <button
                      onClick={() => setInternalNote(copilotData.suggestedInternalNote)}
                      className="text-[11px] font-bold text-primary-600 hover:underline"
                    >
                      Apply to Notes Box
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-primary-200/60 leading-relaxed whitespace-pre-line">
                    {copilotData.suggestedInternalNote}
                  </div>
                </div>
              </div>

              {copilotData.recommendedResolutionSteps.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Actionable Verification Protocol:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {copilotData.recommendedResolutionSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Student & Metadata Context Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Student Name</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.student_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Student Reg No</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.student_reg_no || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Category</span>
            <span className="font-bold text-slate-800 mt-0.5 block">{ticket.category_name || "General"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">SLA Target Deadline</span>
            <span className="font-medium text-slate-700 mt-0.5 block">{formatDate(ticket.sla_due_at)}</span>
          </div>
        </div>

        {/* Original Issue Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">Student Issue Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {ticket.description}
            </p>
          </CardContent>
        </Card>

        {/* Split Workdesk: Public Reply & Quarantined Internal Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Public Reply Column */}
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-navy-950 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-600" />
              <span>Public Conversation with Student</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {ticket.messages?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                  No public conversation yet.
                </div>
              ) : (
                ticket.messages?.map((msg) => {
                  const isStudent = msg.sender_role === "STUDENT";
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1 ${
                        isStudent
                          ? "bg-slate-50 border border-slate-200 mr-4"
                          : "bg-primary-50/70 border border-primary-200 ml-4"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{msg.sender_name}</span>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendPublicReply} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Write official response to student..."
                value={publicReply}
                onChange={(e) => setPublicReply(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSendingReply}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Send Public Reply
                </Button>
              </div>
            </form>
          </div>

          {/* Quarantined Internal Notes Column */}
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Quarantined Internal Notes (Faculty Only)</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {ticket.internal_notes?.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-amber-50/30 rounded-xl border border-amber-200/60">
                  No internal notes logged yet. Use this section for confidential verification details.
                </div>
              ) : (
                ticket.internal_notes?.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl text-xs space-y-1 bg-amber-50/50 border border-amber-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span className="font-bold text-amber-950">{note.author_name}</span>
                      </div>
                      <span className="text-[10px] text-amber-700/60">
                        {formatRelativeTime(note.created_at)}
                      </span>
                    </div>
                    <p className="text-amber-950 whitespace-pre-line leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddInternalNote} className="space-y-2">
              <textarea
                rows={3}
                placeholder="Log internal investigation steps (hidden from student)..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-amber-50/20 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="navy"
                  isLoading={isAddingNote}
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Save Internal Note
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* State Machine Status Transition Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Transition Ticket to ${targetStatus}`}
          description="Document the explicit audit reason for this status change."
        >
          <form onSubmit={handleConfirmStatusChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                {targetStatus === "RESOLVED" ? "Resolution Summary (Required)" : "Reason for Status Change"}
              </label>
              <textarea
                rows={4}
                required
                placeholder={
                  targetStatus === "RESOLVED"
                    ? "Provide full resolution details for the student and academic records..."
                    : "Explain why the status is being updated..."
                }
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" isLoading={isUpdatingStatus}>
                Confirm Status Transition
              </Button>
            </div>
          </form>
        </Modal>

        {/* Request Head Approval Modal */}
        <Modal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          title="Submit Request for Department Head Approval"
          description="Special administrative condonations and waivers require formal Head vetting."
        >
          <form onSubmit={handleRequestApproval} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Approval Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ATTENDANCE_CONDONATION">Medical Attendance Condonation (Below 75%)</option>
                <option value="FEE_INSTALLMENT_PERMISSION">Tuition Fee Installment Concession</option>
                <option value="EXAM_REVALUATION_OVERRIDE">Exam Answer Script Re-checking Override</option>
                <option value="COURSE_DROP_WITHDRAWAL">Late Course Drop / Credit Adjustment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Justification &amp; Regulation Reference
              </label>
              <textarea
                rows={4}
                required
                placeholder="State verified facts and academic council regulation reference..."
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsApprovalModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="navy" type="submit" isLoading={isRequestingApproval}>
                Dispatch to Department Head
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
