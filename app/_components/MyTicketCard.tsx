"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  QrCode,
  Download,
  X,
  Mail,
  Loader2,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Send,
  Repeat,
} from "lucide-react";
import Image from "next/image";

interface Booking {
  seatId: string;
  qrToken: string;
  status: string;
  boardedAt: string | null;
}

interface Props {
  refreshKey?: number;
  onCancelled?: () => void;
  onChanged?: () => void;
}

interface EmptySeat {
  seatId: string;
  isPremium: boolean;
}

export default function MyTicketCard({ refreshKey, onCancelled, onChanged }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showManage, setShowManage] = useState<null | "change" | "give" | "swap">(null);
  const [resending, setResending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [busy, setBusy] = useState(false);

  // Change: list of empty seats
  const [emptySeats, setEmptySeats] = useState<EmptySeat[]>([]);
  const [selectedNewSeat, setSelectedNewSeat] = useState<string>("");

  // Give / Swap: target user name
  const [targetName, setTargetName] = useState("");

  const cancel = async () => {
    if (!booking || cancelling) return;
    setCancelling(true);
    try {
      const r = await fetch("/api/bus/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId: booking.seatId }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(d.error || "Цуцлахад алдаа гарлаа");
        return;
      }
      toast.success(`${booking.seatId} суудлын захиалга цуцлагдлаа`);
      setBooking(null);
      setShowCancelConfirm(false);
      setShowQr(false);
      onCancelled?.();
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setCancelling(false);
    }
  };

  const openManage = async (kind: "change" | "give" | "swap") => {
    setShowQr(false);
    setTargetName("");
    setSelectedNewSeat("");
    setShowManage(kind);
    if (kind === "change") {
      try {
        const r = await fetch("/api/bus/status");
        const d = await r.json();
        const takenIds = new Set(
          (d.bookings || []).map((b: { seatId: string }) => b.seatId),
        );
        const empties: EmptySeat[] = (d.layout || [])
          .filter((s: { seatId: string }) => !takenIds.has(s.seatId))
          .map((s: { seatId: string; isPremium?: boolean }) => ({
            seatId: s.seatId,
            isPremium: !!s.isPremium,
          }))
          .sort((a: EmptySeat, b: EmptySeat) => {
            const na = parseInt(a.seatId.replace(/\D/g, "")) || 0;
            const nb = parseInt(b.seatId.replace(/\D/g, "")) || 0;
            return na - nb;
          });
        setEmptySeats(empties);
      } catch {
        toast.error("Суудлын мэдээлэл татахад алдаа");
      }
    }
  };

  const closeManage = () => {
    if (busy) return;
    setShowManage(null);
    setTargetName("");
    setSelectedNewSeat("");
  };

  const submitChange = async () => {
    if (!selectedNewSeat || busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/bus/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSeatId: selectedNewSeat }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.error || "Солиход алдаа");
        return;
      }
      toast.success(`Суудал ${d.booking.seatId} руу шилжлээ`);
      setShowManage(null);
      onChanged?.();
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setBusy(false);
    }
  };

  const submitGive = async () => {
    if (!targetName.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/bus/give", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserName: targetName.trim() }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.error || "Шилжүүлэхэд алдаа");
        return;
      }
      toast.success(`${d.newOwner}-д ${d.seatId} шилжлээ`);
      setShowManage(null);
      onChanged?.();
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setBusy(false);
    }
  };

  const submitSwap = async () => {
    if (!targetName.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/bus/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withUserName: targetName.trim() }),
      });
      const d = await r.json();
      if (!r.ok) {
        toast.error(d.error || "Солиход алдаа");
        return;
      }
      toast.success(`Та одоо ${d.mySeat} суудалтай`);
      setShowManage(null);
      onChanged?.();
    } catch {
      toast.error("Сүлжээний алдаа");
    } finally {
      setBusy(false);
    }
  };

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
                aria-label="Тасалбарын хуудас нээх"
                className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <ExternalLink size={12} />
              </a>
              {!isBoarded && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  aria-label="Захиалга цуцлах"
                  className="py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center"
                >
                  <Trash2 size={12} />
                </button>
              )}
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

            {!isBoarded && (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <ManageBtn
                    icon={<Repeat size={13} />}
                    label="Солих"
                    onClick={() => openManage("change")}
                  />
                  <ManageBtn
                    icon={<Send size={13} />}
                    label="Шилжүүлэх"
                    onClick={() => openManage("give")}
                  />
                  <ManageBtn
                    icon={<ArrowRightLeft size={13} />}
                    label="Хос сол"
                    onClick={() => openManage("swap")}
                  />
                </div>
                <button
                  onClick={() => {
                    setShowQr(false);
                    setShowCancelConfirm(true);
                  }}
                  className="mt-2 w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Захиалга цуцлах
                </button>
              </>
            )}
          </div>
          <style>{`@keyframes sheetUp { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }`}</style>
        </div>
      )}

      {showManage && booking && (
        <div
          className="fixed inset-0 z-[125] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={closeManage}
        >
          <div
            className="relative w-full max-w-sm bg-zinc-900 rounded-[28px] p-6 border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "sheetUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            <button
              onClick={closeManage}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
            >
              <X size={16} />
            </button>

            {showManage === "change" && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Repeat size={16} className="text-blue-400" />
                  <h3 className="text-lg font-black">Суудал солих</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Одоогийн: <b className="text-white">{booking.seatId}</b>. Чөлөөт суудлаас сонго.
                </p>

                {emptySeats.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500 py-6">
                    Чөлөөт суудал алга байна
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto grid grid-cols-4 gap-2 pr-1 -mr-1">
                    {emptySeats.map((s) => (
                      <button
                        key={s.seatId}
                        onClick={() => setSelectedNewSeat(s.seatId)}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all border
                          ${
                            selectedNewSeat === s.seatId
                              ? "bg-blue-600 border-blue-500 text-white"
                              : s.isPremium
                                ? "bg-yellow-500/5 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                          }`}
                      >
                        {s.seatId}
                        {s.isPremium && <span className="ml-0.5">★</span>}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={closeManage}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700"
                  >
                    Болих
                  </button>
                  <button
                    onClick={submitChange}
                    disabled={!selectedNewSeat || busy}
                    className="flex-[1.5] py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 size={14} className="animate-spin" />}
                    Солих
                  </button>
                </div>
              </>
            )}

            {showManage === "give" && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Send size={16} className="text-emerald-400" />
                  <h3 className="text-lg font-black">Захиалга шилжүүлэх</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  <b className="text-white">{booking.seatId}</b> суудлыг бусад
                  хэрэглэгчид өгнө. Тэр хүн захиалгагүй байх шаардлагатай.
                </p>

                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
                  Хэнд шилжүүлэх (нэр)
                </label>
                <input
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="жишээ: bat_bold"
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  onKeyDown={(e) => e.key === "Enter" && submitGive()}
                />

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={closeManage}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700"
                  >
                    Болих
                  </button>
                  <button
                    onClick={submitGive}
                    disabled={!targetName.trim() || busy}
                    className="flex-[1.5] py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 size={14} className="animate-spin" />}
                    Шилжүүлэх
                  </button>
                </div>
              </>
            )}

            {showManage === "swap" && (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRightLeft size={16} className="text-violet-400" />
                  <h3 className="text-lg font-black">Хосорхон солих</h3>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Хосорхон захиалагчтайгаа <b className="text-white">{booking.seatId}</b>-ыг
                  солино. Хоёул суудалтай байх ёстой.
                </p>

                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
                  Хэн-тэй солих (нэр)
                </label>
                <input
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="жишээ: bat_bold"
                  autoFocus
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                  onKeyDown={(e) => e.key === "Enter" && submitSwap()}
                />

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={closeManage}
                    className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700"
                  >
                    Болих
                  </button>
                  <button
                    onClick={submitSwap}
                    disabled={!targetName.trim() || busy}
                    className="flex-[1.5] py-3 rounded-xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {busy && <Loader2 size={14} className="animate-spin" />}
                    Солих
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showCancelConfirm && booking && (
        <div
          className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => !cancelling && setShowCancelConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm bg-zinc-900 rounded-[28px] p-6 border border-red-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "sheetUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
            </div>
            <h3 className="text-xl font-black text-center mb-1">Цуцлах уу?</h3>
            <p className="text-center text-sm text-zinc-400 leading-relaxed mb-1">
              Суудал <b className="text-white">{booking.seatId}</b>-ыг чөлөөлөх гэж байна.
            </p>
            <p className="text-center text-[11px] text-zinc-500 mb-6">
              Цуцалсны дараа QR ажиллахгүй болно. Дараа нь дахин захиалахад өөр суудал сонгож болно.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="flex-1 py-3.5 rounded-2xl bg-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-widest hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50"
              >
                Болих
              </button>
              <button
                onClick={cancel}
                disabled={cancelling}
                className="flex-[1.5] py-3.5 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Цуцлах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ManageBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 text-zinc-300"
    >
      <span className="text-white">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}
