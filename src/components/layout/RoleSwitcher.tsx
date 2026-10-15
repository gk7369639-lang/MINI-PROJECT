"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS } from "@/lib/auth/session";
import { UserRole } from "@/types";
import { UserCheck, ShieldAlert, GraduationCap, Briefcase, ChevronRight } from "lucide-react";

export function RoleSwitcher() {
  const router = useRouter();
  const [currentId, setCurrentId] = useState<string>("user-student-1");

  useEffect(() => {
    const saved = localStorage.getItem("sqrp_active_user_id");
    if (saved) {
      setCurrentId(saved);
    }
  }, []);

  const handleSwitch = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setCurrentId(account.id);
    localStorage.setItem("sqrp_active_user_id", account.id);
    localStorage.setItem("sqrp_active_role", account.role);

    // Set cookie for server actions and route handlers
    document.cookie = `sqrp_user_id=${account.id}; path=/; max-age=86400`;

    // Redirect to role portal
    switch (account.role as UserRole) {
      case "STUDENT":
        router.push("/student");
        break;
      case "STAFF":
        router.push("/staff");
        break;
      case "DEPARTMENT_HEAD":
        router.push("/department-head");
        break;
      case "ADMIN":
        router.push("/admin");
        break;
    }
    router.refresh();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <GraduationCap className="w-3.5 h-3.5 text-blue-500" />;
      case "STAFF":
        return <Briefcase className="w-3.5 h-3.5 text-indigo-500" />;
      case "DEPARTMENT_HEAD":
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />;
      case "ADMIN":
        return <UserCheck className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-navy-950 text-white text-xs border-b border-navy-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-slate-300">DEMO ROLE SIMULATOR:</span>
        <span className="text-slate-400 hidden sm:inline">Click any account to test live portal permissions</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {DEMO_ACCOUNTS.map((acc) => {
          const isActive = currentId === acc.id;
          return (
            <button
              key={acc.id}
              onClick={() => handleSwitch(acc)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                isActive
                  ? "bg-primary-600 text-white shadow-sm ring-1 ring-primary-400"
                  : "bg-navy-900/80 text-slate-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              {getRoleIcon(acc.role)}
              <span>{acc.name.split(" ")[0]}</span>
              <span className="text-[10px] opacity-75 uppercase tracking-wider">({acc.role.replace("_", " ")})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
