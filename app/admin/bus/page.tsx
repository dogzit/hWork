"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    DndContext, useSensor, useSensors, PointerSensor,
    DragEndEvent, useDraggable
} from '@dnd-kit/core';
import { toast, Toaster } from 'sonner';

interface Seat {
    id: string;
    x: number;
    y: number;
    isPremium: boolean;
    status?: 'PENDING' | 'APPROVED' | null;
    bookedBy?: string | null;
}

function AdminSeat({
    seat,
    tool,
    onClick,
}: {
    seat: Seat;
    tool: 'move' | 'premium' | 'delete' | 'approve';
    onClick: (seat: Seat) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: seat.id,
        disabled: tool !== 'move'
    });

    const style: React.CSSProperties = {
        position: 'absolute',
        // x болон y-г бүхэл тоо байлгах нь чухал
        left: Math.round(seat.x),
        top: Math.round(seat.y),
        transform: transform
            ? `translate(${Math.round(transform.x)}px, ${Math.round(transform.y)}px)`
            : undefined,
        zIndex: isDragging ? 50 : 1,
        touchAction: 'none',
    };

    const isPending = seat.status === 'PENDING';
    const isApproved = seat.status === 'APPROVED';

    return (
        <div ref={setNodeRef} style={style} className="group">
            <button
                {...(tool === 'move' ? { ...listeners, ...attributes } : {})}
                onClick={() => onClick(seat)}
                className={`
                    w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5
                    transition-all duration-200 select-none border-2 text-[10px] font-bold
                    ${isDragging ? "scale-110 shadow-2xl opacity-90 rotate-3" : ""}
                    ${tool === 'move' ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                    ${isPending ? "animate-pulse border-orange-500 bg-orange-950/50 text-orange-400" :
                        isApproved ? "border-red-800 bg-red-950/30 text-red-500" :
                            seat.isPremium ? "border-yellow-600/50 bg-yellow-950/40 text-yellow-400" :
                                "border-zinc-800 bg-zinc-900 text-zinc-500"}
                `}
            >
                <span className="text-[8px] opacity-40 leading-none">{seat.id}</span>
                <span className="text-sm">
                    {isPending ? '⏳' : isApproved ? '✕' : seat.isPremium ? '★' : '○'}
                </span>
            </button>
        </div>
    );
}

