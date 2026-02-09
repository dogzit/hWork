"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DutySchedule = {
  id: string;
  date: string; // ISO string from API
  names: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

function isoToInputDate(iso: string) {
  // ISO -> YYYY-MM-DD (UTC-аар)
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayInputDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function prettyDateFromISO(iso: string) {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function AdminDutyPage() {
  const [date, setDate] = useState<string>(todayInputDate());
  const [names, setNames] = useState<string[]>(["", "", "", "", ""]);
  const [notes, setNotes] = useState<string>("");

  const [items, setItems] = useState<DutySchedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/duty", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setItems(data as DutySchedule[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const canSave = useMemo(() => {
    return date.trim().length > 0 && names.every((n) => n.trim().length > 0);
  }, [date, names]);

  const dateHasExisting = useMemo(() => {
    // нэг өдөрт нэг бүртгэл
    return items.some(
      (x) => isoToInputDate(x.date) === date && x.id !== editingId,
    );
  }, [items, date, editingId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
    if (!q) return sorted;

    return sorted.filter((x) => {
      if (isoToInputDate(x.date).includes(q)) return true;
      if (prettyDateFromISO(x.date).includes(q)) return true;
      if ((x.notes || "").toLowerCase().includes(q)) return true;
      return x.names.some((n) => n.toLowerCase().includes(q));
    });
  }, [items, query]);

  function resetForm() {
    setEditingId(null);
    setDate(todayInputDate());
    setNames(["", "", "", "", ""]);
    setNotes("");
  }

  function onChangeName(i: number, v: string) {
    setNames((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  function startEdit(x: DutySchedule) {
    setEditingId(x.id);
    setDate(isoToInputDate(x.date));
    setNames(
      x.names?.length === 5
        ? x.names
        : [...(x.names || []), "", "", "", "", ""].slice(0, 5),
    );
    setNotes(x.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!canSave) return;

    if (dateHasExisting) {
      toast.error(
        "Энэ өдөрт өмнө нь бүртгэл байна. Түүнийг edit хийж өөрчилнө.",
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      date,
      names: names.map((n) => n.trim()),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    try {
      const res = await fetch(
        editingId ? `/api/duty/${editingId}` : "/api/duty",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");

      await load();
      resetForm();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: string) {
    toast.warning("Жижүүрийг устгах уу?", {
      description: "Энэ үйлдлийг буцаах боломжгүй",
      action: {
        label: "🗑️ Устгах",
        onClick: async () => {
          try {
            const res = await fetch(`/api/duty/${id}`, {
              method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Delete failed");

            setItems((p) => p.filter((x) => x.id !== id));
            if (editingId === id) resetForm();

            toast.success("Амжилттай устгалаа ✅");
          } catch (e: any) {
            toast.error(e?.message || "Устгах үед алдаа гарлаа ❌");
          }
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <button
            onClick={() => router.push("/admin")}
            className="mb-3 flex hover:cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-950 transition-colors"
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
          <div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Жижүүрийн хуваарь (Админ)
            </h1>
            <p className="mt-1 text-slate-600">
              Өдрөө сонгоод{" "}
              <span className="font-semibold">5 хүүхдийн нэр</span> оруулж
              хадгална.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-2xl bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Цэвэрлэх
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            <div className="font-bold">Алдаа:</div>
            <div className="mt-1 text-sm">{error}</div>
          </div>
        )}

        {/* Form */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 text-white">
            <div className="text-sm text-white/90">
              {editingId ? "✏️ Засварлаж байна" : "➕ Шинэ өдөр нэмэх"}
            </div>
            <div className="mt-1 text-xl font-extrabold">
              Өдөр сонгоод 5 нэр оруул
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Өдөр
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                />
                {dateHasExisting && (
                  <p className="mt-2 text-sm text-rose-600">
                    Энэ өдөрт өмнө нь бүртгэл байна (edit хийж өөрчилнө).
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Тайлбар (optional)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Жишээ: Хариуцагч багш, сануулга..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold text-slate-700">
                5 хүүхдийн нэр
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <input
                    key={i}
                    value={names[i] ?? ""}
                    onChange={(e) => onChangeName(i, e.target.value)}
                    placeholder={`Нэр ${i + 1}`}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-white"
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={save}
                  disabled={!canSave || dateHasExisting || isSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3 font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "Хадгалж байна..."
                    : editingId
                      ? "Хадгалах (Update)"
                      : "Нэмэх"}
                </button>

                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 font-extrabold text-white shadow-lg transition hover:bg-slate-800"
                  >
                    Засвар цуцлах
                  </button>
                ) : (
                  <div className="text-sm text-slate-600">
                    ✅ Нэг өдөрт нэг бүртгэл.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">
              Нэмэгдсэн өдрүүд
            </h2>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Хайх (өдөр / нэр / тайлбар)..."
              className="w-full sm:w-96 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-emerald-300"
            />
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
              Уншиж байна...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
              Бүртгэл алга байна. Дээрээс өдөр сонгоод 5 нэр бичээд “Нэмэх” дар.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filtered.map((x) => (
                <div
                  key={x.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-100">
                        <span className="font-extrabold">
                          📅 {prettyDateFromISO(x.date)}
                        </span>
                      </div>

                      {x.notes && (
                        <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
                          <span className="font-semibold">Тайлбар:</span>{" "}
                          {x.notes}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        {x.names.map((n, i) => (
                          <div
                            key={i}
                            className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-900 ring-1 ring-slate-200"
                          >
                            <div className="text-xs text-slate-500">
                              #{i + 1}
                            </div>
                            <div className="font-bold truncate">{n}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col sm:items-stretch">
                      <button
                        type="button"
                        onClick={() => startEdit(x)}
                        className="rounded-2xl bg-indigo-600 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-indigo-500"
                      >
                        ✏️ Засах
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(x.id)}
                        className="rounded-2xl bg-rose-600 px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-rose-500"
                      >
                        🗑️ Устгах
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
