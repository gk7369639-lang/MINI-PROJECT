"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  RefreshCw,
  MapPin,
  Wrench,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TicketStatus, TicketPriority } from "@/types";
import { getStatusBadge, getPriorityBadge, formatDate, formatRelativeTime } from "@/lib/utils";

interface PublicTrackedTicket {
  id: string;
  ticket_number: string;
  tracking_token?: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  department_name?: string | null;
  category_name?: string | null;
  location_building?: string | null;
  location_room?: string | null;
  submitted_at: string;
  sla_due_at?: string | null;
  resolved_at?: string | null;
  resolution_summary?: string | null;
  history?: Array<{
    id: string;
    changer_role: string;
    new_status: TicketStatus;
    reason?: string | null;
    created_at: string;
  }>;
  worker_updates?: Array<{
    id: string;
    status: TicketStatus;
    note: string;
    created_at: string;
  }>;
}

function TrackerContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get("number") || searchParams.get("id") || "";
  const initialToken = searchParams.get("token") || "";

  const [ticketNumber, setTicketNumber] = useState(initialNumber);
  const [trackingToken, setTrackingToken] = useState(initialToken);
  const [ticket, setTicket] = useState<PublicTrackedTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchTrackedTicket = async (numberToFetch: string, tokenToFetch: string) => {
    if (!numberToFetch.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const cleanNumber = numberToFetch.trim();
      const tokenQuery = tokenToFetch.trim() ? `?token=${encodeURIComponent(tokenToFetch.trim())}` : "";
      const res = await fetch(`/api/tickets/${encodeURIComponent(cleanNumber)}${tokenQuery}`);
      const data = await res.json();

      if (data.success && data.ticket) {
        setTicket(data.ticket);
        setError(null);
      } else {
        setTicket(null);
        setError(
          data.error ||
            `No query record was found matching ticket number "${cleanNumber}". Please double-check your ticket identifier.`
        );
      }
    } catch (err: any) {
      setTicket(null);
      setError(err.message || "An error occurred while tracking this query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNumber) {
      fetchTrackedTicket(initialNumber, initialToken);
    }
  }, [initialNumber, initialToken]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackedTicket(ticketNumber, trackingToken);
  };

  const handleCopyShareLink = () => {
    if (!ticket) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const tokenPart = ticket.tracking_token ? `&token=${encodeURIComponent(ticket.tracking_token)}` : "";
    const link = `${origin}/track?number=${encodeURIComponent(ticket.ticket_number)}${tokenPart}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const statusBadge = ticket ? getStatusBadge(ticket.status) : null;
  const priorityBadge = ticket ? getPriorityBadge(ticket.priority) : null;

  // Visual milestones
  const steps: { label: string; key: TicketStatus; desc: string }[] = [
    { label: "Submitted", key: "SUBMITTED", desc: "Confidential query logged" },
    { label: "Faculty Review", key: "UNDER_FACULTY_REVIEW", desc: "Desk assessing request" },
    { label: "Assigned", key: "ASSIGNED_TO_WORKER", desc: "Dispatched to maintenance" },
    { label: "In Progress", key: "IN_PROGRESS", desc: "Physical repair underway" },
    { label: "Resolved", key: "RESOLVED", desc: "Work completed & tested" },
  ];

  const getStepStatus = (stepKey: TicketStatus) => {
    if (!ticket) return "pending";
    const statusOrder: Partial<Record<TicketStatus, number>> = {
      SUBMITTED: 1,
      TRIAGED: 2,
      UNDER_FACULTY_REVIEW: 2,
      READY_FOR_ASSIGNMENT: 2,
      ASSIGNED_TO_WORKER: 3,
      ASSIGNED: 3,
      WORKER_ACCEPTED: 3,
      IN_PROGRESS: 4,
      WAITING_FOR_PARTS_OR_RESOURCES: 4,
      WAITING_FOR_STUDENT: 4,
      WAITING_FOR_CLARIFICATION: 4,
      WAITING_FOR_APPROVAL: 4,
      REQUIRES_REASSIGNMENT: 2,
      RESOLVED: 5,
      CLOSED: 5,
      REOPENED: 4,
      NOT_RESOLVED: 4,
      REJECTED: 1,
      ESCALATED: 3,
    };

    const currentWeight = statusOrder[ticket.status] || 1;
    const stepWeight = statusOrder[stepKey] || 1;

    if (currentWeight > stepWeight) return "completed";
    if (currentWeight === stepWeight) return "current";
    return "pending";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
          <span>Confidential Live Query Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-white tracking-tight">
          Track Your Issue Resolution
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your unique ticket number (e.g., <span className="font-mono font-semibold">SQRP-2026-XXXXXX</span>) to track real-time faculty dispatch, maintenance milestones, and resolution progress.
        </p>
      </div>

      {/* Search Bar Card */}
      <Card className="p-4 sm:p-6 shadow-sm border-slate-200">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Ticket Number / ID <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. SQRP-2026-104928"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="font-mono font-semibold text-sm"
                required
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Security Token <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="e.g. trk_..."
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student identities are 100% redacted for confidential public tracking.</span>
            </span>

            <Button
              type="submit"
              size="md"
              variant="primary"
              disabled={loading || !ticketNumber.trim()}
              leftIcon={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            >
              {loading ? "Locating Query..." : "Track Query"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Error Feedback */}
      {error && (
        <Card className="p-6 border-rose-200 bg-rose-50/50 text-center space-y-3 animate-fade-in">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">Query Not Found</h3>
            <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Link href="/student/new-query">
              <Button size="sm" variant="outline">
                Submit New Query
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Ticket Details & Timeline */}
      {ticket && statusBadge && priorityBadge && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Status Header Card */}
          <Card className="p-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-base font-black text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-200">
                    {ticket.ticket_number}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusBadge.dotColor}`} />
                    {statusBadge.label}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded border ${priorityBadge.badgeClass}`}>
                    {priorityBadge.label}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                  {ticket.subject}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyShareLink}
                  leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedLink ? "Link Copied!" : "Share Link"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fetchTrackedTicket(ticket.ticket_number, trackingToken)}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Department
                </span>
                <span className="font-bold text-navy-950 dark:text-white mt-0.5 block">
                  {ticket.department_name || "Assessing"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Category
                </span>
                <span className="font-bold text-navy-950 dark:text-white mt-0.5 block">
                  {ticket.category_name || "General"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Location
                </span>
                <span className="font-bold text-navy-950 dark:text-white mt-0.5 block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary-500" />
                  <span>
                    {ticket.location_building || "Campus"} {ticket.location_room || ""}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                  Submitted
                </span>
                <span className="font-bold text-navy-950 dark:text-white mt-0.5 block">
                  {formatDate(ticket.submitted_at)}
                </span>
              </div>
            </div>

            {/* Milestone Step Progress */}
            <div className="pt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Resolution Lifecycle Progression
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {steps.map((st, idx) => {
                  const state = getStepStatus(st.key);
                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-xl border transition ${
                        state === "completed"
                          ? "bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20"
                          : state === "current"
                          ? "bg-primary-50/70 border-primary-300 ring-2 ring-primary-500/20 shadow-sm"
                          : "bg-slate-50 border-slate-200 dark:bg-slate-900/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {state === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : state === "current" ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        )}
                        <span className="text-xs font-bold text-navy-950 dark:text-white">
                          {idx + 1}. {st.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Resolution Card if completed */}
          {ticket.status === "RESOLVED" && ticket.resolution_summary && (
            <Card className="p-6 border-emerald-300 bg-emerald-50/40 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">Resolution Summary</h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    {ticket.resolution_summary}
                  </p>
                  {ticket.resolved_at && (
                    <span className="text-[11px] text-emerald-600 font-medium block mt-2">
                      Completed on {formatDate(ticket.resolved_at)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Public Progress History & Maintenance Log */}
          <Card className="p-6 border-slate-200">
            <CardHeader className="p-0 pb-4 border-b border-slate-200">
              <CardTitle className="text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" />
                <span>Verified Milestones & Event Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4">
              {ticket.history && ticket.history.length > 0 ? (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {ticket.history.map((hist) => {
                    const hBadge = getStatusBadge(hist.new_status);
                    return (
                      <div key={hist.id} className="relative group">
                        <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-primary-600 ring-4 ring-primary-50" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${hBadge.bg} ${hBadge.text} ${hBadge.border}`}
                            >
                              {hBadge.label}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatRelativeTime(hist.created_at)} ({formatDate(hist.created_at)})
                            </span>
                          </div>
                          {hist.reason && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {hist.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No events logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <AppShell initialRole="STUDENT">
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-slate-400">
            Loading query tracking interface...
          </div>
        }
      >
        <TrackerContent />
      </Suspense>
    </AppShell>
  );
}
