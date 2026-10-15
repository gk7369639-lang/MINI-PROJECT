"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  MapPin,
  ShieldCheck,
  Building2,
  QrCode,
  Image as ImageIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Department, Category, TicketPriority, KnowledgeBaseArticle } from "@/types";

function NewQueryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read location query parameters from QR code scan
  const qrBuilding = searchParams.get("building") || "";
  const qrRoom = searchParams.get("room") || "";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [locationBuilding, setLocationBuilding] = useState(qrBuilding || "Aryabhata Academic Complex");
  const [locationRoom, setLocationRoom] = useState(qrRoom || "");
  const [imageUrl, setImageUrl] = useState("");

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

  const [activeUserId, setActiveUserId] = useState<string>("user-student-1");

  useEffect(() => {
    const saved = localStorage.getItem("sqrp_active_user_id");
    if (saved) setActiveUserId(saved);

    if (qrBuilding) setLocationBuilding(qrBuilding);
    if (qrRoom) setLocationRoom(qrRoom);

    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.departments) setDepartments(data.departments);
          if (data.categories) setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to load departments and categories", err));
  }, [qrBuilding, qrRoom]);

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
          location_building: locationBuilding || undefined,
          location_room: locationRoom || undefined,
          image_url: imageUrl || undefined,
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
                Confidential Query Logged
              </span>
              <h2 className="text-2xl font-black text-navy-950 mt-1">
                {successTicket.ticket_number}
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Your issue has been anonymously registered and queued for faculty review. Your identity remains 100% confidential.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/student/tickets/${successTicket.id}`}>
                <Button size="md">Track Confidential Timeline</Button>
              </Link>
              <Link href="/student">
                <Button variant="outline" size="md">Return to Student Dashboard</Button>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-navy-950 dark:text-white tracking-tight">
                Submit Confidential Query / Maintenance Issue
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Report academic issues, hostel maintenance, laboratory malfunctions, or facility repairs.
              </p>
            </div>

            {(qrBuilding || qrRoom) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 border border-primary-200">
                <QrCode className="w-4 h-4 text-primary-600" />
                <span>Location prefilled from QR placard</span>
              </span>
            )}
          </div>
        </div>

        {/* Confidentiality Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900 dark:text-emerald-300">
              Strict Student Privacy & Confidentiality Shield
            </p>
            <p className="text-emerald-800 dark:text-emerald-400 mt-0.5 leading-relaxed">
              Your name, email address, and student registration number are never revealed to faculty reviewers or maintenance technicians. Only the issue description and location are shared for physical resolution.
            </p>
          </div>
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
              {/* Location Fields */}
              <div className="p-4 bg-slate-50 dark:bg-navy-900/60 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>Campus Physical Location (For On-Site Support)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Building
                    </label>
                    <select
                      value={locationBuilding}
                      onChange={(e) => setLocationBuilding(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Aryabhata Academic Complex">Aryabhata Academic Complex</option>
                      <option value="Ramanujan Science & Technology Block">Ramanujan Science & Technology Block</option>
                      <option value="Central Library & Knowledge Hub">Central Library & Knowledge Hub</option>
                      <option value="CV Raman Boys Hostel">CV Raman Boys Hostel</option>
                      <option value="Sarojini Naidu Girls Hostel">Sarojini Naidu Girls Hostel</option>
                      <option value="Student Sports & Recreational Pavilion">Student Sports & Recreational Pavilion</option>
                      <option value="Administrative Secretariat">Administrative Secretariat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Room / Facility / Lab Number
                    </label>
                    <Input
                      placeholder="e.g. Lab 302, Bench 14 or Room 204"
                      value={locationRoom}
                      onChange={(e) => setLocationRoom(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Input
                  label="Subject / Problem Summary"
                  required
                  placeholder="e.g. AC unit leaking water and flickering lab monitor"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  helperText="Be specific. Minimum 5 characters."
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                  placeholder="Provide complete context, symptoms, affected equipment numbers, or urgency details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-navy-700 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-navy-900"
                />
                <p className="text-xs text-slate-400 text-right">
                  {description.length} / 3000 characters (minimum 20)
                </p>
              </div>

              {/* Photo Image Attachment URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Photo Attachment URL (Optional)
                </label>
                <Input
                  placeholder="https://example.com/uploads/issue-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  helperText="Paste direct image link of the facility problem or equipment fault."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Department (Optional - Auto-routed if empty)
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-navy-700 px-3 text-xs bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Support Category (Optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 dark:border-navy-700 px-3 text-xs bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Self-Assessed Urgency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as TicketPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        priority === p
                          ? "bg-navy-900 text-white border-navy-900 shadow-sm dark:bg-white dark:text-navy-950"
                          : "border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-900"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
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
                  className="shadow-md shadow-primary-600/20 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  Submit Confidential Query
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function NewQueryPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading query form...</div>}>
      <NewQueryContent />
    </React.Suspense>
  );
}
