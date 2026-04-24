"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Armchair } from "lucide-react";

interface SeatProps {
    id: string;
    x: number;
    y: number;
    userName: string | null;
    isEditMode: boolean;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export function DraggableSeat({ id, x, y, userName, isEditMode, isSelected, onSelect }: SeatProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        disabled: !isEditMode,
    });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        left: x,
        top: y,
        position: "absolute" as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditMode ? { ...listeners, ...attributes } : {})}
            onClick={() => !isEditMode && onSelect(id)}
            className={`
                w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-shadow select-none
                ${isEditMode ? "cursor-grab active:cursor-grabbing border-zinc-600 bg-zinc-800" : "cursor-pointer"}
                ${isSelected ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"}
                ${transform ? "opacity-50 scale-110 z-50 shadow-2xl" : "z-10"}
                hover:border-zinc-500 shadow-lg
            `}
        >
            <Armchair size={14} />
            <span className="text-[9px] font-bold mt-0.5 truncate max-w-full px-1">
                {userName ? userName.slice(0, 5) : id}
            </span>
            <div className={`absolute -top-1 w-6 h-1 rounded-full ${isSelected ? "bg-blue-300" : "bg-zinc-700"}`} />
        </div>
    );
}