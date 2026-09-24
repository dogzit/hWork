import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { seatId } = await req.json();
    if (!seatId || typeof seatId !== "string") {
      return NextResponse.json(
        { error: "seatId шаардлагатай" },
        { status: 400 },
      );
    }

    const booking = await prisma.busBooking.findUnique({
      where: { seatId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 },
      );
    }

    const isOwner = booking.userName === userName;
    const isAdmin = userName.toLowerCase() === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Бусдын захиалгыг цуцлах боломжгүй" },
        { status: 403 },
      );
    }

    await prisma.busBooking.delete({
      where: { seatId },
    });

    return NextResponse.json({ success: true, message: "Захиалга цуцлагдлаа" });
  } catch (error) {
    console.error("Bus cancel error:", error);
    return NextResponse.json(
      { error: "Сервер дээр алдаа гарлаа" },
      { status: 500 },
    );
  }
}
