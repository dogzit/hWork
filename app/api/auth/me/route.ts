import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/requireAuth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    name: user.name,
    role: user.role,
  });
}
