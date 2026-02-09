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
  title?: string;
  showBackButton?: boolean;

  /**
   * Хэрвээ edit page-рүү үсрэх зам өөр бол энд өгч болно.
   * Default: /timetable/edit?day=MONDAY&lesson=1
   */
  editHrefBuilder?: (day: Day, lessonNumber: number) => string;
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

function getTodayDay(): Day {
  const d = new Date().getDay();
  if (d === 1) return "MONDAY";
  if (d === 2) return "TUESDAY";
  if (d === 3) return "WEDNESDAY";
  if (d === 4) return "THURSDAY";
  if (d === 5) return "FRIDAY";
  return "MONDAY";
}

type Slot = {
  start: number; // minutes
  end: number; // minutes
  label: string; // "07:40 - 08:20"
};

const TIME_SLOTS: Slot[] = [
  { start: 7 * 60 + 40, end: 8 * 60 + 20, label: "07:40 - 08:20" }, // 1
  { start: 8 * 60 + 20, end: 9 * 60 + 0, label: "08:20 - 09:00" }, // 2
  { start: 9 * 60 + 5, end: 9 * 60 + 45, label: "09:05 - 09:45" }, // 3
  { start: 9 * 60 + 45, end: 10 * 60 + 25, label: "09:45 - 10:25" }, // 4
  { start: 10 * 60 + 40, end: 11 * 60 + 20, label: "10:40 - 11:20" }, // 5
  { start: 11 * 60 + 20, end: 12 * 60 + 0, label: "11:20 - 12:00" }, // 6
  { start: 12 * 60 + 0, end: 12 * 60 + 40, label: "12:00 - 12:40" }, // 7
];

function toHHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getCurrentLesson(): number | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < TIME_SLOTS.length; i++) {
    const s = TIME_SLOTS[i];
    if (currentMinutes >= s.start && currentMinutes <= s.end) return i + 1;
  }
  return null;
}

export default function TimetableReadOnly({
  endpoint = "/api/timetable",
  title = "Хичээлийн хуваарь",
  showBackButton = true,
  editHrefBuilder = (day, lesson) =>
    `/timetable/edit?day=${day}&lesson=${lesson}`,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = useMemo(() => getTodayDay(), []);
  const [activeDay, setActiveDay] = useState<Day>(today);
  const [currentLesson, setCurrentLesson] = useState<number | null>(null);

  useEffect(() => {
    setCurrentLesson(getCurrentLesson());
    const t = setInterval(() => setCurrentLesson(getCurrentLesson()), 60_000);
    return () => clearInterval(t);
  }, []);

  const grid = useMemo(() => {
    const m = new Map<string, TimetableItem>();
    for (const it of data) m.set(`${it.day}-${it.lessonNumber}`, it);
    return m;
  }, [data]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const isToday = activeDay === today;
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

  /**
   * Lesson + break-үүдийг ээлжлүүлж list болгож гаргана
   */
  const timelineRows = useMemo(() => {
    const rows: Array<
      | {
          type: "lesson";
          lessonNumber: number;
          subject: string | null;
          timeLabel: string;
        }
      | { type: "break"; from: number; to: number; minutes: number }
    > = [];

    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const lessonNumber = i + 1;
      const subject = grid.get(`${activeDay}-${lessonNumber}`)?.subject ?? null;

      rows.push({
        type: "lesson",
        lessonNumber,
        subject,
        timeLabel: TIME_SLOTS[i].label,
      });

      const cur = TIME_SLOTS[i];
      const next = TIME_SLOTS[i + 1];
      if (next && next.start > cur.end) {
        rows.push({
          type: "break",
          from: cur.end,
          to: next.start,
          minutes: next.start - cur.end,
        });
      }
    }

    return rows;
  }, [activeDay, grid]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header (screenshot шиг) */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {showBackButton && (
            <button
              onClick={() => router.push("/")}
              className="mb-3 inline-flex items-center gap-2 text-white/90 hover:text-white"
            >
              <span className="text-lg">‹</span>
              <span className="hover:cursor-pointer">Буцах</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{title}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Day tabs + refresh */}
        <div className="mb-5 rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">
              Өдөр сонгох
            </div>
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6"
                />
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 9a8 8 0 00-14.9-3M4 15a8 8 0 0014.9 3"
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
                    "rounded-xl px-3 py-2 text-sm font-bold border transition",
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  )}
                >
                  {DAY_LABELS[d]}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {isToday && !isWeekend && currentLesson
              ? `Одоо ${currentLesson}-р цаг явж байна`
              : "Долоо хоногийн хуваарь"}
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-3 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <div className="text-sm font-semibold text-slate-600">
              Ачааллаж байна...
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {timelineRows.map((row, idx) => {
              if (row.type === "break") {
                // Завсарлага card
                return (
                  <div
                    key={`break-${idx}`}
                    className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-200/70 flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-amber-800"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3"
                            />
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-amber-900">
                            Завсарлага
                          </div>
                          <div className="text-xs font-semibold text-amber-800">
                            {toHHMM(row.from)} – {toHHMM(row.to)} •{" "}
                            {row.minutes} минут
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-bold text-amber-900/80 rounded-full bg-amber-200/50 px-3 py-1">
                        Амрах цаг 🙂
                      </div>
                    </div>
                  </div>
                );
              }

              const isCurrent =
                isToday && !isWeekend && currentLesson === row.lessonNumber;

              return (
                <button
                  key={`lesson-${row.lessonNumber}`}
                  // onClick={() =>
                  //   router.push(editHrefBuilder(activeDay, row.lessonNumber))
                  // }
                  className={cn(
                    "w-full text-left rounded-2xl border px-4 py-4 shadow-sm transition",
                    isCurrent
                      ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-50 ring-2 ring-yellow-200"
                      : "border-slate-200 bg-blue-50/40 hover:bg-blue-50/70",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {/* number badge */}
                      <div
                        className={cn(
                          "h-11 w-11 rounded-2xl flex items-center justify-center font-extrabold shadow",
                          isCurrent
                            ? "bg-yellow-400 text-yellow-950"
                            : "bg-blue-600 text-white",
                        )}
                      >
                        {row.lessonNumber}
                      </div>

                      <div>
                        <div className="text-sm font-extrabold text-slate-900">
                          {row.subject ?? "Тэмдэглээгүй"}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-600">
                          {row.timeLabel}
                          {isCurrent ? " • ОДОО" : ""}
                        </div>

                        {/* <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 20h9"
                            />
                            <path
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                            />
                          </svg>
                          Дарж засах
                        </div> */}
                      </div>
                    </div>

                    {/* right hint */}
                    <div className="hidden sm:block text-xs font-bold text-slate-500">
                      {DAY_LABELS[activeDay]}
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
