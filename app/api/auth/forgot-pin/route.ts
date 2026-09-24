import prisma from "@/lib/prisma";
import {
  hashPin,
  isValidPin,
  makePinSalt,
  normalizePin,
} from "@/lib/auth";
import { generateOtpCode, hashCode, otpSalt } from "@/lib/qr";
import { otpEmailTemplate, sendMail } from "@/lib/mailer";
import { NextRequest, NextResponse } from "next/server";

type ApiError = { error: string };

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_ATTEMPTS = 5;
const RESET_WINDOW_MS = 30 * 60 * 1000;

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

/**
 * POST /api/auth/forgot-pin
 *
 * Step 1 (send OTP): { step: 1, name }
 *   - Look up user by name; if user has an email, send OTP to that email.
 *   - Response never leaks whether user exists — always 200.
 *
 * Step 2 (verify + reset PIN): { step: 2, name, code, newPin }
 *   - Verify OTP matches, then update PIN.
 */
export async function POST(req: NextRequest) {
  try {
    const raw: unknown = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid body" } satisfies ApiError, {
        status: 400,
      });
    }

    const body = raw as Record<string, unknown>;
    const step = body.step;
    const name = body.name;

    if (!isNonEmptyString(name)) {
      return NextResponse.json(
        { error: "Нэрээ оруулна уу" } satisfies ApiError,
        { status: 400 },
      );
    }

    const nameTrimmed = name.trim();

    // ── Step 1: send OTP to user's registered email ──
    if (step === 1) {
      const user = await prisma.user.findUnique({
        where: { name: nameTrimmed },
        select: { name: true, email: true },
      });

      // Always return same shape so attackers can't enumerate users.
      if (!user || !user.email) {
        return NextResponse.json({
          ok: true,
          emailHint: null,
        });
      }

      const email = user.email.toLowerCase();

      const recent = await prisma.emailOtp.findFirst({
        where: {
          userName: user.name,
          email,
          purpose: "FORGOT_PIN",
          used: false,
        },
        orderBy: { createdAt: "desc" },
      });
      if (recent) {
        const sinceMs = Date.now() - recent.createdAt.getTime();
        if (sinceMs < RESEND_COOLDOWN_SECONDS * 1000) {
          const wait = Math.ceil(
            (RESEND_COOLDOWN_SECONDS * 1000 - sinceMs) / 1000,
          );
          return NextResponse.json(
            { error: `${wait} секундын дараа дахин илгээнэ үү` } satisfies ApiError,
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
          email,
          userName: user.name,
          purpose: "FORGOT_PIN",
          codeHash,
          codeSalt: salt,
          expiresAt,
        },
      });

      const { subject, html, text } = otpEmailTemplate(code);
      const mailRes = await sendMail({ to: email, subject, html, text });
      if (!mailRes.ok) {
        return NextResponse.json(
          { error: "Email илгээхэд алдаа гарлаа" } satisfies ApiError,
          { status: 500 },
        );
      }

      // Return masked email hint (e.g., j***@gmail.com)
      const [local, domain] = email.split("@");
      const masked =
        local.length > 2 ? `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}` : local;
      return NextResponse.json({
        ok: true,
        emailHint: `${masked}@${domain}`,
        dev: "dev" in mailRes ? mailRes.dev : false,
      });
    }

    // ── Step 2: verify OTP + set new PIN ──
    if (step === 2) {
      const code = body.code;
      const newPin = body.newPin;

      if (!isNonEmptyString(code) || !/^\d{6}$/.test(code.trim())) {
        return NextResponse.json(
          { error: "Код 6 оронтой байх ёстой" } satisfies ApiError,
          { status: 400 },
        );
      }
      if (!isValidPin(newPin)) {
        return NextResponse.json(
          {
            error: "Шинэ PIN 4 эсвэл 6 оронтой байх ёстой",
          } satisfies ApiError,
          { status: 400 },
        );
      }

      const user = await prisma.user.findUnique({
        where: { name: nameTrimmed },
      });
      if (!user || !user.email) {
        return NextResponse.json(
          { error: "Баталгаажуулалт амжилтгүй" } satisfies ApiError,
          { status: 401 },
        );
      }

      const otp = await prisma.emailOtp.findFirst({
        where: {
          userName: user.name,
          email: user.email.toLowerCase(),
          purpose: "FORGOT_PIN",
          used: false,
        },
        orderBy: { createdAt: "desc" },
      });
      if (!otp) {
        return NextResponse.json(
          { error: "OTP олдсонгүй. Дахин илгээнэ үү" } satisfies ApiError,
          { status: 404 },
        );
      }
      if (otp.expiresAt.getTime() < Date.now()) {
        return NextResponse.json(
          { error: "OTP хугацаа дууссан" } satisfies ApiError,
          { status: 410 },
        );
      }
      if (otp.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Оролдлого хэтэрсэн. Шинэ код авна уу" } satisfies ApiError,
          { status: 429 },
        );
      }

      const expected = hashCode(code.trim(), otp.codeSalt);
      if (expected !== otp.codeHash) {
        await prisma.emailOtp.update({
          where: { id: otp.id },
          data: { attempts: otp.attempts + 1 },
        });
        return NextResponse.json(
          { error: "Код буруу байна" } satisfies ApiError,
          { status: 401 },
        );
      }

      const newTrimmed = normalizePin(newPin);
      const newSalt = makePinSalt();
      const newHash = hashPin(newTrimmed, newSalt);

      await prisma.$transaction([
        prisma.emailOtp.update({
          where: { id: otp.id },
          data: { used: true },
        }),
        prisma.user.update({
          where: { name: user.name },
          data: { pinHash: newHash, pinSalt: newSalt },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message: "PIN амжилттай сэргээгдлээ. Шинэ PIN-ээрээ нэвтэрнэ үү.",
      });
    }

    return NextResponse.json(
      { error: "Буруу шат" } satisfies ApiError,
      { status: 400 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
