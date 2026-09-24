import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashCode } from "@/lib/qr";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const emailRaw = (body as { email?: unknown } | null)?.email;
    const code = (body as { code?: unknown } | null)?.code;

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
      where: { email, purpose: "SIGNUP", used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "OTP олдсонгүй. Дахин илгээнэ үү" },
        { status: 404 },
      );
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP хугацаа дууссан" }, { status: 410 });
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

    // Mark used but don't delete — signup finalize will re-check within 30 min.
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    return NextResponse.json({ ok: true, email });
  } catch (e) {
    console.error("signup verify-otp error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
