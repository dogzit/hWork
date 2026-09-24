import prisma from "@/lib/prisma";
import {
  hashPin,
  isValidPin,
  makePinSalt,
  normalizePin,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type ApiError = { error: string };

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

/**
 * POST /api/auth/change-pin
 * Хэрэглэгчийн PIN-ийг солих
 * Body: { currentPin: string, newPin: string }
 */
export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" } satisfies ApiError, {
        status: 401,
      });
    }

    const raw: unknown = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid body" } satisfies ApiError, {
        status: 400,
      });
    }

    const body = raw as Record<string, unknown>;
    const currentPin = body.currentPin;
    const newPin = body.newPin;

    if (!isNonEmptyString(currentPin)) {
      return NextResponse.json(
        { error: "Одоогийн PIN-ийг оруулна уу" } satisfies ApiError,
        { status: 400 }
      );
    }
    if (!isValidPin(newPin)) {
      return NextResponse.json(
        { error: "Шинэ PIN 4 эсвэл 6 оронтой байх ёстой" } satisfies ApiError,
        { status: 400 }
      );
    }

    const currentTrimmed = normalizePin(currentPin);
    const newTrimmed = normalizePin(newPin);

    // Одоогийн PIN зөв эсэхийг шалгана
    const user = await prisma.user.findUnique({
      where: { name: userName },
    });
    if (!user) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" } satisfies ApiError, {
        status: 404,
      });
    }

    const computedHash = hashPin(currentTrimmed, user.pinSalt);
    if (computedHash !== user.pinHash) {
      return NextResponse.json(
        { error: "Одоогийн PIN буруу байна" } satisfies ApiError,
        { status: 401 }
      );
    }

    // Шинэ PIN нь хуучин PIN-тэй адилхан байж болохгүй
    if (currentTrimmed === newTrimmed) {
      return NextResponse.json(
        { error: "Шинэ PIN нь хуучин PIN-тэй адилхан байна" } satisfies ApiError,
        { status: 400 }
      );
    }

    // Шинэ PIN-ийг хадгална
    const newSalt = makePinSalt();
    const newHash = hashPin(newTrimmed, newSalt);

    await prisma.user.update({
      where: { name: userName },
      data: {
        pinHash: newHash,
        pinSalt: newSalt,
      },
    });

    return NextResponse.json({ ok: true, message: "PIN амжилттай солигдлоо" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
