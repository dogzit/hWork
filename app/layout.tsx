import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AuthGuard from "./_components/AuthGuard";

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
    <html lang="mn">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {/* Эрх шалгах логикийг тусад нь Client Component дотор хийнэ */}
        <AuthGuard>{children}</AuthGuard>

        <Toaster position="top-right" richColors closeButton duration={3000} />

        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            Design by <span className="text-purple-500/50">Zolo</span>
          </p>
        </div>

        <Analytics />
      </body>
    </html>
  );
}
