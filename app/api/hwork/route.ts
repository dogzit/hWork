import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type ApiError = { error: string };

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const subject = searchParams.get("subject");
    const date = searchParams.get("date"); // optional: 2026-02-04 (YYYY-MM-DD)

    const where: {
      subject?: string;
      date?: { gte: Date; lt: Date };
    } = {};

    if (subject && subject.trim()) where.subject = subject.trim();

    if (date && date.trim()) {
      // date=YYYY-MM-DD => that day range
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      // Better: gte + lt next day (timezone safe-ish)
      const next = new Date(start);
      next.setUTCDate(next.getUTCDate() + 1);

      where.date = { gte: start, lt: next };
    }

    const items = await prisma.hwork.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
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
    const title = body.title;
    const subject = body.subject;
    const date = body.date;
    const image = body.image;

    if (!isNonEmptyString(title)) {
      return NextResponse.json({ error: "title required" } satisfies ApiError, {
        status: 400,
      });
    }
    if (!isNonEmptyString(subject)) {
      return NextResponse.json(
        { error: "subject required" } satisfies ApiError,
        { status: 400 },
      );
    }

    let parsedDate: Date;
    if (typeof date === "string" && date.trim()) {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "invalid date" } satisfies ApiError, {
          status: 400,
        });
      }
      parsedDate = d;
    } else {
      parsedDate = new Date();
    }

    const created = await prisma.hwork.create({
      data: {
        title: title.trim(),
        subject: subject.trim(),
        date: parsedDate,
        image: typeof image === "string" && image.trim() ? image.trim() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
