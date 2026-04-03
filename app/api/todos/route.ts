import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isNonEmptyString } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    // Use authenticated user from middleware header
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: { userName },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Use authenticated user from middleware header
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const task = body?.task;

    if (!isNonEmptyString(task)) {
      return NextResponse.json(
        { error: "task is required" },
        { status: 400 },
      );
    }

    const newTodo = await prisma.todo.create({
      data: {
        task: task.trim(),
        userName,
      },
    });

    return NextResponse.json(newTodo);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not create todo" },
      { status: 500 },
    );
  }
}
