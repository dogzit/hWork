import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOtpCode, hashCode, otpSalt } from "@/lib/qr";
import { otpEmailTemplate, sendMail } from "@/lib/mailer";

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;

function isValidEmail(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) &&
    v.length <= 254
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = (body as { email?: unknown } | null)?.email;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Хүчинтэй email оруулна уу" },
        { status: 400 },
      );
    }

    const normalized = email.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: { email: normalized },
      select: { name: true },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Энэ email бүртгэлтэй байна" },
        { status: 409 },
      );
    }

    const recent = await prisma.emailOtp.findFirst({
      where: { email: normalized, purpose: "SIGNUP", used: false },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      const sinceMs = Date.now() - recent.createdAt.getTime();
      if (sinceMs < RESEND_COOLDOWN_SECONDS * 1000) {
        const wait = Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - sinceMs) / 1000);
        return NextResponse.json(
          { error: `${wait} секундын дараа дахин илгээнэ үү` },
          { status: 429 },
        );
      }
    }

    const code = generateOtpCode();
    const salt = otpSalt();
    const codeHash = hashCode(code, salt);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.emailOtp.create({
      data: {
        email: normalized,
        purpose: "SIGNUP",
        codeHash,
        codeSalt: salt,
        expiresAt,
      },
    });

    const { subject, html, text } = otpEmailTemplate(code);
    const result = await sendMail({ to: normalized, subject, html, text });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Email илгээхэд алдаа гарлаа" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      dev: "dev" in result ? result.dev : false,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (e) {
    console.error("signup send-otp error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
