import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Чиний prisma client-ийн байршил

export async function GET() {
  try {
    const [layout, bookings] = await Promise.all([
      prisma.busLayout.findMany(),
      prisma.busBooking.findMany(),
    ]);

    return NextResponse.json({
      layout,
      bookings,
    });
  } catch (error) {
    console.error("Bus status error:", error);
    return NextResponse.json(
      { error: "Өгөгдлийг татахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
