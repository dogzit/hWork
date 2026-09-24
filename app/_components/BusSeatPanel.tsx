"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import BusBookingFlow from "./BusBookingFlow";

interface Seat {
  seatId: string;
  x: number;
  y: number;
  isPremium: boolean;
  bookedBy: string | null;
  status: "PENDING" | "APPROVED" | "BOARDED" | null;
}

interface SeatModalProps {
  seat: Seat;
  currentUserName: string;
  ownSeatId: string | null;
  onClose: () => void;
  onStartBook: (seat: Seat) => void;
  onCancel: (seatId: string) => Promise<void>;
}

function SeatModal({ seat, currentUserName, ownSeatId, onClose, onStartBook, onCancel }: SeatModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isBooked = !!seat.bookedBy;
  const isPending = seat.status === "PENDING";
  const isOwnSeat = seat.bookedBy === currentUserName;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Дансны дугаар хуулагдлаа");
  };

  // 1 хүн 1 суудал: өөр суудалтай хэрэглэгч чөлөөт суудал дээр дарвал зогсооно
  const blockedByLimit =
    !isBooked && !isOwnSeat && !!ownSeatId && ownSeatId !== seat.seatId;

  const handleAction = async () => {
    if (isOwnSeat) {
      setIsLoading(true);
      await onCancel(seat.seatId);
      setIsLoading(false);
    } else {
      onStartBook(seat);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center pb-8 px-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "sheetUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
      >
        <div
          className={`px-6 pt-8 pb-6 ${
            isBooked
              ? isPending
                ? "bg-orange-950/40"
                : "bg-red-950/40"
              : seat.isPremium
                ? "bg-yellow-950/40"
                : "bg-zinc-800/40"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-bold">
                Сонгосон суудал
              </p>
              <h2 className="text-4xl font-black text-white tracking-tighter">{seat.seatId}</h2>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${
                isBooked
                  ? isPending
                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                  : seat.isPremium
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
            >
              {isBooked
                ? isPending
                  ? "Хүлээгдэж буй"
                  : "Захиалагдсан"
                : seat.isPremium
                  ? "Эрэлттэй ★"
                  : "Чөлөөт"}
            </div>
          </div>

          {isBooked && (
            <div className="flex items-center gap-3 bg-zinc-950/50 rounded-2xl px-4 py-3 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-black border border-white/10 italic text-blue-400">
                {seat.bookedBy?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Захиалагч</p>
                <p className="text-white font-bold text-base">
                  {isOwnSeat ? `${seat.bookedBy} (Та)` : seat.bookedBy}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-6 bg-zinc-900">
          {!isBooked && seat.isPremium && (
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl px-4 py-4 mb-6">
              <p className="text-yellow-200/70 text-xs leading-relaxed">
                <span className="text-yellow-400 font-bold">Анхаар:</span> Энэхүү суудал нь
                төлбөртэй тул
                <span
                  onClick={() => copyToClipboard("360032005003654738")}
                  className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mx-1 cursor-pointer font-mono border border-yellow-500/30 active:scale-95 inline-block transition-transform"
                >
                  360032005003654738
                </span>
                дансанд 2000₮ шилжүүлсний дараа хүсэлтээ баталгаажуулна уу. (Дансан дээр дарж
                хуулна уу)
              </p>
            </div>
          )}

          {blockedByLimit && (
            <div className="bg-orange-500/5 border border-orange-500/15 rounded-2xl px-4 py-3 mb-4">
              <p className="text-orange-200/80 text-xs leading-relaxed">
                <span className="text-orange-400 font-bold">1 хүн 1 суудал:</span>{" "}
                Таны {ownSeatId} суудал аль хэдийн захиалагдсан байна.
                Шинээр авахын тулд өмнөх захиалгаа цуцлаа уу.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Буцах
            </button>

            {(!isBooked || isOwnSeat) && (
              <button
                onClick={handleAction}
                disabled={isLoading || blockedByLimit}
                className={`flex-[1.5] py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all ${
                  isLoading
                    ? "bg-zinc-700 text-zinc-500"
                    : isOwnSeat
                      ? "bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600/40"
                      : seat.isPremium
                        ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                }`}
              >
                {isLoading
                  ? "Түр хүлээ..."
                  : isOwnSeat
                    ? "Захиалга цуцлах"
                    : blockedByLimit
                      ? "Нэг суудал л боломжтой"
                      : seat.isPremium
                        ? "Хүсэлт илгээх"
                        : "Одоо захиалах"}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes sheetUp { from { opacity:0; transform:translateY(100px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

export default function BusSeatPanel() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [bookingSeat, setBookingSeat] = useState<Seat | null>(null);
  const [currentUserName, setCurrentUserName] = useState("Guest");

  useEffect(() => {
    const name = localStorage.getItem("name") || "Guest";
    setCurrentUserName(name);
  }, []);

  const loadSeats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bus/status");
      const data = await res.json();
      const merged = data.layout.map((l: { seatId: string; x: number; y: number; isPremium?: boolean }) => {
        const b = data.bookings.find((bk: { seatId: string; userName: string; status: string }) => bk.seatId === l.seatId);
        return {
          ...l,
          bookedBy: b?.userName || null,
          status: b?.status || null,
          isPremium: !!l.isPremium,
        };
      });
      setSeats(merged);
    } catch {
      toast.error("Мэдээлэл авахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  const busHeight = useMemo(() => {
    if (seats.length === 0) return 600;
    return Math.max(...seats.map((s) => s.y)) + 120;
  }, [seats]);

  const handleCancel = async (seatId: string) => {
    try {
      const res = await fetch("/api/bus/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId }),
      });
      if (res.ok) {
        toast.info("Захиалга цуцлагдлаа");
        setSelectedSeat(null);
        loadSeats();
      } else {
        const d = await res.json();
        toast.error(d.error || "Цуцлахад алдаа гарлаа");
      }
    } catch {
      toast.error("Сүлжээний алдаа");
    }
  };

  // 1 хүн 1 суудал: одоогийн хэрэглэгчийн захиалсан суудал
  const ownSeat = seats.find((s) => s.bookedBy === currentUserName) ?? null;

  const handleSeatClick = (seat: Seat) => {
    if (
      !seat.bookedBy &&
      ownSeat &&
      ownSeat.seatId !== seat.seatId
    ) {
      toast.error(
        `Та аль хэдийн ${ownSeat.seatId} суудал захиалсан байна. 1 хүн 1 суудал!`,
      );
      return;
    }
    setSelectedSeat(seat);
  };

  return (
    <div className="w-full text-white flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tighter italic">BUS BOOKING</h2>
            <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-bold">
              Transit Mode
            </p>
            {ownSeat && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-400">
                  Таны суудал: {ownSeat.seatId}
                </span>
              </div>
            )}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-center shadow-inner">
            <p className="text-[9px] uppercase text-zinc-500 font-bold mb-1">Захиалсан</p>
            <p className="text-xl font-black text-blue-500 leading-none">
              {seats.filter((s) => s.bookedBy).length}/{seats.length}
            </p>
          </div>
        </div>

        <div className="flex justify-between bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-[24px] backdrop-blur-sm shadow-xl mb-4">
          {[
            { l: "Чөлөөт", c: "○", s: "text-zinc-500" },
            { l: "VIP", c: "★", s: "text-yellow-500" },
            { l: "Хүлээх", c: "⏳", s: "text-orange-500" },
            { l: "Дүүрсэн", c: "✕", s: "text-red-500" },
          ].map((i) => (
            <div key={i.l} className="flex flex-col items-center">
              <span className={`text-base ${i.s}`}>{i.c}</span>
              <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-tighter">
                {i.l}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="mx-8 h-14 bg-zinc-900 rounded-t-[50px] border-x border-t border-zinc-800 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="w-16 h-1 rounded-full bg-zinc-800 shadow-inner" />
        </div>

        <div className="relative bg-zinc-950 border-x-[12px] border-zinc-900 shadow-2xl">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800/30 -translate-x-1/2 pointer-events-none" />

          <div className="px-8 py-6 border-b border-zinc-900/50 flex items-center gap-3 font-bold text-zinc-500 text-[10px] uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm shadow-inner">
              🚌
            </div>
            Жолоочийн хэсэг
          </div>

          <div className="relative" style={{ minHeight: `${busHeight}px` }}>
            {!loading &&
              seats.map((seat) => {
                const isOwn = seat.bookedBy === currentUserName;
                const isPending = seat.status === "PENDING";
                return (
                  <button
                    key={seat.seatId}
                    onClick={() => handleSeatClick(seat)}
                    style={{
                      position: "absolute",
                      left: `${seat.x}px`,
                      top: `${seat.y}px`,
                    }}
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 text-[10px] font-black transition-all duration-300 active:scale-90
                      ${
                        isOwn
                          ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : seat.bookedBy
                            ? isPending
                              ? "bg-orange-500/5 border-orange-500/30 text-orange-400"
                              : "bg-red-500/5 border-red-500/20 text-red-900 grayscale opacity-40"
                            : seat.isPremium
                              ? "bg-yellow-500/5 border-yellow-500/40 text-yellow-500"
                              : "bg-zinc-900/40 border-zinc-800 text-zinc-600"
                      }`}
                  >
                    <span className="opacity-40 text-[7px] mb-0.5">{seat.seatId}</span>
                    <span className="text-base leading-none">
                      {isOwn ? "👤" : seat.bookedBy ? (isPending ? "⏳" : "✕") : seat.isPremium ? "★" : "○"}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="mx-8 h-10 bg-zinc-900 rounded-b-[24px] border-x border-b border-zinc-800 shadow-2xl" />
      </div>

      {selectedSeat && !bookingSeat && (
        <SeatModal
          seat={selectedSeat}
          currentUserName={currentUserName}
          ownSeatId={ownSeat?.seatId ?? null}
          onClose={() => setSelectedSeat(null)}
          onStartBook={(s) => {
            setBookingSeat(s);
          }}
          onCancel={handleCancel}
        />
      )}

      {bookingSeat && (
        <BusBookingFlow
          seat={bookingSeat}
          onClose={() => {
            setBookingSeat(null);
            setSelectedSeat(null);
          }}
          onDone={() => {
            loadSeats();
          }}
        />
      )}
    </div>
  );
}
