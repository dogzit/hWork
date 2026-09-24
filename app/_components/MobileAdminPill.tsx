"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Sparkles } from "lucide-react";

export default function MobileAdminPill() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => {
      setIsAdmin(
        localStorage.getItem("role") === "ADMIN" ||
          (localStorage.getItem("name") ?? "").toLowerCase() === "admin",
      );
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);

  if (!mounted || !isAdmin) return null;

  // Hide when already inside admin area to reduce clutter.
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="lg:hidden fixed bottom-20 right-3 z-40 pointer-events-none">
      <button
        onClick={() => router.push("/admin")}
        aria-label="Admin руу орох"
        className="pointer-events-auto group relative flex items-center gap-2 pl-3 pr-4 py-2.5
          rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700
          text-white text-xs font-black uppercase tracking-widest
          shadow-[0_8px_24px_-4px_rgba(139,92,246,0.5)]
          border border-white/20 backdrop-blur-md
          active:scale-95 transition-all duration-200
          hover:shadow-[0_10px_30px_-4px_rgba(139,92,246,0.7)]"
      >
        {/* Sparkle animation */}
        <span className="absolute -top-1 -right-1 text-yellow-300 opacity-70 animate-pulse">
          <Sparkles size={10} />
        </span>

        {/* Glow behind icon */}
        <span className="absolute inset-0 rounded-full bg-white/5 pointer-events-none" />

        <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white/15">
          <Shield size={13} className="text-white" strokeWidth={2.5} />
        </span>
        <span className="relative">Admin</span>
      </button>
    </div>
  );
}
