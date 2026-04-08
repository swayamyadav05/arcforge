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
  // The title template means individual pages can set their own title
  // and it automatically appends " — ArcForge" to maintain brand consistency.
  // For example, the arc page title becomes "The Code Hermit — ArcForge".
  title: {
    default: "ArcForge — Your story is already in motion",
    template: "%s — ArcForge",
  },
  description:
    "A serialised anime narrative experience. Answer 8 questions and Claude forges your character arc — your wound, your weapon, your destiny. Your story continues across episodes.",
  // The canonical URL tells Google which URL is the authoritative
  // version of your homepage, preventing duplicate content issues
  // if your site is accessible at both arcforge.me and www.arcforge.me.
  metadataBase: new URL("https://arcforge.me"),
  // Open Graph handles how your site appears when shared on
  // social platforms — Discord, Twitter, LinkedIn, iMessage.
  openGraph: {
    title: "ArcForge — Your story is already in motion",
    description:
      "A serialised anime narrative experience. Your real choices become the episodes.",
    url: "https://arcforge.me",
    siteName: "ArcForge",
    // The OG image for the homepage — ideally a compelling screenshot
    // of the landing page or the Arc Card. 1200x630 is the standard size.
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "ArcForge — You are not a viewer. You are the protagonist.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcForge — Your story is already in motion",
    description:
      "A serialised anime narrative experience. Your real choices become the episodes.",
    images: ["/og-home.png"],
    // If you have a Twitter/X account for ArcForge, add it here.
    // This makes the card show your account as the attribution.
    // creator: "@arcforge",
  },
  // These tell Google this is a legitimate, indexable website.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
