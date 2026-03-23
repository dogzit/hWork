import { getAuthTokenFromCookies, verifyAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Analytics } from "@vercel/analytics/react"; // 1. Энийг нэмэхээ мартав аа!

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedTimeTableLayout({
  children,
}: ProtectedLayoutProps) {
  const token = await getAuthTokenFromCookies();

  if (!token) {
    redirect("/auth/login");
  }

  try {
    await verifyAuthToken(token);
  } catch (error) {
    console.error("Auth verification failed:", error);
    redirect("/auth/login");
  }

  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
