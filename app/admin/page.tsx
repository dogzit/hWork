"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  Calendar,
  Plus,
  Edit3,
  ArrowRight,
  Settings,
  Shuffle,
} from "lucide-react";

export default function AdminHomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    toast.info("Гарч байна...", { duration: 1200 });
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("name");
    window.location.href = "/auth/login";
  };

  const cards = [
    {
      icon: <Calendar size={20} className="text-white" />,
      gradient: "from-blue-600 to-cyan-500",
      glow: "bg-blue-500",
      title: "Хуваарь өөрчлөх",
      desc: "Хичээлийн хуваарь засах, шинэчлэх",
      href: "/admin/timeTable",
    },
    {
      icon: <Plus size={20} className="text-white" />,
      gradient: "from-emerald-600 to-teal-500",
      glow: "bg-emerald-500",
      title: "Даалгавар нэмэх",
      desc: "Шинэ даалгавар үүсгэх",
      href: "/admin/homework/add",
    },
    {
      icon: <Edit3 size={20} className="text-white" />,
      gradient: "from-violet-600 to-purple-500",
      glow: "bg-violet-500",
      title: "Даалгавар удирдах",
      desc: "Даалгавар өөрчлөх, засах, устгах",
      href: "/admin/homework",
    },
    {
      icon: <Shuffle size={20} className="text-white" />,
      gradient: "from-indigo-600 to-blue-500",
      glow: "bg-indigo-500",
      title: "Сурагч сонгох",
      desc: "Хичээл дээр хэнийг дуудах",
      href: "/random",
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6 font-sans">
      {/* Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 dark:opacity-100 opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-[160px] opacity-30 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute inset-0 dark:opacity-[0.02] opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-elevated border border-border mb-5 shadow-xl">
            <Settings size={24} className="text-on-surface-muted" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Админ удирдлага
          </h1>
          <p className="text-on-surface-muted text-sm">
            Хичээлийн хуваарь болон даалгаврын удирдлага
          </p>
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 gap-3 mb-3">
          {cards.map((card) => (
            <button
              key={card.href}
              type="button"
              onClick={() => router.push(card.href)}
              className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated
                px-5 py-4 text-left
                hover:border-border hover:scale-[1.01] hover:shadow-lg
                active:scale-[0.99] transition-all duration-200"
            >
              {/* Left accent */}
              <div
                className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
              />
              {/* Hover glow */}
              <div
                className={`absolute -inset-10 ${card.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`}
              />

              <div className="relative flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm group-hover:text-on-surface transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-on-surface-muted mt-0.5 transition-colors">
                    {card.desc}
                  </p>
                </div>
                <ArrowRight
                  size={15}
                  className="text-on-surface-muted group-hover:text-on-surface group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Status pill */}
        <div className="flex items-center justify-center gap-2 py-3 mb-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-on-surface-muted">
            Систем хэвийн ажиллаж байна
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-2
            px-5 py-3 rounded-2xl
            bg-surface-elevated border border-border-subtle text-on-surface-muted
            hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400
            hover:scale-[1.01] active:scale-[0.99]
            transition-all duration-200 text-sm font-semibold"
        >
          <LogOut
            size={14}
            className="group-hover:rotate-12 transition-transform duration-200"
          />
          Системээс гарах
        </button>
      </div>
    </div>
  );
}
