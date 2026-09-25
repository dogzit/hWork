import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrToken } from "@/lib/qr";
import { getAppUrlFromRequest, sendBookingEmail } from "@/lib/busEmail";

export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const newSeatId = (body as { newSeatId?: unknown } | null)?.newSeatId;
    if (!newSeatId || typeof newSeatId !== "string") {
      return NextResponse.json(
        { error: "newSeatId шаардлагатай" },
        { status: 400 },
      );
    }

    const currentBooking = await prisma.busBooking.findFirst({
      where: { userName },
      orderBy: { createdAt: "desc" },
    });
    if (!currentBooking) {
      return NextResponse.json(
        { error: "Танд одоогоор захиалга алга" },
        { status: 404 },
      );
    }
    if (currentBooking.status === "BOARDED" || currentBooking.boardedAt) {
      return NextResponse.json(
        { error: "Автобусанд суусны дараа солих боломжгүй" },
        { status: 409 },
      );
    }
    if (currentBooking.seatId === newSeatId) {
      return NextResponse.json(
        { error: "Тэр суудал аль хэдийн таных" },
        { status: 400 },
      );
    }

    const layout = await prisma.busLayout.findUnique({
      where: { seatId: newSeatId },
    });
    if (!layout) {
      return NextResponse.json(
        { error: "Ийм суудал байхгүй" },
        { status: 404 },
      );
    }

    const newQrToken = generateQrToken();
    const newStatus = layout.isPremium ? "PENDING" : "APPROVED";

    let updated;
    try {
      updated = await prisma.$transaction(async (tx) => {
        const target = await tx.busBooking.findUnique({
          where: { seatId: newSeatId },
        });
        if (target) throw new Error("SEAT_TAKEN");

        await tx.busBooking.delete({ where: { id: currentBooking.id } });

        return tx.busBooking.create({
          data: {
            seatId: newSeatId,
            userName,
            email: currentBooking.email,
            qrToken: newQrToken,
            status: newStatus,
          },
        });
      });
    } catch (err) {
      if (err instanceof Error && err.message === "SEAT_TAKEN") {
        return NextResponse.json(
          { error: "Тэр суудал захиалагдсан байна" },
          { status: 409 },
        );
      }
      throw err;
    }

    // Notify: fresh QR to same email
    void sendBookingEmail({
      appUrl: getAppUrlFromRequest(req),
      to: updated.email,
      seatId: updated.seatId,
      userName: updated.userName,
      qrToken: updated.qrToken,
      status: newStatus as "APPROVED" | "PENDING",
    });

    return NextResponse.json({
      success: true,
      booking: { seatId: updated.seatId, status: updated.status },
    });
  } catch (e) {
    console.error("bus change error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
