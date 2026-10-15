"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, Shield, Clock, Search, FileText } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [logs] = useState([
    {
      id: "log-1",
      actor: "Aarav Sharma (STUDENT)",
      action: "TICKET_CREATED",
      entity: "Ticket #SQRP-2026-A109B4",
      details: "Created query for Medical OD Exemption",
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: "log-2",
      actor: "AI Smart Router (SYSTEM)",
      action: "AUTO_CLASSIFICATION_AND_ASSIGNMENT",
      entity: "Ticket #SQRP-2026-A109B4",
      details: "Classified as ATTENDANCE_EXEMPTION (Confidence: 0.92). Assigned to Dr. Ramesh Kumar",
      timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
    },
    {
      id: "log-3",
      actor: "Dr. Ramesh Kumar (STAFF)",
      action: "INTERNAL_NOTE_ADDED",
      entity: "Ticket #SQRP-2026-A109B4",
      details: "Verified Apollo Hospital registration #AH-49102",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "log-4",
      actor: "Dr. Ramesh Kumar (STAFF)",
      action: "APPROVAL_REQUESTED",
      entity: "Approval #app-101-1",
      details: "Dispatched ATTENDANCE_CONDONATION to Prof. Meenakshi Sundaram",
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "log-5",
      actor: "Campus IT Desk (STAFF)",
      action: "TICKET_RESOLVED",
      entity: "Ticket #SQRP-2026-C821D3",
      details: "MAC Address 3C:22:FB:49:10:9A bound to RADIUS table",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "log-6",
      actor: "Aarav Sharma (STUDENT)",
      action: "FEEDBACK_SUBMITTED",
      entity: "Ticket #SQRP-2026-C821D3",
      details: "5 Star Rating: Super quick WiFi activation!",
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ]);

  return (
    <AppShell initialRole="ADMIN">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Analytics</span>
          </Link>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Security &amp; Compliance Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system audit logs tracking every state transition, note creation, and administrative approval
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              <span>Event Audit Log Journal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                      <span className="font-semibold text-primary-700">{log.entity}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-600 pl-1">{log.details}</p>
                  <p className="text-[10px] text-slate-400 pl-1">
                    Actor: <strong className="text-slate-700">{log.actor}</strong>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
