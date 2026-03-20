import { getAuthTokenFromCookies, verifyAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedTimeTableLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthTokenFromCookies();
  if (!token) redirect("/auth/login");

  try {
    // Throws if invalid/expired
    await verifyAuthToken(token);
  } catch {
    redirect("/auth/login");
  }

  return children;
}

