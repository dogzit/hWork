import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get all users with their completed todo count
    const users = await prisma.user.findMany({
      where: { name: { not: "admin" } },
      select: {
        name: true,
        todos: {
          select: { completed: true },
        },
      },
    });

    const leaderboard = users
      .map((u) => ({
        name: u.name,
        total: u.todos.length,
        completed: u.todos.filter((t) => t.completed).length,
      }))
      .sort((a, b) => b.completed - a.completed);

    return NextResponse.json(leaderboard);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