export default function AdminBusPage() {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tool, setTool] = useState<'move' | 'premium' | 'delete' | 'approve'>('move');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [approvalTarget, setApprovalTarget] = useState<Seat | null>(null);

    const loadData = useCallback(async () => {
        try {
            const res = await fetch('/api/bus/status');
            const data = await res.json();
            if (data.layout) {
                const merged = data.layout.map((l: any) => {
                    const b = data.bookings?.find((bk: any) => bk.seatId === l.seatId);
                    return {
                        id: l.seatId,
                        x: l.x,
                        y: l.y,
                        isPremium: !!l.isPremium,
                        status: b?.status || null,
                        bookedBy: b?.userName || null
                    };
                });
                setSeats(merged);
            }
        } catch (err) {
            toast.error("Мэдээлэл татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, delta } = e;

        setSeats(prev => prev.map(s => {
            if (s.id === active.id) {

                const newX = s.x + delta.x;
                const newY = s.y + delta.y;

                return {
                    ...s,


                    x: Math.round(newX / 5) * 5,
                    y: Math.round(newY / 5) * 5
                };
            }
            return s;
        }));
    };

    const handleSeatClick = (seat: Seat) => {
        if (tool === 'premium') {
            setSeats(prev => prev.map(s => s.id === seat.id ? { ...s, isPremium: !s.isPremium } : s));
            toast.info(`${seat.id} төлөв солигдлоо`);
        } else if (tool === 'delete') {
            setDeleteTarget(seat.id);
        } else if (tool === 'approve' || (tool === 'move' && seat.status === 'PENDING')) {
            if (seat.status === 'PENDING') setApprovalTarget(seat);
            else toast.error("Энэ суудал дээр хүсэлт ирээгүй байна");
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch('/api/bus/layout/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatId: deleteTarget }),
            });
            if (res.ok) {
                setSeats(prev => prev.filter(s => s.id !== deleteTarget));
                toast.success(`${deleteTarget} суудал бүрмөсөн устлаа`);
            } else {
                toast.error('Устгахад алдаа гарлаа');
            }
        } catch {
            toast.error('Сүлжээний алдаа гарлаа');
        } finally {
            setDeleteTarget(null);
        }
    };

    const autoAlign = () => {
        const sortedSeats = [...seats].sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
            return numA - numB;
        });

        const startX = 42; // Зураг дээрх шиг төв рүү нь бага зэрэг шахъя
        const startY = 80; // Driver хэсгээс доошоо зай (зураг дээр нэлээн доор байна)
        const seatSize = 50;
        const gapX = 12;
        const gapY = 20;
        const aisle = 55; // Дунд талын зам

        const aligned = sortedSeats.map((seat) => {
            const num = parseInt(seat.id.replace(/\D/g, '')) || 1;

            let x = 0;
            let y = 0;

            if (num <= 40) {
                // Эгнээг тооцоолох: S1,2,3,4 бол 1-р эгнээ. S5,6,7,8 бол 2-р эгнээ.
                const rowIndex = Math.floor((num - 1) / 4);
                // Баганыг тооцоолох: 1->0, 2->1, 3->2, 4->3
                const colIndex = (num - 1) % 4;

                x = startX + (colIndex * (seatSize + gapX)) + (colIndex >= 2 ? aisle : 0);
                y = startY + (rowIndex * (seatSize + gapY));
            } else {
                // Арын эгнээ S41-S45
                const backIndex = num - 41;
                x = startX + (backIndex * (seatSize + 8));
                y = startY + (10 * (seatSize + gapY)) + 25;
            }

            return { ...seat, x, y };
        });

        setSeats(aligned);
        toast.success("Байрлалыг зурагтай ижилхэн болгож заслаа ✨");
    };
    const saveLayout = async () => {
        setSaving(true);

        // Бааз руу явуулах өгөгдлийг цэвэрлэх
        const cleanedSeats = seats.map(s => ({
            ...s,
            x: Math.floor(s.x), // Бүхэл тоо болгох
            y: Math.floor(s.y)
        }));

        try {
            const res = await fetch('/api/bus/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seats: cleanedSeats }),
            });
            if (res.ok) toast.success('Байрлал бүхэл тоогоор хадгалагдлаа');
        } catch {
            toast.error('Алдаа гарлаа');
        } finally {
            setSaving(false);
        }
    };
    const processBooking = async (status: 'APPROVED' | 'REJECTED') => {
        if (!approvalTarget) return;
        try {
            const res = await fetch('/api/bus/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seatId: approvalTarget.id, status }),
            });
            if (res.ok) {
                toast.success(status === 'APPROVED' ? 'Баталгаажлаа' : 'Цуцлагдлаа');
                setApprovalTarget(null);
                loadData();
            }
        } catch {
            toast.error("Алдаа гарлаа");
        }
    };

    const addSeat = () => {
        const existingIds = seats
            .map(s => parseInt(s.id.replace(/\D/g, '')))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);

        let nextNumber = 1;
        for (let i = 0; i < existingIds.length; i++) {
            if (existingIds[i] === nextNumber) {
                nextNumber++;
            } else if (existingIds[i] > nextNumber) {
                break;
            }
        }

        const nextId = `S${nextNumber}`;

        // Координат тохиргоо (Зураг дээрхтэй ойролцоо харагдуулах)
        const startX = 35; // Зүүн талаас авах зай
        const startY = 130; // Дээд талаас (Жолоочийн хэсгээс) авах зай
        const seatSize = 52; // Суудлын хэмжээ + бага зэрэг зай
        const gapX = 10;
        const gapY = 15;
        const aisle = 45; // Дунд талын зам

        let calculatedX = 0;
        let calculatedY = 0;

        // Хэрэв суудал 40-өөс бага бол (2:2 зохион байгуулалт)
        if (nextNumber <= 40) {
            const index = nextNumber - 1;
            const row = Math.floor(index / 4);
            const col = index % 4;

            calculatedX = startX + (col * (seatSize + gapX)) + (col >= 2 ? aisle : 0);
            calculatedY = startY + (row * (seatSize + gapY));
        }
        // Хэрэв 41 болон түүнээс дээш бол (Арын бүтэн эгнээ)
        else {
            const backRowIndex = nextNumber - 41;
            const row = 10; // 11 дэх эгнээ (40 суудал / 4 = 10 эгнээний дараа)

            // Арын эгнээнд зам байхгүй, 5 суудал шууд цуварна
            calculatedX = startX + (backRowIndex * (seatSize + 5));
            calculatedY = startY + (row * (seatSize + gapY)) + 20; // Бага зэрэг зай авна
        }

        setSeats([...seats, {
            id: nextId,
            x: calculatedX,
            y: calculatedY,
            isPremium: false
        }]);

        toast.success(`${nextId} байрлалд нэмэгдлээ`);
    };
    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center pb-40 overflow-y-auto overflow-x-hidden">
            <Toaster theme="dark" />

            {/* Header */}
            <div className="w-full max-w-md px-6 pt-10 flex-shrink-0">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter italic">BUS ADMIN</h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Designer & Orders</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] bg-blue-900/40 text-blue-400 border border-blue-800 px-3 py-1 rounded-full font-bold">
                            {seats.length} СУУДАЛ
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 mb-8 sticky top-4 z-[60] backdrop-blur-md">
                    {(['move', 'premium', 'approve', 'delete'] as const).map(t => (
                        <button key={t} onClick={() => setTool(t)}
                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${tool === t ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:bg-zinc-800"}`}>
                            {t === 'move' ? 'Зөөх' : t === 'premium' ? 'VIP' : t === 'approve' ? 'Хүсэлт' : 'Устгах'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bus Layout */}
            <div className="w-full max-w-md px-6 relative flex-grow">
                <div className="bg-zinc-950 border-x-[12px] border-zinc-900 rounded-t-[50px] shadow-2xl relative overflow-visible pb-24">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800/20 pointer-events-none" />
                    <div className="p-8 border-b border-zinc-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">🚌</div>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Driver</span>
                        </div>
                        <div className="w-12 h-2 rounded-full bg-zinc-800" />
                    </div>

                    <div className="relative" style={{
                        minHeight: seats.length > 0 ? Math.max(...seats.map(s => s.y)) + 120 : 600
                    }}>
                        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                            {seats.map(seat => (
                                <AdminSeat key={seat.id} seat={seat} tool={tool} onClick={handleSeatClick} />
                            ))}
                        </DndContext>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Add Seat */}
                    <button
                        onClick={addSeat}
                        className="
      flex items-center justify-center gap-2
      py-4 px-4
      bg-zinc-900/80 backdrop-blur
      border border-zinc-800
      rounded-2xl
      text-xs font-black tracking-widest text-white
      hover:bg-zinc-800
      hover:border-zinc-700
      active:scale-95
      transition-all duration-200
      shadow-lg shadow-black/20
    "
                    >
                        ➕ СУУДАЛ НЭМЭХ
                    </button>

                    {/* Auto Align */}
                    <button
                        onClick={autoAlign}
                        className="
      flex items-center justify-center gap-2
      py-4 px-4
      bg-gradient-to-r from-zinc-800 to-zinc-700
      border border-zinc-700
      rounded-2xl
      text-xs font-black tracking-widest text-white
      hover:from-zinc-700 hover:to-zinc-600
      active:scale-95
      transition-all duration-200
      shadow-lg shadow-black/20
    "
                    >
                        📏 БАЙРЛАЛ ТЭГШЛЭХ
                    </button>

                    {/* Save Layout */}
                    <button
                        onClick={saveLayout}
                        disabled={saving}
                        className="
      flex items-center justify-center gap-2
      py-4 px-4
      bg-gradient-to-r from-blue-600 to-indigo-600
      border border-blue-500/30
      rounded-2xl
      text-xs font-black tracking-widest text-white
      hover:from-blue-500 hover:to-indigo-500
      active:scale-95
      transition-all duration-200
      shadow-xl shadow-blue-900/30
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
                    >
                        💾 {saving ? 'ХАДГАЛЖ БАЙНА...' : 'ДИЗАЙН ХАДГАЛАХ'}
                    </button>

                </div>
            </div>

            {/* Approval Modal */}
            {approvalTarget && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setApprovalTarget(null)}>
                    <div className="w-full max-w-sm bg-zinc-900 rounded-[32px] p-6 border border-zinc-800 shadow-2xl animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">Захиалгын хүсэлт</p>
                                <h3 className="text-3xl font-black italic">Суудал {approvalTarget.id}</h3>
                            </div>
                            <div className="bg-orange-500/10 text-orange-500 p-2 rounded-xl border border-orange-500/20">⏳</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-2xl p-4 mb-8 border border-zinc-700/30">
                            <p className="text-zinc-500 text-[10px] uppercase mb-1">Захиалагч</p>
                            <p className="text-white font-bold text-lg">{approvalTarget.bookedBy || 'Тодорхойгүй'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => processBooking('REJECTED')}
                                className="flex-1 py-4 bg-zinc-800 rounded-2xl text-xs font-bold hover:bg-red-950 hover:text-red-400 transition-all">
                                ЦУЦЛАХ
                            </button>
                            <button onClick={() => processBooking('APPROVED')}
                                className="flex-1 py-4 bg-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20">
                                БАТАЛГААЖУУЛАХ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-zinc-900 p-8 rounded-[32px] border border-zinc-800 w-full max-w-xs text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-red-500/20">✕</div>
                        <h2 className="text-2xl font-black mb-2">Устгах уу?</h2>
                        <p className="text-zinc-500 text-sm mb-8">Суудал {deleteTarget} бүрмөсөн устах болно.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-3 text-zinc-500 font-bold hover:text-white transition-colors">
                                БОЛИХ
                            </button>
                            <button onClick={confirmDelete}
                                className="flex-1 py-4 bg-red-600 rounded-2xl font-black text-xs tracking-widest hover:bg-red-500 transition-all">
                                УСТГАХ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}