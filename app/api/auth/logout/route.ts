import {
  JWT_COOKIE_NAME,
} from "@/lib/auth";
import { NextResponse } from "next/server";

type ApiError = { error: string };

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(JWT_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}

