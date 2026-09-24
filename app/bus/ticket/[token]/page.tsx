import { prisma } from "@/lib/prisma";
import { qrDataUrl } from "@/lib/qr";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const booking = await prisma.busBooking.findUnique({
    where: { qrToken: token },
    include: {
      user: {
        select: { name: true, fullName: true, avatar: true },
      },
    },
  });

  if (!booking) notFound();

  const qr = await qrDataUrl(token);
  const isBoarded = booking.status === "BOARDED";
  const isPending = booking.status === "PENDING";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-2">
            12Д Автобус
          </p>
          <h1 className="text-3xl font-black italic tracking-tighter">TICKET</h1>
        </div>

        <div
          className={`rounded-[32px] p-6 border shadow-2xl ${
            isBoarded
              ? "bg-emerald-950/30 border-emerald-500/30"
              : isPending
                ? "bg-orange-950/30 border-orange-500/30"
                : "bg-zinc-900 border-zinc-800"
          }`}
        >
          <div className="text-center mb-5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
              Суудал
            </p>
            <p className="text-5xl font-black tracking-tighter">{booking.seatId}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 mb-5 flex items-center justify-center">
            <Image
              src={qr}
              width={280}
              height={280}
              alt={`QR ${booking.seatId}`}
              className="w-full h-auto"
              unoptimized
              priority
            />
          </div>

          <div className="space-y-2 bg-black/30 rounded-2xl p-4 border border-white/5">
            <Row label="Захиалагч" value={booking.user.fullName || booking.userName} />
            <Row label="Email" value={booking.email} />
            <Row
              label="Статус"
              value={
                isBoarded
                  ? "БАТАЛГААЖСАН / СУУСАН ✓"
                  : isPending
                    ? "VIP ХҮСЭЛТ (админ баталгаажуулаагүй)"
                    : "БАТЛАГДСАН"
              }
              highlight={isBoarded ? "success" : isPending ? "warn" : undefined}
            />
            {booking.boardedAt && (
              <Row
                label="Суусан цаг"
                value={new Date(booking.boardedAt).toLocaleString("mn-MN")}
              />
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-600 mt-6">
          Автобусанд суух үедээ энэ QR-ыг админд үзүүлнэ үү.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "success" | "warn";
}) {
  const cls =
    highlight === "success"
      ? "text-emerald-300"
      : highlight === "warn"
        ? "text-orange-300"
        : "text-white";
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-medium ${cls}`}>{value}</p>
    </div>
  );
}
