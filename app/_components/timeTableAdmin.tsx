"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type Day = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

type TimetableItem = {
  id: string;
  day: Day;
  lessonNumber: number;
  subject: string;
  createdAt: string;
};

type Props = {
  endpoint?: string;
  maxLessons?: number;
};

const DAYS_ORDER: Day[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const DAY_LABELS: Record<Day, string> = {
  MONDAY: "Даваа",
  TUESDAY: "Мягмар",
  WEDNESDAY: "Лхагва",
  THURSDAY: "Пүрэв",
  FRIDAY: "Баасан",
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function TimetableAdminBoard({
  endpoint = "/api/timetable",
  maxLessons,
}: Props) {
  const [data, setData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeDay, setActiveDay] = useState<Day>("MONDAY");

  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const grid = useMemo(() => {
    const m = new Map<string, TimetableItem>();
    for (const it of data) m.set(`${it.day}-${it.lessonNumber}`, it);
    return m;
  }, [data]);

  const maxLessonComputed = useMemo(() => {
    if (typeof maxLessons === "number" && maxLessons > 0) return maxLessons;
    const m = data.reduce((acc, x) => Math.max(acc, x.lessonNumber), 0);
    return Math.max(m, 7);
  }, [data, maxLessons]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = (await res.json()) as TimetableItem[];
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
  }, [endpoint]);

  const startEdit = (day: Day, lessonNumber: number) => {
    const key = `${day}-${lessonNumber}`;
    setEditKey(key);
    setEditValue(grid.get(key)?.subject ?? "");
  };

  const cancelEdit = () => {
    setEditKey(null);
    setEditValue("");
  };

  const saveCell = async (day: Day, lessonNumber: number) => {
    const subject = editValue.trim();
    if (!subject) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ day, lessonNumber, subject }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Save failed: ${res.status}`);
      }

      const saved = (await res.json()) as TimetableItem;

      setData((prev) => {
        const idx = prev.findIndex(
          (x) => x.day === day && x.lessonNumber === lessonNumber,
        );
        if (idx === -1) return [...prev, saved];
        const copy = prev.slice();
        copy[idx] = saved;
        return copy;
      });

      cancelEdit();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Save error");
    } finally {
      setSaving(false);
    }
  };

  const dayItems = useMemo(() => {
    return Array.from({ length: maxLessonComputed }, (_, i) => i + 1).map(
      (lessonNumber) => ({
        lessonNumber,
        item: grid.get(`${activeDay}-${lessonNumber}`),
      }),
    );
  }, [activeDay, grid, maxLessonComputed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Толгой хэсэг */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <button
              onClick={() => router.push("/admin")}
              className="mb-3  hover:cursor-pointer flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
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
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Хичээлийн хуваарь
                </h2>
                <p className="mt-1 text-blue-100">
                  Нүд дээр дарж засах • Enter хадгалах • Esc болих
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Алдааны мессеж */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
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
                <span className="text-sm text-red-700 flex-1">{error}</span>
              </div>
            )}

            {/* Өдрийн сонголт */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Өдөр сонгох
                </h3>
                <button
                  onClick={fetchAll}
                  disabled={loading}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
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
              </div>

              <div className="grid grid-cols-5 gap-2">
                {DAYS_ORDER.map((d) => {
                  const active = d === activeDay;
                  return (
                    <button
                      key={d}
                      onClick={() => setActiveDay(d)}
                      className={cn(
                        "px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200",
                        active
                          ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg scale-105"
                          : "bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50",
                      )}
                    >
                      {DAY_LABELS[d]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Хичээлийн жагсаалт */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                <p className="mt-6 text-slate-500 text-lg">Уншиж байна...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayItems.map(({ lessonNumber, item }) => {
                  const key = `${activeDay}-${lessonNumber}`;
                  const isEditing = editKey === key;

                  return (
                    <div
                      key={lessonNumber}
                      className={cn(
                        "group rounded-xl border-2 transition-all duration-200",
                        item
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-slate-200",
                        isEditing
                          ? "border-blue-500 shadow-lg"
                          : "hover:border-blue-300",
                      )}
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Дугаар */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {lessonNumber}
                          </div>

                          {/* Агуулга */}
                          {!isEditing ? (
                            <button
                              className="text-left flex-1 min-w-0 group"
                              onClick={() => startEdit(activeDay, lessonNumber)}
                              type="button"
                            >
                              <div className="text-base font-semibold text-slate-900 mb-1">
                                {item?.subject ?? (
                                  <span className="text-slate-400 italic">
                                    Хичээл байхгүй
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                <span className="group-hover:text-blue-600 transition-colors">
                                  Дарж засах
                                </span>
                              </div>
                            </button>
                          ) : (
                            <div className="flex-1 min-w-0 space-y-3">
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") cancelEdit();
                                  if (e.key === "Enter")
                                    saveCell(activeDay, lessonNumber);
                                }}
                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 font-medium"
                                placeholder="Хичээлийн нэр..."
                                disabled={saving}
                              />

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={cancelEdit}
                                  disabled={saving}
                                  className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                  Болих
                                </button>
                                <button
                                  onClick={() =>
                                    saveCell(activeDay, lessonNumber)
                                  }
                                  disabled={saving || !editValue.trim()}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {saving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Хадгалж байна...
                                    </>
                                  ) : (
                                    <>
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
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      Хадгалах
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Edit icon */}
                          {!isEditing && item && (
                            <div className="hidden group-hover:flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg transition-all">
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Статистик */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
            <p className="text-sm text-slate-600 mb-1">Идэвхтэй өдөр</p>
            <p className="text-xl font-bold text-slate-900">
              {DAY_LABELS[activeDay]}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">Бүртгэлтэй</p>
            <p className="text-xl font-bold text-slate-900">
              {dayItems.filter((x) => x.item).length} / {maxLessonComputed}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-600 mb-1">Нийт цаг</p>
            <p className="text-xl font-bold text-slate-900">
              {maxLessonComputed}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
