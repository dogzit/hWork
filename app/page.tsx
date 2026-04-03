"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Clock, BookOpen, CheckSquare, ArrowRight } from "lucide-react";

export default function HomeworkAddPage() {
  const router = useRouter();

  const handleLogout = async () => {
    toast.info("Гарч байна...", { duration: 1200 });
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("name");
    window.location.href = "/auth/login";
  };

  const cards = [
    {
      icon: <Clock size={22} className="text-white" />,
      gradient: "from-blue-600 to-cyan-500",
      glow: "bg-blue-500",
      shadow: "shadow-blue-900/40",
      ring: "ring-blue-500/20",
      title: "Хичээлийн хуваарь",
      desc: "Өнөөдрийн цагуудыг харах",
      href: "/timeTable",
    },
    {
      icon: <BookOpen size={22} className="text-white" />,
      gradient: "from-pink-600 to-orange-500",
      glow: "bg-pink-500",
      shadow: "shadow-pink-900/40",
      ring: "ring-pink-500/20",
      title: "Даалгавар",
      desc: "Шинэ даалгавраа шалгах",
      href: "/homeWork",
    },
    {
      icon: <CheckSquare size={22} className="text-white" />,
      gradient: "from-emerald-500 to-cyan-600",
      glow: "bg-emerald-500",
      shadow: "shadow-emerald-900/40",
      ring: "ring-emerald-500/20",
      title: "Хийх ажлууд",
      desc: "Төлөвлөгөөгөө хянах",
      href: "/todo",
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex items-center justify-center p-6 font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 dark:opacity-100 opacity-50">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-15 animate-pulse" />
        <div
          className="absolute bottom-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[160px] opacity-15 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[200px] opacity-10" />
        <div
          className="absolute inset-0 dark:opacity-[0.03] opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-surface-elevated border border-border mb-6 shadow-2xl">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Сайн байна уу,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              11д
            </span>
          </h1>
          <p className="text-on-surface-muted text-sm">Юу хийхийг сонгоно уу</p>
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {cards.map((card, i) => (
            <button
              key={card.href}
              type="button"
              onClick={() => router.push(card.href)}
              className={`group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated
                px-6 py-5 text-left
                hover:bg-surface-elevated hover:border-border hover:scale-[1.02] hover:shadow-xl
                active:scale-[0.98]
                transition-all duration-200`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Subtle left accent bar */}
              <div
                className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b ${card.gradient} opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              {/* Hover glow */}
              <div
                className={`absolute -inset-10 ${card.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <div className="relative flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200 ring-1 ${card.ring}`}
                >
                  {card.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface group-hover:text-on-surface transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-on-surface-muted mt-0.5 transition-colors">
                    {card.desc}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={18}
                  className="text-on-surface-muted group-hover:text-on-surface group-hover:translate-x-1 transition-all duration-200 shrink-0"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-2
            px-6 py-3.5 rounded-2xl
            bg-surface-elevated border border-border-subtle text-on-surface-muted
            hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400
            hover:scale-[1.01] active:scale-[0.99]
            transition-all duration-200 text-sm font-semibold"
        >
          <LogOut
            size={16}
            className="group-hover:rotate-12 transition-transform duration-200"
          />
          Системээс гарах
        </button>
      </div>
    </div>
  );
}
