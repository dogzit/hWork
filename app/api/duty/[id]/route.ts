import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const item = await prisma.dutySchedule.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const body = (await req.json()) as unknown;
  const b = body as { date?: unknown; names?: unknown; notes?: unknown };

  const data: any = {};

  if (b.date !== undefined) {
    if (!isNonEmptyString(b.date)) {
      return NextResponse.json(
        { error: "date must be YYYY-MM-DD" },
        { status: 400 },
      );
    }
    const d = new Date(`${b.date}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    data.date = d;
  }

  if (b.names !== undefined) {
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
    data.names = names.map((x) => x.trim());
  }

  if (b.notes !== undefined) {
    data.notes = isNonEmptyString(b.notes) ? b.notes.trim() : null;
  }

  try {
    const updated = await prisma.dutySchedule.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "This date already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    await prisma.dutySchedule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
