"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Даалгаврын төрөл
type HworkItem = {
  id: string;
  subject: string;
  title: string;
  date: string;
  image: string | null;
  images?: string[] | null;
};

// ISO огноог YYYY-MM-DD форматруу хөрвүүлэх
function ymd(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Огноог текстээр харуулах (жишээ: 2026-02-05)
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
  const days = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];
  return days[d.getDay()];
}

// Даалгавраас бүх зургуудыг авах
function getImages(x: HworkItem): string[] {
  const arr = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
  const one =
    typeof x.image === "string" && x.image.trim() ? [x.image.trim()] : [];
  return Array.from(new Set([...arr, ...one]));
}

export default function AdminHomeworkPage() {
  const router = useRouter();

  // Үндсэн өгөгдөл
  const [data, setData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Хайлт болон шүүлт
  const [q, setQ] = useState("");
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
    const qq = q.trim().toLowerCase();
    return data.filter((x) => {
      const subjOk =
        subjectFilter === "ALL" ? true : x.subject === subjectFilter;
      if (!subjOk) return false;
      if (!qq) return true;
      const hay = `${x.subject} ${x.title}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [data, q, subjectFilter]);

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
      setErr("");
      const res = await fetch("/api/hwork", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = (await res.json()) as HworkItem[];
      setData(json);
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Тухайн өдрийн даалгаврын хуудас руу шилжих
  const navigateToDate = (dateKey: string) => {
    router.push(`/admin/homework/${dateKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Толгой хэсэг */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <button
              onClick={() => router.push("/admin")}
              className="mb-3 flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
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
                <h1 className="text-3xl font-bold text-white">
                  Даалгаврын хуваарь
                </h1>
                <p className="mt-2 text-indigo-100">
                  Өдрөөр бүлэглэсэн даалгаврууд
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAll}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-white/20"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Шинэчлэх
                </button>
                <button
                  onClick={() => router.push("/admin/homework/add")}
                  className="bg-white hover:bg-slate-50 text-indigo-600 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Шинэ нэмэх
                </button>
              </div>
            </div>
          </div>

          {/* Хайлт болон шүүлт */}
          <div className="p-6 border-b border-slate-200">
            {err && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-red-700 flex-1">{err}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Хайх..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "Бүх хичээл" : s}
                  </option>
                ))}
              </select>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg px-4 py-3 flex items-center justify-center">
                <span className="text-sm text-slate-600">
                  Нийт өдөр:{" "}
                  <span className="font-bold text-indigo-600 text-lg">
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
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <p className="mt-6 text-slate-500 text-lg">Уншиж байна...</p>
          </div>
        ) : groupedByDate.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-slate-200">
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
              Хайлтын үр дүн хоосон байна
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
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Зүүн тал: Огноо ба статистик */}
                    <div className="sm:w-72 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white mb-4">
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

                        <div className="text-5xl font-bold text-white mb-2">
                          {dateKey.split("-")[2]}
                        </div>

                        <div className="text-indigo-100 text-sm">
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
                          <span className="text-2xl font-bold">
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
                              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm group-hover:bg-indigo-200 transition-colors">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                    {item.subject}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 line-clamp-2">
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
                            <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-indigo-300 transition-colors shadow-md">
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
                        <div className="flex items-center gap-2 text-indigo-600 group-hover:text-indigo-700 font-medium text-sm group-hover:gap-3 transition-all">
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
