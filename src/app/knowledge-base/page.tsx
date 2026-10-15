"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, ArrowRight, Sparkles, Tag, ChevronRight, HelpCircle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KnowledgeBaseArticle } from "@/types";

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/knowledge-base")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.articles) {
          setArticles(data.articles);
        }
      })
      .catch((err) => console.error("Failed to load knowledge base", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["ALL", ...Array.from(new Set(articles.map((a) => a.department_name || a.category_name || "General")))];

  const filtered = articles.filter((a) => {
    const categoryName = a.department_name || a.category_name || "General";
    if (activeCategory !== "ALL" && categoryName !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchContent = a.content.toLowerCase().includes(q);
      const matchTag = a.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  return (
    <AppShell initialRole="STUDENT">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6 space-y-2">
          <Badge variant="info">Verified Academic Solutions</Badge>
          <h1 className="text-3xl font-black text-navy-950 dark:text-white tracking-tight">
            Institutional Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Find answers to frequently asked university questions, regulatory guidelines, and support procedures
          </p>

          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-6" />
            <input
              type="text"
              placeholder="Search by keywords: medical, fees, wifi, hall ticket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory === cat
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
              <p className="text-xs text-slate-500">Loading verified institutional knowledge base...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-navy-950">No articles matched your search</h3>
              <p className="text-xs text-slate-500">
                Can&apos;t find what you are looking for? Submit a direct query to the faculty workdesk.
              </p>
              <Link href="/student/new-query" className="inline-block pt-2">
                <Button size="sm">Submit New Query</Button>
              </Link>
            </div>
          ) : (
            filtered.map((art) => (
              <Card key={art.id} className="hover:border-primary-400 transition-all shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                      {art.department_name || art.category_name || "General Guidelines"}
                    </span>
                    <span className="text-[11px] text-slate-400">{art.view_count || 0} students viewed</span>
                  </div>

                  <h3 className="font-bold text-base text-navy-950">{art.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{art.content}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    {art.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
