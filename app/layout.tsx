import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "11D Angiin Web App",
  description: "Made by huurhun zoloo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {children}

        {/* Мэдэгдэл гаргагч (Toaster) */}
        <Toaster position="top-right" richColors closeButton duration={3000} />

        {/* Footer Text - Илүү гоё харагдуулсан */}
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            Design by <span className="text-purple-500/50">Zolo</span>
          </p>
        </div>
      </body>
    </html>
  );
}
