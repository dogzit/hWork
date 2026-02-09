"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

// Даалгаврын төрөл
type HworkItem = {
  id: string;
  subject: string;
  title: string;
  date: string;
  image: string | null;
  images?: string[] | null;
};

// CSS классуудыг нэгтгэх функц
function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

// Зөвшөөрөгдсөн зургийн форматууд
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// ISO огноог YYYY-MM-DD форматруу хөрвүүлэх
function ymd(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// YYYY-MM-DD форматыг ISO болгох
function ymdToISOStart(ymdStr: string) {
  return new Date(`${ymdStr}T00:00:00.000Z`).toISOString();
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

// Файлын unique түлхүүр үүсгэх
function fileKey(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

export default function HomeworkDatePage() {
  const router = useRouter();
  const params = useParams();
  const dateKey = params?.date as string;
  const uploadEndpoint = "/api/upload";

  // Зургийн харагч
  const [viewer, setViewer] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  // Үндсэн өгөгдөл
  const [data, setData] = useState<HworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Засах болон устгах модалууд
  const [editing, setEditing] = useState<HworkItem | null>(null);
  const [deleting, setDeleting] = useState<HworkItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Засах форм талбарууд
  const [eSubject, setESubject] = useState("");
  const [eTitle, setETitle] = useState("");
  const [eDateYmd, setEDateYmd] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Файл сонгох болон upload хийх
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Тухайн өдрийн даалгаврууд
  const dayHomeworks = useMemo(() => {
    return data.filter((x) => ymd(x.date) === dateKey);
  }, [data, dateKey]);

  // Бүх даалгаврыг унших
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hwork", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = (await res.json()) as HworkItem[];
      setData(json);

      toast.success("Даалгавар шинэчлэгдлээ 🔄");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Fetch error";
      toast.error("Унших үед алдаа гарлаа ❌", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Модал нээлттэй үед scroll-ыг түгжих
  useEffect(() => {
    const open = Boolean(editing || deleting);
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editing, deleting]);

  // Preview зургуудыг цэвэрлэх
  const clearPreviews = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
  };

  const clearPickedFiles = () => {
    clearPreviews();
    setFiles([]);
  };

  // Засах модал нээгдэхэд өгөгдөл ачаалах
  useEffect(() => {
    if (!editing) return;

    setErr("");
    setESubject(editing.subject || "");
    setETitle(editing.title || "");
    setEDateYmd(ymd(editing.date));
    setImageUrls(getImages(editing));
    clearPickedFiles();
  }, [editing?.id]);

  useEffect(() => {
    return () => {
      clearPreviews();
    };
  }, []);

  // Файлуудыг шалгах
  const validateFiles = (picked: File[]) => {
    const maxMB = 5;
    const maxBytes = maxMB * 1024 * 1024;

    for (const f of picked) {
      if (!ALLOWED_MIME.has(f.type))
        return "Зөвхөн JPG / PNG / WEBP зураг зөвшөөрнө.";
      if (f.size > maxBytes)
        return `"${f.name}" зураг ${maxMB}MB-аас их байна.`;
    }
    return "";
  };

  // Сонгосон файлуудыг нэмэх
  const applyPickedFiles = (picked: File[], mode: "replace" | "append") => {
    if (picked.length === 0) {
      if (mode === "replace") clearPickedFiles();
      return;
    }

    const v = validateFiles(picked);
    if (v) {
      toast.error("Зураг сонгох боломжгүй ❌", { description: v });
      return;
    }

    const next =
      mode === "replace"
        ? picked
        : (() => {
            const existing = new Map(files.map((f) => [fileKey(f), f]));
            for (const f of picked) existing.set(fileKey(f), f);
            return Array.from(existing.values());
          })();

    setFiles(next);
    clearPreviews();
    setPreviewUrls(next.map((f) => URL.createObjectURL(f)));

    if (fileInputRef.current) fileInputRef.current.value = "";

    toast.success("Зураг сонгогдлоо ✅", {
      description: `${next.length} зураг`,
    });
  };

  // Сонгосон файл устгах
  const removePickedOne = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    applyPickedFiles(next, "replace");
  };

  // DB-ийн зураг устгах
  const removeUrlOne = (idx: number) => {
    setImageUrls((p) => p.filter((_, i) => i !== idx));
  };

  // Файлуудыг Blob руу upload хийх
  const uploadPicked = async () => {
    if (files.length === 0) {
      toast.info("Upload хийх зураг алга байна");
      return;
    }

    const loadingId = toast.loading("Зургууд upload хийж байна...");
    setUploading(true);

    try {
      const urls: string[] = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Upload failed: ${res.status}`);
        }

        const json = (await res.json()) as any;
        const url =
          json?.url ??
          json?.blob?.url ??
          json?.data?.url ??
          json?.result?.url ??
          null;

        if (!url) throw new Error("Upload response missing url");
        urls.push(String(url));
      }

      setImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
      clearPickedFiles();

      toast.dismiss(loadingId);
      toast.success("Upload амжилттай ✅", {
        description: `${urls.length} зураг нэмэгдлээ`,
      });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Upload error";
      toast.dismiss(loadingId);
      toast.error("Upload үед алдаа гарлаа ❌", { description: msg });
    } finally {
      setUploading(false);
      setUploading(false);
    }
  };

  // Засварыг хадгалах
  const saveEdit = async () => {
    if (!editing) return;

    const loadingId = toast.loading("Хадгалж байна...");
    try {
      setSaving(true);

      const res = await fetch(`/api/hwork/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: eSubject.trim(),
          title: eTitle.trim(),
          date: ymdToISOStart(eDateYmd),
          images: imageUrls,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Update failed: ${res.status}`);
      }

      const updated = (await res.json()) as HworkItem;
      setData((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);

      toast.dismiss(loadingId);
      toast.success("Амжилттай хадгаллаа ✅", {
        description: `${updated.subject} • ${ymd(updated.date)}`,
      });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Update error";
      toast.dismiss(loadingId);
      toast.error("Хадгалах үед алдаа ❌", { description: msg });
    } finally {
      setSaving(false);
    }
  };
  const doDelete = async (id: string) => {
    const loadingId = toast.loading("Устгаж байна...");
    try {
      setBusyId(id);

      const res = await fetch(`/api/hwork/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      setData((p) => p.filter((x) => x.id !== id));
      setDeleting(null);

      toast.dismiss(loadingId);
      toast.success("Устгалаа ✅");
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Delete error";
      toast.dismiss(loadingId);
      toast.error("Устгах үед алдаа ❌", { description: msg });
    } finally {
      setBusyId(null);
    }
  };

  const canSave =
    eSubject.trim() &&
    eTitle.trim() &&
    eDateYmd.trim() &&
    !saving &&
    !uploading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Толгой хэсэг */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <button
              onClick={() => router.push("/admin/homework")}
              className="mb-3 hover:cursor-pointer flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
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
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-white mb-3">
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
                <h1 className="text-3xl font-bold text-white">
                  {formatDateDisplay(dateKey)}
                </h1>
                <p className="mt-2 text-indigo-100">
                  {dayHomeworks.length} даалгавар
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
              </div>
            </div>
          </div>

          {err && (
            <div className="mx-8 mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
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
        </div>

        {/* Даалгаврын жагсаалт */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <p className="mt-6 text-slate-500 text-lg">Уншиж байна...</p>
          </div>
        ) : dayHomeworks.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-6 text-slate-500 text-lg font-medium">
              Энэ өдөр даалгавар байхгүй
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayHomeworks.map((x, idx) => {
              const imgs = getImages(x);
              return (
                <div
                  key={x.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                            {idx + 1}
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                            {x.subject}
                          </span>
                        </div>
                        <p className="text-slate-900 font-medium whitespace-pre-line text-lg leading-relaxed">
                          {x.title}
                        </p>

                        {imgs.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {imgs.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="relative group cursor-zoom-in"
                                onClick={() =>
                                  setViewer({ images: imgs, index: imgIdx })
                                }
                              >
                                <img
                                  src={img}
                                  alt={`${x.subject}-${imgIdx + 1}`}
                                  className="w-full h-40 object-cover rounded-lg border-2 border-slate-200 group-hover:border-indigo-300 transition-all group-hover:shadow-lg"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => setEditing(x)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Засах
                        </button>
                        <button
                          onClick={() => setDeleting(x)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Устгах
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Засах модал - өмнөх кодтой адилхан */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between border-b border-white/20 rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Даалгавар засах
                </h3>
                <p className="mt-1 text-sm text-indigo-100">ID: {editing.id}</p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-8 max-h-[calc(90vh-100px)] overflow-y-auto">
              {err && (
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
                  <span className="text-sm text-red-700 flex-1">{err}</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Хичээл
                    </label>
                    <input
                      value={eSubject}
                      onChange={(e) => setESubject(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Жишээ: Математик"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Огноо
                    </label>
                    <input
                      type="date"
                      value={eDateYmd}
                      onChange={(e) => setEDateYmd(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Даалгаврын мессеж
                  </label>
                  <textarea
                    value={eTitle}
                    onChange={(e) => setETitle(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Даалгаврын дэлгэрэнгүй мэдээлэл..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Одоо байгаа зургууд
                    </label>
                    <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {imageUrls.length} зураг
                    </span>
                  </div>

                  {imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imageUrls.map((u, idx) => (
                        <div key={`${u}-${idx}`} className="relative group">
                          <img
                            src={u}
                            alt={`db-${idx + 1}`}
                            onClick={() =>
                              setViewer({ images: imageUrls, index: idx })
                            }
                            className="h-48 w-full object-cover rounded-lg cursor-zoom-in border-2 border-slate-200 group-hover:border-indigo-300 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeUrlOne(idx)}
                            disabled={saving || uploading}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg px-4 py-8 text-center">
                      <p className="text-sm text-slate-500">Зураг байхгүй</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Шинэ зураг нэмэх
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (JPG, PNG, WEBP • max 5MB)
                    </span>
                  </label>

                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                      const dropped = Array.from(e.dataTransfer.files || []);
                      applyPickedFiles(dropped, "append");
                    }}
                    className={cn(
                      "relative border-2 border-dashed rounded-lg px-6 py-8 text-center transition-all",
                      dragOver
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={(e) =>
                        applyPickedFiles(
                          Array.from(e.target.files || []),
                          "append",
                        )
                      }
                      className="sr-only"
                      id="edit-file-upload"
                    />

                    <label
                      htmlFor="edit-file-upload"
                      className="cursor-pointer"
                    >
                      <svg
                        className="mx-auto h-12 w-12 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {files.length > 0 ? (
                        <p className="mt-2 text-sm font-medium text-indigo-600">
                          {files.length} зураг сонгогдсон
                        </p>
                      ) : (
                        <>
                          <p className="mt-2 text-sm font-medium text-slate-700">
                            Энд дарж зураг сонгох
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            эсвэл чирж оруулах
                          </p>
                        </>
                      )}
                    </label>

                    <div className="mt-4 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving || uploading}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Нэмэх
                      </button>

                      <button
                        type="button"
                        onClick={uploadPicked}
                        disabled={files.length === 0 || uploading || saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Uploading...
                          </>
                        ) : (
                          "Upload хийх"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={clearPickedFiles}
                        disabled={saving || uploading}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Цэвэрлэх
                      </button>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previewUrls.map((u, idx) => (
                        <div key={u} className="relative group">
                          <img
                            src={u}
                            alt={`preview-${idx + 1}`}
                            onClick={() =>
                              setViewer({ images: previewUrls, index: idx })
                            }
                            className="h-48 w-full object-cover rounded-lg cursor-zoom-in border-2 border-slate-200 group-hover:border-indigo-300 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removePickedOne(idx)}
                            disabled={saving || uploading}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    disabled={saving || uploading}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Болих
                  </button>

                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={!canSave}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Хадгалж байна...
                      </>
                    ) : (
                      "Хадгалах"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Устгах модал */}
      {deleting && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={() => setDeleting(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Устгах уу?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Энэ үйлдлийг буцаах боломжгүй
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-xs text-slate-500 mb-1">
                {deleting.subject}
              </div>
              <p className="text-sm text-slate-900 whitespace-pre-line">
                {deleting.title}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                disabled={busyId === deleting.id}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Болих
              </button>
              <button
                onClick={() => doDelete(deleting.id)}
                disabled={busyId === deleting.id}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {busyId === deleting.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Устгаж байна...
                  </>
                ) : (
                  "Устгах"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Зургийн харагч */}
      {viewer && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setViewer(null)}
        >
          <button
            onClick={() => setViewer(null)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {viewer.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer((v) =>
                    v
                      ? {
                          ...v,
                          index:
                            (v.index - 1 + v.images.length) % v.images.length,
                        }
                      : v,
                  );
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewer((v) =>
                    v ? { ...v, index: (v.index + 1) % v.images.length } : v,
                  );
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-sm transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </>
          )}

          <img
            src={viewer.images[viewer.index]}
            alt="fullscreen"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
          />

          {viewer.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white">
              {viewer.index + 1} / {viewer.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
