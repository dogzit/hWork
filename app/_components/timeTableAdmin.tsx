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

  const { push } = useRouter();

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 px-4 sm:mt-10 sm:px-6">
      <div className="mb-4 sm:mb-6 flex flex-col gap-3">
        <div>
          <span
            className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-black transition w-fit"
            onClick={() => push("/admin")}
          >
            ← Back
          </span>
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mt-2">
            Хичээлийн хуваарь (Admin)
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500">
            Нүд дээр дарж засна • Enter = хадгалах • Esc = болих
          </p>
        </div>

        <button
          onClick={fetchAll}
          disabled={loading}
          className="border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 border border-neutral-300 bg-neutral-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-neutral-900">
          ⚠ {error}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {DAYS_ORDER.map((d) => {
          const active = d === activeDay;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={cn(
                "px-3 py-2 text-xs sm:text-sm transition-colors font-medium flex-1 sm:flex-none min-w-[60px]",
                active
                  ? "bg-neutral-900 text-white"
                  : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
              )}
            >
              {DAY_LABELS[d]}
            </button>
          );
        })}
      </div>

      <div className="border border-neutral-200 bg-white">
        {loading ? (
          <div className="p-4 sm:p-6 text-sm text-neutral-500">Loading...</div>
        ) : (
          <div className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {dayItems.map(({ lessonNumber, item }) => {
                const key = `${activeDay}-${lessonNumber}`;
                const isEditing = editKey === key;

                return (
                  <div
                    key={lessonNumber}
                    className={cn(
                      "group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border px-3 py-3 sm:px-4 transition-colors",
                      item ? "bg-neutral-50" : "bg-white",
                      isEditing
                        ? "border-neutral-900"
                        : "border-neutral-200 hover:border-neutral-300",
                    )}
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center border border-neutral-300 bg-white text-xs sm:text-sm font-semibold text-neutral-900">
                        {lessonNumber}
                      </div>

                      {!isEditing ? (
                        <button
                          className="text-left flex-1 min-w-0"
                          onClick={() => startEdit(activeDay, lessonNumber)}
                          type="button"
                        >
                          <div className="text-sm font-medium text-neutral-900 break-words">
                            {item?.subject ?? (
                              <span className="text-neutral-400">
                                — (хоосон)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            Дарж засах
                          </div>
                        </button>
                      ) : (
                        <div className="flex-1 w-full min-w-0">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") cancelEdit();
                              if (e.key === "Enter")
                                saveCell(activeDay, lessonNumber);
                            }}
                            className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-neutral-900"
                            placeholder="Хичээл..."
                            disabled={saving}
                          />
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveCell(activeDay, lessonNumber)}
                              disabled={saving || !editValue.trim()}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium transition-colors flex-1 sm:flex-none",
                                saving || !editValue.trim()
                                  ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                                  : "bg-neutral-900 text-white hover:bg-neutral-800",
                              )}
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditing && item ? (
                      <span className="hidden sm:group-hover:inline border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-600 flex-shrink-0">
                        Edit
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
