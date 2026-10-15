"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Clock,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ApprovalRequest, ApprovalStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default function DepartmentHeadApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [decision, setDecision] = useState<ApprovalStatus>("APPROVED");
  const [decisionComment, setDecisionComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [activeUserId, setActiveUserId] = useState<string>("user-head-1");

  const fetchApprovals = async (uid: string = activeUserId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/approvals?userId=${uid}`, {
        headers: { "x-user-id": uid },
      });
      const data = await res.json();
      if (data.success && data.approvals) {
        setApprovals(data.approvals);
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
    fetchApprovals(uid);
  }, []);

  const handleOpenDecisionModal = (req: ApprovalRequest, dec: ApprovalStatus) => {
    setSelectedReq(req);
    setDecision(dec);
    setDecisionComment(
      dec === "APPROVED"
        ? "Approved after verifying hospital admission documents and academic attendance log under Regulation 8.2."
        : "Rejected. Submitted justification does not meet university academic condonation criteria."
    );
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          requestId: selectedReq.id,
          decision,
          comment: decisionComment,
          userId: activeUserId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`Approval request #${selectedReq.ticket_number || selectedReq.id} has been marked as ${decision}.`);
        setSelectedReq(null);
        fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell initialRole="DEPARTMENT_HEAD">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/department-head"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Department Overview</span>
          </Link>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Administrative Approval Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and grant authorized department-level decisions for attendance condonations and fee waivers
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Loading pending approval cases...
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm text-navy-950">No Pending Approvals</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submitted faculty requests have been processed.
              </p>
            </div>
          ) : (
            approvals.map((req) => (
              <Card key={req.id} className="border-purple-200 shadow-sm">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {req.ticket_number || "TICKET"}
                      </span>
                      <span className="text-xs font-bold text-navy-950 uppercase">
                        {req.action_type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Requested {formatDate(req.created_at)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-navy-900 mb-1">
                      {req.ticket_subject || "Query Subject"}
                    </h3>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                      <p>
                        <strong className="text-slate-900">Requester Justification:</strong>
                      </p>
                      <p className="leading-relaxed whitespace-pre-line">{req.reason}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-slate-500">
                      Submitted by faculty member: <strong className="text-slate-800">{req.requester_name}</strong>
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenDecisionModal(req, "REJECTED")}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenDecisionModal(req, "APPROVED")}
                      >
                        Grant Approval
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Decision Confirmation Modal */}
      {selectedReq && (
        <Modal
          isOpen={Boolean(selectedReq)}
          onClose={() => setSelectedReq(null)}
          title={`Formal Decision: ${decision}`}
          description={`Please log your official department head justification for ticket ${selectedReq.ticket_number}.`}
        >
          <form onSubmit={handleSubmitDecision} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Official Head Comment &amp; Regulation Compliance
              </label>
              <textarea
                rows={4}
                required
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setSelectedReq(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={decision === "APPROVED" ? "primary" : "danger"}
                type="submit"
                isLoading={isSubmitting}
              >
                Confirm {decision}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
