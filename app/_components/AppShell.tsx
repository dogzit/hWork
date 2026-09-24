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

      <div className="flex-1 flex flex-col min-h-screen pb-[calc(3.75rem_+_env(safe-area-inset-bottom))] lg:pb-0">
        <main className="flex-1">{children}</main>
      </div>

      <MobileNav />

      <div className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-2">
        <NotificationBell />
        <RefreshButton />
        <ThemeToggle />
      </div>
    </div>
  );
}
