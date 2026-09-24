"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import LogoutConfirm from "./LogoutConfirm";

export default function RefreshButton() {
  const [showLogout, setShowLogout] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowLogout(true)}
        className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-surface-elevated border border-border
          hover:scale-110 active:scale-95 transition-all duration-200
          text-on-surface-muted hover:text-red-400"
        aria-label="Гарах"
      >
        <LogOut size={14} />
      </button>

      <LogoutConfirm open={showLogout} onClose={() => setShowLogout(false)} />
    </>
  );
}
