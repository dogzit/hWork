// app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const todos = await prisma.todo.findMany({
    where: { userName: name },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  try {
    const { task, userName } = await req.json();

    const newTodo = await prisma.todo.create({
      data: {
        task,
        userName,
      },
    });

    return NextResponse.json(newTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "Could not create todo" },
      { status: 500 },
    );
  }
}
