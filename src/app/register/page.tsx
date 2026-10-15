"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Simulate registration
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push("/student");
        }, 1200);
      }, 600);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Sparkles className="w-5 h-5 text-sky-200" />
          </div>
          <span className="font-extrabold text-2xl text-navy-950 dark:text-white">SQRP Platform</span>
        </Link>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
          Create Student Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Register with your institute roll number to submit &amp; track queries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Account created successfully! Redirecting to Student Portal...</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                required
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Institute Email Address"
                type="email"
                required
                placeholder="aarav.22bce1045@nite.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Student Registration / Roll No"
                required
                placeholder="22BCE1045"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />

              <Input
                label="Create Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" isLoading={loading} className="w-full mt-2" size="md">
                Register Student Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link href="/login" className="ml-1 text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
