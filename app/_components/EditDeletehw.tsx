"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type HworkItem = {
  id: string;
  subject: string;
  title: string;
  date: string;
  image: string | null;
  images?: string[] | null;
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function ymd(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ymdToISOStart(ymdStr: string) {
  return new Date(`${ymdStr}T00:00:00.000Z`).toISOString();
}

function getImages(x: HworkItem): string[] {
  const arr = Array.isArray(x.images) ? x.images.filter(Boolean) : [];
  const one =
    typeof x.image === "string" && x.image.trim() ? [x.image.trim()] : [];
  return Array.from(new Set([...arr, ...one]));
}

function fileKey(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

export default function EditHomeworkModal({
  open,
  item,
  onClose,
  onSaved,
  uploadEndpoint = "/api/upload",
}: {
  open: boolean;
  item: HworkItem | null;
  onClose: () => void;
  onSaved: (updated: HworkItem) => void;
  uploadEndpoint?: string;
}) {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [dateYmd, setDateYmd] = useState("");

  // ✅ existing urls in DB
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // ✅ picked files (to upload)
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSave = subject.trim() && title.trim() && dateYmd.trim();

  const clearPreviews = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
  };

  const clearPickedFiles = () => {
    clearPreviews();
    setFiles([]);
  };

  useEffect(() => {
    if (!open || !item) return;
    setErr("");
    setSubject(item.subject || "");
    setTitle(item.title || "");
    setDateYmd(ymd(item.date));
    setImageUrls(getImages(item)); // ✅ preload existing
    clearPickedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item?.id]);

  useEffect(() => {
    if (!open) return;
    return () => {
      clearPreviews();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  const applyPickedFiles = (picked: File[], mode: "replace" | "append") => {
    setErr("");

    if (picked.length === 0) {
      if (mode === "replace") clearPickedFiles();
      return;
    }

    const v = validateFiles(picked);
    if (v) return setErr(v);

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
  };

  const removePickedOne = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    applyPickedFiles(next, "replace");
  };

  const removeUrlOne = (idx: number) => {
    setImageUrls((p) => p.filter((_, i) => i !== idx));
  };

  // ✅ upload picked files to Blob, then append urls into imageUrls
  const uploadPicked = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErr("");

    try {
      const urls: string[] = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(uploadEndpoint, {
          method: "POST",
          body: fd,
        });

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

      // ✅ merge
      setImageUrls((prev) => Array.from(new Set([...prev, ...urls])));

      // clear picked after upload
      clearPickedFiles();
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!item) return;
    try {
      setLoading(true);
      setErr("");

      const res = await fetch(`/api/hwork/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          date: ymdToISOStart(dateYmd),
          images: imageUrls, // ✅ DB update
          // Хэрвээ schema чинь ганц image бол:
          // image: imageUrls[0] ?? null,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Update failed: ${res.status}`);
      }

      const updated = (await res.json()) as HworkItem;
      onSaved(updated);
      onClose();
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Update error");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl border border-neutral-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              Даалгавар засах
            </h3>
            <p className="mt-1 text-sm text-neutral-500">ID: {item.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {err ? (
            <div className="mb-4 border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900">
              ⚠ {err}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Хичээл
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Огноо
                </label>
                <input
                  type="date"
                  value={dateYmd}
                  onChange={(e) => setDateYmd(e.target.value)}
                  className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-neutral-900 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                Мессеж (даалгавар)
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={6}
                className="w-full resize-none border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-neutral-900"
              />
            </div>

            {/* ✅ existing URLs preview + remove */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-900">
                  Одоо байгаа зурагнууд
                </label>
                <span className="text-xs text-neutral-500">
                  {imageUrls.length} ширхэг
                </span>
              </div>

              {imageUrls.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {imageUrls.map((u, idx) => (
                    <div
                      key={`${u}-${idx}`}
                      className="relative border border-neutral-200"
                    >
                      <img
                        src={u}
                        alt={`db-${idx + 1}`}
                        className="h-40 w-full object-contain bg-neutral-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeUrlOne(idx)}
                        className="absolute right-2 top-2 border border-neutral-300 bg-white px-2 py-1 text-xs hover:bg-neutral-50"
                        disabled={loading || uploading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                  Зураг байхгүй байна.
                </div>
              )}
            </div>

            {/* ✅ pick new images (blob) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                Шинэ зураг нэмэх (Blob)
                <span className="ml-2 font-normal text-neutral-500">
                  JPG / PNG / WEBP • max 5MB
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
                  "relative border px-4 py-8 text-sm transition-colors",
                  dragOver
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    applyPickedFiles(Array.from(e.target.files || []), "append")
                  }
                  className="peer sr-only"
                  id="edit-file-upload"
                />

                <label
                  htmlFor="edit-file-upload"
                  className="flex cursor-pointer items-center justify-center"
                >
                  {files.length ? (
                    <span className="text-neutral-900">
                      {files.length} зураг сонгосон
                    </span>
                  ) : (
                    <span>Click to upload or drag and drop</span>
                  )}
                </label>

                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
                    disabled={loading || uploading}
                  >
                    Add more
                  </button>

                  <button
                    type="button"
                    onClick={uploadPicked}
                    className={cn(
                      "px-4 py-2 text-xs font-medium transition-colors",
                      files.length === 0 || uploading
                        ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                        : "bg-neutral-900 text-white hover:bg-neutral-800",
                    )}
                    disabled={files.length === 0 || uploading || loading}
                  >
                    {uploading ? "Uploading..." : "Upload → Add"}
                  </button>

                  <button
                    type="button"
                    onClick={clearPickedFiles}
                    className="border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
                    disabled={loading || uploading}
                  >
                    Clear picked
                  </button>
                </div>
              </div>

              {previewUrls.length ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {previewUrls.map((u, idx) => (
                    <div key={u} className="relative border border-neutral-200">
                      <img
                        src={u}
                        alt={`preview-${idx + 1}`}
                        className="h-40 w-full object-contain bg-neutral-50"
                      />
                      <button
                        type="button"
                        onClick={() => removePickedOne(idx)}
                        className="absolute right-2 top-2 border border-neutral-300 bg-white px-2 py-1 text-xs hover:bg-neutral-50"
                        disabled={loading || uploading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || uploading}
                className="border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Болих
              </button>

              <button
                type="button"
                onClick={save}
                disabled={!canSave || loading || uploading}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium transition-colors",
                  !canSave || loading || uploading
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-900 text-white hover:bg-neutral-800",
                )}
              >
                {loading ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
