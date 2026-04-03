"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { ArrowLeft, Loader2, Plus, X, Upload } from "lucide-react";

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

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
function fileKey(f: File) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}
function inputDateToISO(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0).toISOString();
}

export default function AddHomeworkForm({
  hworkEndpoint = "/api/hwork",
  uploadEndpoint = "/api/upload",
  subjects,
  onCreated,
  maxFileMB = 5,
}: Props) {
  const router = useRouter();
  const defaultSubjects = useMemo(
    () =>
      subjects ?? [
        "Монгол хэл",
        "Уран зохиол",
        "Математик",
        "Биологи",
        "Англи хэл",
        "Нийгэм судлал",
        "Түүх",
        "Хими",
        "Физик",
        "Газар зүй",
        "Эрүүл мэнд",
        "Иргэний ёс зүй",
        "Мэдээлэл зүй",
        "Дизайн технологи",
        "Тамир",
        "Үндэсний бичиг",
        "Англи хэл сонгон",
        "Физик сонгон",
      ],
    [subjects],
  );

  const [subject, setSubject] = useState(defaultSubjects[0] ?? "");
  const [title, setTitle] = useState("");
  const todayYmd = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);
  const [dateYmd, setDateYmd] = useState(todayYmd);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const canSubmit = Boolean(subject.trim() && title.trim() && dateYmd.trim());

  useEffect(
    () => () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    },
    [previewUrls],
  );

  const applyFiles = (picked: File[], mode: "replace" | "append") => {
    for (const f of picked) {
      if (!ALLOWED.has(f.type)) {
        toast.error("Зөвхөн JPG/PNG/WEBP зөвшөөрнө");
        return;
      }
      if (f.size > maxFileMB * 1024 * 1024) {
        toast.error(`${maxFileMB}MB-аас бага байх ёстой`);
        return;
      }
    }
    const next =
      mode === "replace"
        ? picked
        : (() => {
            const m = new Map(files.map((f) => [fileKey(f), f]));
            for (const f of picked) m.set(fileKey(f), f);
            return Array.from(m.values());
          })();
    setFiles(next);
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(next.map((f) => URL.createObjectURL(f)));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeOne = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(next.map((f) => URL.createObjectURL(f)));
  };

  const submit = async () => {
    if (!canSubmit) {
      toast.warning("Мэдээллээ бүрэн бөглөөрэй");
      return;
    }
    const id = toast.loading("Нэмж байна...");
    setLoading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload амжилтгүй");
        const json = (await res.json()) as any;
        const url = json?.url ?? json?.blob?.url ?? null;
        if (!url) throw new Error("URL олдсонгүй");
        urls.push(url);
      }
      const res = await fetch(hworkEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          title: title.trim(),
          date: inputDateToISO(dateYmd),
          images: urls,
        }),
      });
      if (!res.ok) throw new Error("Хадгалах амжилтгүй");
      const created = (await res.json()) as HworkItem;
      toast.dismiss(id);
      toast.success(`${subject} даалгавар нэмэгдлээ ✅`, { duration: 2500 });
      setTitle("");
      setFiles([]);
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls([]);
      onCreated?.(created);
    } catch (e) {
      toast.dismiss(id);
      toast.error(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 font-sans">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-80 h-80 bg-emerald-900 rounded-full mix-blend-multiply filter blur-[140px] opacity-25 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-80 h-80 bg-teal-900 rounded-full mix-blend-multiply filter blur-[140px] opacity-20 animate-pulse"
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
            onClick={() => router.back()}
            className="p-2 hover:bg-card-hover rounded-full transition-all duration-200 hover:scale-110 active:scale-95 group"
          >
            <ArrowLeft
              size={22}
              className="group-hover:text-emerald-400 transition-colors"
            />
          </button>
          <div className="text-right">
            <h1 className="text-xl font-bold text-on-surface">Даалгавар нэмэх</h1>
            <p className="text-gray-600 text-xs mt-0.5">
              Шинэ даалгавар үүсгэх
            </p>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-subtle rounded-2xl p-6 space-y-5">
          {/* Subject + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5 block">
                Хичээл
              </label>
              <div className="relative">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                  className="w-full appearance-none bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-white/20 hover:border-white/20 transition-all disabled:opacity-50 [color-scheme:dark]"
                >
                  {defaultSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
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
              <label className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5 block">
                Огноо
              </label>
              <input
                type="date"
                value={dateYmd}
                onChange={(e) => setDateYmd(e.target.value)}
                disabled={loading}
                className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-on-surface outline-none focus:ring-1 focus:ring-white/20 hover:border-white/20 transition-all disabled:opacity-50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5 block">
              Даалгаврын мессеж
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={5}
              disabled={loading}
              placeholder={`Жишээ:\nМ/хэл-35хуу "Ажиллах өгүүлбэр"\nМат-Самбар дээрх дасгал`}
              className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-muted/50 outline-none focus:ring-1 focus:ring-white/20 hover:border-white/20 transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5 block">
              Зураг нэмэх{" "}
              <span className="text-gray-700 normal-case">
                (JPG PNG WEBP • {maxFileMB}MB)
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
                applyFiles(Array.from(e.dataTransfer.files || []), "append");
              }}
              className={`border border-dashed rounded-xl p-5 text-center transition-all duration-200
                ${dragOver ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-white/20"}`}
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) =>
                  applyFiles(Array.from(e.target.files || []), "replace")
                }
                className="hidden"
                id="add-upload"
              />
              <label htmlFor="add-upload" className="cursor-pointer">
                <Upload size={20} className="mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">
                  {files.length > 0
                    ? `${files.length} зураг сонгогдсон`
                    : "Энд дарж эсвэл чирж оруулах"}
                </p>
              </label>
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previewUrls.map((u, i) => (
                    <div key={u} className="relative group/img">
                      <img
                        src={u}
                        alt=""
                        className="h-20 w-full object-cover rounded-xl border border-border"
                      />
                      <button
                        onClick={() => removeOne(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-lg bg-red-500/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                setTitle("");
                setFiles([]);
                previewUrls.forEach((u) => URL.revokeObjectURL(u));
                setPreviewUrls([]);
                setDateYmd(todayYmd);
                toast.info("Цэвэрлэгдлээ");
              }}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-gray-500 hover:bg-card-hover hover:text-on-surface-muted active:scale-95 transition-all disabled:opacity-40"
            >
              Цэвэрлэх
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit || loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600/25 border border-emerald-500/25 text-sm font-bold text-emerald-400
                hover:bg-emerald-600/35 hover:scale-[1.01] active:scale-[0.99]
                transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Нэмж байна...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Нэмэх
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
