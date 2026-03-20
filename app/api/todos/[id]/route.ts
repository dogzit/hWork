import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Next.js 15+ дээр params нь Promise байдаг тул заавал await хийнэ
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Энд await нэмсэн
    const { completed } = await req.json();
    const todoId = parseInt(id);

    if (isNaN(todoId)) {
      return NextResponse.json({ error: "Буруу ID байна" }, { status: 400 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Энд await нэмсэн
    const todoId = parseInt(id);

    if (isNaN(todoId)) {
      return NextResponse.json({ error: "Буруу ID байна" }, { status: 400 });
    }

    await prisma.todo.delete({
      where: { id: todoId },
    });

    return NextResponse.json({ message: "Устгагдлаа" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Устгахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
