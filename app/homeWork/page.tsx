"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type HworkItem = {
  id: string;
  title: string;
  subject: string;
  date: string;

  // ✅ support both old + new
  image: string | null;
  images?: string[] | null;
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

function getDayOfWeek(iso: string) {
  const days = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
  const d = new Date(iso);
  return days[d.getDay()];
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

// ✅ normalize: use images[] first, fallback to image
function getImages(x: HworkItem): string[] {
  const arr = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
  const one =
    typeof x.image === "string" && x.image.trim() ? [x.image.trim()] : [];
  return Array.from(new Set([...arr, ...one]));
}

function CardCarousel({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (index: number) => void;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [images.join("|")]);

  if (images.length === 0) return null;

  const prev = () => setI((p) => (p - 1 + images.length) % images.length);
  const next = () => setI((p) => (p + 1) % images.length);

  return (
    <div className="relative overflow-hidden bg-slate-100">
      <div className="cursor-pointer" onClick={() => onOpen(i)}>
        <img
          src={images[i]}
          alt="homework"
          className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 shadow-lg transition hover:scale-105"
            aria-label="Previous image"
          >
            ←
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 shadow-lg transition hover:scale-105"
            aria-label="Next image"
          >
            →
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
            {i + 1}/{images.length}
          </div>

          <div className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow-lg">
            🔍
          </div>
        </>
      ) : (
        <div className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow-lg">
          🔍
        </div>
      )}

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto bg-white/70 p-3 backdrop-blur-sm">
          {images.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => setI(idx)}
              className={cn(
                "h-14 w-20 flex-none overflow-hidden rounded-xl border-2 transition",
                idx === i
                  ? "border-slate-900"
                  : "border-slate-200 hover:border-slate-300",
              )}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              <img
                src={src}
                alt="thumb"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ImageModal({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(startIndex);

  useEffect(() => {
    setI(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (images.length <= 1) return;
      if (e.key === "ArrowLeft")
        setI((p) => (p - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setI((p) => (p + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  if (images.length === 0) return null;

  const prev = () => setI((p) => (p - 1 + images.length) % images.length);
  const next = () => setI((p) => (p + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
        aria-label="Close"
      >
        ✕
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Next"
          >
            →
          </button>
        </>
      ) : null}

      <div
        className="relative max-h-[90vh] max-w-[95vw] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[i]}
          alt="Enlarged homework"
          className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl object-contain"
        />

        {images.length > 1 ? (
          <>
            <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => setI(idx)}
                  className={cn(
                    "h-14 w-20 flex-none overflow-hidden rounded-xl border-2 transition",
                    idx === i
                      ? "border-white"
                      : "border-white/30 hover:border-white/60",
                  )}
                >
                  <img
                    src={src}
                    alt="thumb"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {i + 1}/{images.length}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function HomeworkPage() {
  const router = useRouter();

  const [data, setData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState<string>("ALL");

  const [modal, setModal] = useState<{
    images: string[];
    index: number;
  } | null>(null);

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

  useEffect(() => {
    if (modal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modal]);

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
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-800">
                        📅 {formatDate(dayKey)}
                      </h2>
                      <span className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {getDayOfWeek(dayKey)}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {items.length} даалгавар
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {items.map((x, index) => {
                    const colors = getSubjectColor(x.subject);
                    const imgs = getImages(x);

                    return (
                      <div
                        key={x.id}
                        className="group overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.06}s both`,
                        }}
                      >
                        <div className={cn("border-b-2 p-6", colors.border)}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-3">
                                <span
                                  className={cn(
                                    "rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm transition-transform duration-300 group-hover:scale-[1.02]",
                                    colors.bg,
                                    colors.text,
                                  )}
                                >
                                  {x.subject}
                                </span>
                              </div>

                              <h3 className="whitespace-pre-line text-lg font-semibold leading-relaxed text-slate-800">
                                {x.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {imgs.length ? (
                          <CardCarousel
                            images={imgs}
                            onOpen={(idx) =>
                              setModal({ images: imgs, index: idx })
                            }
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal ? (
        <ImageModal
          images={modal.images}
          startIndex={modal.index}
          onClose={() => setModal(null)}
        />
      ) : null}

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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
