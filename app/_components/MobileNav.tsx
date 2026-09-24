"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Clock,
  MessageCircle,
  Search,
  User,
} from "lucide-react";

const navItems = [
  { icon: <Home size={20} />, label: "Нүүр", href: "/" },
  { icon: <BookOpen size={20} />, label: "Даалгавар", href: "/homeWork" },
  { icon: <Clock size={20} />, label: "Хуваарь", href: "/timeTable" },
  { icon: <MessageCircle size={20} />, label: "Чат", href: "/chat" },
  { icon: <Search size={20} />, label: "Хайлт", href: "/search" },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200
                ${
                  active
                    ? "text-accent"
                    : "text-on-surface-muted hover:text-on-surface"
                }`}
            >
              <span className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-bold">{item.label}</span>
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
