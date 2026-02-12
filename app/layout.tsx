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
  title: "11d angiin web app",
  description: "Made by huurhun zoloo ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <Toaster position="top-right" richColors closeButton duration={3000} />

        <h6 className="fixed bottom-3 right-3 text-xs font-semibold text-gray-400 tracking-tight drop-shadow-lg">
          Made by: zolo
        </h6>
      </body>
    </html>
  );
}
