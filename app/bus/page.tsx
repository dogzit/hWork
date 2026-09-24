"use client";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { Timer, Sparkles, MapPin, ChevronLeft } from "lucide-react";
import BusSeatPanel from "../_components/BusSeatPanel";

const LAUNCH_DATE = new Date("2026-04-27T00:00:00");

export default function BusPage() {
  const [isLocked, setIsLocked] = useState(true);
  const { push } = useRouter();

  useEffect(() => {
    const now = new Date();
    const diff = LAUNCH_DATE.getTime() - now.getTime();
    if (diff <= 0) {
      setIsLocked(false);
      return;
    }
    setIsLocked(true);
    const t = setTimeout(() => setIsLocked(false), diff);
    return () => clearTimeout(t);
  }, []);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/15 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        <div className="z-10 w-full max-w-sm text-center">
          <div className="relative inline-block mb-10">
            <div className="w-28 h-28 rounded-[40px] bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.3)] animate-float">
              <Timer size={48} className="text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-zinc-900 rounded-2xl border border-white/10 flex items-center justify-center animate-bounce">
              <Sparkles className="text-yellow-400" size={20} />
            </div>
          </div>

          <h1 className="text-6xl font-black tracking-tighter text-white mb-4 italic">
            SO{" "}
            <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 bg-clip-text text-transparent">
              SOON
            </span>
          </h1>

          <div className="space-y-3 mb-10">
            <p className="text-zinc-400 font-medium tracking-wide">
              Суудал захиалга эхлэхэд бэлэн үү?
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-pink-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <MapPin size={14} />
              4-р сарын 27-нд нээгдэнэ
            </div>
          </div>

          <div className="w-full h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-white/5 mb-12">
            <div className="h-full bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 w-full animate-shimmer" />
          </div>

          <button
            onClick={() => push("/")}
            className="group flex items-center justify-center gap-2 w-full py-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Буцах
          </button>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shimmer {
            animation: shimmer 3s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center pb-40 overflow-y-auto pt-12">
      <Toaster theme="dark" />

      <div className="w-full max-w-md px-6 mb-4">
        <div
          className="cursor-pointer text-zinc-500 hover:text-blue-500 transition-colors flex items-center gap-1 text-sm font-bold"
          onClick={() => push("/")}
        >
          <ChevronLeft size={16} /> Буцах
        </div>
      </div>

      <div className="w-full px-6">
        <BusSeatPanel />
      </div>
    </div>
  );
}
