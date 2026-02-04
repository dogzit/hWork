"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

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

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const canSubmit = subject.trim() && title.trim() && dateYmd.trim();
  const { push } = useRouter();
  const validateAndSetFile = (f: File | null) => {
    setErr("");
    setOk("");

    if (!f) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    if (!ALLOWED_MIME.has(f.type)) {
      setErr("Зөвхөн JPG / PNG / WEBP зураг зөвшөөрнө.");
      return;
    }

    const maxBytes = maxFileMB * 1024 * 1024;
    if (f.size > maxBytes) {
      setErr(`Зураг ${maxFileMB}MB-аас их байна.`);
      return;
    }

    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const uploadImageIfAny = async (): Promise<string | null> => {
    if (!file) return null;

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

    const json = (await res.json()) as { url?: string };
    if (!json.url) throw new Error("Upload response missing url");
    return json.url;
  };

  const submit = async () => {
    try {
      setLoading(true);
      setErr("");
      setOk("");

      const imageUrl = await uploadImageIfAny();
      const dateISO = ymdToISOStart(dateYmd);

      const res = await fetch(hworkEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          date: dateISO,
          image: imageUrl,
        }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Save failed: ${res.status}`);
      }

      const created = (await res.json()) as HworkItem;

      setOk("Амжилттай нэмлээ ✅");
      setTitle("");

      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");

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

              <div className="relative">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    validateAndSetFile(e.target.files?.[0] ?? null)
                  }
                  className="peer sr-only"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center justify-center border border-neutral-300 bg-white px-4 py-8 text-sm text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                >
                  {file ? (
                    <span className="text-neutral-900">{file.name}</span>
                  ) : (
                    <span>Click to upload or drag and drop</span>
                  )}
                </label>
              </div>

              {previewUrl ? (
                <div className="mt-3 border border-neutral-200">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-64 w-full object-contain bg-neutral-50"
                  />
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
                  setFile(null);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl("");
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
