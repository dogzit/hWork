"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Armchair } from "lucide-react";

interface SeatProps {
    id: string;
    isEditMode: boolean;
    isSelected: boolean;
    userName?: string | null;
    onSelect: (id: string) => void;
}

export function Seat({ id, isEditMode, isSelected, userName, onSelect }: SeatProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled: !isEditMode
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditMode ? { ...attributes, ...listeners } : {})}
            onClick={() => !isEditMode && onSelect(id)}
            className={`
                relative w-14 h-14 flex flex-col items-center justify-center rounded-xl border-2 transition-all select-none
                ${isEditMode ? "cursor-grab active:cursor-grabbing border-zinc-700 bg-zinc-800" : "cursor-pointer"}
                ${isSelected ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-zinc-800 bg-zinc-900 text-zinc-500"}
                ${isDragging ? "opacity-50 scale-110 shadow-2xl" : "opacity-100"}
                hover:border-zinc-500
            `}
        >
            <Armchair size={16} className={isSelected ? "text-white" : "text-zinc-600"} />
            <span className="text-[10px] font-bold mt-1">
                {userName ? userName.slice(0, 5) : id}
            </span>
            <div className={`absolute -top-1 w-8 h-1 rounded-full ${isSelected ? "bg-blue-300" : "bg-zinc-700"}`} />
        </div>
    );
}