"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  MapPin,
  Building2,
  ArrowRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getProductionAppUrl } from "@/lib/utils";

const LOCATION_PRESETS = [
  { label: "General Campus (All Issues)", building: "", room: "" },
  { label: "Aryabhata Academic Complex — Room 302", building: "Aryabhata Academic Complex", room: "Room 302" },
  { label: "Ramanujan Computer Lab — Lab 4", building: "Ramanujan Computer Center", room: "Lab 4" },
  { label: "Kalam Residential Hostel — Block B", building: "Kalam Residential Hostel", room: "Room B-112" },
];

export function FrontPageQRSection() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const baseUrl = getProductionAppUrl();
    const preset = LOCATION_PRESETS[selectedPreset];
    const params = new URLSearchParams();

    if (preset.building) params.set("building", preset.building);
    if (preset.room) params.set("room", preset.room);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const finalUrl = `${baseUrl}/student/new-query${queryStr}`;
    setTargetUrl(finalUrl);

    QRCode.toDataURL(finalUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0b192c",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [selectedPreset]);

  const handleCopyLink = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPlacard = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    const preset = LOCATION_PRESETS[selectedPreset];
    const filename = preset.building
      ? `SQRP-Placard-${preset.building.replace(/\s+/g, "_")}.png`
      : "SQRP-Campus-Placard.png";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section id="qr-scan" className="py-20 bg-gradient-to-b from-white via-primary-50/30 to-slate-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 border-b border-slate-200 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
            <QrCode className="w-3.5 h-3.5 text-primary-600" />
            <span>Instant Mobile Placard Access</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-950 dark:text-white tracking-tight">
            Scan to Submit Confidential Issue
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Students scan physical QR placards located in classrooms, labs, dormitories, and library halls to log queries on the spot. Identity is 100% confidential.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* QR Code Placard Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <Card className="p-6 bg-white dark:bg-slate-900 border-2 border-primary-200 dark:border-primary-800/60 shadow-xl rounded-3xl max-w-sm w-full text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600" />

              {/* Placard Title */}
              <div className="mb-4">
                <span className="text-[10px] font-extrabold tracking-widest text-primary-700 uppercase bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200 inline-block mb-1">
                  National Institute of Technology
                </span>
                <h3 className="text-base font-black text-navy-950 dark:text-white tracking-tight">
                  Student Query Resolution Desk
                </h3>
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>100% Confidential • Automated AI Triage</span>
                </p>
              </div>

              {/* QR Code Canvas Frame */}
              <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 inline-block mx-auto shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="SQRP Confidential Query Submission QR Code"
                    className="w-56 h-56 mx-auto rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                    Generating scannable QR...
                  </div>
                )}
              </div>

              {/* Location Tag */}
              <div className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span className="truncate">
                  {LOCATION_PRESETS[selectedPreset].building
                    ? `${LOCATION_PRESETS[selectedPreset].building} (${LOCATION_PRESETS[selectedPreset].room})`
                    : "Universal Campus Submission Portal"}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Scan with phone camera</span>
                <span className="text-primary-600 font-bold">SQRP v2.6</span>
              </div>
            </Card>
          </div>

          {/* Right Side: Preset Selector & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-navy-950 dark:text-white">
                Interactive Campus Placard Generator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Test location prefilling or download print-ready placards for university premises. When students scan this QR code, their classroom or facility room is automatically prefilled.
              </p>

              {/* Location Preset Selector Buttons */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Select Facility Zone Placard:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LOCATION_PRESETS.map((p, idx) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSelectedPreset(idx)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition ${
                        selectedPreset === idx
                          ? "bg-primary-50 border-primary-400 text-primary-950 ring-2 ring-primary-500/20 font-bold shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Building2 className={`w-3.5 h-3.5 ${selectedPreset === idx ? "text-primary-600" : "text-slate-400"}`} />
                        <span className="truncate">{p.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-by-step mobile scan flow */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary-600" />
                <span>3-Step Quick Mobile Workflow</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-primary-600 block text-[11px]">Step 1</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    Scan with any smartphone camera or QR reader.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-primary-600 block text-[11px]">Step 2</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    Type issue, select category, or let AI auto-route.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-primary-600 block text-[11px]">Step 3</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                    Receive unique tracking ticket number immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadPlacard}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Placard (PNG)
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleCopyLink}
                leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              >
                {copiedLink ? "Link Copied!" : "Copy Submission Link"}
              </Button>

              <Link href="/student/new-query">
                <Button variant="ghost" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Submit on Desktop
                </Button>
              </Link>

              <Link href="/track">
                <Button variant="ghost" size="md" leftIcon={<Search className="w-4 h-4" />}>
                  Track Existing Query
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
