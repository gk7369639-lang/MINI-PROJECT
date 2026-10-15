"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Shield, CheckCircle2, XCircle, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DEMO_ACCOUNTS } from "@/lib/auth/session";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([
    { id: "user-student-1", name: "Aarav Sharma", email: "student@nite.edu.in", role: "STUDENT", regNo: "22BCE1045", isActive: true },
    { id: "user-staff-1", name: "Dr. Ramesh Kumar", email: "staff@nite.edu.in", role: "STAFF", dept: "Academic Affairs", isActive: true },
    { id: "user-staff-2", name: "S. Priya", email: "staff.exam@nite.edu.in", role: "STAFF", dept: "Examination Cell", isActive: true },
    { id: "user-head-1", name: "Prof. Meenakshi Sundaram", email: "head@nite.edu.in", role: "DEPARTMENT_HEAD", dept: "Academic Affairs", isActive: true },
    { id: "user-admin-1", name: "System Administrator", email: "admin@nite.edu.in", role: "ADMIN", dept: "Central IT", isActive: true },
  ]);

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
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
            User &amp; Role Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforce role-based access control, inspect active accounts, and manage deactivations
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total Accounts: <strong>{users.length}</strong>
          </span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Name &amp; Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Department / Reg No</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <strong className="text-slate-900 block">{u.name}</strong>
                        <span className="text-slate-500 text-[11px]">{u.email}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {u.dept || u.regNo || "—"}
                      </td>
                      <td className="p-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={u.isActive ? "outline" : "primary"}
                          onClick={() => toggleUserStatus(u.id)}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
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
