"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Clock,
  CheckSquare,
  MessageCircle,
  Search,
  Newspaper,
  Shuffle,
  User,
  Settings,
  Trophy,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: <Home size={20} />, label: "Нүүр хуудас", href: "/" },
  { icon: <BookOpen size={20} />, label: "Даалгавар", href: "/homeWork" },
  { icon: <Clock size={20} />, label: "Хуваарь", href: "/timeTable" },
  { icon: <CheckSquare size={20} />, label: "Todo", href: "/todo" },
  { icon: <MessageCircle size={20} />, label: "Чат", href: "/chat" },
  { icon: <Search size={20} />, label: "Хайлт", href: "/search" },
  { icon: <Newspaper size={20} />, label: "Мэдээ", href: "/feed" },
  { icon: <Shuffle size={20} />, label: "Сурагч сонгох", href: "/random" },
  { icon: <Trophy size={20} />, label: "Тэргүүлэгчид", href: "/leaderboard" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border bg-surface/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
          <span className="text-lg">🎓</span>
        </div>
        <div>
          <p className="text-sm font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            12Д Анги
          </p>
          <p className="text-[9px] text-on-surface-muted uppercase tracking-widest">
            Web App
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-accent/15 text-accent border border-accent/20"
                    : "text-on-surface-muted hover:text-on-surface hover:bg-card-hover border border-transparent"
                }`}
            >
              <span className={active ? "text-accent" : "text-on-surface-muted"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1">
        <div className="border-t border-border-subtle mb-2" />
        <button
          onClick={() => router.push("/profile")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-muted
            hover:text-on-surface hover:bg-card-hover transition-all duration-200"
        >
          <User size={20} />
          Профайл
        </button>
        <button
          onClick={() => router.push("/admin")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-muted
            hover:text-on-surface hover:bg-card-hover transition-all duration-200"
        >
          <Settings size={20} />
          Админ
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-muted
            hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} />
          Гарах
        </button>
      </div>
    </aside>
  );
}
