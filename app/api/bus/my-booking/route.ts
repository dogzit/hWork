import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.busBooking.findFirst({
      where: { userName },
      orderBy: { createdAt: "desc" },
      select: {
        seatId: true,
        qrToken: true,
        status: true,
        email: true,
        boardedAt: true,
        createdAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ hasBooking: false });
    }

    return NextResponse.json({ hasBooking: true, booking });
  } catch (e) {
    console.error("my-booking error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
