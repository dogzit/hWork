"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState, useEffect } from "react";

type HworkItem = {
  id: string;
  subject: string;
  title: string;
  image: string | null;
  date: string;
};

type Props = {
  hworkEndpoint?: string;
  uploadEndpoint?: string;
  subjects?: string[];
  onCreated?: (item: HworkItem) => void;
  maxFileMB?: number;
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// ✅ YYYY-MM-DD -> ISO (local start of day)
function inputDateToISOStartLocal(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
  return dt.toISOString();
}

function fileKey(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

export default function AddHomeworkForm({
  hworkEndpoint = "/api/hwork",
  uploadEndpoint = "/api/upload",
  subjects,
  onCreated,
  maxFileMB = 5,
}: Props) {
  const defaultSubjects = useMemo(
    () =>
      subjects ?? [
        "Монгол хэл",
        "Математик",
        "Биологи",
        "Англи хэл",
        "Түүх",
        "Хими",
        "Физик",
        "Газар зүй",
        "Эрүүл мэнд",
        "Иргэний ёс зүй",
        "Мэдээлэл зүй",
        "Дизайн технологи",
        "Тамир",
      ],
    [subjects],
  );

  const [subject, setSubject] = useState(defaultSubjects[0] ?? "");
  const [title, setTitle] = useState("");

  const todayYmd = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);
  const [dateYmd, setDateYmd] = useState<string>(todayYmd);

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = Boolean(subject.trim() && title.trim() && dateYmd.trim());

  const clearPreviews = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
  };

  const clearFiles = () => {
    clearPreviews();
    setFiles([]);
  };

  // ✅ component unmount үед revoke
  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const validateFiles = (picked: File[]) => {
    const maxBytes = maxFileMB * 1024 * 1024;
    for (const f of picked) {
      if (!ALLOWED_MIME.has(f.type)) {
        return "Зөвхөн JPG / PNG / WEBP зураг зөвшөөрнө.";
      }
      if (f.size > maxBytes) {
        return `"${f.name}" зураг ${maxFileMB}MB-аас их байна.`;
      }
    }
    return "";
  };

  const applyPickedFiles = (picked: File[], mode: "replace" | "append") => {
    if (picked.length === 0) {
      if (mode === "replace") clearFiles();
      return;
    }

    const validationErr = validateFiles(picked);
    if (validationErr) {
      toast.error("Зураг сонгох боломжгүй ❌", { description: validationErr });
      return;
    }

    const nextFiles =
      mode === "replace"
        ? picked
        : (() => {
            const existing = new Map(files.map((f) => [fileKey(f), f]));
            for (const f of picked) existing.set(fileKey(f), f);
            return Array.from(existing.values());
          })();

    setFiles(nextFiles);

    // old previews revoke
    clearPreviews();
    setPreviewUrls(nextFiles.map((f) => URL.createObjectURL(f)));

    toast.success("Зураг сонгогдлоо ✅", {
      description: `${nextFiles.length} зураг`,
    });
  };

  const onPickFromInput = (
    list: FileList | null,
    mode: "replace" | "append",
  ) => {
    if (!list || list.length === 0) return;
    applyPickedFiles(Array.from(list), mode);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeOne = (idx: number) => {
    // ✅ устгах үед toast битгий “сонгогдлоо” гэж гарахгүйн тул өөр логик
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);

    clearPreviews();
    setPreviewUrls(next.map((f) => URL.createObjectURL(f)));

    toast.message("Зураг хасагдлаа", {
      description: `${next.length} зураг үлдлээ`,
    });
  };

  const uploadImagesIfAny = async (): Promise<string[]> => {
    if (files.length === 0) return [];

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

    return urls;
  };

  const submit = async () => {
    if (!canSubmit) {
      toast.warning("Мэдээллээ бүрэн бөглөөрэй ⚠️");
      return;
    }

    const loadingId = toast.loading("Нэмж байна...");

    try {
      setLoading(true);

      const urls = await uploadImagesIfAny();

      const res = await fetch(hworkEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          date: inputDateToISOStartLocal(dateYmd), // ✅ UTC биш
          images: urls,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Save failed: ${res.status}`);
      }

      const created = (await res.json()) as HworkItem;

      toast.dismiss(loadingId);
      toast.success("Амжилттай нэмлээ ✅", {
        description: `${subject} • ${dateYmd}`,
      });

      setTitle("");
      clearFiles();
      onCreated?.(created);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      toast.dismiss(loadingId);
      toast.error("Нэмэх үед алдаа гарлаа ❌", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Толгой хэсэг */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Даалгавар нэмэх
                </h2>
                <p className="mt-1 text-green-100">Шинэ даалгавар үүсгэх</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Хичээл ба огноо */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Хичээл
                  </label>
                  <div className="relative">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full appearance-none px-4 py-3 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white text-slate-900"
                    >
                      {defaultSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Огноо
                  </label>
                  <input
                    type="date"
                    value={dateYmd}
                    onChange={(e) => setDateYmd(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Даалгаврын мессеж */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Даалгаврын мессеж
                </label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={6}
                  placeholder={`Жишээ:\nМ/хэл-35хуу "Ажиллах өгүүлбэр"-өгүүлбэрийн гишүүдээр зурна\nМат-Самбар дээрх дасгал`}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Зураг оруулах */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Зураг нэмэх
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    (JPG, PNG, WEBP • max {maxFileMB}MB)
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
                      ? "border-green-500 bg-green-50"
                      : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => onPickFromInput(e.target.files, "replace")}
                    className="sr-only"
                    id="file-upload"
                  />

                  <label htmlFor="file-upload" className="cursor-pointer">
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
                      <p className="mt-2 text-sm font-medium text-green-600">
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
                      disabled={loading}
                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Солих
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("file-upload-append")?.click()
                      }
                      disabled={loading}
                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Нэмэх
                    </button>
                  </div>

                  <input
                    id="file-upload-append"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onPickFromInput(e.target.files, "append")}
                  />
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {previewUrls.map((u, idx) => (
                      <div key={u} className="relative group">
                        <img
                          src={u}
                          alt={`preview-${idx + 1}`}
                          className="h-48 w-full object-cover rounded-lg border-2 border-slate-200 group-hover:border-green-300 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removeOne(idx)}
                          disabled={loading}
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

              {/* Товчнууд */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setSubject(defaultSubjects[0] ?? "");
                    setDateYmd(todayYmd);
                    clearFiles();
                    toast.info("Form цэвэрлэгдлээ");
                  }}
                  disabled={loading}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Цэвэрлэх
                </button>

                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Нэмж байна...
                    </>
                  ) : (
                    <>
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Нэмэх
                    </>
                  )}
                </button>
              </div>

              {/* (optional) back button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Буцах
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
