"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  BookOpen,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

type HworkItem = {
  id: string;
  title: string;
  subject: string;
  date: string;
  image: string | null;
  images?: string[] | null;
};

function ymd(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateDisplay(ymdStr: string) {
  const [year, month, day] = ymdStr.split("-");
  const months = [
    "1-р сар",
    "2-р сар",
    "3-р сар",
    "4-р сар",
    "5-р сар",
    "6-р сар",
    "7-р сар",
    "8-р сар",
    "9-р сар",
    "10-р сар",
    "11-р сар",
    "12-р сар",
  ];
  return `${year} оны ${months[parseInt(month) - 1]} ${parseInt(day)}`;
}

function getDayOfWeek(ymdStr: string) {
  const d = new Date(ymdStr + "T00:00:00");
  const days = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
  return days[d.getDay()];
}

function getImages(x: HworkItem): string[] {
  const arr = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
  const one =
    typeof x.image === "string" && x.image.trim() ? [x.image.trim()] : [];
  return Array.from(new Set([...arr, ...one]));
}

// Subject accent colors (dark theme)
const SUBJECT_COLORS: Record<
  string,
  { gradient: string; text: string; bg: string; border: string }
> = {
  Математик: {
    gradient: "from-blue-500 to-cyan-500",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Физик: {
    gradient: "from-violet-500 to-purple-500",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  Хими: {
    gradient: "from-emerald-500 to-teal-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  Биологи: {
    gradient: "from-green-500 to-lime-500",
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  "Англи хэл": {
    gradient: "from-rose-500 to-pink-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  "Монгол хэл": {
    gradient: "from-orange-500 to-amber-500",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  Түүх: {
    gradient: "from-amber-500 to-yellow-500",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  default: {
    gradient: "from-gray-500 to-slate-500",
    text: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
};

function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
}

export default function HomeworkTimelinePage() {
  const router = useRouter();
  const [data, setData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("ALL");

  const subjects = useMemo(() => {
    const s = new Set<string>();
    for (const x of data) s.add((x.subject || "").trim());
    return [
      "ALL",
      ...Array.from(s)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [data]);

  const filtered = useMemo(
    () =>
      data.filter(
        (x) => subjectFilter === "ALL" || x.subject === subjectFilter,
      ),
    [data, subjectFilter],
  );

  const groupedByDate = useMemo(() => {
    const groups: Record<string, HworkItem[]> = {};
    for (const item of filtered) {
      const key = ymd(item.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/hwork", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = (await res.json()) as HworkItem[];
      setData(json);
      if (silent)
        toast.success("Даалгаврууд шинэчлэгдлээ ✨", { duration: 2000 });
    } catch (e) {
      console.error(e);
      toast.error("Даалгаврыг ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const navigateToDate = (dateKey: string) => {
    toast.info(`${formatDateDisplay(dateKey)} харж байна...`, {
      duration: 1000,
    });
    setTimeout(() => router.push(`/homeWork/${dateKey}`), 300);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[140px] opacity-15 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-[140px] opacity-15 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-violet-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-10" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
          >
            <ArrowLeft
              size={24}
              className="group-hover:text-pink-400 transition-colors"
            />
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
              Даалгаврын хуваарь
            </h1>
            <p className="text-gray-400 text-sm italic flex items-center justify-end gap-1 mt-1">
              <Calendar size={12} />
              Өдрөөр бүлэглэсэн
            </p>
          </div>
        </div>

        {/* Filter + Refresh */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-4 mb-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Хичээл шүүх
            </span>
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10
                hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95
                transition-all duration-200 text-xs text-gray-300
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Шинэчлэх
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {subjects.map((s) => {
              const active = subjectFilter === s;
              const c = getSubjectColor(s);
              return (
                <button
                  key={s}
                  onClick={() => {
                    setSubjectFilter(s);
                    if (s !== "ALL")
                      toast.info(`${s} шүүж байна`, { duration: 1200 });
                  }}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold border transition-all duration-200
                    hover:scale-105 active:scale-95 flex-shrink-0
                    ${
                      active
                        ? `bg-gradient-to-r ${c.gradient} text-white border-transparent shadow-lg`
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20"
                    }`}
                >
                  {s === "ALL" ? "📚 Бүгд" : s}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <BookOpen size={12} className="text-gray-600" />
            <span className="text-xs text-gray-600">
              {groupedByDate.length} өдөр • {filtered.length} даалгавар
            </span>
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-pink-500" size={32} />
            <p className="text-gray-400">Ачаалж байна...</p>
          </div>
        ) : groupedByDate.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-3xl">
            <div className="text-5xl mb-4 opacity-30">📭</div>
            <p className="text-gray-500">Даалгавар олдсонгүй</p>
            <p className="text-gray-600 text-sm mt-1">
              Сонгосон хичээлд даалгавар байхгүй байна
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedByDate.map(([dateKey, items], groupIdx) => {
              const subjectSet = new Set(
                items.map((x) => (x.subject || "").trim()).filter(Boolean),
              );
              const previewImg = items.find((x) => getImages(x).length > 0);
              const preview = previewImg ? getImages(previewImg)[0] : null;
              const dayLabel = getDayOfWeek(dateKey);
              const dayNum = dateKey.split("-")[2];

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => navigateToDate(dateKey)}
                  className="w-full text-left group rounded-2xl border border-white/8 bg-white/[0.03]
                    hover:bg-white/[0.06] hover:border-white/15 hover:scale-[1.01]
                    active:scale-[0.99] transition-all duration-200 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* Date badge — left column */}
                    <div className="w-20 flex-shrink-0 bg-gradient-to-b from-pink-600/20 to-orange-600/20 border-r border-white/5 flex flex-col items-center justify-center py-5 gap-1">
                      <span className="text-3xl font-black text-white leading-none">
                        {dayNum}
                      </span>
                      <span className="text-[10px] font-bold text-pink-400/80 uppercase tracking-wider">
                        {dayLabel}
                      </span>
                      <span className="text-[9px] text-gray-600 mt-0.5">
                        {dateKey.split("-")[1]}-р сар
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-5 py-4 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {formatDateDisplay(dateKey)}
                          </p>
                          {/* Subject pills */}
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from(subjectSet)
                              .slice(0, 4)
                              .map((subj) => {
                                const c = getSubjectColor(subj);
                                return (
                                  <span
                                    key={subj}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}
                                  >
                                    {subj}
                                  </span>
                                );
                              })}
                            {subjectSet.size > 4 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-white/5 text-gray-500 border-white/10">
                                +{subjectSet.size - 4}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Preview image */}
                        {preview && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-white/20 transition-colors">
                            <img
                              src={preview}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>

                      {/* Task list preview */}
                      <div className="space-y-1.5">
                        {items.slice(0, 2).map((item, i) => {
                          const c = getSubjectColor(item.subject);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${c.gradient} flex-shrink-0`}
                              />
                              <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                                {item.title}
                              </p>
                            </div>
                          );
                        })}
                        {items.length > 2 && (
                          <p className="text-[10px] text-gray-600 pl-3.5">
                            +{items.length - 2} дахь даалгавар...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center pr-4">
                      <ChevronRight
                        size={16}
                        className="text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
