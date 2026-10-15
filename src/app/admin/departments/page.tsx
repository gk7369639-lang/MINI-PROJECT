"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Clock, ShieldCheck, Check } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function AdminDepartmentsPage() {
  const [categories, setCategories] = useState([
    { id: "cat-att", dept: "Academic Affairs", name: "Attendance Shortage & OD Exemption", sla: 48, requiresApproval: true },
    { id: "cat-bonafide", dept: "Academic Affairs", name: "Bonafide & Official Transcripts", sla: 24, requiresApproval: false },
    { id: "cat-hallticket", dept: "Examination Cell", name: "Hall Ticket Discrepancy", sla: 24, requiresApproval: false },
    { id: "cat-reval", dept: "Examination Cell", name: "Revaluation & Paper Viewing", sla: 72, requiresApproval: true },
    { id: "cat-fee-receipt", dept: "Accounts & Finance", name: "Tuition Fee Payment & Receipt Reconcile", sla: 48, requiresApproval: false },
    { id: "cat-fee-installment", dept: "Accounts & Finance", name: "Fee Concession & Installment Permission", sla: 72, requiresApproval: true },
    { id: "cat-wifi", dept: "Campus IT Support", name: "Campus WiFi & Portal Credentials", sla: 12, requiresApproval: false },
    { id: "cat-hostel", dept: "Hostel Services", name: "Hostel Room Maintenance", sla: 24, requiresApproval: false },
  ]);

  const toggleApprovalPolicy = (id: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, requiresApproval: !c.requiresApproval } : c
      )
    );
  };

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
            Departments, Categories &amp; SLA Policies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated response SLA windows and mandate Head approval rules per query category
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-600" />
              <span>Configured Query Categories &amp; Governance Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Assigned Department</th>
                    <th className="p-4">Max SLA Hours</th>
                    <th className="p-4">Approval Policy</th>
                    <th className="p-4 text-right">Policy Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <strong className="text-slate-900 block">{cat.name}</strong>
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {cat.dept}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {cat.sla}h
                        </span>
                      </td>
                      <td className="p-4">
                        {cat.requiresApproval ? (
                          <span className="inline-flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                            <ShieldCheck className="w-3 h-3 text-purple-600" /> Head Approval Mandated
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Standard Resolution</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={cat.requiresApproval ? "outline" : "secondary"}
                          onClick={() => toggleApprovalPolicy(cat.id)}
                        >
                          {cat.requiresApproval ? "Disable Approval" : "Mandate Approval"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
