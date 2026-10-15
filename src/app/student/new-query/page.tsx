"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  Loader2,
  FileText,
  Lightbulb,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Department, SupportCategory, TicketPriority, KnowledgeBaseArticle } from "@/types";

export default function NewQueryPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<{ id: string; ticket_number: string } | null>(null);

  // AI Assistant Feedback
  const [aiSuggestions, setAiSuggestions] = useState<{
    missingDetails: string[];
    suggestedFaqs: KnowledgeBaseArticle[];
    refinedSubject?: string;
  } | null>(null);

  const activeUserId = "user-student-1";

  useEffect(() => {
    // Fetch departments and categories from public state
    fetch("/api/tickets?userId=" + activeUserId)
      .then(() => {
        // Mock load categories and departments from local config
        setDepartments([
          { id: "dept-acad", code: "ACAD", name: "Academic Affairs & Registry", description: "", contact_email: "", is_active: true, created_at: "" },
          { id: "dept-exam", code: "EXAM", name: "Examination Cell & Evaluation", description: "", contact_email: "", is_active: true, created_at: "" },
          { id: "dept-fin", code: "FIN", name: "Accounts & Finance", description: "", contact_email: "", is_active: true, created_at: "" },
          { id: "dept-cse", code: "CSE", name: "Computer Science & Engineering", description: "", contact_email: "", is_active: true, created_at: "" },
          { id: "dept-hostel", code: "HOSTEL", name: "Hostel & Residential Services", description: "", contact_email: "", is_active: true, created_at: "" },
          { id: "dept-its", code: "ITS", name: "Campus IT & Infrastructure Support", description: "", contact_email: "", is_active: true, created_at: "" },
        ]);

        setCategories([
          { id: "cat-att", department_id: "dept-acad", name: "Attendance Shortage & On-Duty (OD) Exemption", code: "ATTENDANCE_EXEMPTION", description: "", sla_hours: 48, requires_approval: true, is_active: true },
          { id: "cat-bonafide", department_id: "dept-acad", name: "Bonafide & Official Transcripts", code: "CERTIFICATE_BONAFIDE", description: "", sla_hours: 24, requires_approval: false, is_active: true },
          { id: "cat-hallticket", department_id: "dept-exam", name: "Hall Ticket Discrepancy", code: "HALL_TICKET_ERROR", description: "", sla_hours: 24, requires_approval: false, is_active: true },
          { id: "cat-reval", department_id: "dept-exam", name: "Revaluation & Paper Viewing", code: "EXAM_REVALUATION", description: "", sla_hours: 72, requires_approval: true, is_active: true },
          { id: "cat-fee-receipt", department_id: "dept-fin", name: "Tuition Fee Payment & Receipt Reconcile", code: "FEE_RECEIPT_ISSUE", description: "", sla_hours: 48, requires_approval: false, is_active: true },
          { id: "cat-fee-installment", department_id: "dept-fin", name: "Fee Concession & Installment Permission", code: "FEE_CONCESSION", description: "", sla_hours: 72, requires_approval: true, is_active: true },
          { id: "cat-wifi", department_id: "dept-its", name: "Campus WiFi & Portal Credentials", code: "IT_PORTAL_ACCESS", description: "", sla_hours: 12, requires_approval: false, is_active: true },
          { id: "cat-hostel", department_id: "dept-hostel", name: "Hostel Room Maintenance", code: "HOSTEL_MAINTENANCE", description: "", sla_hours: 24, requires_approval: false, is_active: true },
        ]);
      })
      .catch(() => {});
  }, []);

  const handleAiPreCheck = async () => {
    if (!subject || !description) {
      setError("Please fill in subject and description before requesting AI analysis.");
      return;
    }
    setError(null);
    setIsAiChecking(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": activeUserId },
        body: JSON.stringify({
          action: "assist-student",
          subject,
          description,
        }),
      });
      const data = await res.json();
      if (data.success && data.suggestion) {
        setAiSuggestions(data.suggestion);
      }
    } catch {
      setError("AI service momentarily unavailable. You can still submit your query directly.");
    } finally {
      setIsAiChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (subject.trim().length < 5) {
      setError("Subject must be at least 5 characters long.");
      return;
    }
    if (description.trim().length < 20) {
      setError("Description must be at least 20 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": activeUserId,
        },
        body: JSON.stringify({
          subject,
          description,
          category_id: categoryId || undefined,
          department_id: departmentId || undefined,
          priority,
          student_id: activeUserId,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setSuccessTicket({
          id: data.ticket.id,
          ticket_number: data.ticket.ticket_number,
        });
      } else {
        setError(data.error || "Failed to submit query. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successTicket) {
    return (
      <AppShell initialRole="STUDENT">
        <div className="max-w-xl mx-auto py-12 text-center animate-fade-in">
          <Card className="p-8 space-y-5 border-emerald-200 bg-emerald-50/30">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Query Successfully Logged
              </span>
              <h2 className="text-2xl font-black text-navy-950 mt-1">
                {successTicket.ticket_number}
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Your query has been validated, assigned a unique tracking token, and routed to the faculty workdesk with active SLA monitoring.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/student/tickets/${successTicket.id}`}>
                <Button size="md">Track This Ticket</Button>
              </Link>
              <Link href="/student">
                <Button variant="outline" size="md">Return to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell initialRole="STUDENT">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-navy-950 dark:text-white tracking-tight">
            Submit an Academic Support Query
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Our AI Triage system will review your query, classify the department, and assign an eligible faculty member.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Pre-Screening Suggestions Banner */}
        {aiSuggestions && (
          <Card className="border-primary-200 bg-primary-50/40 animate-fade-in">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary-800 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span>AI Pre-Screening Recommendations</span>
              </div>

              {aiSuggestions.missingDetails.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-700">Recommended Additions:</p>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {aiSuggestions.missingDetails.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSuggestions.suggestedFaqs.length > 0 && (
                <div className="pt-2 border-t border-primary-100">
                  <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                    Can this FAQ answer your question right now?
                  </p>
                  <div className="space-y-1.5">
                    {aiSuggestions.suggestedFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="p-2.5 rounded-lg bg-white border border-primary-200/80 text-xs flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-navy-950">{faq.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{faq.content}</p>
                        </div>
                        <Link
                          href="/knowledge-base"
                          className="shrink-0 text-primary-600 font-semibold text-[11px] hover:underline"
                        >
                          Read FAQ
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="Subject / Brief Summary"
                  required
                  placeholder="e.g. Medical OD Condonation for Hospitalization in CS301"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  helperText="Be specific. Minimum 5 characters."
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Detailed Query Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAiPreCheck}
                    disabled={isAiChecking || !subject || !description}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 disabled:opacity-40"
                  >
                    {isAiChecking ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Pre-Screen with AI</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide complete context, dates, transaction reference numbers, course codes, or faculty names..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-slate-400 text-right">
                  {description.length} / 3000 characters (minimum 20)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Department (Optional - Auto-routed if empty)
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Auto-Detect via AI</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Support Category (Optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 px-3 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Auto-Detect via AI</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Self-Assessed Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        priority === p
                          ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-1">
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Supporting Attachments (Optional)
                </p>
                <p className="text-[11px] text-slate-400">
                  PDF, PNG, JPG receipts or medical certificates up to 5MB
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Link href="/student">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="shadow-md shadow-primary-600/20"
                >
                  Submit Query to University Desk
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
