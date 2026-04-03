import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createHash } from "crypto";

const JWT_COOKIE_NAME = "auth_jwt";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return createHash("sha256")
      .update(process.env.DATABASE_URL ?? "dev")
      .digest("hex");
  }
  return secret;
}

async function verifyToken(token: string) {
  try {
    const secret = getJwtSecret();
    const enc = new TextEncoder();
    const { payload } = await jwtVerify(token, enc.encode(secret));
    return payload;
  } catch {
    return null;
  }
}

// Public API routes that don't need auth
const PUBLIC_API = ["/api/auth/login", "/api/auth/signup", "/api/auth/logout"];

// Public pages
const PUBLIC_PAGES = ["/auth/login", "/auth/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public API routes
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For protected API routes, verify JWT
  if (pathname.startsWith("/api/")) {
    const token = req.cookies.get(JWT_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Add user info to headers for route handlers
    const res = NextResponse.next();
    res.headers.set("x-user-id", String(payload.sub ?? ""));
    res.headers.set("x-user-name", String((payload as Record<string, unknown>).name ?? ""));
    return res;
  }

  // For protected pages, check auth and redirect if needed
  if (!PUBLIC_PAGES.includes(pathname)) {
    const token = req.cookies.get(JWT_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const loginUrl = new URL("/auth/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      // Clear invalid cookie
      res.cookies.set(JWT_COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return res;
    }

    // Protect admin routes
    const userName = String((payload as Record<string, unknown>).name ?? "");
    if (pathname.startsWith("/admin") && userName.toLowerCase() !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
