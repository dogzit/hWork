"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  BookOpen,
  Clock,
  CalendarDays,
  Users,
  Loader2,
  AlertTriangle,
  Database,
} from "lucide-react";

type DataCounts = {
  hwork: number;
  timetable: number;
  duty: number;
  users: number;
};

export default function AdminDataPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<DataCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<string | null>(null);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/admin/clear-data");
      if (res.ok) {
        setCounts(await res.json());
      }
    } catch {
      toast.error("Мэдээлэл татахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const clearData = async (type: string) => {
    setClearing(type);
    try {
      const res = await fetch("/api/admin/clear-data", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Амжилттай устгагдлаа");
        setConfirmClear(null);
        await fetchCounts();
      } else {
        toast.error(data.error || "Алдаа гарлаа");
      }
    } catch {
      toast.error("Сервертэй холбогдож чадсангүй");
    }
    setClearing(null);
  };

  const dataItems = [
    {
      key: "hwork",
      label: "Даалгавар",
      icon: <BookOpen size={20} className="text-pink-400" />,
      gradient: "from-pink-500 to-rose-500",
      count: counts?.hwork ?? 0,
    },
    {
      key: "timetable",
      label: "Хичээлийн хуваарь",
      icon: <Clock size={20} className="text-blue-400" />,
      gradient: "from-blue-500 to-cyan-500",
      count: counts?.timetable ?? 0,
    },
    {
      key: "duty",
      label: "Дүрмийн хуваарь",
      icon: <CalendarDays size={20} className="text-emerald-400" />,
      gradient: "from-emerald-500 to-teal-500",
      count: counts?.duty ?? 0,
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-10 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-10 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin")}
          className="p-2 hover:bg-card-hover rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <Database size={18} className="text-accent" />
        <h1 className="font-bold text-sm">Өгөгдөл удирдах</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Info banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-400">Анхааруулга</p>
            <p className="text-xs text-on-surface-muted mt-1">
              Хуучин жилийн өгөгдлийг устгахдаа болгоомжилно уу. Энэ үйлдлийг буцаах боломжгүй.
            </p>
          </div>
        </div>

        {/* Users count (read-only) */}
        <div className="bg-surface-elevated border border-border rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Users size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">Хэрэглэгчид</p>
            <p className="text-xs text-on-surface-muted">
              Бүртгэлтэй хэрэглэгчийн тоо
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{counts?.users ?? 0}</p>
            <p className="text-[10px] text-on-surface-muted">хүн</p>
          </div>
        </div>

        {/* Data items to clear */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-on-surface-muted uppercase tracking-widest">
            Устгах боломжтой өгөгдөл
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface-elevated border border-border rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl skeleton" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-24 skeleton rounded-lg" />
                    <div className="h-3 w-32 skeleton rounded-md" />
                  </div>
                  <div className="h-10 w-20 skeleton rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dataItems.map((item) => (
                <div
                  key={item.key}
                  className="bg-surface-elevated border border-border rounded-2xl p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs text-on-surface-muted">
                      {item.count} ширхэг бичлэг
                    </p>
                  </div>

                  {confirmClear === item.key ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmClear(null)}
                        className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-on-surface-muted
                          hover:bg-card-hover transition-all"
                      >
                        Цуцлах
                      </button>
                      <button
                        onClick={() => clearData(item.key)}
                        disabled={clearing === item.key}
                        className="px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400
                          hover:bg-red-500/30 disabled:opacity-40 transition-all flex items-center gap-1.5"
                      >
                        {clearing === item.key ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Устгах
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClear(item.key)}
                      disabled={item.count === 0}
                      className="px-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-on-surface-muted
                        hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400
                        disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                    >
                      <Trash2 size={12} />
                      Устгах
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear all button */}
        {!loading && counts && (counts.hwork + counts.timetable + counts.duty > 0) && (
          <div className="pt-4">
            {confirmClear === "all" ? (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold text-red-400">
                    Бүх хуучин өгөгдлийг устгах уу?
                  </p>
                  <p className="text-[10px] text-on-surface-muted mt-1">
                    Даалгавар + Хуваарь + Дүрмийн хуваарь бүгдийг нэгэн зэрэг устгана
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmClear(null)}
                    className="flex-1 py-3 rounded-2xl bg-surface border border-border text-xs font-bold text-on-surface-muted
                      hover:bg-card-hover transition-all"
                  >
                    Цуцлах
                  </button>
                  <button
                    onClick={() => clearData("all")}
                    disabled={clearing === "all"}
                    className="flex-1 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400
                      hover:bg-red-500/30 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {clearing === "all" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Бүгдийг устгах
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear("all")}
                className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-400
                  hover:bg-red-500/20 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Бүх хуучин өгөгдлийг устгах
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && counts && counts.hwork === 0 && counts.timetable === 0 && counts.duty === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-sm text-on-surface-muted">Өгөгдөл цэвэр байна</p>
            <p className="text-xs text-on-surface-muted/50 mt-1">
              Шинэ жилийн даалгавар, хуваарийг нэмнэ үү
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
