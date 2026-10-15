"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, GraduationCap, Briefcase, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { DEMO_ACCOUNTS } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Find matching user from demo accounts or store
      const match = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!match) {
        setError("Invalid email or credentials. Use one of the quick test accounts below or verify your email.");
        setLoading(false);
        return;
      }

      // Set cookie and local storage
      localStorage.setItem("sqrp_active_user_id", match.id);
      localStorage.setItem("sqrp_active_role", match.role);
      document.cookie = `sqrp_user_id=${match.id}; path=/; max-age=86400`;

      // Redirect by role
      if (match.role === "STUDENT") router.push("/student");
      else if (match.role === "STAFF") router.push("/staff");
      else if (match.role === "DEPARTMENT_HEAD") router.push("/department-head");
      else if (match.role === "ADMIN") router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected login error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    localStorage.setItem("sqrp_active_user_id", acc.id);
    localStorage.setItem("sqrp_active_role", acc.role);
    document.cookie = `sqrp_user_id=${acc.id}; path=/; max-age=86400`;

    if (acc.role === "STUDENT") router.push("/student");
    else if (acc.role === "STAFF") router.push("/staff");
    else if (acc.role === "DEPARTMENT_HEAD") router.push("/department-head");
    else if (acc.role === "ADMIN") router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-sky-200" />
          </div>
          <span className="font-extrabold text-2xl text-navy-950 dark:text-white">SQRP Platform</span>
        </Link>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
          Sign in to Academic Support
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your institutional university credentials to access your portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  label="Institutional Email"
                  type="email"
                  required
                  placeholder="student@nite.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end mt-1">
                  <Link href="/forgot-password" className="text-[11px] text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full mt-2" size="md">
                Sign In to SQRP
              </Button>
            </form>

            {/* Quick 1-Click Demo Logins */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
                1-Click Evaluator Demo Sign In:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleQuickLogin(acc)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 dark:border-navy-800 dark:hover:bg-navy-900 transition-all text-left group"
                  >
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 truncate">
                      {acc.name.split(" ")[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {acc.role.replace("_", " ")}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center text-xs text-slate-500">
            <span>New Student? </span>
            <Link href="/register" className="ml-1 text-primary-600 font-semibold hover:underline">
              Create an account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
