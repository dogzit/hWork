"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import RefreshButton from "./RefreshButton";

/** Баруун талын товчнууд — header болон banner хоёуланд ашиглаж болно */
export function HeaderActions({ showProfile = true }: { showProfile?: boolean }) {
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    // Effect-ийн шууд setState-ийг зөрүүлэхгүйн тулд timeout ашиглана
    const t = setTimeout(() => setMe(localStorage.getItem("name")), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <NotificationBell />
      <RefreshButton />
      <ThemeToggle />
      {showProfile && (
        <button
          onClick={() => router.push("/profile")}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-surface-elevated border border-border
            hover:scale-110 active:scale-95 transition-all duration-200 overflow-hidden
            flex items-center justify-center text-accent text-xs font-black"
          aria-label="Профайл"
        >
          {me ? me[0]?.toUpperCase() : <User size={14} />}
        </button>
      )}
    </div>
  );
}

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  /** Буцах товч харуулах (default: true) */
  showBack?: boolean;
  onBack?: () => void;
  showProfile?: boolean;
  /** Товчнуудын өмнө нэмэлт элемент (жишээ: онлайн цэг) */
  children?: React.ReactNode;
};

/**
 * Бүх хуудсын нэгдсэн header — чат/мэдээ/хайт хуудасны
 * sticky header хэвээр: notification + гарах + theme + профайл.
 */
export default function AppHeader({
  title,
  subtitle,
  icon,
  showBack = true,
  onBack,
  showProfile = true,
  children,
}: Props) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-xl border-b border-border px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
      {showBack && (
        <button
          onClick={() => (onBack ? onBack() : router.push("/"))}
          className="p-2 hover:bg-card-hover rounded-xl transition-all shrink-0"
          aria-label="Буцах"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      {icon}
      <div className="min-w-0 flex-1">
        <h1 className="font-bold text-sm truncate">{title}</h1>
        {subtitle && (
          <p className="text-[10px] text-on-surface-muted truncate">{subtitle}</p>
        )}
      </div>
      {children}
      <HeaderActions showProfile={showProfile} />
    </div>
  );
}
