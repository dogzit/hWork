"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Loader2,
} from "lucide-react";

type HworkItem = {
  id: string;
  title: string;
  subject: string;
  date: string;
  image: string | null;
  images?: string[] | null;
};

function formatDate(ymdStr: string) {
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

function getDayOfWeek(ymdStr: string) {
  const d = new Date(ymdStr + "T00:00:00");
  return ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"][
    d.getDay()
  ];
}

function getImages(x: HworkItem): string[] {
  const arr = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
  const one =
    typeof x.image === "string" && x.image.trim() ? [x.image.trim()] : [];
  return Array.from(new Set([...arr, ...one]));
}

const SUBJECT_COLORS: Record<
  string,
  { gradient: string; text: string; bg: string; border: string }
> = {
  Математик: {
    gradient: "from-blue-500 to-cyan-500",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Физик: {
    gradient: "from-violet-500 to-purple-500",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  Хими: {
    gradient: "from-emerald-500 to-teal-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  Биологи: {
    gradient: "from-green-500 to-lime-500",
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  "Англи хэл": {
    gradient: "from-rose-500 to-pink-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  "Монгол хэл": {
    gradient: "from-orange-500 to-amber-500",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  Түүх: {
    gradient: "from-amber-500 to-yellow-500",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  default: {
    gradient: "from-gray-500 to-slate-500",
    text: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
};
function sc(s: string) {
  return SUBJECT_COLORS[s] || SUBJECT_COLORS.default;
}

function CardCarousel({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  const [i, setI] = useState(0);
  if (!images.length) return null;
  const safe = Math.min(i, images.length - 1);
  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
      <div
        className="relative group/img cursor-pointer"
        onClick={() => onOpen(safe)}
      >
        <img
          src={images[safe]}
          alt="homework"
          className="w-full h-72 object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/50 backdrop-blur flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
          <ZoomIn size={14} className="text-white" />
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-semibold">
            {safe + 1}/{images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <>
          <div className="flex gap-2 p-3 bg-white/[0.03] overflow-x-auto">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`w-16 h-12 flex-none rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105
                  ${idx === safe ? "border-white/60" : "border-white/10 hover:border-white/30"}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex gap-2 px-3 pb-3">
            <button
              onClick={() =>
                setI((p) => (p - 1 + images.length) % images.length)
              }
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1"
            >
              <ChevronLeft size={14} /> Өмнөх
            </button>
            <button
              onClick={() => setI((p) => (p + 1) % images.length)}
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1"
            >
              Дараах <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
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
  useEffect(() => setI(startIndex), [startIndex]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setI((p) => (p - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setI((p) => (p + 1) % images.length);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [images.length, onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all"
      >
        <X size={18} />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setI((p) => (p - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setI((p) => (p + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
      <div
        className="max-h-[90vh] max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[i]}
          alt=""
          className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain"
        />
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`w-16 h-12 flex-none rounded-xl overflow-hidden border-2 transition-all hover:scale-105
                  ${idx === i ? "border-white" : "border-white/30 hover:border-white/60"}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {images.length > 1 && (
          <p className="text-center text-xs text-gray-500 mt-2">
            {i + 1}/{images.length}
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomeworkDatePage() {
  const router = useRouter();
  const params = useParams();
  const dateParam = params?.date as string;

  const [allData, setAllData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const dayHomework = useMemo(() => {
    if (!dateParam) return [];
    return allData
      .filter((item) => {
        const d = new Date(item.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return key === dateParam;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allData, dateParam]);

  const daySubjects = useMemo(() => {
    const s = new Set<string>();
    for (const x of dayHomework)
      if ((x.subject || "").trim()) s.add(x.subject.trim());
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [dayHomework]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hwork", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setAllData(await res.json());
    } catch {
      toast.error("Даалгаварыг ачаалахад алдаа гарлаа");
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
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-[140px] opacity-15 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-[140px] opacity-15 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-violet-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-10" />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
          >
            <ArrowLeft
              size={24}
              className="group-hover:text-pink-400 transition-colors"
            />
          </button>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <span className="text-xs font-bold text-pink-400/80 uppercase tracking-wider bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-full">
                {dateParam && getDayOfWeek(dateParam)}
              </span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              {dateParam && formatDate(dateParam)}
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              {dayHomework.length} даалгавар • {daySubjects.length} хичээл
            </p>
          </div>
        </div>

        {/* Subject pills summary */}
        {!loading && daySubjects.length > 0 && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-4 mb-6 shadow-2xl">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">
              Өнөөдрийн хичээлүүд
            </p>
            <div className="flex flex-wrap gap-2">
              {daySubjects.map((s) => {
                const c = sc(s);
                return (
                  <span
                    key={s}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${c.gradient}`}
                    />
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-pink-500" size={32} />
            <p className="text-gray-400">Ачаалж байна...</p>
          </div>
        ) : dayHomework.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-3xl">
            <div className="text-5xl mb-4 opacity-30">📝</div>
            <p className="text-gray-500">Энэ өдөр даалгавар байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayHomework.map((item, index) => {
              const c = sc(item.subject);
              const imgs = getImages(item);
              return (
                <div
                  key={item.id}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden
                    hover:border-white/15 hover:bg-white/[0.05] transition-all duration-200"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="p-5">
                    {/* Subject badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
                      >
                        <BookOpen size={14} className="text-white" />
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}
                      >
                        {item.subject}
                      </span>
                      {imgs.length > 0 && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                          <ImageIcon size={12} />
                          {imgs.length}
                        </span>
                      )}
                    </div>
                    {/* Title */}
                    <p className="text-gray-100 font-semibold leading-relaxed whitespace-pre-line group-hover:text-white transition-colors">
                      {item.title}
                    </p>
                    {/* Images */}
                    {imgs.length > 0 && (
                      <CardCarousel
                        images={imgs}
                        onOpen={(idx) => setModal({ images: imgs, index: idx })}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <ImageModal
          images={modal.images}
          startIndex={modal.index}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
