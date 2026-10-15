"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Download, CheckCircle2, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function AdminReportsPage() {
  return (
    <AppShell initialRole="ADMIN">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Analytics</span>
          </Link>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Institutional Support Reporting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export comprehensive CSV logs for internal accreditation, NAAC compliance, and Dean reviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-primary-400 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-bold text-navy-950">
                Complete Ticket Master Export (CSV)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <p>
                Includes ticket reference numbers, student registration IDs, department codes, initial SLA deadlines, actual resolution timestamps, and assigned faculty officers.
              </p>
              <div className="pt-2">
                <a href="/api/admin/reports" target="_blank" download>
                  <Button size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download Complete CSV
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary-400 transition-all">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-2">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <CardTitle className="text-sm font-bold text-navy-950">
                SLA Compliance &amp; Condonation Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <p>
                Detailed departmental breakdown of cases requiring Department Head approval decisions, attendance waivers granted, and average resolution speed.
              </p>
              <div className="pt-2">
                <a href="/api/admin/reports" target="_blank" download>
                  <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download Compliance Report
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
