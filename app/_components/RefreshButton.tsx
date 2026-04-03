"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    const name = localStorage.getItem("name");
    localStorage.clear();
    if (name) localStorage.setItem("name", name);
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className="p-2.5 rounded-2xl bg-surface-elevated border border-border
        hover:scale-110 active:scale-95 transition-all duration-200
        text-on-surface-muted hover:text-on-surface"
      aria-label="Шинэчлэх"
    >
      <RefreshCw
        size={14}
        className={spinning ? "animate-spin" : ""}
      />
    </button>
  );
}
