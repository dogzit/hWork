"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type HworkItem = {
  id: string;
  title: string;
  subject: string;
  date: string;
  image: string | null;
  images?: string[] | null;
};

// ISO огноог YYYY-MM-DD форматруу
function ymd(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Огноог текстээр харуулах
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

// Долоо хоногийн өдөр
function getDayOfWeek(ymdStr: string) {
  const d = new Date(ymdStr + "T00:00:00");
  const days = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
  return days[d.getDay()];
}

// Даалгавраас бүх зургуудыг авах
function getImages(x: HworkItem): string[] {
  const arr = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
  const one =
    typeof x.image === "string" && x.image.trim() ? [x.image.trim()] : [];
  return Array.from(new Set([...arr, ...one]));
}

export default function HomeworkTimelinePage() {
  const router = useRouter();

  const [data, setData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");

  // Хичээлүүдийн жагсаалт
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

  // Шүүсэн өгөгдөл
  const filtered = useMemo(() => {
    return data.filter((x) => {
      const subjOk =
        subjectFilter === "ALL" ? true : x.subject === subjectFilter;
      return subjOk;
    });
  }, [data, subjectFilter]);

  // Өдрөөр бүлэглэсэн даалгаврууд
  const groupedByDate = useMemo(() => {
    const groups: Record<string, HworkItem[]> = {};

    for (const item of filtered) {
      const dateKey = ymd(item.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    }

    // Огноогоор эрэмбэлэх (шинээс хуучин)
    const sorted = Object.entries(groups).sort((a, b) =>
      b[0].localeCompare(a[0]),
    );

    return sorted;
  }, [filtered]);

  // Бүх даалгаврыг унших
  const fetchAll = async () => {
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
    fetchAll();
  }, []);

  // Тухайн өдрийн даалгаврын хуудас руу шилжих
  const navigateToDate = (dateKey: string) => {
    router.push(`/homeWork/${dateKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Толгой хэсэг */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8">
            <button
              onClick={() => router.push("/")}
              className="mb-4 flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Буцах
            </button>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Даалгаврын хуваарь
                </h1>
                <p className="text-blue-100">Өдрөөр бүлэглэсэн даалгаврууд</p>
              </div>
              <button
                onClick={fetchAll}
                disabled={loading}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border border-white/20 disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Уншиж байна..." : "Шинэчлэх"}
              </button>
            </div>
          </div>

          {/* Шүүлт */}
          <div className="p-6 border-b border-slate-200">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-red-700 flex-1">{error}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  🎯 Хичээл:
                </span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-slate-700 font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s === "ALL" ? "📚 Бүх хичээл" : s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl px-6 py-3 flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-slate-600">
                  Нийт өдөр:{" "}
                  <span className="font-bold text-blue-600 text-lg ml-1">
                    {groupedByDate.length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Өдрөөр бүлэглэсэн timeline */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-6 text-slate-500 text-lg">Уншиж байна...</p>
          </div>
        ) : groupedByDate.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-dashed border-slate-200">
            <svg
              className="mx-auto h-20 w-20 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-6 text-slate-500 text-lg font-medium">
              Даалгавар олдсонгүй
            </p>
            <p className="mt-2 text-slate-400 text-sm">
              Сонгосон хичээлд даалгавар байхгүй байна
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByDate.map(([dateKey, items]) => {
              const firstImg = items.find((x) => getImages(x).length > 0);
              const previewImage = firstImg ? getImages(firstImg)[0] : null;

              return (
                <div
                  key={dateKey}
                  onClick={() => navigateToDate(dateKey)}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-slate-200 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Зүүн тал: Огноо ба статистик */}
                    <div className="sm:w-72 bg-gradient-to-br from-blue-600 to-purple-600 p-8 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white mb-4">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {getDayOfWeek(dateKey)}
                        </div>

                        <div className="text-6xl font-bold text-white mb-2">
                          {dateKey.split("-")[2]}
                        </div>

                        <div className="text-blue-100 text-sm">
                          {formatDateDisplay(dateKey)}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-sm">Даалгавар</span>
                          </div>
                          <span className="text-3xl font-bold">
                            {items.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Баруун тал: Даалгаврын мэдээлэл */}
                    <div className="flex-1 p-8">
                      <div className="flex items-start gap-6">
                        {/* Даалгаврын жагсаалт */}
                        <div className="flex-1 space-y-3">
                          {items.slice(0, 3).map((item, idx) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-200"
                              style={{ transitionDelay: `${idx * 50}ms` }}
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-sm group-hover:bg-blue-200 transition-colors">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    {item.subject}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                                  {item.title}
                                </p>
                              </div>
                            </div>
                          ))}

                          {items.length > 3 && (
                            <div className="text-sm text-slate-500 italic pl-11">
                              +{items.length - 3} өөр даалгавар...
                            </div>
                          )}
                        </div>

                        {/* Preview зураг */}
                        {previewImage && (
                          <div className="hidden lg:block flex-shrink-0">
                            <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 group-hover:border-blue-300 transition-colors shadow-md">
                              <img
                                src={previewImage}
                                alt="preview"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Дэлгэрэнгүй харах товч */}
                      <div className="mt-6 flex items-center justify-end">
                        <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700 font-medium text-sm group-hover:gap-3 transition-all">
                          <span>Дэлгэрэнгүй харах</span>
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
