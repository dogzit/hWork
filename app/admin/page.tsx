"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  Calendar,
  Plus,
  Edit3,
  ArrowRight,
  Shuffle,
  Bus,
  ListTodo,
  Shield,
  ScanLine,
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
      icon: <ListTodo size={20} className="text-white" />,
      gradient: "from-amber-600 to-orange-500",
      glow: "bg-amber-500",
      title: "Дүрмийн хуваарь",
      desc: "Албан үүрэгт хуваарийг засах",
      href: "/admin/duty",
    },
    {
      icon: <Bus size={20} className="text-white" />,
      gradient: "from-pink-600 to-rose-500",
      glow: "bg-pink-500",
      title: "Автобусны суудал",
      desc: "Суудлын зохион байгуулалт",
      href: "/admin/bus",
    },
    {
      icon: <ScanLine size={20} className="text-white" />,
      gradient: "from-fuchsia-600 to-pink-500",
      glow: "bg-fuchsia-500",
      title: "QR баталгаажуулах",
      desc: "Автобусанд суух үед QR унших",
      href: "/admin/bus/verify",
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
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 dark:opacity-100 opacity-40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-700 rounded-full mix-blend-multiply filter blur-[200px] opacity-10"
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 dark:opacity-[0.02] opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-surface-elevated border border-border mb-5 shadow-2xl backdrop-blur-xl">
            <Shield size={28} className="text-accent" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            Админ удирдлага
          </h1>
          <p className="text-on-surface-muted text-sm">
            Хичээлийн хуваарь болон даалгаврын удирдлага
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-on-surface-muted font-medium uppercase tracking-widest">
              12Д Ангийн админ
            </span>
          </div>
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {cards.map((card) => (
            <button
              key={card.href}
              type="button"
              onClick={() => router.push(card.href)}
              className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated backdrop-blur-xl
                px-5 py-4 text-left
                hover:border-border hover:scale-[1.02] hover:shadow-xl
                active:scale-[0.98] transition-all duration-300 ease-out"
            >
              {/* Left accent bar */}
              <div
                className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b ${card.gradient} opacity-50 group-hover:opacity-100 group-hover:w-1 transition-all duration-300`}
              />
              {/* Hover glow */}
              <div
                className={`absolute -inset-10 ${card.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`}
              />
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-lg
                    group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl
                    transition-all duration-300`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm group-hover:text-white transition-colors duration-200">
                    {card.title}
                  </p>
                  <p className="text-xs text-on-surface-muted mt-0.5 transition-colors duration-200">
                    {card.desc}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-on-surface-muted group-hover:text-accent group-hover:translate-x-1 transition-all duration-300 shrink-0"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Status pill */}
        <div className="flex items-center justify-center gap-2 py-3 mb-4">
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
            px-5 py-3.5 rounded-2xl backdrop-blur-xl
            bg-surface-elevated border border-border-subtle text-on-surface-muted
            hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400
            hover:scale-[1.01] active:scale-[0.99]
            transition-all duration-300 text-sm font-semibold"
        >
          <LogOut
            size={14}
            className="group-hover:rotate-12 transition-transform duration-300"
          />
          Системээс гарах
        </button>
      </div>
    </div>
  );
}
