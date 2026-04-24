import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SeatInput {
  id: string;
  x: number;
  y: number;
  isPremium: boolean; // Үүнийг нэмлээ
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const seats: SeatInput[] = body.seats;

    if (!seats || !Array.isArray(seats)) {
      return NextResponse.json(
        { error: "Буруу өгөгдөл ирлээ" },
        { status: 400 },
      );
    }

    // Prisma гүйлгээ (Transaction)
    await prisma.$transaction([
      // 1. Хуучин бүтцийг цэвэрлэх
      prisma.busLayout.deleteMany({}),
      // 2. Шинэ бүтцийг бүгдийг нь нэмэх
      prisma.busLayout.createMany({
        data: seats.map((s) => ({
          seatId: s.id,
          x: s.x,
          y: s.y,
          isPremium: s.isPremium ?? false, // Frontend-ээс ирсэн утгыг хадгалах
        })),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Layout save error:", error);
    return NextResponse.json(
      {
        error: "Layout хадгалахад алдаа гарлаа",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
