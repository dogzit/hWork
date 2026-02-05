"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";

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

function ymdToISOStart(ymd: string) {
  return new Date(`${ymd}T00:00:00.000Z`).toISOString();
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
        "Англи хэл ",
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
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const { push } = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = subject.trim() && title.trim() && dateYmd.trim();

  const clearPreviews = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
  };

  const clearFiles = () => {
    clearPreviews();
    setFiles([]);
  };

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

  // ✅ merge mode: replace or append
  const applyPickedFiles = (picked: File[], mode: "replace" | "append") => {
    setErr("");
    setOk("");

    if (picked.length === 0) {
      if (mode === "replace") clearFiles();
      return;
    }

    const validationErr = validateFiles(picked);
    if (validationErr) {
      setErr(validationErr);
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

    // rebuild previews from nextFiles
    clearPreviews();
    setPreviewUrls(nextFiles.map((f) => URL.createObjectURL(f)));
  };

  const onPickFromInput = (
    list: FileList | null,
    mode: "replace" | "append",
  ) => {
    if (!list || list.length === 0) return;
    applyPickedFiles(Array.from(list), mode);

    // allow picking same file again later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeOne = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    applyPickedFiles(next, "replace");
  };

  // ✅ upload multiple, but DB will store only first URL
  const uploadImagesIfAny = async (): Promise<string[]> => {
    if (files.length === 0) return [];

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

      // ✅ support different response shapes too
      const url =
        json?.url ??
        json?.blob?.url ??
        json?.data?.url ??
        json?.result?.url ??
        null;

      if (!url) throw new Error("Upload response missing url");
      urls.push(url);
    }

    return urls;
  };

  const submit = async () => {
    try {
      setLoading(true);
      setErr("");
      setOk("");

      const urls = await uploadImagesIfAny();

      const res = await fetch(hworkEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          date: ymdToISOStart(dateYmd),
          images: urls,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Save failed: ${res.status}`);
      }

      const created = (await res.json()) as HworkItem;

      setOk("Амжилттай нэмлээ ✅");
      setTitle("");
      clearFiles();

      onCreated?.(created);
    } catch (e) {
      console.error(e);
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-6 py-5">
          <span
            className="cursor-pointer flex items-center gap-2 text-sm text-gray-300 hover:text-black transition w-fit"
            onClick={() => push("/admin")}
          >
            ← Back
          </span>

          <h2 className="text-lg font-semibold text-neutral-900">
            Даалгавар нэмэх
          </h2>
        </div>

        <div className="p-6">
          {err ? (
            <div className="mb-4 border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900">
              ⚠ {err}
            </div>
          ) : null}
          {ok ? (
            <div className="mb-4 border border-neutral-900 bg-neutral-50 px-4 py-3 text-sm text-neutral-900">
              {ok}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Хичээл
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-400 focus:border-neutral-900"
                >
                  {defaultSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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
                placeholder={`Жишээ:\nМ/хэл-35хуу "Ажиллах өгүүлбэр"-өгүүлбэрийн гишүүдээр зурна\nМат-Самбар дээрх дасгал`}
                className="w-full resize-none border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors hover:border-neutral-400 focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                Зураг (optional)
                <span className="ml-2 font-normal text-neutral-500">
                  JPG / PNG / WEBP • max {maxFileMB}MB
                </span>
              </label>

              {/* ✅ Drop zone */}
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
                  applyPickedFiles(dropped, "append"); // ✅ drop => add more
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
                  onChange={(e) => onPickFromInput(e.target.files, "replace")}
                  className="peer sr-only"
                  id="file-upload"
                />

                <label
                  htmlFor="file-upload"
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

                {/* ✅ Add more button */}
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
                    disabled={loading}
                  >
                    Add / Replace
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // open picker but append
                      // we can't set different handler for same input easily -> use hidden second input
                      // so we just trigger a second input below
                      document.getElementById("file-upload-append")?.click();
                    }}
                    className="ml-2 border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
                    disabled={loading}
                  >
                    Add more
                  </button>
                </div>

                {/* hidden append input */}
                <input
                  id="file-upload-append"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onPickFromInput(e.target.files, "append")}
                />
              </div>

              {/* ✅ previews + remove */}
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
                        onClick={() => removeOne(idx)}
                        className="absolute right-2 top-2 border border-neutral-300 bg-white px-2 py-1 text-xs hover:bg-neutral-50"
                        disabled={loading}
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
                onClick={() => {
                  setErr("");
                  setOk("");
                  setTitle("");
                  setSubject(defaultSubjects[0] ?? "");
                  setDateYmd(todayYmd);
                  clearFiles();
                }}
                className="border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Clear
              </button>

              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || loading}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium transition-colors",
                  !canSubmit || loading
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-neutral-900 text-white hover:bg-neutral-800",
                )}
              >
                {loading ? "Нэмж байна..." : "Нэмэх"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
