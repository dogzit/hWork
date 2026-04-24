import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seatId, status } = body;

    if (!seatId || !status) {
      return NextResponse.json(
        { error: "Мэдээлэл дутуу байна (seatId эсвэл status)" },
        { status: 400 },
      );
    }

    // 1. Хэрэв статус APPROVED бол BusBooking хүснэгтийн төлөвийг шинэчилнэ
    if (status === "APPROVED") {
      await prisma.busBooking.update({
        where: {
          seatId: seatId,
        },
        data: {
          status: "APPROVED",
        },
      });
      return NextResponse.json({
        success: true,
        message: "Захиалга баталгаажлаа",
      });
    }

    // 2. Хэрэв статус REJECTED бол захиалгыг бүрмөсөн устгана
    if (status === "REJECTED") {
      await prisma.busBooking.delete({
        where: {
          seatId: seatId,
        },
      });
      return NextResponse.json({
        success: true,
        message: "Захиалга цуцлагдлаа",
      });
    }

    return NextResponse.json({ error: "Буруу статус" }, { status: 400 });
  } catch (error) {
    console.error("Approve API Error:", error);
    return NextResponse.json(
      {
        error:
          "Сервер дээр алдаа гарлаа. Магадгүй энэ суудалд захиалга байхгүй байна.",
      },
      { status: 500 },
    );
  }
}
