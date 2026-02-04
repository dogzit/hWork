"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type HworkItem = {
  id: string;
  title: string;
  subject: string;
  image: string | null;
  date: string;
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const subjectColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Математик: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Физик: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Хими: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  Биологи: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "Англи хэл": {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  "Монгол хэл": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  Түүх: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  default: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
};

function getSubjectColor(subject: string) {
  return subjectColors[subject] || subjectColors.default;
}

export default function HomeworkPage() {
  const router = useRouter();

  const [data, setData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState<string>("ALL");

  const subjects = useMemo(() => {
    const set = new Set<string>();
    for (const x of data) set.add(x.subject);
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [data]);

  const filtered = useMemo(() => {
    if (subject === "ALL") return data;
    return data.filter((x) => x.subject === subject);
  }, [data, subject]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, HworkItem[]>();

    for (const x of filtered) {
      const d = new Date(x.date);
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(x);
    }

    const entries = Array.from(map.entries()).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );

    for (const [, arr] of entries) {
      arr.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }

    return entries;
  }, [filtered]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/hwork", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = (await res.json()) as HworkItem[];
      setData(json);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-8 rounded-3xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span
                className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-black transition w-fit"
                onClick={() => router.push("/")}
              >
                ← Back
              </span>
              <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Даалгаврууд
              </h1>
              <p className="mt-2 text-slate-600">
                Ангийн хичээлийн даалгаврын жагсаалт
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/timeTable")}
                className="group rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 active:scale-95"
              >
                <span className="flex items-center gap-2">
                  📅 Цагийн хуваарь
                </span>
              </button>

              <button
                onClick={fetchHomework}
                disabled={loading}
                className="group rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {loading ? "⏳" : "🔄"} Шинэчлэх
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">
                🎯 Хичээл:
              </span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "📚 Бүгд" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2">
              <span className="text-sm text-slate-600">Нийт:</span>
              <span className="text-lg font-bold text-blue-600">
                {filtered.length}
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-6 animate-shake rounded-2xl border-2 border-red-200 bg-red-50 p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="text-sm font-medium text-red-700">{error}</span>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-white/80 p-6 shadow-md"
              >
                <div className="mb-3 h-6 w-1/3 rounded-lg bg-slate-200" />
                <div className="h-4 w-2/3 rounded-lg bg-slate-200" />
                <div className="mt-4 h-48 w-full rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl bg-white/80 p-12 text-center shadow-lg">
            <div className="text-6xl">📝</div>
            <p className="mt-4 text-lg font-medium text-slate-600">
              Одоогоор даалгавар байхгүй байна
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Шинэ даалгавар нэмэхийг хүлээж байна
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByDay.map(([dayKey, items]) => (
              <div key={dayKey} className="space-y-4">
                <div className="sticky top-3 z-10 rounded-2xl bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-800">
                      📅 {formatDate(dayKey)}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {items.length} даалгавар
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {items.map((x, index) => {
                    const colors = getSubjectColor(x.subject);
                    return (
                      <div
                        key={x.id}
                        className="group overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.06}s both`,
                        }}
                      >
                        <div
                          className={cn(
                            "border-b-2 p-6 transition-colors duration-300",
                            colors.border,
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition-transform duration-300 group-hover:scale-[1.02]",
                                    colors.bg,
                                    colors.text,
                                  )}
                                >
                                  {x.subject}
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-300 group-hover:bg-slate-200">
                                  🕒 {formatTime(x.date)}
                                </span>
                              </div>

                              <h3 className="whitespace-pre-line text-lg font-semibold leading-relaxed text-slate-800 transition-colors duration-300 group-hover:text-slate-900">
                                {x.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {x.image ? (
                          <div className="relative overflow-hidden bg-slate-100">
                            <img
                              src={x.image}
                              alt="homework"
                              className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </div>
                        ) : null}

                        <div className="bg-slate-50/50 px-6 py-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-slate-500">
                              📅 {new Date(x.date).toLocaleString("mn-MN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
