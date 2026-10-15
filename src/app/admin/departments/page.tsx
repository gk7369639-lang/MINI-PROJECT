"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Clock, ShieldCheck, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SupportCategory, Department } from "@/types";

export default function AdminDepartmentsPage() {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleApprovalPolicy = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/departments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, requires_approval: data.requiresApproval } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
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
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Loading categories and SLA settings...
              </div>
            ) : (
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
                          <span className="text-[10px] text-slate-400 font-mono">{cat.code}</span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {cat.department_name || "General"}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {cat.sla_hours}h
                          </span>
                        </td>
                        <td className="p-4">
                          {cat.requires_approval ? (
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
                            variant={cat.requires_approval ? "outline" : "secondary"}
                            isLoading={actionLoading === cat.id}
                            onClick={() => toggleApprovalPolicy(cat.id)}
                          >
                            {cat.requires_approval ? "Disable Approval" : "Mandate Approval"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
