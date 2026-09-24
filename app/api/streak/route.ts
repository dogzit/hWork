import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userName = req.headers.get("x-user-name");
    if (!userName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Хийсэн даалгаврын тэмдэглээнүүд (leaderboard-ийн эх үүсвэр)
    const checks = await prisma.hworkCheck.findMany({
      where: { userName },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (checks.length === 0) {
      return NextResponse.json({ streak: 0, totalCompleted: 0 });
    }

    // Get unique dates (YYYY-MM-DD)
    const dates = new Set(
      checks.map((c) => c.createdAt.toISOString().split("T")[0]),
    );
    const sortedDates = Array.from(dates).sort((a, b) => b.localeCompare(a));

    // Calculate streak from today backwards
    let streak = 0;
    const today = new Date();
    const check = new Date(today);

    for (let i = 0; i < 365; i++) {
      const ymd = check.toISOString().split("T")[0];
      if (dates.has(ymd)) {
        streak++;
      } else if (i > 0) {
        // Allow today to not have a completed todo yet
        break;
      }
      check.setDate(check.getDate() - 1);
    }

    return NextResponse.json({
      streak,
      totalCompleted: checks.length,
      activeDays: sortedDates.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
