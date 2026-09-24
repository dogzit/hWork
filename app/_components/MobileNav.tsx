"use client";

import { useRouter, usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  BookOpen,
  Clock,
  MessageCircle,
  Search,
  Newspaper,
  User,
} from "lucide-react";

const navItems: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Home, label: "Нүүр", href: "/" },
  { icon: BookOpen, label: "Даалгавар", href: "/homeWork" },
  { icon: Clock, label: "Хуваарь", href: "/timeTable" },
  { icon: MessageCircle, label: "Чат", href: "/chat" },
  { icon: Newspaper, label: "Мэдээ", href: "/feed" },
  { icon: Search, label: "Хайлт", href: "/search" },
  { icon: User, label: "Профайл", href: "/profile" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/85 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-stretch justify-around gap-0.5 px-1.5 pt-1.5 pb-1">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              aria-current={active ? "page" : undefined}
              className={`relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5
                rounded-xl py-1.5 transition-all duration-200 active:scale-90
                ${
                  active
                    ? "text-accent bg-accent/10"
                    : "text-on-surface-muted hover:text-on-surface"
                }`}
            >
              {/* Идэвхтэй хуудасны дээд мөр */}
              {active && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-1 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent-glow)]" />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                className={`transition-transform duration-200 ${
                  active ? "scale-110" : ""
                }`}
              />
              <span className="text-[8px] sm:text-[9px] font-bold leading-none truncate max-w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
