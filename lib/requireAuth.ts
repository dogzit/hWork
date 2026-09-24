import { verifyAuthToken, getAuthTokenFromCookies } from "@/lib/auth";

export type AuthUser = {
  userId: string;
  name: string;
  role: string;
};

/**
 * Verify JWT from cookies and return the authenticated user.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const token = await getAuthTokenFromCookies();
    if (!token) return null;

    const payload = await verifyAuthToken(token);
    if (!payload.userId || !payload.name) return null;

    return {
      userId: payload.userId,
      name: payload.name,
      role: payload.role ?? "USER",
    };
  } catch {
    return null;
  }
}

/**
 * Check if authenticated user is admin.
 * role шинээр нэвтэрсэн token-уудаас гадна хуучин "admin" нэртэй
 * хэрэглэгчийг нэрээр нь дэмжинэ.
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN" || user.name.toLowerCase() === "admin";
}

/**
 * Middleware-ээр дамжуулсан header-аас админ эсэхийг шалгана.
 * API route-уудад ашиглах: x-user-role нь JWT payload дээр суурилна.
 */
export function isAdminFromHeaders(req: Request): boolean {
  const role = req.headers.get("x-user-role");
  const name = req.headers.get("x-user-name");
  return role === "ADMIN" || (name ?? "").toLowerCase() === "admin";
}
