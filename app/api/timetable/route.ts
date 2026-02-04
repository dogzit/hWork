import prisma from "@/lib/prisma";
import { ApiError, parseUpsertBody } from "@/lib/timetable.types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await prisma.timetable.findMany({
      orderBy: [{ day: "asc" }, { lessonNumber: "asc" }],
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
    const body = parseUpsertBody(raw);

    if (!body) {
      return NextResponse.json({ error: "Invalid body" } satisfies ApiError, {
        status: 400,
      });
    }

    const item = await prisma.timetable.upsert({
      where: {
        day_lessonNumber: { day: body.day, lessonNumber: body.lessonNumber },
      },
      update: { subject: body.subject },
      create: body,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
