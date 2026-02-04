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
  title?: string;
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

const DAY_COLORS: Record<Day, string> = {
  MONDAY: "from-blue-500 to-blue-600",
  TUESDAY: "from-purple-500 to-purple-600",
  WEDNESDAY: "from-pink-500 to-pink-600",
  THURSDAY: "from-orange-500 to-orange-600",
  FRIDAY: "from-green-500 to-green-600",
};

const DAY_LIGHT_BG: Record<Day, string> = {
  MONDAY: "bg-blue-50 border-blue-200",
  TUESDAY: "bg-purple-50 border-purple-200",
  WEDNESDAY: "bg-pink-50 border-pink-200",
  THURSDAY: "bg-orange-50 border-orange-200",
  FRIDAY: "bg-green-50 border-green-200",
};

const DAY_HOVER: Record<Day, string> = {
  MONDAY: "hover:border-blue-400 hover:bg-blue-100",
  TUESDAY: "hover:border-purple-400 hover:bg-purple-100",
  WEDNESDAY: "hover:border-pink-400 hover:bg-pink-100",
  THURSDAY: "hover:border-orange-400 hover:bg-orange-100",
  FRIDAY: "hover:border-green-400 hover:bg-green-100",
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function getTodayDay(): Day {
  const d = new Date().getDay();
  if (d === 1) return "MONDAY";
  if (d === 2) return "TUESDAY";
  if (d === 3) return "WEDNESDAY";
  if (d === 4) return "THURSDAY";
  return "FRIDAY";
}

export default function TimetableStudentView({
  endpoint = "/api/timetable",
  maxLessons,
  title = "Миний хичээлийн хуваарь",
}: Props) {
  const [data, setData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = useMemo(() => getTodayDay(), []);
  const [activeDay, setActiveDay] = useState<Day>(today);

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
  const { push } = useRouter();
  useEffect(() => {
    fetchAll();
  }, [endpoint]);

  const dayRows = useMemo(() => {
    return Array.from({ length: maxLessonComputed }, (_, i) => i + 1).map(
      (lessonNumber) => ({
        lessonNumber,
        subject: grid.get(`${activeDay}-${lessonNumber}`)?.subject ?? "",
      }),
    );
  }, [activeDay, grid, maxLessonComputed]);

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const isSchoolTime = currentHour >= 8 && currentHour < 16;
  const currentLesson = isSchoolTime
    ? Math.min(Math.floor((currentHour - 8) / 1) + 1, maxLessonComputed)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span
              className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-black transition w-fit"
              onClick={() => push("/")}
            >
              ← Back
            </span>
            <h1 className="mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
              {title}
            </h1>
            <p className="flex items-center gap-2 text-slate-600">
              <svg
                className="h-5 w-5 text-indigo-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Өнөөдрийн өдөр автоматаар сонгогдоно
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 animate-shake rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <svg
                className="h-6 w-6 flex-shrink-0 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3">
          {DAYS_ORDER.map((d) => {
            const active = d === activeDay;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-2xl px-6 py-3 font-semibold shadow-lg transition-all duration-300",
                  active
                    ? `bg-gradient-to-r ${DAY_COLORS[d]} text-white scale-110 shadow-xl`
                    : "bg-white text-slate-700 hover:scale-105 hover:shadow-xl",
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {DAY_LABELS[d]}
                  {isToday && (
                    <span className="animate-pulse rounded-full bg-white/30 px-2 py-0.5 text-xs">
                      Өнөөдөр
                    </span>
                  )}
                </span>
                {!active && (
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-10",
                      DAY_COLORS[d],
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div
            className={cn(
              "flex items-center justify-between bg-gradient-to-r px-8 py-6",
              DAY_COLORS[activeDay],
            )}
          >
            <div>
              <div className="mb-1 text-sm font-medium text-white/80">
                Сонгосон өдөр
              </div>
              <div className="flex items-center gap-3 text-3xl font-bold text-white">
                {DAY_LABELS[activeDay]}
                {activeDay === today && (
                  <span className="animate-pulse rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                    Өнөөдөр
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="text-lg font-medium text-slate-600">
                Ачааллаж байна...
              </p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dayRows.map((r) => {
                  const isCurrentLesson =
                    activeDay === today && currentLesson === r.lessonNumber;
                  const hasSubject = !!r.subject;

                  return (
                    <div
                      key={r.lessonNumber}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300",
                        isCurrentLesson
                          ? "scale-105 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-xl shadow-yellow-200 ring-4 ring-yellow-300/50"
                          : hasSubject
                            ? cn(
                                "cursor-default shadow-md",
                                DAY_LIGHT_BG[activeDay],
                                DAY_HOVER[activeDay],
                              )
                            : "cursor-default border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 shadow-sm",
                      )}
                    >
                      {isCurrentLesson && (
                        <div className="absolute right-3 top-3">
                          <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900 shadow-lg">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-600 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-600"></span>
                            </span>
                            Одоо
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-lg transition-transform group-hover:scale-110",
                            isCurrentLesson
                              ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                              : hasSubject
                                ? cn(
                                    "bg-gradient-to-br text-white",
                                    DAY_COLORS[activeDay],
                                  )
                                : "bg-slate-200 text-slate-600",
                          )}
                        >
                          {r.lessonNumber}
                        </div>
                        <div className="flex-1">
                          <div
                            className={cn(
                              "mb-1 text-base font-bold transition-colors",
                              isCurrentLesson
                                ? "text-yellow-900"
                                : hasSubject
                                  ? "text-slate-800"
                                  : "text-slate-400",
                            )}
                          >
                            {r.subject || "Тэмдэглээгүй"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {isCurrentLesson
                              ? "Одоогийн хичээл"
                              : hasSubject
                                ? "Хичээл"
                                : "-"}
                          </div>
                        </div>
                      </div>

                      {hasSubject && !isCurrentLesson && (
                        <div className="mt-3 flex items-center justify-between border-t border-current/10 pt-3">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              `bg-gradient-to-r ${DAY_COLORS[activeDay]} text-white`,
                            )}
                          >
                            {r.lessonNumber}-р цаг
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeDay === today && currentLesson && (
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <div className="font-semibold text-indigo-900">
                        Одоо {currentLesson}-р цагийн хичээл явж байна
                      </div>
                      <div className="text-sm text-indigo-700">
                        {dayRows[currentLesson - 1]?.subject ||
                          "Хичээл тэмдэглээгүй байна"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
