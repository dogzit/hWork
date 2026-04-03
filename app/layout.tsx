import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import AuthGuard from "./_components/AuthGuard";
import ThemeProvider from "./_components/ThemeProvider";
import ThemeToggle from "./_components/ThemeToggle";
import RefreshButton from "./_components/RefreshButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "11D Angiin Web App",
  description: "Design by Zolo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface text-on-surface transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>

          <Toaster position="top-right" richColors closeButton duration={3000} />

          {/* Fixed top-right theme toggle + refresh — бүх хуудсанд харагдана */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <RefreshButton />
            <ThemeToggle />
          </div>

          <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface/20">
              Design by <span className="text-purple-500/50">Zolo</span>
            </p>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
