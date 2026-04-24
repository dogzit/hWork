import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { seatId } = await req.json();

    if (!seatId) {
      return NextResponse.json(
        { error: "seatId шаардлагатай" },
        { status: 400 },
      );
    }

    // 1. Эхлээд тухайн суудалтай холбоотой захиалгыг устгана
    await prisma.busBooking.deleteMany({
      where: { seatId: seatId },
    });

    // 2. Дараа нь суудлын байршлыг (layout) устгана
    await prisma.busLayout.delete({
      where: { seatId: seatId },
    });

    return NextResponse.json({
      success: true,
      message: "Суудал бүрмөсөн устлаа",
    });
  } catch (error) {
    console.error("Delete Seat Error:", error);
    return NextResponse.json(
      { error: "Устгахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
