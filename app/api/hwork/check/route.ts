import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/hwork/check { hworkId }
 * Тухайн даалгаврыг "хийсэн" гэж тэмдэглэх / арилгах.
 * Хариудаа { checked: boolean } буцаана.
 */
export async function POST(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      hworkId?: unknown;
    } | null;
    const hworkId =
      body && typeof body.hworkId === "string" ? body.hworkId.trim() : "";
    if (!hworkId) {
      return NextResponse.json({ error: "hworkId required" }, { status: 400 });
    }

    const hwork = await prisma.hwork.findUnique({
      where: { id: hworkId },
      select: { id: true },
    });
    if (!hwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const key = { hworkId_userName: { hworkId, userName } };
    const existing = await prisma.hworkCheck.findUnique({ where: key });

    if (existing) {
      await prisma.hworkCheck.delete({ where: key });
      return NextResponse.json({ checked: false });
    }

    await prisma.hworkCheck.create({ data: { hworkId, userName } });
    return NextResponse.json({ checked: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
