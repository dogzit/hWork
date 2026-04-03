import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await context.params;
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: postId } = await context.params;
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";

    if (!text || text.length > 500) {
      return NextResponse.json({ error: "Comment must be 1-500 chars" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { postId, userName, text },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
