"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Check,
  X,
  Pencil,
  Loader2,
  CalendarDays,
} from "lucide-react";

type Day = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
type TimetableItem = {
  id: string;
  day: Day;
  lessonNumber: number;
  subject: string;
  createdAt: string;
};
type Props = { endpoint?: string; maxLessons?: number };

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

const LESSON_COLORS = [
  "from-emerald-500 to-cyan-500",
  "from-cyan-500 to-blue-500",
  "from-blue-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-purple-500 to-pink-500",
  "from-pink-500 to-rose-500",
  "from-rose-500 to-orange-500",
];

export default function TimetableAdminBoard({
  endpoint = "/api/timetable",
  maxLessons,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<Day>("MONDAY");
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const grid = useMemo(() => {
    const m = new Map<string, TimetableItem>();
    for (const it of data) m.set(`${it.day}-${it.lessonNumber}`, it);
    return m;
  }, [data]);

  const maxLessonComputed = useMemo(() => {
    if (typeof maxLessons === "number" && maxLessons > 0) return maxLessons;
    return Math.max(
      data.reduce((a, x) => Math.max(a, x.lessonNumber), 0),
      7,
    );
  }, [data, maxLessons]);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json());
      if (silent) toast.success("Хуваарь шинэчлэгдлээ ✨", { duration: 2000 });
    } catch {
      toast.error("Хуваарь ачааллахад алдаа гарлаа");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [endpoint]);

  const startEdit = (day: Day, ln: number) => {
    const key = `${day}-${ln}`;
    setEditKey(key);
    setEditValue(grid.get(key)?.subject ?? "");
  };
  const cancelEdit = () => {
    setEditKey(null);
    setEditValue("");
  };

  const saveCell = async (day: Day, ln: number) => {
    const subject = editValue.trim();
    if (!subject) return;
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ day, lessonNumber: ln, subject }),
      });
      if (!res.ok) throw new Error();
      const saved = (await res.json()) as TimetableItem;
      setData((prev) => {
        const idx = prev.findIndex(
          (x) => x.day === day && x.lessonNumber === ln,
        );
        if (idx === -1) return [...prev, saved];
        const c = prev.slice();
        c[idx] = saved;
        return c;
      });
      cancelEdit();
      toast.success(`${DAY_LABELS[day]} • ${ln}-р цаг хадгалагдлаа ✅`, {
        duration: 2000,
      });
    } catch {
      toast.error("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const dayItems = useMemo(
    () =>
      Array.from({ length: maxLessonComputed }, (_, i) => i + 1).map((ln) => ({
        ln,
        item: grid.get(`${activeDay}-${ln}`),
      })),
    [activeDay, grid, maxLessonComputed],
  );

  const filledCount = dayItems.filter((x) => x.item).length;

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 font-sans">
      {/* Muted orbs for admin */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-80 h-80 bg-blue-900 rounded-full mix-blend-multiply filter blur-[140px] opacity-30 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-80 h-80 bg-cyan-900 rounded-full mix-blend-multiply filter blur-[140px] opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 hover:bg-card-hover rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
          >
            <ArrowLeft
              size={22}
              className="group-hover:text-blue-400 transition-colors"
            />
          </button>
          <div className="text-right">
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              Хичээлийн хуваарь
            </h1>
            <p className="text-gray-600 text-xs mt-0.5">
              Нүд дарж засах • Enter хадгалах
            </p>
          </div>
        </div>

        {/* Day tabs + refresh */}
        <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
              Өдөр сонгох
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>
                {filledCount}/{maxLessonComputed} бүртгэлтэй
              </span>
              <button
                onClick={() => fetchAll(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-border
                  hover:bg-card-hover hover:border-white/20 hover:scale-105 active:scale-95
                  transition-all duration-200 disabled:opacity-40"
              >
                <RefreshCw
                  size={12}
                  className={refreshing ? "animate-spin" : ""}
                />
                Шинэчлэх
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {DAYS_ORDER.map((d) => {
              const active = d === activeDay;
              return (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDay(d);
                    cancelEdit();
                  }}
                  className={`rounded-xl py-2 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95
                    ${
                      active
                        ? "bg-gradient-to-r from-blue-700 to-cyan-700 text-white shadow-md shadow-blue-900/40"
                        : "bg-surface-elevated border border-border-subtle text-gray-500 hover:bg-card-hover hover:text-on-surface-muted"
                    }`}
                >
                  {DAY_LABELS[d]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lesson list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={28} />
            <p className="text-gray-600 text-sm">Ачаалж байна...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayItems.map(({ ln, item }) => {
              const key = `${activeDay}-${ln}`;
              const isEditing = editKey === key;
              const colorIdx = (ln - 1) % LESSON_COLORS.length;

              return (
                <div
                  key={ln}
                  className={`rounded-2xl overflow-hidden border transition-all duration-200
                  ${
                    isEditing
                      ? "border-blue-500/40 bg-blue-500/[0.04] shadow-lg shadow-blue-900/20"
                      : item
                        ? "border-border-subtle bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]"
                        : "border-white/5 bg-white/[0.01] hover:border-border"
                  }`}
                >
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => startEdit(activeDay, ln)}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left group"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${LESSON_COLORS[colorIdx]}
                        flex items-center justify-center font-bold text-on-surface text-sm flex-shrink-0
                        group-hover:scale-110 transition-transform duration-200 shadow-md`}
                      >
                        {ln}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold truncate transition-colors
                          ${item ? "text-on-surface group-hover:text-on-surface" : "text-gray-700 italic group-hover:text-gray-500"}`}
                        >
                          {item?.subject ?? "Хичээл байхгүй"}
                        </p>
                      </div>
                      <Pencil
                        size={13}
                        className="text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors"
                      />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${LESSON_COLORS[colorIdx]}
                        flex items-center justify-center font-bold text-on-surface text-sm flex-shrink-0 shadow-md`}
                      >
                        {ln}
                      </div>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") cancelEdit();
                          if (e.key === "Enter") saveCell(activeDay, ln);
                        }}
                        disabled={saving}
                        placeholder="Хичээлийн нэр..."
                        className="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder:text-gray-600
                          border-b border-blue-500/40 pb-0.5 focus:border-blue-400/70 transition-colors"
                      />
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => saveCell(activeDay, ln)}
                          disabled={saving || !editValue.trim()}
                          className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center
                            hover:bg-blue-600/50 hover:scale-110 active:scale-95 transition-all duration-150
                            disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <Loader2
                              size={13}
                              className="animate-spin text-blue-400"
                            />
                          ) : (
                            <Check size={13} className="text-blue-400" />
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center
                            hover:bg-card-hover hover:scale-110 active:scale-95 transition-all duration-150 disabled:opacity-30"
                        >
                          <X size={13} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
