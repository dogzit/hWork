import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrToken } from "@/lib/qr";
import { getAppUrlFromRequest, sendBookingEmail } from "@/lib/busEmail";

export async function POST(req: NextRequest) {
  try {
    const myUserName = req.headers.get("x-user-name");
    if (!myUserName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const withRaw = (body as { withUserName?: unknown } | null)?.withUserName;
    if (!withRaw || typeof withRaw !== "string") {
      return NextResponse.json(
        { error: "Хосорхон хэрэглэгчийн нэр шаардлагатай" },
        { status: 400 },
      );
    }
    const withUserName = withRaw.trim();
    if (withUserName.toLowerCase() === myUserName.toLowerCase()) {
      return NextResponse.json(
        { error: "Өөртөө сольж болохгүй" },
        { status: 400 },
      );
    }

    const other = await prisma.user.findUnique({
      where: { name: withUserName },
      select: { name: true },
    });
    if (!other) {
      return NextResponse.json(
        { error: "Тийм нэртэй хэрэглэгч олдсонгүй" },
        { status: 404 },
      );
    }

    const myBooking = await prisma.busBooking.findFirst({
      where: { userName: myUserName },
      orderBy: { createdAt: "desc" },
    });
    const theirBooking = await prisma.busBooking.findFirst({
      where: { userName: other.name },
      orderBy: { createdAt: "desc" },
    });

    if (!myBooking) {
      return NextResponse.json(
        { error: "Танд захиалга алга" },
        { status: 404 },
      );
    }
    if (!theirBooking) {
      return NextResponse.json(
        { error: `${other.name}-д захиалга алга` },
        { status: 404 },
      );
    }
    if (
      myBooking.status === "BOARDED" ||
      myBooking.boardedAt ||
      theirBooking.status === "BOARDED" ||
      theirBooking.boardedAt
    ) {
      return NextResponse.json(
        { error: "Аль нэг нь суусан бол сольж болохгүй" },
        { status: 409 },
      );
    }

    const layoutA = await prisma.busLayout.findUnique({
      where: { seatId: myBooking.seatId },
    });
    const layoutB = await prisma.busLayout.findUnique({
      where: { seatId: theirBooking.seatId },
    });

    const newTokenA = generateQrToken();
    const newTokenB = generateQrToken();
    const tempSeat = `TMP:${myBooking.id}`;

    // seatId is unique — park mine under a temp seatId to free the target, then swap.
    const [, updatedTheir, updatedMine] = await prisma.$transaction([
      prisma.busBooking.update({
        where: { id: myBooking.id },
        data: { seatId: tempSeat },
      }),
      prisma.busBooking.update({
        where: { id: theirBooking.id },
        data: {
          seatId: myBooking.seatId,
          qrToken: newTokenA,
          status: layoutA?.isPremium ? "PENDING" : "APPROVED",
        },
      }),
      prisma.busBooking.update({
        where: { id: myBooking.id },
        data: {
          seatId: theirBooking.seatId,
          qrToken: newTokenB,
          status: layoutB?.isPremium ? "PENDING" : "APPROVED",
        },
      }),
    ]);

    const updatedA = updatedTheir; // new owner of my original seat
    const updatedB = updatedMine; // I now own their original seat

    const appUrl = getAppUrlFromRequest(req);

    // Notify both parties
    void sendBookingEmail({
      appUrl,
      to: updatedA.email,
      seatId: updatedA.seatId,
      userName: updatedA.userName,
      qrToken: updatedA.qrToken,
      status: updatedA.status as "APPROVED" | "PENDING",
    });
    void sendBookingEmail({
      appUrl,
      to: updatedB.email,
      seatId: updatedB.seatId,
      userName: updatedB.userName,
      qrToken: updatedB.qrToken,
      status: updatedB.status as "APPROVED" | "PENDING",
    });

    return NextResponse.json({
      success: true,
      mySeat: updatedB.seatId,
      theirSeat: updatedA.seatId,
    });
  } catch (e) {
    console.error("bus swap error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
