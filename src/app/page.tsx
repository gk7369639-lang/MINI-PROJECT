"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  FileCheck,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the Student Query Resolution Platform (SQRP)?",
      a: "SQRP is an institutional university platform designed to eliminate manual, paper-based, or lost query handling. It automatically routes academic, exam, financial, hostel, and IT queries to verified faculty desks with strict SLA monitoring.",
    },
    {
      q: "How does the Generative AI engine work?",
      a: "When a student types a query, our server-side NLP agent analyzes the intent, identifies missing details, classifies the issue into appropriate academic categories, assigns priority, and determines the optimal department queue or available staff handler.",
    },
    {
      q: "What happens if a query requires Department Head approval?",
      a: "Special cases—such as medical attendance condonations below 75%, fee installment concessions, or exam revaluations—automatically trigger an explicit WAITING_FOR_APPROVAL state. The designated Department Head reviews the case and logs a formal approval or rejection decision.",
    },
    {
      q: "How do students track their query status?",
      a: "Every submission receives a tamper-proof reference ID (e.g. SQRP-2026-A109B4). Students can view real-time status transitions, conversation logs, reply to staff clarifications, and reopen resolved queries within 7 days if dissatisfied.",
    },
    {
      q: "Is sensitive student data protected?",
      a: "Yes. The platform enforces Row-Level Security (RLS) and server-side authorization. Students only see their own tickets, and staff internal notes are strictly quarantined and never rendered to student clients.",
    },
  ];

  const lifecycleSteps = [
    {
      step: "01",
      title: "Query Submission",
      desc: "Student inputs issue. AI pre-screens description and highlights any missing references.",
      icon: MessageSquare,
      color: "bg-blue-500",
    },
    {
      step: "02",
      title: "AI Triage & Routing",
      desc: "Classification agent tags category and routes ticket based on current faculty workload.",
      icon: Cpu,
      color: "bg-indigo-500",
    },
    {
      step: "03",
      title: "Staff Processing",
      desc: "Assigned department officer reviews evidence, writes internal notes, and replies directly.",
      icon: Briefcase,
      color: "bg-amber-500",
    },
    {
      step: "04",
      title: "Head Approval",
      desc: "If policy requires waiver or condonation, the Department Head decides with logged rationale.",
      icon: ShieldCheck,
      color: "bg-purple-500",
    },
    {
      step: "05",
      title: "Resolution & Feedback",
      desc: "Student receives resolution summary, confirms closure, and provides 5-star quality rating.",
      icon: CheckCircle2,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-navy-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Academic Banner */}
      <div className="bg-navy-950 text-slate-300 text-xs px-4 py-2 border-b border-navy-800 flex justify-between items-center">
        <span className="font-medium tracking-wide">
          National Institute of Technology & Engineering — Institutional Query Resolution Desk
        </span>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Academic Year 2025–2026</span>
          <span className="hidden sm:inline">|</span>
          <Link href="/knowledge-base" className="hover:text-white transition-colors hidden sm:inline">
            Public Knowledge Base
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-navy-900/90 backdrop-blur border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <span className="font-extrabold text-navy-950 dark:text-white text-lg tracking-tight">
                SQRP Platform
              </span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Autonomous Academic Triage
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a>
            <a href="#lifecycle" className="hover:text-primary-600 transition-colors">Query Lifecycle</a>
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#portals" className="hover:text-primary-600 transition-colors">Portals</a>
            <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/student">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white via-primary-50/20 to-slate-50 dark:from-navy-950 dark:to-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800 text-xs font-semibold animate-fade-in">
              <Cpu className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span>Next-Generation Generative AI Query Triage & Smart Routing Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 dark:text-white tracking-tight leading-[1.15]">
              Instant, Accountable &amp; Transparent <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                Student Query Resolution
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Say goodbye to unresponded emails, circular department referrals, and untracked grievance forms.
              SQRP intelligently classifies student queries, enforces automated SLAs, and guarantees resolution transparency.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/student/new-query">
                <Button size="lg" className="shadow-lg shadow-primary-600/20" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Submit a Query
                </Button>
              </Link>
              <Link href="/student">
                <Button variant="outline" size="lg">
                  Explore Student Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
                <p className="text-2xl font-black text-navy-900 dark:text-white">100%</p>
                <p className="text-xs text-slate-500 font-medium">Traceable Audit History</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
                <p className="text-2xl font-black text-primary-600">48h Max</p>
                <p className="text-xs text-slate-500 font-medium">Standard SLA Window</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
                <p className="text-2xl font-black text-emerald-600">4 Portals</p>
                <p className="text-xs text-slate-500 font-medium">Student, Staff, Head, Admin</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm">
                <p className="text-2xl font-black text-indigo-600">AI Triage</p>
                <p className="text-xs text-slate-500 font-medium">Automated Department Routing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Query Lifecycle Visualization */}
      <section id="lifecycle" className="py-20 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="info">End-to-End State Machine</Badge>
            <h2 className="text-3xl font-bold text-navy-950 dark:text-white tracking-tight">
              Transparent Query Lifecycle
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Every query progresses through an auditable, deterministic state machine with verifiable history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {lifecycleSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative p-6 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex flex-col justify-between group hover:border-primary-500 transition-all hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-slate-300 dark:text-navy-700">
                        {step.step}
                      </span>
                      <div className={`w-9 h-9 rounded-xl ${step.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-navy-950 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 Portals Showcase */}
      <section id="portals" className="py-20 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="default">Multi-Role Architecture</Badge>
            <h2 className="text-3xl font-bold text-navy-950 dark:text-white tracking-tight">
              Tailored Portals for the University Community
            </h2>
            <p className="text-sm text-slate-500">
              Role-guarded interfaces ensure students, faculty, heads, and administrators access only authorized tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-900 dark:text-white">Student Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submit queries with AI assistance, track status in real-time, reply to staff, confirm resolution, and rate service.
                  </p>
                </div>
                <Link href="/student" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Enter Student Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Staff */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-900 dark:text-white">Staff Workdesk</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage department queue, claim tickets, write quarantined internal notes, request approvals, and record resolution.
                  </p>
                </div>
                <Link href="/staff" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Enter Staff Workdesk
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Head */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-900 dark:text-white">Department Head</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Vetting approval-required cases (attendance condonation, fee waivers), monitoring faculty load, and escalating bottlenecks.
                  </p>
                </div>
                <Link href="/department-head" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Enter Head Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy-900 dark:text-white">Admin Analytics</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Comprehensive SLA adherence metrics, user permissions directory, department categories, audit logs, and CSV reporting.
                  </p>
                </div>
                <Link href="/admin" className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Enter Admin Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <Badge variant="info">Frequently Asked Questions</Badge>
            <h2 className="text-3xl font-bold text-navy-950 dark:text-white tracking-tight">
              Everything You Need to Know About SQRP
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-navy-950 dark:text-white hover:text-primary-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-navy-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 text-xs py-12 border-t border-navy-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-navy-800/80 pb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base">SQRP Platform</span>
                <p className="text-[10px] text-slate-400">National Institute of Technology & Engineering</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-slate-400 font-medium">
              <Link href="/knowledge-base" className="hover:text-white">Knowledge Base</Link>
              <Link href="/student/new-query" className="hover:text-white">Submit Query</Link>
              <Link href="/login" className="hover:text-white">Staff Login</Link>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>© 2026 Student Query Resolution Platform (SQRP). Developed for Mini Project Submission.</p>
            <p>Built with Next.js 14, Supabase, Tailwind CSS, TypeScript & Generative AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
