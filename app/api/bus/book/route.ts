import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { seatId, userName, status } = await req.json();

    if (!userName) {
      return NextResponse.json(
        { error: "UserName is required" },
        { status: 400 },
      );
    }

    // 1. Хэрэглэгчийн өмнөх бүх захиалгыг устгах (Нэг хүн нэг суудал)
    await prisma.busBooking.deleteMany({
      where: { userName: userName },
    });

    // 2. Шинэ захиалга үүсгэх
    if (seatId) {
      const newBooking = await prisma.busBooking.create({
        data: {
          seatId: seatId,
          userName: userName,
          status: status || "APPROVED", // Схем дээр нэмсэн status-аа энд заавал авна
        },
      });
      return NextResponse.json({ success: true, booking: newBooking });
    }

    return NextResponse.json({ success: true, message: "Booking cleared" });
  } catch (error: any) {
    // Алдааг консол дээр харах (Энэ маш чухал!)
    console.error("PRISMA ERROR:", error);
    return NextResponse.json(
      { error: "Booking failed", details: error.message },
      { status: 500 },
    );
  }
}
