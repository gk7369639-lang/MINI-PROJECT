"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, History, Shield, Clock, Search, FileText, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { AuditLogItem } from "@/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const activeUserId = localStorage.getItem("sqrp_active_user_id") || "user-admin-1";
    fetch("/api/admin/audit-logs", {
      headers: { "x-user-id": activeUserId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.logs) {
          setLogs(data.logs);
        }
      })
      .catch((err) => console.error("Failed to load audit logs", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const actionMatch = log.action?.toLowerCase().includes(term);
    const entityMatch = log.entity_type?.toLowerCase().includes(term) || (log.entity_id && log.entity_id.toLowerCase().includes(term));
    const actorMatch = log.actor_name?.toLowerCase().includes(term) || log.actor_role?.toLowerCase().includes(term);
    return actionMatch || entityMatch || actorMatch;
  });

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

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search audit trail by action, actor, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <span>Event Audit Log Journal</span>
              </div>
              <span className="text-xs font-normal text-slate-400">
                {filteredLogs.length} recorded events
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="text-xs">Loading immutable audit logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-1">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">No audit log records found.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Every ticket status update, note creation, and administrative approval will automatically append here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors text-xs space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {log.action}
                        </span>
                        <span className="font-semibold text-primary-700">
                          {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-slate-600 pl-1 font-mono text-[11px]">
                        {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 pl-1">
                      Actor: <strong className="text-slate-700">{log.actor_name || "System"}</strong> ({log.actor_role || "SYSTEM"})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
