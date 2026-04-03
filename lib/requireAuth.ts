import { verifyAuthToken, getAuthTokenFromCookies } from "@/lib/auth";

export type AuthUser = {
  userId: string;
  name: string;
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

    return { userId: payload.userId, name: payload.name };
  } catch {
    return null;
  }
}

/**
 * Check if authenticated user is admin.
 */
export function isAdmin(user: AuthUser): boolean {
  return user.name.toLowerCase() === "admin";
}
