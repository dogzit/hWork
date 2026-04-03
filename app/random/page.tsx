"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shuffle, Loader2 } from "lucide-react";

export default function RandomStudentPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const pick = async () => {
    setSpinning(true);
    setName(null);

    // Suspense animation
    const fakeNames = ["...", "🎲", "🤔", "🎯", "✨"];
    let i = 0;
    const interval = setInterval(() => {
      setName(fakeNames[i % fakeNames.length]);
      i++;
    }, 120);

    try {
      const res = await fetch("/api/random-student");
      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          clearInterval(interval);
          setName(data.name);
          setHistory((h) => [data.name, ...h.slice(0, 9)]);
          setSpinning(false);
        }, 1500);
      } else {
        clearInterval(interval);
        setName("Сурагч олдсонгүй");
        setSpinning(false);
      }
    } catch {
      clearInterval(interval);
      setName("Алдаа");
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10 w-full bg-surface/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-card-hover rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <Shuffle size={18} className="text-violet-400" />
        <h1 className="font-bold text-sm">Сурагч сонгох</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 w-full max-w-sm">
        {/* Result display */}
        <div className="w-full bg-surface-elevated border border-border rounded-3xl p-8 text-center mb-8 shadow-2xl">
          <div className={`text-5xl font-black mb-3 transition-all duration-300 ${spinning ? "animate-pulse scale-110" : ""}`}>
            {name ?? "?"}
          </div>
          <p className="text-on-surface-muted text-sm">
            {!name ? "Товч дарж сурагч сонгоно уу" : spinning ? "Сонгож байна..." : "Сонгогдлоо! 🎉"}
          </p>
        </div>

        {/* Spin button */}
        <button
          onClick={pick}
          disabled={spinning}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600
            text-white font-black uppercase tracking-wider text-sm
            hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-xl
            active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100
            transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          {spinning ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Shuffle size={18} />
          )}
          {spinning ? "Сонгож байна..." : "Санамсаргүй сонгох"}
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="w-full mt-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-muted mb-3">Түүх</p>
            <div className="space-y-1.5">
              {history.map((h, i) => (
                <div key={`${h}-${i}`} className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-sm">
                  <span className="text-on-surface-muted text-xs w-5">{i + 1}.</span>
                  <span className="font-semibold">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
