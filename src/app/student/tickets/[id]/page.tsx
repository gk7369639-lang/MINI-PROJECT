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
  ShieldCheck,
  Star,
  RotateCcw,
  UserCheck,
  Check,
  Building2,
  Calendar,
  Copy,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Ticket } from "@/types";
import { getStatusBadge, getPriorityBadge, formatDate, formatRelativeTime } from "@/lib/utils";

export default function StudentTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reopen Modal
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isReopening, setIsReopening] = useState(false);

  // Feedback Modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const [activeUserId, setActiveUserId] = useState("user-student-1");

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setErrorCode(null);
      setErrorMessage(null);
      const savedId = localStorage.getItem("sqrp_active_user_id") || "user-student-1";
      setActiveUserId(savedId);

      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const token = urlParams?.get("token") || "";
      const queryParam = token ? `?token=${encodeURIComponent(token)}` : "";

      const res = await fetch(`/api/tickets/${ticketId}${queryParam}`, {
        headers: { "x-user-id": savedId },
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicket(data.ticket);
      } else {
        setTicket(null);
        setErrorCode(data.code || (res.status === 404 ? "NOT_FOUND" : res.status === 403 ? "FORBIDDEN" : "ERROR"));
        setErrorMessage(data.error || "Unable to retrieve ticket details.");
      }
    } catch (err: any) {
      console.error(err);
      setTicket(null);
      setErrorCode("ERROR");
      setErrorMessage(err.message || "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNumber = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.ticket_number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyTrackingLink = () => {
    if (!ticket) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const tokenPart = ticket.tracking_token ? `&token=${ticket.tracking_token}` : "";
    const link = `${origin}/track?number=${encodeURIComponent(ticket.ticket_number)}${tokenPart}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          content: replyContent,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyContent("");
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmResolution = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          status: "CLOSED",
          reason: "Resolution confirmed by student.",
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTicket();
        setIsFeedbackOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setIsReopening(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          status: "REOPENED",
          reason: reopenReason,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsReopenOpen(false);
        setReopenReason("");
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReopening(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          rating,
          comment: feedbackComment,
          userId: activeUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setIsFeedbackOpen(false);
          fetchTicket();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <AppShell initialRole="STUDENT">
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading ticket details...
        </div>
      </AppShell>
    );
  }

  if (!ticket) {
    if (errorCode === "FORBIDDEN") {
      return (
        <AppShell initialRole="STUDENT">
          <div className="max-w-md mx-auto py-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-navy-950">Confidential Ticket Access</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This query was submitted under another student account. SQRP strictly safeguards student confidentiality—full message records are reserved for the original submitter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link href={`/track?number=${encodeURIComponent(ticketId)}`}>
                <Button size="sm" variant="primary">
                  View Public Timeline
                </Button>
              </Link>
              <Link href="/student">
                <Button size="sm" variant="outline">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </AppShell>
      );
    }

    return (
      <AppShell initialRole="STUDENT">
        <div className="max-w-md mx-auto py-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-navy-950">Ticket Not Found</h2>
          <p className="text-xs text-slate-500">
            {errorMessage || `This query record "${ticketId}" could not be found or does not exist.`}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link href={`/track?number=${encodeURIComponent(ticketId)}`}>
              <Button size="sm" variant="outline">
                Search Public Tracker
              </Button>
            </Link>
            <Link href="/student/new-query">
              <Button size="sm" variant="primary">
                Submit New Query
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const statusBadge = getStatusBadge(ticket.status);
  const priorityBadge = getPriorityBadge(ticket.priority);

  return (
    <AppShell initialRole="STUDENT">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Tickets</span>
          </Link>

          {/* Ticket Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                  {ticket.ticket_number}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  title="Copy Ticket Number"
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-navy-950 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 transition"
                >
                  {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber ? "Copied" : "Copy #"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyTrackingLink}
                  title="Copy Tracking Link"
                  className="inline-flex items-center gap-1 text-xs text-primary-700 hover:text-primary-900 px-2 py-0.5 rounded border border-primary-200 bg-primary-50 transition"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <ExternalLink className="w-3 h-3" />}
                  <span>{copiedLink ? "Link Copied" : "Share Tracking"}</span>
                </button>
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
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                {ticket.subject}
              </h1>
            </div>

            {/* Quick Actions (Confirm / Reopen) */}
            <div className="flex items-center gap-2">
              {ticket.status === "RESOLVED" && (
                <>
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Check className="w-4 h-4" />}
                    onClick={handleConfirmResolution}
                  >
                    Confirm Resolution
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    onClick={() => setIsReopenOpen(true)}
                  >
                    Reopen Query
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Confidential Protection Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Confidential Student Query Protected</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Identity shielded from faculty and workers
          </span>
        </div>

        {/* Resolution Banner if Resolved or Closed */}
        {ticket.resolution_summary && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Maintenance Resolution Summary</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-950 pl-6">
              {ticket.resolution_summary}
            </p>
          </div>
        )}

        {/* Location & Facility Card */}
        {(ticket.location_building || ticket.location_room) && (
          <div className="p-4 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 flex items-center gap-3">
            <div className="p-2.5 bg-primary-100 dark:bg-primary-950 text-primary-700 rounded-lg shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Designated Physical Location
              </p>
              <p className="text-xs font-bold text-navy-950 dark:text-white mt-0.5">
                {ticket.location_building || "Main Campus"}
                {ticket.location_room && <span className="text-primary-600 ml-2">• {ticket.location_room}</span>}
              </p>
            </div>
          </div>
        )}

        {/* Image Attachment Preview */}
        {ticket.image_url && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Attached Problem Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={ticket.image_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <img
                  src={ticket.image_url}
                  alt="Issue Attachment"
                  className="max-h-60 rounded-xl border border-slate-200 object-cover shadow-sm hover:opacity-95"
                />
              </a>
            </CardContent>
          </Card>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Department</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{ticket.department_name || "General"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Assigned Technician</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{ticket.assigned_worker_name || ticket.assigned_staff_name || "Triage Queue"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Submitted Date</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">{formatDate(ticket.submitted_at || ticket.created_at)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">SLA Expected Resolution</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 block">{formatDate(ticket.sla_due_at)}</span>
          </div>
        </div>

        {/* Maintenance Milestones Strip */}
        <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Maintenance Milestones
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-50 dark:bg-navy-950">
              <span className="text-slate-400 block text-[10px]">Faculty Review</span>
              <strong className="text-slate-700 dark:text-slate-300">{ticket.faculty_review_started_at ? formatRelativeTime(ticket.faculty_review_started_at) : "Pending"}</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-navy-950">
              <span className="text-slate-400 block text-[10px]">Technician Assigned</span>
              <strong className="text-slate-700 dark:text-slate-300">{ticket.assigned_at ? formatRelativeTime(ticket.assigned_at) : "Pending"}</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-navy-950">
              <span className="text-slate-400 block text-[10px]">Work Started</span>
              <strong className="text-slate-700 dark:text-slate-300">{ticket.work_started_at ? formatRelativeTime(ticket.work_started_at) : "Pending"}</strong>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-navy-950">
              <span className="text-slate-400 block text-[10px]">Final Resolution</span>
              <strong className="text-slate-700 dark:text-slate-300">{ticket.resolved_at ? formatRelativeTime(ticket.resolved_at) : "In Progress"}</strong>
            </div>
          </div>
        </div>

        {/* Query Original Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-white">Original Query Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-navy-950 p-4 rounded-xl border border-slate-100 dark:border-navy-800">
              {ticket.description}
            </p>
          </CardContent>
        </Card>

        {/* Public Conversation Timeline */}
        <div className="space-y-4">
          <h2 className="font-bold text-base text-navy-950 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <span>Support Conversation ({ticket.messages?.length || 0})</span>
          </h2>

          <div className="space-y-3">
            {ticket.messages?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                No replies posted yet. Our designated faculty officer is reviewing your submission.
              </div>
            ) : (
              ticket.messages?.map((msg) => {
                const isStudent = msg.sender_role === "STUDENT";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col p-4 rounded-xl text-xs space-y-1.5 ${
                      isStudent
                        ? "bg-primary-50/70 border border-primary-200 ml-6"
                        : "bg-white border border-slate-200 mr-6 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{msg.sender_name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          {msg.sender_role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(msg.created_at)}
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

          {/* Reply Box */}
          {ticket.status !== "CLOSED" && (
            <Card className="shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Type your response to the support officer..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Replies are sent directly to the assigned faculty desk.
                    </p>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isSending}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Reply
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* State History / Audit Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Status History Audit Trail</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
              {ticket.history?.map((h) => (
                <div key={h.id} className="relative text-xs space-y-0.5">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-white" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950">{h.new_status}</span>
                    <span className="text-[10px] text-slate-400">({formatDate(h.created_at)})</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Changed by <strong className="text-slate-800">{h.changer_name || "System"}</strong>: {h.reason || "Status transition"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reopen Dialog Modal */}
      <Modal
        isOpen={isReopenOpen}
        onClose={() => setIsReopenOpen(false)}
        title="Reopen Resolved Query"
        description="Please provide the exact reason why the resolution was incomplete or unsatisfied."
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <textarea
            rows={4}
            required
            placeholder="Explain why you are reopening this ticket..."
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsReopenOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" type="submit" isLoading={isReopening}>
              Confirm Reopen
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Dialog Modal */}
      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Rate Your Resolution Experience"
        description="Your feedback helps improve university departmental response standards."
      >
        {feedbackSuccess ? (
          <div className="py-6 text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-navy-950">Feedback Recorded!</h4>
            <p className="text-xs text-slate-500">Thank you for helping us maintain high support quality.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Satisfaction Rating
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Comments (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share any comments regarding faculty responsiveness or resolution clarity..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" type="submit" isLoading={isSubmittingFeedback}>
                Submit Rating
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AppShell>
  );
}
