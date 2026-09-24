"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, QrCode, Download, X, Mail, Loader2 } from "lucide-react";
import Image from "next/image";

interface Booking {
  seatId: string;
  qrToken: string;
  status: string;
  boardedAt: string | null;
}

interface Props {
  refreshKey?: number;
}

export default function MyTicketCard({ refreshKey }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (resending) return;
    setResending(true);
    try {
      const r = await fetch("/api/bus/my-booking/resend", { method: "POST" });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.error || "Илгээхэд алдаа");
      } else if (d.dev) {
        toast.info("Dev режим: email console-д хэвлэгдэв");
      } else {
        toast.success(`Шинэ QR ${d.email} рүү илгээгдэв`);
      }
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/bus/my-booking");
        if (!r.ok) return;
        const d = await r.json();
        if (cancelled) return;
        setBooking(d.hasBooking ? d.booking : null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading || !booking) return null;

  const isPending = booking.status === "PENDING";
  const isBoarded = booking.status === "BOARDED" || !!booking.boardedAt;
  const qrSrc = `/api/qr/${encodeURIComponent(booking.qrToken)}`;

  return (
    <>
      <div
        className={`w-full max-w-md mb-6 rounded-3xl overflow-hidden border shadow-2xl relative
          ${
            isBoarded
              ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-teal-950/40"
              : isPending
                ? "border-orange-500/30 bg-gradient-to-br from-orange-950/40 via-zinc-900 to-amber-950/40"
                : "border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-zinc-900 to-indigo-950/40"
          }`}
      >
        {/* Perforated edge effect */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#0a0a0f] rounded-r-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#0a0a0f] rounded-l-full" />

        <div className="p-5 flex items-center gap-4">
          <button
            onClick={() => setShowQr(true)}
            className="shrink-0 relative w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg active:scale-95 transition-transform"
            aria-label="QR-г томроор харах"
          >
            <Image
              src={qrSrc}
              alt="QR"
              width={96}
              height={96}
              className="w-full h-full"
              unoptimized
              priority
            />
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
              <QrCode size={12} className="text-white" />
            </span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                Миний тасалбар
              </span>
              {isBoarded && (
                <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  ✓ Суусан
                </span>
              )}
              {isPending && (
                <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">
                  ⏳ Хүлээх
                </span>
              )}
            </div>
            <p className="text-3xl font-black tracking-tighter leading-none">
              Суудал {booking.seatId}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setShowQr(true)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-wider hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <QrCode size={12} /> QR томроор
              </button>
              <a
                href={`/bus/ticket/${encodeURIComponent(booking.qrToken)}`}
                className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {showQr && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setShowQr(false)}
        >
          <div
            className="relative w-full max-w-sm bg-zinc-900 rounded-[32px] p-6 border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "sheetUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-1">
                Суудал
              </p>
              <p className="text-4xl font-black tracking-tighter">{booking.seatId}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
              <Image
                src={qrSrc}
                alt="QR"
                width={320}
                height={320}
                className="w-full h-auto"
                unoptimized
                priority
              />
            </div>

            <p className="text-center text-[11px] text-zinc-400 mb-4 leading-relaxed">
              Админд үзүүлж, скан хийлгэнэ үү. Дэлгэц гэрэлтүүлээд, QR-ыг нээлттэй харуулна.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrSrc}
                download={`bus-qr-${booking.seatId}.png`}
                className="py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} /> Татах
              </a>
              <a
                href={`/bus/ticket/${encodeURIComponent(booking.qrToken)}`}
                className="py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} /> Тасалбар
              </a>
            </div>

            <button
              onClick={resend}
              disabled={resending}
              className="mt-2 w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Mail size={14} />
              )}
              Email рүү шинээр илгээх
            </button>
          </div>
          <style>{`@keyframes sheetUp { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
        </div>
      )}
    </>
  );
}
