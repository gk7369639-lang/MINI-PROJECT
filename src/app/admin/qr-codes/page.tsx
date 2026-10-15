"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QRCodeConfig } from "@/types";
import { formatDateTime } from "@/lib/utils";
import {
  QrCode,
  Download,
  Printer,
  PlusCircle,
  MapPin,
  Building2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

export default function AdminQRCodesPage() {
  const [qrCodes, setQrCodes] = useState<(QRCodeConfig & { qr_data_url?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [building, setBuilding] = useState("Aryabhata Academic Complex");
  const [room, setRoom] = useState("Lab 302 - Computer Center");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Print modal state
  const [printPlacard, setPrintPlacard] = useState<(QRCodeConfig & { qr_data_url?: string }) | null>(null);

  const fetchQRCodes = async () => {
    try {
      const savedId = localStorage.getItem("sqrp_active_user_id") || "user-admin-1";
      const res = await fetch("/api/admin/qr", {
        headers: { "x-user-id": savedId },
      });
      const data = await res.json();
      if (data.success) {
        setQrCodes(data.qr_codes || []);
        if (data.qr_codes?.length > 0 && !printPlacard) {
          setPrintPlacard(data.qr_codes[0]);
        }
      }
    } catch {
      // offline / fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setCreating(true);

    try {
      const savedId = localStorage.getItem("sqrp_active_user_id") || "user-admin-1";
      const res = await fetch("/api/admin/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": savedId,
        },
        body: JSON.stringify({
          title,
          building,
          room,
          baseUrl: window.location.origin,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to generate QR code.");
        return;
      }

      setPrintPlacard(data.qr_code);
      setTitle("");
      await fetchQRCodes();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell initialRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400">
                <QrCode className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white">
                Campus QR Code & Placard Generator
              </h1>
              <span className="bg-primary-50 text-primary-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary-200 dark:bg-primary-950 dark:text-primary-300">
                Physical Deployment Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deploy physical QR placards across campus buildings, laboratories, lecture halls, and dormitories for instant confidential reporting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Active Placard</span>
            </Button>
          </div>
        </div>

        {/* Main Grid: Generator & Live Placard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          {/* Left Form: Create New QR Code */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            <Card>
              <CardHeader className="border-b border-slate-100 dark:border-navy-800">
                <CardTitle className="text-base font-bold text-navy-950 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-primary-600" />
                  <span>Generate New Location Placard</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Generates an institutional QR code pre-configured with building and room coordinates.
                </p>
              </CardHeader>

              <form onSubmit={handleCreateQR}>
                <CardContent className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Placard Title / Notice Header *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Main Library Reading Hall Issue Point"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Building / Facility
                    </label>
                    <select
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Aryabhata Academic Complex">Aryabhata Academic Complex</option>
                      <option value="Ramanujan Science & Technology Block">Ramanujan Science & Technology Block</option>
                      <option value="Central Library & Knowledge Hub">Central Library & Knowledge Hub</option>
                      <option value="CV Raman Boys Hostel">CV Raman Boys Hostel</option>
                      <option value="Sarojini Naidu Girls Hostel">Sarojini Naidu Girls Hostel</option>
                      <option value="Student Sports & Recreational Pavilion">Student Sports & Recreational Pavilion</option>
                      <option value="Administrative Secretariat">Administrative Secretariat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Room / Floor / Specific Location
                    </label>
                    <Input
                      placeholder="e.g. Room 204, 2nd Floor West Wing"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-navy-900/60 rounded-xl border border-slate-200 dark:border-navy-800 text-xs space-y-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Security & Confidentiality Note:</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Scanning students are securely routed through institutional SSO. Their identity is strictly hidden from faculty and maintenance technicians.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    isLoading={creating}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Generate Printable QR Placard
                  </Button>
                </CardContent>
              </form>
            </Card>

            {/* List of Previous QR Placards */}
            <Card>
              <CardHeader className="border-b border-slate-100 dark:border-navy-800">
                <CardTitle className="text-sm font-bold text-navy-950 dark:text-white">
                  Active QR Deployments ({qrCodes.length})
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-slate-100 dark:divide-navy-800 max-h-96 overflow-y-auto">
                {qrCodes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setPrintPlacard(item)}
                    className={`p-3.5 text-xs cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-navy-900 ${
                      printPlacard?.id === item.id
                        ? "bg-primary-50/60 dark:bg-primary-950/40 border-l-4 border-l-primary-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {item.scan_count} scans
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.building} • {item.room}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(item.target_url, item.id);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:underline"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied URL</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      {item.qr_data_url && (
                        <a
                          href={item.qr_data_url}
                          download={`placard-${item.id}.png`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                          <Download className="w-3 h-3" />
                          <span>PNG</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Area: High-Fidelity Printable Physical Placard Preview */}
          <div className="lg:col-span-7">
            {printPlacard ? (
              <div className="bg-white text-navy-950 p-8 sm:p-12 rounded-3xl border-4 border-navy-950 shadow-2xl space-y-6 max-w-xl mx-auto print:max-w-none print:shadow-none print:border-none print:p-0">
                {/* Institutional Placard Header */}
                <div className="text-center pb-6 border-b-2 border-navy-950">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-950 text-white mb-3 shadow-md">
                    <Sparkles className="w-8 h-8 text-sky-300" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-navy-950">
                    National Institute of Technology
                  </h2>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-700 mt-1">
                    Student Query & Maintenance Resolution Desk
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official Physical Placard — Scan to Report an Issue or Breakdown
                  </p>
                </div>

                {/* Placard Title */}
                <div className="text-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Designated Location Point
                  </span>
                  <h3 className="text-lg font-black text-navy-950 mt-0.5">
                    {printPlacard.title}
                  </h3>
                  <div className="flex items-center justify-center gap-3 mt-1 text-xs font-bold text-primary-800">
                    <span>{printPlacard.building || "Campus"}</span>
                    {printPlacard.room && <span>• {printPlacard.room}</span>}
                  </div>
                </div>

                {/* Central QR Code Display */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-300">
                  {printPlacard.qr_data_url ? (
                    <img
                      src={printPlacard.qr_data_url}
                      alt="Physical Location QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl shadow-md border-4 border-white bg-white"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                      Generating QR...
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <p className="text-sm font-black text-navy-950 uppercase tracking-tight">
                      Point Phone Camera to Scan
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      No app required. Opens institutional confidential portal immediately.
                    </p>
                  </div>
                </div>

                {/* Confidentiality & Security Guarantee */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-extrabold uppercase tracking-wide text-emerald-900">
                      100% Student Confidentiality Guaranteed
                    </p>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                      Your identity is cryptographically protected. Technicians and faculty only receive the facility issue description and location details.
                    </p>
                  </div>
                </div>

                {/* Placard Actions Bar (Hidden on Print) */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 print:hidden">
                  <div className="text-[11px] text-slate-400">
                    Configuration ID: {printPlacard.id}
                  </div>
                  <div className="flex items-center gap-2">
                    {printPlacard.qr_data_url && (
                      <a
                        href={printPlacard.qr_data_url}
                        download={`placard-${printPlacard.id}.png`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PNG</span>
                      </a>
                    )}
                    <Button
                      onClick={handlePrint}
                      className="bg-navy-950 hover:bg-navy-900 text-white"
                      size="sm"
                    >
                      <Printer className="w-4 h-4 mr-1.5" />
                      Print High-Res Placard
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500">
                  Select or create a QR deployment to preview printable placard.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
