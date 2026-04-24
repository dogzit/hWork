"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { useRouter } from 'next/navigation';
import { Timer, Sparkles, MapPin, ChevronLeft } from "lucide-react";

interface Seat {
    seatId: string;
    x: number;
    y: number;
    isPremium: boolean;
    bookedBy: string | null;
    status: 'PENDING' | 'APPROVED' | null;
}

interface SeatModalProps {
    seat: Seat;
    currentUserName: string;
    onClose: () => void;
    onBook: (seat: Seat) => Promise<void>;
    onCancel: (seatId: string) => Promise<void>;
}

function SeatModal({ seat, currentUserName, onClose, onBook, onCancel }: SeatModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isBooked = !!seat.bookedBy;
    const isPending = seat.status === 'PENDING';
    const isOwnSeat = seat.bookedBy === currentUserName;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Дансны дугаар хуулагдлаа");
    };

    const handleAction = async () => {
        setIsLoading(true);
        if (isOwnSeat) {
            await onCancel(seat.seatId);
        } else {
            await onBook(seat);
        }
        setIsLoading(false);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center pb-8 px-4 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'sheetUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
            >
                <div className={`px-6 pt-8 pb-6 ${isBooked
                    ? (isPending ? "bg-orange-950/40" : "bg-red-950/40")
                    : (seat.isPremium ? "bg-yellow-950/40" : "bg-zinc-800/40")
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1 font-bold">Сонгосон суудал</p>
                            <h2 className="text-4xl font-black text-white tracking-tighter">{seat.seatId}</h2>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${isBooked
                            ? (isPending ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")
                            : (seat.isPremium ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : "bg-blue-500/10 text-blue-400 border-blue-500/20")
                            }`}>
                            {isBooked ? (isPending ? 'Хүлээгдэж буй' : 'Захиалагдсан') : seat.isPremium ? 'Эрэлттэй ★' : 'Чөлөөт'}
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
                                <span className="text-yellow-400 font-bold">Анхаар:</span> Энэхүү суудал нь төлбөртэй тул
                                <span
                                    onClick={() => copyToClipboard("360032005003654738")}
                                    className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mx-1 cursor-pointer font-mono border border-yellow-500/30 active:scale-95 inline-block transition-transform"
                                >
                                    360032005003654738
                                </span>
                                дансанд 2000₮ шилжүүлсний дараа хүсэлтээ баталгаажуулна уу. (Дансан дээр дарж хуулна уу)
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
                                disabled={isLoading}
                                className={`flex-[1.5] py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all ${isLoading ? "bg-zinc-700 text-zinc-500" :
                                    isOwnSeat ? "bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600/40" :
                                        seat.isPremium ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10" : "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                                    }`}
                            >
                                {isLoading ? 'Түр хүлээ...' : isOwnSeat ? 'Захиалга цуцлах' : seat.isPremium ? 'Хүсэлт илгээх' : 'Одоо захиалах'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes sheetUp { from { opacity:0; transform:translateY(100px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

export default function UserOrderPage() {
    const [isLocked, setIsLocked] = useState(true);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [currentUserName, setCurrentUserName] = useState('Guest');
    const { push } = useRouter();

    // Lockdown Logic
    useEffect(() => {
        const targetDate = new Date('2026-04-27T00:00:00');
        const checkTime = () => {
            const now = new Date();
            setIsLocked(now < targetDate);
        };
        checkTime();
        const interval = setInterval(checkTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const name = localStorage.getItem('name') || 'Guest';
        setCurrentUserName(name);
    }, []);

    const loadSeats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/bus/status');
            const data = await res.json();
            const merged = data.layout.map((l: any) => {
                const b = data.bookings.find((bk: any) => bk.seatId === l.seatId);
                return {
                    ...l,
                    bookedBy: b?.userName || null,
                    status: b?.status || null,
                    isPremium: !!l.isPremium
                };
            });
            setSeats(merged);
        } catch { toast.error('Мэдээлэл авахад алдаа гарлаа'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (!isLocked) loadSeats(); }, [loadSeats, isLocked]);

    const busHeight = useMemo(() => {
        if (seats.length === 0) return 600;
        return Math.max(...seats.map(s => s.y)) + 120;
    }, [seats]);

    const handleBook = async (seat: Seat) => {
        try {
            const res = await fetch('/api/bus/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seatId: seat.seatId,
                    userName: currentUserName,
                    status: seat.isPremium ? 'PENDING' : 'APPROVED'
                }),
            });
            if (res.ok) {
                toast.success(seat.isPremium ? 'Хүсэлт амжилттай илгээгдлээ' : 'Захиалга баталгаажлаа');
                setSelectedSeat(null);
                loadSeats();
            } else {
                const d = await res.json();
                toast.error(d.message || 'Алдаа');
            }
        } catch { toast.error('Сүлжээний алдаа'); }
    };

    const handleCancel = async (seatId: string) => {
        try {
            const res = await fetch('/api/bus/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatId, userName: currentUserName }),
            });
            if (res.ok) {
                toast.info('Захиалга цуцлагдлаа');
                setSelectedSeat(null);
                loadSeats();
            } else {
                const d = await res.json();
                toast.error(d.error || 'Цуцлахад алдаа гарлаа');
            }
        } catch { toast.error('Сүлжээний алдаа'); }
    };

    if (isLocked) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-600/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

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
                        SO <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-orange-400 bg-clip-text text-transparent">SOON</span>
                    </h1>

                    <div className="space-y-3 mb-10">
                        <p className="text-zinc-400 font-medium tracking-wide">Суудал захиалга эхлэхэд бэлэн үү?</p>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-pink-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <MapPin size={14} />
                            4-р сарын 27-нд нээгдэнэ
                        </div>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-white/5 mb-12">
                        <div className="h-full bg-gradient-to-r from-pink-500 via-violet-500 to-pink-500 w-full animate-shimmer" />
                    </div>

                    <button
                        onClick={() => push('/')}
                        className="group flex items-center justify-center gap-2 w-full py-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Буцах
                    </button>
                </div>

                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                    .animate-float {
                        animation: float 4s ease-in-out infinite;
                    }
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    .animate-shimmer {
                        animation: shimmer 3s infinite linear;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center pb-40 overflow-y-auto">
            <Toaster theme="dark" />

            <div className="w-full max-w-md px-6 pt-12 pb-8">
                <div
                    className='cursor-pointer text-zinc-500 hover:text-blue-500 transition-colors flex items-center gap-1 text-sm font-bold mb-6'
                    onClick={() => push('/')}
                >
                    <ChevronLeft size={16} /> Буцах
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter italic">BUS BOOKING</h1>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-500 font-bold">Transit Mode</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-center shadow-inner">
                        <p className="text-[9px] uppercase text-zinc-500 font-bold mb-1">Захиалсан</p>
                        <p className="text-xl font-black text-blue-500 leading-none">{seats.filter(s => s.bookedBy).length}/{seats.length}</p>
                    </div>
                </div>

                <div className="flex justify-between bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-[24px] backdrop-blur-sm shadow-xl">
                    {[
                        { l: 'Чөлөөт', c: '○', s: 'text-zinc-500' },
                        { l: 'VIP', c: '★', s: 'text-yellow-500' },
                        { l: 'Хүлээх', c: '⏳', s: 'text-orange-500' },
                        { l: 'Дүүрсэн', c: '✕', s: 'text-red-500' }
                    ].map(i => (
                        <div key={i.l} className="flex flex-col items-center">
                            <span className={`text-base ${i.s}`}>{i.c}</span>
                            <span className="text-[8px] uppercase font-bold text-zinc-600 tracking-tighter">{i.l}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-md px-6 relative">
                <div className="mx-8 h-14 bg-zinc-900 rounded-t-[50px] border-x border-t border-zinc-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="w-16 h-1 rounded-full bg-zinc-800 shadow-inner" />
                </div>

                <div className="relative bg-zinc-950 border-x-[12px] border-zinc-900 shadow-2xl">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800/30 -translate-x-1/2 pointer-events-none" />

                    <div className="px-8 py-6 border-b border-zinc-900/50 flex items-center gap-3 font-bold text-zinc-500 text-[10px] uppercase tracking-widest">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm shadow-inner">🚌</div>
                        Жолоочийн хэсэг
                    </div>

                    <div className="relative" style={{ minHeight: `${busHeight}px` }}>
                        {!loading && seats.map(seat => {
                            const isOwn = seat.bookedBy === currentUserName;
                            const isPending = seat.status === 'PENDING';
                            return (
                                <button
                                    key={seat.seatId}
                                    onClick={() => setSelectedSeat(seat)}
                                    style={{
                                        position: 'absolute',
                                        left: `${seat.x}px`,
                                        top: `${seat.y}px`,
                                    }}
                                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 text-[10px] font-black transition-all duration-300 active:scale-90
                                        ${isOwn
                                            ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                            : !!seat.bookedBy
                                                ? (isPending
                                                    ? "bg-orange-500/5 border-orange-500/30 text-orange-400"
                                                    : "bg-red-500/5 border-red-500/20 text-red-900 grayscale opacity-40")
                                                : seat.isPremium
                                                    ? "bg-yellow-500/5 border-yellow-500/40 text-yellow-500"
                                                    : "bg-zinc-900/40 border-zinc-800 text-zinc-600"
                                        }`}
                                >
                                    <span className="opacity-40 text-[7px] mb-0.5">{seat.seatId}</span>
                                    <span className="text-base leading-none">
                                        {isOwn ? '👤' : seat.bookedBy ? (isPending ? '⏳' : '✕') : seat.isPremium ? '★' : '○'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mx-8 h-10 bg-zinc-900 rounded-b-[24px] border-x border-b border-zinc-800 shadow-2xl" />
            </div>

            {selectedSeat && (
                <SeatModal
                    seat={selectedSeat}
                    currentUserName={currentUserName}
                    onClose={() => setSelectedSeat(null)}
                    onBook={handleBook}
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
}