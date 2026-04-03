"use client";

import { LogOut } from "lucide-react";

export default function RefreshButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2.5 rounded-2xl bg-surface-elevated border border-border
        hover:scale-110 active:scale-95 transition-all duration-200
        text-on-surface-muted hover:text-red-400"
      aria-label="Гарах"
    >
      <LogOut size={14} />
    </button>
  );
}
