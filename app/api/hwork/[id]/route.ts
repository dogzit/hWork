import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type ApiError = { error: string };

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const item = await prisma.hwork.findUnique({ where: { id } });
    if (!item)
      return NextResponse.json({ error: "Not found" } satisfies ApiError, {
        status: 404,
      });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const raw: unknown = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid body" } satisfies ApiError, {
        status: 400,
      });
    }

    const body = raw as Record<string, unknown>;
    const data: {
      title?: string;
      subject?: string;
      image?: string | null;
      date?: Date;
    } = {};

    if (body.title !== undefined) {
      if (!isNonEmptyString(body.title)) {
        return NextResponse.json(
          { error: "Invalid title" } satisfies ApiError,
          { status: 400 },
        );
      }
      data.title = body.title.trim();
    }

    if (body.subject !== undefined) {
      if (!isNonEmptyString(body.subject)) {
        return NextResponse.json(
          { error: "Invalid subject" } satisfies ApiError,
          { status: 400 },
        );
      }
      data.subject = body.subject.trim();
    }

    if (body.image !== undefined) {
      if (body.image === null) data.image = null;
      else if (typeof body.image === "string")
        data.image = body.image.trim() || null;
      else {
        return NextResponse.json(
          { error: "Invalid image" } satisfies ApiError,
          { status: 400 },
        );
      }
    }

    if (body.date !== undefined) {
      if (typeof body.date !== "string" || !body.date.trim()) {
        return NextResponse.json({ error: "Invalid date" } satisfies ApiError, {
          status: 400,
        });
      }
      const d = new Date(body.date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" } satisfies ApiError, {
          status: 400,
        });
      }
      data.date = d;
    }

    const updated = await prisma.hwork.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await prisma.hwork.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
