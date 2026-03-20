import prisma from "@/lib/prisma";
import { hashPin, isValidPin, makePinSalt, normalizePin } from "@/lib/auth";
import { NextResponse } from "next/server";

type ApiError = { error: string };

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function POST(req: Request) {
  try {
    const raw: unknown = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid body" } satisfies ApiError, {
        status: 400,
      });
    }

    const body = raw as Record<string, unknown>;
    const name = body.name;
    // Accept both `number` and legacy `pin` field names.
    const pin = body.pin ?? body.number;

    if (!isNonEmptyString(name)) {
      return NextResponse.json(
        { error: "name is required" } satisfies ApiError,
        { status: 400 },
      );
    }
    if (!isValidPin(pin)) {
      return NextResponse.json(
        { error: "number must be 4 or 6 digits" } satisfies ApiError,
        { status: 400 },
      );
    }

    const pinTrimmed = normalizePin(pin);
    const pinSalt = makePinSalt();
    const pinHash = hashPin(pinTrimmed, pinSalt);

    await prisma.user.create({
      data: {
        name: name.trim(),
        pinSalt,
        pinHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const code = (e as { code?: string } | undefined)?.code;
    if (code === "P2002") {
      return NextResponse.json(
        {
          error: "Бүртгэлтэй нэр байна",
        } satisfies ApiError,
        { status: 409 },
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
