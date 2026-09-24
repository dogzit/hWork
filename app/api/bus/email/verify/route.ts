import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashCode } from "@/lib/qr";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const emailRaw = (body as { email?: unknown }).email;
    const code = (body as { code?: unknown }).code;

    if (typeof emailRaw !== "string" || typeof code !== "string") {
      return NextResponse.json({ error: "Мэдээлэл дутуу" }, { status: 400 });
    }
    const email = emailRaw.trim().toLowerCase();
    const codeTrimmed = code.trim();

    if (!/^\d{6}$/.test(codeTrimmed)) {
      return NextResponse.json(
        { error: "Код 6 оронтой байх ёстой" },
        { status: 400 },
      );
    }

    const otp = await prisma.emailOtp.findFirst({
      where: { userName, email, used: false, purpose: "BUS_BOOKING" },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "OTP олдсонгүй. Дахин илгээнэ үү" },
        { status: 404 },
      );
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "OTP хугацаа дууссан" },
        { status: 410 },
      );
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Оролдлого хэтэрсэн. Шинэ код авна уу" },
        { status: 429 },
      );
    }

    const expected = hashCode(codeTrimmed, otp.codeSalt);
    if (expected !== otp.codeHash) {
      await prisma.emailOtp.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });
      return NextResponse.json({ error: "Код буруу байна" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.emailOtp.update({
        where: { id: otp.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { name: userName },
        data: { email },
      }),
    ]);

    return NextResponse.json({ ok: true, email });
  } catch (e) {
    console.error("verify-otp error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
