"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SeatProps {
    id: string;
    isEditMode: boolean;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}

// Энд 'export' байгаа эсэхийг сайн шалгаарай
export function Seat({ id, isEditMode, isSelected, onSelect }: SeatProps) {
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
            onClick={() => !isEditMode && onSelect?.(id)}
            className={`
        relative w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold text-xs transition-all
        ${isEditMode ? "cursor-grab active:cursor-grabbing border-zinc-600 bg-zinc-800" : "cursor-pointer"}
        ${isSelected ? "bg-green-500 border-green-300 text-white" : "border-zinc-700 bg-zinc-900"}
        ${isDragging ? "opacity-50 scale-110 shadow-2xl" : "opacity-100 shadow-sm"}
        hover:border-blue-500
      `}
        >
            <div className="absolute top-[-3px] w-8 h-1.5 bg-zinc-700 rounded-full" />
            {id}
        </div>
    );
}

// Next.js-ийн 'page' учраас default export заавал хэрэгтэй
export default function SeatPage() {
    return <div>Seat Component Page</div>;
}