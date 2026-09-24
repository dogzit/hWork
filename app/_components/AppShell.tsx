"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import RefreshButton from "./RefreshButton";
import NotificationBell from "./NotificationBell";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth/");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:pb-0 pb-16">
        <main className="flex-1">{children}</main>
      </div>

      <MobileNav />

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <NotificationBell />
        <RefreshButton />
        <ThemeToggle />
      </div>
    </div>
  );
}
