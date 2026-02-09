import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function GET() {
  const items = await prisma.dutySchedule.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const b = body as { date?: unknown; names?: unknown; notes?: unknown };

    if (!isNonEmptyString(b.date)) {
      return NextResponse.json(
        { error: "date is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const names = Array.isArray(b.names) ? b.names : [];
    if (
      !Array.isArray(names) ||
      names.length !== 5 ||
      !names.every(isNonEmptyString)
    ) {
      return NextResponse.json(
        { error: "names must be an array of exactly 5 non-empty strings" },
        { status: 400 },
      );
    }

    const d = new Date(`${b.date}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const created = await prisma.dutySchedule.create({
      data: {
        date: d,
        names: names.map((x) => x.trim()),
        notes: isNonEmptyString(b.notes) ? b.notes.trim() : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "This date already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
