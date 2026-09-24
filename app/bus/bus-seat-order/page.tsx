"use client";
import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Seat } from '../Seat/page'; // Энд Seat-ээ зөв заасан эсэхээ хар

export default function BusManager() {
    const [isEditMode, setIsEditMode] = useState(true);
    const [items, setItems] = useState(Array.from({ length: 12 }, (_, i) => `S${i + 1}`));
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    function handleDragEnd(event: any) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.indexOf(active.id);
                const newIndex = prev.indexOf(over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
            <div className="flex gap-4 mb-8 bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
                <button onClick={() => setIsEditMode(true)} className={`px-6 py-2 rounded-xl ${isEditMode ? "bg-blue-600" : "text-zinc-500"}`}>ADMIN</button>
                <button onClick={() => setIsEditMode(false)} className={`px-6 py-2 rounded-xl ${!isEditMode ? "bg-green-600" : "text-zinc-500"}`}>USER</button>
            </div>

            <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-zinc-800 shadow-2xl">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-4 gap-6">
                            {items.map((id, index) => (
                                <React.Fragment key={id}>
                                    {index % 4 === 2 && <div className="w-4" />}
                                    <Seat
                                        id={id}
                                        isEditMode={isEditMode}
                                        isSelected={selectedSeats.includes(id)}
                                        onSelect={(sId) => setSelectedSeats(prev => prev.includes(sId) ? prev.filter(s => s !== sId) : [...prev, sId])}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}