// src/app/layout.tsx
import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/landing/Navbar";
import { Suspense } from "react";
// import Footer from "@/components/landing/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArcForge — Forge your anime arc",
  description:
    "Answer 8 questions. Claude forges your personal anime arc.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <div className="mt-18 bg-forge-bg-deepest">{children}</div>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
