"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  Calendar,
  Plus,
  BookOpen,
  Edit3,
  ArrowRight,
  Settings,
} from "lucide-react";

export default function AdminHomePage() {
  const router = useRouter();

  const handleLogout = () => {
    toast.info("Гарч байна...", { duration: 1200 });
    setTimeout(() => {
      localStorage.removeItem("name");
      window.location.href = "/auth/login";
    }, 800);
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
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
      {/* Orbs — muted for admin */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-[160px] opacity-30 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-20 animate-pulse"
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

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-5 shadow-xl">
            <Settings size={24} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Админ удирдлага
          </h1>
          <p className="text-gray-600 text-sm">
            Хичээлийн хуваарь болон даалгаврын удирдлага
          </p>
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 gap-3 mb-3">
          {cards.map((card) => (
            <button
              key={card.href}
              type="button"
              onClick={() => {
                toast.info(`${card.title}...`, { duration: 900 });
                setTimeout(() => router.push(card.href), 300);
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]
                px-5 py-4 text-left
                hover:bg-white/[0.06] hover:border-white/15 hover:scale-[1.01] hover:shadow-lg
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
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200`}
                >
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-100 text-sm group-hover:text-white transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-500 transition-colors">
                    {card.desc}
                  </p>
                </div>
                <ArrowRight
                  size={15}
                  className="text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Status pill */}
        <div className="flex items-center justify-center gap-2 py-3 mb-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600">
            Систем хэвийн ажиллаж байна
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-2
            px-5 py-3 rounded-2xl
            bg-white/[0.02] border border-white/8 text-gray-600
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
