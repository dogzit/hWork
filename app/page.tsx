"use client";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, CheckSquare, MessageCircle, Search, Newspaper, Shuffle, User } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  // Hero cards — том, гол feature-ууд
  const hero = [
    {
      icon: <BookOpen size={28} className="text-white" />,
      gradient: "from-pink-600 to-orange-500",
      glow: "bg-pink-500",
      title: "Даалгавар",
      desc: "Шинэ даалгавраа шалгах",
      href: "/homeWork",
      emoji: "📚",
    },
    {
      icon: <Clock size={28} className="text-white" />,
      gradient: "from-blue-600 to-cyan-500",
      glow: "bg-blue-500",
      title: "Хуваарь",
      desc: "Өнөөдрийн цагууд",
      href: "/timeTable",
      emoji: "🕐",
    },
  ];

  // Grid cards — дунд хэмжээтэй
  const grid = [
    {
      icon: <CheckSquare size={22} className="text-white" />,
      gradient: "from-emerald-500 to-cyan-600",
      title: "Todo",
      desc: "Хийх ажлууд",
      href: "/todo",
    },
    {
      icon: <MessageCircle size={22} className="text-white" />,
      gradient: "from-violet-500 to-purple-600",
      title: "Чат",
      desc: "Ангийн чат",
      href: "/chat",
    },
    {
      icon: <Search size={22} className="text-white" />,
      gradient: "from-amber-500 to-orange-600",
      title: "Хайлт",
      desc: "Хүн, мэдээ хайх",
      href: "/search",
    },
    {
      icon: <Newspaper size={22} className="text-white" />,
      gradient: "from-rose-500 to-pink-600",
      title: "Мэдээ",
      desc: "Зураг, мэдээ",
      href: "/feed",
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface p-5 font-sans">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[160px] opacity-15 animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[160px] opacity-15 animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[200px] opacity-10" />
      </div>

      <div className="w-full max-w-md mx-auto pt-8 pb-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border shadow-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="flex-1">
              <p className="text-on-surface-muted text-xs font-semibold uppercase tracking-wider">11Д анги</p>
              <h1 className="text-2xl font-black tracking-tight">
                Сайн уу{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">!</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Hero Cards — 2 том card зэрэгцээ */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {hero.map((card) => (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className="group relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-elevated
                p-5 text-left aspect-square flex flex-col justify-between
                hover:border-border hover:scale-[1.03] hover:shadow-2xl
                active:scale-[0.97] transition-all duration-200"
            >
              {/* Background glow */}
              <div className={`absolute -inset-10 ${card.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

              {/* Top — icon */}
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {card.icon}
              </div>

              {/* Bottom — text */}
              <div className="relative">
                <p className="font-black text-lg leading-tight">{card.title}</p>
                <p className="text-xs text-on-surface-muted mt-0.5">{card.desc}</p>
              </div>

              {/* Corner emoji */}
              <span className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-300">
                {card.emoji}
              </span>
            </button>
          ))}
        </div>

        {/* Grid Cards — 2x2 дунд хэмжээ */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {grid.map((card) => (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated
                px-4 py-4 text-left
                hover:border-border hover:scale-[1.03] hover:shadow-xl
                active:scale-[0.97] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm">{card.title}</p>
                  <p className="text-[10px] text-on-surface-muted">{card.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Random Student — нэг тусдаа wide card */}
        <button
          onClick={() => router.push("/random")}
          className="group w-full relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated
            px-5 py-4 text-left mb-6
            hover:border-border hover:scale-[1.02] hover:shadow-xl
            active:scale-[0.98] transition-all duration-200"
        >
          <div className="absolute -inset-10 bg-indigo-500 rounded-full blur-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          <div className="relative flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <Shuffle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Сурагч сонгох</p>
              <p className="text-[10px] text-on-surface-muted">Санамсаргүй нэг хүн сонгох 🎲</p>
            </div>
            <span className="text-2xl opacity-30 group-hover:opacity-60 group-hover:animate-bounce transition-all">🎯</span>
          </div>
        </button>

        {/* Bottom bar — Profile */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/profile")}
            className="group flex-1 flex items-center justify-center gap-2
              px-5 py-3 rounded-2xl
              bg-surface-elevated border border-border-subtle text-on-surface-muted
              hover:border-accent/30 hover:text-accent
              hover:scale-[1.01] active:scale-[0.99]
              transition-all duration-200 text-xs font-semibold"
          >
            <User size={14} />
            Профайл
          </button>
        </div>
      </div>
    </div>
  );
}
