import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { name: userName },
      select: { name: true, avatar: true, bio: true, instagram: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const totalTodos = await prisma.todo.count({
      where: { userName },
    });
    const completedTodos = await prisma.todo.count({
      where: { userName, completed: true },
    });

    return NextResponse.json({
      ...user,
      totalTodos,
      completedTodos,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data: { avatar?: string | null; bio?: string | null; instagram?: string | null } = {};

    if (body.avatar !== undefined) {
      data.avatar = typeof body.avatar === "string" ? body.avatar.trim() || null : null;
    }
    if (body.bio !== undefined) {
      data.bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 200) || null : null;
    }
    if (body.instagram !== undefined) {
      data.instagram = typeof body.instagram === "string" ? body.instagram.trim().replace(/^@/, "").slice(0, 30) || null : null;
    }

    const updated = await prisma.user.update({
      where: { name: userName },
      data,
      select: { name: true, avatar: true, bio: true, instagram: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
