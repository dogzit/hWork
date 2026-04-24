import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { seatId, userName } = await req.json();

    if (!seatId || !userName) {
      return NextResponse.json(
        { error: "Мэдээлэл дутуу байна" },
        { status: 400 },
      );
    }

    // Захиалгыг шалгах (Зөвхөн тухайн хэрэглэгчийнх мөн эсэх)
    const booking = await prisma.busBooking.findUnique({
      where: { seatId: seatId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 },
      );
    }

    if (booking.userName !== userName) {
      return NextResponse.json(
        { error: "Бусдын захиалгыг цуцлах боломжгүй" },
        { status: 403 },
      );
    }

    // Захиалгыг устгах
    await prisma.busBooking.delete({
      where: { seatId: seatId },
    });

    return NextResponse.json({ success: true, message: "Захиалга цуцлагдлаа" });
  } catch (error) {
    return NextResponse.json(
      { error: "Сервер дээр алдаа гарлаа" },
      { status: 500 },
    );
  }
}
