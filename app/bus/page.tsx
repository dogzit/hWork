"use client";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import BusSeatPanel from "../_components/BusSeatPanel";

export default function BusPage() {
  const { push } = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center pb-[calc(5rem_+_env(safe-area-inset-bottom))] overflow-y-auto pt-12">
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
